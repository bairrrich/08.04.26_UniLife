'use client'

import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { RU_DAYS_SHORT, MOOD_DOT_COLORS, MOOD_EMOJI, MOOD_LABELS } from '@/lib/format'
import { DiaryEntry, CalendarCell } from './types'
import { getDaysInMonth, getFirstDayOfMonth, formatDateKey } from './helpers'

// ─── Streak calculation ─────────────────────────────────────────────────────

/** Returns a Set of date keys (yyyy-MM-dd) that are part of a streak ≥ minStreak */
function computeStreakDates(
  entriesByDate: Map<string, DiaryEntry[]>,
  currentYear: number,
  currentMonth: number,
  minStreak: number
): Set<string> {
  const daysInMonth = getDaysInMonth(currentYear, currentMonth)

  // Collect all dates that have entries in the current month
  const entryDates = new Set<string>()
  for (let d = 1; d <= daysInMonth; d++) {
    const key = formatDateKey(new Date(currentYear, currentMonth, d))
    if (entriesByDate.has(key) && (entriesByDate.get(key)!.length ?? 0) > 0) {
      entryDates.add(key)
    }
  }

  const streakDates = new Set<string>()

  // For each entry date, check if it's part of a streak of ≥ minStreak consecutive days
  for (const startDate of entryDates) {
    const start = new Date(startDate + 'T00:00:00')
    // Walk backwards to find the beginning of a consecutive run
    let runStart = new Date(start)
    while (true) {
      const prev = new Date(runStart)
      prev.setDate(prev.getDate() - 1)
      const prevKey = formatDateKey(prev)
      if (entryDates.has(prevKey)) {
        runStart = new Date(prev)
      } else {
        break
      }
    }

    // Count consecutive days from runStart
    let count = 0
    const check = new Date(runStart)
    while (entryDates.has(formatDateKey(check))) {
      count++
      check.setDate(check.getDate() + 1)
    }

    if (count >= minStreak) {
      // Mark all dates in this run
      const mark = new Date(runStart)
      while (entryDates.has(formatDateKey(mark))) {
        streakDates.add(formatDateKey(mark))
        mark.setDate(mark.getDate() + 1)
      }
    }
  }

  return streakDates
}

// ─── Component ──────────────────────────────────────────────────────────────

interface CalendarViewProps {
  currentYear: number
  currentMonth: number
  today: Date
  selectedDate: Date | null
  entriesByDate: Map<string, DiaryEntry[]>
  onDayClick: (cell: CalendarCell) => void
}

