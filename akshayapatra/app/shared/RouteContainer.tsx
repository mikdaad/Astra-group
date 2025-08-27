"use client";

import React from "react";
import { usePathname } from "next/navigation";

export default function RouteContainer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isProfileSetup = pathname === "/profile-setup";

  const containerClass = isProfileSetup ? "pt-4 pb-4" : "md:ml-[88px] md:pt-20 pt-14 pb-16";

  return <div className={containerClass}>{children}</div>;
}



