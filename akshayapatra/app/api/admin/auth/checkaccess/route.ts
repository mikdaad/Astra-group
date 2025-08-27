import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(req: NextRequest) {
  try {
    console.log('🔑 [ADMIN ACCESS CHECK API] Request received')

    // Parse request body
    const { accessKey } = await req.json()

    if (!accessKey || typeof accessKey !== 'string') {
      console.warn('🔑 [ADMIN ACCESS CHECK API] Missing or invalid access key')
      return NextResponse.json(
        { error: 'Access key is required and must be a string' },
        { status: 400 }
      )
    }

    // Create Supabase client
    const supabase = await createClient()
    console.log('🔑 [ADMIN ACCESS CHECK API] Supabase client created')

    // Call the RPC function to verify access key
    const { data, error } = await supabase.rpc('validate_admin_access_key', {
      access_key: accessKey
    })

    if (error) {
      console.error('🔑 [ADMIN ACCESS CHECK API] RPC function error:', error)
      return NextResponse.json(
        { error: 'Failed to verify access key', details: error.message },
        { status: 500 }
      )
    }

    console.log('🔑 [ADMIN ACCESS CHECK API] Access key verification result:', data)

    // Return the boolean result
    return NextResponse.json({
      isValid: data === true,
      message: data === true ? 'Access key verified successfully' : 'Invalid access key'
    })

  } catch (error) {
    console.error('🔑 [ADMIN ACCESS CHECK API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
