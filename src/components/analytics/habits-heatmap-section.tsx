'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Target, Info } from 'lucide-react'
import { SkeletonChart } from './skeleton-components'
import type { HabitsHeatmapCell, HabitItem } from './types'

const RU_DAYS_FULL = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

function getDayColor(cell: HabitsHeatmapCell, totalHabits: number): string {
  if (totalHabits === 0) return 'bg-muted/50 dark:bg-muted/30'
  const completed = cell.completedCount ?? 0
  if (completed === totalHabits) return 'bg-emerald-500 text-white font-medium'
  if (completed > 0) return 'bg-amber-400 text-white font-medium'
  return 'bg-muted/50 text-muted-foreground dark:bg-muted/30'
}

function getDayLabel(cell: HabitsHeatmapCell, totalHabits: number): string {
  if (totalHabits === 0) return 'Нет привычек'
  const completed = cell.completedCount ?? 0
  if (completed === totalHabits) return 'Все выполнены ✓'
  if (completed > 0) return `Частично: ${completed} из ${totalHabits}`
  return 'Не выполнено'
}

interface HabitsHeatmapSectionProps {
  loading: boolean
  habitsHeatmap: HabitsHeatmapCell[]
  heatmapCompletionRate: number
  totalHabits: number
  habits: HabitItem[]
}

export function HabitsHeatmapSection({
  loading,
  habitsHeatmap,
  heatmapCompletionRate,
  totalHabits,
  habits,
}: HabitsHeatmapSectionProps) {
  const [tooltipCell, setTooltipCell] = useState<HabitsHeatmapCell | null>(null)

  if (loading) return <SkeletonChart />

  // Organize into weeks (rows of 7)
  const weeks: HabitsHeatmapCell[][] = []
  for (let i = 0; i < habitsHeatmap.length; i += 7) {
    weeks.push(habitsHeatmap.slice(i, i + 7))
  }

  return (
    <Card className="card-hover rounded-xl border">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Target className="h-4 w-4 text-violet-500" />
          Карта привычек
        </CardTitle>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Последние 30 дней
          </p>
          <Badge
            variant="secondary"
            className="tabular-nums text-xs"
          >
            {heatmapCompletionRate}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {totalHabits === 0 ? (
          <div className="flex h-[250px] items-center justify-center rounded-lg bg-muted/30">
            <div className="text-center">
              <Target className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Нет активных привычек</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {/* Day-of-week labels */}
            <div className="grid grid-cols-7 gap-1.5">
              {RU_DAYS_FULL.map((day) => (
                <div
                  key={day}
                  className="flex items-center justify-center text-[10px] font-medium text-muted-foreground"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Heatmap Grid */}
            <div className="relative space-y-1.5">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="grid grid-cols-7 gap-1.5">
                  {week.map((cell) => {
                    const isActive = tooltipCell?.date === cell.date
                    return (
                      <div
                        key={cell.date}
                        className="relative"
                        onMouseEnter={() => setTooltipCell(cell)}
                        onMouseLeave={() => setTooltipCell(null)}
                      >
                        <div
                          className={`flex h-7 w-full cursor-pointer items-center justify-center rounded-md text-[10px] tabular-nums transition-all duration-150 ${getDayColor(cell, totalHabits)} ${isActive ? 'ring-2 ring-primary/30 scale-110' : 'hover:scale-105'}`}
                        >
                          {cell.day}
                        </div>

                        {/* Tooltip */}
                        {isActive && (
                          <div className="absolute bottom-full left-1/2 z-10 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md border bg-popover px-2 py-1.5 text-xs shadow-lg">
                            <div className="flex items-center gap-1 font-medium">
                              <Info className="h-3 w-3 text-muted-foreground" />
                              {cell.date}
                            </div>
                            <p className="mt-0.5 text-muted-foreground">
                              {getDayLabel(cell, totalHabits)}
                            </p>
                            <div className="pointer-events-none absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-b border-r bg-popover" />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>

            {/* Enhanced Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-sm bg-emerald-500" />
                <span className="text-xs text-muted-foreground">Все выполнены</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-sm bg-amber-400" />
                <span className="text-xs text-muted-foreground">Частично</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-sm bg-muted/50 dark:bg-muted/30" />
                <span className="text-xs text-muted-foreground">Не выполнено</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-around rounded-lg bg-muted/30 px-4 py-3">
              <div className="text-center">
                <p className="text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                  {habitsHeatmap.filter((h) => h.completed).length}
                </p>
                <p className="text-[11px] text-muted-foreground">дней с привычками</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <p className="text-lg font-bold tabular-nums text-red-500">
                  {habitsHeatmap.filter((h) => !h.completed).length}
                </p>
                <p className="text-[11px] text-muted-foreground">пропущено</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <p className="text-lg font-bold tabular-nums text-foreground">
                  {habits.filter((h) => h.streak > 0).length}
                </p>
                <p className="text-[11px] text-muted-foreground">серия активна</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
