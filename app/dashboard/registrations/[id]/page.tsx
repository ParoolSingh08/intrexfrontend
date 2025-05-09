'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { 
  ArrowLeft, 
  Download, 
  Edit, 
  Printer,
  Calendar,
  Users,
  DollarSign,
  Clock,
  MapPin,
  FileText,
  CheckCircle,
  Loader2
} from 'lucide-react'

export default function RegistrationDetailPage() {
  const params = useParams()
  const registrationId = params?.id
  
  const router = useRouter()
  const { toast } = useToast()
  
  // State
  const [registration, setRegistration] = useState(null)
  const [customer, setCustomer] = useState(null)
  const [course, setCourse] = useState(null)
  const [trainer, setTrainer] = useState(null)
  const [certification, setCertification] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Fetch registration details
  useEffect(() => {
    const fetchRegistrationDetails = async () => {
      if (!registrationId) return
      
      try {
        setIsLoading(true)
        setError(null)
        
        // Get token from localStorage
        const token = localStorage.getItem('token')
        if (!token) {
          router.push('/auth/login')
          return
        }
        
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        
        // Fetch registration data
        const response = await fetch(`${apiUrl}/training-registrations/${registrationId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (!response.ok) {
          throw new Error(`Failed to fetch registration: ${response.status}`)
        }
        
        const data = await response.json()
        setRegistration(data)
        
        // Fetch related data
        const [customerRes, courseRes, trainerRes] = await Promise.all([
          fetch(`${apiUrl}/customers/${data.customer_id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${apiUrl}/training-courses/${data.training_course_id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${apiUrl}/trainers/${data.trainer_id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ])
        
        const customerData = await customerRes.json()
        const courseData = await courseRes.json()
        const trainerData = await trainerRes.json()
        
        setCustomer(customerData)
        setCourse(courseData)
        setTrainer(trainerData)
        
        // Fetch certification if available
        if (data.training_certification_id) {
          const certRes = await fetch(
            `${apiUrl}/training-certifications/${data.training_certification_id}`, 
            { headers: { 'Authorization': `Bearer ${token}` } }
          )
          
          if (certRes.ok) {
            const certData = await certRes.json()
            setCertification(certData)
          }
        }
      } catch (error) {
        console.error('Error fetching registration details:', error)
        setError('Failed to load registration details')
        toast({
          title: "Error",
          description: "Failed to load registration details",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchRegistrationDetails()
  }, [registrationId, router, toast])
  
  // Format currency
  const formatCurrency = (value) => {
    return `${value?.toLocaleString() || 0} KD`
  }
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }
  
  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'Confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'Completed':
        return 'bg-green-100 text-green-800'
      case 'Cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
  
  // Handle print
  const handlePrint = () => {
    window.print()
  }
  
  // Edit registration
  const handleEdit = () => {
    router.push(`/dashboard/registrations/${registrationId}/edit`)
  }
  
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="h-96 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading registration details...</span>
        </div>
      </div>
    )
  }
  
  if (error || !registration) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Registration Details</h1>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-10">
              <h2 className="text-2xl font-bold text-gray-800">Registration Not Found</h2>
              <p className="text-muted-foreground mt-2">
                The registration you're looking for doesn't exist or you don't have permission to view it.
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => router.push('/dashboard/registrations')}
              >
                Go Back to Registrations
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Registration Details</h1>
            <p className="text-muted-foreground">{registration.registration_number}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>
      
      {/* Registration Status */}
      <div className="mb-6">
        <Badge className={`text-sm px-3 py-1 ${getStatusColor(registration.status)}`}>
          {registration.status}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Registration Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Registration Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Registration Number</h3>
                <p>{registration.registration_number}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Request Date</h3>
                <p>{formatDate(registration.request_date)}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Request Receiver</h3>
                <p>{registration.request_receiver}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Payment Type</h3>
                <p>{registration.payment_type}</p>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Course Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Course</h4>
                  <p>{course?.title || 'N/A'}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Duration</h4>
                  <p>{course?.duration_hours || 'N/A'} hours</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Trainer</h4>
                  <p>{trainer?.name || 'N/A'}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Certification</h4>
                  <p>{certification?.name || 'N/A'}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Training Date</h4>
                  <p>{formatDate(registration.training_date)}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Training Time</h4>
                  <p>{registration.training_time || 'N/A'}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Training Venue</h4>
                  <p>{registration.training_venue || 'N/A'}</p>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Customer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Customer</h4>
                  <p>{customer?.name || 'N/A'}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Contact Person</h4>
                  <p>{registration.customer_point_of_contact || customer?.contact_person || 'N/A'}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Email</h4>
                  <p>{customer?.email || 'N/A'}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Phone</h4>
                  <p>{customer?.phone || 'N/A'}</p>
                </div>
                
                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Address</h4>
                  <p>{customer?.address || 'N/A'}</p>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Additional Information</h3>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Remarks</h4>
                <p>{registration.remarks || 'No remarks'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Financial Info */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Financial Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center p-4 bg-gray-50 rounded-md">
              <div className="mr-4">
                <Users className="h-10 w-10 text-gray-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Number of Trainees</p>
                <p className="text-2xl font-bold">{registration.num_trainees}</p>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-gray-50 rounded-md">
              <div className="mr-4">
                <DollarSign className="h-10 w-10 text-gray-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unit Rate</p>
                <p className="text-2xl font-bold">{formatCurrency(registration.unit_rate_kd)}</p>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-gray-50 rounded-md">
              <div className="mr-4">
                <DollarSign className="h-10 w-10 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold">{formatCurrency(registration.total_amount_kd)}</p>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm font-medium mb-4">Registration Timeline</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="mr-3 mt-1">
                    <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Registration Created</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(registration.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="mr-3 mt-1">
                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                      <Clock className="h-3 w-3 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(registration.updated_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}