'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/components/ui/use-toast'
import { ArrowLeft, Save, X, Loader2, Search } from 'lucide-react'
import axios from 'axios'

// API URL from environment or default
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Type definitions based on your FastAPI models
type Customer = {
  id: number
  name: string
  contact_person: string
  email: string
  phone: string
  address: string
}

type TrainingCourse = {
  id: number
  title: string
  description: string
  duration_hours: number
}

type Trainer = {
  id: number
  name: string
  type: 'Employee' | 'Freelancer'
  charge_per_hour: number
  contact_number: string
  phone: string
  email: string
  address: string
  gov_id_number: string
}

type TrainingCertification = {
  id: number
  name: string
  description: string
  validity_days: number
}

type Trainee = {
  id: number
  name: string
  civil_id: string
  company_name: string
  photo_path: string | null
  training_registration_id: number | null
  training_completion_date: string | null
  certificate_validation_date: string | null
  created_at: string
  updated_at: string
}

type FormData = {
  request_receiver: string
  customer_id: number
  customer_point_of_contact: string
  training_course_id: number
  num_trainees: number
  unit_rate_kd: number
  total_amount_kd: number
  payment_type: 'Cash' | 'Credit'
  trainer_id: number
  training_date: string
  training_time: string
  training_certification_id: number | null
  remarks: string
  training_venue: string
}

