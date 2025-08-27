import { NextRequest, NextResponse } from 'next/server'
import { createApiClient } from '@/utils/supabase/api'

export async function POST(req: NextRequest) {
  console.log('📱 [PHONE SIGNUP OTP API] Send signup OTP request received')
  
  try {
    const { phoneNumber, fullName } = await req.json()
    console.log('📱 [PHONE SIGNUP OTP API] Phone:', phoneNumber, 'Name:', fullName)
    
    if (!phoneNumber || !fullName) {
      return NextResponse.json({ error: 'Phone number and full name are required' }, { status: 400 })
    }

    // Validate phone number format
    const phoneRegex = /^\+\d{1,4}\d{10}$/
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json({ error: 'Invalid phone number format. Please enter a valid 10-digit phone number.' }, { status: 400 })
    }

    const supabase = createApiClient()
    console.log('📱 [PHONE SIGNUP OTP API] Supabase client created')
    
    // Check if user already exists
        //TODO: IMPLEMENT RLS

    const { data: existingUser, error: existingUserError } = await supabase
      .from('staff_profiles')
      .select('id')
      .eq('phone_number', phoneNumber)
      .single()
    
    if (existingUser) {
      return NextResponse.json({ error: 'User with this phone number already exists' }, { status: 409 })
    }
    
    // Use Supabase phone authentication for signup
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: phoneNumber,
      options: {
        channel: 'sms',
        data: {
          full_name: fullName
        }
      }
    })
    
    console.log('📱 [PHONE SIGNUP OTP API] OTP send result:', { success: !error, error: error?.message })

    if (error) {
      console.log('📱 [PHONE SIGNUP OTP API] Error occurred:', error.message)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log('📱 [PHONE SIGNUP OTP API] Signup OTP sent successfully to:', phoneNumber)
    return NextResponse.json({ 
      message: 'OTP sent successfully',
      success: true 
    })
  } catch (err) {
    console.error('📱 [PHONE SIGNUP OTP API] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
