import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'



export async function POST(req: NextRequest) {
  console.log('🚪 [LOGOUT API] Request received')
  
  try {
    // Prepare a response object that we will mutate cookies on
    const supabaseResponse = NextResponse.json({ ok: true })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )
    
    console.log('🚪 [LOGOUT API] Supabase client created')
    
    const { error } = await supabase.auth.signOut()
    console.log('🚪 [LOGOUT API] Logout result:', { success: !error, error: error?.message })

    if (error) {
      console.log('🚪 [LOGOUT API] Error occurred:', error.message)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log('🚪 [LOGOUT API] Logout successful')

    // Also clear any custom auth cookies we set during login flows
    try {
      supabaseResponse.cookies.delete('user')
      supabaseResponse.cookies.delete('session')
    } catch {}

    // IMPORTANT: Return the supabaseResponse so cookie updates from signOut are preserved
    return supabaseResponse
  } catch (err) {
    console.error('🚪 [LOGOUT API] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}