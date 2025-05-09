'use client'

import { useState } from 'react'
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
import { ArrowLeft, Save, X, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { createCourse } from '@/lib/api-client'

export default function AddCoursePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration_hours: 1,
  })
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: id === 'duration_hours' ? parseFloat(value) : value
    }))
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Validate form
      if (!formData.title || !formData.description || formData.duration_hours <= 0) {
        toast({
          title: "Validation Error",
          description: "Please fill all required fields. Duration must be greater than 0.",
          variant: "destructive"
        })
        return
      }
      
      setIsSubmitting(true)
      
      // Create course using the API client
      const result = await createCourse({
        title: formData.title,
        description: formData.description,
        duration_hours: formData.duration_hours
      })
      
      toast({
        title: "Success",
        description: "Course created successfully",
      })
      
      // Redirect back to courses list
      router.push('/dashboard/courses')
      
    } catch (error) {
      console.error('Error creating course:', error)
      toast({
        title: "Error",
        description: "Failed to create course",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">Add New Course</h1>
      </div>
      
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Course Details</CardTitle>
            <CardDescription>
              Enter the information about the new training course
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Course Title</Label>
              <Input 
                id="title" 
                placeholder="Enter course title" 
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Course Description</Label>
              <Textarea 
                id="description" 
                placeholder="Enter course description" 
                value={formData.description}
                onChange={handleInputChange}
                required
                className="min-h-[100px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration_hours">Duration (hours)</Label>
              <Input 
                id="duration_hours" 
                type="number" 
                min="0.5"
                step="0.5"
                placeholder="Enter duration in hours" 
                value={formData.duration_hours}
                onChange={handleInputChange}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Course
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}