/**
 * Profile Cache Management Utilities
 * Handles localStorage caching for user profile data
 */

const CACHE_KEY = 'user_profile_cache'

export interface CachedProfile {
  id: string
  full_name: string
  phone_number: string
  email?: string
  profile_image_url?: string
  user_code?: string
  last_updated: string
}

// Local storage utilities with error handling
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

/**
 * Get cached profile data
 */
export const getCachedProfile = (): CachedProfile | null => {
  return storage.get(CACHE_KEY)
}

/**
 * Set cached profile data
 */
export const setCachedProfile = (profile: CachedProfile): void => {
  storage.set(CACHE_KEY, profile)
}

/**
 * Clear cached profile data
 */
export const clearCachedProfile = (): void => {
  storage.remove(CACHE_KEY)
}

/**
 * Check if cached profile is valid (not expired)
 */
export const isCachedProfileValid = (cachedProfile: CachedProfile | null): boolean => {
  if (!cachedProfile || !cachedProfile.last_updated) return false
  
  const now = Date.now()
  const cacheTime = new Date(cachedProfile.last_updated).getTime()
  const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours
  
  return (now - cacheTime) < CACHE_DURATION
}

/**
 * Update cached profile with new data
 * This should be called whenever profile is updated in the database
 */
export const updateCachedProfile = (updates: Partial<CachedProfile>): void => {
  const currentProfile = getCachedProfile()
  if (currentProfile) {
    const updatedProfile = {
      ...currentProfile,
      ...updates,
      last_updated: new Date().toISOString()
    }
    setCachedProfile(updatedProfile)
  }
}

/**
 * Invalidate cache for a specific user
 * This forces a fresh fetch on next use
 */
export const invalidateProfileCache = (userId?: string): void => {
  if (userId) {
    const cachedProfile = getCachedProfile()
    if (cachedProfile && cachedProfile.id === userId) {
      clearCachedProfile()
    }
  } else {
    clearCachedProfile()
  }
}

/**
 * Get profile cache info for debugging
 */
export const getProfileCacheInfo = () => {
  const cachedProfile = getCachedProfile()
  if (!cachedProfile) {
    return { hasCache: false }
  }
  
  const isValid = isCachedProfileValid(cachedProfile)
  const lastUpdated = new Date(cachedProfile.last_updated)
  const ageInMinutes = Math.floor((Date.now() - lastUpdated.getTime()) / (1000 * 60))
  
  return {
    hasCache: true,
    isValid,
    lastUpdated: lastUpdated.toISOString(),
    ageInMinutes,
    userId: cachedProfile.id
  }
}

/**
 * Listen for profile updates and invalidate cache
 * This can be used in components that update profile data
 */
export const createProfileUpdateListener = () => {
  const originalFetch = window.fetch
  
  window.fetch = async (...args) => {
    const response = await originalFetch(...args)
    
    // Check if this is a profile update request
    const [url, options] = args
    if (typeof url === 'string' && url.includes('/api/profile/update')) {
      // Invalidate cache after successful profile update
      if (response.ok) {
        console.log('Profile updated, invalidating cache')
        clearCachedProfile()
      }
    }
    
    return response
  }
  
  // Return cleanup function
  return () => {
    window.fetch = originalFetch
  }
}
