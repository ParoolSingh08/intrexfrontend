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
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null)

  // Import Google Fonts in useEffect
  useEffect(() => {
    // Add Imperial Script and Marck Script fonts
    const imperialLink = document.createElement('link');
    imperialLink.href = 'https://fonts.googleapis.com/css2?family=Imperial+Script&display=swap';
    imperialLink.rel = 'stylesheet';
    document.head.appendChild(imperialLink);
    
    const marckScriptLink = document.createElement('link');
    marckScriptLink.href = 'https://fonts.googleapis.com/css2?family=Marck+Script&display=swap';
    marckScriptLink.rel = 'stylesheet';
    document.head.appendChild(marckScriptLink);
    
    return () => {
      document.head.removeChild(imperialLink);
      document.head.removeChild(marckScriptLink);
    };
  }, []);

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

  // Format to sentence case
  const toSentenceCase = (text: string): string => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
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
        
        // If trainee has a photo, fetch it and convert to Data URL for PDF
        if (traineeResponse.data.photo_path) {
          try {
            const photoResponse = await axios.get(`${API_URL}/${traineeResponse.data.photo_path}`, {
              headers: {
                Authorization: `Bearer ${token}`
              },
              responseType: 'blob'
            });
            
            const reader = new FileReader();
            reader.onloadend = () => {
              setPhotoDataUrl(reader.result as string);
            };
            reader.readAsDataURL(photoResponse.data);
          } catch (photoError) {
            console.error('Error fetching trainee photo:', photoError);
          }
        }
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
      
      // Convert certificate div to canvas with better image handling
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        imageTimeout: 15000, // Longer timeout for images
        logging: true // Enable logging to debug image issues
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
      
      // Save PDF with certificate ID as filename
      const fileName = `${certNumber}.pdf`
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
      printWindow.document.write('<link href="https://fonts.googleapis.com/css2?family=Imperial+Script&family=Marck+Script&display=swap" rel="stylesheet">')
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

  // Imperial Script font style for title
  const imperialStyle = { 
    fontFamily: "'Imperial Script', cursive", 
    fontWeight: 700,
    color: "#000"
  }
  
  // Marck Script font style for other text
  const marckScriptStyle = { 
    fontFamily: "'Marck Script', cursive", 
    fontWeight: 500,
    lineHeight: 1 // Tightest line spacing
  }

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
            className="relative w-full aspect-[1.414/1] overflow-hidden"
            style={{ 
              backgroundImage: "url('/background.png')",
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
          >
            {/* Certificate Title - moved down 0.5cm with increased spacing after */}
            <div className="text-center pt-32">
              <h1 
                className="text-5xl"
                style={imperialStyle}
              >
                {toSentenceCase("certificate of training")}
              </h1>
              <p className="text-2xl mt-4" style={marckScriptStyle}>
                {toSentenceCase("proudly presented to")}
              </p>
            </div>
            
            {/* Added 2mm (approximately 8px) spacing after "Proudly presented to" */}
            <div className="h-[8px]"></div>
            
            {/* Trainee Photo and Information */}
            <div className="flex flex-col items-center">
              {/* Photo box - using data URL for better PDF compatibility */}
              <div className="w-[68px] h-[68px] border-2 border-gray-300 flex items-center justify-center bg-gray-50">
                {photoDataUrl ? (
                  <img 
                    src={photoDataUrl} 
                    alt="Trainee" 
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                  />
                ) : trainee.photo_path ? (
                  <div 
                    className="w-full h-full bg-cover bg-center" 
                    style={{ 
                      backgroundImage: `url(${API_URL}/${trainee.photo_path})`,
                      backgroundRepeat: 'no-repeat'
                    }}
                  ></div>
                ) : (
                  <span className="text-sm text-center text-gray-500">Photo</span>
                )}
              </div>
              
              {/* Trainee name and details - reduced spacing */}
              <div className="text-center -mt-1" style={marckScriptStyle}>
                <h2 className="text-3xl">
                  {`Mr. ${trainee.name} (${trainee.civil_id})`}
                </h2>
                <p className="text-2xl -mt-2">
                  {`of ${toSentenceCase(trainee.company_name)}`}
                </p>
                
                {/* Container for is trained text */}
                <div>
                  <p className="text-2xl mt-1 leading-none">
                    {toSentenceCase(`is trained, assessed & certified in ${registration?.training_course?.title || 'unnamed course'}`)} on {formatDate(trainee.training_completion_date || registration.training_date)}
                  </p>
                  
                  {/* Pull up this line by 2mm (negative margin of about -8px) */}
                  <p className="text-2xl leading-none -mt-[8px]">
                    {toSentenceCase("this certificate is valid up to")} {formatDate(trainee.certificate_validation_date || calculateValidationDate())}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Signature and QR section - aligned to the same height */}
            <div className="absolute bottom-32 left-0 right-0 flex justify-between px-16">
              {/* Left signature with image */}
              <div className="text-center w-64">
                <div className="h-16 flex items-center justify-center">
                  <img 
                    src="/signature1.png" 
                    alt="Official Signature" 
                    className="h-10 object-contain"
                    crossOrigin="anonymous"
                  />
                </div>
                <div className="w-full border-t border-black"></div>
                <p className="text-lg" style={marckScriptStyle}>{toSentenceCase("intrex official's name")}</p>
              </div>
              
              {/* QR Code - smaller size */}
              <div className="flex flex-col items-center justify-center">
                <QRCode value={verificationUrl} size={70} />
                <p className="text-sm mt-1 text-center" style={marckScriptStyle}>
                  {toSentenceCase("certificate no")}: {certNumber}
                </p>
              </div>
              
              {/* Right signature with image */}
              <div className="text-center w-64">
                <div className="h-16 flex items-center justify-center">
                  <img 
                    src="/signature2.png" 
                    alt="Instructor Signature" 
                    className="h-10 object-contain"
                    crossOrigin="anonymous"
                  />
                </div>
                <div className="w-full border-t border-black"></div>
                <p className="text-lg" style={marckScriptStyle}>{toSentenceCase("instructor name")}</p>
              </div>
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