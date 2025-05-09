import type { Metadata, Viewport } from 'next'
import { Ubuntu } from 'next/font/google'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })
const ubuntu = Ubuntu({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  display: 'swap'
})

export const metadata: Metadata = {
  title: 'CertiTrack - Training Management System',
  description: 'Manage training registrations, courses, trainers, certifications, and certificates',
  keywords: 'training, certification, registration, management, certificate, courses, trainees',
  authors: [{ name: 'CertiTrack Team' }],
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  manifest: '/site.webmanifest',
}

// Separated viewport config from metadata
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Add preconnect for performance optimization */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Add needed third-party scripts */}
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"
          strategy="afterInteractive"
        />
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
          strategy="afterInteractive"
        />
      </head>
      <body className={ubuntu.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}