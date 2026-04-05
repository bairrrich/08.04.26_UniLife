'use client'

import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { RU_DAYS_SHORT, MOOD_DOT_COLORS, MOOD_EMOJI } from '@/lib/format'
import { Badge } from '@/components/ui/badge'
import { DiaryEntry, CalendarCell } from './types'
import { getDaysInMonth, getFirstDayOfMonth, formatDateKey } from './helpers'

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

  return (
    <Card className="w-full rounded-xl">
      <CardContent className="p-3 sm:p-4">
        {/* Day names header */}
        <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-1">
          {RU_DAYS_SHORT.map((day) => (
            <div
              key={day}
              className="h-6 sm:h-8 flex items-center justify-center text-[10px] sm:text-xs font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
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

            return (
              <button
                key={idx}
                type="button"
                onClick={() => onDayClick(cell)}
                className={cn(
                  'h-10 sm:h-12 w-full flex flex-col items-center justify-center rounded-lg text-xs sm:text-sm relative transition-all duration-200',
                  !isCurrentMonth && 'text-muted-foreground/40',
                  isCurrentMonth && !isSelected && !hasEntries && 'hover:bg-accent',
                  isCurrentMonth && !isSelected && hasEntries && 'hover:bg-primary/10 hover:scale-105 hover:shadow-md',
                  isSelected && 'bg-primary text-primary-foreground hover:bg-primary/90 scale-105 shadow-md',
                  isToday && !isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-background font-semibold',
                  hasEntries && !isSelected && 'bg-accent/50'
                )}
              >
                <span className="text-sm">{cell.day}</span>
                {primaryMood && (
                  <span className="text-[10px] sm:text-xs leading-none mt-0.5">
                    {MOOD_EMOJI[primaryMood]}
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
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 mt-3 pt-3 border-t">
          {[1, 2, 3, 4, 5].map((m) => (
            <div key={m} className="flex items-center gap-1">
              <div className={cn('h-2 w-2 rounded-full', MOOD_DOT_COLORS[m])} />
              <span className="text-xs text-muted-foreground">{MOOD_EMOJI[m]}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
