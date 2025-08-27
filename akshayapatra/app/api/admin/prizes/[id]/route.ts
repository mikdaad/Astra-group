import { NextRequest } from 'next/server'
import { withAuth, AuthErrors } from '@/utils/api/withAuth'
import { PERMISSIONS } from '@/lib/types/rbac'
import { PrizeService, PrizeStorage } from '@/utils/supabase/prizes'

// GET /api/admin/prizes/[id] - Get single prize
export const GET = withAuth(async (req: NextRequest, context, user) => {
  try {
    const { id } = context.params

    const prize = await PrizeService.get(id)
    if (!prize) {
      return AuthErrors.notFound('Prize not found')
    }

    return Response.json({
      success: true,
      data: prize
    })
  } catch (error) {
    console.error('Error fetching prize:', error)
    return AuthErrors.internalError()
  }
}, { requiredPermission: PERMISSIONS.SCHEMES_VIEW })

// PATCH /api/admin/prizes/[id] - Update prize
export const PATCH = withAuth(async (req: NextRequest, context, user) => {
  try {
    const { id } = context.params
    const contentType = req.headers.get('content-type') || ''
    let updates: any = {}

    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData()
      const imageFile = form.get('image') as File
      const json = form.get('payload') as string
      updates = json ? JSON.parse(json) : {}

      // Handle image upload
      if (imageFile) {
        const uploaded = await PrizeStorage.uploadImage(id, imageFile)
        if (uploaded) {
          updates.image_url = uploaded.publicUrl
        }
      }
    } else {
      updates = await req.json()
    }

    updates.updated_at = new Date().toISOString()

    const updated = await PrizeService.update(id, updates)
    if (!updated) {
      return AuthErrors.notFound('Prize not found')
    }

    return Response.json({ success: true, data: updated })
  } catch (error) {
    console.error('Error updating prize:', error)
    return AuthErrors.internalError()
  }
}, { requiredPermission: PERMISSIONS.SCHEMES_EDIT })

// DELETE /api/admin/prizes/[id] - Delete prize
export const DELETE = withAuth(async (req: NextRequest, context, user) => {
  try {
    const { id } = context.params

    const prize = await PrizeService.get(id)
    if (!prize) {
      return AuthErrors.notFound('Prize not found')
    }

    // Delete image if exists
    if (prize.image_url) {
      await PrizeStorage.deleteByPublicUrl(prize.image_url)
    }

    const deleted = await PrizeService.delete(id)
    if (!deleted) {
      return AuthErrors.internalError()
    }

    return Response.json({ success: true, message: 'Prize deleted successfully' })
  } catch (error) {
    console.error('Error deleting prize:', error)
    return AuthErrors.internalError()
  }
}, { requiredPermission: PERMISSIONS.SCHEMES_EDIT })
