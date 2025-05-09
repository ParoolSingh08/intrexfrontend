'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios, { AxiosError } from 'axios'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Loader2, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import Link from 'next/link'

// API URL from environment or default
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  
  // Load remembered username on component mount - FIXED: using useEffect instead of useState
  useEffect(() => {
    // Only access localStorage on the client side
    if (typeof window !== 'undefined') {
      const rememberedUser = localStorage.getItem('remember_user')
      if (rememberedUser) {
        setUsername(rememberedUser)
        setRememberMe(true)
      }
    }
  }, []) // Empty dependency array means this runs once on mount
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!username || !password) {
      setError('Please enter both username and password')
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      // Create form data for FastAPI token endpoint
      const formData = new URLSearchParams()
      formData.append('username', username)
      formData.append('password', password)
      
      // Make direct API call to FastAPI for authentication
      const response = await axios.post(`${API_URL}/token`, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      
      // Check for token in response
      if (response.data.access_token) {
        // Store token in localStorage
        localStorage.setItem('token', response.data.access_token)
        if (rememberMe) {
          localStorage.setItem('remember_user', username)
        } else {
          localStorage.removeItem('remember_user')
        }
        
        // Try to get user info
        try {
          const userResponse = await axios.get(`${API_URL}/users/me/`, {
            headers: {
              'Authorization': `Bearer ${response.data.access_token}`
            }
          })
          
          // Store user info if available
          if (userResponse.data) {
            localStorage.setItem('user', JSON.stringify(userResponse.data))
          }
        } catch (userError) {
          console.warn('Could not fetch user details, but login successful')
        }
        
        // Redirect to dashboard - using push() for client-side navigation
        router.push('/dashboard')
      } else {
        setError('Authentication failed - no token received')
      }
    } catch (error: unknown) {
      console.error('Login error:', error)
      
      // Type cast to AxiosError for better type handling
      const err = error as AxiosError
      
      // Handle specific error cases
      if (axios.isAxiosError(err)) {
        if (err.response) {
          if (err.response.status === 401) {
            setError('Invalid username or password')
          } else if (err.response.status === 422) {
            setError('Validation error - please check your inputs')
          } else {
            setError(`Server error: ${err.response.status}`)
          }
        } else if (err.request) {
          setError('Network error - please check your connection')
        } else {
          setError(`Error: ${err.message}`)
        }
      } else {
        // For non-Axios errors
        setError('An unexpected error occurred')
      }
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="flex h-screen">
      {/* Left side with background image */}
      <div className="hidden md:block md:w-1/2 relative">
        <div className="absolute inset-0 bg-black/30 z-10" />
        <Image 
          src="/training-waterfall.jpg" 
          alt="CertiTrack" 
          fill 
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 flex flex-col justify-between z-20 p-10 text-white">
          <div>
            <h2 className="text-3xl font-bold">CertiTrack</h2>
          </div>
          
          <div className="space-y-6">
            <h1 className="text-5xl font-bold">Welcome back!</h1>
            <p className="text-xl max-w-md">
              Log in to your account to manage your training registrations, courses, and certifications.
            </p>
            
            <div className="text-sm text-white/70 pt-8">
              CertiTrack 2025. All rights reserved.
              <div className="mt-2 space-x-4">
                <Link href="#" className="hover:underline">Terms of Service</Link>
                <Link href="#" className="hover:underline">Privacy Policy</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side with login form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white p-6">
        <div className="max-w-md w-full">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Login Now!</h1>
          <p className="text-gray-600 mb-8">Welcome back! Please enter your details.</p>
          
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-700 font-medium">
                Username
              </Label>
              <Input
                id="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 bg-gray-100 border-0"
                required
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  Password
                </Label>
                <Link 
                  href="/auth/forgot-password" 
                  className="text-sm text-blue-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 bg-gray-100 border-0 pr-10"
                  required
                />
                <button 
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="remember" 
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                />
                <Label 
                  htmlFor="remember" 
                  className="text-sm text-gray-600 cursor-pointer"
                >
                  Remember me
                </Label>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-medium bg-blue-500 hover:bg-blue-600"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Log In <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account? <span className="text-blue-600 font-medium hover:underline">Sign Up</span>
            </p>
            
            <div className="mt-6 px-6 py-4 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-600 font-medium mb-2">Demo Credentials:</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white p-2 rounded shadow-sm">
                  <span className="font-semibold">Admin:</span><br />
                  admin / adminpassword
                </div>
                <div className="bg-white p-2 rounded shadow-sm">
                  <span className="font-semibold">User:</span><br />
                  user / userpassword
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}