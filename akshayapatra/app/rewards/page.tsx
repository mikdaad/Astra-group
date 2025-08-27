"use client";

import React, { useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight, Users, Trophy } from "lucide-react";
import DashboardCard from "../components/dashboard/DashboardCard";
import GlowProgress from "../components/general/GlowProgress";

type MonthBar = { month: string; direct: number; indirect: number };

type ReferralUser = { name: string; avatar: string; date: string; by?: string };

type RewardItem = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  minDirect: number;
  minTeam: number;
  currentDirect: number;
  currentTeam: number;
};

function ProgressPill({ value, total }: { value: number; total: number }) {
  return (
    <div className="text-[11px] px-2 py-1 rounded-full bg-white/10">{value}/{total}</div>
  );
}

function ProgressBar({ value, total }: { value: number; total: number }) {
  const pct = Math.min(100, Math.round((value / total) * 100));
  return (
    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function BarChart({ data }: { data: MonthBar[] }) {
  const max = useMemo(
    () => Math.max(...data.flatMap((d) => [d.direct, d.indirect] as number[]), 1),
    [data]
  );
  return (
    <div>
      <div className="grid grid-cols-6 gap-2 h-32 items-end">
        {data.map((d) => (
          <div key={d.month} className="flex flex-col items-center gap-1">
            <div className="flex gap-1 items-end h-24 w-full justify-center">
              <div
                className="w-2 rounded-t bg-gradient-to-t from-orange-600 to-amber-400"
                style={{ height: `${(d.direct / max) * 100}%` }}
              />
              <div
                className="w-2 rounded-t bg-gradient-to-t from-orange-900 to-amber-700 opacity-80"
                style={{ height: `${(d.indirect / max) * 100}%` }}
              />
            </div>
            <div className="text-[11px] text-white/70">{d.month}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-4 text-xs text-white/80">
        <div className="flex items-center gap-1">
          <span className="inline-block w-3 h-2 rounded bg-gradient-to-r from-orange-600 to-amber-400" />
          Direct
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block w-3 h-2 rounded bg-gradient-to-r from-orange-900 to-amber-700" />
          In-Direct
        </div>
      </div>
    </div>
  );
}

export default function RewardsPage() {
  const months: MonthBar[] = [
    { month: "Jan", direct: 14, indirect: 8 },
    { month: "Feb", direct: 9, indirect: 6 },
    { month: "Mar", direct: 15, indirect: 4 },
    { month: "Apr", direct: 6, indirect: 2 },
    { month: "May", direct: 18, indirect: 10 },
    { month: "Jun", direct: 12, indirect: 11 },
  ];

  const refUsers: ReferralUser[] = [
    { name: "Austin Brown", avatar: "/images/vehicles/car1.png", date: "12th July 2025" },
    { name: "Ann Blair", avatar: "/images/vehicles/bike1.png", date: "12th July 2025", by: "Kishor Behera" },
  ];

  const rewardItems: RewardItem[] = [
    {
      id: "goldring",
      title: "Achieve Your Milestone",
      subtitle: "Unlock your reward by building your network",
      image: "/images/vehicles/carwinner.jpg",
      minDirect: 25,
      minTeam: 100,
      currentDirect: 30,
      currentTeam: 110,
    },
    {
      id: "smartphone",
      title: "Achieve Your Milestone",
      subtitle: "Unlock your reward by building your network",
      image: "/images/vehicles/mobile1.png",
      minDirect: 50,
      minTeam: 200,
      currentDirect: 40,
      currentTeam: 80,
    },
    {
      id: "laptop",
      title: "Achieve Your Milestone",
      subtitle: "Unlock your reward by building your network",
      image: "/images/vehicles/car3.png",
      minDirect: 25,
      minTeam: 400,
      currentDirect: 25,
      currentTeam: 380,
    },
    {
      id: "scooter",
      title: "Achieve Your Milestone",
      subtitle: "Unlock your reward by building your network",
      image: "/images/vehicles/bike2.png",
      minDirect: 25,
      minTeam: 800,
      currentDirect: 10,
      currentTeam: 120,
    },
  ];

  const scrollerRef = useRef<HTMLDivElement>(null);
  const scrollByCards = (dir: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.9;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <div className="space-y-6">
      <div className="text-white text-xl font-semibold">Rewards</div>

      {/* Top stats section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Bar chart card */}
        <DashboardCard className="bg-gradient-to-b from-[#2a1007]/90 to-[#170903]/90 border border-white/10">
          <div className="text-white">
            <div className="font-semibold">Bar chart</div>
            <div className="mt-2">
              <div className="text-sm text-white/80">Total Earned</div>
              <div className="text-3xl font-semibold">₹ 3,000.00</div>
            </div>
            <div className="mt-4">
              <BarChart data={months} />
            </div>
          </div>
        </DashboardCard>

        {/* Direct referral card */}
        <DashboardCard className="bg-gradient-to-b from-[#2a1007]/90 to-[#170903]/90 border border-white/10">
          <div className="flex items-center justify-between text-white">
            <div>
              <div className="text-sm">Direct Referral</div>
              <div className="text-white/80">23 Direct Referrals</div>
            </div>
            <ProgressPill value={20} total={25} />
          </div>
          <div className="mt-4 space-y-3">
            {refUsers.map((u) => (
              <div key={u.name} className="flex items-center justify-between bg-black/60 border border-white/10 rounded-xl px-3 py-2">
                <div className="flex items-center gap-3">
                  <img src={u.avatar} alt={u.name} className="h-9 w-9 rounded-full object-cover" />
                  <div>
                    <div className="text-sm">{u.name}</div>
                    <div className="text-[11px] text-white/70">Joined on {u.date}</div>
                  </div>
                </div>
                <Trophy className="w-4 h-4 text-amber-400" />
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-center gap-4 text-white/70">
            <button className="h-7 w-7 grid place-items-center rounded-full bg-white/10"><ChevronLeft className="w-4 h-4" /></button>
            <div className="text-xs">1 2 • • • • 20</div>
            <button className="h-7 w-7 grid place-items-center rounded-full bg-white/10"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </DashboardCard>

        {/* Team size card */}
        <DashboardCard className="bg-gradient-to-b from-[#2a1007]/90 to-[#170903]/90 border border-white/10">
          <div className="flex items-center justify-between text-white">
            <div>
              <div className="text-sm">Total Team Size</div>
              <div className="text-white/80">80 Team Members</div>
            </div>
            <ProgressPill value={80} total={100} />
          </div>
          <div className="mt-4 space-y-3">
            {refUsers.map((u) => (
              <div key={u.name} className="flex items-center justify-between bg-black/60 border border-white/10 rounded-xl px-3 py-2">
                <div className="flex items-center gap-3">
                  <img src={u.avatar} alt={u.name} className="h-9 w-9 rounded-full object-cover" />
                  <div>
                    <div className="text-sm">{u.name}</div>
                    <div className="text-[11px] text-white/70">Joined By Kishor Behera</div>
                  </div>
                </div>
                <Users className="w-4 h-4 text-amber-400" />
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-center gap-4 text-white/70">
            <button className="h-7 w-7 grid place-items-center rounded-full bg-white/10"><ChevronLeft className="w-4 h-4" /></button>
            <div className="text-xs">1 2 • • • • 20</div>
            <button className="h-7 w-7 grid place-items-center rounded-full bg-white/10"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </DashboardCard>
      </div>

      {/* Bottom swipable reward cards */}
      <div className="relative">
        <div className="flex items-center justify-between mb-3 text-white/90">
          <div className="text-sm">Milestones</div>
          <div className="flex gap-2">
            <button onClick={() => scrollByCards("left")} className="h-8 w-8 grid place-items-center rounded-full bg-white/10">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => scrollByCards("right")} className="h-8 w-8 grid place-items-center rounded-full bg-white/10">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div
          ref={scrollerRef}
          className="flex gap-5 overflow-x-auto scroll-smooth pb-2 pr-2 snap-x snap-mandatory"
        >
          {rewardItems.map((item) => {
            const unlocked = item.currentDirect >= item.minDirect && item.currentTeam >= item.minTeam;
            return (
              <div
                key={item.id}
                className="min-w-[320px] max-w-[320px] snap-start"
              >
             <DashboardCard
  className={`border border-white/10 ${
    unlocked
      ? 'bg-[linear-gradient(to_top,#090300,#351603,#6E2B00,#CA5002)]'
      : 'bg-black/60'
  }`}
>
                  <div className="rounded-xl overflow-hidden">
                    <div className="relative">
                      <img
                        src={item.image}
                        alt={item.title}
                        className={unlocked ? "w-full h-40 object-cover" : "w-full h-40 object-cover grayscale"}
                      />
                      <div className="absolute right-2 top-2 text-[10px] px-2 py-1 rounded-full bg-white/10 border border-white/10">
                        My item
                      </div>
                    </div>
                    <div className="p-3 space-y-2 text-white">
                      <div className="font-semibold text-[13px]">{item.title}</div>
                      <div className="text-[11px] text-white/70">{item.subtitle}</div>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center justify-between text-[12px]">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-white/70" />
                            Min 25 Direct Referral
                          </div>
                          <div className="text-white/80 text-xs">{item.currentDirect}/{item.minDirect}</div>
                        </div>
                        <div className={unlocked ? "object-cover" : " object-cover grayscale"}>
                        <GlowProgress value={item.currentDirect} total={item.minDirect} /></div>
                        <div className="flex items-center justify-between text-[12px]">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-white/70" />
                            Total team size
                          </div>
                          <div className="text-white/80 text-xs">{item.currentTeam}/{item.minTeam}</div>
                        </div>
                        <div className={unlocked ? "object-cover" : " object-cover grayscale"}>
                        <GlowProgress value={item.currentTeam} total={item.minTeam} />
                        </div>
                      </div>
                      <div className="pt-2 flex justify-end">
                        <button className="px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs hover:bg-white/15">Refer Now</button>
                      </div>
                    </div>
                  </div>
                </DashboardCard>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
