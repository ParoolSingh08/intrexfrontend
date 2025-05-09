// app/certificates/page.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  Search, 
  ArrowRight, 
  Download, 
  FileText,
  Shield,
  QrCode,
  Users,
  Printer,
  Share2,
  Database,
  Clock,
  Lock
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

export default function CertificateLandingPage() {
  const router = useRouter()
  const [certificateId, setCertificateId] = useState('')
  
  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault()
    if (certificateId.trim()) {
      router.push(`/verify-certificate?certId=${certificateId}`)
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/50 to-white">
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
                <Link href="/verify-certificate" className="text-sm text-muted-foreground hover:text-foreground">
                  Verify Certificate
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="text-sm font-medium">
                  Login
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      
      <main>
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="lg:w-1/2">
                <Badge className="mb-4" variant="outline">Training Management System</Badge>
                <h1 className="text-4xl font-bold tracking-tight mb-4">
                  Secure Digital Certificates for Your Training Programs
                </h1>
                <p className="text-xl text-muted-foreground mb-8">
                  CertiTrack provides a comprehensive solution for managing, issuing, and verifying training certificates with enhanced security features.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" asChild>
                    <Link href="/auth/login">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/verify-certificate">
                      Verify a Certificate
                      <CheckCircle className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              
              <div className="lg:w-1/2">
                <Image 
                  src="/certificate-sample.png"
                  alt="Certificate Sample"
                  width={600}
                  height={400}
                  className="rounded-lg shadow-2xl border"
                />
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-20 bg-muted/30 px-4">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Comprehensive Certificate Management</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                CertiTrack offers a complete suite of features for creating, managing, and verifying training certificates.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Secure Certificates</CardTitle>
                  <CardDescription>
                    Tamper-proof digital certificates with unique identification numbers and security features.
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                    <QrCode className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>QR Code Verification</CardTitle>
                  <CardDescription>
                    Each certificate includes a QR code for instant verification of authenticity.
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Trainee Management</CardTitle>
                  <CardDescription>
                    Comprehensive trainee database with certificate history and training records.
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                    <Printer className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Print & Download</CardTitle>
                  <CardDescription>
                    Generate high-quality PDF certificates ready for printing or digital distribution.
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                    <Share2 className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Shareable Links</CardTitle>
                  <CardDescription>
                    Create shareable verification links that allow stakeholders to verify certificates.
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                    <Database className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Certificate Repository</CardTitle>
                  <CardDescription>
                    Centralized storage of all certificates with powerful search and filtering capabilities.
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Expiry Management</CardTitle>
                  <CardDescription>
                    Track certificate expirations and send automatic notifications for renewals.
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                    <Lock className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Certificate Revocation</CardTitle>
                  <CardDescription>
                    Ability to revoke certificates when necessary with complete audit trail.
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Custom Templates</CardTitle>
                  <CardDescription>
                    Create customized certificate templates with your organization's branding.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>
        
        {/* Verification Search Bar */}
        <section className="py-20 px-4">
          <div className="container max-w-3xl">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-4">Verify a Certificate</h2>
              <p className="text-lg text-muted-foreground">
                Enter the certificate ID to instantly verify its authenticity
              </p>
            </div>
            
            <Card>
              <CardContent className="pt-6">
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
                  <Button type="submit">
                    Verify
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
        
        {/* Call to Action */}
        <section className="py-20 bg-primary text-primary-foreground px-4">
          <div className="container text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Modernize Your Certificate Management?</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
              Join organizations worldwide using CertiTrack to issue secure, verifiable digital certificates.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/auth/login">
                Get Started Today
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      
      <footer className="bg-white border-t py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Image 
                  src="/intrex-logo.png" 
                  alt="INTREX Logo" 
                  width={30} 
                  height={30} 
                />
                <h3 className="font-bold">CertiTrack</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Secure digital certificates for training and certification programs.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">Features</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">Pricing</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">Testimonials</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">FAQ</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">Documentation</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">Support</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">API Access</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">Blog</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">About Us</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">Careers</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">Contact</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground mb-4 sm:mb-0">
              © {new Date().getFullYear()} International Inspection Centre Co. W.L.L. All rights reserved.
            </p>
            
            <div className="flex gap-6">
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 16h-2v-6h2v6zm-1-6.891c-.607 0-1.1-.496-1.1-1.109 0-.612.492-1.109 1.1-1.109s1.1.497 1.1 1.109c0 .613-.493 1.109-1.1 1.109zm8 6.891h-1.998v-2.861c0-1.881-2.002-1.722-2.002 0v2.861h-2v-6h2v1.093c.872-1.616 4-1.736 4 1.548v3.359z" />
                </svg>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}