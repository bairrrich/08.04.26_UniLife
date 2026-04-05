'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Props ──────────────────────────────────────────────────────────────────

interface FinancialHealthScoreProps {
  savingsRate: number
  budgetSummary?: {
    totalBudget: number
    totalSpent: number
    totalPercentage: number
    budgets: Array<{ percentage: number }>
  } | null
  chartData: Array<{ day: string; expense: number; income: number }>
  isLoading: boolean
}

// ─── SVG Ring Constants ─────────────────────────────────────────────────────

const RING_RADIUS = 48
const RING_STROKE = 7
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Savings score: 40% weight. savingsRate >= 30% → full points, 0% → 0 points */
function calcSavingsScore(savingsRate: number): number {
  return Math.min(100, Math.max(0, (savingsRate / 30) * 100))
}

/** Budget discipline: 30% weight. % of budgets not exceeded */
function calcBudgetScore(budgetSummary: FinancialHealthScoreProps['budgetSummary']): number {
  if (!budgetSummary || budgetSummary.budgets.length === 0) return 50 // neutral if no data
  const notExceeded = budgetSummary.budgets.filter((b) => b.percentage < 100).length
  return (notExceeded / budgetSummary.budgets.length) * 100
}

/** Spending consistency: 30% weight. Lower variance in daily spending = higher score */
function calcConsistencyScore(chartData: Array<{ day: string; expense: number; income: number }>): number {
  const expenses = chartData.map((d) => d.expense).filter((e) => e > 0)
  if (expenses.length < 3) return 50 // not enough data

  const mean = expenses.reduce((s, e) => s + e, 0) / expenses.length
  if (mean === 0) return 50

  const variance = expenses.reduce((s, e) => s + Math.pow(e - mean, 2), 0) / expenses.length
  const cv = Math.sqrt(variance) / mean // coefficient of variation

  // cv = 0 → perfect consistency (100), cv >= 1.5 → 0
  return Math.max(0, Math.min(100, (1 - cv / 1.5) * 100))
}

function getScoreColor(score: number): string {
  if (score >= 70) return 'text-emerald-500'
  if (score >= 40) return 'text-amber-500'
  return 'text-rose-500'
}

function getScoreTrackColor(score: number): string {
  if (score >= 70) return 'stroke-emerald-500/20'
  if (score >= 40) return 'stroke-amber-500/20'
  return 'stroke-rose-500/20'
}

function getScoreTextColor(score: number): string {
  if (score >= 70) return 'text-emerald-600 dark:text-emerald-400'
  if (score >= 40) return 'text-amber-600 dark:text-amber-400'
  return 'text-rose-600 dark:text-rose-400'
}

function getMotivationText(score: number): string {
  if (score >= 80) return 'Отлично! 🎉'
  if (score >= 60) return 'Хорошо 👍'
  if (score >= 40) return 'Нормально'
  return 'Есть что улучшить'
}

// ─── Component ──────────────────────────────────────────────────────────────

export function FinancialHealthScore({
  savingsRate,
  budgetSummary,
  chartData,
  isLoading,
}: FinancialHealthScoreProps) {
  const { score, factors } = useMemo(() => {
    const savingsScore = calcSavingsScore(savingsRate)
    const budgetScore = calcBudgetScore(budgetSummary)
    const consistencyScore = calcConsistencyScore(chartData)

    const composite = Math.round(
      savingsScore * 0.4 + budgetScore * 0.3 + consistencyScore * 0.3
    )

    return {
      score: composite,
      factors: [
        { label: 'Накопления', value: Math.round(savingsScore), color: 'bg-emerald-500' },
        { label: 'Дисциплина', value: Math.round(budgetScore), color: 'bg-violet-500' },
        { label: 'Стабильность', value: Math.round(consistencyScore), color: 'bg-amber-500' },
      ],
    }
  }, [savingsRate, budgetSummary, chartData])

  const dashOffset = useMemo(() => {
    const clamped = Math.max(0, Math.min(100, score))
    return RING_CIRCUMFERENCE - (clamped / 100) * RING_CIRCUMFERENCE
  }, [score])

  if (isLoading) {
    return (
      <Card className="card-hover">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-44" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-[120px] w-[120px] rounded-full" />
            <div className="w-full space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-5 w-full rounded" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="card-hover">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <Heart className="h-4 w-4" />
          </div>
          Финансовое здоровье
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-5">
          {/* Circular Progress Ring */}
          <div className="relative flex-shrink-0">
            <svg
              width={RING_RADIUS * 2 + RING_STROKE * 2}
              height={RING_RADIUS * 2 + RING_STROKE * 2}
              className="-rotate-90"
            >
              {/* Track */}
              <circle
                cx={RING_RADIUS + RING_STROKE}
                cy={RING_RADIUS + RING_STROKE}
                r={RING_RADIUS}
                fill="none"
                strokeWidth={RING_STROKE}
                className={cn('transition-colors duration-300', getScoreTrackColor(score))}
              />
              {/* Progress */}
              <circle
                cx={RING_RADIUS + RING_STROKE}
                cy={RING_RADIUS + RING_STROKE}
                r={RING_RADIUS}
                fill="none"
                strokeWidth={RING_STROKE}
                strokeLinecap="round"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={dashOffset}
                className={cn('transition-all duration-700 ease-out', getScoreColor(score))}
              />
            </svg>
            {/* Score Number */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn('text-2xl font-bold tabular-nums', getScoreTextColor(score))}>
                {score}
              </span>
              <span className="text-[10px] text-muted-foreground">из 100</span>
            </div>
          </div>

          {/* Motivational Text */}
          <p className={cn('text-sm font-medium', getScoreTextColor(score))}>
            {getMotivationText(score)}
          </p>

          {/* Factor Breakdown */}
          <div className="w-full space-y-3">
            {factors.map((factor) => (
              <div key={factor.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{factor.label}</span>
                  <span className="font-medium tabular-nums text-muted-foreground">
                    {factor.value}%
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn('h-full rounded-full transition-all duration-500', factor.color)}
                    style={{ width: `${factor.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
