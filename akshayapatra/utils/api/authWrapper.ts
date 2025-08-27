import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import type { User, SupabaseClient } from '@supabase/supabase-js'
import { isSuperAdmin as checkSuperAdmin } from '@/utils/admin/permissions'

// Type for the authenticated handler function
export type AuthenticatedHandler = (
  req: NextRequest,
  context: { user: User; supabase: SupabaseClient }
) => Promise<NextResponse>

// Type for API configuration
export interface ApiConfig {
  name: string; // API name for logging (e.g., "PROFILE UPDATE API")
  methods?: string[]; // Allowed HTTP methods, defaults to all
}

/**
 * Authentication wrapper for API routes
 * Handles Supabase authentication and provides authenticated user context
 */
export function withAuth(handler: AuthenticatedHandler, config: ApiConfig) {
  return async function authenticatedRoute(req: NextRequest): Promise<NextResponse> {
    const { name, methods = [] } = config
    const method = req.method
    
    console.log(`🔐 [${name}] ${method} request received`)

    try {
      // Check if method is allowed (if specified)
      if (methods.length > 0 && !methods.includes(method)) {
        console.warn(`🔐 [${name}] Method ${method} not allowed`)
        return NextResponse.json(
          { error: `Method ${method} not allowed` }, 
          { status: 405 }
        )
      }

      // Create Supabase client
      const supabase = await createClient()

      // Get authenticated user with error handling
      let user = null
      let authError = null
      
      try {
        const { data: { user: authUser }, error: userError } = await supabase.auth.getUser()
        user = authUser
        authError = userError
      } catch (error) {
        console.error(`🔐 [${name}] Network error during auth:`, error)
        // For network errors, return 503 Service Unavailable instead of 401
        return NextResponse.json(
          { error: 'Service temporarily unavailable. Please try again.' },
          { status: 503 }
        )
      }
      
      if (authError) {
        console.error(`🔐 [${name}] Authentication error:`, authError.message)
        return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
      }

      if (!user) {
        console.warn(`🔐 [${name}] No authenticated user found`)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      console.log(`🔐 [${name}] Authenticated user:`, user.id)

      // Call the actual handler with authenticated context
      return await handler(req, { user, supabase })

    } catch (error) {
      console.error(`🔐 [${name}] Unexpected error:`, error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

/**
 * Enhanced wrapper with additional validation options
 */
export interface EnhancedApiConfig extends ApiConfig {
  requireProfile?: boolean; // Require user_profiles record to exist
  adminOnly?: boolean; // Require admin role
  superAdminOnly?: boolean; // Require super admin (app metadata)
}

// Re-export for convenience
export { isSuperAdmin } from '@/utils/admin/permissions'

export function withEnhancedAuth(handler: AuthenticatedHandler, config: EnhancedApiConfig) {
  return withAuth(async (req, context) => {
    const { user, supabase } = context
    const { name, requireProfile, adminOnly, superAdminOnly } = config

    // Check if user profile is required
    if (requireProfile) {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, is_active')
        .eq('id', user.id)
        .single()

      if (profileError || !profile) {
        console.warn(`🔐 [${name}] User profile not found for user:`, user.id)
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
      }

      if (!profile.is_active) {
        console.warn(`🔐 [${name}] Inactive user profile:`, user.id)
        return NextResponse.json({ error: 'Account inactive' }, { status: 403 })
      }
    }

    // Check admin role if required
    if (adminOnly) {
      const { data: roles, error: roleError } = await supabase
        .from('user_role_map')
        .select('role_name')
        .eq('user_id', user.id)
        .eq('is_active', true)

      const hasAdminRole = roles?.some((role: any) => role.role_name === 'admin')
      
      if (roleError || !hasAdminRole) {
        console.warn(`🔐 [${name}] Admin access denied for user:`, user.id)
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
      }
    }

    // Check super admin if required
    if (superAdminOnly) {
      const isUserSuperAdmin = await checkSuperAdmin(user)
      
      if (!isUserSuperAdmin) {
        console.warn(`🔐 [${name}] Super admin access denied for user:`, user.id)
        return NextResponse.json({ error: 'Super admin access required' }, { status: 403 })
      }
    }

    return await handler(req, context)
  }, config)
}

/**
 * Utility for handling common API response patterns
 */
export const ApiResponse = {
  success: (data: any, message?: string) => {
    return NextResponse.json({
      success: true,
      message,
      ...data
    })
  },

  error: (message: string, status = 400, details?: any) => {
    return NextResponse.json({
      error: message,
      ...details
    }, { status })
  },

  notFound: (resource = 'Resource') => {
    return NextResponse.json({
      error: `${resource} not found`
    }, { status: 404 })
  },

  unauthorized: (message = 'Unauthorized') => {
    return NextResponse.json({
      error: message
    }, { status: 401 })
  },

  forbidden: (message = 'Forbidden') => {
    return NextResponse.json({
      error: message
    }, { status: 403 })
  }
}

/**
 * Utility for validating request body
 */
export async function validateRequestBody<T>(
  req: NextRequest,
  requiredFields: (keyof T)[]
): Promise<{ isValid: boolean; data?: T; errors?: string[] }> {
  try {
    const body = await req.json()
    const errors: string[] = []

    for (const field of requiredFields) {
      if (!body[field]) {
        errors.push(`${String(field)} is required`)
      }
    }

    if (errors.length > 0) {
      return { isValid: false, errors }
    }

    return { isValid: true, data: body as T }
  } catch (error) {
    return { isValid: false, errors: ['Invalid JSON body'] }
  }
}
