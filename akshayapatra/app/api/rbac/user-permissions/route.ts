import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { RBACService } from '@/lib/auth/rbac'

export async function GET(request: NextRequest) {
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
    
    // Get user permissions and pages
    const [permissions, accessiblePages] = await Promise.all([
      RBACService.getUserPermissions(userId),
      RBACService.getUserPages(userId)
    ])

    return NextResponse.json({
      permissions,
      accessiblePages,
      userId
    })

  } catch (error) {
    console.error('Error getting user permissions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
