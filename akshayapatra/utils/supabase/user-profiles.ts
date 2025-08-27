import { createAdminClient } from './admin'

const supabase = createAdminClient()

export type UserProfileRow = {
  id: string
  full_name: string
  phone_number: string
  country: string
  state: string
  district: string
  street_address: string
  postal_code: string
  bank_account_holder_name: string
  bank_account_number: string
  bank_ifsc_code: string
  bank_name: string
  bank_branch: string
  bank_account_type: 'savings' | 'current'
  kyc_verified: boolean
  kyc_verification_date?: string
  profile_image_url?: string
  referral_code: string
  is_active: boolean
  created_at: string
  updated_at: string
  created_by?: string
}

export const UserProfileService = {
  async listWithCards(filters: {
    kycVerified?: boolean
    isActive?: boolean
    search?: string
  }): Promise<any[]> {
    try {
      let query = supabase
        .from('user_profiles')
        .select(`
          *,
          cards (
            id,
            cardholder_name,
            subscription_status,
            scheme_id,
            total_payments_made,
            total_wallet_balance,
            commission_wallet_balance,
            is_active,
            created_at
          )
        `)
        .order('created_at', { ascending: false })

      if (filters.kycVerified !== undefined) {
        query = query.eq('kyc_verified', filters.kycVerified)
      }
      if (filters.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive)
      }
      if (filters.search) {
        query = query.or(`full_name.ilike.%${filters.search}%,phone_number.ilike.%${filters.search}%,referral_code.ilike.%${filters.search}%`)
      }

      const { data, error } = await query
      if (error) {
        console.error('List user profiles error:', error)
        return []
      }

      return data?.map(profile => ({
        id: profile.id,
        fullName: profile.full_name,
        phoneNumber: profile.phone_number,
        country: profile.country,
        state: profile.state,
        district: profile.district,
        streetAddress: profile.street_address,
        postalCode: profile.postal_code,
        bankAccountHolderName: profile.bank_account_holder_name,
        bankAccountNumber: profile.bank_account_number,
        bankIfscCode: profile.bank_ifsc_code,
        bankName: profile.bank_name,
        bankBranch: profile.bank_branch,
        bankAccountType: profile.bank_account_type,
        kycVerified: profile.kyc_verified,
        kycVerificationDate: profile.kyc_verification_date,
        profileImageUrl: profile.profile_image_url,
        referralCode: profile.referral_code,
        isActive: profile.is_active,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
        cards: profile.cards?.map((card: any) => ({
          id: card.id,
          cardholderName: card.cardholder_name,
          subscriptionStatus: card.subscription_status,
          schemeId: card.scheme_id,
          totalPaymentsMade: card.total_payments_made,
          totalWalletBalance: card.total_wallet_balance,
          commissionWalletBalance: card.commission_wallet_balance,
          isActive: card.is_active,
          createdAt: card.created_at
        })) || []
      })) || []
    } catch (error) {
      console.error('Error fetching user profiles with cards:', error)
      return []
    }
  },

  async getWithCards(id: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          cards (
            id,
            cardholder_name,
            phone_number,
            subscription_status,
            scheme_id,
            schemes:name,
            total_payments_made,
            total_wallet_balance,
            commission_wallet_balance,
            is_active,
            created_at,
            updated_at
          )
        `)
        .eq('id', id)
        .single()

      if (error || !data) return null

      return {
        id: data.id,
        fullName: data.full_name,
        phoneNumber: data.phone_number,
        country: data.country,
        state: data.state,
        district: data.district,
        streetAddress: data.street_address,
        postalCode: data.postal_code,
        bankAccountHolderName: data.bank_account_holder_name,
        bankAccountNumber: data.bank_account_number,
        bankIfscCode: data.bank_ifsc_code,
        bankName: data.bank_name,
        bankBranch: data.bank_branch,
        bankAccountType: data.bank_account_type,
        kycVerified: data.kyc_verified,
        kycVerificationDate: data.kyc_verification_date,
        profileImageUrl: data.profile_image_url,
        referralCode: data.referral_code,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        cards: data.cards?.map((card: any) => ({
          id: card.id,
          cardholderName: card.cardholder_name,
          phoneNumber: card.phone_number,
          subscriptionStatus: card.subscription_status,
          schemeId: card.scheme_id,
          schemeName: card.schemes?.name,
          totalPaymentsMade: card.total_payments_made,
          totalWalletBalance: card.total_wallet_balance,
          commissionWalletBalance: card.commission_wallet_balance,
          isActive: card.is_active,
          createdAt: card.created_at,
          updatedAt: card.updated_at
        })) || []
      }
    } catch (error) {
      console.error('Error fetching user profile with cards:', error)
      return null
    }
  },

  async create(profileData: Partial<UserProfileRow>): Promise<UserProfileRow | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert([profileData])
        .select('*')
        .single()

      if (error) {
        console.error('Create user profile error:', error)
        return null
      }
      return data as UserProfileRow
    } catch (error) {
      console.error('Error creating user profile:', error)
      return null
    }
  },

  async update(id: string, updates: Partial<UserProfileRow>): Promise<UserProfileRow | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single()

      if (error) {
        console.error('Update user profile error:', error)
        return null
      }
      return data as UserProfileRow
    } catch (error) {
      console.error('Error updating user profile:', error)
      return null
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) {
        console.error('Delete user profile error:', error)
        return false
      }
      return true
    } catch (error) {
      console.error('Error deleting user profile:', error)
      return false
    }
  }
}
