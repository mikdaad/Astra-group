"use client";

import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { ShoppingCart, Download, ChevronRight, ArrowUpRight, TicketPercent, Loader2 } from "lucide-react";
import { createClient as createSupabaseClient } from "@/utils/supabase/client";
import { getSchemePeriods, getSchemeTopRewards, listSchemesPublic, type SchemeSummary } from "@/app/lib/rpc";
import { PageLoaderOverlay } from "@/app/components/general/PageLoader";

// --- START: Updated Types ---
type SchemeInfo = {
  id: string;
  name: string;
  subscription_amount: number;
  scheme_type: string;
  subscription_cycle: string;
  status: string;
};

type ExploreScheme = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  cta: string;
};

type RunningScheme = {
  id: string;
  month: string;
  price: number;
  image: string;
  label: string;
  accent: string;
  periodIndex: number;
  periodStart: string; // ISO string for the period start (calendar alignment)
  schemeId: string;
  paid: boolean; 
  isPastUnpaid: boolean; // for the "eligible" note
};

type PaymentReceipt = {
  transactionId: string;
  amount: number;
  schemeName: string;
  month: string;
  periodIndex: number;
  schemeId: string;
  timestamp: string;
  userName: string;
  userPhone: string;
  paymentMethod: string;
  status: string;
};
// --- END: Updated Types ---

// Utils
function classNames(...classes: (string | false | null | undefined)[]) { return classes.filter(Boolean).join(" "); }

