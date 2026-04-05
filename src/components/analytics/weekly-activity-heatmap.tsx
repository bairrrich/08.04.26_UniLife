'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Grid3X3, Info } from 'lucide-react'
import { RU_DAYS_SHORT } from '@/lib/format'
import { SkeletonChart } from './skeleton-components'
import type { WeeklyActivityCell } from './types'

// ─── Heatmap Color Intensity ──────────────────────────────────────────────────

function getIntensityColor(value: number, max: number): string {
  if (value === 0) return 'bg-muted/40 text-muted-foreground/50 dark:bg-muted/20'
  const ratio = max > 0 ? value / max : 0
  if (ratio <= 0.25) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
  if (ratio <= 0.5) return 'bg-emerald-300 text-emerald-800 dark:bg-emerald-800/60 dark:text-emerald-200'
  if (ratio <= 0.75) return 'bg-emerald-500 text-white dark:bg-emerald-600 dark:text-white'
  return 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-white'
}

function getModuleValue(cell: WeeklyActivityCell, module: 'diary' | 'workouts' | 'meals' | 'habitsCompleted'): number {
  return cell[module]
}

const MODULE_HEADERS = [
  { key: 'diary' as const, label: '📋', title: 'Дневник' },
  { key: 'workouts' as const, label: '💪', title: 'Тренировки' },
  { key: 'meals' as const, label: '🥗', title: 'Питание' },
  { key: 'habitsCompleted' as const, label: '✅', title: 'Привычки' },
]

// ─── Component ───────────────────────────────────────────────────────────────

interface WeeklyActivityHeatmapProps {
  loading: boolean
  heatmapData: WeeklyActivityCell[]
}

