'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, CalendarDays, CheckCircle2, AlertTriangle, ArrowDown } from 'lucide-react'
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

// ─── Status Type ────────────────────────────────────────────────────────────

type ForecastStatus = 'on_track' | 'over_budget' | 'under_budget'

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
        status: 'on_track' as ForecastStatus,
        deviationPct: 0,
        projectedDailyForRest: 0,
      }
    }

    const avgDailySpend = totalExpense / currentDay
    const predictedTotal = avgDailySpend * daysInMonth
    const predictedSavings = totalIncome - predictedTotal
    const isOverBudget = predictedTotal > totalIncome

    // Calculate status
    const deviationPct = totalIncome > 0 ? ((predictedTotal - totalIncome) / totalIncome) * 100 : 0
    let status: ForecastStatus = 'on_track'
    if (isOverBudget) {
      status = deviationPct > 15 ? 'over_budget' : 'under_budget' // close to budget
      if (deviationPct <= 5) status = 'under_budget'
    } else if (predictedSavings > totalIncome * 0.2) {
      status = 'under_budget'
    }

    // How much can be spent per remaining day to stay on budget
    const projectedDailyForRest = daysRemaining > 0
      ? Math.max(0, totalIncome - totalExpense) / daysRemaining
      : 0

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
      status,
      deviationPct,
      projectedDailyForRest,
    }
  }, [totalExpense, totalIncome, chartData])

  // Bar width percentages (clamped)
  const maxVal = Math.max(forecast.predictedTotal, totalIncome, 1)
  const currentWidthPct = Math.min(100, (totalExpense / maxVal) * 100)
  const predictedWidthPct = Math.min(100, (forecast.predictedTotal / maxVal) * 100)
  const incomeWidthPct = Math.min(100, (totalIncome / maxVal) * 100)

  // Status display helpers
  const statusConfig = useMemo(() => {
    switch (forecast.status) {
      case 'on_track':
        return {
          icon: <CheckCircle2 className="h-3.5 w-3.5" />,
          label: 'В рамках бюджета',
          color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
          barColor: 'bg-emerald-500',
          iconBg: 'bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400',
        }
      case 'over_budget':
        return {
          icon: <AlertTriangle className="h-3.5 w-3.5" />,
          label: 'Превышение бюджета',
          color: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400',
          barColor: 'bg-red-500',
          iconBg: 'bg-red-100 dark:bg-red-950 dark:text-red-400',
        }
      case 'under_budget':
        return {
          icon: <ArrowDown className="h-3.5 w-3.5" />,
          label: 'Ниже бюджета',
          color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400',
          barColor: 'bg-amber-500',
          iconBg: 'bg-amber-100 dark:bg-amber-950 dark:text-amber-400',
        }
    }
  }, [forecast.status])

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
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400">
              <TrendingUp className="h-4 w-4" />
            </div>
            Прогноз
          </CardTitle>
          <Badge
            variant="secondary"
            className={cn('text-[10px] font-semibold gap-1 px-2 py-0.5', statusConfig.color)}
          >
            {statusConfig.icon}
            {statusConfig.label}
          </Badge>
        </div>
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
                    statusConfig.barColor
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

          {/* Allowed daily spend for remainder */}
          {forecast.daysRemaining > 0 && totalIncome > 0 && (
            <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 px-3 py-2">
              <p className="text-[10px] text-muted-foreground mb-0.5">
                💡 Чтобы уложиться в бюджет, тратьте не более:
              </p>
              <p className="text-sm font-bold tabular-nums text-foreground">
                {formatCurrency(forecast.projectedDailyForRest)} <span className="text-xs font-normal text-muted-foreground">/ день</span>
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
