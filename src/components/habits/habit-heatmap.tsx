'use client'

import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { CalendarDays } from 'lucide-react'
import type { HabitData } from './types'

interface HabitHeatmapProps {
  habits: HabitData[]
}

// Russian month names
const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
]

const WEEKDAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

// Emerald color scheme for intensity levels
function getHeatColor(intensity: number): string {
  if (intensity < 0) return 'bg-muted' // no data (future days)
  if (intensity === 0) return 'bg-emerald-100 dark:bg-emerald-950/40'
  if (intensity < 0.5) return 'bg-emerald-300 dark:bg-emerald-700/60'
  if (intensity < 1) return 'bg-emerald-500 dark:bg-emerald-500'
  return 'bg-emerald-600 dark:bg-emerald-400'
}

function getHeatRing(intensity: number): string {
  if (intensity < 0) return ''
  if (intensity >= 1) return 'ring-1 ring-emerald-400/40 dark:ring-emerald-300/30'
  return ''
}

export function HabitHeatmap({ habits }: HabitHeatmapProps) {
  const { weeks, monthLabel, totalDays, completedDays } = useMemo(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const today = now.getDate()

    const monthLabel = `${MONTH_NAMES[month]} ${year}`

    // Get first day of month (0=Sun, 1=Mon, ...) and convert to Mon-based (0=Mon, ..., 6=Sun)
    const firstDayOfMonth = new Date(year, month, 1).getDay()
    const firstDayMonBased = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

    // Days in this month
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    // Build grid: 7 rows (Mon-Sun) x N columns (weeks)
    // Each cell: { date: string, day: number, hasData: boolean, intensity: number }
    const totalCells = Math.ceil((firstDayMonBased + daysInMonth) / 7) * 7
    const gridCells: Array<{ date: string; day: number; hasData: boolean; intensity: number }> = []

    for (let i = 0; i < totalCells; i++) {
      const dayNum = i - firstDayMonBased + 1
      if (dayNum < 1 || dayNum > daysInMonth) {
        // Empty cell (before month start or after month end)
        gridCells.push({ date: '', day: 0, hasData: false, intensity: -1 })
      } else if (dayNum > today) {
        // Future day - no data
        const dateStr = new Date(year, month, dayNum).toISOString().split('T')[0]
        gridCells.push({ date: dateStr, day: dayNum, hasData: false, intensity: -1 })
      } else {
        // Past/today day - calculate completion rate across all habits
        const dateStr = new Date(year, month, dayNum).toISOString().split('T')[0]
        if (habits.length === 0) {
          gridCells.push({ date: dateStr, day: dayNum, hasData: false, intensity: -1 })
        } else {
          let completed = 0
          for (const habit of habits) {
            if (habit.lastMonthDays[dateStr]) completed++
          }
          const intensity = completed / habits.length
          gridCells.push({ date: dateStr, day: dayNum, hasData: true, intensity })
        }
      }
    }

    // Reshape into weeks (columns) — each week is an array of 7 days (Mon-Sun)
    const weeks: Array<typeof gridCells> = []
    for (let w = 0; w < totalCells / 7; w++) {
      weeks.push(gridCells.slice(w * 7, (w + 1) * 7))
    }

    // Count stats
    let cDays = 0
    let tDays = 0
    for (const cell of gridCells) {
      if (cell.hasData) {
        tDays++
        if (cell.intensity >= 1) cDays++
      }
    }

    return { weeks, monthLabel, totalDays: tDays, completedDays: cDays }
  }, [habits])

  const formatDateRu = (dateStr: string): string => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const day = d.getDate()
    const month = MONTH_NAMES[d.getMonth()].toLowerCase()
    return `${day} ${month}`
  }

  const tooltipText = (cell: typeof weeks[0][0]) => {
    if (cell.day === 0 || cell.intensity < 0) return ''
    const pct = Math.round(cell.intensity * 100)
    return `${formatDateRu(cell.date)} — ${pct}% выполнено`
  }

  return (
    <Card className="card-hover overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 pointer-events-none" />
      <CardContent className="relative p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
              <CalendarDays className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">{monthLabel}</h3>
              <p className="text-xs text-muted-foreground">
                {totalDays > 0
                  ? `${completedDays} из ${totalDays} дней — все привычки выполнены`
                  : 'Активность за месяц'}
              </p>
            </div>
          </div>
          {/* Legend */}
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground mr-1">Менее</span>
            <div className="h-3 w-3 rounded-sm bg-emerald-100 dark:bg-emerald-950/40" />
            <div className="h-3 w-3 rounded-sm bg-emerald-300 dark:bg-emerald-700/60" />
            <div className="h-3 w-3 rounded-sm bg-emerald-500 dark:bg-emerald-500" />
            <div className="h-3 w-3 rounded-sm bg-emerald-600 dark:bg-emerald-400" />
            <span className="text-[10px] text-muted-foreground ml-1">Более</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto scrollbar-none">
          <div className="flex gap-[3px] sm:gap-1 min-w-0">
            {/* Weekday labels */}
            <div className="flex flex-col gap-[3px] sm:gap-1 shrink-0">
              {WEEKDAY_LABELS.map((label) => (
                <div
                  key={label}
                  className="h-4 sm:h-[18px] flex items-center justify-end pr-1"
                >
                  <span className="text-[8px] sm:text-[9px] text-muted-foreground leading-none">{label}</span>
                </div>
              ))}
            </div>

            {/* Week columns */}
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-[3px] sm:gap-1">
                {week.map((cell, dayIdx) => (
                  <div
                    key={dayIdx}
                    className={`h-4 w-4 sm:h-[18px] sm:w-[18px] rounded-[3px] transition-all duration-150 ${getHeatColor(cell.intensity)} ${getHeatRing(cell.intensity)} ${cell.day > 0 && cell.hasData ? 'hover:scale-125 cursor-pointer' : ''}`}
                    title={tooltipText(cell)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
