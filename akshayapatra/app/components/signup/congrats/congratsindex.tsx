"use client";

import React, { useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Inlined header component
const ProfileHeader: React.FC<{ title?: string }> = ({ title = "Profile" }) => {
  return (
    <header className="flex flex-col items-center">
      <div className="flex items-stretch gap-4 text-xl text-white font-normal whitespace-nowrap text-center ml-[50px] max-md:ml-2.5">
        <img
          src="https://api.builder.io/api/v1/image/assets/9e14ec760a13409cba0be5c570ba1763/2befcdced3af2ee5d59b87556ab80a0528b5a57c?placeholderIfAbsent=true"
          alt="Profile icon"
          className="aspect-[1] object-contain w-[18px] shrink-0 my-auto"
        />
        <h1 className="text-white text-ellipsis">{title}</h1>
      </div>
      <div className="self-stretch flex w-full flex-col bg-[#4D2309] mt-[7px] max-md:max-w-full max-md:pr-5">
        <div className="flex w-[1075px] shrink-0 max-w-full h-1 bg-[#EE6200]" role="separator" />
      </div>
    </header>
  );
};

// Inlined success illustration
const SuccessIllustration: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`flex justify-center ${className}`}>
    <img
      src="https://api.builder.io/api/v1/image/assets/9e14ec760a13409cba0be5c570ba1763/dbcba35c99684b1ca78e230d19d445d5aa2e18a8?placeholderIfAbsent=true"
      alt="Success illustration - profile setup complete"
      className="aspect-[1.38] object-contain w-[281px] max-w-full"
    />
  </div>
);

// Inlined done button
const DoneButton: React.FC<{ onClick?: () => void | Promise<void>; children?: React.ReactNode; disabled?: boolean; isLoading?: boolean }> = ({
  onClick,
  children = "Done",
  disabled = false,
  isLoading = false,
}) => {
  const handleClick = async () => {
    await onClick?.();
  };
  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className="justify-center items-center flex min-h-[59px] w-[358px] max-w-full gap-4 text-[19px] text-white font-medium whitespace-nowrap text-center leading-none px-4 py-[17px] rounded-[18px] bg-gradient-to-b from-orange-600 to-amber-800 hover:from-orange-600/90 hover:to-amber-800/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#EE6200] focus:ring-offset-2 focus:ring-offset-[#4D2309]"
      aria-label="Complete profile setup"
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          <span className="text-white self-stretch my-auto">Processing...</span>
        </>
      ) : (
        <span className="text-white self-stretch my-auto">{children}</span>
      )}
    </button>
  );
};

// Inlined composed component
const ProfileComplete: React.FC<{ title?: string; description?: string; onComplete?: () => void; disabled?: boolean; isLoading?: boolean }> = ({
  title = "You're all set!",
  description = "Your profile is ready to go. Let's grow your business together.",
  onComplete,
  disabled,
  isLoading = false,
}) => {
  return (
    <main className="flex flex-col overflow-hidden items-center py-[91px] min-h-screen">
      <ProfileHeader />
      <section className="flex flex-col items-center mt-36 max-md:mt-10">
        <SuccessIllustration />
        <div className="text-center mt-[17px]">
          <h2 className="text-white text-xl font-semibold leading-[1.2] tracking-[0.2px]">{title}</h2>
          <p className="text-white text-base font-medium leading-6 tracking-[0.2px] text-center w-[266px] mt-4">
            {description}
          </p>
        </div>
        <div className="mt-[98px] max-md:mt-10">
          <DoneButton onClick={onComplete} disabled={disabled} isLoading={isLoading} />
        </div>
      </section>
    </main>
  );
};

const CongratsIndex = ({ 
  isLoading: externalLoading = false, 
  onComplete 
}: { 
  isLoading?: boolean;
  onComplete?: () => void;
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const router = useRouter();

  const isLoading = isProcessing || externalLoading;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleProfileComplete = async () => {
    if (isLoading) return;
    setIsProcessing(true);

    // If onComplete callback is provided, use it (for continuing the flow)
    if (onComplete) {
      toast.success("Profile created successfully!", {
        description: "Let's continue with your card setup.",
        duration: 1500,
      });
      
      // Continue to next step instead of completing setup
      timeoutRef.current = window.setTimeout(() => {
        setIsProcessing(false);
        onComplete();
      }, 1200);
      return;
    }

    // Original behavior: Clean up and redirect to homepage
    try {
      const { profileSetupStorage, setupMilestoneStorage } = await import("@/utils/storage/profileStorage");
      profileSetupStorage?.completeSetup?.();
      setupMilestoneStorage?.clear?.();
    } catch (error) {
      console.warn("Failed to clean up profile setup data:", error);
    }

    toast.success("Profile setup completed successfully!", {
      description: "Welcome to your new profile dashboard.",
      duration: 1500,
    });

    // Redirect to HOME after a short delay (smooth UX)
    timeoutRef.current = window.setTimeout(() => {
      router.replace("/"); // go to homepage (use push("/") if you want it in history)
    }, 1200);
  };

  return (
    <div className="min-h-screen">
      <ProfileComplete
        title="You're all set!"
        description="Your profile is ready to go. Let's grow your business together."
        onComplete={handleProfileComplete}
        disabled={isLoading}
        isLoading={isLoading}
      />
    </div>
  );
};

export default CongratsIndex;
