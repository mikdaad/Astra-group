import { NextRequest } from 'next/server'
import { withAuth, AuthErrors } from '@/utils/api/withAuth'
import { PERMISSIONS } from '@/lib/types/rbac'
import { createAdminClient } from '@/utils/supabase/admin'

// GET /api/admin/overview - returns admin overview metrics from mv_admin_overview
export const GET = withAuth(async (_req: NextRequest) => {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('mv_admin_overview')
      .select('*')
      .limit(2)

    if (error) {
      console.error('Error fetching mv_admin_overview:', error)
      return AuthErrors.internalError()
    }

    // Optionally, you could enrich here with monthly series fields if your view exposes them.
    return Response.json({ success: true, data: data || [] })
  } catch (e) {
    console.error('Overview API error:', e)
    return AuthErrors.internalError()
  }
}, { requiredPermission: PERMISSIONS.DASHBOARD_VIEW })


