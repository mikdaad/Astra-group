"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Csdselect from "@/app/components/signup/csdselector/csdselect";
import LocationPage from "@/app/components/signup/locationselect/location";
import ProfileForm from "@/app/components/signup/profile/profileform";
import CongratsIndex from "@/app/components/signup/congrats/congratsindex";
import IssuingCard from "@/app/components/signup/congrats/issuingcard";
import RegistrationFee from "@/app/components/signup/congrats/registrationfee";
import CredentialsCard from "@/app/components/signup/congrats/credentialscard";
import { createClient } from "@/utils/supabase/client";
import { ensureProfile, attachUserReferralByCode, type SchemeSummary } from "@/app/lib/rpc";
import { profileSetupStorage } from "@/utils/storage/profileStorage";
import { PaymentSuccessPopup, type PaymentReceiptData } from "@/app/components/payment/PaymentSuccessPopup";

const DEFAULT_MAPPING: number[] = [1, 2, 3, 4, 5, 6, 7];

type ProfileFormPayload = {
 fullName?: string | null;
 phone?: string | null;
 referralCode?: string | null;
 schemeId?: string | null;
};

export default function ProfileSetupClient() {
 const [step, setStep] = useState(0);
 
 useEffect(() => {
   console.log('📍 Step changed to:', step, 'Step type:', stepMapping?.[step]);
 }, [step]);
 const [stepMapping, setStepMapping] = useState<number[] | null>(null); // Start with null to indicate "loading"
 const [schemes, setSchemes] = useState<SchemeSummary[]>([]);
 const [isLoading, setIsLoading] = useState(false);
 const [isInitializing, setIsInitializing] = useState(true);
 const [loadingMessage, setLoadingMessage] = useState("");
 const ensuredRef = useRef(false);
 const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
 const [paymentReceipt, setPaymentReceipt] = useState<PaymentReceiptData | null>(null);

 const searchParams = useSearchParams();
 const router = useRouter(); 
 const supabase = createClient();

 useEffect(() => {
  let cancelled = false;
  (async () => {
   try {
    setLoadingMessage("Loading schemes...");
    const res = await fetch('/api/schemes', { credentials: 'include', cache: 'no-store' });
    const json = (await res.json().catch(() => ({}))) as { success?: boolean; schemes?: SchemeSummary[] };
    const rows = Array.isArray(json?.schemes) ? (json.schemes as SchemeSummary[]) : [];
    if (!cancelled) {
     setSchemes(rows);
     setLoadingMessage("");
    }
   } catch (e) {
    console.error("Failed to fetch schemes:", e);
    if (!cancelled) {
     setLoadingMessage("");
    }
   }
  })();
  return () => {
   cancelled = true;
  };
 }, []);

   const fetchProfile = async () => {
   const { data: { session } } = await supabase.auth.getSession();
   if (!session?.user?.id) return null;

   const { data, error } = await supabase
    .from("user_profiles")
    .select("id,phone_number,country,state,district,street_address,referred_by_user_id,initial_scheme_id,is_phone_verified")
    .eq("id", session.user.id)
    .maybeSingle();

   if (error) {
    console.warn("fetchProfile error:", error);
    return null;
   }
   return data;
  };

  // Function to check if registration fee is needed
  const checkRegistrationFeeNeeded = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return true; // Default to needed if no user

      // Check if user has paid registration fee (is_phone_verified = true)
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("is_phone_verified")
        .eq("id", session.user.id)
        .maybeSingle();

      if (profile?.is_phone_verified) {
        return false; // Registration fee already paid
      }

     

      return true; // Registration fee needed
    } catch (error) {
      console.warn("Error checking registration fee status:", error);
      return true; // Default to needed on error
    }
  };

   const computeStepMappingFromProfile = async (profile: any | null): Promise<number[]> => {
   // Get missing steps from localStorage first
   const missingSteps = profileSetupStorage.getMissingSteps();
   
       // If we have missing steps in localStorage, use them
    if (missingSteps.length > 0) {
      const stepMap: { [key: string]: number } = {
        'location': 1,
        'address': 2,
        'profile': 3,
        'registration_fee': 7  // Updated to step 7
      };
      
      const mapping: number[] = [];
      missingSteps.forEach(step => {
        if (stepMap[step]) {
          mapping.push(stepMap[step]);
        }
      });
      
      // Always add the congratulations flow after profile steps in correct order
      if (!mapping.includes(4)) mapping.push(4); // Congrats index
      if (!mapping.includes(5)) mapping.push(5); // Issuing card
      if (!mapping.includes(6)) mapping.push(6); // Credentials card
      
      // Add registration fee if needed
      if (missingSteps.includes('registration_fee') && !mapping.includes(7)) {
        mapping.push(7); // Registration fee
      }
      
      // Sort the mapping to ensure proper order
      mapping.sort((a, b) => a - b);
      
      return mapping;
    }

   // If no missing steps in localStorage, compute from profile data
   const needsLocation = !profile?.country || !profile?.state || !profile?.district;
   const needsAddress = !profile?.street_address;
   const hasInitialScheme = Boolean(profile?.initial_scheme_id);

   // If all profile steps are complete, check if registration fee is needed
   if (!needsLocation && !needsAddress && !hasInitialScheme) {
     const needsRegFee = await checkRegistrationFeeNeeded();
     if (!needsRegFee) {
       // Profile complete but still need to show the congratulations flow
       return [4, 5, 6]; // Congrats, issuing card, credentials card
     } else {
       // Profile complete, need registration fee
       return [4, 5, 6, 7]; // Congrats, issuing card, credentials card, registration fee
     }
   }

   // Build mapping for incomplete steps
   const mapping: number[] = [];
   let idx = 0;
   if (needsLocation) mapping[idx++] = 1;
   if (needsAddress) mapping[idx++] = 2;
   if (!hasInitialScheme) mapping[idx++] = 3; // Add profile step if scheme not selected
   

   // Check if registration fee is needed before adding completion steps
   const needsRegFee = await checkRegistrationFeeNeeded();
   // Always add the congratulations flow in correct order
   mapping.push(4, 5, 6); // Congrats, issuing card, credentials card
   if (needsRegFee) {
     mapping.push(7); // Add registration fee at the end
   }
   return mapping;
  };

 const ensureProfileAndReferralFromUrl = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const user = session.user as any;
    const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('phone_number')
        .eq('id', user.id)
        .maybeSingle();

    const phoneFromMetadata = user?.user_metadata?.phone_number as string | undefined;
    const phoneToSave = phoneFromMetadata ?? existingProfile?.phone_number ?? null;
    
    // Get referral code from cookie (processed by middleware)
    const getCookieValue = (name: string): string | null => {
      if (typeof document === 'undefined') return null;
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
      return null;
    };
    
    const referralFromCookie = getCookieValue('ref');
    const schemeIdFromUrl = (searchParams?.get("scheme") as string) || null;
    // Enhanced fullName validation to prevent null values
    let fullName: string;
    const metadataFullName = user.user_metadata?.full_name;
    const metadataName = user.user_metadata?.name;
    const emailPrefix = user.email ? String(user.email).split("@")[0] : null;
    
    if (metadataFullName && typeof metadataFullName === 'string' && metadataFullName.trim()) {
      fullName = metadataFullName.trim();
    } else if (metadataName && typeof metadataName === 'string' && metadataName.trim()) {
      fullName = metadataName.trim();
    } else if (emailPrefix && emailPrefix.trim()) {
      fullName = emailPrefix.trim();
    } else {
      fullName = "User"; // Fallback
    }
    
    // Ensure fullName is never empty or null
    if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
      console.error('Invalid fullName derived in profile setup:', { metadataFullName, metadataName, emailPrefix });
      fullName = "User"; // Force fallback
    }
    
    console.log('Profile setup fullName:', fullName);

    try {
      await ensureProfile({ fullName: fullName.trim(), phone: phoneToSave, referralCode: referralFromCookie, schemeId: schemeIdFromUrl }, supabase);
    } catch (e) {
      console.warn("ensureProfile (bootstrap) failed:", e);
    }

    if (referralFromCookie) {
      try {
        await attachUserReferralByCode({ userId: user.id, referralCode: referralFromCookie }, supabase);
      } catch (e) {
        console.warn("attachUserReferralByCode (bootstrap) failed:", e);
      }
    }
 };

 // This effect runs once on mount to determine the user's required setup steps.
 useEffect(() => {
  let cancelled = false;
  const initialize = async () => {
   try {
    setIsInitializing(true);
    setLoadingMessage("Checking profile status...");
    
    // **MODIFIED: Don't immediately redirect completed profiles**
    // We need to allow the congratulations flow to complete for users who just finished profile setup
    try {
      const response = await fetch('/api/profile/check-completion', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store'
      });

      if (response.ok) {
        const result = await response.json();
        
        // Only redirect if the profile is complete AND there are no missing steps in localStorage
        // This ensures new users who just completed profile form can see the congratulations flow
        const missingStepsInStorage = profileSetupStorage.getMissingSteps();
        
        if (result.success && result.data?.isComplete && missingStepsInStorage.length === 0) {
          // Profile is complete and no localStorage steps - this is a returning user
          setLoadingMessage("Profile complete! Redirecting...");
          try {
            profileSetupStorage.completeSetup();
            console.log('✅ Profile is complete in database - cleaned up localStorage');
          } catch (error) {
            console.warn('Failed to clear profile setup flags:', error);
          }
          setTimeout(() => {
            router.push('/dashboard');
          }, 100);
          return;
        } else if (result.success && result.data && !result.data.isComplete) {
          // Update localStorage to match database state
          profileSetupStorage.setMissingSteps(result.data.missingSteps as any[]);
          console.log('📝 Updated localStorage with database missing steps:', result.data.missingSteps);
        }
      }
    } catch (apiError) {
      console.warn('Profile completion API check failed, continuing with local check:', apiError);
    }
    
    setLoadingMessage("Initializing profile setup...");
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user && !ensuredRef.current) {
     ensuredRef.current = true;
     setLoadingMessage("Setting up profile...");
     await ensureProfileAndReferralFromUrl();
    }

         setLoadingMessage("Checking profile completeness...");
         const profile = await fetchProfile();
     if (cancelled) return;

     setLoadingMessage("Determining required steps...");
     const mapping = await computeStepMappingFromProfile(profile);
     
     if (mapping.length === 0) {
        // If profile is complete, clear the profile setup flags and redirect immediately.
        setLoadingMessage("Profile complete! Redirecting...");
        try {
          profileSetupStorage.completeSetup();
        } catch (error) {
          console.warn('Failed to clear profile setup flags:', error);
        }
        // Use push instead of replace for better navigation
        setTimeout(() => {
          router.push('/dashboard');
        }, 100);
    } else {
                           // Check if we need to initialize missing steps in localStorage
          const missingSteps = profileSetupStorage.getMissingSteps();
          if (missingSteps.length === 0) {
            // Initialize missing steps based on profile data
            const stepsToAdd: ('location' | 'address' | 'profile' | 'registration_fee')[] = [];
            if (!profile?.country || !profile?.state || !profile?.district) {
              stepsToAdd.push('location');
            }
            if (!profile?.street_address) {
              stepsToAdd.push('address');
            }
            if (!profile?.initial_scheme_id) {
              stepsToAdd.push('profile');
            }
            
            // Check if registration fee is needed
            const needsRegFee = await checkRegistrationFeeNeeded();
            if (needsRegFee) {
              stepsToAdd.push('registration_fee');
            }
            
            if (stepsToAdd.length > 0) {
              profileSetupStorage.setMissingSteps(stepsToAdd);
            }
            // If no steps to add, it means all steps are complete
          }
        
        // Set the steps to begin the setup flow.
        setStepMapping(mapping);
        setStep(0);
        setIsInitializing(false);
        setLoadingMessage("");
    }
   } catch (err) {
    console.warn("bootstrap failed, using DEFAULT_MAPPING", err);
    if (!cancelled) {
     setStepMapping(DEFAULT_MAPPING);
     setStep(0);
     setIsInitializing(false);
     setLoadingMessage("");
    }
   }
  };
  
  initialize();

  return () => {
   cancelled = true;
  };
 }, []);

 // Check for payment success callback
 useEffect(() => {
   const checkPaymentCallback = async () => {
     const paymentStatus = searchParams?.get('payment');
     
     if (paymentStatus === 'success') {
       try {
         // Get user data for receipt
         const { data: { user } } = await supabase.auth.getUser();
         if (user) {
           // Extract user information
           const userName = 
             (user.user_metadata?.full_name as string) ||
             (user.user_metadata?.name as string) ||
             (user.email?.split('@')[0] as string) ||
             'User';
           
           const userPhone = user.phone || user.user_metadata?.phone_number || '';
           
           // Get transaction ID from URL or generate one
           const pathParts = window.location.pathname.split('/');
           const transactionId = `REG${Date.now()}`;
           
           // Create receipt for registration payment
           const receipt: PaymentReceiptData = {
             transactionId: transactionId,
             amount: 99, // Default registration fee amount
             paymentType: 'registration',
             timestamp: new Date().toISOString(),
             userName: userName,
             userPhone: userPhone,
             paymentMethod: 'UPI',
             status: 'Success',
             description: 'Registration Fee Payment'
           };
           
           // Show payment success popup
           setPaymentReceipt(receipt);
           setShowPaymentSuccess(true);
           
           // Clean URL to remove payment parameters
           const newUrl = window.location.pathname;
           window.history.replaceState({}, document.title, newUrl);
         }
       } catch (error) {
         console.error('Error handling payment success:', error);
       }
     } else if (paymentStatus === 'failed') {
       // Handle payment failure
       console.log('Payment failed');
       
       // Clean URL
       const newUrl = window.location.pathname;
       window.history.replaceState({}, document.title, newUrl);
     }
   };
   
   checkPaymentCallback();
 }, [searchParams, supabase]);


 
