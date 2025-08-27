'use client'

import { useState } from 'react'
import { useUserProfile } from './useUserProfile'
import { clearCachedProfile, updateCachedProfile } from '@/utils/profileCache'

export interface ProfileUpdateData {
  full_name?: string
  phone_number?: string
  country?: string
  state?: string
  district?: string
  street_address?: string
  postal_code?: string
  bank_account_holder_name?: string
  bank_account_number?: string
  bank_ifsc_code?: string
  bank_name?: string
  bank_branch?: string
  bank_account_type?: 'savings' | 'current'
  profile_image_url?: string
}

export function useProfileUpdate() {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { profile, refetch, updateProfileLocally } = useUserProfile()

  const updateProfile = async (updates: ProfileUpdateData) => {
    if (!profile?.id) {
      setError('No profile found')
      return false
    }

    setUpdating(true)
    setError(null)

    try {
      // Optimistic update - update UI immediately
      updateProfileLocally(updates)

      // Make API call
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile')
      }

      // Check if cache should be invalidated
      if (response.headers.get('X-Cache-Invalidate') === 'true' || data.cacheInvalidated) {
        console.log('Profile updated, invalidating cache')
        clearCachedProfile()
        // Refetch fresh data
        await refetch()
      }

      console.log('Profile updated successfully:', data)
      return true

    } catch (err) {
      console.error('Error updating profile:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      
      // Revert optimistic update on error
      await refetch()
      return false
    } finally {
      setUpdating(false)
    }
  }

  const updateProfileField = async (field: keyof ProfileUpdateData, value: string) => {
    return updateProfile({ [field]: value } as ProfileUpdateData)
  }

  const updateName = async (fullName: string) => {
    return updateProfileField('full_name', fullName)
  }

  const updatePhone = async (phoneNumber: string) => {
    return updateProfileField('phone_number', phoneNumber)
  }

  const updateAvatar = async (avatarUrl: string) => {
    return updateProfileField('profile_image_url', avatarUrl)
  }

  return {
    updateProfile,
    updateProfileField,
    updateName,
    updatePhone,
    updateAvatar,
    updating,
    error,
    profile
  }
}
