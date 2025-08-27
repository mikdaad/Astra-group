import { Skeleton } from '@/components/ui/skeleton'

export default function LoginLoading() {
  return (
    <div 
      className="min-h-screen w-full font-sans text-white" 
      style={{ 
        backgroundImage: 'linear-gradient(to top, #090300, #351603, #6E2B00, #CA5002)' 
      }}
    >
      <div className="container mx-auto grid min-h-screen grid-cols-1 items-center gap-8 px-4 lg:grid-cols-2 lg:gap-16">
        
        {/* Left Side: Illustration Skeleton */}
        <div className="relative hidden h-full w-full items-center justify-center lg:flex">
          <Skeleton className="h-[500px] w-[500px] rounded-lg bg-white/10" />
        </div>

        {/* Right Side: Form Skeleton */}
        <div className="flex w-full items-center justify-center">
          <div className="w-full max-w-md rounded-2xl border-2 border-white/20 bg-black/20 p-8 shadow-2xl backdrop-blur-lg">
            
            {/* Header Skeleton */}
            <div className="mb-8 text-center space-y-2">
              <Skeleton className="h-12 w-48 mx-auto bg-white/10" />
              <Skeleton className="h-4 w-64 mx-auto bg-white/10" />
            </div>

            {/* Auth Method Selector Skeleton */}
            <div className="space-y-4">
              <div className="flex gap-2">
                <Skeleton className="h-10 flex-1 bg-white/10" />
                <Skeleton className="h-10 flex-1 bg-white/10" />
                <Skeleton className="h-10 flex-1 bg-white/10" />
              </div>

              {/* Form Fields Skeleton */}
              <div className="space-y-4">
                <Skeleton className="h-12 w-full bg-white/10" />
                <Skeleton className="h-12 w-full bg-white/10" />
                <Skeleton className="h-12 w-full bg-white/10" />
              </div>

              {/* Divider Skeleton */}
              <Skeleton className="h-px w-full bg-white/10" />

              {/* Link Skeleton */}
              <Skeleton className="h-4 w-40 mx-auto bg-white/10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
