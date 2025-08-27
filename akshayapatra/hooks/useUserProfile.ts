'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useAuth } from './useAuth'

export interface UserProfile {
  id: string
  full_name: string
  phone_number: string
  email?: string
  profile_image_url?: string
  user_code?: string
  last_updated?: string
}

const CACHE_KEY = 'user_profile_cache'
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

// Local storage utilities
const storage = {
  get: (key: string): any => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.warn('Failed to get item from localStorage:', error)
      return null
    }
  },
  
  set: (key: string, value: any): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.warn('Failed to set item in localStorage:', error)
    }
  },
  
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.warn('Failed to remove item from localStorage:', error)
    }
  }
}

// Check if cache is valid
const isCacheValid = (cachedData: any): boolean => {
  if (!cachedData || !cachedData.last_updated) return false
  
  const now = Date.now()
  const cacheTime = new Date(cachedData.last_updated).getTime()
  return (now - cacheTime) < CACHE_DURATION
}

export function useUserProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) {
        setProfile(null)
        setLoading(false)
        // Clear cache when user logs out
        storage.remove(CACHE_KEY)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        // Check cache first
        const cachedProfile = storage.get(CACHE_KEY)
        if (cachedProfile && cachedProfile.id === user.id && isCacheValid(cachedProfile)) {
          console.log('Using cached profile data')
          setProfile(cachedProfile)
          setLoading(false)
          return
        }
        
        const supabase = createClient()
        
        const { data, error: profileError } = await supabase
          .from('user_profiles')
          .select('id, full_name, phone_number, profile_image_url, user_code, updated_at')
          .eq('id', user.id)
          .single()

        if (profileError) {
          console.error('Error fetching user profile:', profileError)
          setError(profileError.message)
          
          // If we have cached data but it's expired, use it as fallback
          if (cachedProfile && cachedProfile.id === user.id) {
            console.log('Using expired cached profile as fallback')
            setProfile(cachedProfile)
          } else {
            setProfile(null)
          }
        } else if (data) {
          const newProfile: UserProfile = {
            id: data.id,
            full_name: data.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            phone_number: data.phone_number || user.phone || '',
            email: user.email || '',
            profile_image_url: data.profile_image_url,
            user_code: data.user_code,
            last_updated: new Date().toISOString()
          }
          
          // Cache the new profile data
          storage.set(CACHE_KEY, newProfile)
          setProfile(newProfile)
        } else {
          // Fallback to auth user data if no profile exists
          const fallbackProfile: UserProfile = {
            id: user.id,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            phone_number: user.phone || '',
            email: user.email || '',
            profile_image_url: user.user_metadata?.profile_image_url,
            last_updated: new Date().toISOString()
          }
          
          // Cache the fallback profile
          storage.set(CACHE_KEY, fallbackProfile)
          setProfile(fallbackProfile)
        }
      } catch (err) {
        console.error('Error in useUserProfile:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        
        // Try to use cached data as fallback
        const cachedProfile = storage.get(CACHE_KEY)
        if (cachedProfile && cachedProfile.id === user.id) {
          console.log('Using cached profile as error fallback')
          setProfile(cachedProfile)
        } else {
          setProfile(null)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user?.id, user?.email, user?.phone, user?.user_metadata])

  // Function to manually refresh profile data
  const refetch = async () => {
    if (!user?.id) return
    
    // Clear cache to force fresh fetch
    storage.remove(CACHE_KEY)
    setLoading(true)
    
    try {
      const supabase = createClient()
      
      const { data, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, full_name, phone_number, profile_image_url, user_code, updated_at')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('Error refetching user profile:', profileError)
        setError(profileError.message)
      } else if (data) {
        const newProfile: UserProfile = {
          id: data.id,
          full_name: data.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          phone_number: data.phone_number || user.phone || '',
          email: user.email || '',
          profile_image_url: data.profile_image_url,
          user_code: data.user_code,
          last_updated: new Date().toISOString()
        }
        
        // Update cache with fresh data
        storage.set(CACHE_KEY, newProfile)
        setProfile(newProfile)
        setError(null)
      }
    } catch (err) {
      console.error('Error in refetch:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  // Function to clear cache
  const clearCache = () => {
    storage.remove(CACHE_KEY)
  }

  // Function to update profile locally (for optimistic updates)
  const updateProfileLocally = (updates: Partial<UserProfile>) => {
    if (profile) {
      const updatedProfile = {
        ...profile,
        ...updates,
        last_updated: new Date().toISOString()
      }
      storage.set(CACHE_KEY, updatedProfile)
      setProfile(updatedProfile)
    }
  }

  return {
    profile,
    loading,
    error,
    refetch,
    clearCache,
    updateProfileLocally
  }
}
