'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'

import { ROLE_PERMISSIONS, type Role } from '@/lib/types/rbac'

export function useRBAC() {
  const { user } = useAuth()
  const [role, setRole] = useState<Role | null>(null)
  const [permissions, setPermissions] = useState<string[]>([])
  const [accessiblePages, setAccessiblePages] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const loadUserData = useCallback(async () => {
    if (!user?.id) {
      setRole(null)
      setPermissions([])
      setAccessiblePages([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      
      // Get user permissions from API
      const response = await fetch('/api/rbac/user-permissions')
      if (!response.ok) {
        throw new Error('Failed to fetch permissions')
      }
      
      const data = await response.json()
      const { permissions: userPermissions, accessiblePages: userPages } = data

      setPermissions(userPermissions)
      setAccessiblePages(userPages)

      // Determine role from permissions
      const userRole = Object.entries(ROLE_PERMISSIONS).find(([_, roleData]) => 
        JSON.stringify(roleData.permissions.sort()) === JSON.stringify(userPermissions.sort())
      )?.[0] as Role

      setRole(userRole || null)
    } catch (error) {
      console.error('Error loading user RBAC data:', error)
      setRole(null)
      setPermissions([])
      setAccessiblePages([])
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    loadUserData()
  }, [loadUserData])

  const hasPermission = useCallback((permission: string) => {
    return permissions.includes(permission)
  }, [permissions])

  const canAccessPage = useCallback((page: string) => {
    return accessiblePages.includes(page)
  }, [accessiblePages])

  const isRole = useCallback((targetRole: Role) => {
    return role === targetRole
  }, [role])

  const hasMinimumRole = useCallback((minimumRole: Role) => {
    if (!role) return false
    
    const roleHierarchy: Record<Role, number> = {
      new: 1,
      support: 2,
      manager: 3,
      admin: 4,
      superadmin: 5
    }

    return roleHierarchy[role] >= roleHierarchy[minimumRole]
  }, [role])

  const refresh = useCallback(() => {
    loadUserData()
  }, [loadUserData])

  return {
    user,
    role,
    permissions,
    accessiblePages,
    loading,
    hasPermission,
    canAccessPage,
    isRole,
    hasMinimumRole,
    refresh,
    // Convenience methods
    isSuperAdmin: isRole('superadmin'),
    isAdmin: hasMinimumRole('admin'),
    isManager: hasMinimumRole('manager'),
    isSupport: hasMinimumRole('support'),
    isNew: isRole('new')
  }
}

// Hook for specific permission checks
export function usePermission(permission: string) {
  const { hasPermission, loading } = useRBAC()
  
  return {
    hasPermission: hasPermission(permission),
    loading
  }
}

// Hook for page access checks
export function usePageAccess(page: string) {
  const { canAccessPage, loading } = useRBAC()
  
  return {
    canAccess: canAccessPage(page),
    loading
  }
}

// Hook for permission-based component rendering
export function usePermissionGate(permission: string) {
  const { hasPermission, loading } = useRBAC()
  
  const PermissionGate = ({ children, fallback = null }: { 
    children: React.ReactNode
    fallback?: React.ReactNode 
  }) => {
    if (loading) return fallback
    return hasPermission(permission) ? children : fallback
  }
  
  return PermissionGate
}

// Hook for role-based component rendering
export function useRoleGate(allowedRoles: Role[]) {
  const { role, loading } = useRBAC()
  
  const RoleGate = ({ children, fallback = null }: { 
    children: React.ReactNode
    fallback?: React.ReactNode 
  }) => {
    if (loading) return fallback
    return role && allowedRoles.includes(role) ? children : fallback
  }
  
  return RoleGate
}

// Note: For common permission checks, use the separate usePermissionChecks hook
// import { usePermissionChecks } from './usePermissionChecks'
