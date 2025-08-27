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
  
  // Always show navigation for public access
  const showNavigation = true;

  return (
    <>
      {/* Always show header and navigation for public access */}
      {showNavigation && (
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
      
      {/* Content area with navigation styling */}
      <div className={showNavigation ? "md:ml-[88px] h-screen flex flex-col" : "min-h-screen"}>
        {showNavigation ? (
          // Wrapped content with proper height constraints
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
        ) : (
          // Full screen content
          children
        )}
      </div>
    </>
  );
}