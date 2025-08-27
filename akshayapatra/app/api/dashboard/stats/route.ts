import { NextRequest } from 'next/server'
import { withAuth, ApiResponse } from '@/utils/api/authWrapper'

const handler = withAuth(
  async (req, { user, supabase }) => {
    console.log('📈 [DASHBOARD STATS API] Fetching stats for user:', user.id)
    
    // Get user's cards count and wallet balance
    const { data: cards, error: cardsError } = await supabase
      .from('cards')
      .select('id, total_wallet_balance, commission_wallet_balance, subscription_status')
      .eq('user_id', user.id)

    // Get user profile info
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('full_name, phone_number, referral_code, created_at')
      .eq('id', user.id)
      .single()

    // Get referral stats
    const { data: referralStats, error: referralError } = await supabase
      .from('user_referral_stats')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (cardsError) {
      console.error('📈 [DASHBOARD STATS API] Cards error:', cardsError.message)
      return ApiResponse.error('Failed to fetch cards data', 500)
    }

    if (profileError) {
      console.error('📈 [DASHBOARD STATS API] Profile error:', profileError.message)
      return ApiResponse.error('Failed to fetch profile data', 500)
    }

    // Calculate totals
    const totalWalletBalance = cards?.reduce((sum, card) => sum + (parseFloat(card.total_wallet_balance?.toString() || '0')), 0) || 0
    const totalCommissionBalance = cards?.reduce((sum, card) => sum + (parseFloat(card.commission_wallet_balance?.toString() || '0')), 0) || 0
    const activeCards = cards?.filter(card => card.subscription_status === 'active').length || 0
    const totalCards = cards?.length || 0

    
    const stats = {
      profile: {
        fullName: profile.full_name,
        phoneNumber: profile.phone_number,
        referralCode: profile.referral_code,
        memberSince: profile.created_at
      },
      wallet: {
        totalBalance: totalWalletBalance,
        commissionBalance: totalCommissionBalance
      },
      cards: {
        total: totalCards,
        active: activeCards
      },
      referrals: referralStats || {
        l1_users_total: 0,
        l1_users_active: 0,
        l2_users_total: 0,
        l2_users_active: 0,
        direct_income_total: 0,
        indirect_income_total: 0
      }
    }

    console.log('📈 [DASHBOARD STATS API] Stats calculated successfully')
    
    return ApiResponse.success({ stats })
  },
  {
    name: 'DASHBOARD STATS API',
    methods: ['GET']
  }
)

export { handler as GET }
