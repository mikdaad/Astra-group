"use client";

import React from "react";
import { AnimatePresence, motion, useMotionValue, useTransform } from "framer-motion";
import { Copy } from "lucide-react";
import { BankAccountCard } from "@/app/components/card/bankaccountcard";

type CardData = {
  id: string;
  userName: string;
  balance: string;
  phoneNumber: string;
  userId: string;
  email: string;
  referralId: string;
  pan: string;
  aadhaar: string;
  // Optional per-card color theme for the SVG background
  fillColors?: {
    paint0?: string; paint1?: string; paint2?: string; paint3?: string; paint4?: string; paint5?: string;
  };
};

const cards: CardData[] = [
  {
    id: "c1",
    userName: "John Doe",
    balance: "₹ 20,657.09",
    phoneNumber: "987 654 3210",
    userId: "AA0002",
    email: "johndoe@gmail.com",
    referralId: "RR0001",
    pan: "xx00xx0987",
    aadhaar: "0000 0000 0000",
    // Blue theme
    fillColors: {
      paint0: "#0D1B2A",
      paint1: "#143e67",
      paint2: "#0b2e4f",
      paint3: "#0b2e4f",
      paint4: "#0F2A44",
      paint5: "#102A43",
    },
  },
  {
    id: "c2",
    userName: "John Doe",
    balance: "₹ 20,657.09",
    phoneNumber: "987 654 3210",
    userId: "AA0002",
    email: "johndoe@gmail.com",
    referralId: "RR0001",
    pan: "xx00xx0987",
    aadhaar: "0000 0000 0000",
    // Orange theme (default look)
    fillColors: undefined,
  },
  {
    id: "c3",
    userName: "John Doe",
    balance: "₹ 20,657.09",
    phoneNumber: "987 654 3210",
    userId: "AA0002",
    email: "johndoe@gmail.com",
    referralId: "RR0001",
    pan: "xx00xx0987",
    aadhaar: "0000 0000 0000",
    // Green theme
    fillColors: {
      paint0: "#0C3D1E",
      paint1: "#1b6b3a",
      paint2: "#155d31",
      paint3: "#155d31",
      paint4: "#135228",
      paint5: "#0F3F20",
    },
  },
];

function classNames(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function CardDetailsPage() {
  const [index, setIndex] = React.useState(1); // start with the middle/orange card
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-6, 0, 6]);
  const scale = useTransform(x, [-200, 0, 200], [0.98, 1, 0.98]);

  const loopIndex = (n: number) => (n + cards.length) % cards.length;

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    const threshold = 80;
    if (info.offset.x < -threshold) setIndex((i) => loopIndex(i + 1));
    if (info.offset.x > threshold) setIndex((i) => loopIndex(i - 1));
  };

  const active = cards[index];

  const copyDetails = async () => {
    const text = `Cardholder Name: ${active.userName}\nUser ID: ${active.userId}\nReferral ID: ${active.referralId}\nEmail: ${active.email}\nPhone: ${active.phoneNumber}\nPAN: ${active.pan}\nAadhaar: ${active.aadhaar}`;
    try {
      await navigator.clipboard.writeText(text);
      // no toast framework here; rely on alert for now
      alert("Details copied");
    } catch {
      alert("Copy failed");
    }
  };

  return (
    <main
      className="min-h-screen w-full text-white/90"
     
    >
      <div className="mx-auto max-w-6xl py-6">
        <h2 className="text-lg font-semibold">Card Details</h2>
      </div>

      {/* Swipeable cards */}
      <section className="relative p-10">
        <div className="mx-auto max-w-6xl px-5">
          <div className="relative h-[360px] sm:h-[220px] flex items-center justify-center">
            {/* Ghost stack - left/right */}
            {[...Array(2)].map((_, offset) => {
              const leftIdx = loopIndex(index - (offset + 1));
              const rightIdx = loopIndex(index + (offset + 1));
              return (
                <React.Fragment key={offset}>
                  <div
                    className="absolute"
                    style={{
                      left: `${12 - offset * 8}%`,
                      top: `${18 + offset * 3}%`,
                      transform: `scale(${1.05 - offset * 0.07})`,
                      
                      filter: `blur(${0.8}px)`,
                    }}
                  >
                    <div className="scale-[1.25] origin-center">
                      <BankAccountCard
                        userName={cards[leftIdx].userName}
                        balance={cards[leftIdx].balance}
                        phoneNumber={cards[leftIdx].phoneNumber}
                        userId={cards[leftIdx].userId}
                        fillColors={cards[leftIdx].fillColors}
                      />
                    </div>
                  </div>
                  <div
                    className="absolute"
                    style={{
                      right: `${12 - offset * 8}%`,
                      top: `${18 + offset * 3}%`,
                      transform: `scale(${1.05 - offset * 0.07})`,
                      filter: `blur(${0.8}px)`,
                    }}
                  >
                    <div className="scale-[1.25] origin-center">
                      <BankAccountCard
                        userName={cards[rightIdx].userName}
                        balance={cards[rightIdx].balance}
                        phoneNumber={cards[rightIdx].phoneNumber}
                        userId={cards[rightIdx].userId}
                        fillColors={cards[rightIdx].fillColors}
                      />
                    </div>
                  </div>
                </React.Fragment>
              );
            })}

            {/* Active draggable card */}
            <AnimatePresence initial={false}>
              <motion.div
                key={active.id}
                drag="x"
                style={{ x, rotate, scale }}
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleDragEnd}
                className="relative z-10"
              >
                <div className="scale-[1.35] origin-center">
                  <BankAccountCard
                    userName={active.userName}
                    balance={active.balance}
                    phoneNumber={active.phoneNumber}
                    userId={active.userId}
                    fillColors={active.fillColors}
                  />
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Pagination */}
            <div className="absolute bottom-4 flex gap-2">
              {cards.map((_, i) => (
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

      {/* Details section */}
      <section className="mt-6">
        <div className="mx-auto max-w-3xl px-6">
          <div className="grid grid-cols-2 gap-y-3 text-white/90">
            <div>
              <p className="text-xs text-white/60">Cardholder Name</p>
              <p className="text-sm font-semibold">{active.userName}</p>
            </div>
            <div>
              <p className="text-xs text-white/60">User ID</p>
              <p className="text-sm font-semibold">{active.userId}</p>
            </div>
            <div>
              <p className="text-xs text-white/60">Referral ID</p>
              <p className="text-sm font-semibold">{active.referralId}</p>
            </div>
            <div>
              <p className="text-xs text-white/60">Email</p>
              <p className="text-sm font-semibold">{active.email}</p>
            </div>
            <div>
              <p className="text-xs text-white/60">Pan number</p>
              <p className="text-sm font-semibold">{active.pan}</p>
            </div>
            <div>
              <p className="text-xs text-white/60">Aadhaar number</p>
              <p className="text-sm font-semibold">{active.aadhaar}</p>
            </div>
          </div>
          <div className="mt-6 flex justify-center">
            <button
              onClick={copyDetails}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-stone-900 font-medium hover:bg-white/90"
            >
              Copy Details <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      <div className="h-10" />
    </main>
  );
}
