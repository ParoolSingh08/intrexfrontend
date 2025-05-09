'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { Plus, Search, Edit, Trash2, Eye, Loader2 } from 'lucide-react'

// Instead of importing API functions from api-client, we'll define them inline
// to avoid the API_URL conflict

export default function TrainersPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [addTrainerOpen, setAddTrainerOpen] = useState(false)
  const [trainers, setTrainers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [trainerFormData, setTrainerFormData] = useState({
    name: '',
    type: 'Employee',
    charge_per_hour: 0,
    contact_number: '',
    phone: '',
    email: '',
    address: '',
    gov_id_number: ''
  })
  
  // Fetch trainers on component mount
  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        setIsLoading(true)
        const token = localStorage.getItem('token')
        
        if (!token) {
          router.push('/auth/login')
          return
        }
        
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/trainers/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        setTrainers(response.data)
      } catch (error) {
        console.error('Error fetching trainers:', error)
        toast({
          title: "Error",
          description: "Failed to load trainers data",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchTrainers()
  }, [router, toast])
  
  // Filter trainers based on search query
  const filteredTrainers = trainers ? trainers.filter(trainer => 
    trainer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trainer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trainer.type.toLowerCase().includes(searchQuery.toLowerCase())
  ) : []
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { id, value } = e.target
    
    // Convert to number for charge_per_hour
    if (id === 'charge_per_hour') {
      setTrainerFormData(prev => ({
        ...prev,
        [id]: parseFloat(value) || 0
      }))
    } else {
      setTrainerFormData(prev => ({
        ...prev,
        [id]: value
      }))
    }
  }
  
  // Handle select input changes
  const handleSelectChange = (value) => {
    setTrainerFormData(prev => ({
      ...prev,
      type: value
    }))
  }
  
  // Handle form submission
  const handleSubmit = async () => {
    try {
      // Validate form
      if (!trainerFormData.name || !trainerFormData.email || !trainerFormData.gov_id_number) {
        toast({
          title: "Validation Error",
          description: "Please fill all required fields",
          variant: "destructive"
        })
        return
      }
      
      setIsCreating(true)
      
      // Get token
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/auth/login')
        return
      }
      
      // Create trainer
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/trainers/`, 
        trainerFormData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      
      if (response.data) {
        toast({
          title: "Success",
          description: "Trainer created successfully",
        })
        
        // Clear form data and close dialog
        setTrainerFormData({
          name: '',
          type: 'Employee',
          charge_per_hour: 0,
          contact_number: '',
          phone: '',
          email: '',
          address: '',
          gov_id_number: ''
        })
        setAddTrainerOpen(false)
        
        // Refresh trainers list
        setTrainers(prev => [...prev, response.data])
      }
    } catch (error) {
      console.error('Error creating trainer:', error)
      toast({
        title: "Error",
        description: "Failed to create trainer",
        variant: "destructive"
      })
    } finally {
      setIsCreating(false)
    }
  }
  
  // Function to view trainer details
  const viewTrainerDetails = (trainerId) => {
    router.push(`/dashboard/trainers/${trainerId}`)
  }
  
  // Function to edit trainer
  const editTrainer = (trainerId) => {
    router.push(`/dashboard/trainers/${trainerId}/edit`)
  }
  
  // Function to delete trainer
  const deleteTrainer = (trainerId) => {
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
          <h1 className="text-3xl font-bold">Trainers</h1>
          <p className="text-muted-foreground">Manage your trainers and instructors</p>
        </div>
        
        <Dialog open={addTrainerOpen} onOpenChange={setAddTrainerOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Trainer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Trainer</DialogTitle>
              <DialogDescription>
                Enter the details for the new trainer.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                <Input 
                  id="name" 
                  placeholder="Enter trainer's full name"
                  value={trainerFormData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="type" className="text-sm font-medium">Trainer Type</label>
                <Select 
                  value={trainerFormData.type} 
                  onValueChange={handleSelectChange}
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
              
              <div className="grid gap-2">
                <label htmlFor="charge_per_hour" className="text-sm font-medium">Charge Per Hour (KD)</label>
                <Input 
                  id="charge_per_hour" 
                  type="number" 
                  placeholder="Enter hourly rate"
                  value={trainerFormData.charge_per_hour}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="contact_number" className="text-sm font-medium">Contact Number</label>
                <Input 
                  id="contact_number" 
                  placeholder="Enter contact number"
                  value={trainerFormData.contact_number}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="phone" className="text-sm font-medium">Phone</label>
                <Input 
                  id="phone" 
                  placeholder="Enter phone number"
                  value={trainerFormData.phone}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Enter email"
                  value={trainerFormData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="address" className="text-sm font-medium">Address</label>
                <Input 
                  id="address" 
                  placeholder="Enter address"
                  value={trainerFormData.address}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="gov_id_number" className="text-sm font-medium">Government ID Number</label>
                <Input 
                  id="gov_id_number" 
                  placeholder="Enter government ID number"
                  value={trainerFormData.gov_id_number}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddTrainerOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : 'Add Trainer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Trainer List</CardTitle>
          <CardDescription>
            A list of all trainers in your organization
          </CardDescription>
          
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search trainers..."
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Hourly Rate (KD)</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrainers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No trainers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTrainers.map((trainer) => (
                    <TableRow key={trainer.id}>
                      <TableCell className="font-medium">{trainer.name}</TableCell>
                      <TableCell>
                        <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium
                          ${trainer.type === "Employee" 
                            ? "bg-blue-100 text-blue-800" 
                            : "bg-orange-100 text-orange-800"}`}>
                          {trainer.type}
                        </span>
                      </TableCell>
                      <TableCell>{trainer.charge_per_hour}</TableCell>
                      <TableCell>{trainer.email}</TableCell>
                      <TableCell>{trainer.phone}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => viewTrainerDetails(trainer.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => editTrainer(trainer.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => deleteTrainer(trainer.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Showing {filteredTrainers.length} of {trainers?.length || 0} trainers
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm" disabled>Next</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}