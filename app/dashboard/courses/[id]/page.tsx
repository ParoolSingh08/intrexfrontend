'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { ArrowLeft, Edit, Trash2, Clock, Users, Calendar, Loader2 } from 'lucide-react'
import { getCourse, TrainingCourse } from '@/lib/api-client'

interface CourseDetailPageProps {
  params: {
    id: string;
  };
}

export default function CourseDetailPage({ params }: CourseDetailPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const courseId = parseInt(params.id)
  
  // State for course data
  const [course, setCourse] = useState<TrainingCourse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [upcomingCourses, setUpcomingCourses] = useState([])
  const [pastCourses, setPastCourses] = useState([])
  
  // Fetch course data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const data = await getCourse(courseId)
        setCourse(data)
        
        // In a real app, you would fetch upcoming and past course registrations
        // For demo purposes, we'll use empty arrays
        setUpcomingCourses([])
        setPastCourses([])
      } catch (error) {
        console.error('Error fetching course:', error)
        toast({
          title: "Error",
          description: "Failed to load course data",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [courseId, toast])
  
  // Function to edit course
  const handleEdit = () => {
    router.push(`/dashboard/courses/${courseId}/edit`)
  }
  
  // Function to delete course
  const handleDelete = () => {
    // In a real app, this would call the delete API
    if (confirm('Are you sure you want to delete this course?')) {
      toast({
        title: "Info",
        description: "Delete functionality would be implemented here",
      })
      router.push('/dashboard/courses')
    }
  }
  
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="h-96 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }
  
  if (!course) {
    return (
      <div className="p-6">
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold">Course not found</h2>
          <p className="text-muted-foreground mt-2">The course you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => router.push('/dashboard/courses')}
          >
            Go Back to Courses
          </Button>
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
        <h1 className="text-3xl font-bold">Course Details</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course Info Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Course Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">{course.title}</h2>
              <div className="flex items-center mt-2 text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                <span>{course.duration_hours} {course.duration_hours === 1 ? 'hour' : 'hours'}</span>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
              <p className="text-sm">{course.description}</p>
            </div>
            
            <div className="pt-4">
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                <Users className="h-4 w-4" />
                <span>Total Trainees: 0</span>
              </div>
              
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Upcoming Sessions: 0</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button variant="outline" className="w-full" onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="outline" className="w-full" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </CardFooter>
        </Card>
        
        {/* Course Schedule */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="upcoming">
                <TabsList className="mb-4">
                  <TabsTrigger value="upcoming">Upcoming Sessions</TabsTrigger>
                  <TabsTrigger value="past">Past Sessions</TabsTrigger>
                </TabsList>
                
                <TabsContent value="upcoming">
                  {upcomingCourses.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No upcoming sessions scheduled
                    </div>
                  ) : (
                    <div>
                      {/* Upcoming courses would be displayed here */}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="past">
                  {pastCourses.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No past sessions found
                    </div>
                  ) : (
                    <div>
                      {/* Past courses would be displayed here */}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          {/* Related Certifications */}
          <Card>
            <CardHeader>
              <CardTitle>Related Certifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4 text-muted-foreground">
                No certifications linked to this course
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}