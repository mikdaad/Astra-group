"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { clearUserSessionAndReferral } from "@/utils/storage/cookies";

export default function LogoutPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const onNo = () => {
    // Return to previous page or dashboard if history is empty
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  const onYes = async () => {
    try {
      setIsSubmitting(true);
      await fetch("/api/auth/logout", { method: "POST" });
      // Clear any client-side stored auth state
      try {
        clearUserSessionAndReferral();
        // Clear profile storage as well
        const { storageCleanup } = await import('@/utils/storage/profileStorage');
        storageCleanup.cleanupAuth();
      } catch (_) {}
    } catch (e) {
      // no-op; still navigate to login
    } finally {
      router.replace("/login");
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-5rem)] grid place-items-center">
      {/* Center dialog */}
      <div
        className="w-full max-w-2xl rounded-2xl text-white border border-white/15 shadow-2xl p-8 text-center"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.35) 100%)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        <h1 className="text-2xl font-semibold mb-3">Confirm Exit</h1>
        <p className="text-white/80 text-sm max-w-md mx-auto">
          Are you sure you want to exit this section and return to Astra?
        </p>

        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={onNo}
            disabled={isSubmitting}
            className="px-8 py-3 rounded-lg border border-white/30 text-white hover:bg-white/10 disabled:opacity-60"
          >
            No
          </button>
          <button
            onClick={onYes}
            disabled={isSubmitting}
            className="px-8 py-3 rounded-lg text-white disabled:opacity-60"
            style={{
              background:
                "linear-gradient(to right, rgba(255,140,66,1), rgba(212,96,10,1))",
            }}
          >
            {isSubmitting ? "Signing out..." : "Yes"}
          </button>
        </div>
      </div>
    </div>
  );
}



