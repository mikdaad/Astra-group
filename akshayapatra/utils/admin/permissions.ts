import type { User } from '@supabase/supabase-js'

/**
 * Check if user is super admin based on app metadata
 * This function can be used anywhere in the application
 */
export async function isSuperAdmin(user: User): Promise<boolean> {
  try {
    // Check app_metadata for isSuperAdmin property
    const appMetadata = user.app_metadata || {}
    return appMetadata.isSuperAdmin === true
  } catch (error) {
    console.error('Error checking super admin status:', error)
    return false
  }
}

/**
 * Check if user has admin role from database
 */
export async function isAdmin(user: User, supabase: any): Promise<boolean> {
  try {
    const { data: roles, error } = await supabase
      .from('user_role_map')
      .select('role_name')
      .eq('user_id', user.id)
      .eq('is_active', true)

    if (error) {
      console.error('Error checking admin role:', error)
      return false
    }

    return roles?.some((role: any) => role.role_name === 'admin') || false
  } catch (error) {
    console.error('Error checking admin role:', error)
    return false
  }
}

/**
 * Check if user has any admin privileges (super admin OR regular admin)
 */
export async function hasAdminAccess(user: User, supabase: any): Promise<boolean> {
  const [superAdmin, regularAdmin] = await Promise.all([
    isSuperAdmin(user),
    isAdmin(user, supabase)
  ])
  
  return superAdmin || regularAdmin
}

/**
 * Get user's admin level
 */
export async function getAdminLevel(user: User, supabase: any): Promise<'none' | 'admin' | 'super_admin'> {
  const [superAdmin, regularAdmin] = await Promise.all([
    isSuperAdmin(user),
    isAdmin(user, supabase)
  ])
  
  if (superAdmin) return 'super_admin'
  if (regularAdmin) return 'admin'
  return 'none'
}

/**
 * Sync function version for checking super admin (for client-side usage)
 */
export function isSuperAdminSync(user: User): boolean {
  try {
    const appMetadata = user.app_metadata || {}
    return appMetadata.isSuperAdmin === true
  } catch (error) {
    console.error('Error checking super admin status:', error)
    return false
  }
}
