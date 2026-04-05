'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Droplets, RotateCcw } from 'lucide-react'
import type { WaterStats, NutritionGoals } from './types'
import { DEFAULT_GLASS_ML } from './constants'

interface WaterTrackerProps {
  waterStats: WaterStats
  waterAnimating: boolean
  waterChartDays: { date: string; dayLabel: string; ml: number; isToday: boolean }[]
  goals?: NutritionGoals | null
  onAddWater: () => void
  onResetWater: () => void
}

export function WaterTracker({
  waterStats,
  waterAnimating,
  waterChartDays,
  goals,
  onAddWater,
  onResetWater,
}: WaterTrackerProps) {
  const waterGoal = goals?.dailyWater ?? 2000
  const totalGlasses = Math.ceil(waterGoal / DEFAULT_GLASS_ML)

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Droplets className="size-5 text-blue-500" />
            Вода
          </CardTitle>
          {waterStats.totalMl > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
              onClick={onResetWater}
            >
              <RotateCcw className="size-3 mr-1" />
              Сбросить
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Prominent total ml display */}
        <div className="mb-3 flex items-center justify-between">
          <p className="text-lg font-bold tabular-nums">
            <span className={waterStats.percentage >= 100 ? 'text-blue-600' : 'text-foreground'}>
              {waterStats.totalMl}
            </span>
            <span className="text-sm font-normal text-muted-foreground">
              {' '} / {waterGoal} мл
            </span>
          </p>
          <Badge
            variant={waterStats.percentage >= 100 ? 'default' : 'secondary'}
            className={waterStats.percentage >= 100 ? 'bg-blue-500 tabular-nums' : 'tabular-nums'}
          >
            {waterStats.percentage}%
          </Badge>
        </div>

        {/* Glass grid */}
        <div className="mb-3 grid grid-cols-4 gap-3 sm:grid-cols-8">
          {Array.from({ length: totalGlasses }).map((_, i) => {
            const isFilled = i < waterStats.glasses
            return (
              <button
                key={i}
                onClick={onAddWater}
                className="group flex flex-col items-center gap-1 transition-transform hover:scale-110 active:scale-95"
              >
                <div
                  className={`relative flex size-10 items-center justify-center overflow-hidden rounded-xl border-2 transition-colors ${
                    isFilled
                      ? 'border-blue-400 bg-blue-50 text-blue-500'
                      : 'border-gray-200 bg-gray-50 text-gray-300 group-hover:border-blue-200 group-hover:text-blue-300'
                  }`}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M8 2h8l4 10H4L8 2z" />
                    <path
                      d="M4 12v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6"
                      fill={isFilled ? 'currentColor' : 'none'}
                    />
                  </svg>
                  {isFilled && (
                    <div className="water-wave absolute bottom-0 left-0 right-0 h-3 bg-blue-400/30 rounded-b-lg" />
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {(i + 1) * DEFAULT_GLASS_ML}
                </span>
              </button>
            )
          })}
        </div>

        {/* Water progress bar */}
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-blue-100">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-500"
            style={{ width: `${Math.min(waterStats.percentage, 100)}%` }}
          />
        </div>

        {/* Quick add button */}
        <div className="mt-3 flex flex-col items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={onAddWater}
            className={`gap-2 text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-transform duration-200 ${waterAnimating ? 'scale-110' : 'hover:scale-[1.02]'}`}
          >
            <Droplets className="size-4" />
            Добавить воду ({waterStats.glasses}/{totalGlasses})
          </Button>
          {waterStats.totalMl > 0 && (
            <span className="text-[11px] text-muted-foreground">
              Выпито: <span className="font-semibold tabular-nums">{waterStats.totalMl}</span> мл
            </span>
          )}
        </div>

        {/* Water history mini chart — last 7 days */}
        {waterChartDays.length > 0 && (
          <div className="mt-5">
            <p className="mb-2.5 text-xs font-medium text-muted-foreground">
              За последние 7 дней
            </p>
            <div className="flex items-end justify-between gap-1.5">
              {waterChartDays.map((day) => {
                const heightPct = Math.min((day.ml / waterGoal) * 100, 100)
                const reachedGoal = day.ml >= waterGoal
                return (
                  <div key={day.date} className="flex flex-1 flex-col items-center gap-1.5">
                    <span className={`text-[9px] font-medium tabular-nums ${day.ml > 0 ? 'text-foreground' : 'text-muted-foreground/50'}`}>
                      {day.ml > 0 ? `${Math.round(day.ml / 100) * 100}` : ''}
                    </span>
                    <div
                      className="relative w-full max-w-[32px] rounded-t-md transition-all duration-500"
                      style={{ height: '64px' }}
                    >
                      <div
                        className={`absolute bottom-0 left-1/2 w-[70%] -translate-x-1/2 rounded-t-md transition-all duration-700 ${
                          day.isToday
                            ? reachedGoal
                              ? 'bg-emerald-500'
                              : 'bg-blue-400'
                            : reachedGoal
                              ? 'bg-emerald-400/80'
                              : 'bg-muted-foreground/25'
                        }`}
                        style={{
                          height: `${Math.max(heightPct, day.ml > 0 ? 8 : 0)}%`,
                        }}
                      />
                    </div>
                    <span
                      className={`text-[10px] font-medium ${
                        day.isToday ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'
                      }`}
                    >
                      {day.dayLabel}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
