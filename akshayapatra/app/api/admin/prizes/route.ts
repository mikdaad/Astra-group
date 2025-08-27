import { NextRequest } from 'next/server'
import { withAuth, AuthErrors } from '@/utils/api/withAuth'
import { PERMISSIONS } from '@/lib/types/rbac'
import { PrizeService, PrizeStorage } from '@/utils/supabase/prizes'

// GET /api/admin/prizes - List prizes for a scheme
export const GET = withAuth(async (req: NextRequest, context, user) => {
  try {
    const { searchParams } = new URL(req.url)
    const schemeId = searchParams.get('schemeId')

    if (!schemeId) {
      return AuthErrors.badRequest('schemeId is required')
    }

    const prizes = await PrizeService.listByScheme(schemeId)
    return Response.json({
      success: true,
      data: prizes
    })
  } catch (error) {
    console.error('Error fetching prizes:', error)
    return AuthErrors.internalError()
  }
}, { requiredPermission: PERMISSIONS.SCHEMES_VIEW })

// POST /api/admin/prizes - Create prize
export const POST = withAuth(async (req: NextRequest, context, user) => {
  try {
    const contentType = req.headers.get('content-type') || ''
    let payload: any = {}

    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData()
      const imageFile = form.get('image') as File
      const json = form.get('payload') as string
      payload = json ? JSON.parse(json) : {}

      // Handle image upload
      if (imageFile) {
        const uploaded = await PrizeStorage.uploadImage(payload.id || `temp_${Date.now()}`, imageFile)
        if (uploaded) {
          payload.image_url = uploaded.publicUrl
        }
      }
    } else {
      payload = await req.json()
    }

    if (!payload?.schemeId || !payload?.name || !payload?.rank) {
      return AuthErrors.badRequest('Required fields missing: schemeId, name, rank')
    }

    payload.created_by = user.id
    const created = await PrizeService.create(payload)

    if (!created) return AuthErrors.internalError()

    return Response.json({ success: true, data: created }, { status: 201 })
  } catch (error) {
    console.error('Error creating prize:', error)
    return AuthErrors.internalError()
  }
}, { requiredPermission: PERMISSIONS.SCHEMES_EDIT })
