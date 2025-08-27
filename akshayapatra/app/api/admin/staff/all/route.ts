import { NextRequest } from 'next/server'
import { withEnhancedAuth, ApiResponse, isSuperAdmin } from '@/utils/api/authWrapper'

// Example of a super admin only API endpoint
const handler = withEnhancedAuth(
  async (req, { user, supabase }) => {
    console.log('🔧 [SUPER ADMIN EXAMPLE API] Super admin action requested by user:', user.id)
    
    // Super admin specific logic here
    const { data: systemStats, error } = await supabase
      .from('user_profiles')
      .select('count(*)')
    
    if (error) {
      console.error('🔧 [SUPER ADMIN EXAMPLE API] Error fetching system stats:', error.message)
      return ApiResponse.error('Failed to fetch system data', 500)
    }
    
    return ApiResponse.success({ 
      systemStats,
      message: 'Super admin access confirmed',
      requestedBy: user.id,
      userMetadata: user.app_metadata
    }, 'System data fetched successfully')
  },
  {
    name: 'SUPER ADMIN EXAMPLE API',
    methods: ['GET'],
    superAdminOnly: true,  // Requires super admin via app metadata
    requireProfile: true   // Also requires active user profile
  }
)

export { handler as GET }
