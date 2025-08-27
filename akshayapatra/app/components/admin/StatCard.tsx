'use client'

import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import GlowCard from './GlowCard'
import SkeletonCard from './SkeletonCard'
import { CardContent } from '../../../components/ui/card'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  change?: {
    value: string
    type: 'increase' | 'decrease'
    period?: string
  }
  icon?: LucideIcon
  trend?: number[]
  className?: string
  loading?: boolean
}

export default function StatCard({
  title,
  value,
  subtitle,
  change,
  icon: Icon,
  trend,
  className,
  loading = false
}: StatCardProps) {
  if (loading) {
    return <SkeletonCard className={className} variant="stat" />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <GlowCard 
        className={clsx(
          'shadow-xl hover:shadow-2xl transition-shadow',
          className
        )}
      >
        <CardContent className="p-3 sm:p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-orange-100 text-xs sm:text-sm font-medium truncate">{title}</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold mt-1 sm:mt-2 truncate">{value}</p>
              {subtitle && (
                <p className="text-orange-200 text-xs sm:text-sm mt-1 truncate">{subtitle}</p>
              )}
              
              {change && (
                <div className="flex items-center mt-2 sm:mt-3">
                  {change.type === 'increase' ? (
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-300 mr-1 flex-shrink-0" />
                  ) : (
                    <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-300 mr-1 flex-shrink-0" />
                  )}
                  <span className={clsx(
                    'text-xs sm:text-sm font-medium truncate',
                    change.type === 'increase' ? 'text-green-300' : 'text-red-300'
                  )}>
                    {change.value}
                  </span>
                  {change.period && (
                    <span className="text-orange-200 text-xs sm:text-sm ml-1 truncate">{change.period}</span>
                  )}
                </div>
              )}
            </div>

            {Icon && (
              <div className="ml-2 sm:ml-4 flex-shrink-0">
                <div className="bg-white bg-opacity-20 rounded-lg p-2 sm:p-3">
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
                </div>
              </div>
            )}
          </div>

          {/* Simple trend visualization */}
          {trend && trend.length > 0 && (
            <div className="mt-3 sm:mt-4 flex items-end space-x-0.5 sm:space-x-1 h-6 sm:h-8">
              {trend.map((height, index) => (
                <motion.div
                  key={index}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  className="bg-white bg-opacity-30 rounded-sm flex-1 min-h-[3px] sm:min-h-[4px]"
                  style={{ maxHeight: '24px' }}
                />
              ))}
            </div>
          )}
        </CardContent>
      </GlowCard>
    </motion.div>
  )
}