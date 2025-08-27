"use client";

import React from "react";
import { Settings, ChevronRight, CircleCheck } from "lucide-react";
import { PageLoaderOverlay } from "@/app/components/general/PageLoader";

type Transaction = {
  id: string;
  title: string;
  cardLast4: string;
  when: string;
  amount: number; // positive for debit in UI sample
};

function classNames(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

const baseTransactions: Transaction[] = [
  { id: "t1", title: "Transfer to Kishor..", cardLast4: "5633", when: "16 Sep 2023 11:21 AM", amount: 9000 },
  { id: "t2", title: "Transfer to card", cardLast4: "5633", when: "16 Sep 2023 11:21 AM", amount: 4500 },
  { id: "t3", title: "Transfer to card", cardLast4: "5633", when: "16 Sep 2023 11:21 AM", amount: 3400 },
];

const payments = [
  { id: "gpay", name: "GPay", src: "/images/pay/gpay.svg" },
  { id: "rupay", name: "RuPay", src: "/images/pay/rupay.png" },
  { id: "visa", name: "VISA", src: "/images/pay/visa.png" },
  { id: "mc1", name: "Mastercard", src: "/images/pay/mastercard.svg" },
  { id: "mc2", name: "Mastercard2", src: "/images/pay/mastercard2.svg" },
];

export default function WalletPage() {
  const [isLoading, setIsLoading] = React.useState(true);
  
  // Simulate loading for wallet data
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const transactions = React.useMemo<Transaction[]>(() => {
    const items: Transaction[] = [];
    for (let i = 0; i < 40; i += 1) {
      const t = baseTransactions[i % baseTransactions.length];
      items.push({ ...t, id: `${t.id}-${i}` });
    }
    return items;
  }, []);

  const walletImageSrc = "/images/pay/wallet.png";

  return (
    <div className="relative">
      {/* Loading Overlay */}
      {isLoading && (
        <PageLoaderOverlay 
          text="W A L L E T" 
          duration={1.5}
        />
      )}
      
    <div
    className="rounded-2xl overflow-hidden   
               border-[3px] border-transparent
               [border-image:linear-gradient(135deg,#EE6200,#8A3901,#371701)_1]"
  >
    <main
      className="min-h-screen w-full text-white/90"
      
    >
      {/* Header */}
      <div className="mx-auto max-w-7xl px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">Wallet</h2>
          </div>
          <button className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl  pb-6 grid grid-cols-12 gap-5">
        {/* Left column: balance and add money */}
        <div className="col-span-12 md:col-span-5 lg:col-span-5">
          <div className="rounded-3xl ">
            <div className="flex items-center gap-5">
              <div className="relative w-full max-w-[340px]">
                <img
                  src={walletImageSrc}
                  alt="Wallet"
                  className="w-full h-auto rounded-2xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.45)]"
                />
                <div className="absolute left-8 inset-0 flex items-center justify-center">
                  <div className="text-center drop-shadow">
                    <div className="text-2xl sm:text-3xl font-semibold">₹ 1,180</div>
                    <div className="text-white/80 text-xs sm:text-sm">Wallet Balance</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-3 inline-block text-[11px] px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70">
              Current Limit is ₹10,000
            </div>

            <div className="mt-8 lg:px-0 px-5">
              <p className="text-sm text-white/80 mb-3">Add money to your wallet using</p>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {payments.map((pm) => (
                  <div key={pm.id} className="h-12 rounded-xl bg-white text-stone-900 grid place-items-center text-xs font-medium overflow-hidden">
                    {/* When images are added to public, they will render. Text acts as fallback. */}
                    <img src={pm.src} alt={pm.name} className="h-full w-full object-contain p-2" />
                    <span className="sr-only">{pm.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right column: transactions */}
        <div className="col-span-12 md:col-span-7 lg:col-span-7">
          <div className="rounded-3xl bg-gradient-to-br from-stone-900/60 to-stone-950/60 border border-white/10 backdrop-blur-xl p-0 overflow-hidden">
            <div className="px-6 pt-5 pb-3 border-b border-white/10">
              <h3 className="text-lg font-semibold">Recent Transactions</h3>
            </div>
            <div className="max-h-[480px] overflow-y-auto no-scrollbar divide-y divide-white/5">
              {transactions.map((t) => (
                <div key={t.id} className="px-6 py-4 flex items-center gap-3">
                  {/* Avatar */}
                  <div className="h-10 w-10 rounded-full bg-white/15 grid place-items-center text-xs font-medium">JD</div>
                  {/* Title + meta */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{t.title}</p>
                    <div className="flex items-center gap-2 text-white/60 text-[11px] mt-0.5">
                      <CircleCheck className="w-3.5 h-3.5" />
                      <span>{t.when}</span>
                    </div>
                  </div>
                  {/* Right side: brand + last4 + amount */}
                  <div className="hidden sm:flex items-center gap-2 text-xs text-white/70 mr-4">
                    {/* Simple Mastercard-like symbol */}
                    <div className="relative w-6 h-4">
                      <span className="absolute left-0 top-0 w-3.5 h-3.5 rounded-full bg-orange-500/80" />
                      <span className="absolute right-0 top-0 w-3.5 h-3.5 rounded-full bg-amber-600/80" />
                    </div>
                    <span>{t.cardLast4}</span>
                  </div>
                  <div className="text-right whitespace-nowrap">
                    <div className="font-semibold">₹ {t.amount.toLocaleString("en-IN")}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/40 ml-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom actions */}
      <div className="mx-auto max-w-7xl px-5 pb-10 flex items-center justify-center gap-6">
        <button className="px-8 py-3 rounded-2xl bg-gradient-to-b from-orange-600 to-amber-800 text-white font-medium shadow-lg shadow-black/30">
          Add Money
        </button>
        <button className="px-8 py-3 rounded-2xl bg-black/40 border border-white/15 text-white hover:bg-black/50">
          Withdraw
        </button>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </main>
    </div>
    </div>
  );
}
