'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'

// ─── Props ──────────────────────────────────────────────────────────────────

interface SpendingForecastProps {
  totalExpense: number
  totalIncome: number
  chartData: Array<{ day: string; expense: number; income: number }>
  monthLabel: string
  isLoading: boolean
}

// ─── Component ──────────────────────────────────────────────────────────────

export function SpendingForecast({
  totalExpense,
  totalIncome,
  chartData,
  monthLabel,
  isLoading,
}: SpendingForecastProps) {
  const forecast = useMemo(() => {
    const now = new Date()
    const currentDay = now.getDate()
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const daysRemaining = Math.max(0, daysInMonth - currentDay)

    // Only compute if we have data for the current month
    if (currentDay === 0 || totalExpense === 0) {
      return {
        currentDay,
        daysInMonth,
        daysRemaining,
        avgDailySpend: 0,
        predictedTotal: totalIncome,
        predictedSavings: 0,
        isOverBudget: false,
        overAmount: 0,
        savingsAmount: 0,
      }
    }

    const avgDailySpend = totalExpense / currentDay
    const predictedTotal = avgDailySpend * daysInMonth
    const predictedSavings = totalIncome - predictedTotal
    const isOverBudget = predictedTotal > totalIncome

    return {
      currentDay,
      daysInMonth,
      daysRemaining,
      avgDailySpend,
      predictedTotal,
      predictedSavings,
      isOverBudget,
      overAmount: isOverBudget ? predictedTotal - totalIncome : 0,
      savingsAmount: isOverBudget ? 0 : predictedSavings,
    }
  }, [totalExpense, totalIncome, chartData])

  // Bar width percentages (clamped)
  const maxVal = Math.max(forecast.predictedTotal, totalIncome, 1)
  const currentWidthPct = Math.min(100, (totalExpense / maxVal) * 100)
  const predictedWidthPct = Math.min(100, (forecast.predictedTotal / maxVal) * 100)
  const incomeWidthPct = Math.min(100, (totalIncome / maxVal) * 100)

  if (isLoading) {
    return (
      <Card className="card-hover">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-28" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
            </div>
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-3 w-48 rounded" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="card-hover">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400">
            <TrendingUp className="h-4 w-4" />
          </div>
          Прогноз
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Predicted Totals Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Predicted Expense */}
            <div className="rounded-xl bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground">Прогноз расходов</p>
              <p className="mt-0.5 text-base font-bold tabular-nums text-rose-600 dark:text-rose-400">
                {formatCurrency(forecast.predictedTotal)}
              </p>
            </div>

            {/* Predicted Savings */}
            <div className="rounded-xl bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground">Прогноз сбережений</p>
              <p className={cn(
                'mt-0.5 text-base font-bold tabular-nums',
                forecast.predictedSavings >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              )}>
                {formatCurrency(forecast.predictedSavings)}
              </p>
            </div>
          </div>

          {/* Visual Comparison Bar */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Расходы vs Прогноз vs Доход</p>

            {/* Income bar (reference) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>Доход</span>
                <span className="tabular-nums">{formatCurrency(totalIncome)}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-emerald-500/40 transition-all duration-500"
                  style={{ width: `${incomeWidthPct}%` }}
                />
              </div>
            </div>

            {/* Current spend bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>Текущие расходы</span>
                <span className="tabular-nums">{formatCurrency(totalExpense)}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    forecast.isOverBudget ? 'bg-amber-500' : 'bg-emerald-500'
                  )}
                  style={{ width: `${currentWidthPct}%` }}
                />
              </div>
            </div>

            {/* Predicted bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>Прогноз за месяц</span>
                <span className="tabular-nums">{formatCurrency(forecast.predictedTotal)}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    forecast.isOverBudget ? 'bg-rose-500' : 'bg-emerald-500'
                  )}
                  style={{ width: `${predictedWidthPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Warning / Positive Message */}
          <div className={cn(
            'rounded-lg px-3 py-2 text-xs font-medium',
            forecast.isOverBudget
              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
          )}>
            {forecast.isOverBudget
              ? `⚠️ Прогноз: расходы превысят доходы на ${formatCurrency(forecast.overAmount)}`
              : `✅ При текущем темпе сэкономите ${formatCurrency(forecast.savingsAmount)}`
            }
          </div>

          {/* Daily Stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              Средний расход/день:{' '}
              <span className="font-semibold tabular-nums text-foreground">
                {formatCurrency(forecast.avgDailySpend)}
              </span>
            </span>
            <span className="tabular-nums">
              Осталось дней: <span className="font-semibold text-foreground">{forecast.daysRemaining}</span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
