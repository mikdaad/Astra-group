import { NextResponse } from 'next/server'
import { createClient } from '../../../utils/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser()
  if (userErr || !user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { data, error } = await supabase.rpc('consume_user_update_flags', {
    p_user_id: user.id,
    p_clear_referral: true,
    p_clear_referral2: true,
    p_clear_transactions: true,
    
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  // data is a single row: { referral_update_flag, referral2_update_flag, transactions_update_flag }
  return NextResponse.json(data?.[0] ?? { referral_update_flag: false, referral2_update_flag: false, transactions_update_flag: false })
}
