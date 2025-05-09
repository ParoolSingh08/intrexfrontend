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
import { Plus, Search, Edit, Trash2, Eye, Loader2 } from 'lucide-react'
import { getCustomers, createCustomer, type Customer } from '@/lib/api-client'
import { useApi, useApiMutation } from '@/lib/hooks/use-api'

export default function CustomersPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [addCustomerOpen, setAddCustomerOpen] = useState(false)
  const [customerFormData, setCustomerFormData] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
  })
  
  // Fetch customers data from API
  const { 
    data: customers, 
    isLoading, 
    error, 
    refetch: refetchCustomers 
  } = useApi(getCustomers)
  
  // Mutation for creating a new customer
  const { 
    execute: executeCreateCustomer, 
    isLoading: isCreating 
  } = useApiMutation(createCustomer)
  
  // Filter customers based on search query
  const filteredCustomers = customers ? customers.filter(customer => 
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.contact_person.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  ) : []
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setCustomerFormData(prev => ({
      ...prev,
      [id]: value
    }))
  }
  
  // Handle form submission
  const handleSubmit = async () => {
    try {
      // Validate form
      if (!customerFormData.name || !customerFormData.contact_person || !customerFormData.email) {
        toast({
          title: "Validation Error",
          description: "Please fill all required fields",
          variant: "destructive"
        })
        return
      }
      
      // Create customer
      const result = await executeCreateCustomer(customerFormData)
      
      if (result) {
        toast({
          title: "Success",
          description: "Customer created successfully",
        })
        
        // Clear form data and close dialog
        setCustomerFormData({
          name: '',
          contact_person: '',
          email: '',
          phone: '',
          address: '',
        })
        setAddCustomerOpen(false)
        
        // Refresh customers list
        refetchCustomers()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create customer",
        variant: "destructive"
      })
    }
  }
  
  // Show error if API fails
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load customers data",
        variant: "destructive"
      })
    }
  }, [error, toast])
  
  // Function to view customer details
  const viewCustomerDetails = (customerId: number) => {
    router.push(`/dashboard/customers/${customerId}`)
  }
  
  // Function to edit customer
  const editCustomer = (customerId: number) => {
    router.push(`/dashboard/customers/${customerId}/edit`)
  }
  
  // Function to delete customer (would add confirmation dialog in real app)
  const deleteCustomer = (customerId: number) => {
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
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground">Manage your customer database</p>
        </div>
        
        <Dialog open={addCustomerOpen} onOpenChange={setAddCustomerOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
              <DialogDescription>
                Enter the details for the new customer.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="name" className="text-sm font-medium">Company Name</label>
                <Input 
                  id="name" 
                  placeholder="Enter company name"
                  value={customerFormData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="contact_person" className="text-sm font-medium">Contact Person</label>
                <Input 
                  id="contact_person" 
                  placeholder="Enter contact person"
                  value={customerFormData.contact_person}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Enter email"
                  value={customerFormData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="phone" className="text-sm font-medium">Phone</label>
                <Input 
                  id="phone" 
                  placeholder="Enter phone"
                  value={customerFormData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="address" className="text-sm font-medium">Address</label>
                <Input 
                  id="address" 
                  placeholder="Enter address"
                  value={customerFormData.address}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddCustomerOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : 'Add Customer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Customer List</CardTitle>
          <CardDescription>
            A list of all customers in your database
          </CardDescription>
          
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
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
                  <TableHead className="w-[200px]">Company Name</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No customers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>{customer.contact_person}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.phone}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{customer.address}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => viewCustomerDetails(customer.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => editCustomer(customer.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => deleteCustomer(customer.id)}
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
            Showing {filteredCustomers.length} of {customers?.length || 0} customers
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