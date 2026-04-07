'use client'

import { useMemo, useEffect, useState, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import type { NutritionStats, NutritionGoals } from './types'

interface NutritionScoreRingProps {
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

/** Simple score: each of 4 goals reached = +25%, capped at 100 */
function calculateScore(stats: NutritionStats, goals: NutritionGoals): number {
  let score = 0
  if (stats.totalProtein >= goals.dailyProtein) score += 25
  if (stats.totalCarbs >= goals.dailyCarbs) score += 25
  if (stats.totalFat >= goals.dailyFat) score += 25
  if (stats.totalKcal >= goals.dailyKcal) score += 25
  return Math.min(score, 100)
}

function getScoreMessage(score: number): string {
  if (score >= 90) return 'Отличный день! 🌟'
  if (score >= 70) return 'Хороший результат! 👍'
  if (score >= 50) return 'Неплохо, но можно лучше 💪'
  return 'Есть куда расти 🎯'
}

export function NutritionScoreRing({ stats, goals }: NutritionScoreRingProps) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const hasAnimated = useRef(false)
  const g = goals ?? DEFAULT_GOALS

  const score = useMemo(() => {
    if (!stats) return 0
    return calculateScore(stats, g)
  }, [stats, g])

  // Animate ring fill on mount with 1s ease-out
  useEffect(() => {
    if (!stats || hasAnimated.current) return
    hasAnimated.current = true
    const duration = 1000
    const startTime = Date.now()
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setAnimatedScore(Math.round(eased * score))
      if (progress < 1) requestAnimationFrame(animate)
    }
    animate()
  }, [score, stats])

  const message = getScoreMessage(score)

  // SVG ring params: 120x120, stroke-width 8, radius = (120 - 8) / 2 = 56
  const size = 120
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const animatedOffset = circumference - (animatedScore / 100) * circumference
  const gradientId = 'scoreRingGradient'

  if (!stats) return null

  return (
    <Card className="card-hover overflow-hidden">
      <CardContent className="flex flex-col items-center gap-3 py-6 px-4">
        {/* Animated ring */}
        <div className="relative" style={{ width: size, height: size }}>
          <svg
            width={size}
            height={size}
            className="-rotate-90"
            aria-label={`Оценка дня: ${animatedScore}%`}
          >
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
            </defs>
            {/* Background track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              strokeWidth={strokeWidth}
              className="stroke-emerald-500/15 dark:stroke-emerald-500/10"
            />
            {/* Progress arc */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              stroke={`url(#${gradientId})`}
              strokeDasharray={circumference}
              strokeDashoffset={animatedOffset}
              className="transition-[stroke-dashoffset] duration-1000 ease-out"
            />
          </svg>
          {/* Center percentage */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
              {animatedScore}
            </span>
            <span className="text-[10px] text-muted-foreground font-medium leading-none mt-0.5">%</span>
          </div>
        </div>

        {/* Label + message */}
        <div className="text-center">
          <p className="text-sm font-semibold text-foreground">Оценка дня</p>
          <p className="text-xs text-muted-foreground mt-1">{message}</p>
        </div>
      </CardContent>
    </Card>
  )
}
