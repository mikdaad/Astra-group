"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Landmark,
  CreditCard,
  ArrowLeftRight,
  Phone,
  Contact2,
  QrCode,
  List,
} from "lucide-react";
import { createClient as createSupabaseClient } from "@/utils/supabase/client";
import { useDirtyFlags } from "@/app/hooks/useDirtyFlags";
import { ls } from "@/lib/local";
import { getCardTransactionsPage, type TransactionRow } from "@/app/lib/rpc";

type RecentContact = {
  name: string;
  avatarUrl: string;
  key: number;
};

type QuickAction = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const recentContacts: RecentContact[] = [
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
];

const quickActions: QuickAction[] = [
  { label: "Bank transfer", href: "#", icon: Landmark },
  { label: "Card to card", href: "#", icon: ArrowLeftRight },
  { label: "Between cards", href: "#", icon: CreditCard },
  { label: "Phone number", href: "#", icon: Phone },
  { label: "Contact transfer", href: "#", icon: Contact2 },
  { label: "Scan QR", href: "#", icon: QrCode },
];

export default function TransfersPage() {
  const supabase = createSupabaseClient();
  const { flags, acknowledge } = useDirtyFlags();

  type UserCard = { id: string; cardholder_name?: string | null; phone_number?: string | null; total_wallet_balance?: number | string | null };
  const [cards, setCards] = React.useState<UserCard[]>(() => ls.get<UserCard[]>("transfers:cardsCache", []));
  const [cardsLoading, setCardsLoading] = React.useState(false);
  const [recentTx, setRecentTx] = React.useState<TransactionRow[]>(() => ls.get<TransactionRow[]>("transfers:recentTx", []));
  const [recentTxLoading, setRecentTxLoading] = React.useState(false);
  const [search, setSearch] = React.useState("");

  function formatINR(n: number | string | null | undefined) {
    const num = Number(n ?? 0) || 0;
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(num);
  }

  async function loadCards() {
    try {
      setCardsLoading(true);
      const res = await fetch("/api/cards?limit=20", { credentials: "include", cache: "no-store" });
      const json = (await res.json().catch(() => ({}))) as { cards?: UserCard[] };
      const list = Array.isArray(json?.cards) ? (json.cards as UserCard[]) : [];
      setCards(list);
      ls.set("transfers:cardsCache", list);
    } finally {
      setCardsLoading(false);
    }
  }

  async function loadRecentTx(cardId?: string) {
    const targetCard = cardId || cards[0]?.id;
    if (!targetCard) {
      setRecentTx([]);
      ls.set("transfers:recentTx", []);
      return;
    }
    try {
      setRecentTxLoading(true);
      const rows = await getCardTransactionsPage({ cardId: targetCard, limit: 10, onlyCompleted: true }, supabase);
      setRecentTx(rows);
      ls.set("transfers:recentTx", rows);
    } finally {
      setRecentTxLoading(false);
    }
  }

  React.useEffect(() => {
    void loadCards().then(() => loadRecentTx());
  }, []);

  React.useEffect(() => {
    const need = flags.transactions || flags.referral || flags.referral2;
    if (!need) return;
    (async () => {
      await loadCards();
      await loadRecentTx();
      await acknowledge();
    })();
  }, [flags, acknowledge]);

  const totalBalance = React.useMemo(
    () => formatINR(cards.reduce((sum, c) => sum + Number(c.total_wallet_balance ?? 0), 0)),
    [cards]
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-4">
      {/* Page title */}
      <div className="flex items-center gap-3 text-white mb-6">
        <Link
          href="/dashboard"
          className="h-9 w-9 grid place-items-center rounded-full bg-white/10 hover:bg-white/15"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-semibold">Transfers</h1>
      </div>

      {/* Total balance */}
      <div className="text-white/90">
        <div className="text-sm">Total balance</div>
        <div className="text-3xl sm:text-4xl font-semibold tracking-wide">{totalBalance}</div>
      </div>

      {/* Search */}
      <div className="mt-5">
        <div className="flex items-center gap-3 rounded-full bg-white/10 border border-white/10 px-4 py-3 text-white">
          <Search className="w-5 h-5 text-white/80" />
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-transparent outline-none placeholder:text-white/70 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
                <img
                  src={contact.avatarUrl}
                  alt={contact.name}
                  className="h-16 w-16 rounded-full object-cover"
                />
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
          <button
            type="button"
            className="h-8 w-8 grid place-items-center rounded-full bg-white/10"
            aria-label="Actions"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-10 grid grid-cols-3 sm:grid-cols-6 gap-6 text-white">
        {quickActions.map(({ label, href, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className="group flex flex-col items-center gap-3"
          >
            <div className="h-12 w-12 rounded-full grid place-items-center border border-amber-500/70 text-amber-400 group-hover:bg-amber-500/10">
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-xs text-white/90 text-center leading-tight">{label}</div>
          </Link>
        ))}
      </div>

      {/* Recent Transactions from first card */}
      <div className="mt-8 text-white">
        <div className="text-sm mb-3">Recent transactions</div>
        <div className="space-y-3">
          {recentTx.map((t) => (
            <div key={t.id} className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
              <div className="h-10 w-10 rounded-full bg-white/20 grid place-items-center text-xs">{(t.tx_type || 'T')[0].toUpperCase()}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{t.description ?? t.tx_type}</p>
                <p className="text-white/60 text-xs">{new Date(t.created_at).toLocaleString('en-IN')}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatINR(t.amount)}</p>
              </div>
            </div>
          ))}
          {recentTx.length === 0 && (
            <div className="text-white/60 text-sm">No recent transactions.</div>
          )}
        </div>
      </div>
    </div>
  );
}


