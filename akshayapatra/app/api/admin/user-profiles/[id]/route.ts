import { NextRequest } from 'next/server'
import { withAuth, AuthErrors } from '@/utils/api/withAuth'
import { PERMISSIONS } from '@/lib/types/rbac'
import { UserProfileService } from '@/utils/supabase/user-profiles'

// GET /api/admin/user-profiles/[id] - Get single user profile with cards
export const GET = withAuth(async (req: NextRequest, context, user) => {
  try {
    const { id } = context.params

    const profile = await UserProfileService.getWithCards(id)
    if (!profile) {
      return AuthErrors.notFound('User profile not found')
    }

    return Response.json({
      success: true,
      data: profile
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return AuthErrors.internalError()
  }
}, { requiredPermission: PERMISSIONS.SCHEMES_VIEW })

// PATCH /api/admin/user-profiles/[id] - Update user profile
export const PATCH = withAuth(async (req: NextRequest, context, user) => {
  try {
    const { id } = context.params
    const updates = await req.json()

    updates.updated_at = new Date().toISOString()

    const updated = await UserProfileService.update(id, updates)
    if (!updated) {
      return AuthErrors.notFound('User profile not found')
    }

    return Response.json({ success: true, data: updated })
  } catch (error) {
    console.error('Error updating user profile:', error)
    return AuthErrors.internalError()
  }
}, { requiredPermission: PERMISSIONS.SCHEMES_EDIT })

// DELETE /api/admin/user-profiles/[id] - Delete user profile
export const DELETE = withAuth(async (req: NextRequest, context, user) => {
  try {
    const { id } = context.params

    const deleted = await UserProfileService.delete(id)
    if (!deleted) {
      return AuthErrors.notFound('User profile not found')
    }

    return Response.json({ success: true, message: 'User profile deleted successfully' })
  } catch (error) {
    console.error('Error deleting user profile:', error)
    return AuthErrors.internalError()
  }
}, { requiredPermission: PERMISSIONS.SCHEMES_EDIT })
