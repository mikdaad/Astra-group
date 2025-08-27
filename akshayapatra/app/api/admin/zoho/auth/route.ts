import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { hasAdminAccess } from '@/utils/admin/permissions'
import { getZohoAccessToken } from  "@/app/lib/zoho/auth"

export const runtime = 'nodejs'      // keep Node runtime for server env vars
export const dynamic = 'force-dynamic' // avoid caching of auth endpoint

export async function POST(req: NextRequest) {
  try {
    console.log('🔑 [ZOHO AUTH API] Request received')

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.warn('🔑 [ZOHO AUTH API] Unauthorized: No user found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // const hasAccess = await hasAdminAccess(user, supabase)
    // if (!hasAccess) {
    //   console.warn('🔑 [ZOHO AUTH API] Forbidden: User lacks admin access', { userId: user.id })
    //   return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    // }

    const accessToken = await getZohoAccessToken()
    console.log('🔑 [ZOHO AUTH API] Access token generated successfully')

    return NextResponse.json({
      success: true,
      token: accessToken,
      message: 'Zoho access token generated successfully',
    })
  } catch (error) {
    console.error('🔑 [ZOHO AUTH API] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to authenticate with Zoho Desk',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// ❌ Do NOT export anything else from this file (no `export { getZohoAccessToken }`)
