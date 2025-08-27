import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(req: NextRequest) {
  console.log('📱 [PHONE SIGNUP VERIFY API] Verify signup OTP request received')
  
  try {
    const { phoneNumber, fullName, otp } = await req.json()
    console.log('📱 [PHONE SIGNUP VERIFY API] Phone:', phoneNumber, 'Name:', fullName, 'OTP length:', otp?.length)
    
    if (!phoneNumber || !fullName || !otp) {
      return NextResponse.json({ error: 'Phone number, full name, and OTP are required' }, { status: 400 })
    }

    const supabase = createClient()
    
    console.log('📱 [PHONE SIGNUP VERIFY API] Supabase client created')
    
    // Verify the OTP and create the user account
    const { data, error } = await (await supabase).auth.verifyOtp({
      phone: phoneNumber,
      token: otp,
      type: 'sms'
    })
    
    console.log('📱 [PHONE SIGNUP VERIFY API] OTP verification result:', { success: !error, error: error?.message })

    if (error) {
      console.log('📱 [PHONE SIGNUP VERIFY API] Error occurred:', error.message)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Update user profile with full name if verification successful
    if (data.user) {
      const { error: updateError } = await (await supabase).auth.updateUser({
        data: {
          full_name: fullName,
          display_name: fullName
        }
      })

      //update user_profiles table with full name
      const { error: updateUserProfileError } = await (await supabase).from('user_profiles').update({
        full_name: fullName,
        phone_verified: true
      }).eq('id', data.user.id)

      
      if (updateError) {
        console.warn('📱 [PHONE SIGNUP VERIFY API] Could not update user profile:', updateError.message)
      } else {
        console.log('📱 [PHONE SIGNUP VERIFY API] User profile updated with full name')
      }

      // Ensure backend profile row exists via RPC
      // The RPC function gets user_id from auth.uid() context, not as parameter
      const referralCookie = req.cookies.get('referral_code')?.value ?? null
      console.log('📱 [PHONE SIGNUP VERIFY API] Referral cookie:', referralCookie)
      
      const { error: ensureErr } = await (await supabase).rpc('ensure_profile', {
        p_full_name: fullName,
        p_phone: phoneNumber,
        p_referral_code: referralCookie,
        p_user_id: data.user.id
      })
      if (ensureErr) {
        console.warn('📱 [PHONE SIGNUP VERIFY API] ensure_profile failed:', ensureErr.message)
      } else {
        console.log('📱 [PHONE SIGNUP VERIFY API] ensure_profile succeeded')
      }
    }

    console.log('📱 [PHONE SIGNUP VERIFY API] Phone signup successful for user:', data.user?.phone)
    
    // For new signups, always require profile completion
    const needsProfileSetup = true
    const missingProfileSteps = ['location', 'address', 'profile']
    
    console.log('📱 [PHONE SIGNUP VERIFY API] New signup - all profile steps required:', missingProfileSteps)
    
    // Create response with cookies
    const response = NextResponse.json({
      user: data.user, 
      session: data.session,
      needsProfileSetup,
      missingProfileSteps,
      userProfile: null
    })

    // Set cookies on response
    response.cookies.set('needsProfileSetup', needsProfileSetup.toString())
    response.cookies.set('missingProfileSteps', JSON.stringify(missingProfileSteps))
    
    return response
  } catch (err) {
    console.error('📱 [PHONE SIGNUP VERIFY API] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
