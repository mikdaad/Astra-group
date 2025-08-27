'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { TrendingUp, TrendingDown, Lock } from 'lucide-react'
import Image from 'next/image'

interface FinancialCardProps {
  title: string
  amount: string
  change?: {
    value: string
    type: 'increase' | 'decrease'
    period?: string
  }
  cardType?: 'orange' | 'blue' | 'green'
  showLock?: boolean
  className?: string
}

export default function FinancialCard({ 
  title, 
  amount, 
  change, 
  cardType = 'orange',
  showLock = false,
  className 
}: FinancialCardProps) {
  const gradients = {
    orange: 'linear-gradient(135deg, #CA5002 0%, #6E2B00 100%)',
    blue: 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)',
    green: 'linear-gradient(135deg, #10B981 0%, #047857 100%)'
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card 
        className="border-none shadow-xl text-white relative overflow-hidden rounded-2xl h-48"
        style={{ background: gradients[cardType] }}
      >
        <CardContent className="p-6 flex flex-col justify-between h-full">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm opacity-90 mb-2">{title}</p>
              <h3 className="text-2xl font-bold">{amount}</h3>
            </div>
            {showLock && (
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <Lock className="h-4 w-4" />
              </div>
            )}
          </div>

          {/* Change indicator */}
          {change && (
            <div className="flex items-center space-x-2 mt-4">
              {change.type === 'increase' ? (
                <TrendingUp className="h-4 w-4 text-green-300" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-300" />
              )}
              <span className={`text-sm font-medium ${
                change.type === 'increase' ? 'text-green-300' : 'text-red-300'
              }`}>
                {change.value}
              </span>
              {change.period && (
                <span className="text-sm opacity-75">{change.period}</span>
              )}
            </div>
          )}

          {/* Decorative elements */}
          <div className="absolute top-4 right-4 opacity-20">
            <div className="w-12 h-12 rounded-full bg-white bg-opacity-20" />
          </div>
          <div className="absolute bottom-4 right-6 opacity-10">
            <div className="w-8 h-8 rounded-full bg-white bg-opacity-30" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}