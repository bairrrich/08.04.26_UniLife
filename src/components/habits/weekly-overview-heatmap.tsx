'use client'

import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { CalendarDays } from 'lucide-react'
import type { HabitData } from './types'
import { cn } from '@/lib/utils'

interface WeeklyOverviewHeatmapProps {
  habits: HabitData[]
  last7Days: string[]
}

const WEEKDAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

// Color classes for completion rate
function getRateColor(rate: number, hasHabits: boolean): string {
  if (!hasHabits) return 'bg-muted/40 dark:bg-muted/20'
  if (rate === 0) return 'bg-zinc-200 dark:bg-zinc-700'
  if (rate < 50) return 'bg-amber-300 dark:bg-amber-600/70'
  if (rate < 100) return 'bg-emerald-300 dark:bg-emerald-600/70'
  return 'bg-emerald-500 dark:bg-emerald-400'
}

function getRateRing(rate: number, hasHabits: boolean): string {
  if (!hasHabits || rate < 100) return ''
  return 'ring-1 ring-emerald-400/50 dark:ring-emerald-300/30'
}

export function WeeklyOverviewHeatmap({ habits, last7Days }: WeeklyOverviewHeatmapProps) {
  const dayStats = useMemo(() => {
    return last7Days.map((day, i) => {
      const completed = habits.filter(h => h.last7Days[day]).length
      const total = habits.length
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0
      const date = new Date(day)
      const dow = date.getDay()
      const labelIdx = dow === 0 ? 6 : dow - 1
      return {
        label: WEEKDAY_LABELS[labelIdx],
        date: day,
        completed,
        total,
        rate,
        isToday: i === last7Days.length - 1,
      }
    })
  }, [habits, last7Days])

  const weekRate = useMemo(() => {
    if (habits.length === 0) return 0
    const totalPossible = habits.length * last7Days.length
    const totalCompleted = dayStats.reduce((sum, d) => sum + d.completed, 0)
    return totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0
  }, [habits, last7Days, dayStats])

  return (
    <Card className="card-hover overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 pointer-events-none" />
      <CardContent className="relative p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
            <CalendarDays className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold">Обзор недели</h3>
            <p className="text-xs text-muted-foreground">
              Общее выполнение: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{weekRate}%</span>
            </p>
          </div>
          {/* Legend */}
          <div className="hidden sm:flex items-center gap-1 text-[9px] text-muted-foreground">
            <div className="h-2.5 w-2.5 rounded-sm bg-zinc-200 dark:bg-zinc-700" />
            <span>0%</span>
            <div className="h-2.5 w-2.5 rounded-sm bg-amber-300 dark:bg-amber-600/70 ml-1" />
            <span>&lt;50%</span>
            <div className="h-2.5 w-2.5 rounded-sm bg-emerald-300 dark:bg-emerald-600/70 ml-1" />
            <span>&lt;100%</span>
            <div className="h-2.5 w-2.5 rounded-sm bg-emerald-500 dark:bg-emerald-400 ml-1" />
            <span>100%</span>
          </div>
        </div>

        {/* Heatmap row */}
        <div className="flex items-stretch gap-2">
          {dayStats.map((day, i) => (
            <div
              key={day.date}
              className="flex-1 flex flex-col items-center gap-1.5"
            >
              <span className={cn(
                'text-[10px] font-medium leading-none',
                day.isToday ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
              )}>
                {day.label}
                {day.isToday && <span className="block text-[8px] text-center">●</span>}
              </span>
              <div
                className={cn(
                  'w-full aspect-square rounded-lg transition-all duration-300 heatmap-cell-animate',
                  getRateColor(day.rate, day.total > 0),
                  getRateRing(day.rate, day.total > 0),
                  day.isToday && 'ring-2 ring-emerald-500/30 dark:ring-emerald-400/30',
                )}
                style={{ animationDelay: `${i * 50}ms` }}
                title={`${day.label} (${day.date}): ${day.completed}/${day.total} — ${day.rate}%`}
              >
                <div className="flex items-center justify-center h-full">
                  <span className={cn(
                    'text-[10px] font-bold tabular-nums',
                    day.total === 0 ? 'text-muted-foreground/40' : day.rate < 50 ? 'text-amber-900 dark:text-amber-100' : day.rate < 100 ? 'text-emerald-900 dark:text-emerald-100' : 'text-white'
                  )}>
                    {day.total > 0 ? `${day.rate}%` : '—'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