export function WeeklyActivityHeatmap({ loading, heatmapData }: WeeklyActivityHeatmapProps) {
  const [tooltipCell, setTooltipCell] = useState<WeeklyActivityCell | null>(null)
  const [tooltipModule, setTooltipModule] = useState<string | null>(null)

  if (loading) return <SkeletonChart />

  if (heatmapData.length === 0) {
    return (
      <Card className="card-hover rounded-xl border">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Grid3X3 className="h-4 w-4 text-indigo-500" />
            Тепловая карта активности
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[220px] items-center justify-center rounded-lg bg-muted/30">
            <div className="text-center">
              <Grid3X3 className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Нет данных за неделю</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate max value per module for color intensity
  const maxDiary = Math.max(...heatmapData.map((c) => c.diary), 1)
  const maxWorkouts = Math.max(...heatmapData.map((c) => c.workouts), 1)
  const maxMeals = Math.max(...heatmapData.map((c) => c.meals), 1)
  const maxHabits = Math.max(...heatmapData.map((c) => c.habitsCompleted), 1)
  const moduleMax: Record<string, number> = {
    diary: maxDiary,
    workouts: maxWorkouts,
    meals: maxMeals,
    habitsCompleted: maxHabits,
  }

  const totalCells = heatmapData.reduce(
    (sum, c) => sum + c.diary + c.workouts + c.meals + c.habitsCompleted,
    0,
  )
  const activeDays = heatmapData.filter((c) => c.total > 0).length

  return (
    <Card className="card-hover rounded-xl border">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Grid3X3 className="h-4 w-4 text-indigo-500" />
          Тепловая карта активности
        </CardTitle>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Последние 7 дней по модулям
          </p>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="tabular-nums text-[10px]">
              {activeDays}/7 дней
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Heatmap Grid */}
          <div className="overflow-x-auto">
            <div className="min-w-[360px]">
              {/* Header Row */}
              <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-1">
                <div className="flex items-center text-[10px] font-medium text-muted-foreground" />
                {heatmapData.map((cell) => (
                  <div
                    key={cell.date}
                    className="flex flex-col items-center justify-center gap-0.5"
                  >
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {cell.dayLabel}
                    </span>
                    <span className="text-[9px] text-muted-foreground/60 tabular-nums">
                      {cell.day}
                    </span>
                  </div>
                ))}
              </div>

              {/* Module Rows */}
              {MODULE_HEADERS.map((mod) => (
                <div
                  key={mod.key}
                  className="mt-1 grid grid-cols-[60px_repeat(7,1fr)] gap-1"
                >
                  <div className="flex items-center gap-1">
                    <span className="text-xs">{mod.label}</span>
                    <span className="text-[10px] text-muted-foreground truncate">
                      {mod.title}
                    </span>
                  </div>
                  {heatmapData.map((cell) => {
                    const value = getModuleValue(cell, mod.key)
                    const max = moduleMax[mod.key] || 1
                    const isActive =
                      tooltipCell?.date === cell.date && tooltipModule === mod.key

                    return (
                      <div
                        key={`${cell.date}-${mod.key}`}
                        className="relative"
                        onMouseEnter={() => {
                          setTooltipCell(cell)
                          setTooltipModule(mod.title)
                        }}
                        onMouseLeave={() => {
                          setTooltipCell(null)
                          setTooltipModule(null)
                        }}
                      >
                        <div
                          className={`flex h-9 w-full cursor-pointer items-center justify-center rounded-md text-xs tabular-nums font-medium transition-all duration-150 ${getIntensityColor(value, max)} ${isActive ? 'ring-2 ring-primary/40 scale-110' : 'hover:scale-105'}`}
                        >
                          {value > 0 ? value : '—'}
                        </div>

                        {/* Tooltip */}
                        {isActive && (
                          <div className="absolute bottom-full left-1/2 z-10 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md border bg-popover px-2.5 py-1.5 text-xs shadow-lg">
                            <div className="flex items-center gap-1 font-medium">
                              <Info className="h-3 w-3 text-muted-foreground" />
                              {cell.dayLabel}, {cell.day}
                            </div>
                            <p className="mt-0.5 text-muted-foreground">
                              {mod.title}: {value > 0 ? `${value} записей` : 'Нет активности'}
                            </p>
                            <div className="pointer-events-none absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-b border-r bg-popover" />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}

              {/* Total Row */}
              <div className="mt-1 grid grid-cols-[60px_repeat(7,1fr)] gap-1">
                <div className="flex items-center">
                  <span className="text-[10px] font-semibold text-muted-foreground">
                    Итого
                  </span>
                </div>
                {heatmapData.map((cell) => {
                  const maxTotal = Math.max(...heatmapData.map((c) => c.total), 1)
                  return (
                    <div
                      key={`total-${cell.date}`}
                      className={`flex h-8 w-full items-center justify-center rounded-md text-[11px] tabular-nums font-bold ${cell.total === 0 ? 'bg-muted/30 text-muted-foreground/40' : 'bg-primary/10 text-primary dark:bg-primary/20'}`}
                    >
                      {cell.total || '—'}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Intensity Legend */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <span className="text-[10px] text-muted-foreground">Меньше</span>
            <div className="flex gap-1">
              <div className="h-3 w-3 rounded-sm bg-muted/40 dark:bg-muted/20" />
              <div className="h-3 w-3 rounded-sm bg-emerald-100 dark:bg-emerald-950/50" />
              <div className="h-3 w-3 rounded-sm bg-emerald-300 dark:bg-emerald-800/60" />
              <div className="h-3 w-3 rounded-sm bg-emerald-500" />
              <div className="h-3 w-3 rounded-sm bg-emerald-600 dark:bg-emerald-500" />
            </div>
            <span className="text-[10px] text-muted-foreground">Больше</span>
          </div>

          {/* Stats Row */}
          <div className="flex items-center justify-around rounded-lg bg-muted/30 px-4 py-2.5">
            <div className="text-center">
              <p className="text-base font-bold tabular-nums text-primary">{totalCells}</p>
              <p className="text-[10px] text-muted-foreground">всего действий</p>
            </div>
            <div className="h-6 w-px bg-border" />
            <div className="text-center">
              <p className="text-base font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{activeDays}</p>
              <p className="text-[10px] text-muted-foreground">активных дней</p>
            </div>
            <div className="h-6 w-px bg-border" />
            <div className="text-center">
              <p className="text-base font-bold tabular-nums text-foreground">
                {activeDays > 0 ? Math.round(totalCells / activeDays) : 0}
              </p>
              <p className="text-[10px] text-muted-foreground">среднее за день</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
