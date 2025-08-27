import { createClient } from '@/utils/supabase/client'

export async function ensureProfileOnServer(payload: {
  full_name?: string
  phone_number?: string
  referral_code?: string | null
  scheme_id?: string | null
}) {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  let token = session?.access_token as string | undefined
  let refreshToken = session?.refresh_token as string | undefined

  // Fallback: read from legacy/local storage key if the app saved it manually
  if (!token && typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem('session')
      if (raw) {
        const parsed = JSON.parse(raw)
        token = parsed?.access_token || token
        refreshToken = parsed?.refresh_token || refreshToken
      }
    } catch {
      // ignore
    }
  }

  // Hydrate Supabase client session if we found tokens from storage
  if (!session && token && refreshToken) {
    try {
      await supabase.auth.setSession({ access_token: token, refresh_token: refreshToken })
    } catch {
      // ignore
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) headers.Authorization = `Bearer ${token}`

  console.log('[ensureProfileOnServer] calling /api/ensure-profile', {
    hasToken: !!token,
    payload,
  })

  const res = await fetch('/api/ensure-profile', {
    method: 'POST',
    credentials: 'include',
    headers,
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    // Surface 401 specifically to help the caller decide to wait for session
    if (res.status === 401) throw new Error('Unauthorized')
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}


