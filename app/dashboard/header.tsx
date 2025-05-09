// components/dashboard/header.tsx
'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Bell,
  Search,
  Mail,
  Calendar,
  LogOut,
  User,
  Settings,
  Moon,
  Sun
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme } from 'next-themes'

export function Header() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { setTheme, theme } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  
  // Convert pathname to breadcrumb-style title
  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Dashboard'
    
    const segments = pathname.split('/').filter(Boolean)
    if (segments.length < 2) return 'Dashboard'
    
    const page = segments[segments.length - 1]
    return page.charAt(0).toUpperCase() + page.slice(1)
  }
  
  return (
    <header className="border-b bg-background h-16 px-4 flex items-center justify-between">
      {/* Page title and breadcrumb */}
      <div>
        <h1 className="text-2xl font-medium text-primary">{getPageTitle()}</h1>
        <div className="flex items-center text-sm text-muted-foreground">
          <span>Dashboard</span>
          {pathname !== '/dashboard' && (
            <>
              <span className="mx-2">/</span>
              <span>{getPageTitle()}</span>
            </>
          )}
        </div>
      </div>
      
      {/* Search and action buttons */}
      <div className="flex items-center space-x-2">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search here..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Button variant="ghost" size="icon">
          <Bell size={20} />
        </Button>
        
        <Button variant="ghost" size="icon">
          <Mail size={20} />
        </Button>
        
        <Button variant="ghost" size="icon">
          <Calendar size={20} />
        </Button>
        
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </Button>
        
        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}