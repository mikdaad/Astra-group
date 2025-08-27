'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { profileSetupStorage, type ProfileSetupStep } from '@/utils/storage/profileStorage'
import { createClient } from '@/utils/supabase/client'
import type { ProfileCompletionStatus } from '@/app/api/profile/check-completion/route'

interface ProfileSetupWrapperProps {
  children: React.ReactNode
}

export default function ProfileSetupWrapper({ children }: ProfileSetupWrapperProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [shouldRedirect, setShouldRedirect] = useState(false)
  const [hasError, setHasError] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  // Function to check profile completion status from database
  const checkProfileCompletionFromDatabase = async (): Promise<ProfileCompletionStatus | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        console.warn('🔍 [ProfileSetupWrapper] No authenticated user found');
        return null;
      }

      // Call our new API endpoint to check completion status
      const response = await fetch('/api/profile/check-completion', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store'
      });

      if (!response.ok) {
        console.error('🔍 [ProfileSetupWrapper] Failed to check profile completion:', response.status);
        return null;
      }

      const result = await response.json();
      
      if (!result.success) {
        console.error('🔍 [ProfileSetupWrapper] Profile completion check failed:', result.error);
        return null;
      }

      return result.data as ProfileCompletionStatus;
    } catch (error) {
      console.error('🔍 [ProfileSetupWrapper] Error checking profile completion:', error);
      return null;
    }
  };

  useEffect(() => {
    const checkProfileSetup = async () => {
      try {
        console.log('🔍 [ProfileSetupWrapper] Checking profile setup for path:', pathname);
        
        // Check if current path should be excluded from profile setup check
        const isExcludedPath = pathname.startsWith('/admin') || 
                              pathname.startsWith('/api') || 
                              pathname === '/profile-setup'||
                              pathname === '/login'||
                              pathname === '/signup'

        if (isExcludedPath) {
          console.log('🔍 [ProfileSetupWrapper] Path excluded from profile check:', pathname);
          setIsLoading(false)
          setShouldRedirect(false)
          return
        }

        // **KEY CHANGE: Always check database first**
        const completionStatus = await checkProfileCompletionFromDatabase()
        
        if (!completionStatus) {
          console.warn('🔍 [ProfileSetupWrapper] Could not check profile completion - allowing access');
          setIsLoading(false)
          setShouldRedirect(false)
          return
        }

        console.log('🔍 [ProfileSetupWrapper] Profile completion status:', completionStatus);
        
        // Update localStorage to match database state
        if (completionStatus.isComplete) {
          // Profile is complete - clear any localStorage setup state
          profileSetupStorage.completeSetup()
          console.log('🔍 [ProfileSetupWrapper] Profile complete - cleared localStorage setup state');
          setIsLoading(false)
          setShouldRedirect(false)
          return
        } else {
          // Profile incomplete - update localStorage with current missing steps
          profileSetupStorage.setMissingSteps(completionStatus.missingSteps as ProfileSetupStep[])
          console.log('🔍 [ProfileSetupWrapper] Profile incomplete - updated localStorage with missing steps:', completionStatus.missingSteps);
          
          // Redirect to profile setup
          setShouldRedirect(true)
          setTimeout(() => {
            console.log('🔍 [ProfileSetupWrapper] Redirecting to profile setup');
            router.push('/profile-setup')
          }, 100)
        }
        
        setIsLoading(false)
      } catch (error) {
        console.error('🔍 [ProfileSetupWrapper] Error in profile setup check:', error)
        setHasError(true)
        setIsLoading(false)
        setShouldRedirect(false)
      }
    };

    checkProfileSetup()
  }, [pathname, router])

  // Reset redirect state when we reach the profile-setup page
  useEffect(() => {
    if (pathname === '/profile-setup') {
      console.log('🔍 [ProfileSetupWrapper] Reached profile-setup page - resetting redirect state');
      setShouldRedirect(false)
    }
  }, [pathname])

  // If there's an error, render children without redirect to prevent blocking
  if (hasError) {
    return <>{children}</>
  }

  // Show loading state while checking
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a120c]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render children if redirecting - show loading instead
  if (shouldRedirect) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a120c]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-white">Redirecting to profile setup...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
