import { NextRequest } from 'next/server'
import { withAuth, AuthErrors } from '@/utils/api/withAuth'
import { PERMISSIONS } from '@/lib/types/rbac'
import { SchemeService, SchemeStorage } from '@/utils/supabase/schemes'

// GET /api/admin/schemes/[id]
export const GET = withAuth(async (_req: NextRequest, { params }) => {
  const scheme = await SchemeService.get(params.id)
  if (!scheme) return AuthErrors.notFound()
  return Response.json({ success: true, data: scheme })
}, { requiredPermission: PERMISSIONS.SCHEMES_VIEW })

// PATCH /api/admin/schemes/[id] supports multipart for image replacement
export const PATCH = withAuth(async (req: NextRequest, { params }) => {
  try {
    const contentType = req.headers.get('content-type') || ''
    let imageFile: File | null = null
    let updates: any = {}
    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData()
      imageFile = (form.get('image') as File) || null
      const json = form.get('payload') as string
      updates = json ? JSON.parse(json) : {}
    } else {
      updates = await req.json()
    }

    // If replacing image: delete previous from storage
    if (imageFile) {
      const current = await SchemeService.get(params.id)
      if (!current) return AuthErrors.notFound()
      if (current.image_url) {
        await SchemeStorage.deleteByPublicUrl(current.image_url)
      }
      const uploaded = await SchemeStorage.uploadImage(params.id, imageFile)
      if (uploaded) updates.image_url = uploaded.publicUrl
    }

    const updated = await SchemeService.update(params.id, updates)
    if (!updated) return AuthErrors.internalError()
    return Response.json({ success: true, data: updated })
  } catch (e) {
    console.error('Scheme update error:', e)
    return AuthErrors.internalError()
  }
}, { requiredPermission: PERMISSIONS.SCHEMES_EDIT })


