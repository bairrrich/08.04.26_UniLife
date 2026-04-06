'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAppStore } from '@/store/use-app-store'
import { RU_MONTHS, RU_DAYS_SHORT } from '@/lib/format'
import { safeJson } from '@/lib/safe-fetch'

// ─── Types ────────────────────────────────────────────────────────────────────

interface DiaryEntryRow {
  id: string
  date: string
}

interface WorkoutRow {
  id: string
  date: string
}

interface HabitRow {
  lastMonthDays: Record<string, boolean>
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function dateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function pluralizeRecords(n: number): string {
  if (n === 0) return 'Нет записей'
  const abs = Math.abs(n) % 100
  const last = abs % 10
  if (abs > 10 && abs < 20) return `${n} записей`
  if (last > 1 && last < 5) return `${n} записи`
  if (last === 1) return `${n} запись`
  return `${n} записей`
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MiniCalendar() {
  const setActiveModule = useAppStore((s) => s.setActiveModule)

  const todayDate = useMemo(() => new Date(), [])
  const todayKey = useMemo(
    () => dateKey(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate()),
    [todayDate],
  )

  const [year, setYear] = useState(todayDate.getFullYear())
  const [month, setMonth] = useState(todayDate.getMonth()) // 0-based
  const [diaryDates, setDiaryDates] = useState<Set<string>>(new Set())
  const [workoutDates, setWorkoutDates] = useState<Set<string>>(new Set())
  const [habitDates, setHabitDates] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  // ── Fetch data when month changes ───────────────────────────────────────
  useEffect(() => {
    let cancelled = false

    async function fetchData() {
      setLoading(true)

      const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`

      const results = await Promise.allSettled([
        fetch(`/api/diary?month=${monthStr}`),
        fetch(`/api/workout?month=${monthStr}`),
        fetch(`/api/habits`),
      ])

      if (cancelled) return

      // Diary entries
      if (results[0].status === 'fulfilled') {
        const json = await safeJson<{ data: DiaryEntryRow[] }>(results[0].value)
        if (json?.data) {
          const dates = new Set<string>()
          for (const entry of json.data) {
            const d = new Date(entry.date)
            dates.add(dateKey(d.getFullYear(), d.getMonth(), d.getDate()))
          }
          setDiaryDates(dates)
        } else {
          setDiaryDates(new Set())
        }
      } else {
        setDiaryDates(new Set())
      }

      // Workouts
      if (results[1].status === 'fulfilled') {
        const json = await safeJson<{ success: boolean; data: WorkoutRow[] }>(results[1].value)
        if (json?.success && json?.data) {
          const dates = new Set<string>()
          for (const w of json.data) {
            const d = new Date(w.date)
            dates.add(dateKey(d.getFullYear(), d.getMonth(), d.getDate()))
          }
          setWorkoutDates(dates)
        } else {
          setWorkoutDates(new Set())
        }
      } else {
        setWorkoutDates(new Set())
      }

      // Habits — only current month data available via lastMonthDays
      if (results[2].status === 'fulfilled') {
        const json = await safeJson<{ success: boolean; data: HabitRow[] }>(results[2].value)
        if (json?.success && json?.data) {
          const dates = new Set<string>()
          for (const habit of json.data) {
            for (const [d, completed] of Object.entries(habit.lastMonthDays || {})) {
              if (completed) dates.add(d)
            }
          }
          setHabitDates(dates)
        } else {
          setHabitDates(new Set())
        }
      } else {
        setHabitDates(new Set())
      }

      setLoading(false)
    }

    fetchData()
    return () => {
      cancelled = true
    }
  }, [year, month])

  // ── Calendar grid (memoised) ────────────────────────────────────────────
  const calendarGrid = useMemo(() => {
    const firstDay = new Date(year, month, 1)
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    // Monday-based offset: Mon=0 … Sun=6
    const startOffset = (firstDay.getDay() + 6) % 7

    const cells: (number | null)[] = []
    for (let i = 0; i < startOffset; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(d)
    while (cells.length % 7 !== 0) cells.push(null)

    return cells
  }, [year, month])

  // ── Navigation ───────────────────────────────────────────────────────────
  const prevMonth = useCallback(() => {
    setMonth((m) => {
      if (m === 0) {
        setYear((y) => y - 1)
        return 11
      }
      return m - 1
    })
  }, [])

  const nextMonth = useCallback(() => {
    setMonth((m) => {
      if (m === 11) {
        setYear((y) => y + 1)
        return 0
      }
      return m + 1
    })
  }, [])

  // ── Day click → navigate to diary ───────────────────────────────────────
  const handleDayClick = useCallback(
    (day: number) => {
      setActiveModule('diary')
    },
    [setActiveModule],
  )

  // ── Subtitle ─────────────────────────────────────────────────────────────
  const subtitle = useMemo(() => pluralizeRecords(diaryDates.size), [diaryDates])

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <Card className="animate-slide-up card-hover rounded-xl border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20">
            <CalendarDays className="h-4 w-4 text-primary" />
          </div>
          <span className="flex-1 truncate">
            {RU_MONTHS[month]} {year}
          </span>
          <div className="flex items-center gap-0.5">
            <button
              onClick={prevMonth}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-muted"
              aria-label="Предыдущий месяц"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextMonth}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-muted"
              aria-label="Следующий месяц"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="pb-4">
        {loading ? (
          /* ── Skeleton placeholder ──────────────────────────────────────── */
          <div className="space-y-2">
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="mx-auto h-4 w-6 skeleton-shimmer rounded" />
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="h-8 w-full skeleton-shimmer rounded-lg" />
              ))}
            </div>
            <div className="h-3 w-24 skeleton-shimmer rounded" />
          </div>
        ) : (
          /* ── Calendar ──────────────────────────────────────────────────── */
          <>
            {/* Day-of-week header */}
            <div className="mb-1 grid grid-cols-7 gap-1">
              {RU_DAYS_SHORT.map((dayName) => (
                <div
                  key={dayName}
                  className="flex h-5 items-center justify-center text-[10px] font-medium text-muted-foreground"
                >
                  {dayName}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-1">
              {calendarGrid.map((cell, idx) => {
                if (cell === null) {
                  return <div key={`e-${idx}`} className="h-8" />
                }

                const key = dateKey(year, month, cell)
                const isTodayCell = key === todayKey
                const hasDiary = diaryDates.has(key)
                const hasWorkout = workoutDates.has(key)
                const hasHabits = habitDates.has(key)
                const hasAny = hasDiary || hasWorkout || hasHabits

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleDayClick(cell)}
                    className={`relative flex h-8 min-w-[32px] flex-col items-center justify-center rounded-lg text-xs transition-colors
                      ${
                        isTodayCell
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : hasAny
                            ? 'font-semibold text-foreground hover:bg-muted'
                            : 'text-muted-foreground hover:bg-muted'
                      }`}
                  >
                    <span className="leading-none">{cell}</span>

                    {/* Indicator dots */}
                    {(hasDiary || hasWorkout || hasHabits) && (
                      <span className="mt-0.5 flex h-1.5 items-center gap-0.5">
                        {hasDiary && (
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isTodayCell
                                ? 'bg-primary-foreground/80'
                                : 'bg-amber-500 dark:bg-amber-400'
                            }`}
                          />
                        )}
                        {hasWorkout && (
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isTodayCell
                                ? 'bg-primary-foreground/80'
                                : 'bg-blue-500 dark:bg-blue-400'
                            }`}
                          />
                        )}
                        {hasHabits && (
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isTodayCell
                                ? 'bg-primary-foreground/80'
                                : 'bg-emerald-500 dark:bg-emerald-400'
                            }`}
                          />
                        )}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Subtitle */}
            <p className="mt-2 text-[11px] text-muted-foreground">
              {subtitle}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}
