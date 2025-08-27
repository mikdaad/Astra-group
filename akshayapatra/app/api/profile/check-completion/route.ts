import { NextRequest } from 'next/server'
import { withAuth, ApiResponse } from '@/utils/api/authWrapper'

export type ProfileCompletionStatus = {
  isComplete: boolean
  missingSteps: string[]
  details: {
    hasLocation: boolean
    hasAddress: boolean
    hasScheme: boolean
    hasRegistrationFee: boolean
  }
}

const handler = withAuth(
  async (req, { user, supabase }) => {
    console.log('🔍 [PROFILE COMPLETION CHECK] Checking completion for user:', user.id)
    
    try {
      // Get user profile with all required fields
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('country, state, district, street_address, initial_scheme_id, is_phone_verified')
        .eq('id', user.id)
        .maybeSingle()

      if (error) {
        console.error('🔍 [PROFILE COMPLETION CHECK] Database error:', error.message)
        return ApiResponse.error('Failed to check profile completion', 500)
      }

      // If no profile exists, all steps are missing
      if (!profile) {
        console.log('🔍 [PROFILE COMPLETION CHECK] No profile found - all steps missing')
        return ApiResponse.success({
          isComplete: false,
          missingSteps: ['location', 'address', 'profile', 'registration_fee'],
          details: {
            hasLocation: false,
            hasAddress: false,
            hasScheme: false,
            hasRegistrationFee: false
          }
        } as ProfileCompletionStatus)
      }

      // Check each step completion
      const hasLocation = Boolean(profile.country && profile.state && profile.district)
      const hasAddress = Boolean(profile.street_address)
      const hasScheme = Boolean(profile.initial_scheme_id)
      const hasRegistrationFee = Boolean(profile.is_phone_verified)

      // Determine missing steps
      const missingSteps: string[] = []
      if (!hasLocation) missingSteps.push('location')
      if (!hasAddress) missingSteps.push('address')
      if (!hasScheme) missingSteps.push('profile')
      if (!hasRegistrationFee) missingSteps.push('registration_fee')

      const isComplete = missingSteps.length === 0

      console.log('🔍 [PROFILE COMPLETION CHECK] Completion status:', {
        isComplete,
        missingSteps,
        hasLocation,
        hasAddress,
        hasScheme,
        hasRegistrationFee
      })

      return ApiResponse.success({
        isComplete,
        missingSteps,
        details: {
          hasLocation,
          hasAddress,
          hasScheme,
          hasRegistrationFee
        }
      } as ProfileCompletionStatus)

    } catch (error) {
      console.error('🔍 [PROFILE COMPLETION CHECK] Unexpected error:', error)
      return ApiResponse.error('Failed to check profile completion', 500)
    }
  },
  {
    name: 'PROFILE COMPLETION CHECK',
    methods: ['GET']
  }
)

export { handler as GET }