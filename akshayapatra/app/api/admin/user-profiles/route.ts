import { NextRequest } from 'next/server'
import { withAuth, AuthErrors } from '@/utils/api/withAuth'
import { PERMISSIONS } from '@/lib/types/rbac'
import { UserProfileService } from '@/utils/supabase/user-profiles'

// GET /api/admin/user-profiles - List user profiles with cards
export const GET = withAuth(async (req: NextRequest, context, user) => {
  try {
    const { searchParams } = new URL(req.url)
    const kycStatus = searchParams.get('kycStatus')
    const isActive = searchParams.get('isActive')
    const search = searchParams.get('search')

    const filters: any = {}
    if (kycStatus && kycStatus !== 'all') filters.kycVerified = kycStatus === 'verified'
    if (isActive !== null) filters.isActive = isActive === 'true'
    if (search) filters.search = search

    const profiles = await UserProfileService.listWithCards(filters)
    return Response.json({
      success: true,
      data: profiles
    })
  } catch (error) {
    console.error('Error fetching user profiles:', error)
    return AuthErrors.internalError()
  }
}, { requiredPermission: PERMISSIONS.SCHEMES_VIEW })

// POST /api/admin/user-profiles - Create user profile
export const POST = withAuth(async (req: NextRequest, context, user) => {
  try {
    const profileData = await req.json()

    if (!profileData?.fullName || !profileData?.phoneNumber) {
      return AuthErrors.badRequest('Required fields missing: fullName, phoneNumber')
    }

    profileData.createdBy = user.id
    const created = await UserProfileService.create(profileData)

    if (!created) return AuthErrors.internalError()

    return Response.json({
      success: true,
      data: created
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating user profile:', error)
    return AuthErrors.internalError()
  }
}, { requiredPermission: PERMISSIONS.SCHEMES_EDIT })
