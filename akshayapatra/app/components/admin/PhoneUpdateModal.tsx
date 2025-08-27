'use client'

import { useState } from 'react'
import { Phone, Shield, ArrowRight, Check, Loader2, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

interface PhoneUpdateModalProps {
  open: boolean
  onClose: () => void
  currentPhone: string
  onUpdate: (newPhone: string) => void
}

type Step = 'phone' | 'otp' | 'success'

export default function PhoneUpdateModal({
  open,
  onClose,
  currentPhone,
  onUpdate
}: PhoneUpdateModalProps) {
  const [step, setStep] = useState<Step>('phone')
  const [newPhone, setNewPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [resendTimer, setResendTimer] = useState(0)

  const resetModal = () => {
    setStep('phone')
    setNewPhone('')
    setOtp(['', '', '', '', '', ''])
    setErrors({})
    setResendTimer(0)
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[+]?[1-9]\d{1,14}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  }

  const handlePhoneSubmit = async () => {
    if (!newPhone.trim()) {
      setErrors({ phone: 'Phone number is required' })
      return
    }

    if (!validatePhone(newPhone)) {
      setErrors({ phone: 'Please enter a valid phone number' })
      return
    }

    if (newPhone === currentPhone) {
      setErrors({ phone: 'New phone number must be different from current' })
      return
    }

    setIsLoading(true)
    try {
      // Simulate API call to send OTP
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setStep('otp')
      setErrors({})
      
      // Start resend timer
      setResendTimer(30)
      const timer = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
    } catch (error) {
      setErrors({ phone: 'Failed to send OTP. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
    
    // Clear errors
    if (errors.otp) {
      setErrors({ ...errors, otp: '' })
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleOtpSubmit = async () => {
    const otpValue = otp.join('')
    
    if (otpValue.length !== 6) {
      setErrors({ otp: 'Please enter complete OTP' })
      return
    }

    setIsLoading(true)
    try {
      // Simulate API call to verify OTP
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock validation - in real app, this would be server-side
      if (otpValue === '123456') {
        setStep('success')
        setErrors({})
        
        // Auto-close and update after success
        setTimeout(() => {
          onUpdate(newPhone)
          handleClose()
        }, 2000)
      } else {
        setErrors({ otp: 'Invalid OTP. Please try again.' })
      }
    } catch (error) {
      setErrors({ otp: 'Failed to verify OTP. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setResendTimer(30)
      const timer = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (error) {
      setErrors({ otp: 'Failed to resend OTP. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const renderPhoneStep = () => (
    <div className="space-y-4">
      <Card className="bg-zinc-800/50 border-zinc-700">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-zinc-400" />
            <div>
              <p className="text-sm text-zinc-400">Current Phone</p>
              <p className="font-medium text-white">{currentPhone}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <Label htmlFor="newPhone" className="text-sm font-medium">
          New Phone Number
        </Label>
        <Input
          id="newPhone"
          value={newPhone}
          onChange={(e) => {
            setNewPhone(e.target.value)
            if (errors.phone) {
              setErrors({ ...errors, phone: '' })
            }
          }}
          placeholder="Enter new phone number"
          className={`mt-2 bg-zinc-800 border-zinc-600 text-white ${
            errors.phone ? 'border-red-500' : ''
          }`}
        />
        {errors.phone && (
          <p className="text-red-400 text-xs mt-1">{errors.phone}</p>
        )}
      </div>

      <div className="p-3 bg-blue-600/10 border border-blue-600/30 rounded-lg">
        <p className="text-sm text-blue-400">
          📱 We'll send a 6-digit OTP to verify your new phone number.
        </p>
      </div>
    </div>
  )

  const renderOtpStep = () => (
    <div className="space-y-4">
      <Card className="bg-zinc-800/50 border-zinc-700">
        <CardContent className="p-4 text-center">
          <Shield className="w-8 h-8 text-orange-400 mx-auto mb-2" />
          <p className="text-sm text-zinc-400">OTP sent to</p>
          <p className="font-medium text-white">{newPhone}</p>
        </CardContent>
      </Card>

      <div>
        <Label className="text-sm font-medium">Enter 6-digit OTP</Label>
        <div className="flex gap-2 mt-2">
          {otp.map((digit, index) => (
            <Input
              key={index}
              id={`otp-${index}`}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(index, e)}
              className={`w-12 h-12 text-center text-lg font-bold bg-zinc-800 border-zinc-600 ${
                errors.otp ? 'border-red-500' : ''
              }`}
              maxLength={1}
            />
          ))}
        </div>
        {errors.otp && (
          <p className="text-red-400 text-xs mt-1">{errors.otp}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-400">
          Didn't receive OTP?
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleResendOtp}
          disabled={resendTimer > 0 || isLoading}
          className="text-orange-400 hover:bg-orange-600/20"
        >
          {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
        </Button>
      </div>

      <div className="p-3 bg-amber-600/10 border border-amber-600/30 rounded-lg">
        <p className="text-sm text-amber-400">
          💡 Demo: Use OTP <code className="bg-amber-600/20 px-1 rounded">123456</code> to verify
        </p>
      </div>
    </div>
  )

  const renderSuccessStep = () => (
    <div className="space-y-4 text-center">
      <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto">
        <Check className="w-8 h-8 text-green-400" />
      </div>
      
      <div>
        <h3 className="text-lg font-bold text-white mb-2">Phone Updated Successfully!</h3>
        <p className="text-zinc-400">
          Your phone number has been updated to <span className="text-white font-medium">{newPhone}</span>
        </p>
      </div>

      <div className="p-3 bg-green-600/10 border border-green-600/30 rounded-lg">
        <p className="text-sm text-green-400">
          ✅ This modal will close automatically in a moment.
        </p>
      </div>
    </div>
  )

  const getStepTitle = () => {
    switch (step) {
      case 'phone':
        return 'Update Phone Number'
      case 'otp':
        return 'Verify New Number'
      case 'success':
        return 'Update Complete'
      default:
        return 'Update Phone'
    }
  }

  const canProceed = () => {
    switch (step) {
      case 'phone':
        return newPhone.trim() && !errors.phone
      case 'otp':
        return otp.join('').length === 6 && !errors.otp
      default:
        return false
    }
  }

  const handleNext = () => {
    if (step === 'phone') {
      handlePhoneSubmit()
    } else if (step === 'otp') {
      handleOtpSubmit()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-[#1a120c] border-orange-600/30 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 bg-orange-600/20 rounded-lg">
              <Phone className="w-5 h-5 text-orange-400" />
            </div>
            {getStepTitle()}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {step === 'phone' && renderPhoneStep()}
          {step === 'otp' && renderOtpStep()}
          {step === 'success' && renderSuccessStep()}
        </div>

        {step !== 'success' && (
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              className="border-zinc-600 text-zinc-300 hover:bg-zinc-800"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed() || isLoading}
              className="bg-orange-600 text-white hover:bg-orange-500"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4 mr-2" />
              )}
              {step === 'phone' ? 'Send OTP' : 'Verify'}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
