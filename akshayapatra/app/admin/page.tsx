"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import PageLoader from "../components/general/PageLoader";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
} from "recharts";
import {
  Calendar as CalendarIcon,
  Download,
  Settings2,
  TrendingUp,
  ArrowUpRight,
  Search,
  PhoneCall,
  Wallet,
  X,
} from "lucide-react";
import GlowCard from "../components/admin/GlowCard";
import SkeletonCard from "../components/admin/SkeletonCard";

// ---------- Helpers ----------
const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

const numberIN = (n: number) =>
  new Intl.NumberFormat("en-IN").format(n);

// ---------- Monthly helpers (pad missing months with zero) ----------
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
type MonthlyPoint = { month: string; value: number }

function toMonthIndex(m: any): number | null {
  if (typeof m === 'number') {
    const idx = Math.floor(m) - 1
    return idx >= 0 && idx < 12 ? idx : null
  }
  if (typeof m === 'string') {
    const idx = MONTHS.findIndex((mm) => mm.toLowerCase() === m.slice(0,3).toLowerCase())
    return idx >= 0 ? idx : null
  }
  return null
}

function buildMonthlySeries(input: any[] | undefined, monthKey = 'month', valueKey = 'value'): MonthlyPoint[] {
  const map = new Map<number, number>()
  ;(input || []).forEach((row: any) => {
    const idx = toMonthIndex(row?.[monthKey])
    const val = Number(row?.[valueKey] ?? 0)
    if (idx !== null) map.set(idx, val)
  })
  return MONTHS.map((label, i) => ({ month: label, value: map.get(i) ?? 0 }))
}

const promoters = [
  { name: "Munnar", value: 45 },
  { name: "Kishor", value: 35 },
  { name: "Gokul", value: 20 },
];

const commissionSplit = [
  { name: "Direct", value: 10_000 },
  { name: "In‑Direct", value: 19_000 },
];

// ---------- Colors (kept minimal; tailwind handles most) ----------
const ORANGE = ["#ffedd5", "#fdba74", "#fb923c", "#f97316", "#ea580c", "#c2410c"]; // light -> deep

// ---------- Small UI bits ----------
function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="space-y-2">
      <div className="text-sm/4 text-zinc-300">{label}</div>
      <div className="text-3xl font-semibold tracking-tight text-white">{value}</div>
      {sub ? <div className="text-xs text-zinc-400">{sub}</div> : null}
    </div>
  );
}

// Import GlowCard from shared component

