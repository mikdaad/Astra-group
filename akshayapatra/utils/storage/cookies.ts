/**
 * Utility functions for setting, getting, and deleting cookies.
 * Works in both browser and server (Next.js API route) environments.
 */

// Set a cookie (browser only)
// --- Cookie helpers (unchanged) ---
// --- Cookie helpers using next/headers (for server components/routes) and fallback to browser for client ---

// Note: next/headers is imported dynamically to avoid client-side import errors

type CookieOptions = {
  days?: number
  path?: string
  sameSite?: 'lax' | 'strict' | 'none'
  secure?: boolean
}

/**
 * Set a cookie (works in both client and server environments).
 * In server (Next.js app route/server component), uses next/headers.
 * In browser, uses document.cookie.
 */
export async function setCookie(
  name: string,
  value: string,
  options: CookieOptions = {}
) {
  // Server-side (Next.js app route/server component)
  if (typeof window === 'undefined' && typeof document === 'undefined') {
    // Only works in server actions/routes/components
    try {
      const { cookies: nextCookies } = await import('next/headers')
      const cookieStore = await nextCookies()
      let cookieOptions: any = {
        path: options.path || '/',
        sameSite: options.sameSite || 'lax',
        secure: options.secure ?? true,
      }
      if (options.days) {
        const expires = new Date()
        expires.setTime(expires.getTime() + options.days * 24 * 60 * 60 * 1000)
        cookieOptions.expires = expires
      }
      cookieStore.set(name, value, cookieOptions)
    } catch (e) {
      // Not in a server context where next/headers is available
    }
    return
  }

  // Client-side
  if (typeof document !== 'undefined') {
    let cookieStr = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`

    if (options.days) {
      const date = new Date()
      date.setTime(date.getTime() + options.days * 24 * 60 * 60 * 1000)
      cookieStr += `; expires=${date.toUTCString()}`
    }

    cookieStr += `; path=${options.path || '/'}`
    if (options.sameSite) cookieStr += `; SameSite=${options.sameSite}`
    if (options.secure ?? true) cookieStr += `; Secure`

    document.cookie = cookieStr
  }
}

/**
 * Get a cookie value by name (works in both client and server environments).
 */
export async function getCookie(name: string): Promise<string | null> {
  // Server-side (Next.js app route/server component)
  if (typeof window === 'undefined' && typeof document === 'undefined') {
    try {
      const { cookies: nextCookies } = await import('next/headers')
      const cookieStore = await nextCookies()
      const value = cookieStore.get(name)
      return value?.value ?? null
    } catch (e) {
      // Not in a server context where next/headers is available
      return null
    }
  }

  // Client-side
  if (typeof document !== 'undefined') {
    const nameEQ = encodeURIComponent(name) + '='
    const ca = document.cookie.split(';')
    for (let c of ca) {
      c = c.trim()
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length))
      }
    }
  }
  return null
}

/**
 * Delete a cookie by name (works in both client and server environments).
 */
export async function deleteCookie(name: string, path: string = '/') {
  // Server-side
  if (typeof window === 'undefined' && typeof document === 'undefined') {
    try {
      const { cookies: nextCookies } = await import('next/headers')
      const cookieStore = await nextCookies()
      cookieStore.delete(name)
    } catch (e) {
      // Not in a server context where next/headers is available
    }
    return
  }

  // Client-side
  await setCookie(name, '', { days: -1, path })
}

/**
 * Get all cookies as an object (works in both client and server environments).
 */
export async function getAllCookies(): Promise<Record<string, string>> {
  // Server-side
  if (typeof window === 'undefined' && typeof document === 'undefined') {
    try {
      const { cookies: nextCookies } = await import('next/headers')
      const cookieStore = await nextCookies()
      const all = cookieStore.getAll()
      const result: Record<string, string> = {}
      for (const c of all) {
        result[c.name] = c.value
      }
      return result
    } catch (e) {
      return {}
    }
  }

  // Client-side
  if (typeof document !== 'undefined') {
    const cookies: Record<string, string> = {}
    document.cookie.split(';').forEach(cookie => {
      const [name, ...rest] = cookie.trim().split('=')
      if (name) {
        cookies[decodeURIComponent(name)] = decodeURIComponent(rest.join('='))
      }
    })
    return cookies
  }
  return {}
}

// --- User/session/referral helpers ---

/**
 * Save user and session data to localStorage and/or cookies.
 * @param user The user object to save.
 * @param session The session object to save.
 * @param options Optional: { cookie?: boolean, days?: number }
 */
export function saveUserSession(
  user: any,
  session: any,
  options: { cookie?: boolean; days?: number } = {}
) {
  // Only run in browser
  if (typeof window === 'undefined') return

  // Save to localStorage
  if (user) localStorage.setItem('user', JSON.stringify(user))
  if (session) localStorage.setItem('session', JSON.stringify(session))

  // Optionally save to cookies (client-side)
  if (options.cookie && typeof document !== 'undefined') {
    const days = options.days ?? 7
    const date = new Date()
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
    const expires = `; expires=${date.toUTCString()}`
    
    document.cookie = `user=${encodeURIComponent(JSON.stringify(user))}${expires}; path=/; SameSite=lax; Secure`
    document.cookie = `session=${encodeURIComponent(JSON.stringify(session))}${expires}; path=/; SameSite=lax; Secure`
  }
}

/**
 * Fetch referral code from URL or cookie, and save to cookie/localStorage.
 * @returns The referral code if found, else null.
 */
export function fetchAndSaveReferral(): string | null {
  if (typeof window === 'undefined') return null

  // Try to get from URL
  const urlParams = new URLSearchParams(window.location.search)
  let referral = urlParams.get('ref') || urlParams.get('referral')

  // If not in URL, try cookie (client-side only for this helper)
  if (!referral && typeof document !== 'undefined') {
    const nameEQ = encodeURIComponent('referral') + '='
    const ca = document.cookie.split(';')
    for (let c of ca) {
      c = c.trim()
      if (c.indexOf(nameEQ) === 0) {
        referral = decodeURIComponent(c.substring(nameEQ.length))
        break
      }
    }
  }

  // If found, save to cookie and localStorage (client-side)
  if (referral && typeof document !== 'undefined') {
    // Use synchronous client-side cookie setting
    let cookieStr = `${encodeURIComponent('referral')}=${encodeURIComponent(referral)}`
    const date = new Date()
    date.setTime(date.getTime() + 30 * 24 * 60 * 60 * 1000)
    cookieStr += `; expires=${date.toUTCString()}`
    cookieStr += `; path=/; SameSite=lax; Secure`
    document.cookie = cookieStr
    
    localStorage.setItem('referral', referral)
    return referral
  }

  return null
}

/**
 * Get referral code from localStorage or cookie.
 */
export function getReferral(): string | null {
  if (typeof window === 'undefined') return null
  
  // Try localStorage first
  const localReferral = localStorage.getItem('referral')
  if (localReferral) return localReferral
  
  // Fallback to cookie (client-side only)
  if (typeof document !== 'undefined') {
    const nameEQ = encodeURIComponent('referral') + '='
    const ca = document.cookie.split(';')
    for (let c of ca) {
      c = c.trim()
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length))
      }
    }
  }
  
  return null
}

/**
 * Remove user/session/referral from localStorage and cookies.
 */
export function clearUserSessionAndReferral() {
  if (typeof window === 'undefined') return

  localStorage.removeItem('user')
  localStorage.removeItem('session')
  localStorage.removeItem('referral')
  
  // Clear cookies client-side synchronously
  document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
  document.cookie = 'session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
  document.cookie = 'referral=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
}