// Payment Success Popup Component
function PaymentSuccessPopup({ receipt, onClose, onPrintReceipt }: { receipt: PaymentReceipt; onClose: () => void; onPrintReceipt: () => void; }) {
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowReceipt(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!showReceipt) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-8 text-white text-center max-w-sm w-full"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <motion.svg
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
            >
              <path d="M20 6L9 17l-5-5" />
            </motion.svg>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.4 }}
            className="text-2xl font-bold mb-2"
          >
            Investment Payment Successful!
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.4 }}
            className="text-white/90 mb-4"
          >
            Your investment payment of ₹{receipt.amount} has been processed successfully.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.4 }}
            className="text-sm text-white/70"
          >
            Preparing your receipt...
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-amber-900 via-orange-800 to-red-900 overflow-hidden z-50">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDYwIDAgTCAwIDAgMCA2MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
      </div>
      <div className="relative z-10 h-full overflow-y-auto">
        <div className="flex flex-col items-center justify-start min-h-full p-4 py-8">
          {/* Container that ensures proper spacing on all screen sizes */}
          <div className="flex flex-col w-full max-w-md mx-auto space-y-6">
            
            {/* Close Button */}
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={onClose}
              className="self-end text-white/80 hover:text-white transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </motion.button>
            
            {/* Receipt Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative w-full"
            >
          <div className="relative bg-white rounded-lg overflow-hidden shadow-2xl">
            <div className="relative z-20 pt-16 pb-16 px-8">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="text-center mb-6"
              >
                <div className="bg-green-600 text-white py-2 px-4 rounded-t-lg">
                  <h1 className="text-lg font-bold">PAYMENT RECEIPT</h1>
                </div>
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-b-lg">
                  <h2 className="text-xl font-bold">{receipt.userName}</h2>
                  <p className="text-sm opacity-90">TRANSACTION ID</p>
                  <p className="text-lg font-semibold">{receipt.transactionId}</p>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="space-y-3 mb-6"
              >
                <ReceiptRow label="Amount" value={`₹${receipt.amount.toFixed(2)}`} />
                <ReceiptRow label="Investment Plan" value={receipt.schemeName} />
                <ReceiptRow label="Month" value={receipt.month} />
                <ReceiptRow label="Period Index" value={String(receipt.periodIndex)} />
                <ReceiptRow label="Scheme ID" value={receipt.schemeId} />
                <ReceiptRow label="Phone" value={receipt.userPhone} />
                <ReceiptRow label="Payment Method" value={receipt.paymentMethod} />
                <ReceiptRow label="Status" value={receipt.status} />
                <ReceiptRow label="Date & Time" value={new Date(receipt.timestamp).toLocaleString()} />
              </motion.div>
            </div>
          </div>
            </motion.div>
            
            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              className="flex flex-col gap-4 w-full"
            >
              <button
                onClick={onPrintReceipt}
                className="flex items-center justify-center gap-3 bg-transparent border-2 border-white/30 text-white py-3 px-6 rounded-lg hover:bg-white/10 transition-all duration-200 min-h-[52px]"
              >
                <Download size={20} />
                <span className="font-medium">Print Receipt</span>
              </button>
              <button
                onClick={onClose}
                className="flex items-center justify-center gap-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-6 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 min-h-[52px]"
              >
                <span className="font-medium">Close</span>
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for receipt rows
function ReceiptRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-gray-600 text-sm font-medium">{label}</span>
      <span className="text-gray-800 text-sm font-semibold">{value}</span>
    </div>
  );
}

// Explore Card Component
function ExploreCard({ item }: { item: ExploreScheme }) {
  const router = useRouter();
  
  const handleCardClick = () => {
    router.push(`/program/explore/${item.id}`);
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleCardClick();
  };

  return (
    <div 
      className="relative shrink-0 w-[320px] h-[140px] rounded-2xl overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-200"
      onClick={handleCardClick}
    >
      <Image src={item.image} alt={item.subtitle} fill className="object-cover" sizes="320px" />
      <div className="relative h-full w-full p-4 flex flex-col justify-between">
        <div>
          <p className="text-white/90 text-sm font-medium">{item.title}</p>
          <p className="text-white/70 text-[12px]">{item.subtitle}</p>
        </div>
        <button 
          onClick={handleButtonClick}
          className="self-start inline-flex items-center gap-1 text-[12px] px-3 py-1 rounded-full bg-white/10 hover:bg-white/15 text-white/90 backdrop-blur"
        >
          {item.cta} <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

// Running Card Component
function RunningCard({
  data,
  active,
  onPay,
  onDownloadReceipt, // NEW
  isDraggingRef,
}: {
  data: RunningScheme;
  active: boolean;
  onPay: () => void;
  onDownloadReceipt: (s: RunningScheme) => void; // NEW
  isDraggingRef?: React.MutableRefObject<boolean>;
}) {
  const router = useRouter();

  const handleCardClick = () => {
    if (isDraggingRef?.current) return;
    const productId = encodeURIComponent(`${data.schemeId}|${data.periodIndex}`);
    router.push(`/program/${productId}`);
  };

  return (
    <div
      className={classNames(
        "relative w-[320px] h-[420px] rounded-3xl overflow-hidden cursor-pointer",
        active ? "z-10" : "pointer-events-none z-10"
      )}
      onClick={handleCardClick}
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
            className="object-contain"  // contain ensures no overflow; switch to 'object-cover' if you prefer cropping
            priority={false}
          />
        </div>
      </div>

      <div className="relative z-10 mt-8 px-6">
        {data.paid ? (
          <div className="text-center">
            <p className="text-white/80 text-sm">{data.month}</p>
            <div className="flex items-center justify-center mt-4">
              <span className="text-white text-lg font-medium">Paid</span>
            </div>

            {/* Download receipt (PDF) */}
            <div className="flex items-center justify-center mt-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDownloadReceipt(data);
                }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-white/90 text-xs"
              >
                <Download className="w-4 h-4" /> Download Receipt (PDF)
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-white/80 text-sm">{data.month}</p>
            <div className="flex items-end justify-between mt-1">
              <p className="text-white text-2xl font-semibold">₹ {data.price}</p>
              <div className="flex items-center gap-2 text-white/50 text-xs">
                <Download className="w-4 h-4" />
                Receipt after payment
              </div>
            </div>

            {data.isPastUnpaid && (
              <p className="absolute ml-4 text-amber-200 text-xs">
                Pay this month to be eligible for program
              </p>
            )}

            <div className="hidden lg:block">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPay();
                }}
                className="mt-5 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-white text-stone-900 font-medium hover:bg-white/90 transition"
                disabled={data.paid}
              >
                Pay Now <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="block lg:hidden" onClick={(e) => e.stopPropagation()}>
              <SwipePayButton label="Pay Now" onClick={async () => {
                await onPay();
              }} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// SwipePayButton Component
