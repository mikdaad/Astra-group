"use client";

import React, { useMemo } from "react";
import DashboardCard from "../components/dashboard/DashboardCard";
import GlowProgress from "../components/general/GlowProgress";

type MonthPoint = { month: string; value: number };

type RankCard = {
  id: string;
  title: string;
  minAmount: number; // eligibility threshold
  currentAmount: number; // user's progress
  image: string;
};

function LineChart({ dataA, dataB }: { dataA: MonthPoint[]; dataB: MonthPoint[] }) {
  const max = useMemo(
    () => Math.max(...[...dataA, ...dataB].map((d) => d.value), 1),
    [dataA, dataB]
  );
  return (
    <div className="h-40 relative">
      <svg viewBox="0 0 600 160" className="w-full h-full">
        {/* gradient background */}
        <defs>
          <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#F97316" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="g2" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0" />
          </linearGradient>
        </defs>
        {([dataA, dataB] as MonthPoint[][]).map((series, idx) => {
          const points = series
            .map((d, i) => {
              const x = (i / (series.length - 1)) * 600;
              const y = 160 - (d.value / max) * 140 - 10;
              return `${x},${y}`;
            })
            .join(" ");
          const color = idx === 0 ? "#fb923c" : "#f59e0b";
          const fill = idx === 0 ? "url(#g1)" : "url(#g2)";
          // area path for subtle fill
          const areaPath = `M0,160 L ${points} L600,160 Z`;
          const linePath = `M ${points}`;
          return (
            <g key={idx}>
              <path d={areaPath} fill={fill} />
              <path d={linePath} fill="none" stroke={color} strokeWidth={2} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function EligibilityOverlay() {
  return (
    <div className="absolute inset-0 grid place-items-center bg-black/60">
      <div className="text-white font-semibold text-lg">😔 Not Eligible Yet!</div>
    </div>
  );
}

export default function AchieversPage() {
  const a: MonthPoint[] = [
    { month: "Jan", value: 5 },
    { month: "Feb", value: 8 },
    { month: "Mar", value: 6 },
    { month: "Apr", value: 10 },
    { month: "May", value: 12 },
    { month: "Jun", value: 9 },
    { month: "Jul", value: 14 },
    { month: "Aug", value: 16 },
    { month: "Sep", value: 13 },
    { month: "Oct", value: 12 },
    { month: "Nov", value: 15 },
  ];
  const b: MonthPoint[] = a.map((p, i) => ({ ...p, value: Math.max(0, p.value - (i % 3)) }));

  const ranks: RankCard[] = [
    {
      id: "star",
      title: "STAR PROMOTER",
      minAmount: 2500,
      currentAmount: 2300,
      image: "/images/vehicles/carwinner.jpg",
    },
    {
      id: "silver",
      title: "SILVER PROMOTER",
      minAmount: 2500,
      currentAmount: 0,
      image: "/images/vehicles/car2.png",
    },
    {
      id: "gold",
      title: "GOLD PROMOTER",
      minAmount: 5000,
      currentAmount: 0,
      image: "/images/vehicles/car3.png",
    },
    {
      id: "ruby",
      title: "RUBY PROMOTER",
      minAmount: 10000,
      currentAmount: 0,
      image: "/images/vehicles/bike2.png",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-white text-xl font-semibold">Achiever&apos;s</div>

      {/* Top chart */}
      <DashboardCard className="bg-gradient-to-b from-[#2a1007]/90 to-[#170903]/90 border border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 items-center">
          <div className="md:col-span-1 text-white space-y-2">
            <div className="text-sm">Direct Commission</div>
            <div className="text-2xl font-semibold">₹2,300</div>
            <div className="text-xs text-white/70">Total Referral Done</div>
            <div className="flex gap-2 text-[11px] mt-1">
              <span className="px-2 py-0.5 rounded-full bg-green-600/80">23</span>
              <span className="px-2 py-0.5 rounded-full bg-rose-600/80">25</span>
            </div>
          </div>
          <div className="md:col-span-3">
            <LineChart dataA={a} dataB={b} />
          </div>
        </div>
      </DashboardCard>

      {/* Ranks grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ranks.map((r) => {
          const eligible = r.currentAmount >= r.minAmount;
          return (
            <DashboardCard
              key={r.id}
              className={
                eligible
                  ? "bg-gradient-to-b from-orange-700/70 to-amber-700/60 border border-white/10"
                  : "bg-black/70 border border-white/10"
              }
              padding="lg"
              animate={false}
            >
              <div className="relative">
                <div className="text-white/80 text-[11px] mb-2">{r.title}</div>
                <div className="rounded-xl overflow-hidden">
                  <img src={r.image} alt={r.title} className="w-full h-40 object-cover" />
                </div>
                {!eligible && <EligibilityOverlay />}
                <div className="mt-3 flex items-center gap-3 text-white/80">
                  <div className="text-sm">₹{r.currentAmount}</div>
                  <div className="flex-1">
                    <GlowProgress value={r.currentAmount} total={r.minAmount} />
                  </div>
                  <div className="text-sm">₹{r.minAmount}</div>
                </div>
              </div>
            </DashboardCard>
          );
        })}
      </div>
    </div>
  );
}
