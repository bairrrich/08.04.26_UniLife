'use client'

import { useSyncExternalStore, useEffect } from 'react'

// ── In-memory cache with 5-minute TTL ──────────────────────────────

const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

let cachedCounts: Record<string, number> = {}
let cacheTimestamp = 0
let listeners: Set<() => void> = new Set()
let cachedCountsRef = cachedCounts // stable reference for useSyncExternalStore

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
  cachedCountsRef = counts // update stable reference
  cacheTimestamp = now
  notifyListeners()
  return counts
}

export function invalidateModuleCountsCache(): void {
  cachedCounts = {}
  cachedCountsRef = cachedCounts
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

// Return a stable reference — only changes when cache is actually updated
function getSnapshot(): Record<string, number> {
  return cachedCountsRef
}

// IMPORTANT: getServerSnapshot must return a cached/stable reference.
// Returning a new {} on every call causes an infinite re-render loop.
const SERVER_SNAPSHOT: Record<string, number> = {}

function getServerSnapshot(): Record<string, number> {
  return SERVER_SNAPSHOT
}

// Track if initial fetch has been kicked off (module-level, persists across mounts)
let initialFetchStarted = false

export function useModuleCounts(): Record<string, number> {
  const counts = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  useEffect(() => {
    // Only start the initial fetch + polling once globally
    if (initialFetchStarted) return
    initialFetchStarted = true

    // Fire-and-forget fetch
    fetchModuleCounts()

    const timer = setInterval(() => {
      fetchModuleCounts()
    }, POLL_INTERVAL)

    return () => {
      clearInterval(timer)
      // Allow re-init if all consumers unmount
      initialFetchStarted = false
    }
  }, [])

  return counts
}
