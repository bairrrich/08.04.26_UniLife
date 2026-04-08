'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Heart, Sparkles, BookOpen, CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types & Storage ────────────────────────────────────────────────────────

const STORAGE_KEY = 'unilife-gratitude-journal'

interface DayGratitude {
  date: string       // YYYY-MM-DD
  entries: [string, string, string]  // 3 gratitude entries
}

function getTodayStr(): string {
  return new Date().toISOString().split('T')[0]
}

function getYesterdayStr(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

function loadDayGratitude(dateStr: string): DayGratitude | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data: Record<string, DayGratitude> = JSON.parse(raw)
    return data[dateStr] ?? null
  } catch {
    return null
  }
}

function saveDayGratitude(dayData: DayGratitude) {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const data: Record<string, DayGratitude> = raw ? JSON.parse(raw) : {}
    data[dayData.date] = dayData
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // localStorage not available
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

const PLACEHOLDERS = [
  'За что вы благодарны сегодня?',
  'Что вас сегодня порадовало?',
  'За какой момент вы благодарны?',
] as const

const CELEBRATION_MESSAGES = [
  'Прекрасно! Благодарность делает жизнь ярче ✨',
  'Три повода для радости — отлично! 🌟',
  'Вы замечательный человек! 💛',
  'Благодарность — путь к счастью! 🌻',
]

export default memo(function GratitudeJournal() {
  const [mounted, setMounted] = useState(false)
  const [todayEntries, setTodayEntries] = useState<[string, string, string]>(['', '', ''])
  const [yesterdayData, setYesterdayData] = useState<DayGratitude | null>(null)
  const [showCelebration, setShowCelebration] = useState(false)

  // Load data on mount
  useEffect(() => {
    const todayStr = getTodayStr()
    const yesterdayStr = getYesterdayStr()

    const todayData = loadDayGratitude(todayStr)
    const yesterday = loadDayGratitude(yesterdayStr)

    if (todayData) {
      setTodayEntries(todayData.entries)
    }
    if (yesterday) {
      setYesterdayData(yesterday)
    }

    const id = setTimeout(() => setMounted(true), 0)
    return () => clearTimeout(id)
  }, [])

  // Check if all 3 entries are filled → show celebration
  useEffect(() => {
    if (!mounted) return
    const allFilled = todayEntries.every((e) => e.trim().length > 0)
    if (allFilled && !showCelebration) {
      setShowCelebration(true)
      const timer = setTimeout(() => setShowCelebration(false), 4000)
      return () => clearTimeout(timer)
    }
    if (!allFilled) {
      setShowCelebration(false)
    }
  }, [todayEntries, mounted, showCelebration])

  const handleEntryChange = useCallback((index: number, value: string) => {
    setTodayEntries((prev) => {
      const next: [string, string, string] = [...prev] as [string, string, string]
      next[index] = value
      return next
    })
    // Debounced save
    const dateStr = getTodayStr()
    const nextEntries = [...todayEntries] as [string, string, string]
    nextEntries[index] = value
    saveDayGratitude({ date: dateStr, entries: nextEntries })
  }, [todayEntries])

  const filledCount = useMemo(
    () => todayEntries.filter((e) => e.trim().length > 0).length,
    [todayEntries]
  )

  const yesterdayFilledCount = useMemo(
    () => yesterdayData?.entries.filter((e) => e.trim().length > 0).length ?? 0,
    [yesterdayData]
  )

  const celebrationMessage = useMemo(
    () => CELEBRATION_MESSAGES[Math.floor(Math.random() * CELEBRATION_MESSAGES.length)],
    [showCelebration]
  )

  if (!mounted) {
    return (
      <Card className="rounded-xl border">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-900/40">
              <Heart className="h-4 w-4 text-rose-500" />
            </div>
            Дневник благодарности
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="skeleton-shimmer h-10 w-full rounded-lg" />
            <div className="skeleton-shimmer h-10 w-full rounded-lg" />
            <div className="skeleton-shimmer h-10 w-full rounded-lg" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="animate-slide-up card-hover rounded-xl border overflow-hidden">
      {/* Warm gradient background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-rose-500/6 via-orange-500/4 to-amber-500/6 transition-all duration-500" />

      <CardHeader className="relative pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-rose-400 to-amber-500 shadow-sm">
            <Heart className="h-4 w-4 text-white" />
          </div>
          <span>Дневник благодарности</span>
          {/* Completion badge */}
          <div className="ml-auto flex items-center gap-1.5">
            <span className={cn(
              'flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums transition-colors duration-300',
              filledCount === 3
                ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
                : filledCount > 0
                  ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400'
                  : 'bg-muted text-muted-foreground'
            )}>
              {filledCount === 3 ? (
                <Sparkles className="h-3 w-3" />
              ) : (
                <BookOpen className="h-3 w-3" />
              )}
              {filledCount}/3
            </span>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="relative space-y-3">
        {/* ── Celebration Message ── */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="rounded-xl border border-emerald-200/60 dark:border-emerald-700/40 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 px-4 py-2.5 text-center"
            >
              <div className="flex items-center justify-center gap-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                <Sparkles className="h-4 w-4" />
                <span>{celebrationMessage}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Three Gratitude Inputs ── */}
        <div className="space-y-2.5">
          {PLACEHOLDERS.map((placeholder, index) => (
            <div key={index} className="relative">
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40">
                <Heart className={cn(
                  'h-3.5 w-3.5 transition-colors duration-300',
                  todayEntries[index].trim().length > 0
                    ? 'text-rose-400'
                    : ''
                )} />
              </div>
              <Input
                value={todayEntries[index]}
                onChange={(e) => handleEntryChange(index, e.target.value)}
                placeholder={placeholder}
                className={cn(
                  'pl-9 h-10 rounded-lg border bg-background/50 text-sm transition-all duration-200',
                  'focus-visible:ring-rose-500/30 focus-visible:border-rose-300 dark:focus-visible:border-rose-700',
                  'hover:border-rose-200 dark:hover:border-rose-800',
                  todayEntries[index].trim().length > 0
                    ? 'border-rose-200 dark:border-rose-800/50 bg-rose-50/50 dark:bg-rose-950/10'
                    : ''
                )}
                maxLength={200}
              />
            </div>
          ))}
        </div>

        {/* ── Completion Progress Bar ── */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">
              Я благодарен за...
            </span>
            <span className={cn(
              'text-[11px] font-medium tabular-nums transition-colors',
              filledCount === 3
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-muted-foreground'
            )}>
              {filledCount === 3 ? 'Все заполнено!' : `${filledCount} из 3`}
            </span>
          </div>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  'h-1.5 flex-1 rounded-full transition-all duration-500',
                  i < filledCount
                    ? 'bg-gradient-to-r from-rose-400 to-amber-400'
                    : 'bg-muted-foreground/15'
                )}
              />
            ))}
          </div>
        </div>

        {/* ── Yesterday's Gratitudes ── */}
        {yesterdayData && yesterdayFilledCount > 0 && (
          <div className="rounded-lg border border-muted/50 bg-muted/20 p-3 space-y-2">
            <div className="flex items-center gap-1.5">
              <CalendarDays className="h-3 w-3 text-muted-foreground" />
              <span className="text-[11px] font-medium text-muted-foreground">
                Вчера
              </span>
              <span className="text-[10px] text-muted-foreground/60">
                · {yesterdayFilledCount}/3
              </span>
            </div>
            <ul className="space-y-1">
              {yesterdayData.entries
                .filter((e) => e.trim().length > 0)
                .map((entry, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-1.5 text-xs text-muted-foreground leading-relaxed"
                  >
                    <Heart className="mt-0.5 h-3 w-3 shrink-0 text-rose-300 dark:text-rose-700" />
                    <span className="line-clamp-2">{entry}</span>
                  </li>
                ))
              }
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
})
