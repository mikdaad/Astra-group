import { NextRequest } from 'next/server'
import { withSuperAdmin, AuthErrors } from '@/utils/api/withAuth'
import { createAdminClient } from '@/utils/supabase/admin'
import { StaffProfileService } from '@/utils/supabase/staff'
import { RBACService } from '@/lib/auth/rbac'

// PATCH /api/admin/staff/[id]/ban - Ban or unban a staff member (SuperAdmin only)
export const PATCH = withSuperAdmin(async (req: NextRequest, { params }, user) => {
  try {
    const staffId = params.id as string
    if (!staffId) {
      return AuthErrors.badRequest('Staff ID is required')
    }

    // Prevent self-ban/unban
    if (staffId === user.id) {
      return AuthErrors.badRequest('Cannot modify your own ban status')
    }

    const body = await req.json().catch(() => ({}))
    const action = body?.action as 'ban' | 'unban'
    const duration = (body?.duration as string | undefined) || '100y'

    if (!action || !['ban', 'unban'].includes(action)) {
      return AuthErrors.badRequest("'action' must be 'ban' or 'unban'")
    }

    const admin = createAdminClient()

    if (action === 'ban') {
      // Ban at auth level and deactivate in staff_profiles
      const { error: banError } = await admin.auth.admin.updateUserById(staffId, { ban_duration: duration })
      if (banError) {
        console.error('Error banning user in auth:', banError)
        return AuthErrors.internalError()
      }

      const ok = await StaffProfileService.toggleStaffStatus(staffId, false)
      if (!ok) {
        return AuthErrors.internalError()
      }
    } else {
      // Lift ban and activate in staff_profiles
      const { error: unbanError } = await admin.auth.admin.updateUserById(staffId, { ban_duration: 'none' })
      if (unbanError) {
        console.error('Error unbanning user in auth:', unbanError)
        return AuthErrors.internalError()
      }

      const ok = await StaffProfileService.toggleStaffStatus(staffId, true)
      if (!ok) {
        return AuthErrors.internalError()
      }
    }

    // Clear cached permissions for this user
    await RBACService.clearUserCache(staffId)

    return Response.json({ success: true, action })
  } catch (error) {
    console.error('Error in ban/unban route:', error)
    return AuthErrors.internalError()
  }
})


