'use client'

import { useMemo } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { BarChart3, Trophy, Clock } from 'lucide-react'

import type {
  DiaryEntry,
  Workout,
  HabitItem,
  Transaction,
} from './types'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AnalyticsQuickViewProps {
  diaryEntries: DiaryEntry[]
  workouts: Workout[]
  habitsData: { data: HabitItem[]; stats: any } | null
  transactionsData: Transaction[]
  loading: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] as const

function getWeekdayIndex(dateStr: string): number {
  const d = new Date(dateStr)
  // Convert: 0=Sun → 6, 1=Mon → 0, ..., 6=Sat → 5
  return d.getDay() === 0 ? 6 : d.getDay() - 1
}

function getTimeOfDayLabel(hour: number): string {
  if (hour >= 5 && hour < 12) return 'утром (5:00–12:00)'
  if (hour >= 12 && hour < 17) return 'днём (12:00–17:00)'
  if (hour >= 17 && hour < 22) return 'вечером (17:00–22:00)'
  return 'ночью (22:00–5:00)'
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AnalyticsQuickView({
  diaryEntries,
  workouts,
  habitsData,
  transactionsData,
  loading,
}: AnalyticsQuickViewProps) {
  // ── Compute weekday activity counts ──────────────────────────────────────
  const weekdayCounts = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0, 0]

    for (const e of diaryEntries) {
      counts[getWeekdayIndex(e.date)]++
    }
    for (const w of workouts) {
      counts[getWeekdayIndex(w.date)]++
    }
    // Count habit completions per weekday from last7Days
    for (const h of habitsData?.data ?? []) {
      for (const [dateStr, completed] of Object.entries(h.last7Days ?? {})) {
        if (completed) {
          counts[getWeekdayIndex(dateStr)]++
        }
      }
    }

    return counts
  }, [diaryEntries, workouts, habitsData])

  const todayWeekday = useMemo(() => {
    const d = new Date()
    return d.getDay() === 0 ? 6 : d.getDay() - 1
  }, [])

  const maxCount = useMemo(
    () => Math.max(...weekdayCounts, 1),
    [weekdayCounts],
  )

  // ── Most active module ───────────────────────────────────────────────────
  const mostActiveModule = useMemo(() => {
    const modules: { name: string; emoji: string; count: number; unit: string }[] = [
      { name: 'Дневник', emoji: '📖', count: diaryEntries.length, unit: 'записей' },
      { name: 'Тренировки', emoji: '💪', count: workouts.length, unit: 'за месяц' },
      {
        name: 'Привычки',
        emoji: '✅',
        count: habitsData?.stats.completedToday ?? 0,
        unit: 'сегодня',
      },
      {
        name: 'Транзакции',
        emoji: '💳',
        count: transactionsData.length,
        unit: 'за месяц',
      },
    ]

    return modules.sort((a, b) => b.count - a.count)[0]
  }, [diaryEntries, workouts, habitsData, transactionsData])

  // ── Activity time pattern from diary entries ─────────────────────────────
  const activityTimePattern = useMemo(() => {
    if (diaryEntries.length < 3) {
      return { label: 'Записывайте больше, чтобы увидеть паттерны', hasData: false }
    }

    const hourBuckets = new Map<number, number>()
    for (const e of diaryEntries) {
      try {
        const d = new Date(e.date)
        const hour = d.getHours()
        hourBuckets.set(hour, (hourBuckets.get(hour) ?? 0) + 1)
      } catch {
        // skip invalid dates
      }
    }

    if (hourBuckets.size === 0) {
      return { label: 'Записывайте больше, чтобы увидеть паттерны', hasData: false }
    }

    let bestHour = 0
    let bestCount = 0
    for (const [hour, count] of hourBuckets) {
      if (count > bestCount) {
        bestCount = count
        bestHour = hour
      }
    }

    return {
      label: `Вы чаще всего пишете ${getTimeOfDayLabel(bestHour)}`,
      hasData: true,
    }
  }, [diaryEntries])

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <Card className="rounded-xl border card-hover animate-slide-up">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-5 w-36" />
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Bar chart skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-44" />
            <div className="flex items-end gap-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <Skeleton className="h-16 w-full rounded-sm" />
                  <Skeleton className="h-3 w-5" />
                </div>
              ))}
            </div>
          </div>
          {/* Module skeleton */}
          <Skeleton className="h-5 w-56" />
          {/* Time pattern skeleton */}
          <Skeleton className="h-4 w-64" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-xl border card-hover animate-slide-up">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
            <BarChart3 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          Быстрая аналитика
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* ── Section A: Активность по дням недели ──────────────────────── */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <BarChart3 className="h-3.5 w-3.5" />
            Активность по дням недели
          </div>
          <div className="flex items-end gap-2">
            {DAY_LABELS.map((label, idx) => {
              const count = weekdayCounts[idx]
              const isToday = idx === todayWeekday
              const isMax = count === maxCount && count > 0
              const heightPct = maxCount > 0 ? Math.max((count / maxCount) * 100, 4) : 4

              return (
                <div key={label} className="flex flex-1 flex-col items-center gap-1.5">
                  {/* Count label */}
                  <span className="text-[10px] tabular-nums font-medium text-muted-foreground">
                    {count > 0 ? count : ''}
                  </span>
                  {/* Bar */}
                  <div
                    className={`w-full rounded-sm transition-all duration-500 ${
                      isToday
                        ? 'ring-2 ring-emerald-400/60 dark:ring-emerald-500/60 shadow-sm shadow-emerald-200 dark:shadow-emerald-900/40'
                        : ''
                    } ${
                      isMax
                        ? 'bg-emerald-500 dark:bg-emerald-400'
                        : count > 0
                          ? 'bg-emerald-300 dark:bg-emerald-600'
                          : 'bg-muted'
                    }`}
                    style={{ height: `${heightPct}px`, minHeight: '4px' }}
                  />
                  {/* Day label */}
                  <span
                    className={`text-[11px] font-medium ${
                      isToday
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Section B: Самый активный модуль ──────────────────────────── */}
        <div className="flex items-center gap-2 text-sm">
          <Trophy className="h-4 w-4 shrink-0 text-amber-500" />
          <span className="text-muted-foreground">Самый активный модуль:</span>
          <span className="font-semibold">
            {mostActiveModule.emoji} {mostActiveModule.name} — {mostActiveModule.count} {mostActiveModule.unit}
          </span>
        </div>

        {/* ── Section C: Время активности ───────────────────────────────── */}
        <div className="flex items-start gap-2 text-sm">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
          <span className={activityTimePattern.hasData ? 'text-foreground' : 'text-muted-foreground italic'}>
            {activityTimePattern.label}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
