// lib/contexts/auth-context.tsx
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface UserData {
  id: number;
  username: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_admin: boolean;
}

interface AuthContextType {
  user: UserData | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string, remember: boolean) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Check if user is authenticated on load
  useEffect(() => {
    const initAuth = async () => {
      await checkAuth()
      setIsLoading(false)
    }
    
    initAuth()
  }, [])

  // Login function
  const login = async (username: string, password: string, remember: boolean): Promise<boolean> => {
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
        if (remember) {
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
            setUser(userResponse.data)
          }
        } catch (userError) {
          console.warn('Could not fetch user details, but login successful')
        }
        
        return true
      } else {
        setError('Authentication failed - no token received')
        return false
      }
    } catch (err: any) {
      console.error('Login error:', err)
      
      // Handle specific error cases
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
      
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    router.push('/auth/login')
  }

  // Check if user is authenticated
  const checkAuth = async (): Promise<boolean> => {
    setIsLoading(true)
    
    try {
      // Try to get cached user data first
      const cachedUserData = localStorage.getItem('user')
      if (cachedUserData) {
        try {
          const parsedData = JSON.parse(cachedUserData)
          setUser(parsedData)
          setIsLoading(false)
          return true
        } catch (parseError) {
          // If parsing fails, continue to API fetch
          console.error('Error parsing cached user data:', parseError)
          localStorage.removeItem('user')
        }
      }
      
      // Get token from localStorage
      const token = localStorage.getItem('token')
      if (!token) {
        setIsLoading(false)
        return false
      }
      
      // Validate token by getting user info
      const response = await axios.get(`${API_URL}/users/me/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data))
        setUser(response.data)
        setIsLoading(false)
        return true
      } else {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setIsLoading(false)
        return false
      }
    } catch (err) {
      console.error('Authentication check error:', err)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setIsLoading(false)
      return false
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, error, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}