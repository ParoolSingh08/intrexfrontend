'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/use-toast'
import { ArrowLeft, Edit, Printer, UserPlus, Download } from 'lucide-react'
import { getTraineeById, getRegistrations, Trainee, TrainingRegistration } from '@/lib/api-client'

export default function TraineeDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [trainee, setTrainee] = useState<Trainee | null>(null)
  const [registration, setRegistration] = useState<TrainingRegistration | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Use React.use to unwrap the params
  const id = React.use(params).id
  const traineeId = parseInt(id)
  
  // Fetch trainee and registration data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const traineeData = await getTraineeById(traineeId)
        setTrainee(traineeData)
        
        if (traineeData.training_registration_id) {
          const registrations = await getRegistrations()
          const matchingReg = registrations.find(r => r.id === traineeData.training_registration_id)
          setRegistration(matchingReg || null)
        }
      } catch (error) {
        console.error('Error fetching trainee data:', error)
        toast({
          title: 'Error',
          description: 'Failed to load trainee data',
          variant: 'destructive'
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [traineeId, toast])
  
  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString()
  }
  
  // Handle print certificate (placeholder)
  const printCertificate = () => {
    toast({
      title: 'Print Certificate',
      description: 'Certificate printing would be implemented here',
    })
  }
  
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Trainee Details</h1>
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/4 mt-2" />
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-40" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-40" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-40" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-40" />
              </div>
            </div>
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-[200px] w-[200px] rounded-md" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  if (!trainee) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Trainee Not Found</h1>
        </div>
        
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              The requested trainee could not be found. The trainee may have been deleted.
            </p>
            <div className="flex justify-center mt-4">
              <Button onClick={() => router.push('/dashboard/trainees')}>
                Return to Trainees
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">Trainee Details</h1>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between">
            <div>
              <CardTitle className="text-2xl">{trainee.name}</CardTitle>
              <CardDescription>
                Added on {new Date(trainee.created_at).toLocaleDateString()}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push(`/dashboard/trainees/${traineeId}/edit`)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Trainee
              </Button>
              {trainee.training_registration_id && trainee.training_completion_date && (
                <Button onClick={printCertificate}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print Certificate
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Personal Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Full Name</p>
              <p className="font-medium text-lg">{trainee.name}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Civil ID</p>
              <p className="font-medium text-lg">{trainee.civil_id}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Company</p>
              <p className="font-medium text-lg">{trainee.company_name}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Registration Status</p>
              {trainee.training_registration_id ? (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  Assigned to {registration?.registration_number || 'Registration'}
                </Badge>
              ) : (
                <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                  Unassigned
                </Badge>
              )}
            </div>
          </div>
          
          {/* Training Info */}
          {trainee.training_registration_id && (
            <div className="border rounded-lg p-4 bg-card">
              <h3 className="text-lg font-medium mb-4">Registration Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Registration Number</p>
                  <p className="font-medium">{registration?.registration_number}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Training Course</p>
                  <p className="font-medium">Course #{registration?.training_course_id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Registration Date</p>
                  <p className="font-medium">{formatDate(registration?.request_date || null)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Training Date</p>
                  <p className="font-medium">{formatDate(registration?.training_date || null)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge 
                    variant="outline" 
                    className={
                      registration?.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      registration?.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' :
                      registration?.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }
                  >
                    {registration?.status}
                  </Badge>
                </div>
              </div>
            </div>
          )}
          
          {/* Certification Info */}
          <div className="border rounded-lg p-4 bg-card">
            <h3 className="text-lg font-medium mb-4">Certification Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Training Completion Date</p>
                <p className="font-medium">{formatDate(trainee.training_completion_date)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Certificate Validation Date</p>
                <p className="font-medium">{formatDate(trainee.certificate_validation_date)}</p>
              </div>
            </div>
          </div>
          
          {/* Photo */}
          {trainee.photo_path && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Trainee Photo</p>
              <div className="border rounded-md overflow-hidden">
                <img 
                  src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/trainees/${trainee.id}/photo`} 
                  alt={`${trainee.name}'s photo`} 
                  className="max-w-[300px] h-auto object-contain" 
                />
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push('/dashboard/trainees')}>
            Back to Trainees
          </Button>
          
          {!trainee.training_registration_id && (
            <Button onClick={() => router.push(`/dashboard/trainees/${traineeId}/assign`)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Assign to Registration
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}