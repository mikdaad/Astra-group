"use client";

import React from "react";
import { usePathname } from "next/navigation";
import GlobalHeader from "./GlobalHeader";
import GlobalSidebar from "./GlobalSidebar";
import MobileHeader from "./MobileHeader";
import MobileBottomNav from "./MobileBottomNav";

export default function AppChrome() {
  const pathname = usePathname();
  const hideChrome = pathname === "/profile-setup";

  if (hideChrome) return null;

  return (
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
  );
}



