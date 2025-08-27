'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Input } from '@/app/components/general/input'
import Button from '@/app/components/general/Gradientbutton'
import { type SchemeSummary } from '@/app/lib/rpc'
import { attachUserReferralByCode, ensureProfile } from '@/app/lib/rpc'
import { createClient as createSupabaseClient } from '@/utils/supabase/client'
import { userProfileStorage } from '@/utils/storage/profileStorage' // Assuming direct import is possible

// Define the payload type for onServerComplete
type ProfileFormPayload = {
  fullName?: string | null;
  phone?: string | null;
  referralCode?: string | null;
  schemeId?: string | null;
};

interface StepProps {
  setstep: (step: number) => void
  step: number
  onServerComplete?: (payload?: ProfileFormPayload) => void
  schemes: SchemeSummary[] // Schemes are now passed as a prop
  isLoading?: boolean
}

export default function ProfileForm({ setstep, step, onServerComplete, schemes, isLoading = false }: StepProps) {
  // Initialize state with empty strings, will be populated by useEffect
  const [referralId, setReferralId] = useState('')
  const [scheme, setScheme] = useState('')
  
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ scheme?: string }>({})

  // EFFECT: Load initial data from local storage on mount
  useEffect(() => {
    const storedProfile = userProfileStorage.getProfile()
    if (storedProfile) {
      // Pre-fill form with data from local storage if it exists
      setReferralId(storedProfile.referral_code || '')
      setScheme(storedProfile.initial_scheme_id || '')
    }
    
    // Set a default scheme if none is loaded from storage and schemes are available
    if (!storedProfile?.initial_scheme_id && schemes.length > 0) {
      setScheme(schemes[0].id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schemes]) // Rerun if schemes prop changes, but typically it won't after initial load

  const validate = (): boolean => {
    const nextErrors: { scheme?: string } = {}
    if (!scheme) nextErrors.scheme = 'Please select a scheme'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  /**
   * Try ensureProfile with scheme; if your DB function doesn’t accept p_scheme_id (PGRST202),
   * retry ensureProfile without the scheme param.
   */
  const ensureProfileSafe = async (supabase: ReturnType<typeof createSupabaseClient>, {
    fullName,
    phone,
    referralCode,
    schemeId,
  }: { fullName: string; phone: string | null; referralCode: string | null; schemeId: string | null }) => {
    try {
      await ensureProfile({ fullName, phone, referralCode, schemeId }, supabase)
    } catch (e: any) {
      // PostgREST “function not found (signature)” error code
      if (e?.code === 'PGRST202') {
        // Retry without schemeId
        await ensureProfile({ fullName, phone, referralCode, schemeId: null }, supabase)
      } else {
        throw e
      }
    }
  }

  /**
   * Update the chosen scheme on the profile row.
   * Tries `initial_scheme_id` first; if that column is missing (42703), tries `scheme_id`.
   */
  const updateSchemeColumn = async (supabase: ReturnType<typeof createSupabaseClient>, userId: string, schemeId: string) => {
    try {
      // Try initial_scheme_id first
      const { data, error } = await supabase
        .from('user_profiles')
        .update({ 
          initial_scheme_id: schemeId, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', userId)
        .select('id');

      if (error) {
        // If column doesn't exist (42703), try scheme_id instead
        if (error.code === '42703') {
          console.log('initial_scheme_id column not found, trying scheme_id...');
          const { data: data2, error: error2 } = await supabase
            .from('user_profiles')
            .update({ 
              scheme_id: schemeId, 
              updated_at: new Date().toISOString() 
            })
            .eq('id', userId)
            .select('id');
          
          if (error2) {
            throw error2;
          }
          console.log('scheme_id updated successfully:', data2);
          return;
        }
        throw error;
      }
      
      console.log('initial_scheme_id updated successfully:', data);
    } catch (updateError) {
      console.error('updateSchemeColumn failed:', updateError);
      throw updateError;
    }
  }

  const handleNext = useCallback(async () => {
    if (!validate()) return

    setSubmitting(true)
    const supabase = createSupabaseClient()

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) throw new Error('Not signed in')
      const user = session.user as any
      
      console.log('User authentication details:', {
        userId: user.id,
        email: user.email,
        phone: user.phone,
        emailConfirmed: user.email_confirmed_at,
        phoneConfirmed: user.phone_confirmed_at,
        userMetadata: user.user_metadata,
        appMetadata: user.app_metadata,
        role: user.role
      });
      
      // Test database connection and RLS policies
      try {
        console.log('Testing database connection...');
        const { data: testDataArray, error: testError } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('id', user.id)
          .limit(1);
        
        const testData = testDataArray?.[0] || null;
          
        console.log('Database connection test result:', { testData, testError });
        
        if (testError && testError.code) {
          console.error('Database access error - possible RLS policy issue:', testError);
        }
      } catch (dbTestError) {
        console.error('Database connection test failed:', dbTestError);
      }

      // --- FIX: PREVENT OVERWRITING EXISTING PHONE NUMBER ---
      // 1. Fetch the user's current profile from the database to check for an existing phone number.
      const { data: existingProfileArray } = await supabase
        .from('user_profiles')
        .select('phone_number')
        .eq('id', user.id)
        .limit(1);
      
      const existingProfile = existingProfileArray?.[0] || null;

      // 2. Determine the correct phone number to save.
      //    - Prioritize the phone number from the auth metadata (as it might be a fresh update).
      //    - Fall back to the phone number already in the database profile to avoid overwriting it with null.
      //    - Default to null if neither exists.
      const phoneFromMetadata = user?.phone as string | undefined;
      console.log("phoneFromMetadata", phoneFromMetadata);
      const phoneToSave =
        phoneFromMetadata
          ? "+" + phoneFromMetadata
          : existingProfile?.phone_number ?? null;
      
      // 3. Determine the correct full name to save.
      //    - Prioritize user metadata full_name, then name, then email prefix, then default
      let fullName: string;
      
      // Enhanced fullName derivation with comprehensive validation
      const metadataFullName = user?.user_metadata?.full_name;
      const metadataName = user?.user_metadata?.name;
      const emailPrefix = user?.email ? String(user.email).split("@")[0] : null;
      
      console.log("Debug user metadata:", {
        full_name: metadataFullName,
        name: metadataName,
        email: user?.email,
        emailPrefix
      });
      
      if (metadataFullName && typeof metadataFullName === 'string' && metadataFullName.trim()) {
        fullName = metadataFullName.trim();
      } else if (metadataName && typeof metadataName === 'string' && metadataName.trim()) {
        fullName = metadataName.trim();
      } else if (emailPrefix && emailPrefix.trim()) {
        fullName = emailPrefix.trim();
      } else {
        fullName = "User"; // Fallback to default
      }
      
      // Final validation to ensure we never have an empty or null fullName
      if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
        console.error('Failed to derive valid fullName:', { metadataFullName, metadataName, emailPrefix });
        throw new Error('Full name is required but could not be determined from user data');
      }
      
      // Ensure fullName is properly trimmed
      fullName = fullName.trim();
      
      console.log("Final fullName being used:", fullName);
      console.log("phoneToSave being used:", phoneToSave);
      // --- END FIX ---
      
      // Additional validation before calling ensureProfileSafe
      if (!fullName || typeof fullName !== 'string' || fullName.trim().length === 0) {
        throw new Error(`Invalid fullName for ensureProfile: '${fullName}'`);
      }
      
      const profileData = {
        fullName: fullName, // Already validated as non-empty string
        phone: phoneToSave, // Use the correctly determined phone number
        referralCode: referralId || null,
        schemeId: scheme || null,
      };
      
      console.log('Calling ensureProfile with data:', profileData);
      console.log('Individual parameter check:');
      console.log('  - fullName type:', typeof profileData.fullName, 'value:', JSON.stringify(profileData.fullName));
      console.log('  - phone type:', typeof profileData.phone, 'value:', JSON.stringify(profileData.phone));
      console.log('  - referralCode type:', typeof profileData.referralCode, 'value:', JSON.stringify(profileData.referralCode));
      console.log('  - schemeId type:', typeof profileData.schemeId, 'value:', JSON.stringify(profileData.schemeId));
      
      // Let's try multiple approaches to fix the null fullName issue
      let apiSucceeded = false;
      try {
        console.log('Attempting API endpoint approach first...');
        
        // Try using the API endpoint instead of direct RPC
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          throw new Error('No valid session found');
        }
        
        const apiResponse = await fetch('/api/ensure-profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            full_name: profileData.fullName,
            phone_number: profileData.phone,
            referral_code: profileData.referralCode,
            scheme_id: profileData.schemeId
          })
        });
        
        if (!apiResponse.ok) {
          const errorData = await apiResponse.json().catch(() => ({}));
          console.error('API endpoint failed:', errorData);
          throw new Error(errorData.error || `HTTP ${apiResponse.status}`);
        }
        
        const apiResult = await apiResponse.json();
        console.log('API endpoint success:', apiResult);
        apiSucceeded = true; // Mark that API succeeded
        
      } catch (apiError) {
        console.error('API endpoint failed, trying direct RPC calls:', apiError);
        
        // Try ensure_profile (without "2")
        try {
          console.log('Attempting ensure_profile (without 2)...');
          const { data, error } = await supabase.rpc('ensure_profile', {
            p_full_name: profileData.fullName,
            p_phone: profileData.phone,
            p_referral_code: profileData.referralCode,
            p_scheme_id: profileData.schemeId
          });
          
          console.log('ensure_profile result:', { data, error });
          
          if (error) {
            console.error('ensure_profile error:', error);
            throw error;
          }
        } catch (rpcError1) {
          console.error('ensure_profile failed, trying ensure_profile2:', rpcError1);
          
          // Try ensure_profile2
          try {
            console.log('Attempting ensure_profile2...');
            const { data, error } = await supabase.rpc('ensure_profile2', {
              p_full_name: profileData.fullName,
              p_phone: profileData.phone,
              p_referral_code: profileData.referralCode,
              p_scheme_id: profileData.schemeId,
              p_user_id: null
            });
            
            console.log('ensure_profile2 result:', { data, error });
            
            if (error) {
              console.error('ensure_profile2 error:', error);
              throw error;
            }
          } catch (rpcError2) {
            console.error('Both RPC calls failed, trying direct table insert:', rpcError2);
            
            // Final fallback: try multiple direct database approaches
            try {
              console.log('Attempting direct user_profiles operations...');
              const now = new Date().toISOString();
              
              // First, try to get existing profile
              const { data: existingProfileArray } = await supabase
                .from('user_profiles')
                .select('id, full_name')
                .eq('id', user.id)
                .limit(1);
              
              const existingProfile = existingProfileArray?.[0] || null;
              
              console.log('Existing profile check:', existingProfile);
              
              if (existingProfile) {
                // Profile exists - check if it already has the required data
                console.log('Profile exists, checking if update is needed...');
                
                const needsUpdate = (
                  existingProfile.full_name !== profileData.fullName ||
                  !profileData.referralCode || // Only update referral if we have one to set
                  !profileData.schemeId // Only update scheme if we have one to set
                );
                
                if (needsUpdate) {
                  console.log('Profile needs updating...');
                  
                  // Build update object with only fields that need updating
                  const updateData: any = {
                    updated_at: now
                  };
                  
                  if (existingProfile.full_name !== profileData.fullName) {
                    updateData.full_name = profileData.fullName;
                  }
                  
                  if (profileData.phone) {
                    updateData.phone_number = profileData.phone;
                  }
                  
                  if (profileData.referralCode) {
                    updateData.referral_code = profileData.referralCode;
                  }
                  
                  if (profileData.schemeId) {
                    updateData.initial_scheme_id = profileData.schemeId;
                  }
                  
                  try {
                    const { data, error } = await supabase
                      .from('user_profiles')
                      .update(updateData)
                      .eq('id', user.id)
                      .select('id');
                    
                    console.log('Update result:', { data, error });
                    
                    if (error) {
                      console.warn('Update failed but profile exists with correct data:', error);
                      // Don't throw error if profile already has correct full_name
                      if (existingProfile.full_name === profileData.fullName) {
                        console.log('Profile already has correct full_name, treating as success');
                      } else {
                        throw error;
                      }
                    }
                  } catch (updateError) {
                    console.warn('Update operation failed:', updateError);
                    // If profile already exists with correct full_name, don't fail
                    if (existingProfile.full_name === profileData.fullName) {
                      console.log('Profile already contains required data, treating as success');
                    } else {
                      throw updateError;
                    }
                  }
                } else {
                  console.log('Profile already has all required data, no update needed');
                }
              } else {
                // Profile doesn't exist, create it
                console.log('Profile does not exist, creating new...');
                const { data, error } = await supabase
                  .from('user_profiles')
                  .insert({
                    id: user.id,
                    full_name: profileData.fullName,
                    phone_number: profileData.phone || '',
                    referral_code: profileData.referralCode,
                    initial_scheme_id: profileData.schemeId,
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
                  .select('id');
                
                console.log('Insert result:', { data, error });
                
                if (error) {
                  throw error;
                }
              }
              
              console.log('Direct database operation succeeded');
              
              // Ensure scheme is updated separately if needed
              if (profileData.schemeId) {
                try {
                  console.log('Ensuring initial_scheme_id is set...');
                  const { error: schemeUpdateError } = await supabase
                    .from('user_profiles')
                    .update({ 
                      initial_scheme_id: profileData.schemeId,
                      updated_at: new Date().toISOString()
                    })
                    .eq('id', user.id);
                  
                  if (schemeUpdateError) {
                    console.warn('Failed to update initial_scheme_id:', schemeUpdateError);
                  } else {
                    console.log('initial_scheme_id updated successfully');
                  }
                } catch (schemeError) {
                  console.warn('Scheme update operation failed:', schemeError);
                }
              }
              
            } catch (insertError) {
              console.error('All approaches failed:', insertError);
              
              // Final verification: check if profile actually exists with correct data
              try {
                const { data: diagnosticDataArray } = await supabase
                  .from('user_profiles')
                  .select('*')
                  .eq('id', user.id)
                  .limit(1);
                
                const diagnosticData = diagnosticDataArray?.[0] || null;
                  
                console.log('Diagnostic - current user profile in database:', diagnosticData);
                
                // If profile exists with correct full_name, consider it a success
                if (diagnosticData && diagnosticData.full_name === profileData.fullName) {
                  console.log('✅ Profile verification: Profile exists with correct data, treating as success!');
                  
                  // Check and update initial_scheme_id if needed
                  if (profileData.schemeId && diagnosticData.initial_scheme_id !== profileData.schemeId) {
                    console.log('🔄 Updating initial_scheme_id in final verification...');
                    try {
                      await supabase
                        .from('user_profiles')
                        .update({ 
                          initial_scheme_id: profileData.schemeId,
                          updated_at: new Date().toISOString()
                        })
                        .eq('id', user.id);
                      console.log('✅ initial_scheme_id updated successfully in final verification');
                    } catch (finalSchemeError) {
                      console.warn('⚠️ Failed to update initial_scheme_id in final verification:', finalSchemeError);
                    }
                  } else if (diagnosticData.initial_scheme_id === profileData.schemeId) {
                    console.log('✅ initial_scheme_id already correct:', diagnosticData.initial_scheme_id);
                  }
                  
                  // Don't throw error - profile is actually complete
                } else if (diagnosticData && diagnosticData.full_name) {
                  console.log('⚠️ Profile exists but with different full_name:', {
                    expected: profileData.fullName,
                    actual: diagnosticData.full_name
                  });
                  throw new Error(`Profile exists but full_name mismatch: expected '${profileData.fullName}', got '${diagnosticData.full_name}'`);
                } else {
                  console.log('❌ Profile does not exist or has null full_name');
                  throw new Error(`Failed to create profile: ${insertError instanceof Error ? insertError.message : 'Unknown error'}`);
                }
              } catch (diagError) {
                console.log('Could not run diagnostic query:', diagError);
                throw new Error(`Failed to create profile: ${insertError instanceof Error ? insertError.message : 'Unknown error'}`);
              }
            }
          }
        }
      }

      // 2) Attach referral if provided
      if (referralId) {
        try {
          await attachUserReferralByCode(
            { userId: user.id, referralCode: referralId },
            supabase
          )
        } catch (e) {
          console.warn('[ProfileForm] attachUserReferralByCode failed:', e)
        }
      }

      // 3) Update scheme column only if API endpoint failed
      // API endpoint already handles scheme creation, so no need to update separately
      if (scheme && !apiSucceeded) {
        try {
          console.log('API failed, attempting manual scheme update...');
          await updateSchemeColumn(supabase, user.id, scheme)
        } catch (e) {
          console.warn('[ProfileForm] updateSchemeColumn failed:', e)
        }
      } else if (scheme && apiSucceeded) {
        console.log('✅ Skipping updateSchemeColumn since API endpoint already handled scheme creation');
      }

      // 4) Update local storage milestones
      try {
        const { profileSetupStorage, setupMilestoneStorage } = await import('@/utils/storage/profileStorage')
        profileSetupStorage.markStepDone('profile')
        setupMilestoneStorage.markCompleted('profile_form')
        userProfileStorage.updateProfile({
          initial_scheme_id: scheme || undefined,
          referral_code: referralId || undefined,
        })
      } catch (e) {
        console.warn('[ProfileForm] local storage update failed:', e)
      }

      // 5) Notify parent & advance step with payload data
      const payload: ProfileFormPayload = {
        fullName: fullName, // Already validated as non-empty string
        phone: phoneToSave,
        referralCode: referralId || null,
        schemeId: scheme || null,
      };
      
      // Final payload validation
      if (!payload.fullName || typeof payload.fullName !== 'string' || payload.fullName.trim().length === 0) {
        throw new Error(`Invalid payload fullName: '${payload.fullName}'`);
      }
      
      console.log("Final payload being sent:", payload);
      console.log("Payload fullName type:", typeof payload.fullName, "length:", payload.fullName.length);
      
      try { 
        onServerComplete?.(payload); 
      } catch {}
      setstep(step + 1)
    } catch (err) {
      console.error('ProfileForm submission failed:', err)
      console.error('Error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
        error: err
      })
      setErrors((prev) => ({ ...prev, scheme: 'Could not save. Please try again.' }))
    } finally {
      setSubmitting(false)
    }
  }, [scheme, referralId, setstep, step, onServerComplete])

  // --- JSX remains largely the same, but simplified ---

  return (
    <div
      className="min-h-screen w-full font-sans text-white"
      style={{ backgroundImage: 'linear-gradient(to top, #090300, #351603, #6E2B00, #CA5002)' }}
    >
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-12">
        <h1 className="text-2xl font-semibold mb-2">Set up your profile</h1>
        <p className="text-white/70 text-sm mb-8">This information needs to be accurate</p>

        <div className="space-y-5">
          <Input
            placeholder="Referral Id (Optional)"
            value={referralId}
            onChange={(e) => setReferralId(e.target.value.trim())}
            className="rounded-lg border border-[#2A1203] bg-[#1F0D05] px-4 py-3 text-white placeholder-white"
            disabled={submitting || isLoading}
          />

          <div>
            <select
              aria-label="Scheme"
              value={scheme}
              onChange={(e) => setScheme(e.target.value)}
              className="w-full rounded-lg border border-[#2A1203] bg-[#1F0D05] px-4 py-3 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={submitting || isLoading}
            >
              <option value="" disabled className="bg-[#1F0D05] text-white">
                Select a scheme
              </option>
              {schemes.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#1F0D05] text-white">
                  {s.name}
                </option>
              ))}
            </select>
            {errors.scheme && <p className="text-red-400 text-xs mt-1">{errors.scheme}</p>}
          </div>
        </div>

        <div className="mt-10 max-w-sm mx-auto">
          <Button onClick={handleNext} disabled={submitting || isLoading}>
            {submitting || isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin ml-4 rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving…</span>
              </div>
            ) : (
              'Next'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
