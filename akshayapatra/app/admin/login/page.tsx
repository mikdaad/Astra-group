'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  PhoneLoginForm
} from '@/app/components/auth'
import { PageTransition } from '@/app/components/auth/PageTransition'

type AuthMethod = 'phone'

export default function LoginPage() {

  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignupRedirect = useCallback(() => {
    router.push('/admin/signup')
  }, [router])

  const handleAuthSuccess = useCallback(() => {
    // Redirect to dashboard after successful authentication
    router.push('/admin')
  }, [router])

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
            alt="Login Illustration"
            width={500}
            height={500}
            className="object-contain"
          />
        </div>

        {/* Right Side: Auth Form */}
        <div className="flex w-full items-center justify-center">
          <Card className="w-full max-w-md rounded-2xl border-2 border-white/20 bg-black/20 p-8 shadow-2xl backdrop-blur-lg transition-all duration-500 ease-in-out transform hover:shadow-3xl hover:scale-[1.02]">
            <CardHeader className="text-center">
              <CardTitle 
                className="text-4xl font-medium bg-clip-text text-transparent"
                style={{ 
                  backgroundImage: 'linear-gradient(to bottom, #FFFFFF, #EE6200, #EE6200)' 
                }}
              >
                Welcome Back
              </CardTitle>
              <CardDescription className="text-gray-300">
                Sign in with your phone number
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Phone Auth Form */}
              <PhoneLoginForm 
                onSuccess={handleAuthSuccess}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />

              {/* Sign Up Redirect */}
              <div className="text-center transition-all duration-300 ease-in-out">
                <p className="text-sm text-gray-400">
                  Don&apos;t have an account?{' '}
                  <Button 
                    variant="link" 
                    className="p-0 font-semibold text-orange-500 hover:text-orange-400 transition-all duration-200 hover:scale-105"
                    onClick={handleSignupRedirect}
                  >
                    Sign up
                  </Button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </PageTransition>
  )
}