function SwipePayButton({ label, onClick }: { label: string; onClick: () => void }) {
  const containerRef = React.useRef<HTMLButtonElement | null>(null);
  const knobRef = React.useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(0);
  const [maxX, setMaxX] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isPaymentLoading, setIsPaymentLoading] = React.useState(false);
  
  // Transform values for glow effect
  const glowOpacity = useTransform(x, [0, maxX * 0.3, maxX * 0.8, maxX], [0, 0.3, 0.8, 1]);
  const sparkleScale = useTransform(x, [0, maxX * 0.5, maxX], [0, 1, 1.2]);

  React.useEffect(() => {
    const measure = () => {
      const container = containerRef.current;
      const knob = knobRef.current;
      if (!container || !knob) return;
      const padding = 8;
      const bound = container.clientWidth - knob.clientWidth - padding * 2;
      setMaxX(Math.max(0, bound));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = async () => {
    const current = x.get();
    const threshold = maxX * 0.6;
    setIsDragging(false);
    
    if (current >= threshold) {
      x.set(maxX);
      setIsPaymentLoading(true);
      
      // Add a slight delay to show the loading state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      try {
        await onClick();
      } finally {
        setIsPaymentLoading(false);
        x.set(0);
      }
    } else {
      x.set(0);
    }
  };

  return (
    <button
      ref={containerRef}
      className="relative mt-5 w-full h-12 sm:h-14 rounded-full text-white font-medium overflow-hidden select-none"
      style={{
        backgroundBlendMode: "normal, plus-lighter",
        boxShadow:
          "-5.091px -5.091px 1.697px -5.94px rgba(255, 255, 255, 0.50) inset, 5.091px 5.091px 1.697px -5.94px rgba(255, 255, 255, 0.50) inset, 3.394px 5.091px 1.697px -3.394px rgba(179, 179, 179, 0.20) inset, -3.394px -5.091px 1.697px -3.394px #B3B3B3 inset, 0 0 37.337px 0 rgba(242, 242, 242, 0.50) inset",
        backdropFilter: "blur(33.942710876464844px)",
        WebkitBackdropFilter: "blur(33.942710876464844px)",
      }}
      type="button"
      aria-label={label}
      disabled={isPaymentLoading}
    >
      {/* Sparking glow trail effect */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(255, 215, 0, 0.6) 50%, rgba(255, 255, 255, 0.8) 100%)",
          opacity: glowOpacity,
          maskImage: "linear-gradient(90deg, transparent 0%, black 20%, black 80%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(90deg, transparent 0%, black 20%, black 80%, transparent 100%)",
        }}
      />
      
      {/* Sparkle particles */}
      {isDragging && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ scale: sparkleScale }}
        >
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-yellow-300 rounded-full"
              style={{
                left: `${20 + i * 12}%`,
                top: `${30 + (i % 2) * 40}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>
      )}
      
      <span className="absolute inset-0 flex items-center pl-14 sm:pl-16 pr-4 sm:pr-6 pointer-events-none">
        {isPaymentLoading ? (
          <div className="flex items-center gap-2 text-base">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Processing Payment...</span>
          </div>
        ) : (
          <span className="text-base">{label}</span>
        )}
      </span>
      
      <motion.div
        ref={knobRef}
        className={classNames(
          "absolute top-1 left-1 h-10 w-10 sm:h-12 sm:w-12 rounded-full grid place-items-center bg-white shadow-sm",
          isPaymentLoading ? "cursor-not-allowed" : "cursor-grab active:cursor-grabbing"
        )}
        drag={isPaymentLoading ? false : "x"}
        dragConstraints={{ left: 0, right: maxX }}
        dragMomentum={false}
        style={{ x, touchAction: "none" }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {isPaymentLoading ? (
          <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
        ) : (
          <motion.svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            animate={isDragging ? { rotate: [0, 10, -10, 0] } : {}}
            transition={{ duration: 0.3, repeat: isDragging ? Infinity : 0 }}
          >
            <path d="M15.0639 13.9018L9.85938 8.69727L11.4434 7.11328L18.2319 13.9018L11.4434 20.6904L9.85938 19.1064L15.0639 13.9018Z" fill="#2F2F2F" />
          </motion.svg>
        )}
      </motion.div>
    </button>
  );
}

// Main Page Component
export default function Page() {
  const [index, setIndex] = React.useState(0);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-6, 0, 6]);
  const scale = useTransform(x, [-200, 0, 200], [0.98, 1, 0.98]);

  const supabase = createSupabaseClient();
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [schemes, setSchemes] = useState<SchemeSummary[]>([]);
  const [selectedSchemeId, setSelectedSchemeId] = useState<string | null>(null);
  const [exploreSchemes, setExploreSchemes] = useState<ExploreScheme[]>([]);
  const [runningSchemes, setRunningSchemes] = useState<RunningScheme[]>([]);
  const [paymentReceipt, setPaymentReceipt] = useState<PaymentReceipt | null>(null);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  
  const selectedScheme = useMemo(() => schemes.find(s => s.id === selectedSchemeId), [schemes, selectedSchemeId]);

  // Data loading functions
  async function loadExploreSchemes(schemeId: string) {
    try {
      const rewards = await getSchemeTopRewards(schemeId, supabase);
      const exploreData: ExploreScheme[] = rewards.map((reward: any) => ({
        id: reward.reward_id,
        title: `Reward #${reward.position}`,
        subtitle: reward.title || "Exciting Reward",
        image: reward.image_url,
        cta: "Explore Now",
      }));
      setExploreSchemes(exploreData);
    } catch (err) {
      console.error("Failed to load explore schemes:", err);
      setError("Could not load reward information.");
    }
  }

  async function loadRunningSchemes(scheme: SchemeSummary) {
    if (!scheme) return;
    try {
      console.log("scheme", scheme);
      const periods = await getSchemePeriods(scheme.id, supabase);
      console.log("periods", periods);
      const now = new Date();

      const runningData: RunningScheme[] = periods.slice(0, periods.length).map((period: any, idx: number) => {
        const periodStartDate = new Date(period.period_start);
        // Since we're not tracking user payments, all periods are unpaid
        const paid = false;
        const isPastUnpaid = !paid && periodStartDate <= now;

        return {
          id: `${scheme.id}-${period.period_index}`,
          month: periodStartDate.toLocaleDateString("en-US", { month: "long" }),
          price: scheme.subscription_amount,
          image:
            period.cover_image_url ||
            "https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=1200&auto=format&fit=crop",
          label: scheme.name,
          accent: `from-orange-${500 + idx * 100}/60 to-amber-${600 + idx * 100}/60`,
          periodIndex: period.period_index,
          periodStart: period.period_start,
          schemeId: scheme.id,
          paid,
          isPastUnpaid,
        };
      });
      console.log("runningData", runningData)

      setRunningSchemes(runningData);
    } catch (err) {
      console.error("Failed to load running schemes:", err);
      setError("Could not load payment periods.");
    }
  }

  // Effect to fetch schemes initially
  useEffect(() => {
    const loadSchemes = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const schemesData = await listSchemesPublic(supabase);
        // Filter out Reg_Fee scheme
        const filteredSchemes = schemesData.filter(scheme => scheme.name !== "Reg_Fee");
        setSchemes(filteredSchemes);
        if (filteredSchemes.length > 0) {
          setSelectedSchemeId(filteredSchemes[0].id);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
        // Add delay for initial loading animation
        setTimeout(() => {
          setIsInitialLoading(false);
        }, 2000);
      }
    };
    void loadSchemes();
  }, []);
  
  // Effect to load scheme data when the selected card changes
  useEffect(() => {
    if (!selectedScheme) {
      setExploreSchemes([]);
      setRunningSchemes([]);
      return;
    }
    
    const loadDataForSelectedScheme = async () => {
      setIsLoading(true);
      await Promise.all([
        loadExploreSchemes(selectedScheme.id),
        loadRunningSchemes(selectedScheme),
      ]);
      setIsLoading(false);
    };
    void loadDataForSelectedScheme();
  }, [selectedScheme]);

  // Index: start from the current calendar month period
  useEffect(() => {
    if (runningSchemes.length === 0) {
      setIndex(0);
      return;
    }

    const now = new Date();
    // Find the last period whose start <= now (i.e., the current calendar period)
    let currentIdx = -1;
    for (let i = 0; i < runningSchemes.length; i++) {
      const start = new Date(runningSchemes[i].periodStart);
      if (start <= now) {
        currentIdx = i;
      } else {
        break;
      }
    }

    if (currentIdx !== -1) {
      setIndex(currentIdx);
    } else {
      // All periods are in the future; default to first
      setIndex(0);
    }
  }, [runningSchemes]);

  // Payment Handler
  async function handlePayNow(scheme: RunningScheme) {
    if (scheme.paid) {
      alert("This month has already been paid.");
      return;
    }
    
    try {
      const res = await fetch("/api/initiatepayment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          schemeId: scheme.schemeId,
          periodIndex: scheme.periodIndex,
          amount: scheme.price,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!json?.redirectUrl) {
        console.error("initiatepayment failed", json);
        alert(json.message || "Failed to start payment. Please try again.");
        return;
      }
      
      // Store payment context for success callback
      localStorage.setItem('pendingPayment', JSON.stringify({
        schemeId: scheme.schemeId,
        periodIndex: scheme.periodIndex,
        amount: scheme.price,
        schemeName: selectedScheme?.name || "Scheme",
        month: scheme.month,
        userName: userName || "User",
        userPhone: userPhone || ""
      }));
      
      window.location.assign(json.redirectUrl as string);
    } catch (error) {
      console.error("Payment initiation failed:", error);
      alert("Failed to start payment. Please try again.");
    }
  }

  // Drag Handlers
  const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(n, max));
  const prevOverflow = React.useRef<string | null>(null);
  const prevOverscroll = React.useRef<string | null>(null);

  const isDraggingRef = React.useRef(false);

  const handleDragStart = () => {
     const docEl = document.documentElement;
    prevOverflow.current = docEl.style.overflow || "";
    prevOverscroll.current = docEl.style.getPropertyValue('overscroll-behavior') || "";
    docEl.style.overflow = "hidden";
    docEl.style.setProperty('overscroll-behavior', 'contain');
    isDraggingRef.current = true;
  };

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    const threshold = 80;
    const maxIndex = Math.max(0, runningSchemes.length - 1);
    if (info.offset.x < -threshold) setIndex((i) => clamp(i + 1, 0, maxIndex));
    if (info.offset.x > threshold) setIndex((i) => clamp(i - 1, 0, maxIndex));
    const docEl = document.documentElement;
    docEl.style.overflow = prevOverflow.current ?? "";
    docEl.style.setProperty('overscroll-behavior', prevOverscroll.current ?? "");
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 120);
  };

  const [userName, setUserName] = useState<string>("");
  const [userPhone, setUserPhone] = useState<string>("");


