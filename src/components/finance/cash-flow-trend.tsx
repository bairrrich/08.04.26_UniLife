'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Line, ComposedChart } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { formatCurrency, RU_MONTHS_SHORT } from '@/lib/format'
import type { ChartDataPoint, StatsResponse } from './types'

// ─── Chart Config ────────────────────────────────────────────────────────────

const trendChartConfig: ChartConfig = {
  expense: { label: 'Расходы', color: '#f43f5e' },
  income: { label: 'Доходы', color: '#10b981' },
  balance: { label: 'Баланс', color: '#6366f1' },
  savings: { label: 'Экономия', color: '#06b6d4' },
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface CashFlowTrendProps {
  chartData: ChartDataPoint[]
  stats: StatsResponse | null
  monthLabel: string
  isLoading: boolean
}

type ViewMode = 'day' | 'week' | 'month6'

interface MonthDataPoint {
  label: string
  expense: number
  income: number
  savings: number
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

interface TransformedPoint {
  label: string
  expense: number
  income: number
  balance: number
}

/** Aggregate daily chartData into weekly buckets. */
function aggregateWeekly(data: ChartDataPoint[]): TransformedPoint[] {
  const weeks: TransformedPoint[] = []
  for (let i = 0; i < data.length; i += 7) {
    const chunk = data.slice(i, i + 7)
    const totalExpense = chunk.reduce((s, d) => s + d.expense, 0)
    const totalIncome = chunk.reduce((s, d) => s + d.income, 0)
    weeks.push({
      label: `${chunk[0]?.day ?? ''}–${chunk[chunk.length - 1]?.day ?? ''}`,
      expense: totalExpense,
      income: totalIncome,
      balance: totalIncome - totalExpense,
    })
  }
  return weeks
}

/** Keep daily data, adding a cumulative balance column. */
function toDaily(data: ChartDataPoint[]): TransformedPoint[] {
  let cumulative = 0
  return data.map((d) => {
    cumulative += d.income - d.expense
    return {
      label: d.day,
      expense: d.expense,
      income: d.income,
      balance: cumulative,
    }
  })
}

// ─── Component ───────────────────────────────────────────────────────────────

export function CashFlowTrend({ chartData, stats, monthLabel, isLoading }: CashFlowTrendProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('month6')
  const [monthlyData, setMonthlyData] = useState<MonthDataPoint[]>([])
  const [monthlyLoading, setMonthlyLoading] = useState(false)

  // Fetch 6 months of historical data
  const fetchMonthlyData = useCallback(async () => {
    setMonthlyLoading(true)
    try {
      const now = new Date()
      const months: { label: string; monthStr: string }[] = []
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        const label = RU_MONTHS_SHORT[d.getMonth()]
        months.push({ label, monthStr })
      }

      const results = await Promise.allSettled(
        months.map(async (m) => {
          try {
            const r = await fetch(`/api/finance/stats?month=${m.monthStr}`)
            if (!r.ok) return null
            const json = await r.json()
            const d = json?.data
            return {
              label: m.label,
              expense: (d?.totalExpense as number) ?? 0,
              income: (d?.totalIncome as number) ?? 0,
              savings: ((d?.totalIncome as number) ?? 0) - ((d?.totalExpense as number) ?? 0),
            }
          } catch {
            return null
          }
        })
      )

      const data: MonthDataPoint[] = results
        .filter((r): r is PromiseFulfilledResult<MonthDataPoint> => r.status === 'fulfilled' && r.value !== null)
        .map((r) => r.value)

      setMonthlyData(data)
    } catch (err) {
      console.error('Failed to fetch monthly trend data:', err)
    } finally {
      setMonthlyLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMonthlyData()
  }, [fetchMonthlyData])

  const transformed = useMemo<TransformedPoint[]>(() => {
    if (chartData.length === 0) return []
    return viewMode === 'week' ? aggregateWeekly(chartData) : toDaily(chartData)
  }, [chartData, viewMode])

  const summaryStats = useMemo(() => {
    if (viewMode === 'month6') {
      if (monthlyData.length === 0) return null
      const totalExpense = monthlyData.reduce((s, d) => s + d.expense, 0)
      const totalIncome = monthlyData.reduce((s, d) => s + d.income, 0)
      const avgMonthlySavings = monthlyData.reduce((s, d) => s + d.savings, 0) / monthlyData.length
      const peakExpense = Math.max(...monthlyData.map((d) => d.expense))
      return { avgExpensePerDay: avgMonthlySavings, peakExpense, totalIncome, totalExpense }
    }
    if (chartData.length === 0) return null
    const days = chartData.length
    const totalExpense = chartData.reduce((s, d) => s + d.expense, 0)
    const totalIncome = chartData.reduce((s, d) => s + d.income, 0)
    const avgExpensePerDay = days > 0 ? totalExpense / days : 0
    const peakExpense = Math.max(...chartData.map((d) => d.expense))
    return { avgExpensePerDay, peakExpense, totalIncome }
  }, [chartData, monthlyData, viewMode])

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (isLoading || monthlyLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-8 w-48" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[280px] rounded-xl w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base">Динамика cash flow</CardTitle>
              {stats && viewMode !== 'month6' && (
                <p className="text-xs text-muted-foreground">
                  Баланс: {formatCurrency(stats.balance)}
                </p>
              )}
              {viewMode === 'month6' && monthlyData.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Последние 6 месяцев
                </p>
              )}
            </div>
          </div>

          {/* Tab selector */}
          <div className="flex items-center gap-0.5 rounded-lg bg-muted p-0.5">
            <button
              onClick={() => setViewMode('month6')}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                viewMode === 'month6'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              6 мес
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                viewMode === 'week'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Неделя
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                viewMode === 'day'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              День
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 6-Month Area Chart */}
        {viewMode === 'month6' && monthlyData.length > 0 ? (
          <>
            <ChartContainer config={trendChartConfig} className="h-[280px] w-full">
              <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="mIncomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="mExpenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v: number) => `${(Math.abs(v) / 1000).toFixed(0)}к`}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => (
                        <span className="tabular-nums font-medium">
                          {formatCurrency(Number(value))}
                        </span>
                      )}
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#mIncomeGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  fill="url(#mExpenseGrad)"
                />
                <Line
                  type="monotone"
                  dataKey="savings"
                  stroke="#6366f1"
                  strokeWidth={2}
                  strokeDasharray="6 3"
                  dot={{ r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              </AreaChart>
            </ChartContainer>

            {/* Legend for 6-month chart */}
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="text-muted-foreground">Доходы</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                <span className="text-muted-foreground">Расходы</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-6 rounded-full border-t-2 border-dashed border-indigo-500" />
                <span className="text-muted-foreground">Экономия</span>
              </span>
            </div>
          </>
        ) : (
          <>
            <ChartContainer config={trendChartConfig} className="h-[250px] w-full">
              <ComposedChart data={transformed} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                  interval={viewMode === 'day' ? Math.floor(transformed.length / 10) : 0}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v: number) => `${(Math.abs(v) / 1000).toFixed(0)}к`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />

                {/* Areas */}
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  fill="url(#expenseGradient)"
                  stackId="1"
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#incomeGradient)"
                  stackId="2"
                />

                {/* Cumulative balance line */}
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="#6366f1"
                  strokeWidth={2}
                  strokeDasharray="6 3"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
              </ComposedChart>
            </ChartContainer>

            {/* Legend for day/week chart */}
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="text-muted-foreground">Доходы</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                <span className="text-muted-foreground">Расходы</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-6 rounded-full border-t-2 border-dashed border-indigo-500" />
                <span className="text-muted-foreground">Баланс</span>
              </span>
            </div>
          </>
        )}

        {/* Summary row */}
        {summaryStats && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            {viewMode === 'month6' && summaryStats.totalIncome !== undefined && (
              <>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  Средняя экономия/мес: {formatCurrency(summaryStats.avgExpensePerDay)}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                  Макс. расходы: {formatCurrency(summaryStats.peakExpense)}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                  Всего доходов: {formatCurrency(summaryStats.totalIncome!)}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                  Всего расходов: {formatCurrency(summaryStats.totalExpense!)}
                </span>
              </>
            )}
            {viewMode !== 'month6' && (
              <>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                  Средний расход/день: {formatCurrency(summaryStats.avgExpensePerDay)}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                  Пиковый расход: {formatCurrency(summaryStats.peakExpense)}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  Всего доходов: {formatCurrency(summaryStats.totalIncome)}
                </span>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
