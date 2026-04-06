'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Target } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'
import { useMemo } from 'react'

// ─── Props ──────────────────────────────────────────────────────────────────

interface SavingsGoalProps {
  totalIncome: number
  totalExpense: number
  isLoading: boolean
}

// ─── SVG Ring Constants ─────────────────────────────────────────────────────

const RING_RADIUS = 36
const RING_STROKE = 6
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

// ─── Helpers ────────────────────────────────────────────────────────────────

function getMotivation(rate: number): string {
  if (rate >= 30) return 'Отличный результат! 🎯'
  if (rate >= 20) return 'Хороший темп! 👍'
  if (rate >= 10) return 'Неплохое начало'
  if (rate >= 0) return 'Есть куда расти'
  return 'Расходы превышают доходы ⚠️'
}

function getRingColor(rate: number): string {
  if (rate >= 30) return 'text-emerald-500'
  if (rate >= 20) return 'text-amber-500'
  if (rate >= 0) return 'text-amber-400'
  return 'text-rose-500'
}

function getRingTrackColor(rate: number): string {
  if (rate >= 30) return 'stroke-emerald-500/20'
  if (rate >= 20) return 'stroke-amber-500/20'
  if (rate >= 0) return 'stroke-amber-400/20'
  return 'stroke-rose-500/20'
}

// ─── Component ──────────────────────────────────────────────────────────────

export function SavingsGoal({ totalIncome, totalExpense, isLoading }: SavingsGoalProps) {
  const savings = totalIncome - totalExpense
  const annualSavings = savings * 12
  const savingsRate = totalIncome > 0 ? Math.round((savings / totalIncome) * 100) : 0

  const dashOffset = useMemo(() => {
    // Clamp rate to 0-100 for the ring visual (negative savings show 0)
    const clampedRate = Math.max(0, Math.min(100, savingsRate))
    return RING_CIRCUMFERENCE - (clampedRate / 100) * RING_CIRCUMFERENCE
  }, [savingsRate])

  if (isLoading) {
    return (
      <Card className="card-hover">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-40" />
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
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
            <Target className="h-4 w-4" />
          </div>
          Цель накоплений
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
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
                className={cn('transition-colors duration-300', getRingTrackColor(savingsRate))}
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
                className={cn('transition-all duration-700 ease-out', getRingColor(savingsRate))}
              />
            </svg>
            {/* Percentage Label */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={cn(
                'text-sm font-bold tabular-nums',
                savingsRate >= 30 ? 'text-emerald-600 dark:text-emerald-400' :
                savingsRate >= 0 ? 'text-amber-600 dark:text-amber-400' :
                'text-rose-600 dark:text-rose-400'
              )}>
                {Math.max(0, savingsRate)}%
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1 space-y-2">
            {/* Motivational message */}
            <p className="text-sm font-medium">{getMotivation(savingsRate)}</p>

            {/* Bottom stats */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="tabular-nums">
                В месяц: <span className={cn(
                  'font-semibold',
                  savings >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                )}>
                  {savings >= 0 ? '+' : ''}{formatCurrency(savings)}
                </span>
              </span>
              <span className="tabular-nums">
                В год: <span className={cn(
                  'font-semibold',
                  annualSavings >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                )}>
                  {annualSavings >= 0 ? '+' : ''}{formatCurrency(annualSavings)}
                </span>
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
