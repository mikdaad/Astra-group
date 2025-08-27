import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { RBACService } from '@/lib/auth/rbac'
import { ADMIN_PAGES } from '@/lib/types/rbac'
import { updateSession } from '@/utils/supabase/middleware'

export async function adminAuthMiddleware(request: NextRequest) {
  // Use the existing middleware session update
  const response = await updateSession(request)
  
  // Create server-side client for middleware auth checks
  const { createClient } = await import('@/utils/supabase/server')
  const supabase = await createClient()

  const { pathname } = request.nextUrl

  // Check if it's an admin route
  const isAdminRoute = pathname.startsWith('/admin')
  const isAdminAPI = pathname.startsWith('/api/admin')

  if (!isAdminRoute && !isAdminAPI) {
    return response
  }

  try {
    // Get session with timeout and error handling
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error('Admin auth middleware session error:', sessionError)
      // Don't redirect on session errors, just continue with the response
      return response
    }

    if (!session) {
      // Redirect to login for admin routes
      if (isAdminRoute) {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }
      // Return 401 for API routes
      if (isAdminAPI) {
        return new NextResponse(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { 'content-type': 'application/json' } }
        )
      }
    }

    const userId = session?.user?.id

    if (!userId) {
      if (isAdminRoute) {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }
      if (isAdminAPI) {
        return new NextResponse(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { 'content-type': 'application/json' } }
        )
      }
    }

    // Check if user is admin/staff member
    const isStaffMember = await RBACService.isAdmin(userId!)
    
    if (!isStaffMember) {
      if (isAdminRoute) {
        return NextResponse.redirect(new URL('/access-denied', request.url))
      }
      if (isAdminAPI) {
        return new NextResponse(
          JSON.stringify({ error: 'Access denied' }),
          { status: 403, headers: { 'content-type': 'application/json' } }
        )
      }
    }

    // Check page access for admin routes
    if (isAdminRoute) {
      const canAccess = await RBACService.canAccessPage(userId!, pathname)
      
      if (!canAccess) {
        return NextResponse.redirect(new URL('/admin/access-denied', request.url))
      }
    }

    // Check API access for admin API routes
    if (isAdminAPI) {
      const canAccess = await RBACService.canAccessAPI(userId!, pathname)
      
      if (!canAccess) {
        return new NextResponse(
          JSON.stringify({ error: 'Insufficient permissions' }),
          { status: 403, headers: { 'content-type': 'application/json' } }
        )
      }
    }

    return response

  } catch (error) {
    console.error('Admin auth middleware error:', error)
    
    if (isAdminRoute) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    if (isAdminAPI) {
      return new NextResponse(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500, headers: { 'content-type': 'application/json' } }
      )
    }
    
    return response
  }
}

// Helper function to check specific permissions in middleware
export async function checkPermissionMiddleware(
  request: NextRequest,
  permission: string
) {
  const { createClient } = await import('@/utils/supabase/server')
  const supabase = await createClient()
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Permission check session error:', error)
      return false
    }
    
    if (!session?.user?.id) {
      return false
    }

    return await RBACService.hasPermission(session.user.id, permission)
  } catch (error) {
    console.error('Permission check error:', error)
    return false
  }
}

// Role-specific middleware functions
export const requireSuperAdmin = async (request: NextRequest) => {
  const { createClient } = await import('@/utils/supabase/server')
  const supabase = await createClient()
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Super admin session error:', error)
      return false
    }
    
    if (!session?.user?.id) {
      return false
    }

    return await RBACService.isSuperAdmin(session.user.id)
  } catch (error) {
    console.error('Super admin check error:', error)
    return false
  }
}

export const requireAdmin = async (request: NextRequest) => {
  const { createClient } = await import('@/utils/supabase/server')
  const supabase = await createClient()
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Admin session error:', error)
      return false
    }
    
    if (!session?.user?.id) {
      return false
    }

    return await RBACService.isAdmin(session.user.id)
  } catch (error) {
    console.error('Admin check error:', error)
    return false
  }
}
