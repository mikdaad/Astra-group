import { NextRequest } from 'next/server'
import { withAuth, AuthErrors } from '@/utils/api/withAuth'
import { StaffProfileService } from '@/utils/supabase/staff'
import { PERMISSIONS } from '@/lib/types/rbac'

// GET /api/admin/staff/stats - Get staff statistics
export const GET = withAuth(async (req: NextRequest, { params }, user) => {
  try {
    const stats = await StaffProfileService.getStaffStats()
    
    return Response.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('Error fetching staff stats:', error)
    return AuthErrors.internalError()
  }
}, { requiredPermission: PERMISSIONS.STAFF_VIEW })
