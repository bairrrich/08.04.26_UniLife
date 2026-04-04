'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

// ── In-memory cache with 5-minute TTL ──────────────────────────────

const CACHE_TTL = 5 * 60 * 1000 // 5 minutes
const POLL_INTERVAL = 5 * 60 * 1000 // 5 minutes

// Module-level singleton state — shared across all hook instances
let cachedCounts: Record<string, number> = {}
let cacheTimestamp = 0
let fetchPromise: Promise<Record<string, number>> | null = null
let intervalId: ReturnType<typeof setInterval> | null = null
let consumerCount = 0

// Set of state setters from mounted hook instances
const subscribers = new Set<(counts: Record<string, number>) => void>()

function broadcast(counts: Record<string, number>) {
  subscribers.forEach((setCounts) => setCounts(counts))
}

async function fetchFromApi(): Promise<Record<string, number>> {
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

async function refreshCounts(): Promise<Record<string, number>> {
  const now = Date.now()
  if (cachedCounts && cacheTimestamp && now - cacheTimestamp < CACHE_TTL) {
    return cachedCounts
  }

  // Deduplicate concurrent fetches
  if (!fetchPromise) {
    fetchPromise = fetchFromApi()
      .then((data) => {
        cachedCounts = data
        cacheTimestamp = Date.now()
        fetchPromise = null
        broadcast(data)
        return data
      })
      .catch(() => {
        fetchPromise = null
        return cachedCounts
      })
  }
  return fetchPromise
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

// ── Hook: simple useState + useEffect, no useSyncExternalStore ──────

export function useModuleCounts(): Record<string, number> {
  const [counts, setCounts] = useState<Record<string, number>>(cachedCounts)
  const setCountsRef = useRef(setCounts)
  setCountsRef.current = setCounts

  useEffect(() => {
    consumerCount++

    // Register subscriber
    const handler = (c: Record<string, number>) => setCountsRef.current(c)
    subscribers.add(handler)

    // If we already have cached data, use it immediately
    if (cachedCounts) {
      setCounts(cachedCounts)
    }

    // Fetch fresh data
    refreshCounts()

    // Start polling interval (only one, shared across all instances)
    if (!intervalId) {
      intervalId = setInterval(() => refreshCounts(), POLL_INTERVAL)
    }

    return () => {
      consumerCount--
      subscribers.delete(handler)

      // Clean up interval when last consumer unmounts
      if (consumerCount <= 0) {
        consumerCount = 0
        if (intervalId) {
          clearInterval(intervalId)
          intervalId = null
        }
      }
    }
  }, [])

  return counts
}

// ── Public API for manual refresh / invalidation ───────────────────

export function invalidateModuleCountsCache(): void {
  cachedCounts = {}
  cacheTimestamp = 0
  broadcast({})
}
