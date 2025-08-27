import { NextRequest } from 'next/server'
import { withAuth, withSuperAdmin, AuthErrors } from '@/utils/api/withAuth'
import { StaffProfileService } from '@/utils/supabase/staff'
import { PERMISSIONS } from '@/lib/types/rbac'

// GET /api/admin/staff - Get all staff members
export const GET = withAuth(async (req: NextRequest, context, user) => {
  try {
    const staff = await StaffProfileService.getAllStaffProfiles()
    
    return Response.json({
      success: true,
      data: staff
    })
  } catch (error) {
    console.error('Error fetching staff:', error)
    return AuthErrors.internalError()
  }
}, { requiredPermission: PERMISSIONS.STAFF_VIEW })

// POST /api/admin/staff - Create new staff member (SuperAdmin only)
export const POST = withSuperAdmin(async (req: NextRequest, context, user) => {
  try {
    const body = await req.json()
    const { id, full_name, phone_number, role = 'new' } = body

    if (!id || !full_name) {
      return AuthErrors.badRequest('ID and full name are required')
    }

    const newStaff = await StaffProfileService.createStaffProfile({
      id,
      full_name,
      phone_number,
      role,
      is_active: true
    })

    if (!newStaff) {
      return AuthErrors.internalError()
    }

    return Response.json({
      success: true,
      data: newStaff
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating staff:', error)
    return AuthErrors.internalError()
  }
})
