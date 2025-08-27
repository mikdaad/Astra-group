import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: userErr } = await supabase.auth.getUser()
    if (userErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { full_name: bodyFullName, phone_number: bodyPhone, referral_code: bodyReferral } = await req.json().catch(() => ({}))

    type UserMetadata = { full_name?: string; display_name?: string }
    const metadata = user.user_metadata as UserMetadata | null
    const full_name = bodyFullName || metadata?.full_name || metadata?.display_name || ''
    const phone_number = bodyPhone || user.phone || ''

    const referralCookie = req.cookies.get('referral_code')?.value
    const referral_code = bodyReferral ?? referralCookie ?? null

    const { data: rpcData, error: rpcError } = await supabase.rpc('ensure_profile', {
      p_full_name: full_name,
      p_phone: phone_number,
      p_referral_code: referral_code,
    })

    if (rpcError) {
      return NextResponse.json({ error: rpcError.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true, data: rpcData })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}




