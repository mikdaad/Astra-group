"use client"

import React from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Settings,
  ShieldBan,
  CreditCard,
  Upload,
  ChevronRight,
  Lock,
  Phone,
  QrCode,
  Landmark,
  ArrowLeftRight as ArrowLeftRightIcon,
  Contact2,
  List,
  Send,
} from "lucide-react"
import { BankAccountCard } from "@/app/components/card/bankaccountcard"
import { createClient as createSupabaseClient } from "@/utils/supabase/client"
import { useDirtyFlags } from "@/app/hooks/useDirtyFlags"
import { ls } from "@/lib/local"
import { getCardTransactionsPage, issueCard, type TransactionRow } from "@/app/lib/rpc"

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "solid" | "ghost" | "soft" | "outline"
  size?: "sm" | "md" | "lg" | "icon"
}

const Button: React.FC<ButtonProps> = ({
  className = "",
  variant = "soft",
  size = "md",
  children,
  ...props
}) => {
  const base =
    "inline-flex items-center justify-center rounded-2xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-400 disabled:opacity-50 disabled:cursor-not-allowed"
  const sizes = {
    sm: "h-8 px-3 text-xs gap-1",
    md: "h-10 px-4 text-sm gap-2",
    lg: "h-12 px-6 text-base gap-2",
    icon: "h-10 w-10",
  }
  const variants = {
    solid:
      "bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-900/20 hover:brightness-[1.05]",
    ghost: "bg-transparent hover:bg-white/5 text-white",
    soft: "bg-white/10 text-white/90 hover:bg-white/15 backdrop-blur",
    outline: "border border-white/20 text-white hover:bg-white/10",
  }
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = "", children, ...props }) => (
  <div
    className={`rounded-3xl bg-gradient-to-br from-stone-900/60 to-stone-950/60 border border-white/10 backdrop-blur-xl shadow-xl shadow-black/30 ${className}`}
    {...props}
  >
    {children}
  </div>
)

const Raadialgcard: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = "",
  children,
  ...props
}) => (
  <div
    className={`rounded-3xl bg-[radial-gradient(156.78%_167.36%_at_120.85%_-31.14%,_#EE6200_0%,_#8A3901_51.75%,_#371701_100%)] ${className}`}
    {...props}
  >
    {children}
  </div>
)

const SectionTitle: React.FC<{ title: string; subtitle?: string; right?: React.ReactNode }> = ({
  title,
  subtitle,
  right,
}) => (
  <div className="flex items-end justify-between gap-4">
    <div>
      <h3 className="text-white text-lg md:text-xl font-semibold leading-tight">{title}</h3>
      {subtitle && <p className="text-white/60 text-xs mt-0.5">{subtitle}</p>}
    </div>
    {right}
  </div>
)

function formatINR(n: number | string | null | undefined) {
  const num = Number(n ?? 0) || 0
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num)
}

const colorPalettes = [
  { paint0: "#0D1B2A", paint1: "#143e67", paint2: "#0b2e4f", paint3: "#0b2e4f", paint4: "#0F2A44", paint5: "#102A43" },
  { paint0: "#0C3D1E", paint1: "#1b6b3a", paint2: "#155d31", paint3: "#155d31", paint4: "#135228", paint5: "#0F3F20" },
  { paint0: "#2A0E16", paint1: "#551D2C", paint2: "#6A2336", paint3: "#6A2336", paint4: "#3F121F", paint5: "#2B0C15" },
  { paint0: "#1F2A44", paint1: "#2C3E72", paint2: "#23365F", paint3: "#23365F", paint4: "#1A2743", paint5: "#141E34" },
  { paint0: "#47340E", paint1: "#6B4B16", paint2: "#5C4113", paint3: "#5C4113", paint4: "#3A280C", paint5: "#2A1D09" },
]

