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
import { ArrowLeft, Edit, Trash2, CalendarDays, Users, CheckCircle, Loader2 } from 'lucide-react'
import { getTrainer, type Trainer } from '@/lib/api-client'
import { useApi } from '@/lib/hooks/use-api'

// This would be your API client function to get trainer registrations
const getTrainerRegistrations = async (trainerId: number) => {
  // This is a placeholder - In a real app, you would call your API
  return []
}

interface TrainerDetailsPageProps {
  params: {
    id: string;
  };
}

export default function TrainerDetailsPage({ params }: TrainerDetailsPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const trainerId = parseInt(params.id)
  
  // Fetch trainer data from API
  const { 
    data: trainer, 
    isLoading, 
    error 
  } = useApi(() => getTrainer(trainerId))
  
  // Fetch trainer's trainings (registrations where this trainer is assigned)
  const {
    data: trainerRegistrations,
    isLoading: isLoadingRegistrations
  } = useApi(() => getTrainerRegistrations(trainerId))
  
  // Show error if API fails
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load trainer data",
        variant: "destructive"
      })
    }
  }, [error, toast])
  
  // Function to edit trainer
  const handleEdit = () => {
    router.push(`/dashboard/trainers/${trainerId}/edit`)
  }
  
  // Function to delete trainer
  const handleDelete = () => {
    // In a real app, this would call the delete API
    toast({
      title: "Info",
      description: "Delete functionality would be implemented here",
    })
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
  
  if (!trainer) {
    return (
      <div className="p-6">
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold">Trainer not found</h2>
          <p className="text-muted-foreground mt-2">The trainer you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => router.push('/dashboard/trainers')}
          >
            Go Back to Trainers
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
        <h1 className="text-3xl font-bold">Trainer Details</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trainer Info Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Trainer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-500 mb-4">
                {trainer.name.charAt(0)}
              </div>
              <h2 className="text-2xl font-bold">{trainer.name}</h2>
              <div className="mt-2">
                <Badge className={trainer.type === "Employee" 
                  ? "bg-blue-100 text-blue-800" 
                  : "bg-orange-100 text-orange-800"}>
                  {trainer.type}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="text-sm text-muted-foreground">Email</div>
                <div>{trainer.email}</div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground">Phone</div>
                <div>{trainer.phone}</div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground">Contact Number</div>
                <div>{trainer.contact_number}</div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground">Hourly Rate</div>
                <div className="font-semibold">{trainer.charge_per_hour} KD</div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground">Government ID</div>
                <div>{trainer.gov_id_number}</div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground">Address</div>
                <div>{trainer.address}</div>
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
        
        {/* Stats and Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <div className="bg-primary/10 p-3 rounded-full mb-3">
                    <CalendarDays className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-3xl font-bold">0</div>
                  <div className="text-sm text-muted-foreground">Trainings Conducted</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <div className="bg-primary/10 p-3 rounded-full mb-3">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-3xl font-bold">0</div>
                  <div className="text-sm text-muted-foreground">Trainees Taught</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <div className="bg-primary/10 p-3 rounded-full mb-3">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-3xl font-bold">0</div>
                  <div className="text-sm text-muted-foreground">Certifications Issued</div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Training History Tabs */}
          <Card>
            <CardHeader>
              <CardTitle>Training Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="upcoming">
                <TabsList className="mb-4">
                  <TabsTrigger value="upcoming">Upcoming Trainings</TabsTrigger>
                  <TabsTrigger value="past">Past Trainings</TabsTrigger>
                </TabsList>
                
                <TabsContent value="upcoming">
                  {isLoadingRegistrations ? (
                    <div className="h-48 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No upcoming trainings scheduled
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="past">
                  {isLoadingRegistrations ? (
                    <div className="h-48 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No past trainings found
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}