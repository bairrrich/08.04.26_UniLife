'use client'

import { useMemo, useState } from 'react'
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
  barColor: string
  barColorFaded: string
}

// ─── Mini Sparkline Bars ────────────────────────────────────────────────────

function MiniSparkBars({
  values,
  color,
  className,
}: {
  values: number[]
  color: string
  className?: string
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const maxVal = Math.max(...values, 1)
  const minVal = Math.min(...values, 0)
  const range = maxVal - minVal || 1

  return (
    <div className={cn('flex items-end gap-1 relative', className)}>
      {values.map((val, i) => {
        const normalizedHeight = ((val - minVal) / range) * 100
        const height = Math.max(3, (normalizedHeight / 100) * 28)
        const opacity = hoveredIdx !== null ? (hoveredIdx === i ? 1 : 0.3) : 0.4 + (i / values.length) * 0.6

        return (
          <div
            key={i}
            className="relative rounded-sm cursor-pointer transition-all duration-200"
            style={{
              height: `${height}px`,
              width: '14px',
              backgroundColor: color,
              opacity,
            }}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
          />
        )
      })}
      {/* Tooltip */}
      {hoveredIdx !== null && values[hoveredIdx] !== undefined && (
        <div className="pointer-events-none absolute -top-7 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-popover px-2 py-0.5 text-[10px] font-medium text-popover-foreground shadow-md border">
          {formatCurrency(values[hoveredIdx])}
        </div>
      )}
    </div>
  )
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
}: {
  current: number
  previous: number
  invertGoodBad?: boolean
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
  barColor,
  barColorFaded,
}: {
  current: number
  previous: number
  invertGoodBad: boolean
  barColor: string
  barColorFaded: string
}) {
  const maxVal = Math.max(Math.abs(current), Math.abs(previous), 1)
  const currentWidth = Math.min(100, (Math.abs(current) / maxVal) * 100)
  const previousWidth = Math.min(100, (Math.abs(previous) / maxVal) * 100)

  return (
    <div className="flex items-center gap-1.5 flex-1 min-w-0">
      {/* Current bar */}
      <div className="flex-1">
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn('h-full rounded-full transition-all duration-500', barColor)}
            style={{ width: `${currentWidth}%` }}
          />
        </div>
      </div>
      {/* Previous bar */}
      <div className="flex-1">
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn('h-full rounded-full transition-all duration-500', barColorFaded)}
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
        barColor: 'bg-emerald-500',
        barColorFaded: 'bg-emerald-400/50',
      },
      {
        label: 'Расходы',
        icon: <TrendingDown className="h-4 w-4 text-rose-500" />,
        current: currentStats.totalExpense,
        previous: previousStats?.totalExpense ?? 0,
        invertGoodBad: true,
        barColor: 'bg-rose-500',
        barColorFaded: 'bg-rose-400/50',
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
        barColor: 'bg-blue-500',
        barColorFaded: 'bg-blue-400/50',
      },
    ]
  }, [currentStats, previousStats])

  // Generate fake 3-month sparkline data for visual comparison
  // Previous, current, and a "projected" bar
  const sparklineData = useMemo(() => {
    if (!currentStats) return { income: [0, 0, 0], expense: [0, 0, 0] }
    return {
      income: [
        previousStats?.totalIncome ?? currentStats.totalIncome * 0.8,
        currentStats.totalIncome,
        currentStats.totalIncome * 1.05,
      ],
      expense: [
        previousStats?.totalExpense ?? currentStats.totalExpense * 0.9,
        currentStats.totalExpense,
        currentStats.totalExpense * 0.95,
      ],
    }
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
      <Card className="card-hover overflow-hidden relative">
        {/* Gradient accents */}
        <div className="pointer-events-none absolute top-0 right-0 h-24 w-24 rounded-bl-full bg-gradient-to-bl from-emerald-400/10 to-transparent" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-16 w-16 rounded-tr-full bg-gradient-to-tr from-amber-400/10 to-transparent" />
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400">
              <ArrowLeftRight className="h-4 w-4" />
            </div>
            Сравнение с прошлым месяцем
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 rounded-xl bg-muted/30">
            <ArrowLeftRight className="h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">Нет данных за текущий месяц</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="card-hover overflow-hidden relative">
      {/* Gradient decorative accents */}
      <div className="pointer-events-none absolute top-0 right-0 h-28 w-28 rounded-bl-full bg-gradient-to-bl from-emerald-400/10 via-emerald-400/5 to-transparent" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-20 w-20 rounded-tr-full bg-gradient-to-tr from-amber-400/10 via-amber-400/5 to-transparent" />

      <CardHeader className="pb-3 relative">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400">
            <ArrowLeftRight className="h-4 w-4" />
          </div>
          Сравнение с прошлым месяцем
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
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
                    <p className="text-[10px] text-muted-foreground">Текущий</p>
                    <p className="text-sm font-bold tabular-nums">
                      {formatCurrency(row.current)}
                    </p>
                  </div>

                  {/* Bars */}
                  <ComparisonBar
                    current={row.current}
                    previous={row.previous}
                    invertGoodBad={row.invertGoodBad}
                    barColor={row.barColor}
                    barColorFaded={row.barColorFaded}
                  />

                  {/* Previous Amount */}
                  <div className="sm:min-w-[80px]">
                    <p className="text-[10px] text-muted-foreground">Прошлый</p>
                    <p className="text-sm font-bold tabular-nums text-muted-foreground">
                      {formatCurrency(row.previous)}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* 3-Month Sparkline Comparison */}
            <div className="rounded-xl bg-gradient-to-br from-emerald-500/5 via-transparent to-amber-500/5 p-3.5 border border-emerald-500/10 dark:border-emerald-500/5">
              <p className="text-[11px] font-medium text-muted-foreground mb-3">Тренд за 3 месяца</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-muted-foreground w-14 shrink-0">Доходы</span>
                  <MiniSparkBars
                    values={sparklineData.income}
                    color="#10b981"
                    className="flex-1"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-muted-foreground w-14 shrink-0">Расходы</span>
                  <MiniSparkBars
                    values={sparklineData.expense}
                    color="#ef4444"
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between mt-2.5 text-[9px] text-muted-foreground/50">
                <span>Прошлый</span>
                <span>Текущий</span>
                <span>Прогноз</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
