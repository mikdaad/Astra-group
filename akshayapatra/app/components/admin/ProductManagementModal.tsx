'use client'

import { useEffect, useMemo, useState } from 'react'
import { Package, Plus, Edit, Trash2, DollarSign, Trophy, Medal, Crown, Loader2 } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

import { Scheme } from '@/lib/types/schemes'

type PeriodRow = {
  period_index: number
  period_start: string
  period_end: string
  rewards_count: number
  cover_image_url?: string | null
}

type RewardRow = {
  reward_id: string
  period_index: number
  title: string | null
  description: string | null
  image_url: string
  quantity: number
  position: number
  created_at: string
}

interface ProductManagementModalProps {
  scheme: Scheme | null
  open: boolean
  onClose: () => void
}

function fmtINR(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}
function rankIcon(rank: number) {
  switch (rank) {
    case 1: return <Crown className="w-5 h-5 text-yellow-400" />
    case 2: return <Medal className="w-5 h-5 text-gray-400" />
    case 3: return <Trophy className="w-5 h-5 text-amber-600" />
    default: return <Package className="w-5 h-5 text-blue-400" />
  }
}

export default function ProductManagementModal({ scheme, open, onClose }: ProductManagementModalProps) {
  const [periods, setPeriods] = useState<PeriodRow[]>([])
  const [activeIdx, setActiveIdx] = useState<number | null>(null)
  const [rewards, setRewards] = useState<Record<number, RewardRow[]>>({})
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  // Uploader state
  const [file, setFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState('')
  const [title, setTitle] = useState(''); const [desc, setDesc] = useState('')
  const [qty, setQty] = useState(1); const [setCover, setSetCover] = useState(false)

  const schemeId = scheme?.id

  useEffect(() => {
    if (!open || !schemeId) return
    setErr(null)
    setBusy(true)
    ;(async () => {
      // 1) fetch periods
      console.log('CLIENT: Attempting to fetch URL:', `/api/admin/schemes/${schemeId}/periods`);
      const res = await fetch(`/api/admin/schemes/${schemeId}/periods`, { cache: 'no-store' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json?.success) {
        setErr(json?.error || 'Failed to load months')
        setBusy(false); return
      }
      let p: PeriodRow[] = json.data ?? []
      // If no months, auto-ensure and refetch once
      if (!p.length) {
        await fetch(`/api/admin/schemes/${schemeId}/periods`, { method: 'POST' })
        const r2 = await fetch(`/api/admin/schemes/${schemeId}/periods`, { cache: 'no-store' })
        const j2 = await r2.json().catch(() => ({}))
        if (r2.ok && j2?.success) p = j2.data ?? []
      }
      setPeriods(p)
      setActiveIdx(p[0]?.period_index ?? null)
      setBusy(false)
    })()
  }, [open, schemeId])

  useEffect(() => {
    if (!open || !schemeId || !activeIdx) return
    setErr(null)
    ;(async () => {
      const res = await fetch(`/api/admin/schemes/${schemeId}/periods/${activeIdx}/rewards`, { cache: 'no-store' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json?.success) { setErr(json?.error || 'Failed to load rewards'); return }
      setRewards(prev => ({ ...prev, [activeIdx]: json.data as RewardRow[] }))
    })()
  }, [open, schemeId, activeIdx])

  const monthLabel = useMemo(() => {
    if (!activeIdx) return ''
    const p = periods.find(x => x.period_index === activeIdx)
    if (!p) return ''
    return new Date(p.period_start).toLocaleString(undefined, { month: 'long', year: 'numeric' })
  }, [periods, activeIdx])

  if (!scheme) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-[#1a120c] border-orange-600/30 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
              <Package className="text-orange-600 dark:text-orange-400 w-4 h-4" />
            </div>
            Manage Monthly Rewards — {scheme.name}
          </DialogTitle>
        </DialogHeader>

        {err && <div className="text-sm text-red-400">{err}</div>}
        {busy && <div className="text-sm text-zinc-400 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>}

        {/* Month Tabs */}
        <div className="flex gap-2 overflow-x-auto">
          {periods.map(p => (
            <button
              key={p.period_index}
              onClick={() => setActiveIdx(p.period_index)}
              className={`px-3 py-1 rounded border ${activeIdx === p.period_index ? 'bg-black text-white' : 'bg-white/5 border-zinc-700'}`}
              title={`${new Date(p.period_start).toLocaleDateString()} – ${new Date(p.period_end).toLocaleDateString()}`}
            >
              {new Date(p.period_start).toLocaleString(undefined, { month: 'short', year: 'numeric' })}
              {p.rewards_count ? ` (${p.rewards_count})` : ''}
            </button>
          ))}
          {(!periods?.length) && <div className="text-sm text-zinc-400">No months — click Ensure in Schemes page or adjust scheme dates.</div>}
        </div>

        {/* Uploader for selected month */}
        {activeIdx && (
          <Card className="bg-zinc-900/50 border-orange-600/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Add prize for <span className="text-orange-400">{monthLabel}</span></CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  setErr(null); setBusy(true)
                  const fd = new FormData()
                  fd.append('title', title)
                  fd.append('description', desc)
                  fd.append('quantity', String(qty))
                  if (setCover) fd.append('setCover', 'on')
                  if (file) fd.append('file', file)
                  if (imageUrl) fd.append('imageUrl', imageUrl)

                  const res = await fetch(`/api/admin/schemes/${schemeId}/periods/${activeIdx}/rewards`, {
                    method: 'POST',
                    body: fd
                  })
                  const json = await res.json().catch(() => ({}))
                  if (!res.ok || !json?.success) setErr(json?.error || 'Save failed')

                  // refresh the month rewards
                  const r2 = await fetch(`/api/admin/schemes/${schemeId}/periods/${activeIdx}/rewards`, { cache: 'no-store' })
                  const j2 = await r2.json().catch(() => ({}))
                  if (r2.ok && j2?.success) setRewards(prev => ({ ...prev, [activeIdx]: j2.data as RewardRow[] }))

                  setBusy(false)
                  // reset inputs
                  setFile(null); setImageUrl(''); setTitle(''); setDesc(''); setQty(1); setSetCover(false)
                }}
                className="grid gap-3 md:grid-cols-2"
              >
                <div className="space-y-2">
                  <Label>Upload Image</Label>
                  <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="bg-zinc-800 border-zinc-700" />
                  <div className="text-xs text-zinc-500">Or paste a public image URL below.</div>
                </div>

                
                <div className="space-y-2">
                  <Label>Or Image URL</Label>
                  <Input placeholder="https://…" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="bg-zinc-800 border-zinc-700" />
                </div>

                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={title} onChange={e => setTitle(e.target.value)} className="bg-zinc-800 border-zinc-700" />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea rows={2} value={desc} onChange={e => setDesc(e.target.value)} className="bg-zinc-800 border-zinc-700" />
                </div>
                

                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input type="number" min={1} value={qty} onChange={e => setQty(Number(e.target.value) || 1)} className="bg-zinc-800 border-zinc-700 w-32" />
                </div>

                <div className="flex items-end">
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={setCover} onChange={e => setSetCover(e.target.checked)} />
                    Set as cover (position=0)
                  </label>
                </div>

                <div className="md:col-span-2 flex gap-2">
                  <Button type="submit" className="bg-orange-600 text-white hover:bg-orange-500">Save prize to this month</Button>
                  {busy && <span className="text-sm text-zinc-400 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Working…</span>}
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Month gallery */}
        {activeIdx && (
          <div className="space-y-3">
            <div className="text-sm font-medium">Prizes for {monthLabel}</div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {(rewards[activeIdx] ?? []).sort((a,b)=>a.position-b.position).map((r, i, arr) => (
                <Card key={r.reward_id} className="bg-zinc-900/50 border-zinc-700">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        {rankIcon(r.position)}
                        <div>
                          <CardTitle className="text-lg">{r.title || 'Prize'}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">Pos #{r.position}</Badge>
                            <Badge variant="secondary" className="text-xs">Qty {r.quantity}</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={r.image_url} alt={r.title ?? ''} className="w-full h-44 object-cover rounded border border-zinc-800" />
                    {r.description && <p className="text-sm text-zinc-300 line-clamp-3">{r.description}</p>}
                    {i !== 0 && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="border-blue-600 text-blue-400 hover:bg-blue-600/20"
                          onClick={async () => {
                            const ids = [r.reward_id, ...arr.filter(x => x.reward_id !== r.reward_id).map(x => x.reward_id)]
                            const res = await fetch(`/api/admin/schemes/${schemeId}/periods/${activeIdx}/rewards/reorder`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ ids })
                            })
                            const json = await res.json().catch(() => ({}))
                            if (!res.ok || !json?.success) { setErr(json?.error || 'Failed to make cover'); return }
                            // refetch
                            const r2 = await fetch(`/api/admin/schemes/${schemeId}/periods/${activeIdx}/rewards`, { cache: 'no-store' })
                            const j2 = await r2.json().catch(() => ({}))
                            if (r2.ok && j2?.success) setRewards(prev => ({ ...prev, [activeIdx]: j2.data as RewardRow[] }))
                          }}
                        >
                          Make cover
                        </Button>
                        {/* (Optional) delete endpoint can be added later */}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              {(!rewards[activeIdx] || rewards[activeIdx].length === 0) && (
                <Card className="bg-zinc-900/50 border-zinc-700">
                  <CardContent className="p-8 text-center text-zinc-400">No prizes yet for this month.</CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-zinc-600 text-zinc-300 hover:bg-zinc-800">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
