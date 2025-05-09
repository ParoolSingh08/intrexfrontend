// app/dashboard/certificates/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { 
  Download, 
  Search, 
  FileText, 
  User, 
  Calendar, 
  CheckCircle, 
  XCircle,
  Loader2,
  Plus,
  AlertCircle,
  Ban,
  Printer,
  RefreshCw,
  Share2
} from 'lucide-react'
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

interface Trainee {
  id: number
  name: string
  civil_id: string
  company_name: string
  photo_path: string | null
  training_completion_date: string | null
  training_registration_id: number | null
}

interface Registration {
  id: number
  registration_number: string
  status: string
  customer: {
    name: string
  }
  training_course: {
    title: string
  }
}

export default function CertificatesPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [trainees, setTrainees] = useState<Trainee[]>([])
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [activeTab, setActiveTab] = useState('all')
  
  const [selectedTrainee, setSelectedTrainee] = useState<number | null>(null)
  const [selectedRegistration, setSelectedRegistration] = useState<number | null>(null)
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null)
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false)
  const [revocationReason, setRevocationReason] = useState('')
  const [isRevoking, setIsRevoking] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [certificateStats, setCertificateStats] = useState({
    total: 0,
    valid: 0,
    expired: 0,
    revoked: 0,
    this_month: 0
  })
  
  // Fetch certificates
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
        
        // Fetch certificates from API
        const response = await axios.get(`${API_URL}/certificates/`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        
        setCertificates(response.data)
        
        // Fetch certificate stats
        try {
          const statsResponse = await axios.get(`${API_URL}/certificates/stats/counts`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          
          setCertificateStats(statsResponse.data)
        } catch (statsError) {
          console.error('Error fetching certificate stats:', statsError)
        }
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
  
  // Fetch trainees and registrations for certificate generation
  useEffect(() => {
    const fetchTraineesAndRegistrations = async () => {
      try {
        // Get the auth token
        const token = localStorage.getItem('token')
        if (!token) return
        
        // Fetch trainees
        const traineesResponse = await axios.get(`${API_URL}/trainees/`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        
        // Fetch registrations
        const registrationsResponse = await axios.get(`${API_URL}/training-registrations/`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        
        setTrainees(traineesResponse.data)
        setRegistrations(registrationsResponse.data)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    
    fetchTraineesAndRegistrations()
  }, [])
  
  // Filter certificates based on search and active tab
   const filteredCertificates = certificates.filter(cert => {
    // First filter by tab
    if (activeTab === 'valid' && (cert.is_revoked || (cert.expiry_date && new Date(cert.expiry_date) < new Date()))) {
      return false
    }
    
    if (activeTab === 'expired' && (!cert.expiry_date || new Date(cert.expiry_date) >= new Date() || cert.is_revoked)) {
      return false
    }
    
    if (activeTab === 'revoked' && !cert.is_revoked) {
      return false
    }
    
    // Then filter by search
    if (searchQuery.trim() === '') return true
    
    const trainee = trainees.find(t => t.id === cert.trainee_id)
    const registration = registrations.find(r => r.id === cert.registration_id)
    
    // Search by certificate ID, trainee name, or course title
    return (
        cert.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (trainee && trainee.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (registration?.training_course?.title.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    })
  
  // Generate certificate
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
      
      // Add new certificate to the list
      setCertificates(prev => [response.data, ...prev])
      
      // Refresh certificate stats
      try {
        const statsResponse = await axios.get(`${API_URL}/certificates/stats/counts`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        
        setCertificateStats(statsResponse.data)
      } catch (statsError) {
        console.error('Error fetching certificate stats:', statsError)
      }
      
      toast({
        title: "Success",
        description: "Certificate generated successfully",
      })
      
      // Close dialog and reset form
      setGenerateDialogOpen(false)
      setSelectedTrainee(null)
      setSelectedRegistration(null)
      
      // Open view dialog for the new certificate
      setSelectedCertificate(response.data)
      setViewDialogOpen(true)
    } catch (error) {
      console.error('Error generating certificate:', error)
      toast({
        title: "Error",
        description: "Failed to generate certificate",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }
  
  // Revoke certificate
  const handleRevokeCertificate = async () => {
    if (!selectedCertificate) return
    
    if (!revocationReason.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a reason for revocation",
        variant: "destructive"
      })
      return
    }
    
    try {
      setIsRevoking(true)
      
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
      
      // Make API call to revoke certificate
      await axios.put(
        `${API_URL}/certificates/${selectedCertificate.id}/revoke`,
        { reason: revocationReason },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      
      // Update certificate in the list
      setCertificates(prev => prev.map(cert => {
        if (cert.id === selectedCertificate.id) {
          return {
            ...cert,
            is_revoked: true,
            revocation_reason: revocationReason
          }
        }
        return cert
      }))
      
      // Refresh certificate stats
      try {
        const statsResponse = await axios.get(`${API_URL}/certificates/stats/counts`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        
        setCertificateStats(statsResponse.data)
      } catch (statsError) {
        console.error('Error fetching certificate stats:', statsError)
      }
      
      toast({
        title: "Success",
        description: "Certificate revoked successfully",
      })
      
      // Close dialogs and reset form
      setRevokeDialogOpen(false)
      setRevocationReason('')
      
      // Update the selected certificate
      setSelectedCertificate(prev => {
        if (prev) {
          return {
            ...prev,
            is_revoked: true,
            revocation_reason: revocationReason
          }
        }
        return null
      })
    } catch (error) {
      console.error('Error revoking certificate:', error)
      toast({
        title: "Error",
        description: "Failed to revoke certificate",
        variant: "destructive"
      })
    } finally {
      setIsRevoking(false)
    }
  }
  
  // Regenerate certificate
  const handleRegenerateCertificate = async () => {
    if (!selectedCertificate) return
    
    try {
      setIsRegenerating(true)
      
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
      
      // Make API call to regenerate certificate
      await axios.post(
        `${API_URL}/certificates/${selectedCertificate.id}/regenerate`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      
      toast({
        title: "Success",
        description: "Certificate regenerated successfully",
      })
      
      // Force reload the certificate view component
      setSelectedCertificate(null)
      setTimeout(() => {
        setSelectedCertificate(selectedCertificate)
      }, 100)
    } catch (error) {
      console.error('Error regenerating certificate:', error)
      toast({
        title: "Error",
        description: "Failed to regenerate certificate",
        variant: "destructive"
      })
    } finally {
      setIsRegenerating(false)
    }
  }
  
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
          title: "Verify Training Certificate",
          text: "Verify the authenticity of this training certificate",
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
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast({
        title: "Error",
        description: "Could not open print window. Please check your browser settings.",
        variant: "destructive"
      })
      return
    }
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Certificate Print</title>
          <style>
            body { margin: 0; padding: 0; }
            @media print {
              @page { size: landscape; }
            }
          </style>
        </head>
        <body>
          <div id="print-content"></div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 250);
            };
          </script>
        </body>
      </html>
    `)
    
    // Transfer certificate content to print window
    if (document.getElementById('certificate-print-content')) {
      const content = document.getElementById('certificate-print-content')?.innerHTML
      printWindow.document.getElementById('print-content')!.innerHTML = content || ''
    } else {
      printWindow.close()
      toast({
        title: "Error",
        description: "Certificate content not found for printing",
        variant: "destructive"
      })
    }
  }
  
  // View certificate details
  const handleViewCertificate = (certificate: Certificate) => {
    setSelectedCertificate(certificate)
    setViewDialogOpen(true)
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
  
  // Render registration select options
  const renderRegistrationOptions = () => {
    const completedRegistrations = registrations.filter(r => 
      r.status === 'Completed'
    )
    
    return completedRegistrations.map(reg => (
      <SelectItem key={reg.id} value={reg.id.toString()}>
        {reg.registration_number} - {reg.training_course.title}
      </SelectItem>
    ))
  }
  
  // Get trainee name by ID
  const getTraineeName = (traineeId: number) => {
    const trainee = trainees.find(t => t.id === traineeId)
    return trainee ? trainee.name : 'Unknown Trainee'
  }
  
  // Get registration details by ID
  const getRegistrationDetails = (registrationId: number): string => {
    const registration = registrations.find(r => r.id === registrationId)
    if (!registration) {
      return 'Unknown Registration'
    }
    const courseName = registration.training_course?.title || 'Unnamed Course'
    return `${registration.registration_number} - ${courseName}`
  }
  
  // Determine certificate status - FIXED HERE
  const getCertificateStatus = (certificate: Certificate) => {
    if (certificate.is_revoked) {
      return {
        label: 'Revoked',
        variant: 'destructive' as const,
        icon: <Ban className="h-4 w-4 mr-1" />
      }
    }
    
    if (certificate.expiry_date && new Date(certificate.expiry_date) < new Date()) {
      return {
        label: 'Expired',
        variant: 'outline' as const,
        icon: <AlertCircle className="h-4 w-4 mr-1" />
      }
    }
    
    return {
      label: 'Valid',
      // Fix: changed 'success' to a valid Badge variant
      variant: 'default' as const,
      icon: <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
    }
  }
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Certificates</h1>
          <p className="text-muted-foreground">Manage training certificates for trainees</p>
        </div>
        
        <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Generate Certificate
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Generate New Certificate</DialogTitle>
              <DialogDescription>
                Select a trainee and training registration to generate a certificate.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="registration" className="text-sm font-medium">
                  Training Registration
                </label>
                <Select
                  value={selectedRegistration?.toString() || ''}
                  onValueChange={(value) => setSelectedRegistration(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select training registration" />
                  </SelectTrigger>
                  <SelectContent>
                    {renderRegistrationOptions()}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="trainee" className="text-sm font-medium">
                  Trainee
                </label>
                <Select
                  value={selectedTrainee?.toString() || ''}
                  onValueChange={(value) => setSelectedTrainee(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select trainee" />
                  </SelectTrigger>
                  <SelectContent>
                    {renderTraineeOptions()}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setGenerateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleGenerateCertificate} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Certificates</p>
                <p className="text-3xl font-bold">{certificateStats.total}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <FileText className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valid Certificates</p>
                <p className="text-3xl font-bold">{certificateStats.valid}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expired Certificates</p>
                <p className="text-3xl font-bold">{certificateStats.expired}</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-full">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revoked Certificates</p>
                <p className="text-3xl font-bold">{certificateStats.revoked}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-full">
                <Ban className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Certificate List</CardTitle>
          <CardDescription>
            View and manage all certificates
          </CardDescription>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search certificates..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
              <TabsList className="grid grid-cols-4 w-full sm:w-[400px]">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="valid">Valid</TabsTrigger>
                <TabsTrigger value="expired">Expired</TabsTrigger>
                <TabsTrigger value="revoked">Revoked</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="h-96 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Certificate ID</TableHead>
                    <TableHead>Trainee</TableHead>
                    <TableHead>Training</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCertificates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No certificates found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCertificates.map((certificate) => {
                      const status = getCertificateStatus(certificate)
                      
                      return (
                        <TableRow key={certificate.id}>
                          <TableCell className="font-mono text-sm">{certificate.id}</TableCell>
                          <TableCell>{getTraineeName(certificate.trainee_id)}</TableCell>
                          <TableCell>{getRegistrationDetails(certificate.registration_id)}</TableCell>
                          <TableCell>{formatDate(certificate.issue_date)}</TableCell>
                          <TableCell>{certificate.expiry_date ? formatDate(certificate.expiry_date) : 'No Expiration'}</TableCell>
                          <TableCell>
                            <Badge variant={status.variant} className="flex items-center w-fit">
                              {status.icon}
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleViewCertificate(certificate)}
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDownloadCertificate(certificate.id)}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleShareCertificate(certificate.id)}
                              >
                                <Share2 className="h-4 w-4 mr-1" />
                                Share
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Showing {filteredCertificates.length} of {certificates.length} certificates
          </div>
        </CardFooter>
      </Card>
      
      {/* View Certificate Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Certificate Details</DialogTitle>
            <DialogDescription>
              View and manage certificate information
            </DialogDescription>
          </DialogHeader>
          
          {selectedCertificate && (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Certificate {selectedCertificate.id}</h3>
                  <p className="text-sm text-muted-foreground">
                    Issued on {formatDate(selectedCertificate.issue_date)}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  {getCertificateStatus(selectedCertificate).label === 'Valid' && (
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => {
                        setRevokeDialogOpen(true)
                      }}
                    >
                      <Ban className="h-4 w-4 mr-1" />
                      Revoke Certificate
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRegenerateCertificate()}
                    disabled={isRegenerating}
                  >
                    {isRegenerating ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-1" />
                    )}
                    Regenerate
                  </Button>
                </div>
              </div>
              
              {selectedCertificate.is_revoked && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                  <h4 className="text-sm font-medium flex items-center text-destructive">
                    <Ban className="h-4 w-4 mr-2" />
                    Certificate Revoked
                  </h4>
                  <p className="text-sm mt-1">
                    Reason: {selectedCertificate.revocation_reason || 'No reason provided'}
                  </p>
                </div>
              )}
              
              {selectedCertificate.expiry_date && new Date(selectedCertificate.expiry_date) < new Date() && !selectedCertificate.is_revoked && (
                <div className="bg-yellow-50 border border-yellow-100 rounded-md p-3">
                  <h4 className="text-sm font-medium flex items-center text-yellow-800">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Certificate Expired
                  </h4>
                  <p className="text-sm mt-1">
                    This certificate expired on {formatDate(selectedCertificate.expiry_date)}
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium mb-2">Trainee Information</h4>
                  <Card>
                    <CardContent className="pt-4">
                      <dl className="space-y-2">
                        <div>
                          <dt className="text-sm text-muted-foreground">Name</dt>
                          <dd className="font-medium">{getTraineeName(selectedCertificate.trainee_id)}</dd>
                        </div>
                        <div>
                          <dt className="text-sm text-muted-foreground">Training</dt>
                          <dd className="font-medium">{registrations.find(r => r.id === selectedCertificate.registration_id)?.training_course?.title || 'Unnamed Course'}</dd>
                        </div>
                        <div>
                          <dt className="text-sm text-muted-foreground">Expiry Date</dt>
                          <dd className="font-medium">
                            {selectedCertificate.expiry_date 
                              ? formatDate(selectedCertificate.expiry_date)
                              : 'No expiration date'}
                          </dd>
                        </div>
                      </dl>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Certificate Information</h4>
                  <Card>
                    <CardContent className="pt-4">
                      <dl className="space-y-2">
                        <div>
                          <dt className="text-sm text-muted-foreground">Certificate Number</dt>
                          <dd className="font-mono">{selectedCertificate.id}</dd>
                        </div>
                        <div>
                          <dt className="text-sm text-muted-foreground">Issue Date</dt>
                          <dd>{formatDate(selectedCertificate.issue_date)}</dd>
                        </div>
                        <div>
                          <dt className="text-sm text-muted-foreground">Status</dt>
                          <dd>
                            <Badge variant={getCertificateStatus(selectedCertificate).variant}>
                              {getCertificateStatus(selectedCertificate).label}
                            </Badge>
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm text-muted-foreground">Verification Link</dt>
                          <dd className="font-mono text-xs break-all">
                            {`${window.location.origin}/verify-certificate?certId=${selectedCertificate.id}`}
                          </dd>
                        </div>
                      </dl>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-4">Certificate Preview</h4>
                <div id="certificate-print-content">
                  {/* Render certificate preview */}
                  <CertificateGenerator 
                    trainingRegistrationId={selectedCertificate.registration_id} 
                    traineeId={selectedCertificate.trainee_id}
                  />
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex gap-2 sm:gap-0">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => handlePrintCertificate()}
                size="sm"
              >
                <Printer className="h-4 w-4 mr-1" />
                Print
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleShareCertificate(selectedCertificate?.id || '')}
                size="sm"
                disabled={!selectedCertificate}
              >
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                Close
              </Button>
              
              {selectedCertificate && (
                <Button 
                  onClick={() => handleDownloadCertificate(selectedCertificate.id)}
                  disabled={!selectedCertificate}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Revoke Certificate Dialog */}
      <Dialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke Certificate</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The certificate will be marked as revoked and will no longer be valid.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <label htmlFor="revocation-reason" className="text-sm font-medium">
              Reason for Revocation <span className="text-destructive">*</span>
            </label>
            <Textarea
              id="revocation-reason"
              placeholder="Please provide a reason for revoking this certificate"
              value={revocationReason}
              onChange={(e) => setRevocationReason(e.target.value)}
              className="mt-2"
              rows={4}
              required
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevokeDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRevokeCertificate}
              disabled={isRevoking || !revocationReason.trim()}
            >
              {isRevoking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Revoking...
                </>
              ) : (
                <>
                  <Ban className="mr-2 h-4 w-4" />
                  Revoke Certificate
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
 )
}