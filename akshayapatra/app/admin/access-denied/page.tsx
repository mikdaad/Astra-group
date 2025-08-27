'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, ArrowLeft, Home, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRBAC } from '@/hooks/useRBAC'

export default function AccessDeniedPage() {
  const router = useRouter()
  const { role, accessiblePages, loading } = useRBAC()

  useEffect(() => {
    // If user has no role or is loading, redirect to login
    if (!loading && !role) {
      router.push('/admin/login')
    }
  }, [role, loading, router])

  const handleGoBack = () => {
    router.back()
  }

  const handleGoHome = () => {
    // Redirect to accessible page based on role
    if (accessiblePages.includes('/admin')) {
      router.push('/admin')
    } else if (accessiblePages.length > 0) {
      router.push(accessiblePages[0])
    } else {
      router.push('/admin/login')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-black flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-zinc-900/50 border-zinc-700 text-white">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <CardTitle className="text-2xl font-bold">Access Denied</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div className="space-y-2">
            <p className="text-zinc-400">
              You don&apos;t have permission to access this page.
            </p>
            {role && (
              <div className="flex items-center justify-center gap-2 p-2 bg-zinc-800/50 rounded">
                <Shield className="w-4 h-4 text-orange-400" />
                <span className="text-sm">
                  Current role: <span className="font-medium text-orange-400 capitalize">{role}</span>
                </span>
              </div>
            )}
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={handleGoHome}
              className="w-full bg-orange-600 hover:bg-orange-500 text-white"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
            
            <Button 
              onClick={handleGoBack}
              variant="outline"
              className="w-full border-zinc-600 text-zinc-300 hover:bg-zinc-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
          
          <div className="pt-4 text-xs text-zinc-500">
            If you believe this is an error, please contact your administrator.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
