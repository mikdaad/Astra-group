'use server'

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

const REF_COOKIE = 'referral_code'

export async function completeOnboard() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // It's fine if setAll is called from a Server Action without direct cookie mutation capability
          }
        },
      },
    }
  )

  // 1) Get current user
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser()
  if (userErr || !user) throw userErr ?? new Error('No auth user')

  // 2) Attach referral if present and not self
  const code = cookieStore.get(REF_COOKIE)?.value
  if (code) {
    // call RPC attach_user_referral_by_code(p_user_id, p_referral_code)
    const { error: rpcErr } = await supabase.rpc('attach_user_referral_by_code', {
      p_user_id: user.id,
      p_referral_code: code,
    })
    // Ignore if already attached / invalid code; you can also surface error.
    if (!rpcErr) {
      cookieStore.delete(REF_COOKIE)
    }
  }

  // 3) (Optional) Create a default card, set commission destination, etc.
  // await supabase.rpc('set_commission_destination_card', { p_user_id: user.id, p_card_id })

  return { ok: true }
}
