import type { SupabaseClient } from '@supabase/supabase-js'
import { withAuth, ApiResponse, validateRequestBody } from '@/utils/api/authWrapper'

// Interface for creating a new card
interface CreateCardRequest {
  card_name: string
  cardholder_name: string
  phone_number: string
  scheme_id: string
  referral_code: string
  payment_method?: 'upi_mandate' | 'bank_transfer' | 'card' | 'wallet' | 'cash'
  referred_by_code?: string
}



// Helper function to find referrer by code
async function findReferrerByCode(supabase: SupabaseClient, referralCode: string) {
  const { data: referrerCard, error } = await supabase
    .from('cards')
    .select('user_id, ref_l1_user_id')
    .eq('referral_code', referralCode)
    .eq('is_active', true)
    .single()

  if (error || !referrerCard) {
    return null
  }

  return {
    ref_l1_user_id: referrerCard.user_id,
    ref_l2_user_id: referrerCard.ref_l1_user_id
  }
}

// POST: Create new card
const postHandler = withAuth(
  async (req, { user, supabase }) => {
    console.log('💳 [CARDS CREATE] Creating new card for user:', user.id)
    
    // Validate request body
    const validation = await validateRequestBody<CreateCardRequest>(req, [
      'card_name', 'cardholder_name', 'phone_number', 'scheme_id', 'referral_code'
    ])
    
    if (!validation.isValid) {
      return ApiResponse.error('Validation failed', 400, { errors: validation.errors })
    }
    
    const cardData = validation.data!
    
    try {
      // Verify scheme exists and is active
      const { data: scheme, error: schemeError } = await supabase
        .from('schemes')
        .select('id, name, subscription_amount, status, start_date, end_date')
        .eq('id', cardData.scheme_id)
        .single()

      if (schemeError || !scheme) {
        return ApiResponse.notFound('Scheme')
      }

      if (scheme.status !== 'active') {
        return ApiResponse.error('Scheme is not active', 400)
      }

      // Check if scheme is still open for subscriptions
      const now = new Date()
      const startDate = new Date(scheme.start_date)
      const endDate = new Date(scheme.end_date)
      
      if (now < startDate) {
        return ApiResponse.error('Scheme has not started yet', 400)
      }
      
      if (now > endDate) {
        return ApiResponse.error('Scheme subscription period has ended', 400)
      }

      // Check if provided referral code is unique
      const { data: existingCard } = await supabase
        .from('cards')
        .select('id')
        .eq('referral_code', cardData.referral_code)
        .single()
      
      if (existingCard) {
        return ApiResponse.error('Referral code already exists', 400)
      }

      // Handle referral logic
      let ref_l1_user_id = null
      let ref_l2_user_id = null
      
      if (cardData.referred_by_code) {
        const referrerInfo = await findReferrerByCode(supabase, cardData.referred_by_code)
        if (referrerInfo) {
          ref_l1_user_id = referrerInfo.ref_l1_user_id
          ref_l2_user_id = referrerInfo.ref_l2_user_id
        } else {
          return ApiResponse.error('Invalid referral code', 400)
        }
      }

      // Set subscription dates
      const subscriptionStartDate = new Date()
      const subscriptionEndDate = new Date(scheme.end_date)

      // Calculate next payment date based on subscription cycle
      const nextPaymentDate = new Date(subscriptionStartDate)
      // For now, set to next month (you can adjust based on scheme.subscription_cycle)
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1)

      // Insert new card
      const { data: card, error: insertError } = await supabase
        .from('cards')
        .insert({
          user_id: user.id,
          card_name: cardData.card_name,
          cardholder_name: cardData.cardholder_name,
          phone_number: cardData.phone_number,
          referral_code: cardData.referral_code,
          ref_l1_user_id,
          ref_l2_user_id,
          scheme_id: cardData.scheme_id,
          subscription_status: 'active',
          payment_method: cardData.payment_method || 'upi_mandate',
          subscription_start_date: subscriptionStartDate.toISOString(),
          subscription_end_date: subscriptionEndDate.toISOString(),
          next_payment_date: nextPaymentDate.toISOString(),
          total_wallet_balance: 0,
          commission_wallet_balance: 0,
          is_active: true
        })
        .select(`
          *,
          scheme:schemes(name, subscription_amount, scheme_type)
        `)
        .single()

      if (insertError) {
        console.error('💳 [CARDS CREATE] Database error:', insertError.message)
        return ApiResponse.error('Failed to create card', 500)
      }

      console.log('💳 [CARDS CREATE] Card created successfully:', card.id)
      
      return ApiResponse.success({ card }, 'Card created successfully')
      
    } catch (error) {
      console.error('💳 [CARDS CREATE] Unexpected error:', error)
      return ApiResponse.error('Failed to create card', 500)
    }
  },
  {
    name: 'CARDS CREATE',
    methods: ['POST']
  }
)

// GET: List user's cards
const getHandler = withAuth(
  async (req, { user, supabase }) => {
    console.log('💳 [CARDS LIST] Listing cards for user:', user.id)
    
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const scheme_id = searchParams.get('scheme_id')
    
    try {
      let query = supabase
        .from('cards')
        .select(`
          *,
          scheme:schemes(
            id,
            name,
            subscription_amount,
            scheme_type,
            subscription_cycle,
            status
          )
        `, { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      // Apply filters
      if (status) {
        query = query.eq('subscription_status', status)
      }
      
      if (scheme_id) {
        query = query.eq('scheme_id', scheme_id)
      }
      
      // Apply pagination
      const from = (page - 1) * limit
      const to = from + limit - 1
      query = query.range(from, to)
      
      const { data: cards, error, count } = await query

      if (error) {
        console.error('💳 [CARDS LIST] Database error:', error.message)
        return ApiResponse.error('Failed to fetch cards', 500)
      }

      console.log('💳 [CARDS LIST] Cards fetched successfully, count:', count)
      
      return ApiResponse.success({
        cards,
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit)
        }
      }, 'Cards fetched successfully')
      
    } catch (error) {
      console.error('💳 [CARDS LIST] Unexpected error:', error)
      return ApiResponse.error('Failed to fetch cards', 500)
    }
  },
  {
    name: 'CARDS LIST',
    methods: ['GET']
  }
)

export { postHandler as POST, getHandler as GET }
