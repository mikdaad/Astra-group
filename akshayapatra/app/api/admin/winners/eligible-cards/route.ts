import { NextRequest } from 'next/server'
import { withAuth, AuthErrors } from '@/utils/api/withAuth'
import { PERMISSIONS } from '@/lib/types/rbac'
import { EligibleCardService } from '@/utils/supabase/eligible-cards'

// GET /api/admin/winners/eligible-cards - Get eligible cards for CSV export
export const GET = withAuth(async (req: NextRequest, context, user) => {
  try {
    const { searchParams } = new URL(req.url)
    const schemeId = searchParams.get('schemeId')

    if (!schemeId) {
      return AuthErrors.badRequest('schemeId is required')
    }

    const eligibleCards = await EligibleCardService.getByScheme(schemeId)
    return Response.json({
      success: true,
      data: eligibleCards
    })
  } catch (error) {
    console.error('Error fetching eligible cards:', error)
    return AuthErrors.internalError()
  }
}, { requiredPermission: PERMISSIONS.SCHEMES_VIEW })
