"use client";

import { usePathname } from "next/navigation";
import GlobalHeader from "@/app/shared/GlobalHeader";
import GlobalSidebar from "@/app/shared/GlobalSidebar";
import MobileHeader from "@/app/shared/MobileHeader";
import MobileBottomNav from "@/app/shared/MobileBottomNav";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  
  // Check if current route is in the (home) section
  // Routes in the (home) folder should not show navigation
  const isHomePage =  
                     pathname.startsWith('/login') || 
                     pathname.startsWith('/signup') || 
                     pathname.startsWith('/profile-setup') ||
                     pathname.startsWith('/admin/login') ||
                     pathname.startsWith('/admin/signup');

  return (
    <>
      {/* Show header and navigation only for non-home pages */}
      {!isHomePage && (
        <>
          {/* Desktop header and sidebar */}
          <div className="hidden md:block">
            <GlobalHeader />
            <GlobalSidebar />
          </div>
          {/* Mobile header and bottom nav */}
          <div className="md:hidden">
            <MobileHeader />
            <MobileBottomNav />
          </div>
        </>
      )}
      
      {/* Content area with conditional styling */}
      <div className={isHomePage ? "min-h-screen" : "md:ml-[88px] h-screen flex flex-col"}>
        {isHomePage ? (
          // Full screen content for home pages
          children
        ) : (
          // Wrapped content for other pages with proper height constraints
          <div className="flex-1 flex flex-col overflow-hidden pt-20 pb-4">
            <div className="flex-1 px-3 sm:px-4 md:px-6 overflow-hidden">
              <div className="lg:rounded-[24px] lg:p-[2px] bg-transparent h-full">
                <div className="lg:rounded-[22px] bg-transparent lg:p-3 sm:p-4 md:p-6 overflow-hidden h-full">
                  <div className="h-full overflow-y-auto">
                    {children}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
