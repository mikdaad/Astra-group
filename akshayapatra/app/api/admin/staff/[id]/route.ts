import { NextRequest } from 'next/server'
import { withAuth, withSuperAdmin, AuthErrors } from '@/utils/api/withAuth'
import { StaffProfileService } from '@/utils/supabase/staff'
import { RBACService } from '@/lib/auth/rbac'
import { PERMISSIONS } from '@/lib/types/rbac'

// GET /api/admin/staff/[id] - Get specific staff member
export const GET = withAuth(async (req: NextRequest, { params }, user) => {
  try {
    const staffId = params.id
    
    if (!staffId) {
      return AuthErrors.badRequest('Staff ID is required')
    }

    const staff = await StaffProfileService.getStaffProfile(staffId)
    
    if (!staff) {
      return AuthErrors.notFound()
    }

    return Response.json({
      success: true,
      data: staff
    })
  } catch (error) {
    console.error('Error fetching staff:', error)
    return AuthErrors.internalError()
  }
}, { requiredPermission: PERMISSIONS.STAFF_VIEW })

// PATCH /api/admin/staff/[id] - Update staff member
export const PATCH = withSuperAdmin(async (req: NextRequest, { params }, user) => {
  try {
    const staffId = params.id
    const body = await req.json()
    
    if (!staffId) {
      return AuthErrors.badRequest('Staff ID is required')
    }

    // Prevent self-edit
    if (staffId === user.id) {
      return AuthErrors.badRequest('Cannot edit your own account')
    }

    // Check if user can manage this staff member (role hierarchy)
    const canManage = await RBACService.canManageUser(user.id, staffId)
    
    if (!canManage && user.role !== 'superadmin') {
      return AuthErrors.forbidden('Cannot manage staff member with equal or higher role')
    }

    const updatedStaff = await StaffProfileService.updateStaffProfile(staffId, body)
    
    if (!updatedStaff) {
      return AuthErrors.internalError()
    }

    // Clear cache for updated user
    await RBACService.clearUserCache(staffId)

    return Response.json({
      success: true,
      data: updatedStaff
    })
  } catch (error) {
    console.error('Error updating staff:', error)
    return AuthErrors.internalError()
  }
})

// DELETE /api/admin/staff/[id] - Delete staff member (SuperAdmin only)
export const DELETE = withSuperAdmin(async (req: NextRequest, { params }, user) => {
  try {
    const staffId = params.id
    
    if (!staffId) {
      return AuthErrors.badRequest('Staff ID is required')
    }

    // Prevent self-deletion
    if (staffId === user.id) {
      return AuthErrors.badRequest('Cannot delete your own account')
    }

    const success = await StaffProfileService.deleteStaffProfile(staffId)
    
    if (!success) {
      return AuthErrors.internalError()
    }

    // Clear cache for deleted user
    await RBACService.clearUserCache(staffId)

    return Response.json({
      success: true,
      message: 'Staff member deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting staff:', error)
    return AuthErrors.internalError()
  }
})
