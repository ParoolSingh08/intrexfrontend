'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Save, X, Upload } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { TraineeFormData } from '@/lib/api-client'

interface TraineeFormProps {
  initialData?: Partial<TraineeFormData>
  onSubmit: (data: TraineeFormData) => Promise<void>
  mode: 'create' | 'edit'
}

export function TraineeForm({ initialData, onSubmit, mode }: TraineeFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState<TraineeFormData>({
    name: initialData?.name || '',
    civil_id: initialData?.civil_id || '',
    company_name: initialData?.company_name || '',
  })
  
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setFormData(prev => ({
        ...prev,
        photo: file
      }))
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (event) => {
        setPhotoPreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    if (!formData.name || !formData.civil_id || !formData.company_name) {
      toast({
        title: 'Validation Error',
        description: 'Please fill all required fields',
        variant: 'destructive'
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      await onSubmit(formData)
      
      toast({
        title: 'Success',
        description: `Trainee ${mode === 'create' ? 'created' : 'updated'} successfully`,
      })
      
      // Navigate back
      router.push('/dashboard/trainees')
    } catch (error) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} trainee:`, error)
      toast({
        title: 'Error',
        description: `Failed to ${mode === 'create' ? 'create' : 'update'} trainee`,
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()} type="button">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <CardTitle>{mode === 'create' ? 'Add New Trainee' : 'Edit Trainee'}</CardTitle>
          </div>
          <CardDescription>
            {mode === 'create' 
              ? 'Enter the information for the new trainee' 
              : 'Update the trainee information'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                name="name"
                placeholder="Enter trainee's full name" 
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="civil_id">Civil ID</Label>
              <Input 
                id="civil_id" 
                name="civil_id"
                placeholder="Enter civil ID or employee ID" 
                value={formData.civil_id}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name</Label>
              <Input 
                id="company_name" 
                name="company_name"
                placeholder="Enter company name" 
                value={formData.company_name}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="photo">Photo</Label>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <Input 
                    id="photo" 
                    name="photo"
                    type="file" 
                    accept=".jpg,.jpeg,.png"
                    onChange={handlePhotoChange}
                    className="max-w-sm"
                  />
                  <Button type="button" variant="outline" size="icon">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
                {photoPreview && (
                  <div className="mt-2">
                    <img 
                      src={photoPreview} 
                      alt="Preview" 
                      className="max-w-xs max-h-32 object-contain border rounded-md"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                {mode === 'create' ? 'Creating...' : 'Updating...'}
              </div>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {mode === 'create' ? 'Save Trainee' : 'Update Trainee'}
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}