import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(req: NextRequest) {
  try {
    let supabaseResponse = NextResponse.next({ request: req })
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return req.cookies.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
            supabaseResponse = NextResponse.next({ request: req })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data, error } = await supabase
      .from('schemes')
      .select('id,name,status,image_url,subscription_amount')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ success: false, schemes: [] }, { status: 200 })
    }
    return NextResponse.json({ success: true, schemes: data ?? [] })
  } catch (e) {
    return NextResponse.json({ success: false, schemes: [] }, { status: 200 })
  }
}


