"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { Share2, Download, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface UserCredentials {
  fullName: string;
  userId: string;
  referralId: string;
  email: string;
  username: string;
  password: string;
  aadharNo: string;
  panNo: string;
}

interface CredentialsCardProps {
  onComplete: () => void;
  isLoading?: boolean;
}

export default function CredentialsCard({ onComplete, isLoading = false }: CredentialsCardProps) {
  const [credentials, setCredentials] = useState<UserCredentials | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [canProceed, setCanProceed] = useState(false); // Add minimum display time
  const [timeLeft, setTimeLeft] = useState(1); // Countdown timer
  const supabase = createClient();

  useEffect(() => {
    fetchUserCredentials();
    
    // Countdown timer
    const countdownInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setCanProceed(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(countdownInterval);
  }, []);

  const fetchUserCredentials = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const user = session.user;
      
      // Fetch user profile data
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("id, full_name, phone_number, referral_code")
        .eq("id", user.id)
        .single();

      if (profile) {
        // Generate user credentials based on available data
        const userCredentials: UserCredentials = {
          fullName: profile.full_name || "User",
          userId: profile.id.slice(0, 8).toUpperCase(),
          referralId: profile.referral_code || "REF001",
          email: user.email || "user@example.com",
          username: `@${(profile.full_name || "user").toLowerCase().replace(/\s+/g, "")}`,
          password: "••••••••", // Masked for security
          aadharNo: profile.phone_number ? `XXXX XXXX ${profile.phone_number.slice(-4)}` : "XXXX XXXX 0000",
          panNo: `XX${profile.id.slice(0, 6).toUpperCase()}X`
        };
        
        setCredentials(userCredentials);
      }
    } catch (error) {
      console.error("Error fetching credentials:", error);
      toast.error("Failed to load credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!credentials) return;
    
    setIsSharing(true);
    try {
      if (navigator.share) {
        await navigator.share({
          title: "My Credentials",
          text: `Name: ${credentials.fullName}\nUser ID: ${credentials.userId}\nReferral ID: ${credentials.referralId}`,
        });
      } else {
        // Fallback to clipboard
        const text = `Name: ${credentials.fullName}\nUser ID: ${credentials.userId}\nReferral ID: ${credentials.referralId}\nEmail: ${credentials.email}`;
        await navigator.clipboard.writeText(text);
        toast.success("Credentials copied to clipboard!");
      }
    } catch (error) {
      console.error("Share failed:", error);
      toast.error("Failed to share credentials");
    } finally {
      setIsSharing(false);
    }
  };

  const handleDownload = () => {
    if (!credentials) return;
    
    const content = `
CREDENTIALS
${credentials.fullName}
USER ID: ${credentials.userId}

Referral ID: ${credentials.referralId}
Email: ${credentials.email}  
User name: ${credentials.username}
Password: ${credentials.password}
Aadhar no.: ${credentials.aadharNo}
Pan no.: ${credentials.panNo}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'credentials.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Credentials downloaded!");
  };

  if (loading || !credentials) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-amber-900 via-orange-800 to-red-900 flex items-center justify-center p-4">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <div>Loading credentials...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-amber-900 via-orange-800 to-red-900 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDYwIDAgTCAwIDAgMCA2MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
      </div>

      {/* Scrollable content */}
      <div className="relative z-10 h-full overflow-y-auto">
        <div className="flex flex-col items-center justify-start min-h-full p-4 py-8">
          {/* Container that ensures proper spacing on all screen sizes */}
          <div className="flex flex-col w-full max-w-md mx-auto space-y-6">
            
            {/* Back Button */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => window.history.back()}
              className="self-start text-white/80 hover:text-white transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.button>

            {/* Credentials Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative w-full"
            >
              {/* White Decorative Frame with SVG */}
              <div className="relative bg-white rounded-lg overflow-hidden shadow-2xl">
                {/* Top SVG Border */}
                <div className="absolute top-0 left-0 right-0 z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="60" viewBox="0 0 599 60" fill="none" preserveAspectRatio="none">
                    <path d="M561.876 60L548.429 48.372L534.987 60H523.546L510.104 48.372L496.657 60H485.22L471.773 48.372L458.331 60H446.89L433.448 48.372L420.001 60H408.564L395.118 48.372L381.675 60H370.234L356.792 48.372L343.345 60H331.909L318.462 48.372L305.019 60H293.578L280.136 48.372L265.885 60H254.449L241.002 48.372L227.56 60H216.123L202.676 48.372L189.229 60H177.793L164.346 48.372L150.904 60H139.467L126.02 48.372L112.574 60H101.137L87.6902 48.372L74.2479 60H62.8069L49.3646 48.372L35.1181 60H23.6771L12 48L0 57.295V43.158C0.402064 43.158 0.603096 43.158 0.804129 43.158C28.493 43.158 30.4503 31.93 30.4503 18.095C30.4503 4.262 28.493 -7.967 0.804129 -7.967C0.402064 -7.967 0.201032 -7.967 0 -7.967V0L10.2348 8.387L21.8723 0H36.9229L48.5604 8.387L60.399 0L75.4496 0L87.0916 10.126L98.7291 0H113.78L125.417 10.126L137.256 0H152.306L163.948 10.126L175.601 19.129H190.651L202.289 29.255L214.127 19.129H229.178L240.82 29.255L252.658 25.505H267.694L279.332 35.631L290.97 25.505H306.02L317.658 35.631L329.501 25.505H344.551L356.189 35.631L367.826 25.505H382.877L394.515 35.631L417.995 24.255H433.046L444.683 34.381L456.522 24.255L471.572 8.315V12.251L483.214 13.815H498.261L509.903 23.941L521.741 9.564H536.792L548.429 19.69L560.067 9.564H575.117L586.96 19.69L598.598 11.69H599V60H561.876Z" fill="white"/>
                  </svg>
                </div>

                {/* Bottom SVG Border */}
                <div className="absolute bottom-0 left-0 right-0 z-10 transform rotate-180">
                  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="60" viewBox="0 0 599 60" fill="none" preserveAspectRatio="none">
                    <path d="M561.876 60L548.429 48.372L534.987 60H523.546L510.104 48.372L496.657 60H485.22L471.773 48.372L458.331 60H446.89L433.448 48.372L420.001 60H408.564L395.118 48.372L381.675 60H370.234L356.792 48.372L343.345 60H331.909L318.462 48.372L305.019 60H293.578L280.136 48.372L265.885 60H254.449L241.002 48.372L227.56 60H216.123L202.676 48.372L189.229 60H177.793L164.346 48.372L150.904 60H139.467L126.02 48.372L112.574 60H101.137L87.6902 48.372L74.2479 60H62.8069L49.3646 48.372L35.1181 60H23.6771L12 48L0 57.295V43.158C0.402064 43.158 0.603096 43.158 0.804129 43.158C28.493 43.158 30.4503 31.93 30.4503 18.095C30.4503 4.262 28.493 -7.967 0.804129 -7.967C0.402064 -7.967 0.201032 -7.967 0 -7.967V0L10.2348 8.387L21.8723 0H36.9229L48.5604 8.387L60.399 0L75.4496 0L87.0916 10.126L98.7291 0H113.78L125.417 10.126L137.256 0H152.306L163.948 10.126L175.601 19.129H190.651L202.289 29.255L214.127 19.129H229.178L240.82 29.255L252.658 25.505H267.694L279.332 35.631L290.97 25.505H306.02L317.658 35.631L329.501 25.505H344.551L356.189 35.631L367.826 25.505H382.877L394.515 35.631L417.995 24.255H433.046L444.683 34.381L456.522 24.255L471.572 8.315V12.251L483.214 13.815H498.261L509.903 23.941L521.741 9.564H536.792L548.429 19.69L560.067 9.564H575.117L586.96 19.69L598.598 11.69H599V60H561.876Z" fill="white"/>
                  </svg>
                </div>

                {/* Card Content */}
                <div className="relative z-20 pt-16 pb-16 px-8">
                  {/* Header */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="text-center mb-6"
                  >
                    <div className="bg-red-600 text-white py-2 px-4 rounded-t-lg">
                      <h1 className="text-lg font-bold">CREDENTIALS</h1>
                    </div>
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-b-lg">
                      <h2 className="text-xl font-bold">{credentials.fullName}</h2>
                      <p className="text-sm opacity-90">USER ID</p>
                      <p className="text-lg font-semibold">{credentials.userId}</p>
                    </div>
                  </motion.div>

                  {/* Credentials List */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                    className="space-y-3 mb-6"
                  >
                    <CredentialRow label="Referral ID" value={credentials.referralId} />
                    <CredentialRow label="Email" value={credentials.email} />
                    <CredentialRow label="User name" value={credentials.username} />
                    <CredentialRow 
                      label="Password" 
                      value={showPassword ? "password123" : credentials.password}
                      isPassword
                      showPassword={showPassword}
                      onTogglePassword={() => setShowPassword(!showPassword)}
                    />
                    <CredentialRow label="Aadhar no." value={credentials.aadharNo} />
                    <CredentialRow label="Pan no." value={credentials.panNo} />
                  </motion.div>

                  {/* Barcode */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                    className="flex justify-center mb-6"
                  >
                    <div className="bg-black px-6 py-2 rounded">
                      <svg width="120" height="30" viewBox="0 0 120 30">
                        {Array.from({ length: 20 }, (_, i) => (
                          <rect
                            key={i}
                            x={i * 6}
                            y={0}
                            width={Math.random() > 0.5 ? 2 : 4}
                            height={30}
                            fill="white"
                          />
                        ))}
                      </svg>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              className="flex flex-col gap-4 w-full"
            >
              {/* Share Button */}
              <button
                onClick={handleShare}
                disabled={isSharing}
                className="flex items-center justify-center gap-3 bg-transparent border-2 border-white/30 text-white py-3 px-6 rounded-lg hover:bg-white/10 transition-all duration-200 disabled:opacity-50 min-h-[52px]"
              >
                {isSharing ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Share2 size={20} />
                )}
                <span className="font-medium">Share</span>
              </button>

              {/* Next Button */}
              <button
                onClick={onComplete}
                disabled={isLoading || !canProceed}
                className="flex items-center justify-center gap-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-6 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[52px]"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span className="font-medium">Processing...</span>
                  </>
                ) : !canProceed ? (
                  <>
                    <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                    <span className="font-medium">Next ({timeLeft}s)</span>
                  </>
                ) : (
                  <span className="font-medium">Next</span>
                )}
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for credential rows
function CredentialRow({ 
  label, 
  value, 
  isPassword = false, 
  showPassword = false, 
  onTogglePassword 
}: { 
  label: string; 
  value: string; 
  isPassword?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
}) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-gray-600 text-sm font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-gray-800 text-sm font-semibold">{value}</span>
        {isPassword && onTogglePassword && (
          <button
            onClick={onTogglePassword}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
}