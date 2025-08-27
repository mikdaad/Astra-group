'use client'

import { useState } from 'react'

import { usePathname } from 'next/navigation'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {

  const pathname = usePathname()
  
  // For login/signup pages, render without any wrapper
  if (pathname.startsWith('/admin/login') || pathname.startsWith('/admin/signup')) {
    return <>{children}</>
  }
  
  // For other admin pages, just pass through children since ConditionalLayout handles everything
  return <>{children}</>
}