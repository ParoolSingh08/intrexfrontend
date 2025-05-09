'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/contexts/auth-context'
import { Sidebar } from '@/components/ui/sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, isLoading, checkAuth } = useAuth()
  const [authChecked, setAuthChecked] = useState(false)
  
  // Use a ref to prevent multiple auth checks
  const authCheckInitiated = useRef(false)
  
  useEffect(() => {
    // Skip if already loading, already checked, or check already initiated
    if (isLoading || authChecked || authCheckInitiated.current) return
    
    const verifyAuth = async () => {
      try {
        authCheckInitiated.current = true
        const isAuthenticated = await checkAuth()
        
        if (!isAuthenticated) {
          router.push('/auth/login')
        }
      } catch (error) {
        console.error("Authentication check failed:", error)
        router.push('/auth/login')
      } finally {
        setAuthChecked(true)
      }
    }
    
    if (!user) {
      verifyAuth()
    } else {
      setAuthChecked(true)
    }
  }, [router, checkAuth, user, authChecked, isLoading])
  
  // Handle rendering states
  if (isLoading || !authChecked) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }
  
  // If authentication is checked and no user, redirect (with loading indicator)
  if (!user) {
    // No need to show loading here for a moment before redirect
    // The first useEffect will handle the redirection
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }
  
  // User is authenticated, render dashboard
  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-background">
        {children}
      </main>
    </div>
  )
}