export default function CreateRegistrationPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isDataLoading, setIsDataLoading] = useState(true)
  
  // Reference data
  const [customers, setCustomers] = useState<Customer[]>([])
  const [courses, setCourses] = useState<TrainingCourse[]>([])
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [certifications, setCertifications] = useState<TrainingCertification[]>([])
  
  // Trainee data
  const [trainees, setTrainees] = useState<Trainee[]>([])
  const [filteredTrainees, setFilteredTrainees] = useState<Trainee[]>([])
  const [selectedTrainees, setSelectedTrainees] = useState<Trainee[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  
  // Form data
  const [formData, setFormData] = useState<FormData>({
    request_receiver: '',
    customer_id: 0,
    customer_point_of_contact: '',
    training_course_id: 0,
    num_trainees: 0, // Start with 0, will update based on selected trainees
    unit_rate_kd: 0,
    total_amount_kd: 0,
    payment_type: 'Cash',
    trainer_id: 0,
    training_date: '',
    training_time: '',
    training_certification_id: null,
    remarks: '',
    training_venue: ''
  })

  // Fetch reference data
  useEffect(() => {
    const fetchReferenceData = async () => {
      setIsDataLoading(true)
      try {
        // Get token from localStorage
        const token = localStorage.getItem('token')
        if (!token) {
          toast({
            title: "Authentication Error",
            description: "You must be logged in to access this page",
            variant: "destructive"
          })
          router.push('/auth/login')
          return
        }

        const headers = {
          Authorization: `Bearer ${token}`
        }

        // Fetch all reference data in parallel
        const [customersRes, coursesRes, trainersRes, certificationsRes, traineesRes] = await Promise.all([
          axios.get<Customer[]>(`${API_URL}/customers/`, { headers }),
          axios.get<TrainingCourse[]>(`${API_URL}/training-courses/`, { headers }),
          axios.get<Trainer[]>(`${API_URL}/trainers/`, { headers }),
          axios.get<TrainingCertification[]>(`${API_URL}/training-certifications/`, { headers }),
          axios.get<Trainee[]>(`${API_URL}/trainees/`, { headers })
        ])

        setCustomers(customersRes.data)
        setCourses(coursesRes.data)
        setTrainers(trainersRes.data)
        setCertifications(certificationsRes.data)
        setTrainees(traineesRes.data)
        setFilteredTrainees(traineesRes.data)
        
      } catch (error: any) {
        console.error('Error fetching reference data:', error)
        
        if (error.response?.status === 401) {
          toast({
            title: "Authentication Error",
            description: "Your session has expired. Please log in again.",
            variant: "destructive"
          })
          router.push('/auth/login')
        } else {
          toast({
            title: "Error",
            description: "Failed to load reference data. Please try again.",
            variant: "destructive"
          })
        }
      } finally {
        setIsDataLoading(false)
      }
    }

    fetchReferenceData()
  }, [router, toast])

  // Update trainee filtering when customer or search query changes
  useEffect(() => {
    let filtered = [...trainees]
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(trainee => 
        trainee.name.toLowerCase().includes(query) || 
        trainee.civil_id.toLowerCase().includes(query) ||
        trainee.company_name.toLowerCase().includes(query)
      )
    }
    
    // Filter by customer if selected
    if (formData.customer_id) {
      const customerName = customers.find(c => c.id === formData.customer_id)?.name
      if (customerName) {
        filtered = filtered.filter(trainee => 
          trainee.company_name === customerName || 
          !trainee.training_registration_id // Also include unassigned trainees
        )
      }
    }
    
    // Prefer unassigned trainees
    filtered.sort((a, b) => {
      if (a.training_registration_id === null && b.training_registration_id !== null) return -1
      if (a.training_registration_id !== null && b.training_registration_id === null) return 1
      return 0
    })
    
    setFilteredTrainees(filtered)
  }, [searchQuery, formData.customer_id, trainees, customers])

  // Update num_trainees and total_amount_kd when selectedTrainees changes
  useEffect(() => {
    const numTrainees = selectedTrainees.length
    const totalAmount = formData.unit_rate_kd * numTrainees
    
    setFormData(prev => ({
      ...prev,
      num_trainees: numTrainees,
      total_amount_kd: totalAmount
    }))
  }, [selectedTrainees, formData.unit_rate_kd])

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    if (name === 'unit_rate_kd') {
      const unitRate = parseFloat(value)
      const totalAmount = unitRate * selectedTrainees.length
      
      // Calculate total amount when unit rate changes
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value),
        total_amount_kd: !isNaN(unitRate) ? parseFloat((unitRate * selectedTrainees.length).toFixed(2)) : 0
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  // Handle select input changes
  const handleSelectChange = (name: string, value: string) => {
    if (name === 'customer_id') {
      const selectedCustomer = customers.find(c => c.id === parseInt(value))
      
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value),
        customer_point_of_contact: selectedCustomer ? selectedCustomer.contact_person : prev.customer_point_of_contact
      }))
      
      // Clear selected trainees when customer changes
      setSelectedTrainees([])
    } else if (name === 'training_certification_id') {
      setFormData(prev => ({
        ...prev,
        [name]: value === 'null' ? null : parseInt(value)
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'customer_id' || name === 'training_course_id' || name === 'trainer_id' 
          ? parseInt(value) 
          : value
      }))
    }
  }

  // Toggle trainee selection
  const toggleTraineeSelection = (trainee: Trainee) => {
    if (selectedTrainees.some(t => t.id === trainee.id)) {
      // Remove trainee if already selected
      setSelectedTrainees(selectedTrainees.filter(t => t.id !== trainee.id))
    } else {
      // Add trainee if not selected
      setSelectedTrainees([...selectedTrainees, trainee])
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Validate form
      if (!formData.customer_id || !formData.training_course_id || !formData.trainer_id || !formData.training_date) {
        toast({
          title: "Validation Error",
          description: "Please fill all required fields",
          variant: "destructive"
        })
        setIsLoading(false)
        return
      }
      
      // Validate trainees
      if (selectedTrainees.length === 0) {
        toast({
          title: "Validation Error",
          description: "Please select at least one trainee",
          variant: "destructive"
        })
        setIsLoading(false)
        return
      }
      
      // Get token from localStorage
      const token = localStorage.getItem('token')
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to create a registration",
          variant: "destructive"
        })
        router.push('/auth/login')
        return
      }
      
      // Create registration
      const response = await axios.post(
        `${API_URL}/training-registrations/`, 
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      
      if (response.data) {
        // Successfully created registration
        const registrationId = response.data.id
        
        // Assign trainees to the registration
        const assignPromises = selectedTrainees.map(trainee => {
          const formData = new FormData()
          formData.append('registration_id', registrationId.toString())
          
          return axios.post(
            `${API_URL}/trainees/${trainee.id}/assign-registration`,
            formData,
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          )
        })
        
        // Wait for all trainees to be assigned
        await Promise.all(assignPromises)
        
        toast({
          title: "Success",
          description: "Training registration created successfully with selected trainees",
        })
        
        // Redirect to registrations list
        router.push('/dashboard/registrations')
      }
    } catch (error: any) {
      console.error('Error creating registration:', error)
      
      let errorMessage = "Failed to create registration"
      
      if (error.response) {
        if (error.response.status === 401) {
          toast({
            title: "Authentication Error",
            description: "Your session has expired. Please log in again.",
            variant: "destructive"
          })
          router.push('/auth/login')
          return
        } else if (error.response.status === 422) {
          errorMessage = "Validation error - please check your inputs"
          
          // Try to get specific validation errors
          const detail = error.response.data?.detail
          if (detail) {
            if (Array.isArray(detail) && detail.length > 0) {
              errorMessage = `Validation error: ${detail[0].msg}`
            } else if (typeof detail === 'string') {
              errorMessage = detail
            }
          }
        } else {
          errorMessage = `Server error: ${error.response.status}`
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Format date for input field
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">Create New Registration</h1>
      </div>
      
      {isDataLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading data...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer & Course Information</CardTitle>
                <CardDescription>
                  Select the customer and training course details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="request_receiver">Request Received By</Label>
                  <Input 
                    id="request_receiver" 
                    name="request_receiver"
                    placeholder="Your name or who received this request"
                    value={formData.request_receiver}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customer_id">Customer</Label>
                  <Select 
                    onValueChange={(value) => handleSelectChange('customer_id', value)}
                    value={formData.customer_id ? formData.customer_id.toString() : ""}
                  >
                    <SelectTrigger id="customer_id">
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map(customer => (
                        <SelectItem key={customer.id} value={customer.id.toString()}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customer_point_of_contact">Contact Person</Label>
                  <Input 
                    id="customer_point_of_contact" 
                    name="customer_point_of_contact"
                    placeholder="Contact person at customer"
                    value={formData.customer_point_of_contact}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="training_course_id">Training Course</Label>
                  <Select 
                    onValueChange={(value) => handleSelectChange('training_course_id', value)}
                    value={formData.training_course_id ? formData.training_course_id.toString() : ""}
                  >
                    <SelectTrigger id="training_course_id">
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map(course => (
                        <SelectItem key={course.id} value={course.id.toString()}>
                          {course.title} ({course.duration_hours} hrs)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="num_trainees">Number of Trainees</Label>
                    <Input 
                      id="num_trainees" 
                      name="num_trainees"
                      type="number"
                      disabled={true} // Disabled because it's calculated
                      value={formData.num_trainees}
                      readOnly
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Auto-calculated from selected trainees
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="unit_rate_kd">Unit Rate (KD)</Label>
                    <Input 
                      id="unit_rate_kd" 
                      name="unit_rate_kd"
                      type="number"
                      min={0}
                      step={0.01}
                      placeholder="Rate per trainee"
                      value={formData.unit_rate_kd}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="total_amount_kd">Total Amount (KD)</Label>
                  <Input 
                    id="total_amount_kd" 
                    name="total_amount_kd"
                    value={formData.total_amount_kd.toFixed(2)}
                    readOnly
                    className="bg-muted"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="payment_type">Payment Type</Label>
                  <Select 
                    onValueChange={(value) => handleSelectChange('payment_type', value)}
                    value={formData.payment_type}
                    defaultValue="Cash"
                  >
                    <SelectTrigger id="payment_type">
                      <SelectValue placeholder="Select payment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Credit">Credit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Training Details</CardTitle>
                <CardDescription>
                  Enter the training schedule and trainer information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="trainer_id">Trainer</Label>
                  <Select 
                    onValueChange={(value) => handleSelectChange('trainer_id', value)}
                    value={formData.trainer_id ? formData.trainer_id.toString() : ""}
                  >
                    <SelectTrigger id="trainer_id">
                      <SelectValue placeholder="Select trainer" />
                    </SelectTrigger>
                    <SelectContent>
                      {trainers.map(trainer => (
                        <SelectItem key={trainer.id} value={trainer.id.toString()}>
                          {trainer.name} ({trainer.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="training_date">Training Date</Label>
                    <Input 
                      id="training_date" 
                      name="training_date"
                      type="date"
                      value={formData.training_date}
                      onChange={handleInputChange}
                      min={formatDateForInput(new Date())} // Can't select dates in the past
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="training_time">Training Time</Label>
                    <Input 
                      id="training_time" 
                      name="training_time"
                      type="time"
                      value={formData.training_time}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="training_venue">Training Venue</Label>
                  <Input 
                    id="training_venue" 
                    name="training_venue"
                    placeholder="Enter training venue"
                    value={formData.training_venue}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="training_certification_id">Certification (Optional)</Label>
                  <Select 
                    onValueChange={(value) => handleSelectChange('training_certification_id', value)}
                    value={formData.training_certification_id ? formData.training_certification_id.toString() : "null"}
                  >
                    <SelectTrigger id="training_certification_id">
                      <SelectValue placeholder="Select certification" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">None</SelectItem>
                      {certifications.map(cert => (
                        <SelectItem key={cert.id} value={cert.id.toString()}>
                          {cert.name} ({cert.validity_days} days validity)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea 
                    id="remarks" 
                    name="remarks"
                    placeholder="Any additional notes or requirements"
                    value={formData.remarks}
                    onChange={handleInputChange}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Trainee Selection Card */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <div>
                    <CardTitle>Select Trainees</CardTitle>
                    <CardDescription>
                      Choose trainees to include in this registration
                    </CardDescription>
                  </div>
                  <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search trainees..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
                  {filteredTrainees.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No trainees found. {formData.customer_id ? 'Try selecting a different customer or' : ''} try a different search query.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      <div className="grid grid-cols-1 gap-2">
                        {filteredTrainees.map((trainee) => (
                          <div
                            key={trainee.id}
                            className={`border p-3 rounded-md cursor-pointer ${
                              selectedTrainees.some(t => t.id === trainee.id)
                                ? 'bg-blue-50 border-blue-200'
                                : 'hover:bg-gray-50'
                            }`}
                            onClick={() => toggleTraineeSelection(trainee)}
                          >
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`trainee-${trainee.id}`}
                                checked={selectedTrainees.some(t => t.id === trainee.id)}
                                onCheckedChange={() => toggleTraineeSelection(trainee)}
                                className="mr-2"
                              />
                              <div className="grid grid-cols-3 gap-4 flex-1">
                                <span className="font-medium">
                                  {trainee.name}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {trainee.civil_id}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {trainee.company_name}
                                </span>
                              </div>
                              {trainee.training_registration_id && (
                                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                  Already assigned
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Showing {filteredTrainees.length} of {trainees.length} trainees
                  </span>
                  <span className="text-sm font-medium">
                    {selectedTrainees.length} trainees selected
                  </span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.push('/dashboard/registrations')}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Create Registration
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </form>
      )}
    </div>
  )
}