useEffect(() => {
  const loadUser = async () => {
    try {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;
      if (user) {
        // Extract name from user metadata or email
        const name = 
          (user.user_metadata?.full_name as string) ||
          (user.user_metadata?.name as string) ||
          (user.email?.split("@")[0] as string) ||
          "User";
        
        // Extract phone from user data
        const phone = user.phone || "";
        
        setUserName(name);
        setUserPhone(phone);
      }
    } catch (e) {
      console.warn("Could not load user for receipt:", e);
      // Set empty values if auth fails
      setUserName("");
      setUserPhone("");
    }
  };
  void loadUser();
}, [supabase]);

// Check for payment success callback
useEffect(() => {
  const checkPaymentCallback = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment'); // 'success' or 'failed'
      
    if (paymentStatus === 'success') {
      // Get stored payment context
      const pendingPayment = localStorage.getItem('pendingPayment');
      if (pendingPayment) {
        try {
          const paymentData = JSON.parse(pendingPayment);
            
          // Try to extract transaction ID from URL path or generate one
          const pathParts = window.location.pathname.split('/');
          const possibleTxId = pathParts[pathParts.length - 1];
          const transactionId = possibleTxId && possibleTxId.length > 10 ? possibleTxId : `TXN${Date.now()}`;
            
          // Create receipt from stored data
          const receipt: PaymentReceipt = {
            transactionId: transactionId,
            amount: paymentData.amount,
            schemeName: paymentData.schemeName,
            month: paymentData.month,
            periodIndex: paymentData.periodIndex,
            schemeId: paymentData.schemeId,
            timestamp: new Date().toISOString(),
            userName: paymentData.userName || "User",
            userPhone: paymentData.userPhone || "",
            paymentMethod: "UPI",
            status: "Success"
          };
            
          // Show payment success popup
          setPaymentReceipt(receipt);
          setShowPaymentSuccess(true);
            
          // Clean up
          localStorage.removeItem('pendingPayment');
            
          // Clean URL to remove payment parameters
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
            
          // Refresh schemes to show updated payment status
          setTimeout(() => {
            if (selectedScheme) {
              loadRunningSchemes(selectedScheme);
            }
          }, 1000);
            
        } catch (error) {
          console.error('Error parsing payment data:', error);
          localStorage.removeItem('pendingPayment');
        }
      } else {
        // No pending payment data but payment=success in URL
        // This might be a page refresh after successful payment
        console.log('Payment success detected but no pending payment data');
          
        // Still clean the URL
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
          
        // Refresh schemes in case payment status changed
        if (selectedScheme) {
          loadRunningSchemes(selectedScheme);
        }
      }
    } else if (paymentStatus === 'failed') {
      // Handle payment failure
      localStorage.removeItem('pendingPayment');
        
      // Clean URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
        
      // Optionally show failure message
      console.log('Payment failed');
    }
  };
    
  // Check on mount
  checkPaymentCallback();
}, [selectedScheme]);

