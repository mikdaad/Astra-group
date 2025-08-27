"use client";

import React from "react";
import { cn } from "@/lib/utils";

type GlowProgressProps = {
  value: number;
  total: number;
  className?: string;
  height?: number; // px
  knobSize?: number; // px
};

export default function GlowProgress({
  value,
  total,
  className,
  height = 12,
  knobSize = 18,
}: GlowProgressProps) {
  const clampedTotal = Math.max(1, total);
  const percent = Math.max(0, Math.min(100, (value / clampedTotal) * 100));
  const knobLeft = `calc(${percent}% - ${knobSize / 2}px)`;

  return (
    <div className={cn("relative w-full", className)} style={{ height }}>
      {/* Track container with clipping and rounding */}
      <div className="absolute inset-0 rounded-full overflow-hidden shadow-inner">
        {/* Rail */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#1b0e08] via-[#111315] to-[#0d1114]" />
        {/* Fill */}
        <div
          className="absolute left-0 top-0 bottom-0 rounded-full bg-gradient-to-r from-orange-600 to-amber-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      {/* Extra glow field behind knob */}
      <div
        className="pointer-events-none absolute top-1/2 -translate-y-1/2 -z-[1]"
        style={{
          left: knobLeft,
          width: knobSize * 4,
          height: knobSize * 2.6,
          transform: `translate(-${knobSize / 2}px, -50%)`,
          background:
            "radial-gradient(closest-side, rgba(170, 32, 32, 0.55), rgba(234,88,12,0.45), rgba(234,88,12,0.15), transparent 70%)",
          filter: "blur(6px)",
        }}
      />
      {/* Knob */}
      <div
        className="absolute top-1/2 -translate-y-1/2 rounded-full bg-orange-600"
        style={{
          width: knobSize,
          height: knobSize,
          left: knobLeft,
          boxShadow:
            "0 0 7px 3px rgba(255,255,255,0.45), 0 0 8px 6px rgba(234,88,12,0.85), 0 0 80px 26px rgba(234,88,12,0.35)",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      />
    </div>
  );
}


