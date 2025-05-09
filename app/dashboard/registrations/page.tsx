'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function RegistrationsRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to the registrations list view
    router.push('/dashboard/registrations/list')
  }, [router])
  
  return (
    <div className="h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2">Redirecting to registrations list...</span>
    </div>
  )
}