async function handlePrintReceipt(receipt: PaymentReceipt) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Payment Receipt", 105, 20, { align: "center" });

  // Meta
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  let y = 40;
  const line = (label: string, value: string) => {
    doc.text(`${label}:`, 20, y);
    doc.text(value, 70, y);
    y += 8;
  };

  line("Transaction ID", receipt.transactionId);
  line("Name", receipt.userName);
  line("Phone", receipt.userPhone);
  line("Amount", `Rs.${receipt.amount.toFixed(2)}`);
  line("Scheme", receipt.schemeName);
  line("Month", receipt.month);
  line("Period Index", String(receipt.periodIndex));
  line("Payment Method", receipt.paymentMethod);
  line("Status", receipt.status);
  line("Scheme ID", receipt.schemeId);
  line("Date & Time", new Date(receipt.timestamp).toLocaleString());

  // Footer/border
  doc.roundedRect(12, 12, 186, y - 24 + 8, 3, 3);
  doc.setFontSize(9);
  doc.text("Thank you for your payment.", 105, y + 10, { align: "center" });

  const safeScheme = receipt.schemeName.replace(/\s+/g, "_");
  const safeMonth = receipt.month.replace(/\s+/g, "_");
  doc.save(`Receipt_${safeScheme}_${safeMonth}_${receipt.transactionId}.pdf`);
}

