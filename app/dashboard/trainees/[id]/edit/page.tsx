'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TraineeForm } from '@/components/trainee-form'
import { getTraineeById, updateTrainee, TraineeFormData } from '@/lib/api-client'
import { useToast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'

export default function EditTraineePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [traineeData, setTraineeData] = useState<TraineeFormData | null>(null)
  
  // Use React.use to unwrap the params
  const id = React.use(params).id
  const traineeId = parseInt(id)
  
  // Fetch trainee data
  useEffect(() => {
    const fetchTrainee = async () => {
      setIsLoading(true)
      try {
        const trainee = await getTraineeById(traineeId)
        setTraineeData({
          name: trainee.name,
          civil_id: trainee.civil_id,
          company_name: trainee.company_name,
          
        })
      } catch (error) {
        console.error('Error fetching trainee:', error)
        toast({
          title: 'Error',
          description: 'Failed to load trainee data',
          variant: 'destructive'
        })
        router.push('/dashboard/trainees')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchTrainee()
  }, [traineeId, router, toast])
  
  const handleSubmit = async (data: TraineeFormData) => {
    try {
      await updateTrainee(traineeId, data)
      toast({
        title: 'Success',
        description: 'Trainee updated successfully',
      })
      router.push('/dashboard/trainees')
    } catch (error) {
      console.error('Error updating trainee:', error)
      toast({
        title: 'Error',
        description: 'Failed to update trainee',
        variant: 'destructive'
      })
      throw error // Rethrow to let the form component handle it
    }
  }
  
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading trainee data...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="p-6">
      {traineeData && (
        <TraineeForm 
          mode="edit"
          initialData={traineeData}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}