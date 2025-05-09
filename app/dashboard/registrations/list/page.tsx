'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { Calendar, Plus, Search, Filter, Download, Loader2, Eye, Edit, Trash2 } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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

type TrainingRegistration = {
  id: number
  registration_number: string
  request_date: string
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
  training_time: string | null
  training_certification_id: number | null
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled'
  remarks: string | null
  training_venue: string | null
  created_at: string
  updated_at: string
  
  // Joined data for display
  customer?: Customer
  training_course?: TrainingCourse
  trainer?: Trainer
  training_certification?: TrainingCertification
}

export default function RegistrationsListPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [registrations, setRegistrations] = useState<TrainingRegistration[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [courses, setCourses] = useState<TrainingCourse[]>([])
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [certifications, setCertifications] = useState<TrainingCertification[]>([])
  
  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
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
        const [registrationsRes, customersRes, coursesRes, trainersRes, certificationsRes] = await Promise.all([
          axios.get<TrainingRegistration[]>(`${API_URL}/training-registrations/`, { headers }),
          axios.get<Customer[]>(`${API_URL}/customers/`, { headers }),
          axios.get<TrainingCourse[]>(`${API_URL}/training-courses/`, { headers }),
          axios.get<Trainer[]>(`${API_URL}/trainers/`, { headers }),
          axios.get<TrainingCertification[]>(`${API_URL}/training-certifications/`, { headers })
        ])
        
        // Store the fetched data
        setCustomers(customersRes.data)
        setCourses(coursesRes.data)
        setTrainers(trainersRes.data)
        setCertifications(certificationsRes.data)
        
        // Combine data to display joined information
        const enrichedRegistrations = registrationsRes.data.map(registration => ({
          ...registration,
          customer: customersRes.data.find(c => c.id === registration.customer_id),
          training_course: coursesRes.data.find(c => c.id === registration.training_course_id),
          trainer: trainersRes.data.find(t => t.id === registration.trainer_id),
          training_certification: registration.training_certification_id 
            ? certificationsRes.data.find(c => c.id === registration.training_certification_id) 
            : undefined
        }))
        
        setRegistrations(enrichedRegistrations)
      } catch (error: any) {
        console.error('Error fetching data:', error)
        
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
            description: "Failed to load registrations data. Please try again.",
            variant: "destructive"
          })
        }
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [router, toast])
  
  // Handle status update
  const handleStatusUpdate = async (id: number, status: TrainingRegistration['status']) => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token')
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to update registration status",
          variant: "destructive"
        })
        router.push('/auth/login')
        return
      }
      
      // Make API call to update status
      await axios.put(
        `${API_URL}/training-registrations/${id}/status?status=${status}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      
      // Update local state with new status
      setRegistrations(prevRegistrations => 
        prevRegistrations.map(reg => 
          reg.id === id ? { ...reg, status } : reg
        )
      )
      
      toast({
        title: "Success",
        description: `Registration status updated to ${status}`,
      })
    } catch (error) {
      console.error('Error updating status:', error)
      toast({
        title: "Error",
        description: "Failed to update registration status",
        variant: "destructive"
      })
    }
  }
  
  // Filter registrations based on active tab and search term
  const filteredRegistrations = registrations.filter(registration => {
    // Filter by status tab
    if (activeTab !== 'all' && registration.status !== activeTab) {
      return false
    }
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        registration.registration_number.toLowerCase().includes(searchLower) ||
        (registration.customer?.name || '').toLowerCase().includes(searchLower) ||
        (registration.training_course?.title || '').toLowerCase().includes(searchLower) ||
        (registration.trainer?.name || '').toLowerCase().includes(searchLower)
      )
    }
    
    return true
  })
  
  // Format date helper function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
  
  // Format currency helper function
  const formatCurrency = (value: number) => {
    return `KD ${value.toFixed(2)}`
  }

  // Get status badge component with appropriate styling
  const StatusBadge = ({ status }: { status: TrainingRegistration['status'] }) => {
    const statusStyles = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Confirmed: 'bg-blue-100 text-blue-800',
      Completed: 'bg-green-100 text-green-800',
      Cancelled: 'bg-red-100 text-red-800'
    }
    
    return (
      <Badge className={statusStyles[status]} variant="outline">
        {status}
      </Badge>
    )
  }
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Training Registrations</h1>
          <p className="text-muted-foreground">Manage all training registrations and bookings</p>
        </div>
        
        <Button onClick={() => router.push('/dashboard/registrations/new')}>
          <Plus className="mr-2 h-4 w-4" />
          New Registration
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>All Registrations</CardTitle>
              <CardDescription>
                Manage and track all training registrations
              </CardDescription>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
          
          <div className="flex gap-4 mt-4">
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="Pending">Pending</TabsTrigger>
                <TabsTrigger value="Confirmed">Confirmed</TabsTrigger>
                <TabsTrigger value="Completed">Completed</TabsTrigger>
                <TabsTrigger value="Cancelled">Cancelled</TabsTrigger>
              </TabsList>
              
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search registrations..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <TabsContent value="all" className="mt-4">
                {renderRegistrationsTable(filteredRegistrations)}
              </TabsContent>
              <TabsContent value="Pending" className="mt-4">
                {renderRegistrationsTable(filteredRegistrations)}
              </TabsContent>
              <TabsContent value="Confirmed" className="mt-4">
                {renderRegistrationsTable(filteredRegistrations)}
              </TabsContent>
              <TabsContent value="Completed" className="mt-4">
                {renderRegistrationsTable(filteredRegistrations)}
              </TabsContent>
              <TabsContent value="Cancelled" className="mt-4">
                {renderRegistrationsTable(filteredRegistrations)}
              </TabsContent>
            </Tabs>
          </div>
        </CardHeader>
      </Card>
    </div>
  )
  
  // Helper function to render the registrations table
  function renderRegistrationsTable(registrations: TrainingRegistration[]) {
    if (isLoading) {
      return (
        <div className="h-96 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading registrations...</span>
        </div>
      )
    }
    
    if (!registrations?.length) {
      return (
        <div className="h-96 flex flex-col items-center justify-center text-muted-foreground">
          <div className="text-lg font-medium mb-2">No registrations found</div>
          <p className="mb-4">Create a new registration to get started</p>
          <Button onClick={() => router.push('/dashboard/registrations/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Registration
          </Button>
        </div>
      )
    }
    
    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reg. Number</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Trainer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Trainees</TableHead>
              <TableHead>Total (KD)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registrations.map((registration) => (
              <TableRow key={registration.id}>
                <TableCell className="font-medium">{registration.registration_number}</TableCell>
                <TableCell>{registration.customer?.name || '-'}</TableCell>
                <TableCell>{registration.training_course?.title || '-'}</TableCell>
                <TableCell>{registration.trainer?.name || '-'}</TableCell>
                <TableCell>{formatDate(registration.training_date)}</TableCell>
                <TableCell>{registration.num_trainees}</TableCell>
                <TableCell>{formatCurrency(registration.total_amount_kd)}</TableCell>
                <TableCell>
                  <StatusBadge status={registration.status} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => router.push(`/dashboard/registrations/${registration.id}`)}
                      title="View details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => router.push(`/dashboard/registrations/${registration.id}/edit`)}
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    {/* Status update buttons based on current status */}
                    {registration.status === 'Pending' && (
                      <Button 
                        variant="ghost"
                        size="sm"
                        className="text-blue-500 h-8"
                        onClick={() => handleStatusUpdate(registration.id, 'Confirmed')}
                      >
                        Confirm
                      </Button>
                    )}
                    
                    {registration.status === 'Confirmed' && (
                      <Button 
                        variant="ghost"
                        size="sm"
                        className="text-green-500 h-8"
                        onClick={() => handleStatusUpdate(registration.id, 'Completed')}
                      >
                        Complete
                      </Button>
                    )}
                    
                    {(registration.status === 'Pending' || registration.status === 'Confirmed') && (
                      <Button 
                        variant="ghost"
                        size="sm"
                        className="text-red-500 h-8"
                        onClick={() => handleStatusUpdate(registration.id, 'Cancelled')}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <div className="flex justify-between items-center mt-4 px-2">
          <div className="text-sm text-muted-foreground">
            Showing {filteredRegistrations.length} of {registrations.length} registrations
          </div>
          {/* You could add pagination controls here if needed */}
        </div>
      </div>
    )
  }
}