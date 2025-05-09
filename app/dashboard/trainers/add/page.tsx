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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Save, X, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { createTrainer } from '@/lib/api-client'

export default function AddTrainerPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'Employee' as 'Employee' | 'Freelancer',
    charge_per_hour: 0,
    contact_number: '',
    phone: '',
    email: '',
    address: '',
    gov_id_number: '',
  })
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: id === 'charge_per_hour' ? parseFloat(value) : value
    }))
  }
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Validate form
      if (!formData.name || !formData.email || !formData.phone || !formData.gov_id_number) {
        toast({
          title: "Validation Error",
          description: "Please fill all required fields",
          variant: "destructive"
        })
        return
      }
      
      setIsSubmitting(true)
      
      // Create trainer using the API client
      const result = await createTrainer({
        name: formData.name,
        type: formData.type,
        charge_per_hour: formData.charge_per_hour,
        contact_number: formData.contact_number,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        gov_id_number: formData.gov_id_number,
      })
      
      toast({
        title: "Success",
        description: "Trainer created successfully",
      })
      
      // Redirect back to trainers list
      router.push('/dashboard/trainers')
      
    } catch (error) {
      console.error('Error creating trainer:', error)
      toast({
        title: "Error",
        description: "Failed to create trainer",
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
        <h1 className="text-3xl font-bold">Add New Trainer</h1>
      </div>
      
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Trainer Details</CardTitle>
            <CardDescription>
              Enter the information about the new trainer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  placeholder="Enter trainer's full name" 
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Trainer Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleSelectChange('type', value)}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select trainer type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Employee">Employee</SelectItem>
                    <SelectItem value="Freelancer">Freelancer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Enter email address" 
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input 
                  id="phone" 
                  placeholder="Enter phone number" 
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contact_number">Contact Number</Label>
                <Input 
                  id="contact_number" 
                  placeholder="Enter alternative contact number" 
                  value={formData.contact_number}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gov_id_number">Government ID</Label>
                <Input 
                  id="gov_id_number" 
                  placeholder="Enter government ID number" 
                  value={formData.gov_id_number}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="charge_per_hour">Hourly Rate (KD)</Label>
                <Input 
                  id="charge_per_hour" 
                  type="number" 
                  min="0"
                  step="0.5"
                  placeholder="Enter hourly rate" 
                  value={formData.charge_per_hour}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea 
                id="address" 
                placeholder="Enter full address" 
                value={formData.address}
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
                  Save Trainer
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}