async function handleDownloadReceipt(s: RunningScheme) {
  // Protect against accidental call on unpaid
  if (!s.paid) return;

  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();

  const schemeName = selectedScheme?.name || "Scheme";
  const monthLabel = new Date(s.periodStart).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Payment Receipt", 105, 20, { align: "center" });

  // Meta
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  let y = 40;
  const line = (label: string, value: string) => {
    doc.text(`${label}:`, 20, y);
    doc.text(value, 70, y);
    y += 8;
  };

  line("Name", userName || "—");
  line("Phone", userPhone || "—");
  line("Investment Plan", schemeName);
  line("Month", monthLabel);
  line("Period Index", String(s.periodIndex));
  line("Amount", `Rs.${s.price.toFixed(2)}`);
  line("Scheme ID", s.schemeId);
  line("Generated On", new Date().toLocaleString());

  // Footer/border
  doc.roundedRect(12, 12, 186, y - 24 + 8, 3, 3);
  doc.setFontSize(9);
  doc.text("Thank you for your payment.", 105, y + 10, { align: "center" });

  const safeScheme = schemeName.replace(/\s+/g, "_");
  const safeMonth = monthLabel.replace(/\s+/g, "_");
  doc.save(`Receipt_${safeScheme}_${safeMonth}.pdf`);
}

  return (
    <div className="relative">
      {/* Loading Overlay */}
      {isInitialLoading && (
        <PageLoaderOverlay 
          text="G O L D   &   D I A M O N D S" 
          duration={2.0}
        />
      )}
      
      {/* Payment Success Popup */}
      {showPaymentSuccess && paymentReceipt && (
        <PaymentSuccessPopup
          receipt={paymentReceipt}
          onClose={() => {
            setShowPaymentSuccess(false);
            setPaymentReceipt(null);
          }}
          onPrintReceipt={() => {
            if (paymentReceipt) {
              handlePrintReceipt(paymentReceipt);
            }
          }}
        />
      )}
    
    <main className="text-white/90">
      <div className="mx-auto max-w-6xl px-5 py-6">
        <h1 className="text-xl font-semibold">Gold & Diamond Investment Portal</h1>

        {/* Card Selector Dropdown */}
        {schemes.length > 0 && (
          <div className="mt-4">
            <label htmlFor="scheme-select" className="block text-sm font-medium text-white/70">
              Select Your Investment Plan
            </label>
            <select
              id="scheme-select"
              name="scheme"
              value={selectedSchemeId || ""}
              onChange={(e) => setSelectedSchemeId(e.target.value)}
              className="mt-1 block w-full max-w-xs rounded-md border-white/20 bg-white/5 py-2 pl-3 pr-10 text-base focus:border-orange-500 focus:outline-none focus:ring-orange-500 sm:text-sm"
            >
              {schemes.map((scheme) => (
                <option key={scheme.id} value={scheme.id}>
                  {scheme.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Loading, Error, and Empty States */}
      {isLoading && (
        <div className="flex justify-center items-center h-64 text-white/70">
          <Loader2 className="w-8 h-8 animate-spin mr-3" /> Loading investment plans...
        </div>
      )}
      {error && !isLoading && (
        <div className="mx-auto max-w-6xl px-5 text-center text-red-400">
          <p>{error}</p>
        </div>
      )}
      {!isLoading && !error && schemes.length === 0 && (
        <div className="mx-auto max-w-6xl px-5 text-center text-white/70">
          <p>No investment plans available yet.</p>
        </div>
      )}

      {/* Main Content */}
      {!isLoading && !error && selectedScheme && (
        <>
          <div className="mx-auto max-w-6xl px-5 mt-4">
            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
              {exploreSchemes.map((item) => (
                <ExploreCard key={item.id} item={item} />
              ))}
            </div>
          </div>

          <section className="relative mt-8 overflow-hidden overscroll-contain">
            <div className="mx-auto max-w-6xl px-5">
              <div className="relative h-[520px]">
                <div className="absolute inset-0 hidden sm:flex items-center justify-center gap-6 pointer-events-none">
                  {runningSchemes.length > 0 &&
                    runningSchemes.map((c) => (
                      <div
                        key={c.id + "bg"}
                        className={classNames(
                          "w-[260px] h-[360px] rounded-3xl bg-white/5 border border-white/5 "
                        )}
                      />
                    ))}
                </div>

                <AnimatePresence initial={false}>
                  {runningSchemes.length > 0 && runningSchemes[index] && (
                    <motion.div
                      key={runningSchemes[index].id}
                      drag="x"
                      dragMomentum={false}
                      onDragStart={handleDragStart}
                      style={{ x, rotate, scale, touchAction: "none" }}
                      dragConstraints={{ left: 0, right: 0 }}
                      onDragEnd={handleDragEnd}
                      className="absolute left-1/2 -translate-x-1/2 top-4 touch-none select-none z-20"
                    >
                      <RunningCard
                        data={runningSchemes[index]}
                        active
                        onPay={() => handlePayNow(runningSchemes[index])}
                        onDownloadReceipt={handleDownloadReceipt}
                        isDraggingRef={isDraggingRef}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Ghost cards */}
                {index > 0 && runningSchemes[index - 1] && (
                  <div className="absolute lg:left-[10%] left-12 top-12 scale-95 opacity-50   pointer-events-none">
                    <RunningCard
                      data={runningSchemes[index - 1]}
                      active={false}
                      onPay={() => handlePayNow(runningSchemes[index - 1])}
                      onDownloadReceipt={handleDownloadReceipt}
                      isDraggingRef={isDraggingRef}
                    />
                  </div>
                )}
                {index < runningSchemes.length - 1 && runningSchemes[index + 1] && (
                  <div className="absolute lg:right-[10%] right-12 top-12 scale-95 opacity-50   pointer-events-none">
                    <RunningCard
                      data={runningSchemes[index + 1]}
                      active={false}
                      onPay={() => handlePayNow(runningSchemes[index + 1])}
                      onDownloadReceipt={handleDownloadReceipt}
                      isDraggingRef={isDraggingRef}
                    />
                  </div>
                )}

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
        </>
      )}

      <div className="h-12" />

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </main>
    </div>
  );
}