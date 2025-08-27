"use client";

import React from "react";
import Image from "next/image";
import { ChevronDown, DownloadCloud, CreditCard, Calendar, IndianRupee, Filter } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type CardBrand = "visa" | "mastercard";
type Status = "success" | "failed" | "pending";
type PayMethod = "card" | "upi" | "cash";

type Txn = {
  id: string;
  date: Date;
  bank: string;
  last4: string;
  brand: CardBrand;
  method: PayMethod;
  status: Status;
  amount: number; // in INR
};

const INR = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });

const seedTxns: Txn[] = [
  // Transactions will be loaded from API
  // Remove dummy data as requested
];

type Filters = {
  brand: "all" | CardBrand;
  status: "all" | Status;
  method: "all" | PayMethod;
  amount: "all" | "lt2000" | "2000-4000" | "gt4000";
  range: "all" | "30d" | "6m" | "1y";
};

const monthLabel = (d: Date) => d.toLocaleString("en-US", { month: "short" }).toUpperCase() + " '" + String(d.getFullYear()).slice(-2);

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3 h-9 text-sm text-white/90">
      {children}
    </div>
  );
}

export default function TransactionHistoryPage() {
  const [filters, setFilters] = React.useState<Filters>({ brand: "all", status: "all", method: "all", amount: "all", range: "all" });

  const filtered = React.useMemo(() => {
    return seedTxns.filter((t) => {
      if (filters.brand !== "all" && t.brand !== filters.brand) return false;
      if (filters.status !== "all" && t.status !== filters.status) return false;
      if (filters.method !== "all" && t.method !== filters.method) return false;
      if (filters.amount !== "all") {
        if (filters.amount === "lt2000" && !(t.amount < 2000)) return false;
        if (filters.amount === "2000-4000" && !(t.amount >= 2000 && t.amount <= 4000)) return false;
        if (filters.amount === "gt4000" && !(t.amount > 4000)) return false;
      }
      if (filters.range !== "all") {
        const now = new Date();
        const diffDays = (now.getTime() - t.date.getTime()) / 86400000;
        if (filters.range === "30d" && diffDays > 30) return false;
        if (filters.range === "6m" && diffDays > 30 * 6) return false;
        if (filters.range === "1y" && diffDays > 365) return false;
      }
      return true;
    });
  }, [filters]);

  // Group by month label
  const groups = React.useMemo(() => {
    const map = new Map<string, Txn[]>();
    filtered.forEach((t) => {
      const key = monthLabel(t.date);
      map.set(key, [...(map.get(key) || []), t]);
    });
    // sort by month desc
    return Array.from(map.entries()).sort((a, b) => new Date(b[1][0].date).getTime() - new Date(a[1][0].date).getTime());
  }, [filtered]);

  return (
    <div className="text-white space-y-4 md:space-y-6 rounded-[22px] p-3 sm:p-4 md:p-6 bg-black/40 overflow-x-hidden">
      <div className="flex items-center justify-between">
        <div className="text-xl sm:text-2xl font-semibold tracking-wide">Transaction History</div>
        <button className="h-9 w-9 grid place-items-center rounded-full bg-white/10 border border-white/15">
          <DownloadCloud className="h-4 w-4" />
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Chip>
          <Filter className="h-4 w-4" />
          <span>Filter</span>
          <ChevronDown className="h-4 w-4" />
        </Chip>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3 h-9 text-sm">
              <CreditCard className="h-4 w-4" />
              <span>Cards</span>
              <ChevronDown className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[160px]">
            <DropdownMenuItem onClick={() => setFilters((f) => ({ ...f, brand: "all" }))}>All</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilters((f) => ({ ...f, brand: "visa" }))}>VISA</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilters((f) => ({ ...f, brand: "mastercard" }))}>MasterCard</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3 h-9 text-sm">
              <span>Status</span>
              <ChevronDown className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[160px]">
            <DropdownMenuItem onClick={() => setFilters((f) => ({ ...f, status: "all" }))}>All</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilters((f) => ({ ...f, status: "success" }))}>Success</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilters((f) => ({ ...f, status: "pending" }))}>Pending</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilters((f) => ({ ...f, status: "failed" }))}>Failed</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3 h-9 text-sm">
              <span>Payment Method</span>
              <ChevronDown className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[180px]">
            <DropdownMenuItem onClick={() => setFilters((f) => ({ ...f, method: "all" }))}>All</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilters((f) => ({ ...f, method: "card" }))}>Card</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilters((f) => ({ ...f, method: "upi" }))}>UPI</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilters((f) => ({ ...f, method: "cash" }))}>Cash</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3 h-9 text-sm">
              <IndianRupee className="h-4 w-4" />
              <span>Amount</span>
              <ChevronDown className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[160px]">
            <DropdownMenuItem onClick={() => setFilters((f) => ({ ...f, amount: "all" }))}>All</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilters((f) => ({ ...f, amount: "lt2000" }))}>{"< ₹ 2,000"}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilters((f) => ({ ...f, amount: "2000-4000" }))}>₹ 2,000 – ₹ 4,000</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilters((f) => ({ ...f, amount: "gt4000" }))}>{"> ₹ 4,000"}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3 h-9 text-sm">
              <Calendar className="h-4 w-4" />
              <span>Date range</span>
              <ChevronDown className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[160px]">
            <DropdownMenuItem onClick={() => setFilters((f) => ({ ...f, range: "all" }))}>All time</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilters((f) => ({ ...f, range: "30d" }))}>Last 30 days</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilters((f) => ({ ...f, range: "6m" }))}>Last 6 months</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilters((f) => ({ ...f, range: "1y" }))}>Last year</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* List */}
      <div className="rounded-3xl bg-gradient-to-br from-stone-900/60 to-stone-950/60 border border-white/10 overflow-hidden">
        {groups.map(([label, items], gi) => (
          <div key={label + gi}>
            <div className="px-5 py-3 text-xs tracking-wide text-white/60 border-t border-white/5 first:border-t-0">
              {label}
            </div>
            {items
              .sort((a, b) => b.date.getTime() - a.date.getTime())
              .map((t, idx) => (
                <div key={t.id} className="flex items-center justify-between px-5 py-5 bg-white/[0.02] hover:bg-white/[0.04] transition border-t border-white/5 first:border-t-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-white/10 grid place-items-center overflow-hidden">
                      {t.brand === "visa" ? (
                        <Image src="/images/pay/visa.png" width={26} height={26} alt="Visa" />
                      ) : (
                        <Image src="/images/pay/mastercard.png" width={26} height={26} alt="MasterCard" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{t.bank} •• {t.last4}</div>
                      <div className="text-xs text-white/70">
                        {t.date.toLocaleString("en-US", { day: "numeric" })}
                        {" "}
                        {t.date.toLocaleString("en-US", { month: "short" }).toLowerCase()}
                        {" "}
                        {t.date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).toLowerCase()}
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 font-semibold">{INR.format(t.amount)}</div>
                </div>
              ))}
          </div>
        ))}
      </div>

      {/* Footer providers */}
      <div className="flex items-center justify-center gap-4 text-white/50 text-xs pt-2">
        <span className="tracking-wider">POWERED BY</span>
        <div className="flex items-center gap-3">
          <Image src="/images/pay/gpay.png" width={44} height={20} alt="GPay" />
          <Image src="/images/pay/rupay.svg" width={44} height={20} alt="RuPay" />
          <Image src="/images/pay/visa.png" width={44} height={20} alt="Visa" />
          <Image src="/images/pay/mastercard.png" width={44} height={20} alt="MasterCard" />
        </div>
      </div>
    </div>
  );
}
