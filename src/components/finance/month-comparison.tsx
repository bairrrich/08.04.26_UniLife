'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeftRight, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'

// ─── Props ──────────────────────────────────────────────────────────────────

interface MonthComparisonProps {
  currentStats: {
    totalIncome: number
    totalExpense: number
    balance: number
    savingsRate: number
  } | null
  previousStats: {
    totalIncome: number
    totalExpense: number
    balance: number
    savingsRate: number
  } | null
  monthLabel: string
  isLoading: boolean
}

// ─── Types ──────────────────────────────────────────────────────────────────

interface ComparisonRow {
  label: string
  icon: React.ReactNode
  current: number
  previous: number
  invertGoodBad: boolean // for expenses: decrease = good
  isPercentage?: boolean
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function computeChange(current: number, previous: number): number | null {
  if (previous === 0) return null
  return ((current - previous) / Math.abs(previous)) * 100
}

function ChangeIndicator({
  current,
  previous,
  invertGoodBad = false,
  isPercentage = false,
}: {
  current: number
  previous: number
  invertGoodBad?: boolean
  isPercentage?: boolean
}) {
  const change = computeChange(current, previous)
  if (change === null) return null

  const isPositive = change > 0
  const isZero = Math.abs(change) < 0.01
  if (isZero) return null

  const isGood = invertGoodBad ? !isPositive : isPositive
  const Icon = isPositive ? TrendingUp : TrendingDown

  return (
    <Badge
      variant="secondary"
      className={cn(
        'gap-0.5 text-[10px] font-semibold tabular-nums',
        isGood
          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
          : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'
      )}
    >
      <Icon className="h-2.5 w-2.5" />
      {isPositive ? '+' : ''}
      {change.toFixed(1)}%
    </Badge>
  )
}

function ComparisonBar({
  current,
  previous,
  invertGoodBad,
}: {
  current: number
  previous: number
  invertGoodBad: boolean
}) {
  const maxVal = Math.max(Math.abs(current), Math.abs(previous), 1)
  const currentWidth = Math.min(100, (Math.abs(current) / maxVal) * 100)
  const previousWidth = Math.min(100, (Math.abs(previous) / maxVal) * 100)

  const currentColor = current >= 0
    ? invertGoodBad ? 'bg-amber-500' : 'bg-emerald-500'
    : 'bg-rose-500'

  const previousColor = previous >= 0
    ? invertGoodBad ? 'bg-amber-400/50' : 'bg-emerald-400/50'
    : 'bg-rose-400/50'

  return (
    <div className="flex items-center gap-1.5 flex-1 min-w-0">
      {/* Current bar */}
      <div className="flex-1">
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn('h-full rounded-full transition-all duration-500', currentColor)}
            style={{ width: `${currentWidth}%` }}
          />
        </div>
      </div>
      {/* Previous bar */}
      <div className="flex-1">
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn('h-full rounded-full transition-all duration-500', previousColor)}
            style={{ width: `${previousWidth}%` }}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Component ──────────────────────────────────────────────────────────────

export function MonthComparison({
  currentStats,
  previousStats,
  monthLabel,
  isLoading,
}: MonthComparisonProps) {
  const rows: ComparisonRow[] = useMemo(() => {
    if (!currentStats) return []
    return [
      {
        label: 'Доходы',
        icon: <TrendingUp className="h-4 w-4 text-emerald-500" />,
        current: currentStats.totalIncome,
        previous: previousStats?.totalIncome ?? 0,
        invertGoodBad: false,
      },
      {
        label: 'Расходы',
        icon: <TrendingDown className="h-4 w-4 text-rose-500" />,
        current: currentStats.totalExpense,
        previous: previousStats?.totalExpense ?? 0,
        invertGoodBad: true,
      },
      {
        label: 'Баланс',
        icon: (
          <div className="flex h-4 w-4 items-center justify-center">
            <span className="text-xs font-bold text-blue-500">±</span>
          </div>
        ),
        current: currentStats.balance,
        previous: previousStats?.balance ?? 0,
        invertGoodBad: false,
      },
    ]
  }, [currentStats, previousStats])

  if (isLoading) {
    return (
      <Card className="card-hover">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-56" />
        </CardHeader>
        <CardContent>
          <div className="space-y-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!currentStats) {
    return (
      <Card className="card-hover">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400">
              <ArrowLeftRight className="h-4 w-4" />
            </div>
            Сравнение с прошлым месяцем
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6">
            <p className="text-sm text-muted-foreground">Нет данных за текущий месяц</p>
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
            <ArrowLeftRight className="h-4 w-4" />
          </div>
          Сравнение с прошлым месяцем
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!previousStats ? (
          <div className="flex flex-col items-center justify-center py-6 rounded-xl bg-muted/30">
            <ArrowLeftRight className="h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">Нет данных за прошлый месяц</p>
          </div>
        ) : (
          <div className="space-y-4">
            {rows.map((row) => (
              <div
                key={row.label}
                className="rounded-xl bg-muted/40 p-3.5"
              >
                {/* Row Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {row.icon}
                    <span className="text-xs font-medium text-muted-foreground">
                      {row.label}
                    </span>
                  </div>
                  <ChangeIndicator
                    current={row.current}
                    previous={row.previous}
                    invertGoodBad={row.invertGoodBad}
                  />
                </div>

                {/* Amounts + Bars */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  {/* Current Amount */}
                  <div className="sm:min-w-[80px] sm:text-right">
                    <p className="text-xs text-muted-foreground">Текущий</p>
                    <p className="text-sm font-bold tabular-nums">
                      {formatCurrency(row.current)}
                    </p>
                  </div>

                  {/* Bars */}
                  <ComparisonBar
                    current={row.current}
                    previous={row.previous}
                    invertGoodBad={row.invertGoodBad}
                  />

                  {/* Previous Amount */}
                  <div className="sm:min-w-[80px]">
                    <p className="text-xs text-muted-foreground">Прошлый</p>
                    <p className="text-sm font-bold tabular-nums text-muted-foreground">
                      {formatCurrency(row.previous)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
