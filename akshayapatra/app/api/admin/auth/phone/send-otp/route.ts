import { NextRequest, NextResponse } from 'next/server'
import { createApiClient } from '@/utils/supabase/api'

export async function POST(req: NextRequest) {
  console.log('📱 [PHONE OTP API] Send OTP request received')
  
  try {
    const { phoneNumber } = await req.json()
    console.log('📱 [PHONE OTP API] Phone number:', phoneNumber)
    
    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    // Validate phone number format
    const phoneRegex = /^\+\d{1,4}\d{10,15}$/
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 })
    }

    const supabase = createApiClient()
    console.log('📱 [PHONE OTP API] Supabase client created')
    
    // Check if user already exists
    //TODO: IMPLEMENT RLS
    const { data: existingUser, error: existingUserError } = await supabase
        .from('staff_profiles')
        .select('id')
        .eq('phone_number', phoneNumber)
        .single()
      
    if (!existingUser) {
      return NextResponse.json({ error: 'User with this phone number does not exist' }, { status: 409 })
    }
    // Use Supabase phone authentication
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: phoneNumber,
      options: {
        channel: 'sms'
      }
    })
    
    console.log('📱 [PHONE OTP API] OTP send result:', { success: !error, error: error?.message })

    if (error) {
      console.log('📱 [PHONE OTP API] Error occurred:', error.message)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log('📱 [PHONE OTP API] OTP sent successfully to:', phoneNumber)
    return NextResponse.json({ 
      message: 'OTP sent successfully',
      success: true 
    })
  } catch (err) {
    console.error('📱 [PHONE OTP API] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
