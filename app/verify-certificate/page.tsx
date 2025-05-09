// app/verify-certificate/page.tsx
'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  XCircle, 
  Search, 
  ArrowRight, 
  Download, 
  Calendar, 
  User, 
  FileText,
  Briefcase,
  Loader2
} from 'lucide-react'
import axios from 'axios'
import Image from 'next/image'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface VerificationResult {
  is_valid: boolean
  trainee_name?: string
  trainee_id?: string
  company_name?: string
  course_title?: string
  training_date?: string
  expiry_date?: string
  registration_number?: string
  error_message?: string
}

export default function VerifyCertificatePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialCertId = searchParams.get('certId') || ''
  
  const [certificateId, setCertificateId] = useState(initialCertId)
  const [isVerifying, setIsVerifying] = useState(false)
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    if (!certificateId.trim()) {
      setError('Please enter a certificate ID')
      return
    }
    
    try {
      setIsVerifying(true)
      setError(null)
      
      // Make API call to verify certificate
      const response = await axios.get(`${API_URL}/certificates/verify/${certificateId}`)
      setResult(response.data)
      
      // Update URL with certificate ID for sharing
      router.push(`/verify-certificate?certId=${certificateId}`, { scroll: false })
    } catch (error) {
      console.error('Error verifying certificate:', error)
      setResult(null)
      setError('Failed to verify certificate. Please check the ID and try again.')
    } finally {
      setIsVerifying(false)
    }
  }
  
  // If there's an initial certificate ID from URL, verify it on page load
  useState(() => {
    if (initialCertId) {
      handleVerify()
    }
  })
  
  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <header className="bg-white border-b py-4">
        <div className="container flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Image 
              src="/intrex-logo.png" 
              alt="INTREX Logo" 
              width={40} 
              height={40} 
            />
            <h1 className="text-xl font-bold">CertiTrack</h1>
          </div>
          
          <nav>
            <ul className="flex gap-4">
              <li>
                <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/verify-certificate" className="text-sm font-medium">
                  Verify Certificate
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-foreground">
                  Login
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      
      <main className="flex-1 container py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Verify Training Certificate</h1>
            <p className="text-muted-foreground mt-2">
              Enter the certificate ID to verify its authenticity
            </p>
          </div>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Certificate Verification</CardTitle>
              <CardDescription>
                Enter the certificate ID found on the training certificate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerify} className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Enter certificate ID (e.g., IICTCM2025-00001-12345)"
                    className="pl-10"
                    value={certificateId}
                    onChange={(e) => setCertificateId(e.target.value)}
                  />
                </div>
                <Button type="submit" disabled={isVerifying}>
                  {isVerifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying
                    </>
                  ) : (
                    <>
                      Verify
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
              
              {error && (
                <div className="mt-4 text-sm text-red-600">
                  {error}
                </div>
              )}
            </CardContent>
          </Card>
          
          {result && (
            <Card className={`border-2 ${result.is_valid ? 'border-green-200' : 'border-red-200'}`}>
              <CardHeader className={`${result.is_valid ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex items-center gap-2">
                  {result.is_valid ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600" />
                  )}
                  <CardTitle>
                    {result.is_valid ? 'Certificate is Valid' : 'Certificate is Invalid'}
                  </CardTitle>
                </div>
                <CardDescription>
                  {result.is_valid
                    ? 'This certificate is authentic and was issued by International Inspection Centre Co. W.L.L.'
                    : result.error_message || 'This certificate could not be verified.'}
                </CardDescription>
              </CardHeader>
              
              {result.is_valid && (
                <CardContent className="pt-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-3">Certificate Details</h3>
                      <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                            <p className="text-sm font-medium">Course</p>
                            <p className="text-sm text-muted-foreground">{result.course_title || 'Unnamed Course'}</p>
                        </div>
                    </div>
                        
                        <div className="flex items-start gap-3">
                          <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Training Date</p>
                            <p className="text-sm text-muted-foreground">{result.training_date}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Valid Until</p>
                            <p className="text-sm text-muted-foreground">{result.expiry_date}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Registration Number</p>
                            <p className="text-sm text-muted-foreground">{result.registration_number}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-3">Trainee Information</h3>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Name</p>
                            <p className="text-sm text-muted-foreground">{result.trainee_name}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Civil ID</p>
                            <p className="text-sm text-muted-foreground">{result.trainee_id}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Company</p>
                            <p className="text-sm text-muted-foreground">{result.company_name}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
              
              <CardFooter className={`border-t ${result.is_valid ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex justify-between items-center w-full py-2">
                  <div className="text-sm text-muted-foreground">
                    Certificate ID: <span className="font-mono">{certificateId}</span>
                  </div>
                  
                  {result.is_valid && (
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download Certificate
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          )}
          
          <div className="mt-12 text-center text-sm text-muted-foreground">
            <p>
              For additional verification or inquiries, please contact our certification department at{' '}
              <a href="mailto:certificates@intrex.com" className="text-primary hover:underline">
                certificates@intrex.com
              </a>
            </p>
          </div>
        </div>
      </main>
      
      <footer className="bg-white border-t py-6">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Image 
                src="/intrex-logo.png" 
                alt="INTREX Logo" 
                width={30} 
                height={30} 
              />
              <span className="text-sm font-medium">International Inspection Centre Co. W.L.L.</span>
            </div>
            
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} CertiTrack. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}