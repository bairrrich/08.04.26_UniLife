'use client'

import { useMemo, useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Award, Zap, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NutritionStats, NutritionGoals } from './types'

interface DailyNutritionScoreProps {
  stats: NutritionStats | null
  goals?: NutritionGoals | null
}

const DEFAULT_GOALS: NutritionGoals = {
  dailyKcal: 2200,
  dailyProtein: 150,
  dailyFat: 80,
  dailyCarbs: 250,
  dailyWater: 2000,
}

export function DailyNutritionScore({ stats, goals }: DailyNutritionScoreProps) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const g = goals ?? DEFAULT_GOALS

  const score = useMemo(() => {
    if (!stats) return 0
    let score = 0
    let maxScore = 0

    // Kcal: 30 points for being within 80-110% of goal
    maxScore += 30
    const kcalPct = stats.totalKcal / g.dailyKcal
    if (kcalPct >= 0.8 && kcalPct <= 1.1) score += 30
    else if (kcalPct >= 0.6 && kcalPct < 0.8) score += 20
    else if (kcalPct > 1.1 && kcalPct <= 1.3) score += 15
    else if (kcalPct > 0.4 && kcalPct < 0.6) score += 10
    else if (kcalPct > 1.3) score += 5

    // Protein: 25 points
    maxScore += 25
    const proteinPct = stats.totalProtein / g.dailyProtein
    if (proteinPct >= 0.8) score += 25
    else if (proteinPct >= 0.5) score += Math.round(proteinPct / 0.8 * 25)

    // Fat: 15 points for being within goal
    maxScore += 15
    const fatPct = stats.totalFat / g.dailyFat
    if (fatPct >= 0.7 && fatPct <= 1.2) score += 15
    else if (fatPct >= 0.5 && fatPct < 0.7) score += 10
    else if (fatPct > 1.2 && fatPct <= 1.5) score += 5

    // Carbs: 15 points
    maxScore += 15
    const carbsPct = stats.totalCarbs / g.dailyCarbs
    if (carbsPct >= 0.7 && carbsPct <= 1.2) score += 15
    else if (carbsPct >= 0.5 && carbsPct < 0.7) score += 10
    else if (carbsPct > 1.2 && carbsPct <= 1.5) score += 5

    // Meal variety bonus: 15 points
    maxScore += 15
    const mealTypes = Object.keys(stats.byMealType || {}).length
    if (mealTypes >= 4) score += 15
    else if (mealTypes >= 3) score += 10
    else if (mealTypes >= 2) score += 5

    return Math.min(Math.round((score / maxScore) * 100), 100)
  }, [stats, g])

  // Animate score on change
  useEffect(() => {
    let start = 0
    const duration = 800
    const startTime = Date.now()
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setAnimatedScore(Math.round(eased * score))
      if (progress < 1) requestAnimationFrame(animate)
    }
    animate()
  }, [score])

  const getScoreColor = () => {
    if (score >= 80) return { ring: 'stroke-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/40', label: 'Отлично!' }
    if (score >= 60) return { ring: 'stroke-amber-500', text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/40', label: 'Хорошо' }
    if (score >= 40) return { ring: 'stroke-orange-500', text: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/40', label: 'Неплохо' }
    return { ring: 'stroke-rose-500', text: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-100 dark:bg-rose-900/40', label: 'Нужно улучшить' }
  }

  const colors = getScoreColor()
  const radius = 44
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const size = (radius + 6) * 2

  if (!stats) return null

  return (
    <Card className="card-hover overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Circular score ring */}
          <div className="relative shrink-0" style={{ width: size, height: size }}>
            <svg
              width={size}
              height={size}
              className="-rotate-90"
            >
              {/* Track */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                strokeWidth="6"
                className="stroke-muted/60"
              />
              {/* Score arc */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className={cn('transition-all duration-1000 ease-out', colors.ring)}
              />
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn('text-2xl font-bold tabular-nums', colors.text)}>
                {animatedScore}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">из 100</span>
            </div>
          </div>

          {/* Score details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <div className={cn('flex h-6 w-6 items-center justify-center rounded-md', colors.bg)}>
                {score >= 80 ? (
                  <Award className="h-3.5 w-3.5" />
                ) : score >= 60 ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <Zap className="h-3.5 w-3.5" />
                )}
              </div>
              <p className="text-sm font-semibold">Оценка питания</p>
            </div>
            <p className={cn('text-xs font-medium mb-1', colors.text)}>{colors.label}</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Комплексная оценка по калориям, макронутриентам и разнообразию приёмов пищи
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
