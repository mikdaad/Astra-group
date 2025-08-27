import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(req: NextRequest) {
  console.log('🔗 [REFERRAL VALIDATE API] Request received')
  
  try {
    const { referralCode } = await req.json()
    console.log('🔗 [REFERRAL VALIDATE API] Validating code:', referralCode)
    
    if (!referralCode) {
      return NextResponse.json({ error: 'Referral code is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Check if referral code exists and get referrer info
    const { data: referrer, error } = await supabase
      .from('user_profiles')
      .select('id, full_name, referral_code')
      .eq('referral_code', referralCode)
      .single()

    if (error || !referrer) {
      console.log('🔗 [REFERRAL VALIDATE API] Invalid referral code')
      return NextResponse.json({ 
        valid: false, 
        error: 'Invalid referral code' 
      }, { status: 400 })
    }

    console.log('🔗 [REFERRAL VALIDATE API] Valid referral code for:', referrer.full_name)
    
    return NextResponse.json({
      valid: true,
      referrer: {
        id: referrer.id,
        name: referrer.full_name,
        code: referrer.referral_code
      }
    })
  } catch (err) {
    console.error('🔗 [REFERRAL VALIDATE API] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
