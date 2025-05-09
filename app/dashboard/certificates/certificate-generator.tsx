// components/certificate/certificate-generator.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Download, 
  Printer, 
  Share2, 
  Loader2,
  CheckCircle,
  RefreshCw
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import axios from 'axios'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import Image from 'next/image'
import QRCode from 'react-qr-code';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface CertificateGeneratorProps {
  trainingRegistrationId: number;
  traineeId: number;
}

interface TraineeData {
  id: number;
  name: string;
  civil_id: string;
  company_name: string;
  photo_path: string | null;
  training_completion_date: string | null;
  certificate_validation_date: string | null;
}

interface RegistrationData {
  id: number;
  registration_number: string;
  customer: {
    name: string;
  };
  training_course: {
    title: string;
  };
  training_date: string;
  training_certification?: {
    validity_days: number;
    name: string;
  } | null;
}

export function CertificateGenerator({ trainingRegistrationId, traineeId }: CertificateGeneratorProps) {
  const [trainee, setTrainee] = useState<TraineeData | null>(null)
  const [registration, setRegistration] = useState<RegistrationData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const certificateRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const [certNumber, setCertNumber] = useState<string>('')

  // Load trainee and registration data
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
        
        // Generate a sample certificate number for preview
        const regNumber = registrationResponse.data.registration_number.replace('TR-', '')
        const randomId = Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
        setCertNumber(`IICTCM${regNumber}-${traineeId}-${randomId}`)
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          title: "Error",
          description: "Failed to load certificate data",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    if (trainingRegistrationId && traineeId) {
      fetchData()
    }
  }, [trainingRegistrationId, traineeId, toast])

  // Format date as DD-MM-YYYY
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A'
    
    const date = new Date(dateString)
    return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`
  }

  // Calculate certificate validation date based on completion date and validity days
  const calculateValidationDate = (): string | null => {
    if (!trainee?.training_completion_date || !registration?.training_certification?.validity_days) {
      return null
    }

    const completionDate = new Date(trainee.training_completion_date)
    const validationDate = new Date(completionDate)
    validationDate.setDate(validationDate.getDate() + registration.training_certification.validity_days)
    
    return formatDate(validationDate.toISOString())
  }

  // Download certificate as PDF
  const handleDownload = async () => {
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

  // Share certificate as a link
  const handleShare = async () => {
    try {
      // Create a share link for verification
      const shareUrl = `${window.location.origin}/verify-certificate?certId=${certNumber}`
      
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

  // Print certificate
  const handlePrint = () => {
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
  const verificationUrl = `${window.location.origin}/verify-certificate?certId=${certNumber}`

  return (
    <div className="space-y-4">
      <div 
        ref={certificateRef} 
        className="relative w-full aspect-[1.414/1] bg-white overflow-hidden p-8 border rounded-lg shadow-sm"
        style={{ fontFamily: 'Times New Roman, serif' }}
      >
        {/* Watermark Logo */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
          <div className="w-2/3 h-2/3 bg-contain bg-center bg-no-repeat" style={{ backgroundImage: "url('/intrex-logo.png')" }} />
        </div>
        
        {/* Certificate Header */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <h2 className="text-lg font-bold uppercase">
              INTERNATIONAL INSPECTION
            </h2>
            <h2 className="text-lg font-bold uppercase">
              CENTRE CO. W.L.L.
            </h2>
            <div className="w-full h-1 bg-yellow-400 mt-1"></div>
          </div>
          
          <div className="h-16 w-16 bg-contain bg-center bg-no-repeat" style={{ backgroundImage: "url('/intrex-logo.png')" }} />
          
          <div className="flex flex-col items-end">
            <h2 className="text-lg font-bold text-right" dir="rtl" lang="ar">
              شركة المركز الدولي
            </h2>
            <h2 className="text-lg font-bold text-right" dir="rtl" lang="ar">
              للمسح والتفتيش ذ. م. م
            </h2>
            <div className="w-full h-1 bg-yellow-400 mt-1"></div>
          </div>
        </div>
        
        {/* Certificate Title */}
        <div className="text-center mt-6">
          <h1 className="text-3xl font-bold italic">CERTIFICATE OF TRAINING</h1>
          <p className="text-xl italic mt-2">Proudly Presented to</p>
        </div>
        
        {/* Trainee Photo and Information */}
        <div className="flex flex-col items-center mt-4">
          <div className="w-24 h-32 border border-gray-300 flex items-center justify-center bg-gray-100 mb-4">
            {trainee.photo_path ? (
              <div 
                className="w-full h-full bg-cover bg-center" 
                style={{ backgroundImage: `url(${API_URL}/${trainee.photo_path})` }}
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
            is trained, assessed & certified in <span className="font-semibold">{registration.training_course.title}</span> on {formatDate(trainee.training_completion_date || registration.training_date)}
          </p>
          
          <p className="text-xl italic mt-2">
            This certificate is valid up to {formatDate(trainee.certificate_validation_date || calculateValidationDate() || registration.training_date)}
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
          <div className="flex justify-center items-center h-12 bg-white">
            <div className="h-12 w-full bg-contain bg-center bg-no-repeat" style={{ backgroundImage: "url('/accreditation-logos.png')" }} />
          </div>
          <div className="h-6 bg-yellow-400"></div>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          <p>Certificate No: <span className="font-mono">{certNumber}</span></p>
          <p className="mt-1">Verification URL: <span className="font-mono text-xs">{verificationUrl}</span></p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button size="sm" onClick={handleDownload} disabled={isGenerating}>
            {isGenerating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Download
          </Button>
        </div>
      </div>
    </div>
  )
}