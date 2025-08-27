'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Icons } from '@/app/components/shared/icons'
import { Skeleton } from '@/components/ui/skeleton'
import { usePathname } from 'next/navigation'

interface PhoneSignupFormProps {
  onSuccess: () => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export function PhoneSignupForm({ onSuccess, isLoading, setIsLoading }: PhoneSignupFormProps) {
  const [fullName, setFullName] = useState('')
  const [countryCode, setCountryCode] = useState('+91')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'details' | 'otp'>('details')
  const [errors, setErrors] = useState<{ 
    fullName?: string; 
    phone?: string; 
    otp?: string 
  }>({})
  const [isSkeletonVisible, setIsSkeletonVisible] = useState(false)
  const pathname = usePathname()
  const countryCodes = [
    { code: '+91', country: 'India', flag: '🇮🇳' },
  ]

  const validateDetails = () => {
    const newErrors: { fullName?: string; phone?: string } = {}
    
    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters'
    }
    
    if (!phoneNumber) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^\d{10}$/.test(phoneNumber.replace(/\s+/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateOtp = () => {
    const newErrors: { otp?: string } = {}
    
    if (!otp) {
      newErrors.otp = 'OTP is required'
    } else if (!/^\d{6}$/.test(otp)) {
      newErrors.otp = 'OTP must be 6 digits'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSendOtp = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateDetails()) return
    
    setIsLoading(true)
    setIsSkeletonVisible(true)

    // Show skeleton for 1 second as requested
    setTimeout(async () => {
      try {
        let url = ""
        if(pathname.startsWith('/admin')){
          url  = "/api/admin/auth/phone/send-signup-otp"
        }
        else{
          url = "/api/auth/phone/send-signup-otp"
        }
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            phoneNumber: `${countryCode}${phoneNumber}`,
            fullName: fullName.trim()
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to send OTP')
        }

        setStep('otp')
      } catch (error) {
        console.error('Send OTP error:', error)
        setErrors({ 
          phone: error instanceof Error ? error.message : 'Failed to send OTP' 
        })
      } finally {
        setIsLoading(false)
        setIsSkeletonVisible(false)
      }
    }, 1000)
  }, [fullName, countryCode, phoneNumber, setIsLoading, pathname, validateDetails])

  const handleVerifyOtp = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateOtp()) return
    
    setIsLoading(true)
    setIsSkeletonVisible(true)

