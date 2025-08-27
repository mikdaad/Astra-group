import { NextRequest } from 'next/server'
import { withAuth, AuthErrors } from '@/utils/api/withAuth'
import { PERMISSIONS } from '@/lib/types/rbac'
import { SchemeDrawService } from '@/utils/supabase/schemes'

// GET /api/admin/schemes/[id]/eligible?month=YYYY-MM
export const GET = withAuth(async (req: NextRequest, { params }) => {
  const { searchParams } = new URL(req.url)
  const month = searchParams.get('month') || ''
  if (!month) return AuthErrors.badRequest('month is required (YYYY-MM)')
  try {
    const data = await SchemeDrawService.listEligible(params.id, month)
    return Response.json({ success: true, data })
  } catch (e) {
    console.error('Eligible fetch error:', e)
    return AuthErrors.internalError()
  }
}, { requiredPermission: PERMISSIONS.SCHEMES_VIEW })


