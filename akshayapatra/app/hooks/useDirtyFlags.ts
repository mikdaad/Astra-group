'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient as supabaseClient } from '../../utils/supabase/client'
import type { DirtyFlagsRow } from '../lib/rpc' // optional; or copy the shape inline
import { ls, LS_KEYS } from '../../lib/local'

type FlagsState = {
  referral: boolean
  referral2: boolean
  transactions: boolean
  ts: number
}

const POLL_MS = 20_000          // periodic poll while tab is open
const MIN_BETWEEN_CHECK_MS = 10_000 // throttle aggressive refocus polling

/**
 * Polls DB "dirty flags" set by your triggers (user_data_update_flags).
 * Typical usage:
 *   const { flags, acknowledge } = useDirtyFlags()
 *   useEffect(() => { if(flags.transactions){ refetchWallet(); acknowledge(); } }, [flags])
 */
export function useDirtyFlags() {
  const [flags, setFlags] = useState<FlagsState>(() =>
    ls.get<FlagsState>(LS_KEYS.dirtyFlagsCache, {
      referral: false, referral2: false, transactions: false, ts: 0
    })
  )

  const timerRef = useRef<number | null>(null)

  const checkFlags = useCallback(async (clearRemote: boolean) => {
    // Throttle to avoid hammering RPC (esp. on frequent focus/visibility changes)
    const last = Number(ls.get<number>(LS_KEYS.lastFlagsCheck, 0))
    if (Date.now() - last < MIN_BETWEEN_CHECK_MS) return flags

    const sb = supabaseClient()
    // Your SQL signature: consume_user_update_flags(p_user_id, p_clear_referral, p_clear_referral2, p_clear_transactions)
    const { data, error } = await sb.rpc('consume_user_update_flags', {
      p_user_id: null,                  // let function derive from auth.uid(), or replace with explicit UUID
      p_clear_referral: clearRemote,
      p_clear_referral2: clearRemote,
      p_clear_transactions: clearRemote
    })

    if (error) {
      // keep old flags if RPC fails
      return flags
    }

    const row: DirtyFlagsRow = Array.isArray(data) ? (data[0] ?? {}) : (data as DirtyFlagsRow)
    const next: FlagsState = {
      referral: !!row.referral_update_flag,
      referral2: !!row.referral2_update_flag,
      transactions: !!row.transactions_update_flag,
      ts: Date.now()
    }

    setFlags(next)
    ls.set(LS_KEYS.dirtyFlagsCache, next)
    ls.set(LS_KEYS.lastFlagsCheck, Date.now())
    return next
  }, [flags])

  // Kick off polling on mount, and refresh on visibility/focus.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const onFocus = () => { void checkFlags(false) }
    const onVis = () => { if (document.visibilityState === 'visible') void checkFlags(false) }

    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVis)

    // initial fetch + interval polling
    void checkFlags(false)
    timerRef.current = window.setInterval(() => void checkFlags(false), POLL_MS) as unknown as number

    return () => {
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVis)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [checkFlags])

  /**
   * Call this AFTER your UI has successfully refetched any data that depended on the flags.
   * It asks the server to clear the flags, and also clears local cache.
   */
  const acknowledge = useCallback(async () => {
    await checkFlags(true) // requests server to clear
    const cleared = { referral: false, referral2: false, transactions: false, ts: Date.now() }
    setFlags(cleared)
    ls.set(LS_KEYS.dirtyFlagsCache, cleared)
  }, [checkFlags])

  return { flags, checkFlags, acknowledge }
}
