import { withAuth, ApiResponse } from '@/utils/api/authWrapper'

const handler = withAuth(
  async (req, { user, supabase }) => {
    const updates = await req.json()
    console.log('👤 [PROFILE UPDATE API] Updates:', Object.keys(updates))
    
    if (!updates || Object.keys(updates).length === 0) {
      return ApiResponse.error('No updates provided')
    }

    console.log('👤 [PROFILE UPDATE API] Updating profile for user:', user.id)
    
    // Validate and sanitize updates - expanded to include more fields
    const allowedFields = [
      'full_name', 'phone_number', 'country', 'state', 'district', 
      'street_address', 'postal_code', 'bank_account_holder_name', 
      'bank_account_number', 'bank_ifsc_code', 'bank_name', 
      'bank_branch', 'bank_account_type', 'profile_image_url'
    ]
    
    const sanitizedUpdates: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(updates as Record<string, unknown>)) {
      if (allowedFields.includes(key)) {
        sanitizedUpdates[key] = value
      }
    }
    
    // Always update the timestamp
    sanitizedUpdates.updated_at = new Date().toISOString()
    
    if (Object.keys(sanitizedUpdates).length === 1) { // Only timestamp
      return ApiResponse.error('No valid fields to update')
    }

    // Update user profile
    const { data, error } = await supabase
      .from('user_profiles')
      .update(sanitizedUpdates)
      .eq('id', user.id)
      .select()

    if (error) {
      console.error('👤 [PROFILE UPDATE API] Database error:', error.message)
      return ApiResponse.error('Failed to update profile', 500)
    }

    if (!data || data.length === 0) {
      console.error('👤 [PROFILE UPDATE API] No profile found to update for user:', user.id)
      return ApiResponse.error('Profile not found', 404)
    }

    console.log('👤 [PROFILE UPDATE API] Profile updated successfully')
    
    // Return response with cache invalidation hint
    const response = ApiResponse.success({
      profile: data[0], // Take the first (and should be only) result
      updatedFields: Object.keys(sanitizedUpdates),
      cacheInvalidated: true // Signal to client that cache should be invalidated
    }, 'Profile updated successfully')
    
    // Add header to indicate cache should be invalidated
    response.headers.set('X-Cache-Invalidate', 'true')
    
    return response
  },
  {
    name: 'PROFILE UPDATE API',
    methods: ['POST']
  }
)

export { handler as POST }
