'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface AccessKeyFormProps {
  onAccessGranted: () => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export default function AccessKeyForm({ onAccessGranted, isLoading, setIsLoading }: AccessKeyFormProps) {
  const [accessKey, setAccessKey] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!accessKey.trim()) {
      setError('Access key is required')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      console.log('🔑 [ACCESS KEY FORM] Verifying access key...')

      const response = await fetch('/api/admin/auth/checkaccess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessKey: accessKey.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify access key')
      }

      if (data.isValid) {
        console.log('🔑 [ACCESS KEY FORM] Access key verified successfully')
        
        // Store access key in localStorage for use during signup process
        localStorage.setItem('admin_access_key', accessKey.trim())
        console.log('🔑 [ACCESS KEY FORM] Access key stored in localStorage')
        
        onAccessGranted()
      } else {
        console.warn('🔑 [ACCESS KEY FORM] Invalid access key')
        setError('Invalid access key. Please check and try again.')
      }

    } catch (error) {
      console.error('🔑 [ACCESS KEY FORM] Error verifying access key:', error)
      setError(error instanceof Error ? error.message : 'Failed to verify access key')
    } finally {
      setIsLoading(false)
    }
  }, [accessKey, onAccessGranted, setIsLoading])

  return (
    <Card className="w-full max-w-md rounded-2xl bg-orange-950/50 border-orange-600 p-8 shadow-2xl backdrop-blur-lg transition-all duration-500 ease-in-out transform hover:shadow-3xl hover:scale-[1.02]">
      <CardHeader className="text-center">
        <CardTitle 
          className="text-4xl font-medium bg-clip-text text-transparent"
          style={{ 
            backgroundImage: 'linear-gradient(to bottom, #FFFFFF, #EE6200, #EE6200)' 
          }}
        >
          Admin Access
        </CardTitle>
        <CardDescription className="text-gray-300">
          Enter your access key to continue
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Enter access key"
              value={accessKey}
              onChange={(e) => setAccessKey(e.target.value)}
              className="rounded-lg bg-white/10 border-orange-600/30 px-4 py-3 text-white placeholder:text-white/50 focus:border-orange-600 focus:ring-orange-600"
              disabled={isLoading}
              autoFocus
            />
            {error && (
              <p className="text-sm text-red-400 mt-1">{error}</p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || !accessKey.trim()}
          >
            {isLoading ? 'Verifying...' : 'Verify Access Key'}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400">
            Contact your administrator for access key
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
