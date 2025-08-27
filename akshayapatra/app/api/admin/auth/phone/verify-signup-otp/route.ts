import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(req: NextRequest) {
  console.log('📱 [PHONE SIGNUP VERIFY API] Verify signup OTP request received')
  
  try {
    const { phoneNumber, fullName, otp, accessKey } = await req.json()
    console.log('📱 [ADMIN SIGNUP VERIFY API] Phone:', phoneNumber, 'Name:', fullName, 'OTP length:', otp?.length, 'Has access key:', !!accessKey)
    
    if (!phoneNumber || !fullName || !otp) {
      return NextResponse.json({ error: 'Phone number, full name, and OTP are required' }, { status: 400 })
    }

    if (!accessKey) {
      return NextResponse.json({ error: 'Access key is required for admin signup' }, { status: 400 })
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

      if (updateError) {
        console.warn('📱 [ADMIN SIGNUP VERIFY API] Could not update user auth profile:', updateError.message)
      } else {
        console.log('📱 [ADMIN SIGNUP VERIFY API] User auth profile updated with full name')
      }

      const { data: staffData, error: staffError } = await (await supabase).rpc('create_staff_profile', {
        user_id: data.user.id,
        access_key: accessKey,
        full_name: fullName,
        phone_number: phoneNumber
      })
      if (!staffData) {
        console.error('📱 [ADMIN SIGNUP VERIFY API] Failed to create staff profile')
        return NextResponse.json({ 
          error: 'Failed to create staff profile' 
        }, { status: 400 })
      }

      console.log('📱 [ADMIN SIGNUP VERIFY API] Staff profile created successfully:', staffData)
    }

    return NextResponse.json({
        user: data.user, 
        session: data.session,
        message: 'Admin signup completed successfully'
      },
      { status: 200 }
    )
  } catch (err) {
    console.error('📱 [PHONE SIGNUP VERIFY API] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
