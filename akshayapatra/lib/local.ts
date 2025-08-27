// @/lib/local.ts
// A safe, typed localStorage helper with TTL, versioning, and a tiny event bus.
//
// - Works in SSR (no-ops server-side, returns fallbacks).
// - Stores JSON envelopes: { v, ts, ttl?, data } so we can expire and migrate.
// - Exposes subscribe/emit helpers so components can react to changes same-tab & cross-tab.

export type Json =
  | string | number | boolean | null
  | { [key: string]: Json }
  | Json[]

type Envelope<T> = {
  v: number           // version
  ts: number          // written at (ms)
  ttl?: number        // seconds
  data: T             // payload
}

type SetOpts = {
  version?: number
  /** TTL in seconds (auto-expire after this). */
  ttlSeconds?: number
  /** Emit a same-tab change event (default true) */
  emit?: boolean
}

type GetOpts<T> = {
  expectedVersion?: number
  /** If provided, run a migration when version mismatch. */
  migrate?: (old: unknown, oldVersion: number) => T
}

const isBrowser = typeof window !== 'undefined'
const now = () => Date.now()

/** Namespaced app keys that other modules reference. Keep these stable. */
export const LS_KEYS = {
  referralCode: 'app:referralCode',
  installmentCart: 'app:installmentCart',
  dirtyFlagsCache: 'app:dirtyFlagsCache',  // {referral:boolean, referral2:boolean, transactions:boolean, ts:number}
  lastFlagsCheck: 'app:lastFlagsCheck'     // number (ms since epoch)
} as const

/** Same-tab CustomEvent channel name equals the storage key for simplicity. */
export const channelFor = (key: string) => key

/** Emit a same-tab change event for a key. Cross-tab changes still use the native `storage` event. */
export function emitLocalChange(key: string) {
  if (!isBrowser) return
  try {
    window.dispatchEvent(new CustomEvent(channelFor(key)))
  } catch { /* noop */ }
}

/** Subscribe to changes for a specific key (same-tab + cross-tab). */
export function subscribeLocal(key: string, cb: () => void): () => void {
  if (!isBrowser) return () => {}
  const onStorage = (e: StorageEvent) => {
    if (e.key === key) cb()
  }
  const onCustom = () => cb()

  window.addEventListener('storage', onStorage)
  window.addEventListener(channelFor(key), onCustom as EventListener)

  return () => {
    window.removeEventListener('storage', onStorage)
    window.removeEventListener(channelFor(key), onCustom as EventListener)
  }
}

/** Internal: parse an envelope or return null on any issue. */
function parseEnvelope<T>(raw: string | null): Envelope<T> | null {
  if (!raw) return null
  try {
    const obj = JSON.parse(raw)
    if (!obj || typeof obj !== 'object') return null
    const { v, ts, ttl, data } = obj as Envelope<T>
    if (typeof v !== 'number' || typeof ts !== 'number') return null
    return { v, ts, ttl, data }
  } catch {
    return null
  }
}

/** Internal: has expired by TTL? */
function isExpired<T>(env: Envelope<T>): boolean {
  if (!env.ttl) return false
  return now() > env.ts + env.ttl * 1000
}

/** Low-level get raw string (SSR-safe). */
export function getRaw(key: string): string | null {
  if (!isBrowser) return null
  try { return localStorage.getItem(key) } catch { return null }
}

/** Low-level write raw string (SSR-safe). */
export function setRaw(key: string, value: string | null, emit = true) {
  if (!isBrowser) return
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
    if (emit) emitLocalChange(key)
  } catch { /* ignore quota/security errors */ }
}

/**
 * Get a value for key. Returns fallback on SSR, parse error, version mismatch (unless `migrate` provided), or expiration.
 * If `expectedVersion` provided and mismatch occurs:
 *  - If `migrate` is provided, it will be called and the migrated value is returned (but not stored).
 *  - Otherwise fallback is returned.
 */
export function get<T>(key: string, fallback: T, opts?: GetOpts<T>): T {
  if (!isBrowser) return fallback

  const env = parseEnvelope<T>(getRaw(key))
  if (!env) return fallback

  // TTL expiration
  if (isExpired(env)) {
    // remove stale value
    try { localStorage.removeItem(key) } catch { /* ignore */ }
    return fallback
  }

  // Version handling
  if (opts?.expectedVersion != null && env.v !== opts.expectedVersion) {
    if (opts.migrate) {
      try {
        return opts.migrate(env.data, env.v)
      } catch {
        return fallback
      }
    }
    return fallback
  }

  return env.data as T
}

/** Set a value with optional TTL + version. */
export function set<T>(key: string, data: T, opts?: SetOpts) {
  if (!isBrowser) return
  const env: Envelope<T> = {
    v: opts?.version ?? 1,
    ts: now(),
    ttl: opts?.ttlSeconds,
    data
  }
  try {
    localStorage.setItem(key, JSON.stringify(env))
    if (opts?.emit !== false) emitLocalChange(key)
  } catch { /* ignore */ }
}

/** Remove a key. */
export function del(key: string, emit = true) {
  if (!isBrowser) return
  try {
    localStorage.removeItem(key)
    if (emit) emitLocalChange(key)
  } catch { /* ignore */ }
}

/** Get or initialize atomically (best-effort). */
export function getOrInit<T>(key: string, init: () => T, opts?: SetOpts & GetOpts<T>): T {
  const current = get<T>(key, undefined as unknown as T, { expectedVersion: opts?.version, migrate: opts?.migrate })
  if (current !== undefined) return current
  const value = init()
  set(key, value, opts)
  return value
}

/** Bump the stored envelope's version using a migration function. No-op if key missing. */
export function migrate<T>(
  key: string,
  fromVersion: number,
  toVersion: number,
  migrateFn: (old: unknown) => T,
  setOpts?: Omit<SetOpts, 'version'>
): T | null {
  if (!isBrowser) return null
  const raw = getRaw(key)
  const env = parseEnvelope<unknown>(raw)
  if (!env || env.v !== fromVersion) return null
  let next: T
  try {
    next = migrateFn(env.data)
  } catch {
    return null
  }
  set<T>(key, next, { ...setOpts, version: toVersion })
  return next
}

/** Clear all app:* keys (careful!). */
export function clearAllAppKeys(prefix = 'app:') {
  if (!isBrowser) return
  try {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith(prefix)) keys.push(k)
    }
    keys.forEach(k => localStorage.removeItem(k))
    // Emit for each key so subscribers update
    keys.forEach(k => emitLocalChange(k))
  } catch { /* ignore */ }
}

/**
 * Convenience shorthands aligned with earlier examples/hooks.
 * These mirror a minimal API surface you can import as `ls`.
 */
export const ls = {
  get,
  set,
  del,
  getOrInit,
  migrate,
  getRaw,
  setRaw,
  subscribe: subscribeLocal,
  emit: emitLocalChange,
  clearAll: clearAllAppKeys
}
