'use client'

import { ThemeProvider } from 'next-themes'
import { AuthProvider } from '@/lib/contexts/auth-context'
import { ReactNode } from 'react'
import { Toaster } from '@/components/ui/toaster'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        {children}
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  )
}