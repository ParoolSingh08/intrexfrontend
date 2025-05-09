// app/dashboard/trainee/certificates/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  Download, 
  Search, 
  FileText, 
  Calendar, 
  CheckCircle, 
  XCircle,
  Loader2,
  Share2,
  Printer,
  ExternalLink
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import axios from 'axios'
import { formatDate } from '@/lib/utils'
import { CertificateGenerator } from '@/components/certificate/certificate-generator'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface Certificate {
  id: string
  trainee_id: number
  registration_id: number
  issue_date: string
  expiry_date: string | null
  is_revoked: boolean
  revocation_reason: string | null
}

interface TrainingCourse {
  id: number
  title: string
  description: string
}

export default function TraineeCertificatesPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null)
  const [courses, setCourses] = useState<Record<number, TrainingCourse>>({})
  
  // Fetch trainee's certificates
  useEffect(() => {
    const fetchCertificates = async () => {
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
        
        // Get current user info to get trainee_id
        const userResponse = await axios.get(`${API_URL}/users/me/`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        
        const userId = userResponse.data.id
        
        // Get trainee profile for this user
        const traineeResponse = await axios.get(`${API_URL}/trainees/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        
        const traineeId = traineeResponse.data.id
        
        // Fetch certificates for this trainee
        const certificatesResponse = await axios.get(`${API_URL}/certificates/`, {
          params: {
            trainee_id: traineeId
          },
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        
        setCertificates(certificatesResponse.data)
        
        const registrationIdsWithDuplicates = certificatesResponse.data.map((cert: Certificate) => cert.registration_id);
        const registrationIds = Array.from(new Set(registrationIdsWithDuplicates));
        
        // For each registration, get the course info
        const courseData: Record<number, TrainingCourse> = {}
        
        for (const regId of registrationIds) {
          const regResponse = await axios.get(`${API_URL}/training-registrations/${regId}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          
          // Store course info keyed by registration ID for easy lookup
          // Additional type safety (if needed):
        courseData[regId as number] = regResponse.data.training_course;
        }
        
        setCourses(courseData)
      } catch (error) {
        console.error('Error fetching certificates:', error)
        toast({
          title: "Error",
          description: "Failed to load certificates",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchCertificates()
  }, [router, toast])
  
  // Filter certificates based on search
  const filteredCertificates = certificates.filter(cert => {
    if (searchQuery.trim() === '') return true
    
    const courseTitle = courses[cert.registration_id]?.title || ''
    
    return (
      cert.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      courseTitle.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })
  
  // Download certificate
  const handleDownloadCertificate = async (certificateId: string) => {
    try {
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
      
      // Make API call to download certificate
      const response = await axios.get(
        `${API_URL}/certificates/${certificateId}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          responseType: 'blob'
        }
      )
      
      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `Certificate_${certificateId}.pdf`)
      document.body.appendChild(link)
      link.click()
      
      // Clean up
      window.URL.revokeObjectURL(url)
      document.body.removeChild(link)
      
      toast({
        title: "Success",
        description: "Certificate downloaded successfully",
      })
    } catch (error) {
      console.error('Error downloading certificate:', error)
      toast({
        title: "Error",
        description: "Failed to download certificate",
        variant: "destructive"
      })
    }
  }
  
  // Share certificate
  const handleShareCertificate = async (certificateId: string) => {
    try {
      const shareUrl = `${window.location.origin}/verify-certificate?certId=${certificateId}`
      
      if (navigator.share) {
        await navigator.share({
          title: "Training Certificate",
          text: "Verify my training certificate",
          url: shareUrl
        })
      } else {
        // Fallback to copying to clipboard
        await navigator.clipboard.writeText(shareUrl)
        toast({
          title: "Link Copied",
          description: "Certificate verification link copied to clipboard",
        })
      }
    } catch (error) {
      console.error('Error sharing certificate:', error)
      toast({
        title: "Error",
        description: "Failed to share certificate",
        variant: "destructive"
      })
    }
  }
  
  // Print certificate
  const handlePrintCertificate = () => {
    if (!selectedCertificate) return
    
    window.print()
  }
  
  // View certificate details
  const handleViewCertificate = (certificate: Certificate) => {
    setSelectedCertificate(certificate)
  }
  
  // Determine certificate status - FIXED: Changed invalid 'success' variant to 'default'
  const getCertificateStatus = (certificate: Certificate) => {
    if (certificate.is_revoked) {
      return {
        label: 'Revoked',
        variant: 'destructive' as const,
        icon: <XCircle className="h-4 w-4 mr-1" />
      }
    }
    
    if (certificate.expiry_date && new Date(certificate.expiry_date) < new Date()) {
      return {
        label: 'Expired',
        variant: 'outline' as const,
        icon: <Calendar className="h-4 w-4 mr-1" />
      }
    }
    
    return {
      label: 'Valid',
      variant: 'default' as const, // Changed from 'success' to 'default'
      icon: <CheckCircle className="h-4 w-4 mr-1 text-green-600" /> // Added text color
    }
  }
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Certificates</h1>
          <p className="text-muted-foreground">View and manage your training certificates</p>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search certificates..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {isLoading ? (
        <div className="h-96 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredCertificates.length === 0 ? (
        <Card>
          <CardContent className="py-16 flex flex-col items-center justify-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No Certificates Found</h3>
            {searchQuery ? (
              <p className="text-muted-foreground mb-6">
                No certificates match your search. Try a different search term.
              </p>
            ) : (
              <p className="text-muted-foreground mb-6">
                You don't have any certificates yet. Complete a training course to receive a certificate.
              </p>
            )}
            
            <Button variant="outline" onClick={() => setSearchQuery('')}>
              {searchQuery ? 'Clear Search' : 'View All Courses'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCertificates.map((certificate) => {
            const status = getCertificateStatus(certificate)
            const course = courses[certificate.registration_id]
            
            return (
              <Card key={certificate.id} className="overflow-hidden border-2 hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{course?.title || 'Training Certificate'}</CardTitle>
                  <CardDescription className="line-clamp-1">{course?.description || 'Certificate of completion'}</CardDescription>
                </CardHeader>
                
                <CardContent className="pb-0">
                  <div className="h-48 bg-muted/30 rounded-md flex items-center justify-center mb-4 relative">
                    <FileText className="h-20 w-20 text-muted-foreground opacity-50" />
                    <Button 
                      variant="secondary" 
                      size="sm"
                      className="absolute bottom-4 right-4"
                      onClick={() => handleViewCertificate(certificate)}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Issue Date:</span>
                      <span className="text-sm">{formatDate(certificate.issue_date)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Expiry Date:</span>
                      <span className="text-sm">{certificate.expiry_date ? formatDate(certificate.expiry_date) : 'No Expiration'}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Certificate ID:</span>
                      <span className="text-sm font-mono truncate max-w-[150px]" title={certificate.id}>
                        {certificate.id}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <Badge variant={status.variant} className="flex items-center">
                        {status.icon}
                        {status.label}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-between items-center mt-4 pt-4 border-t">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleShareCertificate(certificate.id)}
                  >
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDownloadCertificate(certificate.id)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
      
      {selectedCertificate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-medium">Certificate Details</h3>
              
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => window.open(`/verify-certificate?certId=${selectedCertificate.id}`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Verify
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handlePrintCertificate}
                >
                  <Printer className="h-4 w-4 mr-1" />
                  Print
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleShareCertificate(selectedCertificate.id)}
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleDownloadCertificate(selectedCertificate.id)}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedCertificate(null)}
                >
                  &times;
                </Button>
              </div>
            </div>
            
            <div className="p-6">
              <CertificateGenerator 
                trainingRegistrationId={selectedCertificate.registration_id} 
                traineeId={selectedCertificate.trainee_id}
              />
            </div>
            
            <div className="sticky bottom-0 bg-white p-4 border-t flex justify-end">
              <Button 
                variant="outline"
                onClick={() => setSelectedCertificate(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}