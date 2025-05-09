// app/certificates/verify/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Loader2, Check, X, Download, ArrowLeft } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import Link from 'next/link'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface CertificateData {
  is_valid: boolean
  trainee_name: string
  trainee_id: string
  company_name: string
  course_title: string
  training_date: string
  expiry_date: string
  registration_number: string
}

export default function CertificateVerificationPage() {
  const { id } = useParams()
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const verifyCertificate = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // In a real application, you would make an API call to verify the certificate
        // For this example, we'll simulate an API response
        
        // Simulated API call
        // const response = await axios.get(`${API_URL}/certificates/verify/${id}`)
        // const data = response.data
        
        // Simulated data for demonstration
        // In a real app, this would come from your API
        if (typeof id === 'string' && id.startsWith('IICTCM')) {
          // Parse possible parts from certificate ID
          const parts = id.split('-')
          const regNumber = parts.length > 1 ? `TR-${parts[0].replace('IICTCM', '')}` : 'Unknown'
          const traineeId = parts.length > 2 ? parts[1] : 'Unknown'
          
          // Simulate successful verification
          setTimeout(() => {
            setCertificateData({
              is_valid: true,
              trainee_name: 'John Doe',
              trainee_id: '12345678901',
              company_name: 'ABC Corporation',
              course_title: 'Safety Training',
              training_date: '15-04-2025',
              expiry_date: '15-04-2026',
              registration_number: regNumber
            })
            setIsLoading(false)
          }, 1500)
        } else {
          // Simulate invalid certificate
          setTimeout(() => {
            setError('Invalid certificate ID. The certificate could not be verified.')
            setIsLoading(false)
          }, 1500)
        }
      } catch (err) {
        console.error('Error verifying certificate:', err)
        setError('Failed to verify certificate. Please try again later.')
        setIsLoading(false)
      }
    }
    
    verifyCertificate()
  }, [id, toast])

  return (
    <div className="container max-w-3xl py-10">
      <Link href="/" className="inline-flex items-center text-primary hover:underline mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Link>
      
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <img 
              src="/intrex-logo.png" 
              alt="INTREX Logo" 
              className="h-16 w-auto"
            />
          </div>
          <CardTitle className="text-2xl">Certificate Verification</CardTitle>
          <CardDescription>
            Verify the authenticity of training certificates issued by International Inspection Centre Co. W.L.L.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Verifying certificate...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="bg-red-100 rounded-full p-3 mb-4">
                <X className="h-10 w-10 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-red-600 mb-2">Verification Failed</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <p className="text-sm">
                Certificate ID: <span className="font-mono">{id}</span>
              </p>
            </div>
          ) : certificateData ? (
            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center py-6">
                <div className="bg-green-100 rounded-full p-3 mb-4">
                  <Check className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-green-600 mb-2">Certificate Verified</h3>
                <p className="text-muted-foreground">
                  This certificate is valid and was issued by International Inspection Centre Co. W.L.L.
                </p>
              </div>
              
              <div className="grid gap-4 border rounded-lg p-4 bg-muted/20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Certificate Number</h4>
                    <p className="font-mono">{id}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Registration Number</h4>
                    <p>{certificateData.registration_number}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Trainee Name</h4>
                    <p>{certificateData.trainee_name}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Civil ID</h4>
                    <p>{certificateData.trainee_id}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Company</h4>
                  <p>{certificateData.company_name}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Training Course</h4>
                  <p>{certificateData.course_title}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Training Date</h4>
                    <p>{certificateData.training_date}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Valid Until</h4>
                    <p>{certificateData.expiry_date}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </CardContent>
        
        {certificateData && certificateData.is_valid && (
          <CardFooter className="justify-center">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download Certificate
            </Button>
          </CardFooter>
        )}
      </Card>
      
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>
          For additional verification or inquiries, please contact our certification department at{' '}
          <a href="mailto:certificates@intrex.com" className="text-primary hover:underline">
            certificates@intrex.com
          </a>
        </p>
      </div>
    </div>
  )
}