'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
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
  if (n === 0) return 'Нет записей в дневнике'
  const abs = Math.abs(n) % 100
  const last = abs % 10
  if (abs > 10 && abs < 20) return `${n} записей в дневнике`
  if (last > 1 && last < 5) return `${n} записи в дневнике`
  if (last === 1) return `${n} запись в дневнике`
  return `${n} записей в дневнике`
}

function buildDayTooltip(
  hasDiary: boolean,
  hasWorkout: boolean,
  hasHabits: boolean,
  dayNum: number,
): string {
  const parts: string[] = []
  if (hasDiary) parts.push('📝 Дневник')
  if (hasWorkout) parts.push('💪 Тренировка')
  if (hasHabits) parts.push('✅ Привычки')
  if (parts.length === 0) return ''
  return `${dayNum}: ${parts.join(' · ')}`
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
  const [slideDir, setSlideDir] = useState<'left' | 'right' | null>(null)

  const isCurrentMonth = year === todayDate.getFullYear() && month === todayDate.getMonth()

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

  // ── Navigation with animation direction ─────────────────────────────────
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

  // ── Day click → navigate to diary ───────────────────────────────────────
  const handleDayClick = useCallback(
    (day: number) => {
      setActiveModule('diary')
    },
    [setActiveModule],
  )

  // ── Subtitle ─────────────────────────────────────────────────────────────
  const subtitle = useMemo(() => pluralizeRecords(diaryDates.size), [diaryDates])

  // ── Slide animation class ───────────────────────────────────────────────
  const slideClass = slideDir
    ? `animate-in fade-in-0 duration-200 ${slideDir === 'left' ? 'slide-in-from-right-2' : 'slide-in-from-left-2'}`
    : ''

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <Card className="animate-slide-up card-hover rounded-xl border">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20">
            <CalendarDays className="h-4 w-4 text-primary" />
          </div>
          <span className={`flex-1 truncate ${slideClass}`}>
            {RU_MONTHS[month]} {year}
          </span>
          <div className="flex items-center gap-0.5">
            <button
              onClick={prevMonth}
              className="active-press inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-muted"
              aria-label="Предыдущий месяц"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextMonth}
              className="active-press inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-muted"
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
          <div className={slideClass}>
            {/* Day-of-week header */}
            <div className="mb-1 grid grid-cols-7 gap-1">
              {RU_DAYS_SHORT.map((dayName) => (
                <div
                  key={dayName}
                  className="flex h-6 items-center justify-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70"
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
                const tooltipText = buildDayTooltip(hasDiary, hasWorkout, hasHabits, cell)

                const dayButton = (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleDayClick(cell)}
                    className={`active-press relative flex h-8 min-w-[28px] flex-col items-center justify-center rounded-lg text-xs transition-all duration-150
                      ${
                        isTodayCell
                          ? 'bg-primary text-primary-foreground shadow-sm font-bold'
                          : hasAny
                            ? 'font-semibold text-foreground hover:bg-muted'
                            : 'text-muted-foreground hover:bg-muted'
                      }`}
                  >
                    <span className="leading-none">{cell}</span>

                    {/* Indicator dots */}
                    {(hasDiary || hasWorkout || hasHabits) && (
                      <span className="mt-0.5 flex h-1.5 items-center justify-center gap-px">
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

                // Wrap with tooltip only if there are activities
                if (hasAny && !isTodayCell) {
                  return (
                    <Tooltip key={key}>
                      <TooltipTrigger asChild>
                        {dayButton}
                      </TooltipTrigger>
                      <TooltipContent side="top" sideOffset={4}>
                        <p>{tooltipText}</p>
                      </TooltipContent>
                    </Tooltip>
                  )
                }

                return dayButton
              })}
            </div>

            {/* Footer row */}
            <div className="mt-2 flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground">
                {subtitle}
              </p>
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
