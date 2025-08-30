"use client";

import React from "react";
import Image from "next/image";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { Car, ShoppingCart, Download, ChevronRight, ArrowUpRight, TicketPercent } from "lucide-react";
import { useRouter } from "next/navigation";

// ---------- Mock Data ----------
const exploreSchemes = [
  {
    id: "b1",
    title: "1st Bumper Draw",
    subtitle: "Hyundai Creta",
    image:
      "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=1200&auto=format&fit=crop",
    cta: "Explore Now",
  },
  {
    id: "b2",
    title: "2nd Bumper Draw",
    subtitle: "Bike",
    image:
      "https://images.unsplash.com/photo-1585247226801-bc613c9b76c5?q=80&w=1200&auto=format&fit=crop",
    cta: "Explore Now",
  },
  {
    id: "b3",
    title: "2nd Bumper Draw",
    subtitle: "Hyundai Creta",
    image:
      "https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=1200&auto=format&fit=crop",
    cta: "Explore Now",
  },
];

const runningSchemes = [
  {
    id: "r1",
    month: "June",
    price: 1000,
    image:
      "https://images.unsplash.com/photo-1549921296-3a6b44c53a3a?q=80&w=1200&auto=format&fit=crop",
    label: "Car",
    accent: "from-orange-500/60 to-amber-600/60",
  },
  {
    id: "r2",
    month: "July",
    price: 1000,
    image:
      "https://images.unsplash.com/photo-1615735485101-b0d9be88f0ec?q=80&w=1200&auto=format&fit=crop",
    label: "Bike",
    accent: "from-amber-600/60 to-orange-700/60",
  },
  {
    id: "r3",
    month: "August",
    price: 1000,
    image:
      "https://images.unsplash.com/photo-1549921296-3a6b44c53a3a?q=80&w=1200&auto=format&fit=crop",
    label: "Car",
    accent: "from-orange-700/60 to-amber-700/60",
  },
  {
    id: "r4",
    month: "September",
    price: 1000,
    image:
      "https://images.unsplash.com/photo-1615735485101-b0d9be88f0ec?q=80&w=1200&auto=format&fit=crop",
    label: "Bike",
    accent: "from-amber-700/60 to-orange-800/60",
  },
];

