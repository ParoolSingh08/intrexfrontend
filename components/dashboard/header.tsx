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
  Sun,
  MessageCircle,
  Home,
  ChevronRight,
  BellDot,
  BookmarkIcon
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useTheme } from 'next-themes'
import Link from 'next/link'

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

  // Generate breadcrumbs
  const generateBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean)
    if (segments.length < 1) return []

    return segments.map((segment, index) => {
      const href = '/' + segments.slice(0, index + 1).join('/')
      return {
        title: segment.charAt(0).toUpperCase() + segment.slice(1),
        href
      }
    })
  }

  const breadcrumbs = generateBreadcrumbs()
  
  return (
    <header className="border-b bg-background h-16 px-4 flex items-center justify-between sticky top-0 z-10">
      {/* Page title and breadcrumb */}
      <div>
        <h1 className="text-2xl font-medium text-primary">{getPageTitle()}</h1>
        <div className="flex items-center text-sm text-muted-foreground">
          <Link href="/dashboard" className="hover:text-foreground transition-colors">
            <Home className="h-3 w-3 mr-1 inline-block" />
            Dashboard
          </Link>
          {breadcrumbs.length > 1 && breadcrumbs.slice(1).map((crumb, i) => (
            <div key={i} className="flex items-center">
              <ChevronRight className="h-3 w-3 mx-1" />
              <Link href={crumb.href} className="hover:text-foreground transition-colors">
                {crumb.title}
              </Link>
            </div>
          ))}
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex items-center space-x-1">
        <div className="relative w-64 mr-2">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search here..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <BellDot size={20} className="text-muted-foreground" />
                <span className="sr-only">Notifications</span>
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center">
                  4
                </Badge>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Notifications</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <Mail size={20} className="text-muted-foreground" />
                <span className="sr-only">Messages</span>
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center">
                  2
                </Badge>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Messages</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <Calendar size={20} className="text-muted-foreground" />
                <span className="sr-only">Calendar</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Calendar</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <BookmarkIcon size={20} className="text-muted-foreground" />
                <span className="sr-only">Bookmarks</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Bookmarks</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {/* Theme toggle */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? (
                  <Sun size={20} className="text-muted-foreground" />
                ) : (
                  <Moon size={20} className="text-muted-foreground" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full ml-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" alt={user?.full_name || 'User'} />
                <AvatarFallback className="bg-primary/20 text-primary">
                  {user?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <div className="font-medium">{user?.full_name || 'User'}</div>
              <div className="text-xs text-muted-foreground truncate">{user?.email || 'user@example.com'}</div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/messages" className="cursor-pointer">
                <MessageCircle className="mr-2 h-4 w-4" />
                <span>Messages</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}