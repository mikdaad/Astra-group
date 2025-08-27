// app/admin/schemes/[schemeId]/rewards/rewards-client.tsx
'use client'

import { useEffect, useState } from 'react'
import { getSchemePeriods, getSchemePeriodRewards } from '../../../../lib/rpc'
import {
  ensurePeriodsAction,savePrizeAction,makeCoverAction
} from './action'



export default function AdminRewardsClient({ schemeId }: { schemeId: string }) {
  const [periods, setPeriods] = useState<any[]>([])
  const [activeIdx, setActiveIdx] = useState<number | null>(null)
  const [rewards, setRewards] = useState<Record<number, any[]>>({})

  useEffect(() => {
    (async () => {
      const p = await getSchemePeriods(schemeId)
      setPeriods(p)
      if (p.length && !activeIdx) setActiveIdx(p[0].period_index)
    })()
  }, [schemeId])

  useEffect(() => {
    (async () => {
      if (!activeIdx) return
      const r = await getSchemePeriodRewards({ schemeId, periodIndex: activeIdx })
      setRewards(prev => ({ ...prev, [activeIdx]: r }))
    })()
  }, [schemeId, activeIdx])

  return (
    <main className="p-6 space-y-6">
      <form action={ensurePeriodsAction} className="flex gap-2">
        <input type="hidden" name="schemeId" value={schemeId} />
        <button className="border rounded px-3 py-2" type="submit">Ensure periods</button>
      </form>

      {/* Month tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {periods.map(p => (
          <button
            key={p.period_index}
            onClick={() => setActiveIdx(p.period_index)}
            className={`px-3 py-1 rounded border ${activeIdx === p.period_index ? 'bg-black text-white' : 'bg-white'}`}
          >
            {new Date(p.period_start).toLocaleString(undefined, { month: 'short', year: 'numeric' })}
            {p.rewards_count ? ` (${p.rewards_count})` : ''}
          </button>
        ))}
      </div>

      {/* Upload prize to the selected month */}
      {activeIdx && (
        <form action={savePrizeAction} className="border rounded p-3 grid gap-3">
          <input type="hidden" name="schemeId" value={schemeId} />
          <input type="hidden" name="periodIndex" value={activeIdx} />

          <label className="text-sm">Upload image (or paste URL below)</label>
          <input type="file" name="file" accept="image/*" />

          <input className="border rounded px-2 py-1" name="imageUrl" placeholder="OR image URL" />
          <input className="border rounded px-2 py-1" name="title" placeholder="Title" />
          <input className="border rounded px-2 py-1" name="description" placeholder="Description (optional)" />
          <div className="flex items-center gap-3">
            <label className="text-sm">Quantity</label>
            <input type="number" name="quantity" min={1} defaultValue={1} className="border rounded px-2 py-1 w-24" />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="setCover" /> Set as cover (position=1)
            </label>
          </div>

          <button className="border rounded px-3 py-2" type="submit">Save prize to this month</button>
        </form>
      )}

      {/* Month gallery */}
      {activeIdx && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {(rewards[activeIdx] ?? []).map((r, i, arr) => (
            <form key={r.reward_id} action={makeCoverAction} className="border rounded overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={r.image_url} alt={r.title ?? ''} className="w-full h-32 object-cover" />
              <div className="p-2 text-sm">
                <div className="font-medium line-clamp-1">{r.title ?? 'Prize'}</div>
                <div className="text-xs text-gray-500">Qty {r.quantity} • Pos {r.position}</div>

                {/* hidden inputs for server action */}
                <input type="hidden" name="schemeId" value={schemeId} />
                <input type="hidden" name="periodIndex" value={activeIdx} />
                <input type="hidden" name="prizeId" value={r.reward_id} />
                <input type="hidden" name="currentIds" value={JSON.stringify(arr.map(x => x.reward_id))} />

                {i !== 0 && <button className="text-xs underline mt-1" type="submit">Make cover</button>}
              </div>
            </form>
          ))}
        </div>
      )}
    </main>
  )
}
