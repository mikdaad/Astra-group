"use client";

import React from "react";
import Image from "next/image";

type IssuingCardProps = {
  onComplete: () => void;
  backgroundSrc?: string;
  title?: string;
  subtitle?: string;
  durationMs?: number; // default 7000ms
  isLoading?: boolean;
};

export default function IssuingCard({
  onComplete,
  backgroundSrc = "/images/pay/cardimage.jpg",
  title = "Verifying your card",
  subtitle = "Please wait while we issue your virtual card",
  durationMs = 7000,
  isLoading = false,
}: IssuingCardProps) {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const intervalMs = 70;
    const steps = Math.max(1, Math.round(durationMs / intervalMs));
    const increment = 100 / steps;

    const intervalId = setInterval(() => {
      setProgress((p) => {
        const next = p + increment;
        if (next >= 100) {
          clearInterval(intervalId);
          return 100;
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(intervalId);
  }, [durationMs]);

  React.useEffect(() => {
    if (progress >= 100) {
      const t = setTimeout(() => onComplete(), 250);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [progress, onComplete]);

  const roundedProgress = Math.min(100, Math.round(progress));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <Image
        src={backgroundSrc}
        alt="Issuing card background"
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />

      {/* Orange gradient rising from bottom to top */}
      <div
        className="absolute left-0 right-0 bottom-0 pointer-events-none"
        style={{
          height: `${roundedProgress}%`,
          background: "linear-gradient(0deg, rgba(194,65,12,0.98) 0%, rgba(234,88,12,0.96) 40%, rgba(249,115,22,0.92) 100%)",
        }}
        aria-hidden
      >
        <div className="flex h-full items-center justify-center">
          <div className="text-center text-white">
            <div className="text-3xl md:text-4xl font-extrabold tracking-tight">{roundedProgress}%</div>
            <div className="mt-2 text-sm md:text-base opacity-90">{title}</div>
            <div className="mt-1 text-xs md:text-sm opacity-80">{subtitle}</div>
          </div>
        </div>
      </div>
    </div>
  );
}


