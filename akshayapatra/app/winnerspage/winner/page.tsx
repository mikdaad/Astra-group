"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

type WinnerItem = {
  id: string;
  title: string;
  description: string;
  name: string;
  userId: string;
};

function classNames(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function TopTabs() {
  const items = [
    { label: "Recommend", href: "/winnerspage" },
    { label: "Winner", href: "/winnerspage/winner" },
    { label: "Review", href: "/winnerspage/review" },
    { label: "Events", href: "/winnerspage/events" },
    { label: "Video", href: "/winnerspage/video" },
  ];
  return (
    <div className="mx-auto max-w-7xl px-5">
      <div className="inline-flex rounded-2xl bg-black/20 border border-white/10 p-1">
        {items.map((t) => (
          <Link key={t.href} href={t.href} className={classNames("px-4 sm:px-5 py-2 text-sm rounded-xl transition", t.href === "/winnerspage/winner" ? "bg-white/10 text-white" : "text-white/70 hover:text-white hover:bg-white/5")}>{t.label}</Link>
        ))}
      </div>
    </div>
  );
}

const months = [
  { num: 1, label: "Jan", year: 2025 },
  { num: 2, label: "Feb", year: 2025 },
  { num: 3, label: "Mar", year: 2025 },
  { num: 4, label: "Apr", year: 2025 },
  { num: 5, label: "May", year: 2025 },
  { num: 6, label: "Jun", year: 2025 },
  { num: 7, label: "Jul", year: 2025 },
  { num: 8, label: "Aug", year: 2025 },
  { num: 9, label: "Sep", year: 2025 },
  { num: 10, label: "Oct", year: 2025 },
  { num: 11, label: "Nov", year: 2025 },
  { num: 12, label: "Dec", year: 2025 },
  { num: 13, label: "Dec", year: 2025 },
];

const winners: WinnerItem[] = Array.from({ length: 6 }).map((_, i) => ({
  id: `win-${i}`,
  title: "Hyundai Creta",
  description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
  name: "John Doe",
  userId: "AA0001",
}));

function WinnerRowCard({ item }: { item: WinnerItem }) {
  return (
    <div className="rounded-2xl p-5 bg-gradient-to-br from-[#6E2B00] to-[#CA5002] text-white/90">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold">{item.title}</p>
          <p className="text-xs text-white/80 max-w-xl mt-1">{item.description}</p>
          <div className="mt-4 grid grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-white/70 text-[11px]">Name</p>
              <p className="font-semibold">{item.name}</p>
            </div>
            <div>
              <p className="text-white/70 text-[11px]">User ID</p>
              <p className="font-semibold">{item.userId}</p>
            </div>
          </div>
        </div>
        <Link href="/winnerview" className="self-start inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-white/15 hover:bg-white/25">
          VIEW <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

export default function WinnerPage() {
  const [activeMonth, setActiveMonth] = React.useState(1);
  return (
    <main
      className="min-h-screen w-full text-white/90"
      style={{ backgroundImage: "linear-gradient(to top, #090300, #351603, #6E2B00, #CA5002)" }}
    >
      <div className="h-4" />
      <TopTabs />

      <div className="mx-auto max-w-7xl px-5">
        <h2 className="text-xl font-semibold mt-6">Draw Winner</h2>
        {/* Month selector */}
        <div className="mt-4 flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {months.map((m) => (
            <button
              key={m.num}
              onClick={() => setActiveMonth(m.num)}
              className={classNames(
                "shrink-0 w-20 rounded-2xl border px-0.5 py-2 text-center",
                m.num === activeMonth ? "border-white/30 bg-white/10" : "border-white/10 bg-white/5 hover:bg-white/10"
              )}
            >
              <div className="text-sm font-semibold">{m.num}<sup className="text-[10px]">{m.num === 1 ? "st" : m.num === 2 ? "nd" : m.num === 3 ? "rd" : "th"}</sup></div>
              <div className="text-xs text-white/80">{m.label}</div>
              <div className="text-[10px] text-white/60">{m.year}</div>
            </button>
          ))}
        </div>

        {/* Winner list */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {winners.map((w) => (
            <WinnerRowCard key={w.id} item={w} />
          ))}
        </div>
      </div>

      <div className="h-10" />
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </main>
  );
}
