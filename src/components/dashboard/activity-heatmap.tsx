'use client'

import { useMemo } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface DayActivity {
  date: string
  count: number
}

interface ActivityHeatmapProps {
  loading: boolean
  activityData: DayActivity[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getColor(count: number): string {
  if (count === 0) return 'bg-muted'
  if (count <= 1) return 'bg-emerald-200 dark:bg-emerald-900'
  if (count <= 3) return 'bg-emerald-300 dark:bg-emerald-700'
  if (count <= 5) return 'bg-emerald-400 dark:bg-emerald-500'
  return 'bg-emerald-600 dark:bg-emerald-300'
}

function formatTooltipDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    weekday: 'short',
  })
}

const DAY_LABELS = ['Пн', '', 'Ср', '', 'Пт', '', 'Вс']
const WEEKS = 12
const DAYS_IN_GRID = WEEKS * 7 // 84

// ─── Component ────────────────────────────────────────────────────────────────

export default function ActivityHeatmap({ loading, activityData }: ActivityHeatmapProps) {
  const { grid, totalCount } = useMemo(() => {
    if (loading || activityData.length === 0) {
      return { grid: [] as { date: string; count: number }[], totalCount: 0 }
    }

    // Build a map from date string to count
    const countByDate = new Map<string, number>()
    for (const entry of activityData) {
      const existing = countByDate.get(entry.date) ?? 0
      countByDate.set(entry.date, existing + entry.count)
    }

    // Generate the grid: last 84 days, starting from 83 days ago to today
    // The grid is arranged as columns (weeks), each column has 7 rows (Mon-Sun)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Find the Monday of the current week to align the grid
    const dayOfWeek = today.getDay() // 0 = Sunday
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    const thisMonday = new Date(today)
    thisMonday.setDate(today.getDate() - mondayOffset)

    // We need WEEKS columns going back from thisMonday
    // First day of the grid = thisMonday - (WEEKS - 1) * 7 days
    const startDay = new Date(thisMonday)
    startDay.setDate(thisMonday.getDate() - (WEEKS - 1) * 7)

    // Build grid column by column (week by week)
    const grid: { date: string; count: number }[] = []
    let total = 0

    for (let week = 0; week < WEEKS; week++) {
      for (let day = 0; day < 7; day++) {
        const cellDate = new Date(startDay)
        cellDate.setDate(startDay.getDate() + week * 7 + day)

        const dateStr = cellDate.getFullYear() + '-' +
          String(cellDate.getMonth() + 1).padStart(2, '0') + '-' +
          String(cellDate.getDate()).padStart(2, '0')

        const count = countByDate.get(dateStr) ?? 0
        grid.push({ date: dateStr, count })
        total += count
      }
    }

    return { grid, totalCount: total }
  }, [loading, activityData])

  return (
    <Card className="rounded-xl border card-hover">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            Активность
          </div>
          {!loading && (
            <span className="text-xs font-normal text-muted-foreground">
              Всего {totalCount} действий за 12 недель
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          /* Skeleton grid */
          <div className="flex gap-4">
            {/* Day labels skeleton */}
            <div className="flex flex-col gap-[2px]">
              {DAY_LABELS.map((_, i) => (
                <div
                  key={i}
                  className="h-[12px] w-5"
                />
              ))}
            </div>
            {/* Grid skeleton */}
            <div className="grid grid-rows-7 grid-flow-col gap-[2px]">
              {Array.from({ length: DAYS_IN_GRID }).map((_, i) => (
                <div
                  key={i}
                  className="h-[12px] w-[12px] rounded-sm skeleton-shimmer"
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            {/* Day labels */}
            <div className="flex flex-col gap-[2px] pt-0">
              {DAY_LABELS.map((label, i) => (
                <div
                  key={i}
                  className="flex h-[12px] w-6 items-center text-[10px] leading-none text-muted-foreground"
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Heatmap grid */}
            <div className="grid grid-rows-7 grid-flow-col gap-[2px] overflow-x-auto">
              {grid.map((cell, i) => (
                <div
                  key={i}
                  className={`h-[12px] w-[12px] rounded-sm transition-colors duration-150 ${getColor(cell.count)}`}
                  title={`${formatTooltipDate(cell.date)}: ${cell.count} ${cell.count === 1 ? 'действие' : cell.count > 1 && cell.count < 5 ? 'действия' : 'действий'}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-muted-foreground">
          <span>Меньше</span>
          <div className="flex gap-[2px]">
            <div className="h-[12px] w-[12px] rounded-sm bg-muted" />
            <div className="h-[12px] w-[12px] rounded-sm bg-emerald-200 dark:bg-emerald-900" />
            <div className="h-[12px] w-[12px] rounded-sm bg-emerald-300 dark:bg-emerald-700" />
            <div className="h-[12px] w-[12px] rounded-sm bg-emerald-400 dark:bg-emerald-500" />
            <div className="h-[12px] w-[12px] rounded-sm bg-emerald-600 dark:bg-emerald-300" />
          </div>
          <span>Больше</span>
        </div>
      </CardContent>
    </Card>
  )
}
