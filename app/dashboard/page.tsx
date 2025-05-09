'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  DollarSign, 
  ClipboardList, 
  Loader2,
  CalendarDays,
  Eye,
  ArrowRight
} from 'lucide-react'

// Function to get token
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token')
  }
  return null
}

export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  // Dashboard state
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalRegistrations: 0,
    totalCustomers: 0,
    totalTrainers: 0,
    totalCourses: 0,
    revenue: 0
  })
  const [registrations, setRegistrations] = useState([])
  const [customers, setCustomers] = useState([])
  const [courses, setCourses] = useState([])
  const [trainers, setTrainers] = useState([])
  
  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        
        const token = getToken()
        if (!token) {
          router.push('/auth/login')
          return
        }
        
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        
        // Fetch data from API
        const [
          customersRes,
          trainersRes,
          coursesRes,
          registrationsRes
        ] = await Promise.all([
          axios.get(`${apiUrl}/customers/`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          axios.get(`${apiUrl}/trainers/`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          axios.get(`${apiUrl}/training-courses/`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          axios.get(`${apiUrl}/training-registrations/`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ])
        
        // Store fetched data
        const customersData = customersRes.data
        const trainersData = trainersRes.data
        const coursesData = coursesRes.data
        const registrationsData = registrationsRes.data
        
        // Set data for reference
        setCustomers(customersData)
        setTrainers(trainersData)
        setCourses(coursesData)
        
        // Sort registrations by date (newest first)
        const sortedRegistrations = [...registrationsData].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        
        setRegistrations(sortedRegistrations)
        
        // Calculate total revenue
        const revenue = registrationsData.reduce((total, reg) => total + (reg.total_amount_kd || 0), 0)
        
        setStats({
          totalRegistrations: registrationsData.length,
          totalCustomers: customersData.length,
          totalTrainers: trainersData.length,
          totalCourses: coursesData.length,
          revenue: revenue
        })
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchDashboardData()
  }, [router, toast])
  
  // Helper: Get customer name by ID
  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId)
    return customer ? customer.name : 'Unknown'
  }
  
  // Helper: Get course title by ID
  const getCourseTitle = (courseId) => {
    const course = courses.find(c => c.id === courseId)
    return course ? course.title : 'Unknown'
  }
  
  // Helper: Get trainer name by ID
  const getTrainerName = (trainerId) => {
    const trainer = trainers.find(t => t.id === trainerId)
    return trainer ? trainer.name : 'Unknown'
  }
  
  // Format currency
  const formatCurrency = (value) => {
    return `${value?.toLocaleString() || 0} KD`
  }
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }
  
  // View registration details
  const viewRegistrationDetails = (registrationId) => {
    router.push(`/dashboard/registrations/${registrationId}`)
  }
  
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="h-96 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading dashboard data...</span>
        </div>
      </div>
    )
  }
  
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center pt-6">
            <div className="rounded-full bg-primary/10 p-3 mb-2">
              <ClipboardList className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-3xl font-bold">{stats.totalRegistrations}</h2>
            <p className="text-sm text-muted-foreground">Total Registrations</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center pt-6">
            <div className="rounded-full bg-primary/10 p-3 mb-2">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-3xl font-bold">{stats.totalCustomers}</h2>
            <p className="text-sm text-muted-foreground">Total Customers</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center pt-6">
            <div className="rounded-full bg-primary/10 p-3 mb-2">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-3xl font-bold">{stats.totalTrainers}</h2>
            <p className="text-sm text-muted-foreground">Active Trainers</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center pt-6">
            <div className="rounded-full bg-primary/10 p-3 mb-2">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-3xl font-bold">{stats.totalCourses}</h2>
            <p className="text-sm text-muted-foreground">Available Courses</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center pt-6">
            <div className="rounded-full bg-primary/10 p-3 mb-2">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-3xl font-bold">{formatCurrency(stats.revenue)}</h2>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Registrations */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Recent Registrations</CardTitle>
            <CardDescription>
              Latest training registrations from the database
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/registrations')}>
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {registrations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No registrations found in the database
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Registration #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Trainer</TableHead>
                    <TableHead>Trainees</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.slice(0, 10).map((registration) => (
                    <TableRow key={registration.id}>
                      <TableCell className="font-medium">{registration.registration_number}</TableCell>
                      <TableCell>{getCustomerName(registration.customer_id)}</TableCell>
                      <TableCell>{getCourseTitle(registration.training_course_id)}</TableCell>
                      <TableCell>{getTrainerName(registration.trainer_id)}</TableCell>
                      <TableCell>{registration.num_trainees}</TableCell>
                      <TableCell>{formatCurrency(registration.total_amount_kd)}</TableCell>
                      <TableCell>{formatDate(registration.request_date)}</TableCell>
                      <TableCell>
                        <Badge 
                          className={`${
                            registration.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            registration.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            registration.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}
                        >
                          {registration.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => viewRegistrationDetails(registration.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Registration Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Registration Status</CardTitle>
            <CardDescription>
              Summary of registration statuses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['Pending', 'Confirmed', 'Completed', 'Cancelled'].map(status => {
                const count = registrations.filter(r => r.status === status).length
                const percentage = registrations.length > 0 
                  ? Math.round((count / registrations.length) * 100) 
                  : 0
                  
                return (
                  <div key={status}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">{status}</span>
                      <span className="text-sm text-muted-foreground">{count} ({percentage}%)</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          status === 'Completed' ? 'bg-green-500' :
                          status === 'Pending' ? 'bg-yellow-500' :
                          status === 'Confirmed' ? 'bg-blue-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>
              Upcoming training sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {registrations.filter(r => 
              r.status === 'Confirmed' && 
              new Date(r.training_date) > new Date()
            ).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No upcoming events found
              </div>
            ) : (
              <div className="space-y-4">
                {registrations
                  .filter(r => r.status === 'Confirmed' && new Date(r.training_date) > new Date())
                  .sort((a, b) => new Date(a.training_date).getTime() - new Date(b.training_date).getTime())
                  .slice(0, 5)
                  .map(registration => (
                    <div key={registration.id} className="flex flex-col space-y-1 border-b pb-3">
                      <div className="flex justify-between">
                        <span className="font-medium">{getCourseTitle(registration.training_course_id)}</span>
                        <Badge className="bg-blue-100 text-blue-800">
                          {formatDate(registration.training_date)}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Customer: {getCustomerName(registration.customer_id)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Trainer: {getTrainerName(registration.trainer_id)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Time: {registration.training_time || 'N/A'}
                      </div>
                    </div>
                  ))
                }
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button onClick={() => router.push('/dashboard/registrations/add')}>
              <ClipboardList className="mr-2 h-4 w-4" />
              New Registration
            </Button>
            <Button onClick={() => router.push('/dashboard/customers/add')}>
              <Users className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
            <Button onClick={() => router.push('/dashboard/trainers/add')}>
              <GraduationCap className="mr-2 h-4 w-4" />
              Add Trainer
            </Button>
            <Button onClick={() => router.push('/dashboard/courses/add')}>
              <BookOpen className="mr-2 h-4 w-4" />
              Add Course
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}