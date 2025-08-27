import { createAdminClient } from './admin'

const supabase = createAdminClient()

export type CardRow = {
  id: string
  user_id: string
  cardholder_name: string
  phone_number: string
  ref_l1_user_id?: string
  ref_l2_user_id?: string
  scheme_id?: string
  subscription_status: 'active' | 'paused' | 'cancelled' | 'expired' | 'completed'
  next_payment_date?: string
  payment_method: 'upi_mandate' | 'card' | 'bank_transfer'
  mandate_id?: string
  subscription_start_date?: string
  subscription_end_date?: string
  last_payment_date?: string
  total_payments_made: number
  cancelled_by?: string
  cancellation_reason?: string
  total_wallet_balance: number
  commission_wallet_balance: number
  is_active: boolean
  suspended_by?: string
  suspension_reason?: string
  created_at: string
  updated_at: string
  created_by?: string
}

export const CardService = {
  async listWithUserProfiles(filters: {
    userId?: string
    status?: string
    schemeId?: string
  }): Promise<any[]> {
    try {
      let query = supabase
        .from('cards')
        .select(`
          *,
          schemes (
            id,
            name,
            description
          ),
          user_profiles!user_id (
            id,
            full_name,
            phone_number,
            country,
            state,
            district,
            kyc_verified,
            referral_code,
            is_active
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (filters.userId) {
        query = query.eq('user_id', filters.userId)
      }
      if (filters.status && filters.status !== 'all') {
        query = query.eq('subscription_status', filters.status)
      }
      if (filters.schemeId) {
        query = query.eq('scheme_id', filters.schemeId)
      }

      const { data, error } = await query
      if (error) {
        console.error('List cards error:', error)
        return []
      }

      return data?.map(card => ({
        id: card.id,
        userId: card.user_id,
        cardholderName: card.cardholder_name,
        phoneNumber: card.phone_number,
        refL1UserId: card.ref_l1_user_id,
        refL2UserId: card.ref_l2_user_id,
        schemeId: card.scheme_id,
        schemeName: card.schemes?.name,
        subscriptionStatus: card.subscription_status,
        nextPaymentDate: card.next_payment_date,
        paymentMethod: card.payment_method,
        mandateId: card.mandate_id,
        subscriptionStartDate: card.subscription_start_date,
        subscriptionEndDate: card.subscription_end_date,
        lastPaymentDate: card.last_payment_date,
        totalPaymentsMade: card.total_payments_made,
        totalWalletBalance: card.total_wallet_balance,
        commissionWalletBalance: card.commission_wallet_balance,
        isActive: card.is_active,
        createdAt: card.created_at,
        updatedAt: card.updated_at,
        userProfile: card.user_profiles ? {
          id: card.user_profiles.id,
          fullName: card.user_profiles.full_name,
          phoneNumber: card.user_profiles.phone_number,
          country: card.user_profiles.country,
          state: card.user_profiles.state,
          district: card.user_profiles.district,
          kycVerified: card.user_profiles.kyc_verified,
          referralCode: card.user_profiles.referral_code,
          isActive: card.user_profiles.is_active,
          createdAt: card.user_profiles.created_at
        } : null
      })) || []
    } catch (error) {
      console.error('Error fetching cards with user profiles:', error)
      return []
    }
  },

  async getWithUserProfile(id: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('cards')
        .select(`
          *,
          schemes (
            id,
            name,
            description
          ),
          user_profiles!user_id (
            id,
            full_name,
            phone_number,
            country,
            state,
            district,
            street_address,
            postal_code,
            bank_account_holder_name,
            bank_account_number,
            bank_ifsc_code,
            bank_name,
            bank_branch,
            bank_account_type,
            kyc_verified,
            kyc_verification_date,
            kyc_verified_by,
            profile_image_url,
            notification_preferences,
            referral_code,
            referred_by_user_id,
            commission_destination_card_id,
            is_active,
            created_at,
            updated_at,
            referred_by_user_l2_id,
            commission_destination_kind,
            is_phone_verified
          )
        `)
        .eq('id', id)
        .single()

      if (error || !data) return null

      return {
        id: data.id,
        userId: data.user_id,
        cardholderName: data.cardholder_name,
        phoneNumber: data.phone_number,
        refL1UserId: data.ref_l1_user_id,
        refL2UserId: data.ref_l2_user_id,
        schemeId: data.scheme_id,
        schemeName: data.schemes?.name,
        schemeDescription: data.schemes?.description,
        subscriptionStatus: data.subscription_status,
        nextPaymentDate: data.next_payment_date,
        paymentMethod: data.payment_method,
        mandateId: data.mandate_id,
        subscriptionStartDate: data.subscription_start_date,
        subscriptionEndDate: data.subscription_end_date,
        lastPaymentDate: data.last_payment_date,
        totalPaymentsMade: data.total_payments_made,
        cancelledBy: data.cancelled_by,
        cancellationReason: data.cancellation_reason,
        totalWalletBalance: data.total_wallet_balance,
        commissionWalletBalance: data.commission_wallet_balance,
        isActive: data.is_active,
        suspendedBy: data.suspended_by,
        suspensionReason: data.suspension_reason,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        userProfile: data.user_profiles ? {
          id: data.user_profiles.id,
          fullName: data.user_profiles.full_name,
          phoneNumber: data.user_profiles.phone_number,
          country: data.user_profiles.country,
          state: data.user_profiles.state,
          district: data.user_profiles.district,
          streetAddress: data.user_profiles.street_address,
          postalCode: data.user_profiles.postal_code,
          bankAccountHolderName: data.user_profiles.bank_account_holder_name,
          bankAccountNumber: data.user_profiles.bank_account_number,
          bankIfscCode: data.user_profiles.bank_ifsc_code,
          bankName: data.user_profiles.bank_name,
          bankBranch: data.user_profiles.bank_branch,
          bankAccountType: data.user_profiles.bank_account_type,
          kycVerified: data.user_profiles.kyc_verified,
          kycVerificationDate: data.user_profiles.kyc_verification_date,
          kycVerifiedBy: data.user_profiles.kyc_verified_by,
          profileImageUrl: data.user_profiles.profile_image_url,
          notificationPreferences: data.user_profiles.notification_preferences,
          referralCode: data.user_profiles.referral_code,
          referredByUserId: data.user_profiles.referred_by_user_id,
          commissionDestinationCardId: data.user_profiles.commission_destination_card_id,
          isActive: data.user_profiles.is_active,
          createdAt: data.user_profiles.created_at,
          updatedAt: data.user_profiles.updated_at,
          referredByUserL2Id: data.user_profiles.referred_by_user_l2_id,
          commissionDestinationKind: data.user_profiles.commission_destination_kind,
          isPhoneVerified: data.user_profiles.is_phone_verified
        } : null
      }
    } catch (error) {
      console.error('Error fetching card with user profile:', error)
      return null
    }
  },

  async create(cardData: Partial<CardRow>): Promise<CardRow | null> {
    try {
      const { data, error } = await supabase
        .from('cards')
        .insert([cardData])
        .select('*')
        .single()

      if (error) {
        console.error('Create card error:', error)
        return null
      }
      return data as CardRow
    } catch (error) {
      console.error('Error creating card:', error)
      return null
    }
  },

  async update(id: string, updates: Partial<CardRow>): Promise<CardRow | null> {
    try {
      const { data, error } = await supabase
        .from('cards')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single()

      if (error) {
        console.error('Update card error:', error)
        return null
      }
      return data as CardRow
    } catch (error) {
      console.error('Error updating card:', error)
      return null
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('cards')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) {
        console.error('Delete card error:', error)
        return false
      }
      return true
    } catch (error) {
      console.error('Error deleting card:', error)
      return false
    }
  }
}
