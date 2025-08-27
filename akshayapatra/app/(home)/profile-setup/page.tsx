"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ensureProfile } from "@/app/lib/rpc";
import { profileSetupStorage } from "@/utils/storage/profileStorage";

export default function ProfileSetupClient() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const completeProfileSetup = async () => {
      try {
        console.log('📍 Simple profile setup: completing setup and redirecting...');
        
        // Get current user session
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        
        if (!user) {
          // No user session, redirect to login
          router.push('/login');
          return;
        }

        // Ensure basic profile exists with simple defaults
        const fullName = user?.user_metadata?.full_name || 
                        user?.user_metadata?.name || 
                        user?.email?.split('@')[0] || 
                        'User';
        
        const phone = user?.user_metadata?.phone_number || user?.phone || null;
        
        try {
          await ensureProfile({ 
            fullName: fullName.trim(), 
            phone: phone 
          }, supabase);
          console.log('✅ Basic profile setup completed');
        } catch (error) {
          console.warn('Profile setup warning:', error);
          // Continue even if profile setup has issues
        }
        
        // Clear any profile setup state
        try {
          profileSetupStorage.completeSetup();
          console.log('✅ Profile setup state cleared');
        } catch (error) {
          console.warn('Failed to clear profile setup state:', error);
        }
        
        // Redirect to homepage
        console.log('🚀 Redirecting to homepage...');
        router.push('/');
        
      } catch (error) {
        console.error('Profile setup error:', error);
        // On error, still redirect to homepage
        router.push('/');
      }
    };
    
    completeProfileSetup();
  }, [router, supabase]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-orange-800 to-red-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center max-w-md w-full">
        <div className="mb-6">
          <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="animate-spin w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full"></div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Welcome to Golden Diamond Investment
          </h2>
          <p className="text-white/80">
            Setting up your investment profile...
          </p>
        </div>
      </div>
    </div>
  );
}
