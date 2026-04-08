'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import { SmilePlus } from 'lucide-react'
import { RU_MONTHS, RU_DAYS_SHORT, MOOD_EMOJI, MOOD_LABELS } from '@/lib/format'
import { safeJson } from '@/lib/safe-fetch'
import type { DiaryEntry } from '@/components/diary/types'

// ─── Mood → Heatmap Color ─────────────────────────────────────────────────────

const MOOD_HEAT_COLORS: Record<number, string> = {
  1: 'bg-red-400 dark:bg-red-500',
  2: 'bg-orange-400 dark:bg-orange-500',
  3: 'bg-yellow-400 dark:bg-yellow-500',
  4: 'bg-lime-400 dark:bg-lime-500',
  5: 'bg-emerald-400 dark:bg-emerald-500',
}

const LEGEND_ITEMS: { mood: number; emoji: string; label: string; color: string }[] = [
  { mood: 1, emoji: '😢', label: 'Ужасно', color: 'bg-red-400 dark:bg-red-500' },
  { mood: 2, emoji: '😕', label: 'Плохо', color: 'bg-orange-400 dark:bg-orange-500' },
  { mood: 3, emoji: '😐', label: 'Нормально', color: 'bg-yellow-400 dark:bg-yellow-500' },
  { mood: 4, emoji: '🙂', label: 'Хорошо', color: 'bg-lime-400 dark:bg-lime-500' },
  { mood: 5, emoji: '😄', label: 'Отлично', color: 'bg-emerald-400 dark:bg-emerald-500' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function dateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MoodHeatmapCalendar() {
  const todayDate = useMemo(() => new Date(), [])
  const todayKey = useMemo(
    () => dateKey(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate()),
    [todayDate],
  )

  const [year, setYear] = useState(todayDate.getFullYear())
  const [month, setMonth] = useState(todayDate.getMonth()) // 0-based
  const [moodMap, setMoodMap] = useState<Record<string, number | null>>({})
  const [loading, setLoading] = useState(true)
  const [slideDir, setSlideDir] = useState<'left' | 'right' | null>(null)

  const isCurrentMonth = year === todayDate.getFullYear() && month === todayDate.getMonth()

  // ── Fetch mood data ──────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false

    async function fetchMoods() {
      setLoading(true)
      const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`

      try {
        const res = await fetch(`/api/diary?month=${monthStr}`)
        if (cancelled) return
        const json = await safeJson<{ success: boolean; data: DiaryEntry[] }>(res)

        if (json?.success && json?.data) {
          const map: Record<string, number | null> = {}
          for (const entry of json.data) {
            const d = new Date(entry.date)
            const key = dateKey(d.getFullYear(), d.getMonth(), d.getDate())
            // Keep the latest mood if there are multiple entries per day
            if (entry.mood != null) {
              map[key] = entry.mood
            }
          }
          setMoodMap(map)
        } else {
          setMoodMap({})
        }
      } catch {
        setMoodMap({})
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchMoods()
    return () => {
      cancelled = true
    }
  }, [year, month])

  // ── Calendar grid ────────────────────────────────────────────────────────
  const calendarGrid = useMemo(() => {
    const firstDay = new Date(year, month, 1)
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    // Monday-based offset: Mon=0 … Sun=6
    const startOffset = (firstDay.getDay() + 6) % 7

    const cells: { day: number; isCurrentMonth: boolean }[] = []

    // Days from previous month
    const prevMonthDays = new Date(year, month, 0).getDate()
    for (let i = startOffset - 1; i >= 0; i--) {
      cells.push({ day: prevMonthDays - i, isCurrentMonth: false })
    }

    // Days from current month
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, isCurrentMonth: true })
    }

    // Days from next month to fill the grid
    while (cells.length % 7 !== 0) {
      cells.push({ day: cells.length - startOffset - daysInMonth + 1, isCurrentMonth: false })
    }

    return cells
  }, [year, month])

  // ── Month stats ──────────────────────────────────────────────────────────
  const monthStats = useMemo(() => {
    const entries = Object.values(moodMap).filter((m): m is number => m != null)
    if (entries.length === 0) return null
    const avg = entries.reduce((sum, m) => sum + m, 0) / entries.length
    return { count: entries.length, avg: Math.round(avg * 10) / 10 }
  }, [moodMap])

  // ── Navigation ───────────────────────────────────────────────────────────
  const prevMonth = useCallback(() => {
    setSlideDir('left')
    setTimeout(() => {
      setMonth((m) => {
        if (m === 0) {
          setYear((y) => y - 1)
          return 11
        }
        return m - 1
      })
    }, 50)
  }, [])

  const nextMonth = useCallback(() => {
    setSlideDir('right')
    setTimeout(() => {
      setMonth((m) => {
        if (m === 11) {
          setYear((y) => y + 1)
          return 0
        }
        return m + 1
      })
    }, 50)
  }, [])

  const goToToday = useCallback(() => {
    setYear(todayDate.getFullYear())
    setMonth(todayDate.getMonth())
  }, [todayDate])

  // ── Slide animation class ────────────────────────────────────────────────
  const slideClass = slideDir
    ? `animate-in fade-in-0 duration-200 ${slideDir === 'left' ? 'slide-in-from-right-2' : 'slide-in-from-left-2'}`
    : ''

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <Card className="animate-fade-in card-hover rounded-xl border">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-900/30">
            <SmilePlus className="h-4 w-4 text-rose-500" />
          </div>
          <span className="flex-1 truncate">Тепловая карта настроения</span>
          <div className="flex items-center gap-0.5">
            <button
              onClick={prevMonth}
              className="active-press inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-muted"
              aria-label="Предыдущий месяц"
            >
              <span className="inline-block h-4 w-4 border-t-2 border-r-2 border-current rotate-[-135deg] translate-x-[2px]" />
            </button>
            <button
              onClick={nextMonth}
              className="active-press inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-muted"
              aria-label="Следующий месяц"
            >
              <span className="inline-block h-4 w-4 border-t-2 border-r-2 border-current rotate-[45deg] -translate-x-[2px]" />
            </button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="pb-4">
        {loading ? (
          /* ── Skeleton ─────────────────────────────────────────────────── */
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 skeleton-shimmer rounded" />
              <div className="h-4 w-16 skeleton-shimmer rounded" />
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="mx-auto h-3 w-5 skeleton-shimmer rounded" />
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="mx-auto h-7 w-7 skeleton-shimmer rounded-lg" />
              ))}
            </div>
            <div className="h-4 w-full skeleton-shimmer rounded" />
          </div>
        ) : (
          <div className={slideClass}>
            {/* Month / Year sub-header */}
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold tabular-nums">
                {RU_MONTHS[month]} {year}
              </span>
              {monthStats && (
                <span className="text-[11px] text-muted-foreground">
                  {monthStats.count}{' '}
                  {monthStats.count === 1
                    ? 'запись'
                    : monthStats.count > 1 && monthStats.count < 5
                      ? 'записи'
                      : 'записей'}{' '}
                  · среднее {MOOD_EMOJI[Math.round(monthStats.avg)] || ''}
                </span>
              )}
            </div>

            {/* Day-of-week header */}
            <div className="mb-1 grid grid-cols-7 gap-1">
              {RU_DAYS_SHORT.map((dayName) => (
                <div
                  key={dayName}
                  className="flex h-5 items-center justify-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/60"
                >
                  {dayName}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-1">
              {calendarGrid.map((cell, idx) => {
                const key = cell.isCurrentMonth
                  ? dateKey(year, month, cell.day)
                  : `other-${idx}`

                const isToday = cell.isCurrentMonth && key === todayKey
                const mood = cell.isCurrentMonth ? moodMap[key] ?? null : null
                const heatColor = mood != null ? MOOD_HEAT_COLORS[mood] : null
                const noData = cell.isCurrentMonth && mood == null

                const dayContent = (
                  <div
                    key={key}
                    className={`relative mx-auto flex h-7 w-7 flex-col items-center justify-center rounded-lg text-xs transition-all duration-150
                      ${!cell.isCurrentMonth ? 'opacity-25' : ''}
                      ${isToday ? 'ring-2 ring-primary ring-offset-1 ring-offset-background dark:ring-offset-background' : ''}
                    `}
                    title={
                      cell.isCurrentMonth && mood != null
                        ? `${cell.day}: ${MOOD_EMOJI[mood]} ${MOOD_LABELS[mood]}`
                        : cell.isCurrentMonth
                          ? `${cell.day}: нет данных`
                          : ''
                    }
                  >
                    {/* Colored mood square / muted dot */}
                    {heatColor ? (
                      <div
                        className={`h-5 w-5 rounded-md transition-colors duration-200 ${heatColor}`}
                      />
                    ) : (
                      <div
                        className={`h-5 w-5 rounded-md transition-colors duration-200 ${
                          noData
                            ? 'bg-muted/50 dark:bg-muted-foreground/10'
                            : 'bg-transparent'
                        }`}
                      />
                    )}

                    {/* Day number overlay */}
                    <span
                      className={`pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 text-[9px] leading-none font-medium
                        ${isToday ? 'text-primary font-bold' : noData ? 'text-muted-foreground/50' : 'text-muted-foreground/40'}
                        ${!cell.isCurrentMonth ? 'text-muted-foreground/20' : ''}
                      `}
                    >
                      {cell.day}
                    </span>
                  </div>
                )

                // Wrap with tooltip for days with mood data
                if (cell.isCurrentMonth && mood != null) {
                  return (
                    <Tooltip key={key}>
                      <TooltipTrigger asChild>{dayContent}</TooltipTrigger>
                      <TooltipContent side="top" sideOffset={4} className="text-xs">
                        <p>{cell.day} {RU_MONTHS[month]}: {MOOD_EMOJI[mood]} {MOOD_LABELS[mood]}</p>
                      </TooltipContent>
                    </Tooltip>
                  )
                }

                return dayContent
              })}
            </div>

            {/* Legend */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                {LEGEND_ITEMS.map((item) => (
                  <div
                    key={item.mood}
                    className="flex items-center gap-1"
                    title={item.label}
                  >
                    <div className={`h-3 w-3 rounded-sm ${item.color}`} />
                    <span className="text-[10px] text-muted-foreground leading-none">{item.emoji}</span>
                  </div>
                ))}
                <div className="flex items-center gap-1 ml-1">
                  <div className="h-3 w-3 rounded-sm bg-muted/50 dark:bg-muted-foreground/10" />
                  <span className="text-[10px] text-muted-foreground leading-none">—</span>
                </div>
              </div>

              {!isCurrentMonth && (
                <button
                  onClick={goToToday}
                  className="active-press text-[11px] font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Сегодня
                </button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
