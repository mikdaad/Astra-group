'use client'

import { useEffect, useMemo } from 'react'
import { ls, LS_KEYS } from '../../lib/local'

/**
 * Captures ?ref=CODE from the URL (once) and stores it in localStorage.
 * Exposes get/set/clear helpers so you can pass it later to ensure_profile().
 */
export function useLocalReferral() {
  // On first mount, persist any ?ref= from the URL (idempotent).
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const url = new URL(window.location.href)
      const code = url.searchParams.get('ref')
      if (code) ls.set(LS_KEYS.referralCode, code)
    } catch {/* ignore */}
  }, [])

  return useMemo(() => ({
    get: () => ls.get<string | null>(LS_KEYS.referralCode, null),
    set: (code: string | null) => code ? ls.set(LS_KEYS.referralCode, code) : ls.del(LS_KEYS.referralCode),
    clear: () => ls.del(LS_KEYS.referralCode)
  }), [])
}