// Reuse the exact data structure from /transfers for visual parity
const recentContacts = [
  { key: 1, name: "James", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200" },
  { key: 2, name: "Richard", avatarUrl: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=200" },
  { key: 3, name: "Thomas", avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200" },
  { key: 4, name: "Jennifer", avatarUrl: "https://images.unsplash.com/photo-1548142813-c348350df52b?q=80&w=200" },
  { key: 5, name: "Linda", avatarUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=200" },
  { key: 6, name: "Daniel", avatarUrl: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=200" },
  { key: 7, name: "Richard", avatarUrl: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=200" },
  { key: 8, name: "Thomas", avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200" },
  { key: 9, name: "Jennifer", avatarUrl: "https://images.unsplash.com/photo-1548142813-c348350df52b?q=80&w=200" },
  { key: 10, name: "Linda", avatarUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=200" },
]

const quickActions = [
  { label: "Bank transfer", href: "#", icon: Landmark },
  { label: "Card to card", href: "#", icon: ArrowLeftRightIcon },
  { label: "Between cards", href: "#", icon: CreditCard },
  { label: "Phone number", href: "#", icon: Phone },
  { label: "Contact transfer", href: "#", icon: Contact2 },
  { label: "Scan QR", href: "#", icon: QrCode },
]

export default function CardsPage() {
  const router = useRouter()
  const sendFriends = recentContacts.slice(0, 8)
  const [selectedFriendIdx, setSelectedFriendIdx] = React.useState(0)
  const scrollerRef = React.useRef<HTMLDivElement | null>(null)
  const supabase = createSupabaseClient()
  const { flags, acknowledge } = useDirtyFlags()

  type UserCard = {
    id: string
    cardholder_name?: string | null
    phone_number?: string | null
    total_wallet_balance?: number | string | null
  }
  const [cards, setCards] = React.useState<UserCard[]>(() => ls.get<UserCard[]>("cards:cardsCache", []))

  const [recentTx, setRecentTx] = React.useState<TransactionRow[]>(() =>
    ls.get<TransactionRow[]>("cards:recentTx", []),
  )

  const [isIssuing, setIsIssuing] = React.useState(false)
  const [cardsLoading, setCardsLoading] = React.useState(false)
  const [recentTxLoading, setRecentTxLoading] = React.useState(false)
  const [isInitialLoading, setIsInitialLoading] = React.useState(true)
  async function loadCards() {
    try {
      setCardsLoading(true)
      const res = await fetch("/api/cards?limit=20", { credentials: "include", cache: "no-store" })
      const json = (await res.json().catch(() => ({}))) as { cards?: UserCard[] }
      const list = Array.isArray(json?.cards) ? (json.cards as UserCard[]) : []
      setCards(list)
      ls.set("cards:cardsCache", list)
    } finally {
      setCardsLoading(false)
    }
  }

  async function loadRecentTx(cardId?: string) {
    const targetCard = cardId || cards[0]?.id
    if (!targetCard) {
      setRecentTx([])
      ls.set("cards:recentTx", [])
      return
    }
    try {
      setRecentTxLoading(true)
      const rows = await getCardTransactionsPage({ cardId: targetCard, limit: 5, onlyCompleted: true }, supabase)
      setRecentTx(rows)
      ls.set("cards:recentTx", rows)
    } finally {
      setRecentTxLoading(false)
    }
  }

  async function handleIssueCardClick() {
    try {
      setIsIssuing(true)
      const { data: userData, error: userErr } = await supabase.auth.getUser()
      if (userErr || !userData?.user?.id) {
        alert("Please sign in again to issue a card.")
        return
      }
      const userId = userData.user.id
      const schemeId = process.env.NEXT_PUBLIC_DEFAULT_SCHEME_ID as string | undefined
      if (!schemeId) {
        alert("Configuration error: Missing default scheme.")
        return
      }
      await issueCard(
        {
          userId,
          schemeId,
          paymentMethod: "upi_mandate",
          setAsCommissionDestination: false,
          cardholderName: null,
          phone: null,
        },
        supabase,
      )

      const res = await fetch("/api/initiatepayment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      })
      const json = await res.json().catch(() => ({}))
      if (!json?.redirectUrl) {
        alert("Failed to start payment. Please try again.")
        return
      }
      window.location.assign(json.redirectUrl as string)
    } finally {
      setIsIssuing(false)
    }
  }

  // Auto-highlight the avatar that's nearest to the center while swiping
  React.useEffect(() => {
    const el = scrollerRef.current
    if (!el) return

    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const { left, width } = el.getBoundingClientRect()
        const centerX = left + width / 2
        let bestIdx = 0
        let bestDist = Number.POSITIVE_INFINITY
        el.querySelectorAll("[data-avatar]")?.forEach((node, idx) => {
          const r = (node as HTMLElement).getBoundingClientRect()
          const nodeCenter = r.left + r.width / 2
          const dist = Math.abs(nodeCenter - centerX)
          if (dist < bestDist) {
            bestDist = dist
            bestIdx = idx
          }
        })
        setSelectedFriendIdx(bestIdx)
      })
    }

    el.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      el.removeEventListener("scroll", onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  // Initial load
  React.useEffect(() => {
    void loadCards().then(() => loadRecentTx()).then(() => {
      // Set loading to false immediately after data loads
      setIsInitialLoading(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // React to dirty flags
  React.useEffect(() => {
    const need = flags.transactions || flags.referral || flags.referral2
    if (!need) return
    ;(async () => {
      await loadCards()
      await loadRecentTx()
      await acknowledge()
    })()
  }, [flags, acknowledge])

  const active = {
    userName: "John Doe",
    userId: "AA0002",
    email: "johndoe@gmail.com",
    referralId: "RR0001",
    pan: "xx00xx0987",
    aadhaar: "0000 0000 0000",
  }

  // Note: Removed duplicate loading overlay as loading.tsx already handles initial page loading
  // Only show loading for specific async operations (cards/transactions)
  const isDataLoading = cardsLoading || recentTxLoading

  return (
    <div className="text-white space-y-4 md:space-y-6 rounded-[22px] sm:p-4 md:p-6 overflow-x-hidden relative">
      {/* Top row: account cards + recent transactions */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-7 space-y-3">
          <div
            className="
              mt-2
              col-span-12 lg:col-span-9
              flex overflow-x-auto overflow-y-visible
              snap-x snap-mandatory scroll-smooth
              md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible
              gap-0 md:gap-4
              scroll-px-4
              pb-6
              hide-scrollbar-mobile hscroll-gutter
              [&>div]:shrink-0
              [&>div]:snap-start
              [&>div]:w-[88%]
              sm:[&>div]:w-[82%]
              md:[&>div]:w-auto
            "
          >
            {cardsLoading ? (
              <div className="relative p-0 bg-transparent shrink-0 w-full snap-center md:w-auto">
                <Card className="p-5 text-white rounded-3xl bg-gradient-to-br from-stone-900/60 to-stone-950/60 border border-white/10">
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    <span className="ml-3 text-white/80">Loading cards...</span>
                  </div>
                </Card>
              </div>
            ) : cards.length > 0 ? (
              cards.map((c, idx) => (
                <div key={c.id} className="relative p-0 bg-transparent shrink-0 w-full snap-center md:w-auto">
                  <BankAccountCard
                    userName={c.cardholder_name || "My Card"}
                    balance={formatINR(c.total_wallet_balance)}
                    phoneNumber={c.phone_number || ""}
                    userId={c.id}
                    fillColors={colorPalettes[idx % colorPalettes.length]}
                  />
                  {idx === cards.length - 1 && (
                    <button
                      aria-label="Issue new card"
                      disabled={isIssuing}
                      onClick={handleIssueCardClick}
                      className="absolute top-1/2 -translate-y-1/2 right-3 md:-right-3 h-10 w-10 rounded-full bg-gradient-to-b from-orange-600 to-amber-800 grid place-items-center shadow-lg shadow-orange-900/30 hover:brightness-105"
                    >
                      <span className="text-white text-xl leading-none">{isIssuing ? "…" : "+"}</span>
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="relative p-0 bg-transparent shrink-0 w-full snap-center md:w-auto">
                <Card className="p-5 text-white rounded-3xl bg-gradient-to-br from-stone-900/60 to-stone-950/60 border border-white/10">
                  <p className="text-white/80 mb-2">You don’t have any cards yet.</p>
                  <Button onClick={handleIssueCardClick} disabled={isIssuing}>
                    {isIssuing ? "Starting payment…" : "Issue new card"}
                  </Button>
                </Card>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {[
              { icon: Settings, label: "Settings" },
              { icon: ShieldBan, label: "Freeze" },
              { icon: Lock, label: "Block" },
              { icon: Upload, label: "Top Up" },
              { icon: CreditCard, label: "Card Details" },
              { icon: ArrowLeftRightIcon, label: "Pay" },
            ].map((a) => (
              <ActionTile key={a.label} label={a.label}>
                <a.icon className="w-5 h-5 text-white" />
              </ActionTile>
            ))}
          </div>
        </div>

        <Raadialgcard className="col-span-12 lg:col-span-5 p-5 space-y-4 z-10">
          <SectionTitle title="Recent Transactions" />
          <div className="space-y-3">
            {recentTxLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span className="ml-3 text-white/80 text-sm">Loading transactions...</span>
              </div>
            ) : (
              <>
                {recentTx.map((t) => (
                  <div key={t.id} className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                    <div className="h-10 w-10 rounded-full bg-white/20 grid place-items-center text-xs">
                      {String(t.description ?? t.tx_type ?? "U").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{t.description ?? t.tx_type}</p>
                      <p className="text-white/60 text-xs">{new Date(t.created_at).toLocaleString("en-IN")}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatINR(t.amount)}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-white/40" />
                  </div>
                ))}
                {recentTx.length === 0 && <div className="text-white/60 text-sm">No recent transactions.</div>}
              </>
            )}
          </div>
        </Raadialgcard>
      </div>

      {/* Middle: Transfers (reuse-style) + Send Money */}
      <div className="grid grid-cols-12 gap-4">
        <Raadialgcard className="col-span-12 lg:col-span-7 p-5">
          {/* Total balance */}
          <div className="text-white/90">
            <div className="text-sm">Total balance</div>
            <div className="text-3xl sm:text-4xl font-semibold tracking-wide">
              {formatINR(cards.reduce((sum, c) => sum + Number(c.total_wallet_balance ?? 0), 0))}
            </div>
          </div>

          {/* Search */}
          <div className="mt-5">
            <div className="flex items-center gap-3 rounded-full bg-white/10 border border-white/10 px-4 py-3 text-white">
              <Search className="w-5 h-5 text-white/80" />
              <input
                type="text"
                placeholder="Search"
                className="w-full bg-transparent outline-none placeholder:text-white/70 text-sm"
              />
            </div>
          </div>

          {/* Recent contacts */}
          <div className="mt-6">
            <div className="text-white/90 text-sm mb-3">Recent</div>
            <div className="flex items-start gap-6 overflow-x-auto pb-2 pr-2">
              {recentContacts.map((contact) => (
                <div key={contact.key} className="shrink-0 text-center text-white">
                  <div className="relative">
                    <img src={contact.avatarUrl} alt={contact.name} className="h-16 w-16 rounded-full object-cover" />
                    <span className="absolute bottom-1 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-[#241006]" />
                  </div>
                    <div className="mt-2 text-sm">{contact.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Card number transfer */}
          <div className="mt-6 text-white">
            <div className="text-sm mb-2">Transfer by card number</div>
            <div className="flex items-center gap-2 rounded-full bg-black/60 border border-white/10 px-4 py-3">
              <input
                type="text"
                placeholder="Enter card number"
                className="w-full bg-transparent outline-none placeholder:text-white/70 text-sm text-white"
              />
              <button type="button" className="h-8 w-8 grid place-items-center rounded-full bg-white/10" aria-label="Actions">
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick actions */}
          <div className="mt-10 grid grid-cols-3 sm:grid-cols-6 gap-6 text-white">
            {quickActions.map(({ label, href, icon: Icon }) => (
              <a key={label} href={href} className="group flex flex-col items-center gap-3">
                <div className="h-12 w-12 rounded-full grid place-items-center border border-amber-500/70 text-amber-400 group-hover:bg-amber-500/10">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-xs text-white/90 text-center leading-tight">{label}</div>
              </a>
            ))}
          </div>
        </Raadialgcard>

        <Raadialgcard className="col-span-12 lg:col-span-5 p-5 space-y-4">
          <SectionTitle title="Send Money" />
          <div className="grid grid-cols-12 gap-4 items-start">
            {/* Left: swipeable friends */}
            <div className="col-span-12 xl:col-span-7">
              <div
                ref={scrollerRef}
                className="flex items-center gap-5 overflow-x-auto pb-3 hide-scrollbar-mobile snap-x snap-mandatory"
              >
                {sendFriends.map((f, i) => {
                  const isActive = i === selectedFriendIdx
                  return (
                    <button
                      key={f.key}
                      data-avatar
                      onClick={() => setSelectedFriendIdx(i)}
                      className={`shrink-0 snap-center rounded-full relative outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                        isActive ? "ring-2 ring-amber-400/80 p-1" : ""
                      }`}
                      aria-label={`Select ${f.name}`}
                    >
                      <img
                        src={f.avatarUrl}
                        alt={f.name}
                        className={`${isActive ? "h-24 w-24" : "h-14 w-14"} rounded-full object-cover`}
                      />
                    </button>
                  )
                })}
              </div>

              {/* Selected friend details */}
              <div className="mt-2 text-center">
                <div className="text-sm font-medium">{sendFriends[selectedFriendIdx]?.name}</div>
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 border border-white/15">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
                  <span className="text-xs tracking-widest">•••• •••• 5633</span>
                  <span className="ml-1 text-[10px] opacity-80">▾</span>
                </div>
                <div className="mt-3 text-white/90">₹0.00</div>
              </div>

              <div className="mt-4 flex justify-center">
                <Button
                  variant="solid"
                  size="md"
                  onClick={() => alert(`Send money to ${sendFriends[selectedFriendIdx]?.name}`)}
                >
                  <Send className="h-4 w-4" />
                  Pay
                </Button>
              </div>
            </div>

            {/* Right: choose card mock panel */}
            <div className="col-span-12 xl:col-span-5">
              <div className="rounded-2xl bg-black/35 border border-white/10 p-4">
                <div className="text-white/80 text-sm mb-2">What&apos;s this for?</div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Add A Note</span>
                  <span className="text-white/60">(Optional)</span>
                </div>
                <div className="mt-3 text-white/70 text-sm">Choose your card</div>

                <div className="mt-3 space-y-3 text-sm">
                  {cards.slice(0, 3).map((c, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3 rounded-2xl bg-white/5 border border-white/10 px-3 py-2"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-block h-3.5 w-3.5 rounded-full ${
                            idx % 2 === 0 ? "bg-amber-500" : "bg-blue-500"
                          }`}
                        />
                        <div>
                          <div className="font-medium">{c.cardholder_name || "My Card"}</div>
                          <div className="text-xs text-white/70">Card ID ****{String(c.id).slice(-4)}</div>
                        </div>
                      </div>
                      <span className="h-5 w-5 rounded-md border border-white/20" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Raadialgcard>
      </div>

      {/* Bottom right: Card Details stack */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-7" />
        <Raadialgcard className="col-span-12 lg:col-span-5 p-5 space-y-4">
          <SectionTitle title="Card Details" />
          <div
            role="button"
            tabIndex={0}
            onClick={() => router.push("/cards/carddetails")}
            className="group cursor-pointer rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <div className="grid grid-cols-12 gap-4 items-center">
              {/* Stacked preview cards (neatly overlapped) */}
              <div className="col-span-12 md:col-span-7 h-[210px] flex items-center justify-center">
                <div className="relative flex items-center justify-center">
                  <div className="relative z-0 -mr-20 scale-[0.98] opacity-95">
                    <BankAccountCard
                      userName={cards[0]?.cardholder_name || "My Card"}
                      balance={formatINR(cards[0]?.total_wallet_balance ?? 0)}
                      phoneNumber={cards[0]?.phone_number || ""}
                      userId={cards[0]?.id || "—"}
                      fillColors={colorPalettes[0]}
                    />
                  </div>
                  <div className="relative z-10">
                    <BankAccountCard
                      userName={cards[1]?.cardholder_name || "My Card"}
                      balance={formatINR(cards[1]?.total_wallet_balance ?? 0)}
                      phoneNumber={cards[1]?.phone_number || ""}
                      userId={cards[1]?.id || "—"}
                      fillColors={colorPalettes[1]}
                    />
                  </div>
                  <div className="relative z-0 -ml-20 scale-[0.98] opacity-95">
                    <BankAccountCard
                      userName={cards[2]?.cardholder_name || "My Card"}
                      balance={formatINR(cards[2]?.total_wallet_balance ?? 0)}
                      phoneNumber={cards[2]?.phone_number || ""}
                      userId={cards[2]?.id || "—"}
                      fillColors={colorPalettes[2]}
                    />
                  </div>
                </div>
              </div>

              {/* Details snapshot */}
              <div className="col-span-12 md:col-span-5">
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
              </div>
            </div>
          </div>
        </Raadialgcard>
      </div>
    </div>
  )
}

// Styled tile to match the image: circular icon on top of a label
function ActionTile({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center text-white gap-2">
      <div className="h-11 w-11 rounded-full grid place-items-center border border-amber-500/60 bg-white/5">
        {children}
      </div>
      <div className="text-[11px] leading-tight text-white/90 text-center">{label}</div>
    </div>
  )
}
