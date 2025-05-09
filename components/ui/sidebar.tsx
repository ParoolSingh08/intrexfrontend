'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  BookOpen,
  CalendarDays,
  Award,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  User,
  GraduationCap,
  Plus,
  ChevronDown,
  Upload,
  ListChecks,
  UserPlus,
  UserCheck,
  FileText,
  CheckSquare,
  FileCheck
} from 'lucide-react'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface UserData {
  id: number;
  username: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_admin: boolean;
}

interface SubNavItem {
  icon: React.ReactNode;
  href: string;
  label: string;
}

interface NavItemProps {
  icon: React.ReactNode;
  href: string;
  label: string;
  active: boolean;
  collapsed: boolean;
  subItems?: SubNavItem[];
  color: string;
}

interface NavItem {
  icon: React.ReactNode;
  href: string;
  label: string;
  match: RegExp;
  color: string;
  subItems?: SubNavItem[];
}

const NavItem = ({ icon, href, label, active, collapsed, subItems, color }: NavItemProps) => {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(active)
  
  // Check if any subitems are active
  const isSubItemActive = subItems?.some(item => pathname.startsWith(item.href))
  const isActiveWithSubs = active || isSubItemActive
  
  // When sidebar is collapsed
  if (collapsed) {
    // Render a dropdown menu for items with subitems
    return subItems ? (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "w-full flex items-center justify-center rounded-md px-2 py-2 text-sm transition-all hover:bg-gray-200/70",
              isActiveWithSubs 
                ? `bg-${color}-100 text-${color}-800` 
                : "text-gray-600"
            )}
          >
            <span className={isActiveWithSubs ? `text-${color}-600` : ""}>{icon}</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start" className="w-48">
          <DropdownMenuItem asChild>
            <Link href={href} className={`text-${color}-700`}>
              {label}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {subItems.map((item, idx) => (
            <DropdownMenuItem key={idx} asChild>
              <Link href={item.href} className="flex items-center">
                <span className={`text-${color}-500 mr-2`}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    ) : (
      <Link 
        href={href}
        className={cn(
          "flex items-center justify-center rounded-md px-2 py-2 text-sm transition-all hover:bg-gray-200/70",
          active 
            ? `bg-${color}-100 text-${color}-800` 
            : "text-gray-600"
        )}
      >
        <span className={active ? `text-${color}-600` : ""}>{icon}</span>
      </Link>
    )
  }
  
  // When sidebar is expanded
  return subItems ? (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full"
    >
      <CollapsibleTrigger asChild>
        <button
          className={cn(
            "w-full flex items-center justify-between rounded-md px-3 py-2 text-sm transition-all hover:bg-gray-200/70",
            isActiveWithSubs 
              ? `bg-${color}-100 text-${color}-800` 
              : "text-gray-600"
          )}
        >
          <div className="flex items-center gap-3">
            <span className={isActiveWithSubs ? `text-${color}-600` : ""}>{icon}</span>
            <span>{label}</span>
          </div>
          <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-8 pt-1 space-y-1">
        <Link 
          href={href}
          className={cn(
            "flex items-center rounded-md px-3 py-2 text-sm transition-all hover:bg-gray-200/70",
            pathname === href ? `bg-${color}-50 text-${color}-800` : "text-gray-600"
          )}
        >
          View All
        </Link>
        {subItems.map((item, idx) => (
          <Link 
            key={idx}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all hover:bg-gray-200/70",
              pathname === item.href ? `bg-${color}-50 text-${color}-800` : "text-gray-600"
            )}
          >
            <span className={`text-${color}-500`}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </CollapsibleContent>
    </Collapsible>
  ) : (
    <Link 
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all hover:bg-gray-200/70",
        active 
          ? `bg-${color}-100 text-${color}-800` 
          : "text-gray-600"
      )}
    >
      <span className={active ? `text-${color}-600` : ""}>{icon}</span>
      <span>{label}</span>
    </Link>
  )
}