    // Show skeleton for 1 second as requested
    setTimeout(async () => {
      try {
        let url = ""
        const requestBody: { phoneNumber: string; fullName: string; otp: string; accessKey?: string } = { 
          phoneNumber: `${countryCode}${phoneNumber}`,
          fullName: fullName.trim(),
          otp
        }

        if(pathname.startsWith('/admin')){
          url = "/api/admin/auth/phone/verify-signup-otp"
          
          // Get access key from localStorage for admin signup
          const accessKey = localStorage.getItem('admin_access_key')
          if (!accessKey) {
            throw new Error('Access key not found. Please start the signup process again.')
          }
          ;(requestBody as { accessKey?: string }).accessKey = accessKey
        }
        else{
          url = "/api/auth/phone/verify-signup-otp"
        }

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Account creation failed')
        }

        // Clear access key from localStorage after successful admin signup
        if (pathname.startsWith('/admin')) {
          localStorage.removeItem('admin_access_key')
          console.log('🔑 [PHONE SIGNUP FORM] Access key cleared from localStorage')
        }

        // Store user session data using storage service
        const { userSessionStorage, userProfileStorage, profileSetupStorage } = await import('@/utils/storage/profileStorage')
        
        userSessionStorage.setUser(data.user)
        if (data.session) {
          userSessionStorage.setSession(data.session)
        }
        
        // Cache user profile if available
        if (data.userProfile) {
          userProfileStorage.setProfile(data.userProfile)
        }
        
        // Check if user needs to complete profile setup
        if (data.needsProfileSetup) {
          // Merge server truth with local milestone completion to avoid redoing completed steps
          const { setupMilestoneStorage } = await import('@/utils/storage/profileStorage')
          const serverSteps: Array<'location' | 'address' | 'profile'> = Array.isArray(data.missingProfileSteps) ? data.missingProfileSteps : []
          const filteredSteps = serverSteps.filter((s) => {
            if (s === 'profile' && setupMilestoneStorage.isCompleted('profile_form')) return false
            return true
          })
          if (filteredSteps.length === 0) {
            onSuccess()
            return
          }
          // Store missing steps for profile setup page
          profileSetupStorage.setMissingSteps(filteredSteps)
          // Redirect to profile setup page
          window.location.href = '/profile-setup'
          return
        }
        
        onSuccess()
      } catch (error) {
        console.error('Account creation error:', error)
        setErrors({ 
          otp: error instanceof Error ? error.message : 'Account creation failed' 
        })
      } finally {
        setIsLoading(false)
        setIsSkeletonVisible(false)
      }
    }, 1000)
  }, [fullName, countryCode, phoneNumber, otp, onSuccess, setIsLoading, pathname, validateOtp])

  if (isSkeletonVisible) {
    return (
      <div className="space-y-4">
        {step === 'details' ? (
          <>
            <Skeleton className="h-4 w-20 bg-white/10" />
            <Skeleton className="h-12 w-full bg-white/10" />
            <Skeleton className="h-4 w-24 bg-white/10" />
            <div className="flex gap-2">
              <Skeleton className="h-12 w-20 bg-white/10" />
              <Skeleton className="h-12 flex-1 bg-white/10" />
            </div>
          </>
        ) : (
          <>
            <Skeleton className="h-4 w-16 bg-white/10" />
            <Skeleton className="h-12 w-full bg-white/10" />
          </>
        )}
        <Skeleton className="h-12 w-full bg-white/10" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {step === 'details' ? (
        <form onSubmit={handleSendOtp} className="space-y-4 w-full">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-white">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="rounded-lg border border-[#2A1203] bg-[#1F0D05] px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none"
              disabled={isLoading}
            />
            {errors.fullName && (
              <p className="text-sm text-red-400">{errors.fullName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-white">Phone Number</Label>
            <div className="flex gap-2">
              <Select value={countryCode} onValueChange={setCountryCode} disabled={isLoading}>
                <SelectTrigger className="w-20 rounded-lg border border-[#2A1203] bg-[#1F0D05] text-white focus:border-orange-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1F0D05] border-[#2A1203]">
                  {countryCodes.map((country) => (
                    <SelectItem 
                      key={country.code} 
                      value={country.code}
                      className="text-white hover:bg-orange-500/20"
                    >
                      <span className="flex items-center gap-2">
                        <span>{country.flag}</span>
                        <span>{country.code}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="flex-1 rounded-lg border border-[#2A1203] bg-[#1F0D05] px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none"
                disabled={isLoading}
                maxLength={10}
              />
            </div>
            {errors.phone && (
              <p className="text-sm text-red-400">{errors.phone}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-b from-orange-500 to-orange-700 py-3 text-lg font-medium text-white transition-transform duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                {Icons.spinner()}
                <span>Sending OTP...</span>
              </div>
            ) : (
              'Send OTP'
            )}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4 w-full">
          <div className="space-y-2">
            <Label htmlFor="otp" className="text-white">Enter OTP</Label>
            <p className="text-sm text-gray-400">
              We sent a 6-digit code to {countryCode}{phoneNumber}
            </p>
            <Input
              id="otp"
              type="text"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="rounded-lg border border-[#2A1203] bg-[#1F0D05] px-4 py-3 text-center text-2xl tracking-widest text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none"
              disabled={isLoading}
              maxLength={6}
            />
            {errors.otp && (
              <p className="text-sm text-red-400">{errors.otp}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-b from-orange-500 to-orange-700 py-3 text-lg font-medium text-white transition-transform duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                {Icons.spinner()}
                <span>Creating Account...</span>
              </div>
            ) : (
              'Create Account'
            )}
          </Button>

          <Button
            type="button"
            variant="link"
            className="w-full text-sm text-orange-400 hover:text-orange-300"
            onClick={() => setStep('details')}
            disabled={isLoading}
          >
            Change details
          </Button>

          <Button
            type="button"
            variant="link"
            className="w-full text-sm text-orange-400 hover:text-orange-300"
            disabled={isLoading}
            onClick={() => handleSendOtp({ preventDefault: () => {} } as React.FormEvent)}
          >
            Resend OTP
          </Button>
        </form>
      )}
    </div>
  )
}
