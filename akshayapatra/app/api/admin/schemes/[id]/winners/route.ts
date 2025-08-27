import { NextRequest } from 'next/server'
import { withAuth, AuthErrors } from '@/utils/api/withAuth'
import { PERMISSIONS } from '@/lib/types/rbac'
import { SchemeDrawService } from '@/utils/supabase/schemes'

// GET /api/admin/schemes/[id]/winners?month=YYYY-MM
export const GET = withAuth(async (req: NextRequest, { params }) => {
  const { searchParams } = new URL(req.url)
  const month = searchParams.get('month') || ''
  if (!month) return AuthErrors.badRequest('month is required (YYYY-MM)')
  try {
    const data = await SchemeDrawService.listWinners(params.id, month)
    return Response.json({ success: true, data })
  } catch (e) {
    console.error('Winners fetch error:', e)
    return AuthErrors.internalError()
  }
}, { requiredPermission: PERMISSIONS.SCHEMES_VIEW })

// POST /api/admin/schemes/[id]/winners  { month, winners: [{ user_id, allow_future_participation }] }
export const POST = withAuth(async (req: NextRequest, { params }) => {
  try {
    const body = await req.json()
    const month = body?.month as string
    const winners = body?.winners as { user_id: string; allow_future_participation: boolean }[]
    if (!month || !Array.isArray(winners)) return AuthErrors.badRequest('month and winners[] required')
    const ok = await SchemeDrawService.addWinners(params.id, month, winners)
    if (!ok) return AuthErrors.internalError()
    return Response.json({ success: true })
  } catch (e) {
    console.error('Add winners error:', e)
    return AuthErrors.internalError()
  }
}, { requiredPermission: PERMISSIONS.SCHEMES_EDIT })


