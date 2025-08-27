import { NextRequest } from 'next/server'
import { withAuth, ApiResponse } from '@/utils/api/authWrapper'

const handler = withAuth(
  async (req, { user, supabase }) => {
    console.log('👤 [PROFILE GET API] Fetching profile for user:', user.id)
    
    // Get user profile
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('👤 [PROFILE GET API] Database error:', error.message)
      return ApiResponse.error('Failed to fetch profile', 500)
    }

    if (!profile) {
      return ApiResponse.notFound('Profile')
    }

    console.log('👤 [PROFILE GET API] Profile fetched successfully')
    
    return ApiResponse.success({ profile })
  },
  {
    name: 'PROFILE GET API',
    methods: ['GET']
  }
)

export { handler as GET }
