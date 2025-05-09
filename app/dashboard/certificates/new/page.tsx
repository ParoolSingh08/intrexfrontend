'use client'

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { 
  FileText, 
  Loader2, 
  ChevronLeft, 
  ArrowRight,
  Award,
  BadgeCheck
} from 'lucide-react'
import axios from 'axios'
import { CertificateGenerator } from '@/components/certificate/certificate-generator'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface Trainee {
  id: number;
  name: string;
  civil_id: string;
  company_name: string;
  photo_path: string | null;
  training_completion_date: string | null;
  training_registration_id: number | null;
}

interface Registration {
  id: number;
  registration_number: string;
  status: string;
  customer?: {
    name: string;
  };
  training_course?: {
    title: string;
  };
  training_date?: string;
}

export default function NewCertificatePage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [trainees, setTrainees] = useState<Trainee[]>([])
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [selectedTrainee, setSelectedTrainee] = useState<number | null>(null)
  const [selectedRegistration, setSelectedRegistration] = useState<number | null>(null)
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [previewMode, setPreviewMode] = useState<boolean>(false)
  
  // Fetch trainees and registrations
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Get the auth token
        const token = localStorage.getItem('token')
        if (!token) {
          toast({
            title: "Authentication Error",
            description: "Please login to continue",
            variant: "destructive"
          })
          router.push('/auth/login')
          return
        }
        
        // Fetch trainees
        const traineesResponse = await axios.get(`${API_URL}/trainees/`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        
        // Fetch registrations (only completed ones)
        const registrationsResponse = await axios.get(`${API_URL}/training-registrations/`, {
          params: {
            status: 'Completed'
          },
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        
        setTrainees(traineesResponse.data)
        setRegistrations(registrationsResponse.data)
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          title: "Error",
          description: "Failed to load trainees and registrations",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [router, toast])
  
  // Handle certificate generation with simplified error handling
  const handleGenerateCertificate = async () => {
    if (!selectedTrainee || !selectedRegistration) {
      toast({
        title: "Validation Error",
        description: "Please select both trainee and registration",
        variant: "destructive"
      })
      return
    }
    
    try {
      setIsGenerating(true)
      
      // Get the auth token
      const token = localStorage.getItem('token')
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please login to continue",
          variant: "destructive"
        })
        return
      }
      
      // Make API call to generate certificate
      try {
        console.log('Generating certificate with:', {
          trainee_id: selectedTrainee,
          training_registration_id: selectedRegistration
        })
        
        const response = await axios.post(
          `${API_URL}/certificates/generate`,
          {
            trainee_id: selectedTrainee,
            training_registration_id: selectedRegistration
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )
        
        console.log('Certificate generated successfully:', response.data)
        
        toast({
          title: "Success",
          description: "Certificate generated successfully",
        })
        
        // Redirect to certificate view
        router.push(`/dashboard/certificates?view=${response.data.id}`)
      } catch (error) {
        // Simplified error handling - just log the error without accessing its properties
        console.error('Certificate generation failed:', error)
        
        // Generic error message without accessing error properties
        toast({
          title: "Error",
          description: "Failed to generate certificate. Please check your connection and try again.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error in certificate generation flow:', error)
      toast({
        title: "Error",
        description: "Failed to generate certificate. Please try again later.",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }
  
  // Toggle preview mode
  const togglePreviewMode = () => {
    if (!selectedTrainee || !selectedRegistration) {
      toast({
        title: "Validation Error",
        description: "Please select both trainee and registration to preview",
        variant: "destructive"
      })
      return
    }
    setPreviewMode(!previewMode)
  }
  
  // Render trainee select options
  const renderTraineeOptions = () => {
    const filteredTrainees = selectedRegistration 
      ? trainees.filter(t => t.training_registration_id === selectedRegistration)
      : trainees
    
    return filteredTrainees.map(trainee => (
      <SelectItem key={trainee.id} value={trainee.id.toString()}>
        {trainee.name} ({trainee.civil_id})
      </SelectItem>
    ))
  }
  
  // Render registration select options with proper error handling
  const renderRegistrationOptions = () => {
    const completedRegistrations = registrations.filter(r => 
      r.status === 'Completed'
    )
    
    return completedRegistrations.map(reg => (
      <SelectItem key={reg.id} value={reg.id.toString()}>
        {reg.registration_number} - {reg.training_course?.title || 'Unnamed Course'}
      </SelectItem>
    ))
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => router.push('/dashboard/certificates')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Generate Certificate</h1>
            <p className="text-muted-foreground">
              Create a new certificate for a completed training
            </p>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="h-96 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-emerald-500" />
                Certificate Details
              </CardTitle>
              <CardDescription>
                Select trainee and training information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Training Registration</label>
                <Select
                  value={selectedRegistration?.toString() || ''}
                  onValueChange={(value) => {
                    setSelectedRegistration(parseInt(value))
                    setSelectedTrainee(null) // Reset trainee when registration changes
                    setPreviewMode(false)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select training registration" />
                  </SelectTrigger>
                  <SelectContent>
                    {renderRegistrationOptions()}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Select a completed training registration
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Trainee</label>
                <Select
                  value={selectedTrainee?.toString() || ''}
                  onValueChange={(value) => {
                    setSelectedTrainee(parseInt(value))
                    setPreviewMode(false)
                  }}
                  disabled={!selectedRegistration}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={selectedRegistration ? "Select trainee" : "Select registration first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {renderTraineeOptions()}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Select a trainee who completed the training
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button 
                className="w-full" 
                onClick={handleGenerateCertificate}
                disabled={isGenerating || !selectedTrainee || !selectedRegistration}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <BadgeCheck className="mr-2 h-4 w-4" />
                    Generate Certificate
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={togglePreviewMode}
                disabled={!selectedTrainee || !selectedRegistration}
              >
                {previewMode ? "Hide Preview" : "Show Preview"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
          
          {previewMode && selectedTrainee && selectedRegistration && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Certificate Preview</CardTitle>
                <CardDescription>
                  Preview how the certificate will look
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md p-4 bg-gray-50">
                  <CertificateGenerator 
                    trainingRegistrationId={selectedRegistration} 
                    traineeId={selectedTrainee}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewMode(false)}
                  className="mr-2"
                >
                  Hide Preview
                </Button>
                <Button
                  size="sm"
                  onClick={handleGenerateCertificate}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <BadgeCheck className="mr-2 h-4 w-4" />
                      Generate Certificate
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}