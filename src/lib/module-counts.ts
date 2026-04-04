'use client'

import { useSyncExternalStore, useCallback, useRef, useEffect } from 'react'

// ── In-memory cache with 5-minute TTL ──────────────────────────────

const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

let cachedCounts: Record<string, number> = {}
let cacheTimestamp = 0
let listeners: Set<() => void> = new Set()

function notifyListeners() {
  listeners.forEach((fn) => fn())
}

async function fetchModuleCountsFromApi(): Promise<Record<string, number>> {
  try {
    const res = await fetch('/api/module-counts')
    if (!res.ok) return {}
    const json = await res.json()
    if (json.success && json.counts) {
      return json.counts as Record<string, number>
    }
    return {}
  } catch {
    return {}
  }
}

export async function fetchModuleCounts(): Promise<Record<string, number>> {
  const now = Date.now()
  if (cachedCounts && cacheTimestamp && now - cacheTimestamp < CACHE_TTL) {
    return cachedCounts
  }

  const counts = await fetchModuleCountsFromApi()
  cachedCounts = counts
  cacheTimestamp = now
  notifyListeners()
  return counts
}

export function invalidateModuleCountsCache(): void {
  cachedCounts = {}
  cacheTimestamp = 0
  notifyListeners()
}

// ── localStorage key for last-seen feed timestamp ──────────────────

const FEED_LAST_SEEN_KEY = 'unilife_feed_last_seen'

export function getFeedLastSeen(): number {
  if (typeof window === 'undefined') return 0
  const val = localStorage.getItem(FEED_LAST_SEEN_KEY)
  return val ? Number(val) : 0
}

export function setFeedLastSeen(): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(FEED_LAST_SEEN_KEY, String(Date.now()))
}

// ── useSyncExternalStore-based hook ─────────────────────────────────

const POLL_INTERVAL = 5 * 60 * 1000 // 5 minutes

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

function getSnapshot(): Record<string, number> {
  return cachedCounts
}

function getServerSnapshot(): Record<string, number> {
  return {}
}

export function useModuleCounts(): Record<string, number> {
  const counts = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const fetchedRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Trigger initial fetch + polling interval via effect (no setState)
  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true

    // Fire-and-forget fetch — the useSyncExternalStore subscription
    // will re-render when cachedCounts is updated
    fetchModuleCounts()

    timerRef.current = setInterval(() => {
      fetchModuleCounts()
    }, POLL_INTERVAL)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  return counts
}
