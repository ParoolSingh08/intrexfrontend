// app/auth/debug-login/page.tsx
'use client'

import { useState } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

export default function DebugLoginPage() {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('adminpassword')
  const [apiUrl, setApiUrl] = useState('http://localhost:8000')
  const [result, setResult] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const handleTestLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setResult('')
    
    try {
      // Create form data
      const formData = new URLSearchParams()
      formData.append('username', username)
      formData.append('password', password)
      
      console.log('Login attempt with:', { username, url: `${apiUrl}/token` })
      
      // Make direct request to API
      const response = await axios.post(`${apiUrl}/token`, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      
      console.log('Response:', response)
      
      if (response.data.access_token) {
        setResult(`SUCCESS: Received token: ${response.data.access_token.substring(0, 20)}...`)
        localStorage.setItem('token', response.data.access_token)
      } else {
        setResult(`ERROR: No access token in response: ${JSON.stringify(response.data)}`)
      }
    } catch (error) {
      console.error('Login error:', error)
      setResult(`ERROR: ${error.message}${error.response ? ` - Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}` : ''}`)
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Debug Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTestLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiUrl">API URL</Label>
              <Input
                id="apiUrl"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            {result && (
              <div className={`p-4 rounded text-sm ${result.startsWith('SUCCESS') ? 'bg-green-100' : 'bg-red-100'}`}>
                <pre className="whitespace-pre-wrap">{result}</pre>
              </div>
            )}
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Testing login...' : 'Test API Login'}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            This tool makes a direct API call to test your authentication endpoint.
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}