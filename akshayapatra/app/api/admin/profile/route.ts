import { NextRequest } from 'next/server'
import { withAuth } from '@/utils/api/withAuth'
import { StaffProfileService } from '@/utils/supabase/staff'
import { PERMISSIONS } from '@/lib/types/rbac'

// GET /api/admin/profile - Get current user's staff profile
export const GET = withAuth(async (req, context, user) => {
  try {
    const staffProfile = await StaffProfileService.getStaffProfile(user.id)
    
    if (!staffProfile) {
      return Response.json(
        { 
          success: false, 
          error: 'Staff profile not found' 
        },
        { status: 404 }
      )
    }

    return Response.json({
      success: true,
      profile: staffProfile
    })
  } catch (error) {
    console.error('Error fetching staff profile:', error)
    return Response.json(
      { 
        success: false, 
        error: 'Failed to fetch profile' 
      },
      { status: 500 }
    )
  }
}, { requiredPermission: PERMISSIONS.PROFILE_VIEW })

// PUT /api/admin/profile - Update current user's staff profile
export const PUT = withAuth(async (req, context, user) => {
  try {
    const body = await req.json()
    const { full_name, phone_number } = body

    // Validate input
    if (!full_name || full_name.trim().length < 2) {
      return Response.json(
        { 
          success: false, 
          error: 'Full name must be at least 2 characters' 
        },
        { status: 400 }
      )
    }

    // Prepare update data
    const updateData: any = {
      full_name: full_name.trim()
    }

    // Only update phone if provided
    if (phone_number !== undefined) {
      updateData.phone_number = phone_number
    }

    const updatedProfile = await StaffProfileService.updateStaffProfile(user.id, updateData)
    
    if (!updatedProfile) {
      return Response.json(
        { 
          success: false, 
          error: 'Failed to update profile' 
        },
        { status: 500 }
      )
    }

    return Response.json({
      success: true,
      message: 'Profile updated successfully',
      profile: updatedProfile
    })
  } catch (error) {
    console.error('Error updating staff profile:', error)
    return Response.json(
      { 
        success: false, 
        error: 'Failed to update profile' 
      },
      { status: 500 }
    )
  }
}, { requiredPermission: PERMISSIONS.PROFILE_EDIT })