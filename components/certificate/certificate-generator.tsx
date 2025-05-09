// components/certificate/certificate-generator.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Download, Printer, Share2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import QRCode from 'react-qr-code';
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface CertificateGeneratorProps {
  trainingRegistrationId: number
  traineeId: number
}

interface TraineeData {
  id: number
  name: string
  civil_id: string
  company_name: string
  photo_path: string | null
  training_completion_date: string | null
  certificate_validation_date: string | null
}

interface RegistrationData {
  id: number
  registration_number: string
  customer: {
    name: string
  }
  training_course: {
    title: string
  }
  training_date: string
  training_certification: {
    validity_days: number
    name: string
  } | null
}

export function CertificateGenerator({ trainingRegistrationId, traineeId }: CertificateGeneratorProps) {
  const [trainee, setTrainee] = useState<TraineeData | null>(null)
  const [registration, setRegistration] = useState<RegistrationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const certificateRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const [certNumber, setCertNumber] = useState('')

  // Calculate certificate validation date based on completion date and validity days
  const calculateValidationDate = () => {
    if (!trainee?.training_completion_date || !registration?.training_certification?.validity_days) {
      return null
    }

    const completionDate = new Date(trainee.training_completion_date)
    const validationDate = new Date(completionDate)
    validationDate.setDate(validationDate.getDate() + registration.training_certification.validity_days)
    
    return validationDate.toISOString().split('T')[0]
  }

  // Format date to DD-MM-YYYY
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    
    const date = new Date(dateString)
    return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`
  }

  // Generate a unique certificate number
  const generateCertificateNumber = () => {
    if (!registration || !trainee) return ''
    
    const regNumber = registration.registration_number.replace('TR-', '')
    const randomId = Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
    return `IICTCM${regNumber}-${trainee.id}-${randomId}`
  }

  // Fetch trainee and registration data
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
          return
        }
        
        // Fetch trainee data
        const traineeResponse = await axios.get(`${API_URL}/trainees/${traineeId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        
        // Fetch registration data
        const registrationResponse = await axios.get(`${API_URL}/training-registrations/${trainingRegistrationId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        
        setTrainee(traineeResponse.data)
        setRegistration(registrationResponse.data)
        
        // Generate certificate number
        const certNum = `IICTCM${registrationResponse.data.registration_number.replace('TR-', '')}-${traineeId}-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`
        setCertNumber(certNum)
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          title: "Error",
          description: "Failed to fetch certificate data",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [trainingRegistrationId, traineeId, toast])

  // Generate and download certificate as PDF
  const generatePDF = async () => {
    if (!certificateRef.current) return
    
    try {
      setIsGenerating(true)
      
      // Convert certificate div to canvas
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      })
      
      // Create PDF
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      })
      
      // Calculate aspect ratio
      const imgWidth = 297 // A4 width in landscape
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
      
      // Save PDF
      const fileName = `${trainee?.name.replace(/\s+/g, '_')}_Certificate_${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(fileName)
      
      toast({
        title: "Success",
        description: "Certificate downloaded successfully",
      })
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast({
        title: "Error",
        description: "Failed to generate certificate PDF",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Print certificate
  const printCertificate = () => {
    if (!certificateRef.current) return
    
    try {
      const content = certificateRef.current
      const printWindow = window.open('', '', 'height=650,width=900')
      
      if (!printWindow) {
        toast({
          title: "Error",
          description: "Unable to open print window. Please check your popup settings.",
          variant: "destructive"
        })
        return
      }
      
      printWindow.document.write('<html><head><title>Certificate</title>')
      printWindow.document.write('<style>body { margin: 0; padding: 20px; }</style>')
      printWindow.document.write('</head><body>')
      printWindow.document.write(content.outerHTML)
      printWindow.document.write('</body></html>')
      printWindow.document.close()
      printWindow.focus()
      
      // Wait for images to load before printing
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 500)
    } catch (error) {
      console.error('Error printing certificate:', error)
      toast({
        title: "Error",
        description: "Failed to print certificate",
        variant: "destructive"
      })
    }
  }

  // Share certificate link
  const shareCertificate = async () => {
    try {
      // Create a share link (in a real app, this would link to a publicly accessible certificate)
      const shareUrl = `${window.location.origin}/certificates/verify/${certNumber}`
      
      if (navigator.share) {
        await navigator.share({
          title: `${trainee?.name}'s Training Certificate`,
          text: `View ${trainee?.name}'s training certificate for ${registration?.training_course.title}`,
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!trainee || !registration) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-muted-foreground">Certificate data not available</p>
      </div>
    )
  }

  // Certificate verification URL
  const verificationUrl = `${window.location.origin}/certificates/verify/${certNumber}`

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Training Certificate</h2>
        <div className="flex gap-2">
          <Button onClick={generatePDF} disabled={isGenerating}>
            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Download PDF
          </Button>
          <Button variant="outline" onClick={printCertificate}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" onClick={shareCertificate}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>
      
      <Card className="border-2">
        <CardContent className="p-0">
          <div 
            ref={certificateRef} 
            className="relative w-full aspect-[1.414/1] bg-white overflow-hidden"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            {/* Watermark Logo */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
              <img 
                src="/intrex-logo.png" 
                alt="Watermark" 
                className="w-2/3 h-2/3 object-contain"
              />
            </div>
            
            {/* Certificate Header */}
            <div className="flex justify-between items-start p-8">
              <div className="flex flex-col">
                <h2 className="text-xl font-bold uppercase">
                  INTERNATIONAL INSPECTION
                </h2>
                <h2 className="text-xl font-bold uppercase">
                  CENTRE CO. W.L.L.
                </h2>
                <div className="w-full h-1 bg-yellow-400 mt-1"></div>
              </div>
              
              <img 
                src="/intrex-logo.png" 
                alt="Company Logo" 
                className="h-16 w-auto"
              />
              
              <div className="flex flex-col items-end">
                <h2 className="text-xl font-bold text-right" dir="rtl" lang="ar">
                  شركة المركز الدولي
                </h2>
                <h2 className="text-xl font-bold text-right" dir="rtl" lang="ar">
                  للمسح والتفتيش ذ. م. م
                </h2>
                <div className="w-full h-1 bg-yellow-400 mt-1"></div>
              </div>
            </div>
            
            {/* Certificate Title */}
            <div className="text-center mt-6">
              <h1 className="text-4xl font-bold italic">CERTIFICATE OF TRAINING</h1>
              <p className="text-xl italic mt-2">Proudly Presented to</p>
            </div>
            
            {/* Trainee Photo and Information */}
            <div className="flex flex-col items-center mt-4">
              <div className="w-24 h-32 border border-gray-300 flex items-center justify-center bg-gray-100 mb-4">
                {trainee.photo_path ? (
                  <img 
                    src={`${API_URL}/${trainee.photo_path}`} 
                    alt="Trainee" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm text-center text-gray-500">PHOTO</span>
                )}
              </div>
              
              <h2 className="text-2xl font-bold italic">
                Mr. {trainee.name} ({trainee.civil_id})
              </h2>
              <p className="text-xl italic mt-2">
                of {trainee.company_name}
              </p>
              
              <p className="text-xl italic mt-4">
                is trained, assessed & certified in <span className="font-semibold">{registration?.training_course?.title || 'Unnamed Course'}</span> on {formatDate(trainee.training_completion_date || registration.training_date)}
              </p>
              
              <p className="text-xl italic mt-2">
                This certificate is valid up to {formatDate(trainee.certificate_validation_date || calculateValidationDate())}
              </p>
            </div>
            
            {/* Signatures */}
            <div className="flex justify-between px-20 mt-12">
              <div className="text-center w-64">
                <p className="text-sm italic">&lt;&lt; Signature &gt;&gt;</p>
                <div className="border-t border-black mt-2"></div>
                <p className="mt-1">INTREX Official's Name</p>
                <p className="text-sm">For and on behalf of INTREX</p>
              </div>
              
              <div className="text-center w-64">
                <p className="text-sm italic">&lt;&lt; Signature &gt;&gt;</p>
                <div className="border-t border-black mt-2"></div>
                <p className="mt-1">Instructor Name</p>
                <p className="text-sm">Instructor</p>
              </div>
            </div>
            
            {/* QR Code and Certificate Number */}
            <div className="absolute bottom-16 right-8">
              <QRCode value={verificationUrl} size={80} />
              <p className="text-xs mt-1 text-center">Certificate No. {certNumber}</p>
            </div>
            
            {/* Footer with accreditation logos */}
            <div className="absolute bottom-0 left-0 right-0">
              <div className="flex justify-center items-center bg-white">
                <img 
                  src="/accreditation-logos.png" 
                  alt="Accreditation Logos" 
                  className="h-12 object-contain"
                />
              </div>
              <div className="h-6 bg-yellow-400"></div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-sm text-muted-foreground">
        <p>Certificate verification URL: {verificationUrl}</p>
        <p className="mt-1">Certificate Number: {certNumber}</p>
      </div>
    </div>
  )
}