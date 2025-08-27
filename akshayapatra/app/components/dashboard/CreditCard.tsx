'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '../../../components/ui/card'
import { Wifi } from 'lucide-react'

interface CreditCardProps {
  cardNumber: string
  holderName: string
  expiryDate?: string
  cardType?: 'orange' | 'blue' | 'green'
  balance?: string
  userId?: string
  phoneNumber?: string
  className?: string
}

export default function CreditCard({ 
  cardNumber, 
  holderName, 
  expiryDate = "12/25",
  cardType = 'orange',
  balance,
  userId,
  phoneNumber,
  className 
}: CreditCardProps) {
  const gradients = {
    orange: 'linear-gradient(135deg, #CA5002 0%, #FF8C42 50%, #6E2B00 100%)',
    blue: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 50%, #1E40AF 100%)',
    green: 'linear-gradient(135deg, #10B981 0%, #34D399 50%, #047857 100%)'
  }

  // Mask card number (show only last 4 digits)
  const maskedCardNumber = `${cardNumber.slice(0, 3)} ${cardNumber.slice(3, 6)} ${cardNumber.slice(6, 10)}`

  return (
    <motion.div
      initial={{ opacity: 0, rotateY: -10 }}
      animate={{ opacity: 1, rotateY: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Card 
        className="border-none shadow-2xl text-white relative overflow-hidden rounded-2xl aspect-[1.6/1] min-h-[200px]"
        style={{ background: gradients[cardType] }}
      >
        <CardContent className="p-6 flex flex-col justify-between h-full relative">
          {/* Card Header */}
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-6 bg-yellow-400 rounded-sm flex items-center justify-center">
                <div className="w-4 h-4 bg-yellow-600 rounded-sm" />
              </div>
              <Wifi className="h-4 w-4 rotate-90" />
            </div>
            <div className="text-right">
              <div className="text-xs opacity-75">AK</div>
              <div className="text-lg font-bold">AK</div>
            </div>
          </div>

          {/* Card Number */}
          <div className="my-4">
            <div className="text-lg font-mono tracking-wider">
              {maskedCardNumber}
            </div>
          </div>

          {/* Card Details */}
          <div className="flex justify-between items-end">
            <div>
              <div className="text-xs opacity-75 mb-1">Card Holder</div>
              <div className="font-semibold text-sm">{holderName}</div>
              {phoneNumber && (
                <div className="text-xs opacity-75">{phoneNumber}</div>
              )}
            </div>
            <div className="text-right">
              <div className="text-xs opacity-75 mb-1">User ID</div>
              <div className="font-semibold text-sm">{userId || 'AA0001'}</div>
            </div>
          </div>

          {/* Balance if provided */}
          {balance && (
            <div className="absolute top-6 right-6">
              <div className="text-xs opacity-75">Total balance</div>
              <div className="text-sm font-bold">{balance}</div>
            </div>
          )}

          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white bg-opacity-10 rounded-full" />
          <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-white bg-opacity-5 rounded-full" />
          <div className="absolute top-1/2 right-0 w-20 h-20 bg-white bg-opacity-10 rounded-full" />
        </CardContent>
      </Card>
    </motion.div>
  )
}