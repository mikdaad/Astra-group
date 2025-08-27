import { NextRequest } from 'next/server'
import { withSuperAdmin, AuthErrors } from '@/utils/api/withAuth'
import { StaffProfileService } from '@/utils/supabase/staff'
import { RBACService } from '@/lib/auth/rbac'
import { PERMISSIONS, type Role } from '@/lib/types/rbac'

// PATCH /api/admin/staff/[id]/role - Update staff role
export const PATCH = withSuperAdmin(async (req: NextRequest, { params }, user) => {
  try {
    const staffId = params.id
    const body = await req.json()
    const { role } = body as { role: Role }
    
    if (!staffId) {
      return AuthErrors.badRequest('Staff ID is required')
    }

    if (!role || !['superadmin', 'admin', 'support', 'manager', 'new'].includes(role)) {
      return AuthErrors.badRequest('Valid role is required')
    }

    // Prevent self-role change
    if (staffId === user.id) {
      return AuthErrors.badRequest('Cannot change your own role')
    }

    // Check if user can manage this staff member
    const canManage = await RBACService.canManageUser(user.id, staffId)
    
    if (!canManage) {
      return AuthErrors.forbidden('Cannot manage staff member with equal or higher role')
    }

    // Only superadmin can assign superadmin role
    if (role === 'superadmin' && user.role !== 'superadmin') {
      return AuthErrors.forbidden('Only superadmin can assign superadmin role')
    }

    // Only superadmin and admin can assign admin role
    if (role === 'admin' && !['superadmin', 'admin'].includes(user.role!)) {
      return AuthErrors.forbidden('Insufficient permissions to assign admin role')
    }

    const success = await StaffProfileService.updateStaffRole(staffId, role)
    
    if (!success) {
      return AuthErrors.internalError()
    }

         // Clear cache for updated user immediately
     await RBACService.clearUserCache(staffId)
     console.log(`🔄 Cleared cache for user ${staffId} after role change to ${role}`)

    return Response.json({
      success: true,
      message: 'Role updated successfully'
    })
  } catch (error) {
    console.error('Error updating role:', error)
    return AuthErrors.internalError()
  }
})
