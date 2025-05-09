'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { Plus, Search, Edit, Trash2, Clock, FileText, Loader2 } from 'lucide-react'
import { getCourses, createCourse, TrainingCourse } from '@/lib/api-client'

export default function CoursesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [addCourseOpen, setAddCourseOpen] = useState(false)
  const [courses, setCourses] = useState<TrainingCourse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [courseFormData, setCourseFormData] = useState({
    title: '',
    description: '',
    duration_hours: 1
  })
  
  // Fetch courses data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const data = await getCourses()
        setCourses(data)
      } catch (error) {
        console.error('Error fetching courses:', error)
        toast({
          title: "Error",
          description: "Failed to load courses data",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [toast])
  
  // Filter courses based on search query
  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    
    if (id === 'duration_hours') {
      setCourseFormData(prev => ({
        ...prev,
        [id]: parseFloat(value) || 0
      }))
    } else {
      setCourseFormData(prev => ({
        ...prev,
        [id]: value
      }))
    }
  }
  
  // Handle form submission
  const handleSubmit = async () => {
    try {
      // Validate form
      if (!courseFormData.title || !courseFormData.description || courseFormData.duration_hours <= 0) {
        toast({
          title: "Validation Error",
          description: "Please fill all required fields with valid values",
          variant: "destructive"
        })
        return
      }
      
      setIsCreating(true)
      
      // Create course
      const result = await createCourse(courseFormData)
      
      toast({
        title: "Success",
        description: "Course created successfully",
      })
      
      // Clear form data and close dialog
      setCourseFormData({
        title: '',
        description: '',
        duration_hours: 1
      })
      setAddCourseOpen(false)
      
      // Add new course to the list
      setCourses(prev => [...prev, result])
    } catch (error) {
      console.error('Error creating course:', error)
      toast({
        title: "Error",
        description: "Failed to create course",
        variant: "destructive"
      })
    } finally {
      setIsCreating(false)
    }
  }
  
  // Function to edit course
  const editCourse = (courseId: number) => {
    router.push(`/dashboard/courses/${courseId}/edit`)
  }
  
  // Function to delete course
  const deleteCourse = (courseId: number) => {
    // In a real app, this would call the delete API
    toast({
      title: "Info",
      description: "Delete functionality would be implemented here",
    })
  }
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Training Courses</h1>
          <p className="text-muted-foreground">Manage your training course catalog</p>
        </div>
        
        <Dialog open={addCourseOpen} onOpenChange={setAddCourseOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Course
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Course</DialogTitle>
              <DialogDescription>
                Enter the details for the new training course.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="title" className="text-sm font-medium">Course Title</label>
                <Input 
                  id="title" 
                  placeholder="Enter course title"
                  value={courseFormData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="description" className="text-sm font-medium">Description</label>
                <textarea 
                  id="description" 
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Enter course description"
                  value={courseFormData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="duration_hours" className="text-sm font-medium">Duration (Hours)</label>
                <Input 
                  id="duration_hours" 
                  type="number" 
                  placeholder="Enter course duration in hours"
                  value={courseFormData.duration_hours}
                  onChange={handleInputChange}
                  min="0.5"
                  step="0.5"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddCourseOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : 'Add Course'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Course List</CardTitle>
          <CardDescription>
            All available training courses in your catalog
          </CardDescription>
          
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-96 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCourses.length === 0 ? (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  No courses found
                </div>
              ) : (
                filteredCourses.map((course) => (
                  <Card key={course.id} className="flex flex-col">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{course.duration_hours} {course.duration_hours === 1 ? 'hour' : 'hours'}</span>
                      </div>
                      <p className="text-sm line-clamp-3">{course.description}</p>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => editCourse(course.id)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => deleteCourse(course.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Showing {filteredCourses.length} of {courses.length} courses
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}