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
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  UserPlus, 
  Loader2, 
  RefreshCw,
  Download,
  Upload,
  GraduationCap
} from 'lucide-react'
import { 
  getTrainees, 
  deleteTrainee, 
  Trainee, 
  TrainingRegistration, 
  getRegistrations
} from '@/lib/api-client'

export default function TraineesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [trainees, setTrainees] = useState<Trainee[]>([])
  const [registrations, setRegistrations] = useState<TrainingRegistration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedTraineeId, setSelectedTraineeId] = useState<number | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  
  // Fetch trainees
  const fetchTrainees = async () => {
    setIsLoading(true)
    try {
      const data = await getTrainees()
      setTrainees(data)
    } catch (error) {
      console.error('Error fetching trainees:', error)
      toast({
        title: 'Error',
        description: 'Failed to load trainees data',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // Fetch registrations
  const fetchRegistrations = async () => {
    try {
      const data = await getRegistrations()
      setRegistrations(data)
    } catch (error) {
      console.error('Error fetching registrations:', error)
    }
  }
  
  // Load data on component mount
  useEffect(() => {
    fetchTrainees()
    fetchRegistrations()
  }, [])
  
  // Filter trainees based on search query
  const filteredTrainees = trainees.filter(trainee => 
    trainee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trainee.civil_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trainee.company_name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  // Handle delete trainee
  const handleDeleteClick = (id: number) => {
    setSelectedTraineeId(id)
    setDeleteDialogOpen(true)
  }
  
  const confirmDelete = async () => {
    if (selectedTraineeId === null) return
    
    setIsDeleting(true)
    try {
      await deleteTrainee(selectedTraineeId)
      setTrainees(trainees.filter(trainee => trainee.id !== selectedTraineeId))
      toast({
        title: 'Success',
        description: 'Trainee deleted successfully',
      })
      setDeleteDialogOpen(false)
    } catch (error) {
      console.error('Error deleting trainee:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete trainee',
        variant: 'destructive'
      })
    } finally {
      setIsDeleting(false)
    }
  }
  
  // Helper to get registration number for a trainee
  const getRegistrationNumber = (registrationId: number | null) => {
    if (!registrationId) return '-'
    const registration = registrations.find(reg => reg.id === registrationId)
    return registration ? registration.registration_number : '-'
  }
  
  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString()
  }
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Trainees</h1>
          <p className="text-muted-foreground">Manage and track trainees</p>
        </div>
        
        
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Trainee List</CardTitle>
          <CardDescription>
            A list of all trainees in the system
          </CardDescription>
          
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search trainees..."
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
                  <TableHead>Civil ID</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Registration</TableHead>
                  <TableHead>Completion Date</TableHead>
                  <TableHead>Validation Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrainees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No trainees found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTrainees.map((trainee) => (
                    <TableRow key={trainee.id}>
                      <TableCell className="font-medium">{trainee.name}</TableCell>
                      <TableCell>{trainee.civil_id}</TableCell>
                      <TableCell>{trainee.company_name}</TableCell>
                      <TableCell>
                        {trainee.training_registration_id ? (
                          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                            {getRegistrationNumber(trainee.training_registration_id)}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                            Unassigned
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(trainee.training_completion_date)}</TableCell>
                      <TableCell>{formatDate(trainee.certificate_validation_date)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => router.push(`/dashboard/trainees/${trainee.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => router.push(`/dashboard/trainees/${trainee.id}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {!trainee.training_registration_id && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => router.push(`/dashboard/trainees/${trainee.id}/assign`)}
                            >
                              <UserPlus className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteClick(trainee.id)}
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
            Showing {filteredTrainees.length} of {trainees.length} trainees
          </div>
          <Button variant="outline" size="sm" onClick={fetchTrainees}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </CardFooter>
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this trainee? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <div className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </div>
              ) : (
                <>Delete</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}