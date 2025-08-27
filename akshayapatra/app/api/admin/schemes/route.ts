import { NextRequest } from 'next/server'
import { withAuth, AuthErrors } from '@/utils/api/withAuth'
import { PERMISSIONS } from '@/lib/types/rbac'
import { SchemeService, SchemeStorage } from '@/utils/supabase/schemes'

// Example scheme API with role-based access

// GET /api/admin/schemes - View schemes (support+ can view)
export const GET = withAuth(async (req: NextRequest, context, user) => {
  try {
    const schemes = await SchemeService.list()

    return Response.json({
      success: true,
      data: schemes
    })
  } catch (error) {
    console.error('Error fetching schemes:', error)
    return AuthErrors.internalError()
  }
}, { requiredPermission: PERMISSIONS.SCHEMES_VIEW })

// POST /api/admin/schemes - Create scheme (admin+ can create)
export const POST = withAuth(async (req: NextRequest, context, user) => {
  try {
    // Expect multipart/form-data for optional image
    const contentType = req.headers.get('content-type') || ''
    let imageFile: File | null = null
    let payload: any = {}

    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData()
      imageFile = (form.get('image') as File) || null
      const json = form.get('payload') as string
      payload = json ? JSON.parse(json) : {}
    } else {
      payload = await req.json()
    }

    if (!payload?.name || !payload?.subscription_amount || !payload?.start_date || !payload?.end_date) {
      return AuthErrors.badRequest('Required fields missing')
    }

    payload.created_by = user.id

    // Create first to get ID
    const created = await SchemeService.create(payload)
    if (!created) return AuthErrors.internalError()

    // Handle image upload
    if (imageFile) {
      const uploaded = await SchemeStorage.uploadImage(created.id, imageFile)
      if (uploaded) {
        const updated = await SchemeService.update(created.id, { image_url: uploaded.publicUrl })
        return Response.json({ success: true, data: updated }, { status: 201 })
      }
    }

    return Response.json({ success: true, data: created }, { status: 201 })
  } catch (error) {
    console.error('Error creating scheme:', error)
    return AuthErrors.internalError()
  }
}, { requiredPermission: PERMISSIONS.SCHEMES_EDIT })