// ---------- Utilities ----------
function classNames(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

// ---------- Card For Explore Row ----------
function ExploreCard({ item }: { item: (typeof exploreSchemes)[number] }) {
  return (
    <div
      className="relative shrink-0 w-[320px] h-[140px] rounded-2xl overflow-hidden bg-gradient-to-br from-orange-900/60 to-amber-900/60 border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
    >
      <Image
        src={item.image}
        alt={item.subtitle}
        fill
        className="object-cover opacity-30"
        sizes="320px"
      />
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_0%_0%,rgba(255,255,255,0.06),transparent_60%)]" />
      <div className="relative h-full w-full p-4 flex flex-col justify-between">
        <div>
          <p className="text-white/90 text-sm font-medium">{item.title}</p>
          <p className="text-white/70 text-[12px]">{item.subtitle}</p>
        </div>
        <button className="self-start inline-flex items-center gap-1 text-[12px] px-3 py-1 rounded-full bg-white/10 hover:bg-white/15 text-white/90 backdrop-blur">
          {item.cta} <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

// ---------- Running Card Component ----------
function RunningCard({
  data,
  active,
  onPay,
}: {
  data: (typeof runningSchemes)[number];
  active: boolean;
  onPay: () => void;
}) {
  return (
    <div
      className={classNames(
        "relative w-[320px] h-[420px] rounded-3xl overflow-hidden cursor-pointer",
        active ? "z-10" : "pointer-events-none z-10"
      )}
    >
      <div
        className={classNames("absolute inset-0 ", data.accent)}
        style={{
          backgroundImage: "linear-gradient(to bottom, #090300, #351603, #6E2B00, #CA5002)",
        }}
      />
      <div className="relative z-10 p-4 flex items-center justify-between text-white/80">
        <span className="inline-flex items-center gap-2 text-sm">
          <TicketPercent className="w-4 h-4" /> Live Program
        </span>
        <button className="p-2 rounded-full bg-white/10 hover:bg-white/15">
          <ShoppingCart className="w-4 h-4" />
        </button>
      </div>

      {/* Image: containment + no overflow */}
      <div className="relative z-10 mt-6 flex items-center justify-center">
        <div className="relative w-[240px] h-[160px] rounded-xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.35)] bg-white/5">
          <Image
            src={data.image}
            alt={data.label}
            fill
            sizes="240px"
            className="object-contain"
            priority={false}
          />
        </div>
      </div>

      <div className="relative z-10 mt-8 px-6">
        <p className="text-white/80 text-sm">{data.month}</p>
        <div className="flex items-end justify-between mt-1">
          <p className="text-white text-2xl font-semibold">₹ {data.price}</p>
          <div className="flex items-center gap-2 text-white/50 text-xs">
            <Download className="w-4 h-4" />
            Receipt after payment
          </div>
        </div>

        <div className="hidden lg:block">
          <button
            onClick={onPay}
            className="mt-5 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-white text-stone-900 font-medium hover:bg-white/90 transition"
          >
            Pay Now <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="block lg:hidden">
          <button
            onClick={onPay}
            className="mt-5 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-white text-stone-900 font-medium hover:bg-white/90 transition"
          >
            Pay Now <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Main Page ----------
export default function ProgramPage() {
  const [index, setIndex] = React.useState(0);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-6, 0, 6]);
  const scale = useTransform(x, [-200, 0, 200], [0.98, 1, 0.98]);
  const router = useRouter();

  const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(n, max));

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    const threshold = 80;
    if (info.offset.x < -threshold) setIndex((i) => clamp(i + 1, 0, runningSchemes.length - 1));
    if (info.offset.x > threshold) setIndex((i) => clamp(i - 1, 0, runningSchemes.length - 1));
  };

  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-[#3a1707] via-[#4b1c08] to-[#1a0b06] text-white/90">
      {/* Header */}
      <div className="mx-auto max-w-6xl px-5 py-6">
        <h1 className="text-xl font-semibold">Live Lucky Draw</h1>
      </div>

      {/* Explore Schemes Row */}
      <div className="mx-auto max-w-6xl px-5">
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
          {exploreSchemes.map((item) => (
            <ExploreCard key={item.id} item={item} />
          ))}
        </div>
      </div>

      {/* Running Schemes - Swipeable Stack */}
      <section className="relative mt-8">
        <div className="mx-auto max-w-6xl px-5">
          <div className="relative h-[520px]">
            {/* Background blurred cards */}
            <div className="absolute inset-0 flex items-center justify-center gap-6 pointer-events-none">
              {runningSchemes.map((c, i) => (
                <div
                  key={c.id + "bg"}
                  className={classNames(
                    "w-[260px] h-[360px] rounded-3xl bg-white/5 border border-white/5 backdrop-blur-xl",
                    i === index ? "opacity-20" : "opacity-10"
                  )}
                />
              ))}
            </div>

            {/* Active swipe card */}
            <AnimatePresence initial={false}>
              <motion.div
                key={runningSchemes[index].id}
                drag="x"
                style={{ x, rotate, scale }}
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleDragEnd}
                className="absolute left-1/2 -translate-x-1/2 top-4"
              >
                <RunningCard
                  data={runningSchemes[index]}
                  active
                  onPay={() => router.push(`/program/${runningSchemes[index].id}`)}
                />
              </motion.div>
            </AnimatePresence>

            {/* Left ghost */}
            {index > 0 && (
              <div className="absolute left-[10%] top-12 scale-95 opacity-70">
                <RunningCard data={runningSchemes[index - 1]} active={false} onPay={() => {}} />
              </div>
            )}

            {/* Right ghost */}
            {index < runningSchemes.length - 1 && (
              <div className="absolute right-[10%] top-12 scale-95 opacity-70">
                <RunningCard data={runningSchemes[index + 1]} active={false} onPay={() => {}} />
              </div>
            )}

            {/* Pagination dots */}
            <div className="absolute bottom-5 left-0 right-0 flex items-center justify-center gap-2">
              {runningSchemes.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className={classNames(
                    "w-2.5 h-2.5 rounded-full transition",
                    i === index ? "bg-white" : "bg-white/30 hover:bg-white/50"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer spacing */}
      <div className="h-12" />

      {/* Styles */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </main>
  );
}

