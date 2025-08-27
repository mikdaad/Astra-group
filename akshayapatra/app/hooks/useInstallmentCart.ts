'use client'

import { useMemo, useSyncExternalStore } from 'react'
import { ls, LS_KEYS } from '../../lib/local'

type Cart = {
  cardId: string
  schemeId: string
  amount: number
  currency: string
  indices: number[]
}

const CHANNEL = 'app:installmentCart';

/** Read current cart from localStorage (SSR-safe). */
function read(): Cart | null {
  return ls.get<Cart | null>(LS_KEYS.installmentCart, null)
}

/** Broadcast helper so same-tab updates also notify subscribers (storage event only fires cross-tab). */
function notify() {
  // Same-tab: CustomEvent fallback
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CHANNEL))
  }
  // Cross-tab: storage event will fire automatically when localStorage changes
}

/** Subscribe to changes via storage events + custom event. */
function subscribe(cb: () => void) {
  if (typeof window === 'undefined') return () => {}
  const onStorage = (e: StorageEvent) => {
    if (e.key === LS_KEYS.installmentCart) cb()
  }
  const onCustom = () => cb()

  window.addEventListener('storage', onStorage)
  window.addEventListener(CHANNEL, onCustom as EventListener)

  return () => {
    window.removeEventListener('storage', onStorage)
    window.removeEventListener(CHANNEL, onCustom as EventListener)
  }
}

/**
 * Keeps a small "installment cart" in localStorage so selections survive refresh.
 * Uses useSyncExternalStore for solid concurrent rendering semantics.
 */
export function useInstallmentCart() {
  const snapshot = useSyncExternalStore(subscribe, read, () => null)

  const api = useMemo(() => ({
    get: () => read(),
    put: (c: Cart) => { ls.set(LS_KEYS.installmentCart, c); notify() },
    clear: () => { ls.del(LS_KEYS.installmentCart); notify() }
  }), [])

  return { cart: snapshot, ...api }
}
