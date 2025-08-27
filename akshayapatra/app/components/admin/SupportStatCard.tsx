'use client'

import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { Card, CardContent } from '../../../components/ui/card'

interface SupportStatCardProps {
  title: string
  value: string | number
  subtitle?: string
  change?: {
    value: string
    type: 'increase' | 'decrease'
    period?: string
  }
  icon: LucideIcon
  className?: string
  loading?: boolean
}

export default function SupportStatCard({
  title,
  value,
  subtitle,
  change,
  icon: Icon,
  className,
  loading = false
}: SupportStatCardProps) {
  if (loading) {
    return (
      <Card className="bg-orange-950/50 border-0 text-white overflow-hidden">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-white/20 rounded w-3/4"></div>
            <div className="h-8 bg-white/20 rounded w-1/2"></div>
            <div className="h-3 bg-white/20 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className={clsx(
          'bg-orange-950/50 border-0 text-white overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300',
          className
        )}
        style={{
          backgroundImage: 'var(--astra-background, linear-gradient(355deg, #090300 3.07%, #351603 54.29%, #6E2B00 76.89%, #CA5002 97.23%))'
        }}
      >
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-sm sm:text-base font-medium text-white truncate">{title}</h3>
              </div>
              
              <div className="space-y-2">
                <p className="text-2xl sm:text-3xl font-bold text-white">{value}</p>
                {subtitle && (
                  <p className="text-xs sm:text-sm text-white/70">{subtitle}</p>
                )}
                
                {change && (
                  <div className="flex items-center gap-1">
                    {change.type === 'increase' ? (
                      <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-400 flex-shrink-0" />
                    ) : (
                      <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-400 flex-shrink-0" />
                    )}
                    <span className={clsx(
                      'text-xs sm:text-sm font-medium',
                      change.type === 'increase' ? 'text-green-400' : 'text-red-400'
                    )}>
                      {change.value}
                    </span>
                    {change.period && (
                      <span className="text-xs sm:text-sm text-white/60">{change.period}</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Large Icon on the Right */}
            <div className="ml-4 flex-shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 rounded-2xl flex items-center justify-center">
                <Icon className="h-8 w-8 sm:h-10 sm:w-10 text-white/80" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
