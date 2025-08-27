'use client'

import { useState, useCallback } from 'react'
import { useAuth } from './useAuth'

// Client-side permission checks using API calls
export function usePermissionChecks() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const checkPermission = useCallback(async (permission: string): Promise<boolean> => {
    if (!user?.id) return false

    try {
      setLoading(true)
      const response = await fetch('/api/rbac/check-permission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ permission }),
      })

      if (!response.ok) {
        return false
      }

      const data = await response.json()
      return data.hasPermission
    } catch (error) {
      console.error('Error checking permission:', error)
      return false
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  // Common permission checks
  const permissionChecks = {
    // Dashboard
    canViewDashboard: () => checkPermission('dashboard:view'),
    
    // Users
    canViewUsers: () => checkPermission('users:view'),
    canEditUsers: () => checkPermission('users:edit'),
    canDeleteUsers: () => checkPermission('users:delete'),
    
    // Staff
    canViewStaff: () => checkPermission('staff:view'),
    canEditStaff: () => checkPermission('staff:edit'),
    canManageStaffRoles: () => checkPermission('staff:roles'),
    
    // Schemes
    canViewSchemes: () => checkPermission('schemes:view'),
    canEditSchemes: () => checkPermission('schemes:edit'),
    canDeleteSchemes: () => checkPermission('schemes:delete'),
    
    // Cards
    canViewCards: () => checkPermission('cards:view'),
    canEditCards: () => checkPermission('cards:edit'),
    canIssueCards: () => checkPermission('cards:issue'),
  }

  return {
    checkPermission,
    permissionChecks,
    loading
  }
}
