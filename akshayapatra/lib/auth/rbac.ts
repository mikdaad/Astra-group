import { ROLE_PERMISSIONS, PERMISSIONS, type Role } from '@/lib/types/rbac'
import { StaffProfileService } from '@/utils/supabase/staff'

// Server-side only Redis import
type SessionManagerType = {
  getStaffPermissions(userId: string): Promise<string[]>
  setStaffPermissions(userId: string, permissions: string[], ttl?: number): Promise<void>
  deleteUserSession(userId: string): Promise<void>
  deleteStaffPermissions?(staffId: string): Promise<void>
}

const FallbackSessionManager: SessionManagerType = {
  async getStaffPermissions() { return [] },
  async setStaffPermissions() { /* noop */ },
  async deleteUserSession() { /* noop */ },
  async deleteStaffPermissions() { /* noop */ },
}

let SessionManager: SessionManagerType = FallbackSessionManager
if (typeof window === 'undefined') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    SessionManager = require('@/lib/redis').SessionManager as SessionManagerType
  } catch (error) {
    console.warn('Redis not available, using fallback')
    SessionManager = FallbackSessionManager
  }
}

export class RBACService {
  // Check if user has specific permission
  static async hasPermission(userId: string, permission: string): Promise<boolean> {
    try {
      // Try to get from Redis cache first
      const cachedPermissions = await SessionManager.getStaffPermissions(userId)
      if (cachedPermissions.length > 0) {
        return cachedPermissions.includes(permission)
      }

      // Get from database if not cached
      const userRole = await StaffProfileService.getUserRole(userId)
      if (!userRole) return false

      const rolePermissions = ROLE_PERMISSIONS[userRole]
      const hasPermission = rolePermissions.permissions.includes(permission)

      // Cache the permissions for future use
      await SessionManager.setStaffPermissions(userId, rolePermissions.permissions, 3600)

      return hasPermission
    } catch (error) {
      console.error('Error checking permission:', error)
      return false
    }
  }

  // Check if user can access specific page
  static async canAccessPage(userId: string, page: string): Promise<boolean> {
    try {
      const userRole = await StaffProfileService.getUserRole(userId)
      if (!userRole) return false

      const rolePermissions = ROLE_PERMISSIONS[userRole]
      return rolePermissions.pages.includes(page)
    } catch (error) {
      console.error('Error checking page access:', error)
      return false
    }
  }

  // Check if user can access API endpoint
  static async canAccessAPI(userId: string, endpoint: string): Promise<boolean> {
    try {
      const userRole = await StaffProfileService.getUserRole(userId)
      if (!userRole) return false

      const rolePermissions = ROLE_PERMISSIONS[userRole]
      
      // Check exact match first
      if (rolePermissions.api_endpoints.includes(endpoint)) {
        return true
      }

      // Check wildcard patterns
      return rolePermissions.api_endpoints.some(pattern => {
        if (pattern.endsWith('/*')) {
          const basePath = pattern.slice(0, -2)
          return endpoint.startsWith(basePath)
        }
        return false
      })
    } catch (error) {
      console.error('Error checking API access:', error)
      return false
    }
  }

  // Get user permissions
  static async getUserPermissions(userId: string): Promise<string[]> {
    try {
      // Try cache first
      const cachedPermissions = await SessionManager.getStaffPermissions(userId)
      if (cachedPermissions.length > 0) {
        console.log(`📋 Using cached permissions for user ${userId}:`, cachedPermissions.length, 'permissions')
        return cachedPermissions
      }

      console.log(`🔄 Cache miss for user ${userId}, fetching from database...`)

      // Get from database
      const userRole = await StaffProfileService.getUserRole(userId)
      if (!userRole) {
        console.log(`❌ No role found for user ${userId}`)
        return []
      }

      const rolePermissions = ROLE_PERMISSIONS[userRole]
      
      // Cache for future use
      await SessionManager.setStaffPermissions(userId, rolePermissions.permissions, 3600)
      console.log(`💾 Cached ${rolePermissions.permissions.length} permissions for user ${userId} (role: ${userRole})`)
      
      return rolePermissions.permissions
    } catch (error) {
      console.error('Error getting user permissions:', error)
      return []
    }
  }

  // Get user accessible pages
  static async getUserPages(userId: string): Promise<string[]> {
    try {
      const userRole = await StaffProfileService.getUserRole(userId)
      if (!userRole) return []

      return ROLE_PERMISSIONS[userRole].pages
    } catch (error) {
      console.error('Error getting user pages:', error)
      return []
    }
  }

