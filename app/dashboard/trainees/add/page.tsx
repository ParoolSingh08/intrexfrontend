'use client'

import { useRouter } from 'next/navigation'
import { TraineeForm } from '@/components/trainee-form'
import { createTrainee, TraineeFormData } from '@/lib/api-client'
import { useToast } from '@/components/ui/use-toast'

export default function AddTraineePage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const handleSubmit = async (data: TraineeFormData) => {
    try {
      await createTrainee(data)
      toast({
        title: 'Success',
        description: 'Trainee created successfully',
      })
      router.push('/dashboard/trainees')
    } catch (error) {
      console.error('Error creating trainee:', error)
      toast({
        title: 'Error',
        description: 'Failed to create trainee',
        variant: 'destructive'
      })
      throw error // Rethrow to let the form component handle it
    }
  }
  
  return (
    <div className="p-6">
      <TraineeForm 
        mode="create"
        onSubmit={handleSubmit}
      />
    </div>
  )
}