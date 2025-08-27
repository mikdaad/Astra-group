import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(req: NextRequest) {
  console.log('📱 [PHONE VERIFY API] Verify OTP request received')
  
  try {
    const { phoneNumber, otp } = await req.json()
    console.log('📱 [PHONE VERIFY API] Phone:', phoneNumber, 'OTP length:', otp?.length)
    
    if (!phoneNumber || !otp) {
      return NextResponse.json({ error: 'Phone number and OTP are required' }, { status: 400 })
    }

    const supabase = await createClient()

    console.log('📱 [PHONE VERIFY API] Supabase client created')
    
    // Verify the OTP
    const { data, error } = await supabase.auth.verifyOtp({
      phone: phoneNumber,
      token: otp,
      type: 'sms'
    })
    
    console.log('📱 [PHONE VERIFY API] OTP verification result:', { success: !error, error: error?.message })

    if (error) {
      console.log('📱 [PHONE VERIFY API] Error occurred:', error.message)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log('📱 [PHONE VERIFY API] Phone login successful for user:', data.user?.phone)
    
    // Fetch user profile & validate status
    let profile = null
    
    if (data.user) {
      const { data: profileData, error: profileError } = await supabase
        .from('staff_profiles')
        .select('isActive')
        .eq('id', data.user.id)
        .single()
      
      profile = profileData
      
      if (!profileError) {
        if(!profile?.isActive){
          return NextResponse.json({ error: 'User is not active' }, { status: 400 })
        }
      }
    }
    
    // Return response with cookies set
    const res = NextResponse.json(
      { 
        user: data.user, 
        session: data.session,
        userProfile: profile || null,
      },
      { status: 200 }
    )
    res.cookies.set('user', JSON.stringify(data.user))
    res.cookies.set('session', JSON.stringify(data.session))
    if (profile) {
      res.cookies.set('userProfile', JSON.stringify(profile))
    }
    return res
  } catch (err) {
    console.error('📱 [PHONE VERIFY API] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