const handleProfileServerComplete = async (payload?: ProfileFormPayload) => {
  try {
    setIsLoading(true);
    setLoadingMessage("Saving profile information...");
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user as any | undefined;
    if (!user) {
      setIsLoading(false);
      setLoadingMessage("");
      return;
    }

    // Determine the full name to be used.
    let fullName: string;
    if (payload?.fullName && typeof payload.fullName === 'string' && payload.fullName.trim()) {
      fullName = payload.fullName.trim();
    } else {
      const metadataFullName = user?.user_metadata?.full_name;
      const metadataName = user?.user_metadata?.name;
      const emailPrefix = user?.email ? String(user.email).split("@")[0] : null;
      
      if (metadataFullName && typeof metadataFullName === 'string' && metadataFullName.trim()) {
        fullName = metadataFullName.trim();
      } else if (metadataName && typeof metadataName === 'string' && metadataName.trim()) {
        fullName = metadataName.trim();
      } else if (emailPrefix && emailPrefix.trim()) {
        fullName = emailPrefix.trim();
      } else {
        fullName = "User"; // Fallback
      }
    }
    
    // Final validation to ensure fullName is never empty.
    if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
      console.error('Invalid fullName:', { payload: payload?.fullName, user: user?.user_metadata });
      fullName = "User"; // Force fallback
    }
    
    console.log("payload received:", payload);
    const referralCode = payload?.referralCode;

    // --- MODIFICATION START ---
    // Final Strategy: Separate the profile upsert from the scheme update to isolate the trigger.
    if (user?.id) {
        // Step 1: Ensure the basic profile exists with name and phone.
        setLoadingMessage("Syncing profile...");
        const { error: upsertError } = await supabase
            .from('user_profiles')
            .upsert({
                id: user.id,
                full_name: fullName,
                phone_number: payload?.phone
            }, { onConflict: 'id' });

        if (upsertError) {
            console.warn('⚠️ Step 1: Profile upsert failed.', upsertError);
            // Don't proceed if the basic upsert fails.
        } else {
            console.log('✅ Step 1: Profile upsert successful.');
            // Step 2: If the profile sync was successful, update the scheme ID.
            if (payload?.schemeId) {
                setLoadingMessage("Applying scheme...");
                const { error: schemeUpdateError } = await supabase
                    .from('user_profiles')
                    .update({ initial_scheme_id: payload.schemeId })
                    .eq('id', user.id);

                if (schemeUpdateError) {
                    console.warn('⚠️ Step 2: Scheme ID update failed. This points to a trigger issue.', schemeUpdateError);
                } else {
                    console.log('✅ Step 2: Scheme ID update successful.');
                }
            }
        }
    }
    // --- MODIFICATION END ---

    if (referralCode && user?.id) {
      try {
        setLoadingMessage("Processing referral code...");
        await attachUserReferralByCode({ userId: user.id, referralCode: String(referralCode) }, supabase);
      } catch (e) {
        console.warn("attachUserReferralByCode (form submission) failed:", e);
      }
    }

    setLoadingMessage("Updating profile status...");
    
    // **IMPORTANT FIX: After profile completion, we should NEVER redirect to dashboard immediately**
    // We need to continue through the congratulations flow: congrats -> issuing card -> credentials -> registration fee
    
    // Always mark the profile step as done and continue to congratulations flow
    profileSetupStorage.markStepDone('profile');
    
    // Check if we need registration fee
    const needsRegFee = await checkRegistrationFeeNeeded();
    
    // Always proceed to congratulations flow regardless of completion status
    // The flow should be: profile -> congrats -> issuing -> credentials -> (registration fee if needed)
    const profile = await fetchProfile();
    const mapping = await computeStepMappingFromProfile(profile);
    
    // Set the new mapping that includes the congratulations flow
    setStepMapping(mapping);
    
    // Move to the next step (congratulations)
    setLoadingMessage("Moving to congratulations...");
    setTimeout(() => {
      setStep((s) => s + 1); // Move to next step (congrats)
      setIsLoading(false);
      setLoadingMessage("");
    }, 500);

  } catch (e) {
    console.error("handleProfileServerComplete failed:", e);
  } finally {
    setIsLoading(false);
    setLoadingMessage("");
  }
};

   // Function to mark a step as completed
  const markStepCompleted = (stepNumber: number) => {
    const stepMap: { [key: number]: string } = {
      1: 'location',
      2: 'address', 
      3: 'profile',
      7: 'registration_fee'  // Updated to step 7
    };
    
    const stepKey = stepMap[stepNumber];
    if (stepKey) {
      profileSetupStorage.markStepDone(stepKey as any);
    }
    
    // For non-tracked steps (congrats, issuing card, credentials), just proceed
    // These are always shown and don't need localStorage tracking
  };

   // Function to handle step completion
  const handleStepComplete = async (stepNumber: number) => {
    try {
      // Don't show loading overlay for step transitions that don't require async operations
      const currentStepType = stepMapping?.[stepNumber];
      const needsAsyncOperation = currentStepType && (currentStepType <= 3 || currentStepType === 7); // Updated to step 7
      
      if (needsAsyncOperation) {
        setIsLoading(true);
        setLoadingMessage("Processing step completion...");
      }
      
      markStepCompleted(stepNumber);
      
      // Check if this was a profile setup step (1, 2, 3) or registration fee step (7)
      if (currentStepType && (currentStepType <= 3 || currentStepType === 7)) {
        // This was a profile setup step or registration fee step, check if all steps are done
        const missingSteps = profileSetupStorage.getMissingSteps();
        if (missingSteps.length === 0 && currentStepType === 7) {
          // Only redirect to dashboard after registration fee is complete
          setLoadingMessage("Setup complete! Redirecting...");
          profileSetupStorage.completeSetup();
          setTimeout(() => {
            router.push('/dashboard');
          }, 100);
          return;
        }
      }
      
      // For step transitions (like congrats -> issuing card -> credentials), just move to next step without loading
      if (!needsAsyncOperation) {
        setStep((s) => s + 1);
      } else {
        setLoadingMessage("Moving to next step...");
        // Add a small delay for better UX
        setTimeout(() => {
          setStep((s) => s + 1);
          setIsLoading(false);
          setLoadingMessage("");
        }, 500);
      }
    } catch (error) {
      console.error("Error completing step:", error);
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

 const getCurrentStepComponent = () => {
  // If stepMapping is null, it means we are still in the initial loading and checking phase.
  if (stepMapping === null || isInitializing) {
    return (
      <div className="relative z-10 flex items-center justify-center min-h-[200px]">
        <div className="p-6 text-white/80 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <div>{loadingMessage || "Initializing…"}</div>
          </div>
        </div>
      </div>
    );
  }
  
  // If mapping is an empty array, the profile is complete and we are redirecting.
  if (stepMapping.length === 0) {
    return (
      <div className="relative z-10 flex items-center justify-center min-h-[200px]">
        <div className="p-6 text-white/80 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <div>Profile complete. Redirecting…</div>
          </div>
        </div>
      </div>
    );
  }
  
  const safeLen = stepMapping.length;
  const clampedStep = Math.min(Math.max(0, step), safeLen - 1);
  const currentStepType = stepMapping[clampedStep];

  // Show loading overlay if any async operation is in progress
  if (isLoading) {
    return (
      <div className="relative z-10 flex items-center justify-center min-h-[200px]">
        <div className="p-6 text-white/80 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <div>{loadingMessage || "Processing..."}</div>
          </div>
        </div>
      </div>
    );
  }

  switch (currentStepType) {
   case 1: return <Csdselect setstep={handleStepComplete} step={clampedStep} isLoading={isLoading} />;
   case 2: return <LocationPage setstep={handleStepComplete} step={clampedStep} isLoading={isLoading} />;
   case 3: return <ProfileForm schemes={schemes} step={clampedStep} setstep={handleStepComplete} onServerComplete={handleProfileServerComplete} isLoading={isLoading} />;
   case 4: return <CongratsIndex onComplete={() => setStep((s) => s + 1)} isLoading={isLoading} />;
   case 5: return <IssuingCard onComplete={() => setStep((s) => s + 1)} isLoading={isLoading} />;
   case 6: return <CredentialsCard onComplete={() => setStep((s) => s + 1)} isLoading={isLoading} />;
   case 7: return <RegistrationFee onComplete={() => handleStepComplete(clampedStep)} isLoading={isLoading} />;
   default: return <div className="relative z-10 p-6 text-white/80">Loading setup…</div>;
  }
 };
 
 return (
   <div className="relative z-10">
     {getCurrentStepComponent()}
     {showPaymentSuccess && paymentReceipt && (
       <PaymentSuccessPopup
         receipt={paymentReceipt}
         onClose={() => {
           setShowPaymentSuccess(false);
           setPaymentReceipt(null);
           // Continue with the flow after closing the receipt
           handleStepComplete(step);
         }}
         customTitle="REGISTRATION COMPLETE"
         customSuccessMessage="Welcome to Akshaya Patra! Your registration has been completed successfully."
       />
     )}
   </div>
 );
}
