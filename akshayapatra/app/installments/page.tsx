"use client";

import React from "react";
import {
  CreditCard,
  Smartphone,
  CircleDollarSign,
  Lock,
  ChevronRight,
  Check,
  Circle,
  Loader2,
} from "lucide-react";

import SemiCircularProgress from "@/app/components/general/SemiCircularProgress";
import { Button } from "@/components/ui/button";

type PaymentMethodKey = "cash" | "gpay" | "mc_8897" | "mc_6548" | "card";

const paymentMethods: { key: PaymentMethodKey; label: string; sub?: string; icon: React.ReactNode }[] = [
  { key: "cash", label: "Pay with Cash", sub: "Pay Cash to our agent", icon: <CircleDollarSign className="h-4 w-4" /> },
  { key: "gpay", label: "Google Pay", sub: "Pay with any UPI app", icon: <Smartphone className="h-4 w-4" /> },
  { key: "mc_8897", label: "Mastercard • 8897", sub: "01/26", icon: <CreditCard className="h-4 w-4" /> },
  { key: "mc_6548", label: "MasterCard • 6548", sub: "03/31", icon: <CreditCard className="h-4 w-4" /> },
  { key: "card", label: "Add credit card", sub: "Add new credit or debit card", icon: <CreditCard className="h-4 w-4" /> },
];

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl bg-[radial-gradient(156.78%_167.36%_at_120.85%_-31.14%,_#EE6200_0%,_#8A3901_51.75%,_#371701_100%)]  backdrop-blur-xl shadow-xl shadow-black/30 ${className}`}>
      {children}
    </div>
  );
}

function OrangeCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`
        rounded-3xl
        bg-[var(--Eclips-3604,_linear-gradient(180deg,_#EE6200_0%,_#883800_100%))]
        backdrop-blur-xl shadow-xl shadow-black/30
        ${className}
      `}
    >
      {children}
    </div>
  );
}

function GradientCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-3xl  backdrop-blur-xl shadow-xl shadow-black/30 ${className}`}
      style={{
        backgroundImage: "linear-gradient(to top, #090300, #351603, #6E2B00, #CA5002)",
      }}
    >
      {children}
    </div>
  );
}

function StatBadge({ label, tone = "success" }: { label: string; tone?: "success" | "warn" | "muted" }) {
  const tones: Record<string, string> = {
    success: "bg-green-500/20 text-green-300 border-green-400/30",
    warn: "bg-amber-500/15 text-amber-300 border-amber-400/30",
    muted: "bg-white/10 text-white/80 border-white/20",
  };
  return <span className={`px-2 py-0.5 rounded-md text-[11px] border ${tones[tone]}`}>{label}</span>;
}

// ---- Types for API data ----
type CardRecord = {
  id: string;
  scheme_id: string;
  total_payments_made: number; // number of installments already paid
};

type Scheme = {
  total_installments: number;
  subscription_amount: number; // per-installment amount
};

export default function InstallmentsPage() {
  const [selected, setSelected] = React.useState<PaymentMethodKey>("cash");

  // Cards + scheme selection state
  const [cards, setCards] = React.useState<CardRecord[]>([]);
  const [loadingCards, setLoadingCards] = React.useState<boolean>(false);
  const [cardsError, setCardsError] = React.useState<string | null>(null);

  const [selectedCardId, setSelectedCardId] = React.useState<string>("");
  const [scheme, setScheme] = React.useState<Scheme | null>(null);
  const [loadingScheme, setLoadingScheme] = React.useState<boolean>(false);
  const [schemeError, setSchemeError] = React.useState<string | null>(null);

  const selectedCard = React.useMemo<CardRecord | null>(() => {
    if (!Array.isArray(cards)) return null;
    for (let i = 0; i < cards.length; i++) {
      if (cards[i]?.id === selectedCardId) return cards[i];
    }
    return null;
  }, [cards, selectedCardId]);

  // Fetch cards on mount
  React.useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function loadCards() {
      try {
        setLoadingCards(true);
        setCardsError(null);
        const res = await fetch("/api/cards", { signal: controller.signal });
        if (!res.ok) throw new Error(`Failed to fetch cards (${res.status})`);
        const raw = await res.json();
        const arr =
        Array.isArray(raw) ? raw :
        Array.isArray(raw?.cards) ? raw.cards :
        Array.isArray(raw?.data) ? raw.data :
        [];
        console.log(arr);
        console.log(raw);
        
        setCards(arr);
if (arr.length > 0) setSelectedCardId(arr[0].id);

       
        
      } catch (err: any) {
        if (err?.name !== "AbortError") setCardsError(err?.message || "Failed to load cards.");
      } finally {
        if (isMounted) setLoadingCards(false);
      }
    }

    loadCards();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  // Fetch scheme when selected card changes
  React.useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function loadScheme(schemeId: string) {
      try {
        setLoadingScheme(true);
        setSchemeError(null);
        const res = await fetch(`/api/schemes/${schemeId}`);
        const json = await res.json();
        if (!res.ok || !json?.success || !json?.scheme) {
          throw new Error(json?.error || `Failed to fetch scheme (${res.status})`);
        }
        const s = json.scheme as { total_installments: number; subscription_amount: number };
        setScheme({
          total_installments: Number(s.total_installments) || 0,
          subscription_amount: Number(s.subscription_amount) || 0,
        });
      } catch (err: any) {
        setScheme(null);
        setSchemeError(err?.message || "Failed to load scheme.");
      } finally {
        setLoadingScheme(false);
      }
    }

    if (selectedCard?.scheme_id) {
      loadScheme(selectedCard.scheme_id);
    } else {
      setScheme(null);
    }

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [selectedCard?.scheme_id]);

  // Derived values for progress + amounts
  const totalInstallments = scheme?.total_installments ?? 0;
  const subscriptionAmount = scheme?.subscription_amount ?? 0;
  const totalPaymentsMade = selectedCard?.total_payments_made ?? 0;

  const totalAmount = totalInstallments * subscriptionAmount;
  const paidAmount = totalPaymentsMade * subscriptionAmount;
  const remainingAmount = Math.max(totalAmount - paidAmount, 0);

  const formatINR = (n: number) =>
    `₹ ${Math.round(n).toLocaleString("en-IN")}`;

  const progressIsReady = !!selectedCard && !!scheme && totalInstallments > 0;

  return (
    <div className="text-white space-y-4 md:space-y-6 rounded-[22px] lg:p-3 p-0 md:p-6 overflow-x-hidden">
      {/* Header + Card selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ml-3 mt-1">
        <div className="text-xl sm:text-2xl font-semibold tracking-wide">Instalments</div>

        <div className="flex items-center gap-2 mr-3">
          <label htmlFor="card-select" className="text-white/70 text-sm">
            Select Card
          </label>
          <div className="relative">
            <select
              id="card-select"
              className="appearance-none h-9 rounded-xl bg-black/50 border border-white/20 pr-8 pl-3 text-sm text-white/90 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              value={selectedCardId}
              onChange={(e) => setSelectedCardId(e.target.value)}
              disabled={loadingCards || !!cardsError || cards.length === 0}
            >
              {loadingCards && <option>Loading...</option>}
              {!loadingCards && cards.length === 0 && <option>No cards found</option>}
              {!loadingCards &&
                cards.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id}
                  </option>
                ))}
            </select>
            <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-white/60">
              {loadingCards ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>▾</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Any fetch errors */}
      {(cardsError || schemeError) && (
        <div className="ml-3 mr-3 rounded-xl border border-amber-400/30 bg-amber-500/10 text-amber-200 text-sm px-3 py-2">
          {cardsError ? `Cards: ${cardsError}` : `Scheme: ${schemeError}`}
        </div>
      )}

      {/* Top area */}
      <div className="grid grid-cols-12 gap-4">
        {/* Progress card */}
        <GradientCard className="col-span-12 lg:col-span-7 p-6">
          <div className="flex items-center gap-2 text-white/90 text-sm">
            <span className="h-6 w-6 grid place-items-center rounded-full bg-white/10 border border-white/20">⏱</span>
            <span>Instalment progress</span>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="col-span-1 md:col-span-2">
              <div className="mx-auto w-full max-w-[260px] sm:max-w-[320px]">
                <SemiCircularProgress
                  value={progressIsReady ? totalPaymentsMade : 0}
                  total={progressIsReady ? totalInstallments : 100}
                  segments={24}
                  radius={140}
                  thickness={28}
                  gapDegrees={6}
                  variant="exact"
                  className=""
                />
              </div>
              {!progressIsReady && (
                <div className="mt-3 text-center text-xs text-white/60">
                  {loadingCards || loadingScheme
                    ? "Loading progress..."
                    : "Select a card to view progress"}
                </div>
              )}
            </div>

            <div className="col-span-1 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/80">Paid</span>
                <span className="font-medium">{progressIsReady ? formatINR(paidAmount) : "—"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/80">Remaining</span>
                <span className="font-medium">{progressIsReady ? formatINR(remainingAmount) : "—"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/80">Installments Remaining</span>
                <span className="font-medium">{progressIsReady ? totalInstallments - totalPaymentsMade : "—"}</span>
              </div>
            </div>
          </div>
        </GradientCard>

        {/* Payment methods + price */}
        <Card className="col-span-12 lg:col-span-5 p-0 overflow-hidden">
          {/* Apply MPIN */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <div className="flex items-center gap-2 text-white/90">
              <div className="h-8 w-8 grid place-items-center rounded-md bg-white/10 border border-white/20">
                <Lock className="h-4 w-4" />
              </div>
              <span className="text-sm">Apply MPIN</span>
            </div>
            <button className="text-white/80 text-sm">›</button>
          </div>

          {/* Methods + Price side-by-side on large screens */}
          <div className="px-5 py-4 grid gap-4 lg:grid-cols-2 lg:items-start">
            {/* Method list */}
            <div className="grid gap-3 lg:max-h-[420px] lg:overflow-auto pr-1">
              {paymentMethods.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setSelected(m.key)}
                  className="flex items-center justify-between rounded-2xl bg-white/5 border border-white/10 px-3 py-3 hover:bg-white/10 transition"
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className="h-9 w-9 grid place-items-center rounded-xl bg-black/40 border border-white/10">
                      {m.icon}
                    </div>
                    <div>
                      <div className="text-sm font-medium leading-tight">{m.label}</div>
                      {m.sub && <div className="text-xs text-white/60">{m.sub}</div>}
                    </div>
                  </div>
                  <div className="h-5 w-5 rounded-full border border-white/30 grid place-items-center">
                    {selected === m.key ? (
                      <Check className="h-3.5 w-3.5 text-amber-400" />
                    ) : (
                      <Circle className="h-3.5 w-3.5 text-white/20" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Price details (left static unless you want it dynamic too) */}
            <div className="pb-5 lg:pb-0 lg:self-start">
              <div className="rounded-2xl bg-black/60 border border-white/10">
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <div className="font-medium">
                    Price Details{" "}
                    <span className="text-white/60 text-sm">(3 items)</span>
                  </div>
                </div>
                <div className="p-4 space-y-2 text-sm">
                  <Row label="Total" value="₹ 3000" />
                  <Row label="MPIN" value={<span className="text-white/80">Apply</span>} />
                  <Row label="Applicable GST 18%" value="₹ 180" />
                  <Row label="Platform Fee" value="₹ 20" />
                  <div className="h-px bg-white/10 my-2" />
                  <Row label="Sub Total" value="₹ 3200" bold />
                </div>
              </div>
              <button
                className="mt-4 w-full h-11 rounded-full text-white font-medium
                   border border-transparent border-t-white border-l-white
                   [background:linear-gradient(180deg,_#EE6200_0%,_#883800_100%)]
                   backdrop-blur-[30px]
                    [box-shadow:-4.5px_-4.5px_1.5px_-5.25px_rgba(255,255,255,0.5)_inset,
                 4.5px_4.5px_1.5px_-5.25px_rgba(255,255,255,0.5)_inset,
                 3px_4.5px_1.5px_-3px_rgba(179,179,179,0.2)_inset,
                -3px_-4.5px_1.5px_-3px_#B3B3B3_inset,
                 0_0_33px_0_rgba(242,242,242,0.5)_inset]"
              >
                pay
              </button>
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom area */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left: instalment cards */}
        <div className="col-span-12 lg:col-span-7 space-y-3">
          {[0, 1, 2, 3].map((idx) => (
            <Card key={idx} className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-white/15 overflow-hidden grid place-items-center text-xs">JD</div>
                  <div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-white/90">John Doe</span>
                      {idx === 0 ? (
                        <StatBadge label="Paid" tone="success" />
                      ) : idx === 1 ? (
                        <StatBadge label="Unpaid" tone="warn" />
                      ) : (
                        <StatBadge label="On Progress" tone="muted" />
                      )}
                    </div>
                    <div className="text-[11px] text-white/60">
                      ID <span className="text-white/80">AA0002</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 text-sm w-full">
                  <div>
                    <div className="text-white/60">Instalment Amount</div>
                    <div className="font-semibold">₹ 2,599</div>
                  </div>
                  <div>
                    <div className="text-white/60">Due Date</div>
                    <div className="font-semibold">20-05-2025</div>
                  </div>
                  <div className="sm:text-right">
                    <div className="text-white/60">Closing Date</div>
                    <div className="font-semibold">20-05-2025</div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Right: month history */}
        <div className="col-span-12 lg:col-span-5 space-y-4">
          {[0, 1, 2].map((m) => (
            <OrangeCard key={m} className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold">May Month</div>
                </div>
                <button className="h-8 w-8 grid place-items-center rounded-full bg-white/10">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-4 hidden sm:grid grid-cols-12 text-sm text-white/80">
                <div className="col-span-5">Date</div>
                <div className="col-span-3">Amount</div>
                <div className="col-span-4">Payment Reference No</div>
              </div>
              <div className="mt-2 hidden sm:grid grid-cols-12 items-center text-sm">
                <div className="col-span-5">20 May 2025</div>
                <div className="col-span-3">₹ 1180</div>
                <div className="col-span-4 text-white/80">CWIP&611190</div>
              </div>
              {/* Mobile stacked layout */}
              <div className="mt-2 sm:hidden text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-white/60">Date</span>
                  <span>20 May 2025</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Amount</span>
                  <span>₹ 1180</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Payment Ref</span>
                  <span className="text-white/80">CWIP&611190</span>
                </div>
              </div>
            </OrangeCard>
          ))}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold = false }: { label: string; value: React.ReactNode; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/70 text-sm">{label}</span>
      <span className={bold ? "font-semibold" : "text-white/90"}>{value}</span>
    </div>
  );
}