// ---------- Page ----------
export default function DashboardOverview() {
  const [isLoading, setIsLoading] = useState(true)
  const [overview, setOverview] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/admin/overview')
        const json = await res.json().catch(() => ({}))
        if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to load overview')
        const row = Array.isArray(json.data) ? json.data[0] : null
        setOverview(row)
      } catch (e: any) {
        setError(e?.message || 'Failed to load overview')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  // Build monthly series for charts (fallback to zeros if not provided by API)
  const monthlyUsers = buildMonthlySeries(overview?.monthly_users)
  const incomeTrend = buildMonthlySeries(overview?.monthly_income, 'month', 'amount')
  const activeUsersSpark = buildMonthlySeries(overview?.monthly_active_users)

  if (isLoading) {
    return (
      <PageLoader 
        text="A D M I N" 
        duration={1.5}
        className="fixed inset-0 z-50 bg-gradient-to-b from-[#090300] via-[#351603] to-[#6E2B00]"
      />
    )
  }

  return (
    <div className="space-y-6">
             {/* Header */}
       <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
         <div>
           <h1 className="text-4xl font-bold tracking-tight text-white font-sans">Dashboard (Overview)</h1>
           <p className="mt-1 text-sm text-zinc-300 font-sans">
             Track and monitor the performance of your leads from all aspects of management.
           </p>
         </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" className="bg-zinc-900 text-white hover:bg-zinc-800">
            <CalendarIcon className="mr-2 h-4 w-4" /> December 2024
          </Button>
          <Button variant="secondary" className="bg-zinc-900 text-white hover:bg-zinc-800">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button variant="secondary" size="icon" className="bg-zinc-900 text-white hover:bg-zinc-800">
            <Settings2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded border border-red-600 bg-red-600/10 p-3 text-red-300">
          <div className="flex items-center justify-between gap-4">
            <span>{error}</span>
            <Button size="sm" variant="outline" className="border-red-600 text-red-300 hover:bg-red-600/20" onClick={() => setError(null)}>
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Total Users (All Time) */}
        <GlowCard className="xl:col-span-7">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Total Users (All Time)</CardTitle>
              <div className="flex items-center gap-2">
                <Select defaultValue="monthly">
                  <SelectTrigger className="w-[120px] bg-zinc-900 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="icon" variant="secondary" className="bg-zinc-900 text-white hover:bg-zinc-800">
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardDescription className="mt-2 text-zinc-300">
              {overview?.total_users ? `${numberIN(overview.total_users)} users total` : '—'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div className="text-5xl font-bold tracking-tight">{numberIN(Number(overview?.total_users || 0))}</div>
              <div className="text-right">
                <div className="text-2xl font-semibold text-orange-400">+10%</div>
                <div className="text-xs text-zinc-400">from last month</div>
              </div>
            </div>
            <div className="mt-4 h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyUsers} barSize={24}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} stroke="#a1a1aa" />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} contentStyle={{ background: "#0a0a0a", border: "1px solid #27272a", borderRadius: 8, color: "#fff" }} />
                  <Bar dataKey="pct" radius={[8, 8, 0, 0]}>
                    {monthlyUsers.map((_, i) => (
                      <Cell key={i} fill={ORANGE[3]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </GlowCard>

        {/* Quick Support */}
        <GlowCard className="xl:col-span-5">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-3xl font-bold">Quick Support Any</div>
                <div className="text-3xl font-bold">Problem CRM</div>
              </div>
              <div className="rounded-2xl bg-orange-500/20 p-4">
                <PhoneCall className="h-10 w-10 text-orange-300" />
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2">
              <Input placeholder="Enter name, phone number or customer ID" className="bg-zinc-900 text-white placeholder:text-zinc-500" />
              <Button className="bg-orange-600 text-white hover:bg-orange-500">
                <Search className="mr-2 h-4 w-4" /> Search
              </Button>
            </div>
          </CardContent>
        </GlowCard>

        {/* Income Collected */}
        <GlowCard className="xl:col-span-7">
          <CardHeader className="pb-0">
            <CardTitle className="text-xl">Total Income Collected</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-6">
              <Stat label="Total" value={formatINR(Number(overview?.total_income_collected || 0))} />
              <div className="text-right">
                <Stat label="Current Month Income" value={formatINR(20_000)} sub="50% increased from last month" />
              </div>
            </div>
            <div className="mt-6 h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={incomeTrend} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="orangeFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} stroke="#a1a1aa" />
                  <YAxis hide />
                  <Tooltip contentStyle={{ background: "#0a0a0a", border: "1px solid #27272a", borderRadius: 8, color: "#fff" }} />
                  <Area type="monotone" dataKey="v" stroke="#f97316" strokeWidth={2} fill="url(#orangeFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </GlowCard>

        {/* New User */}
        <GlowCard className="xl:col-span-3">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">New User</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="text-5xl font-bold">{numberIN(Number(overview?.inactive_users || 0))}</div>
              <div className="text-xs text-zinc-400">in this month</div>
            </div>
            <div className="mt-4 h-20">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{ v: 10 }, { v: 42 }, { v: 36 }, { v: 60 }]}> 
                  <Bar dataKey="v" radius={[6, 6, 0, 0]}>
                    {[0, 1, 2, 3].map((i) => (
                      <Cell key={i} fill={i === 3 ? ORANGE[3] : ORANGE[1]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </GlowCard>

        {/* Active User (Paid) */}
        <GlowCard className="xl:col-span-4">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Active User (Paid)</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="text-5xl font-bold">{numberIN(Number(overview?.active_users || 0))}</div>
              <div className="text-xs text-zinc-400">in this month</div>
            </div>
            <div className="mt-3 text-right text-xs text-zinc-400">{formatINR(5230.45)}</div>
            <div className="mt-2 h-24">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activeUsersSpark}>
                  <YAxis hide />
                  <XAxis hide />
                  <Tooltip contentStyle={{ background: "#0a0a0a", border: "1px solid #27272a", borderRadius: 8, color: "#fff" }} />
                  <Line type="monotone" dataKey="y" stroke="#f97316" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </GlowCard>

        {/* Total Referral */}
        <GlowCard className="xl:col-span-3">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Total Referral</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-orange-400" />
            </div>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Direct</span> <span className="font-medium">80</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>In‑Direct</span> <span className="font-medium">90</span>
              </div>
              <div className="text-xs text-zinc-400">in this month</div>
            </div>
            <div className="h-24 w-24">
              <ResponsiveContainer width="100%" height="100%">
                                 <RadialBarChart cy="50%" cx="50%" innerRadius="60%" outerRadius="100%" barSize={10} data={[{ name: "Total", value: 170 }]}> 
                   <RadialBar background dataKey="value" fill="#f97316" />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="-mt-[72px] text-center text-sm font-semibold">170</div>
            </div>
          </CardContent>
        </GlowCard>

        {/* Top Promoters */}
        <GlowCard className="xl:col-span-4">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Top Promoters</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-orange-400" />
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-2 items-center gap-2">
            <div>
              <div className="text-4xl font-bold">{formatINR(Number(overview?.total_referral_income || 0))}</div>
              <div className="text-xs text-zinc-400">Total commission paid</div>
              <div className="mt-3 space-y-2 text-sm">
                {promoters.map((p) => (
                  <div key={p.name} className="flex items-center justify-between">
                    <span>{p.name}</span>
                    <span className="font-medium">{p.value}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="h-36 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={promoters} dataKey="value" nameKey="name" innerRadius={45} outerRadius={65} paddingAngle={4}>
                    {promoters.map((_, i) => (
                      <Cell key={i} fill={[ORANGE[5], ORANGE[3], ORANGE[1]][i]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </GlowCard>

        {/* Total Commission */}
        <GlowCard className="xl:col-span-4">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Total Commission</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-orange-400" />
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-2 items-center gap-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <span className="inline-block h-2 w-2 rounded-full bg-orange-500" /> Direct
              </div>
              <div className="text-2xl font-semibold">{formatINR(10_000)}</div>
              <div className="mt-2 flex items-center gap-2 text-sm">
                <span className="inline-block h-2 w-2 rounded-full bg-orange-300" /> In‑Direct
              </div>
              <div className="text-2xl font-semibold">{formatINR(19_000)}</div>
              <div className="text-xs text-zinc-400">in this month</div>
            </div>
            <div className="h-36 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={commissionSplit} dataKey="value" nameKey="name" innerRadius={45} outerRadius={65} paddingAngle={3}>
                    {commissionSplit.map((_, i) => (
                      <Cell key={i} fill={["#f97316", "#fdba74"][i]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </GlowCard>

        {/* Support Request */}
        <GlowCard className="xl:col-span-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Support Request</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <div className="text-sm text-zinc-300">Pending Request</div>
              <div className="mt-1 text-3xl font-semibold">991+</div>
            </div>
            <Button variant="secondary" className="bg-zinc-900 text-white hover:bg-zinc-800">
              View all
            </Button>
          </CardContent>
        </GlowCard>
      </div>
    </div>
  );
}
