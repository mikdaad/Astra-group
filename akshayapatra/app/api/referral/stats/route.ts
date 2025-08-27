import { NextRequest } from 'next/server'
import { withAuth, ApiResponse } from '@/utils/api/authWrapper'

const handler = withAuth(
  async (req, { user, supabase }) => {
    console.log('📊 [REFERRAL STATS API] Fetching stats for user:', user.id)
    
    // Get user's referral stats
    const { data: stats, error: statsError } = await supabase
      .from('user_referral_stats')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Get user's own referral code
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('referral_code')
      .eq('id', user.id)
      .single()

    if (statsError && statsError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('📊 [REFERRAL STATS API] Stats error:', statsError.message)
      return ApiResponse.error('Failed to fetch referral stats', 500)
    }

    if (profileError) {
      console.error('📊 [REFERRAL STATS API] Profile error:', profileError.message)
      return ApiResponse.error('Failed to fetch user profile', 500)
    }

    console.log('📊 [REFERRAL STATS API] Stats fetched successfully')
    
    // Default stats if none exist
    const defaultStats = {
      l1_users_total: 0,
      l1_users_active: 0,
      l2_users_total: 0,
      l2_users_active: 0,
      direct_income_total: 0,
      indirect_income_total: 0,
    }
    
    return ApiResponse.success({
      referralCode: profile?.referral_code,
      stats: stats || defaultStats
    })
  },
  {
    name: 'REFERRAL STATS API',
    methods: ['GET']
  }
)

export { handler as GET }
