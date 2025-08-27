"use client";

import React from "react";

type RegistrationFeeProps = {
  amountRs?: number;
  onComplete?: () => void;
  isLoading?: boolean;
};

export default function RegistrationFee({ amountRs = 99, onComplete, isLoading: externalLoading = false }: RegistrationFeeProps) {
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const isLoading = isProcessing || externalLoading;

  const handlePay = async () => {
    if (isLoading) return;
    setIsProcessing(true);
    setError(null);
    try {
      const res = await fetch("/api/regfee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountRs ,schemeId:'26540160-e140-45a2-bcb7-042e41b00bfc'}),
      });
      const data = await res.json();
      if (!res.ok || !data?.redirectUrl) {
        throw new Error(data?.error || "Failed to initiate payment");
      }
      // Redirect to payment page
      window.location.href = data.redirectUrl as string;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Something went wrong";
      setError(message);
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4">
      <div className="w-full max-w-4xl rounded-3xl overflow-hidden shadow-xl" style={{
        background: "linear-gradient(180deg, rgba(255,140,66,0.9) 0%, rgba(238,98,0,0.9) 60%, rgba(77,35,9,1) 100%)"
      }}>
        <div className="py-10 md:py-12 px-6 md:px-10">
          <h2 className="text-center text-white text-2xl md:text-3xl font-semibold">Welcome to Golden Diamond Investment</h2>

          <div className="mx-auto mt-10 md:mt-12 w-full max-w-2xl rounded-2xl border border-white/10 bg-black/60 backdrop-blur p-6 md:p-8">
            <ul className="space-y-4 text-sm text-white/90">
              {[
                "Lorem ipsum",
                "Lifetime validity",
                "Monthly updates",
                "Integration with key platforms",
                "Lorem ipsum iste ricas",
                "Lorem ipsum iste ricas",
                "Lorem ipsum iste ricas",
                "Lorem ipsum iste ricas",
                "Lorem ipsum iste ricas",
              ].map((text, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-orange-600 text-white text-xs">✓</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10 md:mt-12 flex flex-col items-center">
            <button
              onClick={handlePay}
              disabled={isLoading}
              className="w-[280px] md:w-[360px] rounded-2xl bg-gradient-to-b from-orange-600 to-amber-800 text-white font-medium text-lg py-4 shadow-lg hover:from-orange-600/90 hover:to-amber-800/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Redirecting...</span>
                </>
              ) : (
                <span>Get Started for ₹{amountRs}</span>
              )}
            </button>
            <div className="mt-3 text-white/80 text-xs">🔒 100% Secure Payment</div>
            {error && <div className="mt-3 text-red-200 text-sm">{error}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}


