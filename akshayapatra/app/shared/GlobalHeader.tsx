"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Header from "../components/homepage/Header";
import AdminHeader from "../components/admin/AdminHeader";

interface GlobalHeaderProps {
  onMenuClick?: () => void;
}

export default function GlobalHeader({ onMenuClick }: GlobalHeaderProps) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  // Use AdminHeader for admin pages, regular Header for others
  if (isAdminPage && onMenuClick) {
    return <AdminHeader onMenuClick={onMenuClick} />;
  }

  return <Header />;
}