export function CalendarView({
  currentYear,
  currentMonth,
  today,
  selectedDate,
  entriesByDate,
  onDayClick,
}: CalendarViewProps) {
  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth)
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth)
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth)

    const cells: CalendarCell[] = []

    // Previous month trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i
      cells.push({
        day,
        month: 'prev',
        date: new Date(prevYear, prevMonth, day),
      })
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({
        day: d,
        month: 'current',
        date: new Date(currentYear, currentMonth, d),
      })
    }

    // Next month leading days (fill to 42 = 6 rows)
    const remaining = 42 - cells.length
    for (let d = 1; d <= remaining; d++) {
      cells.push({
        day: d,
        month: 'next',
        date: new Date(currentYear, currentMonth + 1, d),
      })
    }

    return cells
  }, [currentYear, currentMonth])

  // Compute streak dates (3+ day consecutive entries)
  const streakDates = useMemo(
    () => computeStreakDates(entriesByDate, currentYear, currentMonth, 3),
    [entriesByDate, currentYear, currentMonth]
  )

  // Count entries for the current month
  const monthEntryCount = useMemo(() => {
    let count = 0
    for (let day = 1; day <= getDaysInMonth(currentYear, currentMonth); day++) {
      const key = formatDateKey(new Date(currentYear, currentMonth, day))
      const dayEntries = entriesByDate.get(key)
      if (dayEntries) count += dayEntries.length
    }
    return count
  }, [entriesByDate, currentYear, currentMonth])

  return (
    <Card className="w-full rounded-xl overflow-hidden">
      <CardContent className="p-3 sm:p-4">
        {/* Month entry counter */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-muted-foreground">
            Записей в этом месяце:{' '}
            <span className="text-foreground tabular-nums font-semibold">{monthEntryCount}</span>
          </span>
          {streakDates.size > 0 && (
            <Badge variant="outline" className="text-[10px] h-5 gap-1 border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-300 rounded-full">
              🔥 Стрики: {streakDates.size} дн.
            </Badge>
          )}
        </div>

        {/* Day names header */}
        <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-1">
          {RU_DAYS_SHORT.map((day, idx) => {
            const isWeekend = idx >= 5
            return (
              <div
                key={day}
                className={cn(
                  'h-7 sm:h-8 flex items-center justify-center text-[10px] sm:text-xs font-semibold uppercase tracking-wider',
                  isWeekend
                    ? 'text-orange-500/70 dark:text-orange-400/60'
                    : 'text-muted-foreground'
                )}
              >
                {day}
              </div>
            )
          })}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
          {calendarDays.map((cell, idx) => {
            const dateKey = formatDateKey(cell.date)
            const dayEntries = entriesByDate.get(dateKey)
            const hasEntries = dayEntries && dayEntries.length > 0
            const isToday =
              cell.date.getFullYear() === today.getFullYear() &&
              cell.date.getMonth() === today.getMonth() &&
              cell.date.getDate() === today.getDate()
            const isSelected =
              selectedDate &&
              cell.date.getFullYear() === selectedDate.getFullYear() &&
              cell.date.getMonth() === selectedDate.getMonth() &&
              cell.date.getDate() === selectedDate.getDate()
            const isCurrentMonth = cell.month === 'current'
            const primaryMood = hasEntries ? dayEntries![0].mood : null
            const isStreakDay = streakDates.has(dateKey)

            return (
              <button
                key={idx}
                type="button"
                onClick={() => onDayClick(cell)}
                className={cn(
                  'h-10 sm:h-12 w-full flex flex-col items-center justify-center rounded-lg text-xs sm:text-sm relative transition-all duration-200',
                  'heatmap-cell',
                  !isCurrentMonth && 'text-muted-foreground/30',
                  isCurrentMonth && !isSelected && !hasEntries && 'hover:bg-accent hover:scale-105 hover:shadow-sm',
                  isCurrentMonth && !isSelected && hasEntries && 'hover:bg-primary/10 hover:scale-110 hover:shadow-lg',
                  isSelected && 'bg-primary text-primary-foreground hover:bg-primary/90 scale-105 shadow-lg shadow-primary/25',
                  // Enhanced today highlight
                  isToday && !isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-background font-bold bg-primary/5 dark:bg-primary/10',
                  hasEntries && !isSelected && 'bg-accent/50'
                )}
              >
                <span className={cn(
                  'text-sm tabular-nums',
                  isToday && !isSelected && 'text-primary'
                )}>
                  {cell.day}
                </span>
                {primaryMood && (
                  <span className={cn(
                    'text-[10px] sm:text-xs leading-none mt-0.5 transition-transform',
                    hasEntries && !isSelected && 'group-hover:scale-125'
                  )}>
                    {MOOD_EMOJI[primaryMood]}
                  </span>
                )}
                {/* Streak flame indicator */}
                {isStreakDay && !isSelected && (
                  <span className="absolute -top-0.5 -left-0.5 sm:-top-1 sm:-left-1 text-[8px] sm:text-[10px] leading-none pointer-events-none">
                    🔥
                  </span>
                )}
                {isStreakDay && isSelected && (
                  <span className="absolute -top-0.5 -left-0.5 sm:-top-1 sm:-left-1 text-[8px] sm:text-[10px] leading-none">
                    🔥
                  </span>
                )}
                {hasEntries && dayEntries!.length > 1 && (
                  <Badge
                    className={cn(
                      'absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 text-[8px] sm:text-[9px] font-bold rounded-full h-3.5 sm:h-4 min-w-[14px] sm:min-w-4 px-1 flex items-center justify-center border-0',
                      isSelected
                        ? 'bg-primary-foreground text-primary'
                        : 'bg-primary text-primary-foreground shadow-sm'
                    )}
                  >
                    {dayEntries!.length}
                  </Badge>
                )}

                {/* Hover tooltip */}
                {hasEntries && !isSelected && (
                  <div className="heatmap-tooltip">
                    <div className="bg-popover border rounded-lg shadow-lg px-3 py-2 text-left">
                      <p className="text-xs font-medium">{cell.day} {MOOD_EMOJI[primaryMood!]} {MOOD_LABELS[primaryMood!]}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {dayEntries!.length} {dayEntries!.length === 1 ? 'запись' : dayEntries!.length < 5 ? 'записи' : 'записей'}
                      </p>
                    </div>
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Enhanced mood heatmap legend */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mt-3 pt-3 border-t">
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Настроение:</span>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {[1, 2, 3, 4, 5].map((m) => (
              <div key={m} className="flex items-center gap-1">
                <div className={cn(
                  'h-3 w-3 rounded-sm shadow-sm',
                  MOOD_DOT_COLORS[m]
                )} />
                <span className="text-[10px] text-muted-foreground hidden sm:inline">
                  {MOOD_LABELS[m]}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1 ml-2 sm:ml-4 pl-2 sm:pl-4 border-l">
            <div className="h-3 w-3 rounded-sm bg-muted border border-border" />
            <span className="text-[10px] text-muted-foreground">Нет записи</span>
          </div>
          <div className="flex items-center gap-1 pl-2 sm:pl-4 border-l">
            <span className="text-[10px] leading-none">🔥</span>
            <span className="text-[10px] text-muted-foreground">Стрик (3+ дн.)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
