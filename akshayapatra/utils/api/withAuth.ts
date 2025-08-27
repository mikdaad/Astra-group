import { NextRequest, NextResponse } from 'next/server'
import { RBACService } from '@/lib/auth/rbac'
import { StaffProfileService } from '@/utils/supabase/staff'
import type { Role } from '@/lib/types/rbac'

// Types for our auth wrapper
type AuthHandler = (
  req: NextRequest,
  context: { params: any },
  user: { id: string; email?: string; role?: Role }
) => Promise<Response>

interface AuthOptions {
  requiredPermission?: string
  requiredRole?: Role
  minimumRole?: Role
  allowedRoles?: Role[]
}

// Higher-order function to wrap API routes with authentication
export function withAuth(handler: AuthHandler, options: AuthOptions = {}) {
  return async (req: NextRequest, context: { params: any }) => {
    try {
      // Create Supabase client using existing server client
      const { createClient } = await import('@/utils/supabase/server')
      const supabase = await createClient()
      
      // Get session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session?.user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }

      const userId = session.user.id
      
      // Check if user is staff member
      const isStaffMember = await RBACService.isAdmin(userId)
      
      if (!isStaffMember) {
        return NextResponse.json(
          { error: 'Access denied - staff access required' },
          { status: 403 }
        )
      }

      // Get user role for additional checks
      const userRole = await StaffProfileService.getUserRole(userId)
      
      if (!userRole) {
        return NextResponse.json(
          { error: 'User role not found' },
          { status: 403 }
        )
      }

      // Check required permission
      if (options.requiredPermission) {
        const hasPermission = await RBACService.hasPermission(userId, options.requiredPermission)
        
        if (!hasPermission) {
          return NextResponse.json(
            { error: 'Insufficient permissions' },
            { status: 403 }
          )
        }
      }

      // Check required role
      if (options.requiredRole && userRole !== options.requiredRole) {
        return NextResponse.json(
          { error: 'Required role not met' },
          { status: 403 }
        )
      }

      // Check minimum role
      if (options.minimumRole) {
        const roleHierarchy: Record<Role, number> = {
          new: 1,
          support: 2,
          manager: 3,
          admin: 4,
          superadmin: 5
        }

        if (roleHierarchy[userRole] < roleHierarchy[options.minimumRole]) {
          return NextResponse.json(
            { error: 'Minimum role requirement not met' },
            { status: 403 }
          )
        }
      }

      // Check allowed roles
      if (options.allowedRoles && !options.allowedRoles.includes(userRole)) {
        return NextResponse.json(
          { error: 'Role not authorized for this operation' },
          { status: 403 }
        )
      }

      // Create user object with role
      const user = {
        id: userId,
        email: session.user.email,
        role: userRole
      }

      // Call the original handler
      return await handler(req, context, user)

    } catch (error) {
      console.error('Auth wrapper error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

// Convenience wrappers for common auth patterns
export const withSuperAdmin = (handler: AuthHandler) =>
  withAuth(handler, { requiredRole: 'superadmin' })

export const withAdmin = (handler: AuthHandler) =>
  withAuth(handler, { minimumRole: 'admin' })

export const withManager = (handler: AuthHandler) =>
  withAuth(handler, { minimumRole: 'manager' })

export const withSupport = (handler: AuthHandler) =>
  withAuth(handler, { minimumRole: 'support' })

export const withStaffOnly = (handler: AuthHandler) =>
  withAuth(handler, { allowedRoles: ['superadmin', 'admin', 'manager', 'support'] })

// Permission-specific wrappers
export const withPermission = (permission: string) => (handler: AuthHandler) =>
  withAuth(handler, { requiredPermission: permission })

// Multiple permission check
export function withPermissions(permissions: string[]) {
  return function(handler: AuthHandler) {
    return withAuth(async (req, context, user) => {
      // Check all permissions
      const permissionChecks = await Promise.all(
        permissions.map(permission => RBACService.hasPermission(user.id, permission))
      )

      if (!permissionChecks.every(Boolean)) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        )
      }

      return handler(req, context, user)
    })
  }
}

// Error response helpers
export const AuthErrors = {
  unauthorized: () => NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
  forbidden: (message = 'Access denied') => NextResponse.json({ error: message }, { status: 403 }),
  notFound: (message = 'Not found') => NextResponse.json({ error: message }, { status: 404 }),
  badRequest: (message = 'Bad request') => NextResponse.json({ error: message }, { status: 400 }),
  internalError: () => NextResponse.json({ error: 'Internal server error' }, { status: 500 })
} as const