export function Sidebar(): JSX.Element {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState<boolean>(false)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  
  // Fetch user data from API
  useEffect(() => {
    const fetchUserData = async (): Promise<void> => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Try to get cached user data first
        const cachedUserData = localStorage.getItem('user')
        if (cachedUserData) {
          try {
            const parsedData = JSON.parse(cachedUserData) as UserData
            setUserData(parsedData)
            setIsLoading(false)
            return
          } catch (parseError) {
            // If parsing fails, continue to API fetch
            console.error('Error parsing cached user data:', parseError)
            localStorage.removeItem('user')
          }
        }
        
        // Get token from localStorage
        const token = localStorage.getItem('token')
        if (!token) {
          router.push('/auth/login')
          return
        }
        
        // Fetch user data from API
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        
        // Using fetch instead of axios for more direct control
        const response = await fetch(`${apiUrl}/users/me/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (!response.ok) {
          if (response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            router.push('/auth/login')
            return
          }
          throw new Error(`API error: ${response.status}`)
        }
        
        const data = await response.json() as UserData
        
        // Cache user data
        localStorage.setItem('user', JSON.stringify(data))
        
        // Set user data
        setUserData(data)
      } catch (error) {
        console.error('Error fetching user data:', error)
        setError('Could not load user data')
        
        // Try to use fallback from localStorage
        const fallbackUser = localStorage.getItem('user')
        if (fallbackUser) {
          try {
            setUserData(JSON.parse(fallbackUser) as UserData)
          } catch (e) {
            // If all fails, leave userData as null
          }
        }
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchUserData()
  }, [router])
  
  // Logout function
  const logout = (): void => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('remember_user')
    router.push('/auth/login')
  }
  
  // Navigation items with colors
  const navItems: NavItem[] = [
    {
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: '/dashboard',
      label: 'Dashboard',
      match: /^\/dashboard$/,
      color: 'blue'
    },
    {
      icon: <Users className="h-5 w-5" />,
      href: '/dashboard/customers',
      label: 'Customers',
      match: /^\/dashboard\/customers/,
      color: 'green',
      subItems: [
        {
          icon: <Plus className="h-4 w-4" />,
          href: '/dashboard/customers/add',
          label: 'Add Customer'
        }
      ]
    },
    {
      icon: <ClipboardList className="h-5 w-5" />,
      href: '/dashboard/registrations',
      label: 'Registrations',
      match: /^\/dashboard\/registrations/,
      color: 'purple',
      subItems: [
        {
          icon: <Plus className="h-4 w-4" />,
          href: '/dashboard/registrations/add',
          label: 'Add Registration'
        }
      ]
    },
    {
      icon: <BookOpen className="h-5 w-5" />,
      href: '/dashboard/courses',
      label: 'Courses',
      match: /^\/dashboard\/courses/,
      color: 'amber',
      subItems: [
        {
          icon: <Plus className="h-4 w-4" />,
          href: '/dashboard/courses/add',
          label: 'Add Course'
        }
      ]
    },
    {
      icon: <UserCheck className="h-5 w-5" />,
      href: '/dashboard/trainers',
      label: 'Trainers',
      match: /^\/dashboard\/trainers/,
      color: 'orange',
      subItems: [
        {
          icon: <Plus className="h-4 w-4" />,
          href: '/dashboard/trainers/add',
          label: 'Add Trainer'
        }
      ]
    },
    {
      icon: <GraduationCap className="h-5 w-5" />,
      href: '/dashboard/trainees',
      label: 'Trainees',
      match: /^\/dashboard\/trainees/,
      color: 'indigo',
      subItems: [
        {
          icon: <Plus className="h-4 w-4" />,
          href: '/dashboard/trainees/add',
          label: 'Add Trainee'
        }
      ]
    },
    {
      icon: <CalendarDays className="h-5 w-5" />,
      href: '/dashboard/calendar',
      label: 'Calendar',
      match: /^\/dashboard\/calendar/,
      color: 'red'
    },
    {
      icon: <Award className="h-5 w-5" />,
      href: '/dashboard/certifications',
      label: 'Certifications',
      match: /^\/dashboard\/certifications/,
      color: 'cyan',
      subItems: [
        {
          icon: <Plus className="h-4 w-4" />,
          href: '/dashboard/certifications/add',
          label: 'Add Certification'
        }
      ]
    },
    // New Certificate Management Entry
    {
      icon: <FileCheck className="h-5 w-5" />,
      href: '/dashboard/certificates',
      label: 'Certificates',
      match: /^\/dashboard\/certificates/,
      color: 'emerald',
      subItems: [
        {
          icon: <Plus className="h-4 w-4" />,
          href: '/dashboard/certificates/new',
          label: 'Generate Certificate'
        },
        {
          icon: <CheckSquare className="h-4 w-4" />,
          href: '/verify-certificate',
          label: 'Verify Certificate'
        }
      ]
    }
  ]
  
  // Get user initials for avatar
  const getUserInitials = (): string => {
    if (!userData) return '?'
    
    if (userData.full_name) {
      const nameParts = userData.full_name.split(' ')
      if (nameParts.length > 1) {
        return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
      }
      return userData.full_name[0].toUpperCase()
    }
    
    return userData.username[0].toUpperCase()
  }
  
  return (
    <div 
      className={cn(
        "flex flex-col border-r h-screen transition-all duration-300",
        collapsed ? "w-14" : "w-64",
        "bg-gray-100 bg-gradient-to-b from-gray-50 to-gray-100" // Enhanced background
      )}
    >
      {/* Sidebar header with logo and toggle */}
      <div className="flex h-14 items-center px-3 border-b bg-gradient-to-r from-gray-200 to-gray-100">
        {!collapsed && (
          <span className="text-lg font-bold text-gray-800">CertiTrack</span>
        )}
        <div className={cn("flex-1", collapsed && "justify-center flex")}>
          <Button 
            variant="ghost" 
            size="icon" 
            className="ml-auto text-gray-600 hover:text-gray-900 hover:bg-gray-300/50"
            onClick={() => setCollapsed(prev => !prev)}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      {/* Mobile menu button (only visible on small screens) */}
      <div className="md:hidden flex h-14 items-center px-3 border-b bg-gray-200">
        <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900 hover:bg-gray-300/50">
          <Menu className="h-5 w-5" />
        </Button>
        <span className="text-lg font-bold ml-2 text-gray-800">Menu</span>
      </div>
      
      {/* Navigation items */}
      <div className="flex-1 overflow-auto py-2 px-2">
        <nav className="flex flex-col gap-1">
          {navItems.map((item, index) => (
            <NavItem 
              key={index}
              icon={item.icon}
              href={item.href}
              label={item.label}
              active={item.match.test(pathname)}
              collapsed={collapsed}
              subItems={item.subItems}
              color={item.color}
            />
          ))}
        </nav>
      </div>
      
      {/* User menu */}
      <div className={cn(
        "border-t p-3 flex items-center bg-gradient-to-r from-gray-200 to-gray-100",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {!collapsed ? (
          <>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center shadow-sm">
                {userData ? (
                  <span className="font-semibold text-blue-700">
                    {getUserInitials()}
                  </span>
                ) : (
                  <User className="h-4 w-4 text-blue-600" />
                )}
              </div>
              <div className="text-sm">
                <div className="font-medium text-gray-800">
                  {isLoading ? 'Loading...' : error ? 'User' : (userData?.full_name || userData?.username || 'User')}
                </div>
                {!isLoading && userData && (
                  <div className="text-xs text-gray-600 truncate max-w-[160px]">
                    {userData.email}
                  </div>
                )}
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900 hover:bg-gray-300/50">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4 text-blue-500" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4 text-gray-500" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4 text-red-500" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900 hover:bg-gray-300/50">
                {userData ? (
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="font-semibold text-blue-700">
                      {getUserInitials()}
                    </span>
                  </div>
                ) : (
                  <User className="h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {userData && (
                <div className="px-2 py-1.5 text-sm">
                  <p className="font-medium">{userData.full_name || userData.username}</p>
                  <p className="text-xs text-muted-foreground">{userData.email}</p>
                </div>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4 text-blue-500" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4 text-gray-500" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4 text-red-500" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  )
}