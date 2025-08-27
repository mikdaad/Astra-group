'use client'

import React from 'react'
import { Card } from '@/components/ui/card'

interface GlowCardProps {
  children: React.ReactNode
  className?: string
}

export default function GlowCard({ children, className = "", ...props }: GlowCardProps & React.ComponentProps<typeof Card>) {
  return (
    <Card 
      className={`relative overflow-hidden border-zinc-800 bg-[#1a120c] text-white w-full ${className}`}
      {...props}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-orange-900/10" />
      <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />
      <div className="relative w-full">{children}</div>
    </Card>
  )
}