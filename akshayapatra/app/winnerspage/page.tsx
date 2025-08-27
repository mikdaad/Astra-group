"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Play } from "lucide-react";

type WinnerCard = {
  id: string;
  month: string;
  year: number;
  name: string;
  userId: string;
  prize: string;
  image: string;
};

type MediaItem = {
  id: string;
  title: string;
  date: string;
  image: string;
  video?: string; // if present, renders a <video> element
};

const winners: WinnerCard[] = [
  { id: "w1", month: "November", year: 2025, name: "John doe", userId: "AA0001", prize: "Hyundai Creta", image: "/images/vehicles/car1.png" },
  { id: "w2", month: "November", year: 2025, name: "John doe", userId: "AA0001", prize: "Bike", image: "/images/vehicles/bike1.png" },
  { id: "w3", month: "November", year: 2025, name: "John doe", userId: "AA0001", prize: "Hyundai Creta", image: "/images/vehicles/car2.png" },
  { id: "w4", month: "November", year: 2025, name: "John doe", userId: "AA0001", prize: "Bike", image: "/images/vehicles/bike2.png" },
];

const media: MediaItem[] = [
  { id: "m1", title: "Trust the process", date: "November, 2025", image: "/images/vehicles/car3.png" },
  { id: "m2", title: "Trust the process", date: "November, 2025", image: "/images/vehicles/car1.png", video: "" },
  { id: "m3", title: "Trust the process", date: "November, 2025", image: "/images/vehicles/mobile1.png" },
  { id: "m4", title: "Trust the process", date: "November, 2025", image: "/images/vehicles/bike1.png" },
  { id: "m5", title: "Trust the process", date: "November, 2025", image: "/images/vehicles/car2.png" },
  { id: "m6", title: "Trust the process", date: "November, 2025", image: "/images/vehicles/bike2.png", video: "" },
];

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
    <div className="mx-auto max-w-7xl px-5 mt-2">
      <div className="inline-flex rounded-2xl bg-black/20 border border-white/10 p-1">
        {items.map((t) => {
          const active = pathname === t.href || (t.href === "/winnerspage" && pathname === "/winnerspage");
          return (
            <Link key={t.href} href={t.href} className={classNames("px-4 sm:px-5 py-2 text-sm rounded-xl transition", active ? "bg-white/10 text-white" : "text-white/70 hover:text-white hover:bg-white/5")}>{t.label}</Link>
          );
        })}
      </div>
    </div>
  );
}

// Link already imported above

function WinnerCardView({ w }: { w: WinnerCard }) {
  return (
    <div className="shrink-0 snap-start rounded-2xl overflow-hidden  w-[clamp(240px,40vw,360px)]"
    style={{ backgroundImage: "linear-gradient(to bottom, #090300, #351603, #6E2B00, #CA5002)" }}>
      <div className="relative h-[clamp(120px,18vw,190px)]">
        <img src={w.image} alt={w.prize} className="absolute inset-0 w-full h-full object-cover" />
      </div>
      <div className="p-4 bg-gradient-to-b from-transparent to-[#6E2B00]/50">
        <div className="flex items-center justify-between text-[11px] text-white/80">
          <span>1st Draw</span>
          <span>{w.month}, {w.year}</span>
        </div>
        <div className="mt-3">
          <p className="text-white text-lg font-semibold leading-tight">{w.name}</p>
          <p className="text-white/80 text-xs">{w.userId}</p>
          <p className="text-white/80 text-xs mt-2">{w.prize}</p>
        </div>
        <div className="mt-3">
          <Link href="/winnerview" className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-white/10 hover:bg-white/15">
            VIEW <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function MediaCard({ item }: { item: MediaItem }) {
  const isVideo = Boolean(item.video);
  return (
    <div className="rounded-2xl overflow-hidden bg-white/5 border border-white/10">
      <div className="relative h-36 sm:h-40">
        {isVideo ? (
          <div className="absolute inset-0">
            {/* Replace src with actual video path when available */}
            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 grid place-items-center">
              <div className="h-10 w-10 rounded-full bg-black/50 backdrop-blur grid place-items-center">
                <Play className="w-5 h-5" />
              </div>
            </div>
          </div>
        ) : (
          <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-medium truncate">{item.title}</p>
        <p className="text-white/60 text-[11px] mt-0.5">{item.date}</p>
      </div>
    </div>
  );
}

export default function WinnersPage() {
  return (
    <main
      className="min-h-screen w-full text-white/90"
      
    >
     

      <TopTabs />

      {/* Swipeable winners row (horizontally scrollable and scalable) */}
      <section className="mt-2">
        <div className="mx-auto max-w-7xl ">
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 scroll-smooth">
            {winners.map((w) => (
              <WinnerCardView key={w.id} w={w} />
            ))}
          </div>
          {/* Pagination dots (static count as visual aid) */}
          <div className="mt-3 flex items-center justify-center gap-2">
            {winners.map((_, i) => (
              <span key={i} className={classNames("w-2 h-2 rounded-full", i === 1 ? "bg-white" : "bg-white/30")} />
            ))}
          </div>
        </div>
      </section>

      {/* Review section */}
      <section className="mt-4">
        <div className="mx-auto max-w-7xl ">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">Review</h3>
            <Link href="/winnerspage/review" className="text-white/80 text-sm hover:text-white">View All</Link>
          </div>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {media.map((m) => (
              <MediaCard key={m.id} item={m} />
            ))}
          </div>
        </div>
      </section>

      <div className="h-10" />
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </main>
  );
}
