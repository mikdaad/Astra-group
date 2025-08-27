"use client";

import React from "react";
import Link from "next/link";
import { Calendar, ChevronDown, Upload, Plus } from "lucide-react";
import DashboardCard from "../components/dashboard/DashboardCard";

type CommissionEntry = {
  id: string;
  name: string;
  avatar: string;
  amount: number;
  date: string;
  time: string;
};

const entries: CommissionEntry[] = [
  { id: "1", name: "James Paul", avatar: "/images/vehicles/car1.png", amount: 100, date: "16 Sep 2023", time: "11:21 AM" },
  { id: "2", name: "Austin Brown", avatar: "/images/vehicles/bike1.png", amount: 100, date: "16 Sep 2023", time: "11:21 AM" },
  { id: "3", name: "Matthew Modine", avatar: "/images/vehicles/car2.png", amount: 100, date: "16 Sep 2023", time: "11:21 AM" },
  { id: "4", name: "Austin Brown", avatar: "/images/vehicles/mobile1.png", amount: 100, date: "16 Sep 2023", time: "11:21 AM" },
  { id: "5", name: "Austin Brown", avatar: "/images/vehicles/car3.png", amount: 100, date: "16 Sep 2023", time: "11:21 AM" },
  { id: "6", name: "James Paul", avatar: "/images/vehicles/car1.png", amount: 100, date: "16 Sep 2023", time: "11:21 AM" },
];

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"] as const;
const direct = [20, 12, 18, 25, 10, 14];
const indirect = [12, 6, 8, 14, 7, 9];

function BarChart() {
  const max = Math.max(...direct, ...indirect, 1);
  return (
    <div className="px-4 pb-4">
      <div className="grid grid-cols-6 gap-6 items-end h-48">
        {months.map((m, i) => (
          <div key={m} className="flex flex-col items-center gap-2">
            <div className="flex items-end gap-2 h-36">
              <div
                className="w-6 rounded-t bg-gradient-to-t from-orange-600 to-amber-400"
                style={{ height: `${(direct[i] / max) * 100}%` }}
              />
              <div
                className="w-6 rounded-t bg-gradient-to-t from-white/70 to-white"
                style={{ height: `${(indirect[i] / max) * 100}%` }}
              />
            </div>
            <div className="text-xs text-white/70">{m}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CommisionPage() {
  return (
    <div className="space-y-6">
      <div className="text-white text-xl font-semibold">Commissions</div>

      {/* Filters/Header */}
      <DashboardCard className="bg-gradient-to-b from-[#2a1007]/90 to-[#170903]/90 border border-white/10">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
          <div>
            <div className="text-white font-semibold">Team Management</div>
            <div className="text-white/70 text-xs">Keep tabs on your leads&apos; performance from every angle of Team management.</div>
            <div className="mt-3 flex gap-2">
              <button className="px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-sm text-white">Direct</button>
              <button className="px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-sm text-white/80">InDirect</button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-sm text-white">
              <Calendar className="w-4 h-4" /> December 2025 <ChevronDown className="w-4 h-4" />
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-sm text-white">
              <Upload className="w-4 h-4" /> Export
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-sm text-white">
              <Plus className="w-4 h-4" /> New Segment
            </button>
          </div>
        </div>
      </DashboardCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left - list */}
        <DashboardCard className="bg-black/60 border border-white/10" padding="sm" animate={false}>
          <div className="flex items-center justify-between px-2 py-2 text-white/80 text-sm">
            <div>Recent</div>
            <Link href="/commision/all" className="text-white/70 hover:text-white">View All</Link>
          </div>
          <div className="divide-y divide-white/10">
            {entries.map((e) => (
              <div key={e.id} className="flex items-center justify-between px-3 py-3">
                <div className="flex items-center gap-3">
                  <img src={e.avatar} alt={e.name} className="h-9 w-9 rounded-full object-cover" />
                  <div>
                    <div className="text-white text-sm">{e.name}</div>
                    <div className="text-[11px] text-white/70">{e.date} &nbsp; {e.time}</div>
                  </div>
                </div>
                <div className="text-white text-sm">₹ {e.amount.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </DashboardCard>

        {/* Right - chart */}
        <DashboardCard className="bg-gradient-to-b from-[#2a1007]/90 to-[#170903]/90 border border-white/10" animate={false}>
          <div className="text-white">
            <div className="text-2xl font-semibold">₹ 3,000.00</div>
            <div className="text-sm text-white/70">Total Earned</div>
          </div>
          <div className="mt-4">
            <BarChart />
          </div>
          <div className="mt-2 flex items-center gap-4 text-xs text-white/80">
            <div className="flex items-center gap-1">
              <span className="inline-block w-3 h-2 rounded bg-gradient-to-r from-orange-600 to-amber-400" /> Direct
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block w-3 h-2 rounded bg-white" /> Indirect
            </div>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
