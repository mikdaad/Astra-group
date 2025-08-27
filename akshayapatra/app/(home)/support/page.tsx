"use client";

import React from "react";
import { motion } from "framer-motion";
import { Search, ChevronDown, Settings as SettingsIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

import { Input } from "@/components/ui/input";

type FaqItem = { question: string; answer: string };

const categories = ["General", "Work", "Payment", "Services"] as const;
const initialFaqs: FaqItem[] = [
  {
    question: "How do I manage my notifications?",
    answer:
      'To manage notifications, go to "Settings," select "Notification Settings," and customize your preferences.',
  },
  { question: "How do I start a guided meditation session?", answer: "Navigate to the meditation section and select from our guided sessions." },
  { question: "How do I start a guided meditation session?", answer: "You can access meditation sessions through the wellness tab in your dashboard." },
  { question: "How do I start a guided meditation session?", answer: "Follow the step-by-step guide in our meditation section for beginners." },
];

export default function SupportPage() {
  const [activeTab] = React.useState<"FAQ" | "Contact Us">("FAQ");
  const [activeCategory, setActiveCategory] = React.useState<typeof categories[number]>("General");
  const [openIndex, setOpenIndex] = React.useState<number>(0);
  const faqs = initialFaqs;

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <section className="mt-2">
        <h1 className="text-2xl md:text-3xl font-bold">Help & Support</h1>
        <div className="mt-4 flex items-center gap-10 text-sm">
          <div className="relative pb-2">
            <span className="font-semibold">FAQ</span>
            <span className="absolute left-0 -bottom-0.5 h-0.5 w-full bg-orange-500 rounded" />
          </div>
          <button className="text-orange-200">Contact Us</button>
        </div>
      </section>

      {/* Content container */}
      <section>
        <div
          className="rounded-[40px] border border-white/10 p-4 sm:p-6"
          style={{
            backgroundImage: "linear-gradient(to bottom, rgba(255,138,76,0.15), rgba(0,0,0,0.35))",
          }}
        >
          {/* Category chips */}
          <div className="flex flex-wrap items-center gap-3">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`px-3 py-1.5 rounded-full text-[12px] ${
                  activeCategory === c ? "bg-white text-black" : "bg-white/10 text-white border border-white/20"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="mt-4 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white" />
            <Input
              type="text"
              placeholder="search for help"
              className="pl-12 pr-12 py-4 w-full rounded-2xl bg-orange-600 text-white placeholder:text-white/80 border border-orange-500 focus-visible:ring-orange-400"
            />
            <SettingsIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white" />
          </div>

          {/* FAQ list */}
          <div className="mt-4 space-y-3">
            {faqs.map((faq, idx) => {
              const open = openIndex === idx;
              return (
                <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card
                    className={`${
                      open
                        ? "bg-white text-black"
                        : "bg-transparent text-white border border-white/20 hover:bg-white/5"
                    } rounded-xl overflow-hidden`}
                  >
                    <CardContent className="p-0">
                      <button
                        onClick={() => setOpenIndex(open ? -1 : idx)}
                        className="w-full px-5 py-4 flex items-center justify-between"
                      >
                        <span className="font-semibold text-sm md:text-base truncate">{faq.question}</span>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${open ? "rotate-180 text-black/70" : "text-white/80"}`}
                        />
                      </button>
                      {open && (
                        <div className="px-5 pb-4 text-xs md:text-sm text-black/80">
                          {faq.answer}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}