  // Check if user is admin (any admin role)
  static async isAdmin(userId: string): Promise<boolean> {
    try {
      const userRole = await StaffProfileService.getUserRole(userId)
      return userRole ? ['superadmin', 'admin', 'manager'].includes(userRole) : false
    } catch (error) {
      console.error('Error checking admin status:', error)
      return false
    }
  }

  // Check if user is superadmin
  static async isSuperAdmin(userId: string): Promise<boolean> {
    try {
      const userRole = await StaffProfileService.getUserRole(userId)
      return userRole === 'superadmin'
    } catch (error) {
      console.error('Error checking superadmin status:', error)
      return false
    }
  }

  // Clear user permissions cache
  static async clearUserCache(userId: string): Promise<void> {
    try {
      // Clear both session and permissions cache
      await SessionManager.deleteUserSession(userId)
      
      // Clear permissions cache by deleting the key
      if (SessionManager && SessionManager.deleteStaffPermissions) {
        await SessionManager.deleteStaffPermissions(userId)
      } else {
        // Fallback: set empty permissions to clear cache
        await SessionManager.setStaffPermissions(userId, [], 1)
      }
      
      console.log(`🔄 Cleared cache for user ${userId}`)
    } catch (error) {
      console.error('Error clearing user cache:', error)
    }
  }

  // Validate role-based action
  static async validateAction(userId: string, resource: string, action: string): Promise<boolean> {
    const permission = `${resource}:${action}`
    return await this.hasPermission(userId, permission)
  }

  // Get role hierarchy level (for comparison)
  static getRoleLevel(role: Role): number {
    const levels = {
      new: 1,
      support: 2,
      manager: 3,
      admin: 4,
      superadmin: 5
    }
    return levels[role] || 0
  }

  // Check if user can manage another user (based on role hierarchy)
  static async canManageUser(managerId: string, targetUserId: string): Promise<boolean> {
    try {
      const [managerRole, targetRole] = await Promise.all([
        StaffProfileService.getUserRole(managerId),
        StaffProfileService.getUserRole(targetUserId)
      ])

      if (!managerRole || !targetRole) return false

      const managerLevel = this.getRoleLevel(managerRole)
      const targetLevel = this.getRoleLevel(targetRole)

      // Can only manage users with lower role level
      return managerLevel > targetLevel
    } catch (error) {
      console.error('Error checking user management permission:', error)
      return false
    }
  }
}

// Permission constants for easy use
export const hasPermission = RBACService.hasPermission
export const canAccessPage = RBACService.canAccessPage
export const canAccessAPI = RBACService.canAccessAPI
export const isAdmin = RBACService.isAdmin
export const isSuperAdmin = RBACService.isSuperAdmin

// Common permission checks
export const PermissionChecks = {
  // Dashboard
  canViewDashboard: (userId: string) => hasPermission(userId, PERMISSIONS.DASHBOARD_VIEW),
  
  // Users
  canViewUsers: (userId: string) => hasPermission(userId, PERMISSIONS.USERS_VIEW),
  canEditUsers: (userId: string) => hasPermission(userId, PERMISSIONS.USERS_EDIT),
  canDeleteUsers: (userId: string) => hasPermission(userId, PERMISSIONS.USERS_DELETE),
  
  // Staff
  canViewStaff: (userId: string) => hasPermission(userId, PERMISSIONS.STAFF_VIEW),
  canEditStaff: (userId: string) => hasPermission(userId, PERMISSIONS.STAFF_EDIT),
  canManageStaffRoles: (userId: string) => hasPermission(userId, PERMISSIONS.STAFF_ROLES),
  
  // Schemes
  canViewSchemes: (userId: string) => hasPermission(userId, PERMISSIONS.SCHEMES_VIEW),
  canEditSchemes: (userId: string) => hasPermission(userId, PERMISSIONS.SCHEMES_EDIT),
  canDeleteSchemes: (userId: string) => hasPermission(userId, PERMISSIONS.SCHEMES_DELETE),
  
  // Cards
  canViewCards: (userId: string) => hasPermission(userId, PERMISSIONS.CARDS_VIEW),
  canEditCards: (userId: string) => hasPermission(userId, PERMISSIONS.CARDS_EDIT),
  canIssueCards: (userId: string) => hasPermission(userId, PERMISSIONS.CARDS_ISSUE),
} as const
