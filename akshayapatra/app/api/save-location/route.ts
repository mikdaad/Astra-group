// app/api/save-location/route.ts
import { withAuth, ApiResponse, validateRequestBody } from '@/utils/api/authWrapper'
import { ensureProfile } from '@/app/lib/rpc'

interface SaveLocationBody {
  address: string
  fullName?: string | null
  phone?: string | null
  referralCode?: string | null
  schemeId?: string | null
}

const handler = withAuth(
  async (req, { user, supabase }) => {
    const validation = await validateRequestBody<SaveLocationBody>(req, ['address'])
    if (!validation.isValid) {
      return ApiResponse.error(validation.errors?.join(', ') || 'Invalid request', 400)
    }

    const { address, fullName: bodyFullName, phone: bodyPhone, referralCode, schemeId } = validation.data!
    const now = new Date().toISOString()

    // 1) Check if row exists
    const existing = await supabase
      .from('user_profiles')
      .select('id, full_name')
      .eq('id', user.id)
      .maybeSingle()

    if (existing.error) {
      console.error('📍 [SAVE LOCATION API] Read error:', existing.error)
    }

    // 2) If missing, ensure profile (tolerant wrapper handles signatures)
    if (!existing.data) {
      const fallbackFullName =
        bodyFullName ??
        (user.user_metadata?.full_name as string | undefined) ??
        (user.user_metadata?.name as string | undefined) ??
        (user.email ? String(user.email).split('@')[0] : 'User')

      const fallbackPhone =
        bodyPhone ??
        (user.user_metadata?.phone as string | undefined) ??
        null

      try {
        await ensureProfile(
          {
            fullName: fallbackFullName ?? 'User',
            phone: fallbackPhone ?? null,
            referralCode: referralCode ?? null,
            schemeId: schemeId ?? null,
            // userId optional; your function likely uses auth.uid()
          },
          supabase
        )
      } catch (e) {
        console.error('❌ [SAVE LOCATION API] ensureProfile failed (will attempt direct insert):', e)
        // 2b) Fallback: create minimal row so NOT NULL constraints pass
        const insertRes = await supabase
          .from('user_profiles')
          .insert({
            id: user.id,
            full_name: (fallbackFullName ?? 'User'), // NOT NULL in your schema
            street_address: null,
            updated_at: now,
          })


        if (insertRes.error) {
          console.error('❌ [SAVE LOCATION API] Direct insert fallback failed:', insertRes.error)
          return ApiResponse.error('Failed to ensure user profile (RLS/policy?)', 500)
        }
      }
    } else if (!existing.data.full_name) {
      // Row exists but misses NOT NULL column full_name; patch it once
      const fallbackFullName =
        bodyFullName ??
        (user.user_metadata?.full_name as string | undefined) ??
        (user.user_metadata?.name as string | undefined) ??
        (user.email ? String(user.email).split('@')[0] : 'User')

      await supabase
        .from('user_profiles')
        .update({ full_name: fallbackFullName ?? 'User', updated_at: now })
        .eq('id', user.id)
    }

    // 3) Update address
    const updateRes = await supabase
      .from('user_profiles')
      .update({ street_address: address, updated_at: now })
      .eq('id', user.id)
      .select()

    if (updateRes.error) {
      console.error('📍 [SAVE LOCATION API] Database error:', {
        message: updateRes.error.message,
        code: updateRes.error.code,
        details: (updateRes.error as any).details,
        hint: (updateRes.error as any).hint,
      })
      return ApiResponse.error('Failed to save location', 500)
    }

    const row = updateRes.data?.[0]
    if (!row) {
      console.error('📍 [SAVE LOCATION API] No profile row updated for user:', user.id)
      return ApiResponse.error('Profile not found (RLS or schema mismatch)', 404)
    }

    return ApiResponse.success({ profile: row }, 'Location saved successfully')
  },
  { name: 'SAVE LOCATION API', methods: ['POST'] }
)

export { handler as POST }
