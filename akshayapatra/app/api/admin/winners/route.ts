import { NextRequest } from 'next/server'
import { withAuth, AuthErrors } from '@/utils/api/withAuth'
import { PERMISSIONS } from '@/lib/types/rbac'
import { WinnerService } from '@/utils/supabase/winners'

// GET /api/admin/winners - List winners
export const GET = withAuth(async (req: NextRequest, context, user) => {
  try {
    const { searchParams } = new URL(req.url)
    const schemeId = searchParams.get('schemeId')
    const status = searchParams.get('status')

    const filters: any = {}
    if (schemeId) filters.schemeId = schemeId
    if (status && status !== 'all') filters.status = status

    const winners = await WinnerService.list(filters)
    return Response.json({
      success: true,
      data: winners
    })
  } catch (error) {
    console.error('Error fetching winners:', error)
    return AuthErrors.internalError()
  }
}, { requiredPermission: PERMISSIONS.SCHEMES_VIEW })

// POST /api/admin/winners - Create winners
export const POST = withAuth(async (req: NextRequest, context, user) => {
  try {
    const { schemeId, cardIds } = await req.json()

    if (!schemeId || !cardIds || !Array.isArray(cardIds) || cardIds.length === 0) {
      return AuthErrors.badRequest('schemeId and cardIds are required')
    }

    // Create winners for each selected card
    const winners = await WinnerService.createMultiple({
      schemeId,
      cardIds,
      createdBy: user.id
    })

    if (!winners) return AuthErrors.internalError()

    return Response.json({
      success: true,
      data: winners,
      message: `Created ${winners.length} winners successfully`
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating winners:', error)
    return AuthErrors.internalError()
  }
}, { requiredPermission: PERMISSIONS.SCHEMES_EDIT })
