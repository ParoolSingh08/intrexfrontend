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
  CardTitle,
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
import { ArrowLeft, Save, X, Calendar, Clock, Plus, Trash2, Search } from 'lucide-react'
import {
  getCustomers,
  getCourses,
  getTrainers,
  getCertifications,
  getTrainees,
  createRegistration,
  assignTraineeToRegistration,
  Customer,
  TrainingCourse,
  Trainer,
  TrainingCertification,
  Trainee,
} from '@/lib/api-client'

export default function AddRegistrationPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form data
  const [formData, setFormData] = useState({
    request_receiver: '',
    customer_id: '',
    customer_point_of_contact: '',
    training_course_id: '',
    num_trainees: 0, // Will be calculated based on selected trainees
    unit_rate_kd: 0,
    total_amount_kd: 0,
    payment_type: 'Cash',
    trainer_id: '',
    training_date: '',
    training_time: '',
    training_certification_id: '',
    remarks: '',
    training_venue: ''
  })
  
  // Trainees data
  const [allTrainees, setAllTrainees] = useState<Trainee[]>([])
  const [filteredTrainees, setFilteredTrainees] = useState<Trainee[]>([])
  const [selectedTrainees, setSelectedTrainees] = useState<Trainee[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  
  // Data for select fields
  const [customers, setCustomers] = useState<Customer[]>([])
  const [courses, setCourses] = useState<TrainingCourse[]>([])
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [certifications, setCertifications] = useState<TrainingCertification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Fetch all necessary data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [customersData, coursesData, trainersData, certificationsData, traineesData] = await Promise.all([
          getCustomers(),
          getCourses(),
          getTrainers(),
          getCertifications(),
          getTrainees()
        ])
        
        setCustomers(customersData)
        setCourses(coursesData)
        setTrainers(trainersData)
        setCertifications(certificationsData)
        setAllTrainees(traineesData)
        setFilteredTrainees(traineesData)
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          title: 'Error',
          description: 'Failed to load required data',
          variant: 'destructive'
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [toast])
  
  // Filter trainees when search query changes or customer changes
  useEffect(() => {
    let filtered = [...allTrainees]
    
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
      const customerName = customers.find(c => c.id.toString() === formData.customer_id)?.name
      if (customerName) {
        filtered = filtered.filter(trainee => 
          !trainee.company_name || trainee.company_name === customerName
        )
      }
    }
    
    setFilteredTrainees(filtered)
  }, [searchQuery, formData.customer_id, allTrainees, customers])
  
  // Update registration form when selected trainees change
  useEffect(() => {
    const numTrainees = selectedTrainees.length
    const totalAmount = formData.unit_rate_kd * numTrainees
    
    setFormData(prev => ({
      ...prev,
      num_trainees: numTrainees,
      total_amount_kd: totalAmount
    }))
  }, [selectedTrainees, formData.unit_rate_kd])
  
  // Handle input changes for registration form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    
    // Special handling for unit_rate_kd
    if (id === 'unit_rate_kd') {
      const unitRate = parseFloat(value) || 0
      const totalAmount = unitRate * selectedTrainees.length
      
      setFormData(prev => ({
        ...prev,
        [id]: unitRate,
        total_amount_kd: totalAmount
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [id]: value
      }))
    }
  }
  
  // Handle select changes
  const handleSelectChange = (id: string, value: string) => {
    // Special handling for customer selection
    if (id === 'customer_id' && value) {
      const selectedCustomer = customers.find(c => c.id.toString() === value)
      if (selectedCustomer) {
        setFormData(prev => ({
          ...prev,
          customer_id: value,
          customer_point_of_contact: selectedCustomer.contact_person
        }))
        
        // Clear any selected trainees when customer changes
        setSelectedTrainees([])
      } else {
        setFormData(prev => ({
          ...prev,
          customer_id: value,
          customer_point_of_contact: ''
        }))
      }
    } 
    // Special handling for certification (convert "no_cert" string to empty string)
    else if (id === 'training_certification_id') {
      setFormData(prev => ({
        ...prev,
        [id]: value === "no_cert" ? "" : value
      }))
    }
    // Default handling for other fields
    else {
      setFormData(prev => ({
        ...prev,
        [id]: value
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
  
  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation for registration
    if (
      !formData.request_receiver ||
      !formData.customer_id ||
      !formData.training_course_id ||
      !formData.trainer_id ||
      !formData.training_date
    ) {
      toast({
        title: 'Validation Error',
        description: 'Please fill all required registration fields',
        variant: 'destructive'
      })
      return
    }
    
    // Validate that at least one trainee is selected
    if (selectedTrainees.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please select at least one trainee',
        variant: 'destructive'
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Transform data to expected format
      const registrationData = {
        ...formData,
        customer_id: parseInt(formData.customer_id),
        training_course_id: parseInt(formData.training_course_id),
        trainer_id: parseInt(formData.trainer_id),
        training_certification_id: formData.training_certification_id 
          ? parseInt(formData.training_certification_id) 
          : null,
        // Convert training_date to ISO format
        training_date: new Date(formData.training_date).toISOString()
      }
      
      // Create the registration
      const registration = await createRegistration(registrationData)
      
      // Assign selected trainees to the registration
      for (const trainee of selectedTrainees) {
        if (registration.id && trainee.id) {
          await assignTraineeToRegistration(trainee.id, registration.id)
        }
      }
      
      toast({
        title: 'Success',
        description: 'Registration created successfully with selected trainees',
      })
      
      // Navigate back to registrations list
      router.push('/dashboard/registrations')
    } catch (error) {
      console.error('Error creating registration:', error)
      toast({
        title: 'Error',
        description: 'Failed to create registration',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="h-screen flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">Add New Registration</h1>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-8">
          {/* Registration Card */}
          <Card>
            <CardHeader>
              <CardTitle>Registration Details</CardTitle>
              <CardDescription>
                Enter the information for the new training registration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Registration Information */}
              <div className="space-y-1">
                <h3 className="text-lg font-medium">Basic Information</h3>
                <p className="text-sm text-muted-foreground">Registration and customer details</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="request_receiver">Request Receiver</Label>
                  <Input
                    id="request_receiver"
                    placeholder="Enter the person who received the request"
                    value={formData.request_receiver}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customer_id">Customer</Label>
                  <Select
                    value={formData.customer_id}
                    onValueChange={(value) => handleSelectChange('customer_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id.toString()}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customer_point_of_contact">Point of Contact</Label>
                  <Input
                    id="customer_point_of_contact"
                    placeholder="Customer point of contact"
                    value={formData.customer_point_of_contact}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              {/* Training Information */}
              <div className="space-y-1 mt-6">
                <h3 className="text-lg font-medium">Training Information</h3>
                <p className="text-sm text-muted-foreground">Training course, trainer, and schedule</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="training_course_id">Training Course</Label>
                  <Select
                    value={formData.training_course_id}
                    onValueChange={(value) => handleSelectChange('training_course_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id.toString()}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="trainer_id">Trainer</Label>
                  <Select
                    value={formData.trainer_id}
                    onValueChange={(value) => handleSelectChange('trainer_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a trainer" />
                    </SelectTrigger>
                    <SelectContent>
                      {trainers.map((trainer) => (
                        <SelectItem key={trainer.id} value={trainer.id.toString()}>
                          {trainer.name} ({trainer.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="training_date">Training Date</Label>
                  <div className="relative">
                    <Input
                      id="training_date"
                      type="date"
                      value={formData.training_date}
                      onChange={handleInputChange}
                      required
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="training_time">Training Time</Label>
                  <div className="relative">
                    <Input
                      id="training_time"
                      type="time"
                      value={formData.training_time}
                      onChange={handleInputChange}
                    />
                    <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="training_venue">Training Venue</Label>
                  <Input
                    id="training_venue"
                    placeholder="Enter training venue"
                    value={formData.training_venue}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="training_certification_id">Certification (Optional)</Label>
                  <Select
                    value={formData.training_certification_id}
                    onValueChange={(value) => handleSelectChange('training_certification_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a certification" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no_cert">No Certification</SelectItem>
                      {certifications.map((cert) => (
                        <SelectItem key={cert.id} value={cert.id.toString()}>
                          {cert.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Payment Information */}
              <div className="space-y-1 mt-6">
                <h3 className="text-lg font-medium">Payment Information</h3>
                <p className="text-sm text-muted-foreground">Pricing and number of trainees</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="num_trainees">Number of Trainees</Label>
                  <Input
                    id="num_trainees"
                    type="number"
                    min={1}
                    value={formData.num_trainees}
                    disabled={true} // Always disabled - automatically calculated
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Automatically calculated based on trainees selected below.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="unit_rate_kd">Rate per Trainee (KD)</Label>
                  <Input
                    id="unit_rate_kd"
                    type="number"
                    step="0.01"
                    min={0}
                    value={formData.unit_rate_kd}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="total_amount_kd">Total Amount (KD)</Label>
                  <Input
                    id="total_amount_kd"
                    type="number"
                    value={formData.total_amount_kd}
                    disabled
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="payment_type">Payment Type</Label>
                  <Select
                    value={formData.payment_type}
                    onValueChange={(value) => handleSelectChange('payment_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Credit">Credit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Additional Information */}
              <div className="space-y-2 mt-6">
                <Label htmlFor="remarks">Remarks (Optional)</Label>
                <Textarea
                  id="remarks"
                  placeholder="Enter any additional information or remarks"
                  value={formData.remarks}
                  onChange={handleInputChange}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Trainees Card */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Select Trainees</CardTitle>
                  <CardDescription>
                    Select trainees to include in this registration
                  </CardDescription>
                </div>
                <div className="relative w-72">
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
                          className={`border p-3 rounded-md ${
                            selectedTrainees.some(t => t.id === trainee.id)
                              ? 'bg-primary/10 border-primary/30'
                              : 'hover:bg-muted/50'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`trainee-${trainee.id}`}
                              checked={selectedTrainees.some(t => t.id === trainee.id)}
                              onCheckedChange={() => toggleTraineeSelection(trainee)}
                            />
                            <div className="grid grid-cols-3 gap-2 flex-1">
                              <Label
                                htmlFor={`trainee-${trainee.id}`}
                                className="font-medium cursor-pointer"
                              >
                                {trainee.name}
                              </Label>
                              <span className="text-sm text-muted-foreground">
                                {trainee.civil_id}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {trainee.company_name}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-4 flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Showing {filteredTrainees.length} of {allTrainees.length} trainees
                </span>
                <span className="text-sm font-medium">
                  {selectedTrainees.length} trainees selected
                </span>
              </div>
            </CardContent>
          </Card>
          
          {/* Form Buttons */}
          <div className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Creating...
                </div>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Registration
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}