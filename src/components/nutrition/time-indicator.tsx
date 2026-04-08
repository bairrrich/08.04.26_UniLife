'use client'

import { useMemo } from 'react'
import { Clock } from 'lucide-react'
import { MEAL_TYPE_CONFIG, MACRO_GOALS } from './constants'
import type { NutritionStats } from './types'

interface TimeIndicatorProps {
  stats: NutritionStats | null
}

export function TimeIndicator({ stats }: TimeIndicatorProps) {
  const currentTime = useMemo(() => new Date(), [])
  const currentHour = currentTime.getHours()
  const currentMealPeriod = useMemo(() => {
    if (currentHour >= 7 && currentHour < 10) return 'BREAKFAST'
    if (currentHour >= 12 && currentHour < 14) return 'LUNCH'
    if (currentHour >= 18 && currentHour < 20) return 'DINNER'
    return 'SNACK'
  }, [currentHour])

  const currentMealConfig = MEAL_TYPE_CONFIG[currentMealPeriod]
  const remainingKcal = Math.max(0, MACRO_GOALS.kcal.value - (stats?.totalKcal ?? 0))
  const kcalProgress = stats?.totalKcal ? Math.round((stats.totalKcal / MACRO_GOALS.kcal.value) * 100) : 0
  const motivationalText = useMemo(() => {
    if (kcalProgress < 50) return 'Продолжайте!'
    if (kcalProgress <= 80) return 'Хороший прогресс!'
    return 'Почти на месте!'
  }, [kcalProgress])

  return (
    <div className="mb-4 flex items-center gap-3 rounded-xl border bg-gradient-to-r from-orange-50/60 to-amber-50/40 p-3 dark:from-orange-950/20 dark:to-amber-950/10">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/50">
        <Clock className="size-4 text-orange-600 dark:text-orange-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">
          Сейчас: <span className="text-orange-700 dark:text-orange-300">{currentMealConfig.emoji} {currentMealConfig.label}</span>
          {currentMealPeriod !== 'SNACK' && (
            <span className="text-xs text-muted-foreground font-normal ml-1">
              ({currentHour}:00)
            </span>
          )}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground">
            Осталось: <span className="font-semibold text-foreground tabular-nums">{remainingKcal.toLocaleString('ru-RU')}</span> ккал
          </span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
            {motivationalText}
          </span>
        </div>
      </div>
      <div className="text-right">
        <span className="text-lg font-bold tabular-nums text-orange-700 dark:text-orange-300">{kcalProgress}%</span>
      </div>
    </div>
  )
}
