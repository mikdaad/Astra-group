'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

interface ProfileSetupWrapperProps {
  children: React.ReactNode
}

export default function ProfileSetupWrapper({ children }: ProfileSetupWrapperProps) {
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    // Simulate a brief loading check then allow access
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [pathname])

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

  return <>{children}</>
}
