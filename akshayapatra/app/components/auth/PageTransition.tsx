'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface PageTransitionProps {
  children: React.ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleStart = () => setIsLoading(true)
    const handleComplete = () => {
      setTimeout(() => setIsLoading(false), 500) // Give some time for the new page to render
    }

    // Note: Next.js 13+ App Router doesn't have router events like the Pages Router
    // This is a placeholder for future implementation if needed
    // For now, we'll just show the children with a nice entrance animation

    return () => {
      // Cleanup if needed
    }
  }, [])

  return (
    <>
      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-[#090300] to-[#CA5002] transition-opacity duration-300">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading...</p>
          </div>
        </div>
      )}
      
      {/* Page content with entrance animation */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
        {children}
      </div>
    </>
  )
}
