// app/api/ensure-profile/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient as createSbClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || ''
    const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined

    let supabaseResponse = NextResponse.next({ request: req })
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return req.cookies.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
            supabaseResponse = NextResponse.next({ request: req })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    let user: { id: string; phone?: string | null; user_metadata?: Record<string, unknown> } | undefined
    let rpcClient: ReturnType<typeof createServerClient> | ReturnType<typeof createSbClient> = supabase

    if (bearer) {
      const sb = createSbClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Authorization: `Bearer ${bearer}` } },
          auth: { persistSession: false, detectSessionInUrl: false } }
      )
      const { data, error } = await sb.auth.getUser()
      if (error || !data?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      user = data.user
      rpcClient = sb
    } else {
      const { data, error } = await supabase.auth.getUser()
      if (error || !data?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      user = data.user
    }

    const body = await req.json().catch(() => ({}))
    type UserMetadata = { full_name?: string; display_name?: string }
    const metadata = (user?.user_metadata as UserMetadata | undefined)
    const full_name = body.full_name ?? metadata?.full_name ?? metadata?.display_name ?? ''
    const phone_number = body.phone_number ?? user?.phone ?? ''
    const referral_code = body.referral_code ?? req.cookies.get('referral_code')?.value ?? null
    const scheme_id = body.scheme_id ?? null

    // Try ensure_profile2 first, then ensure_profile, then fallback to direct table operations
    let rpcSuccess = false;
    let rpcError: any = null;
    
    // Try ensure_profile2 first (supports scheme_id)
    try {
      const { data, error } = await rpcClient.rpc('ensure_profile2', {
        p_full_name: full_name,
        p_phone: phone_number,
        p_referral_code: referral_code,
        p_scheme_id: scheme_id,
        p_user_id: null // Let function use auth.uid()
      })
      if (!error) {
        rpcSuccess = true;
        return NextResponse.json({ ok: true, data, method: 'ensure_profile2' })
      }
      rpcError = error;
    } catch (e) {
      console.warn('ensure_profile2 failed:', e)
      rpcError = e;
    }
    
    // Try ensure_profile (without scheme_id)
    if (!rpcSuccess) {
      try {
        const { data, error } = await rpcClient.rpc('ensure_profile', {
          p_full_name: full_name,
          p_phone: phone_number,
          p_referral_code: referral_code,
          p_user_id: null
        })
        if (!error) {
          rpcSuccess = true;
          
          // Update scheme separately if needed
          if (scheme_id && user?.id) {
            try {
              console.log('Updating scheme separately:', { scheme_id, user_id: user.id });
              const { data: schemeUpdateData, error: schemeUpdateError } = await rpcClient
                .from('user_profiles')
                .update({ initial_scheme_id: scheme_id, updated_at: new Date().toISOString() })
                .eq('id', user.id)
                .select('id, initial_scheme_id');
              
              if (schemeUpdateError) {
                console.error('Failed to update scheme separately:', schemeUpdateError);
              } else {
                console.log('Scheme updated separately successfully:', schemeUpdateData);
              }
            } catch (schemeError) {
              console.error('Exception during separate scheme update:', schemeError);
            }
          }
          
          return NextResponse.json({ ok: true, data, method: 'ensure_profile' })
        }
        rpcError = error;
      } catch (e) {
        console.warn('ensure_profile failed:', e)
        rpcError = e;
      }
    }
    
    // Fallback to direct table operations
    if (!rpcSuccess && user?.id) {
      try {
        console.log('RPC functions failed, trying direct table operations...')
        
        // Check if profile exists
        const { data: existingProfileArray } = await rpcClient
          .from('user_profiles')
          .select('id, full_name, initial_scheme_id')
          .eq('id', user.id)
          .limit(1)
        
        const existingProfile = existingProfileArray?.[0] || null
        
        const now = new Date().toISOString();
        
        if (existingProfile) {
          // Update existing profile
          const updateData: any = {
            full_name: full_name || 'User',
            updated_at: now
          }
          
          if (phone_number) updateData.phone_number = phone_number
          if (referral_code) updateData.referral_code = referral_code
          if (scheme_id) updateData.initial_scheme_id = scheme_id
          
          const { error: updateError } = await rpcClient
            .from('user_profiles')
            .update(updateData)
            .eq('id', user.id)
          
          if (updateError) {
            console.warn('Update failed but profile exists:', updateError)
            // Check if profile has correct full_name
            if (existingProfile.full_name === (full_name || 'User')) {
              return NextResponse.json({ ok: true, data: null, method: 'direct_update_success' })
            }
            throw updateError
          }
          
          return NextResponse.json({ ok: true, data: null, method: 'direct_update' })
        } else {
          // Create new profile
          const { error: insertError } = await rpcClient
            .from('user_profiles')
            .insert({
              id: user.id,
              full_name: full_name || 'User',
              phone_number: phone_number || '',
              referral_code: referral_code,
              initial_scheme_id: scheme_id,
              country: '',
              state: '',
              district: '',
              street_address: '',
              postal_code: '',
              bank_account_holder_name: '',
              bank_account_number: '',
              bank_ifsc_code: '',
              bank_name: '',
              bank_branch: '',
              bank_account_type: 'savings',
              kyc_verified: false,
              is_active: true,
              created_at: now,
              updated_at: now
            })
          
          if (insertError) throw insertError
          
          return NextResponse.json({ ok: true, data: null, method: 'direct_insert' })
        }
      } catch (directError) {
        console.error('Direct table operations failed:', directError)
        return NextResponse.json({ 
          error: `All methods failed. Last error: ${directError instanceof Error ? directError.message : 'Unknown error'}` 
        }, { status: 400 })
      }
    }
    
    return NextResponse.json({ 
      error: rpcError?.message || 'Failed to ensure profile' 
    }, { status: 400 })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
