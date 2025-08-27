'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { cn } from '@/lib/utils'

interface DashboardCardProps {
  children: React.ReactNode
  className?: string
  gradient?: boolean
  padding?: 'sm' | 'md' | 'lg'
  animate?: boolean
}

export default function DashboardCard({ 
  children, 
  className, 
  gradient = true,
  padding = 'md',
  animate = true 
}: DashboardCardProps) {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  const cardContent = (
    <Card 
      className={cn(
        'border-none shadow-xl text-white relative overflow-hidden rounded-2xl bg-transparent',
        className
      )}
    
    >
      <CardContent className={paddingClasses[padding]}>
        {children}
      </CardContent>
    </Card>
  )

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {cardContent}
      </motion.div>
    )
  }

  return cardContent
}