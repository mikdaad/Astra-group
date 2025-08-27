'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  PhoneSignupForm
} from '@/app/components/auth'
import { PageTransition } from '@/app/components/auth/PageTransition'
import AccessKeyForm from '@/app/components/admin/AccessKeyForm'


export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [hasAccessKey, setHasAccessKey] = useState(false)
  const router = useRouter()

  const handleLoginRedirect = useCallback(() => {
    router.push('/admin/login')
  }, [router])

  const handleAuthSuccess = useCallback(() => {
    // Redirect to profile setup or dashboard after successful signup
    router.push('/admin')
  }, [router])

  const handleAccessGranted = useCallback(() => {
    setHasAccessKey(true)
  }, [])

  return (
    <PageTransition>
    <div 
      className="min-h-screen w-full font-sans text-white" 
      style={{ 
        backgroundImage: 'linear-gradient(to top, #090300, #351603, #6E2B00, #CA5002)' 
      }}
    >
      <div className="container mx-auto grid min-h-screen grid-cols-1 items-center gap-8 px-4 lg:grid-cols-2 lg:gap-16">
        
        {/* Left Side: Illustration (hidden on small screens) */}
        <div className="relative hidden h-full w-full items-center justify-center lg:flex">
          <Image
            src="/thesignuplogo.png"
            alt="Sign Up Illustration"
            width={500}
            height={500}
            className="object-contain"
          />

        </div>

        <div className="flex w-full items-center justify-center">
          
          {!hasAccessKey ? (
            // Access Key Verification Form
            <AccessKeyForm 
              onAccessGranted={handleAccessGranted}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          ) : (
            // Regular Signup Form (shown after access key verification)
            <Card className="w-full max-w-md rounded-2xl border-2 border-white/20 bg-black/20 p-8 shadow-2xl backdrop-blur-lg transition-all duration-500 ease-in-out transform hover:shadow-3xl hover:scale-[1.02]">
              <CardHeader className="text-center">
                <CardTitle 
                  className="text-4xl font-medium bg-clip-text text-transparent"
                  style={{ 
                    backgroundImage: 'linear-gradient(to bottom, #FFFFFF, #EE6200, #EE6200)' 
                  }}
                >
                  Create Account
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Create your account with phone number
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Phone Auth Form */}
                <PhoneSignupForm 
                  onSuccess={handleAuthSuccess}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                />

                {/* Login Redirect */}
                <div className="text-center transition-all duration-300 ease-in-out">
                  <p className="text-sm text-gray-400">
                    Already have an account?{' '}
                    <Button 
                      variant="link" 
                      className="p-0 font-semibold text-orange-500 hover:text-orange-400 transition-all duration-200 hover:scale-105"
                      onClick={handleLoginRedirect}
                    >
                      Sign in
                    </Button>
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
    </PageTransition>
  )
}