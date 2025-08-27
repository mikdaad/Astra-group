// lib/ensureProfile.ts
import { createClient } from '@/utils/supabase/client'

type Payload = { referral_code?: string | null } & Record<string, unknown>

export async function ensureProfileOnServer(payload: Payload) {
  const sb = createClient()
  const { data: { session } } = await sb.auth.getSession()

  const res = await fetch('/api/ensure-profile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
    },
    credentials: 'include',               // <-- IMPORTANT
    body: JSON.stringify(payload ?? {}),
  })

  const err = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401) throw new Error('Unauthorized')
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return err
}
