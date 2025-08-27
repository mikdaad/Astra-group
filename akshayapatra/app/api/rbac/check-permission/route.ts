import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { RBACService } from '@/lib/auth/rbac'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = user.id
    const { permission } = await request.json()
    
    if (!permission) {
      return NextResponse.json(
        { error: 'Permission parameter required' },
        { status: 400 }
      )
    }

    const hasPermission = await RBACService.hasPermission(userId, permission)

    return NextResponse.json({
      hasPermission,
      userId,
      permission
    })

  } catch (error) {
    console.error('Error checking permission:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
