"use client";

import React from "react";
import { ChevronRight } from "lucide-react";
import DashboardCard from "../../components/dashboard/DashboardCard";

type CommissionEntry = {
  id: string;
  name: string;
  avatar: string;
  amount: number;
  date: string;
  time: string;
};

const entries: CommissionEntry[] = Array.from({ length: 12 }).map((_, i) => ({
  id: String(i + 1),
  name: i % 3 === 0 ? "James Paul" : i % 3 === 1 ? "Austin Brown" : "Matthew Modine",
  avatar:
    i % 3 === 0
      ? "/images/vehicles/car1.png"
      : i % 3 === 1
      ? "/images/vehicles/bike1.png"
      : "/images/vehicles/car2.png",
  amount: 100,
  date: "16 Sep 2023",
  time: "11:21 AM",
}));

export default function AllCommissionsPage() {
  return (
    <div className="space-y-6">
      <div className="text-white text-xl font-semibold">Commissions</div>
      <DashboardCard className="bg-black/60 border border-white/10" padding="sm" animate={false}>
        <div className="space-y-3">
          {entries.map((e) => (
            <div
              key={e.id}
              className="flex items-center justify-between rounded-xl bg-[linear-gradient(to_right,rgba(255,255,255,0.04),rgba(0,0,0,0.2))] border border-white/10 px-3 py-3"
            >
              <div className="flex items-center gap-3">
                <img src={e.avatar} alt={e.name} className="h-10 w-10 rounded-full object-cover" />
                <div>
                  <div className="text-white text-sm">{e.name}</div>
                  <div className="text-[11px] text-white/70 flex items-center gap-2">
                    <span>16 Sep 2023</span>
                    <span>11:21 AM</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-white text-sm">₹ {e.amount.toFixed(2)}</div>
                <ChevronRight className="w-4 h-4 text-white/50" />
              </div>
            </div>
          ))}
        </div>
      </DashboardCard>
    </div>
  );
}














