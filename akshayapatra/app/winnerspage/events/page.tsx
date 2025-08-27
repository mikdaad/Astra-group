"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type EventItem = {
  id: string;
  title: string;
  place: string;
  mapUrl: string;
  date: string;
  time: string;
  status: "Ongoing" | "Upcoming";
};

function classNames(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function TopTabs() {
  const pathname = usePathname();
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
          <Link key={t.href} href={t.href} className={classNames("px-4 sm:px-5 py-2 text-sm rounded-xl transition", pathname === t.href ? "bg-white/10 text-white" : "text-white/70 hover:text-white hover:bg-white/5")}>{t.label}</Link>
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
  { num: 13, label: "13h", year: 2025 },
];

const sample: EventItem[] = Array.from({ length: 6 }).map((_, i) => ({
  id: `evt-${i + 1}`,
  title: "Convention Hall",
  place: "Mangaluru, Karnataka Lorem ipsum dolor sit amet, adipiscing elit.",
  mapUrl: "https://maps.app.goo.gl/51ugu7Vy",
  date: "26 Jan 2025",
  time: "10:00 AM – 01:00 PM",
  status: i === 0 ? "Ongoing" : "Upcoming",
}));

function EventCard({ e }: { e: EventItem }) {
  return (
    <Link href={`/winnerspage/events/${e.id}`} className="block rounded-2xl p-4 bg-gradient-to-b from-black/20 to-black/40 border border-white/10 hover:bg-white/5">
      <div className="-mt-6 mb-2 inline-block px-4 py-1 rounded-full bg-white/10 text-[12px]">{e.status}</div>
      <p className="font-semibold">{e.title}</p>
      <p className="text-white/80 text-xs mt-2">{e.place}</p>
      <a href={e.mapUrl} className="block text-xs text-sky-300 underline mt-1" target="_blank">{e.mapUrl}</a>
      <div className="flex items-center justify-between text-xs text-white/70 mt-3">
        <span>{e.date}</span>
        <span className="opacity-40">|</span>
        <span>{e.time}</span>
      </div>
    </Link>
  );
}

export default function EventsPage() {
  const [activeMonth, setActiveMonth] = React.useState(1);
  return (
    <main
      className="min-h-screen w-full text-white/90"
      style={{ backgroundImage: "linear-gradient(to top, #090300, #351603, #6E2B00, #CA5002)" }}
    >
      <div className="h-4" />
      <TopTabs />

      {/* Month selector */}
      <div className="mx-auto max-w-7xl px-5 mt-6">
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
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
      </div>

      {/* Cards grid */}
      <div className="mx-auto max-w-7xl px-5 mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
        {sample.map((e) => (
          <EventCard key={e.id} e={e} />
        ))}
      </div>

      <div className="h-10" />
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </main>
  );
}
