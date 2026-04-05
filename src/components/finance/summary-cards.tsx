'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Receipt } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { StatsResponse, Transaction } from './types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Compute daily aggregated data for the last N days from transactions */
function computeDailyData(transactions: Transaction[], type: 'INCOME' | 'EXPENSE', days = 10): { label: string; value: number }[] {
  const now = new Date()
  const result: { label: string; value: number }[] = []

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const dayLabel = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
    const dayTotal = transactions
      .filter((t) => t.type === type && t.date.split('T')[0] === dateStr)
      .reduce((sum, t) => sum + t.amount, 0)
    result.push({ label: dayLabel, value: dayTotal })
  }
  return result
}

/** Compute cumulative daily balance data for the last N days */
function computeBalanceData(transactions: Transaction[], days = 10): { label: string; value: number }[] {
  const now = new Date()
  const result: { label: string; value: number }[] = []
  let cumulative = 0

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const dayLabel = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
    const dayIncome = transactions
      .filter((t) => t.type === 'INCOME' && t.date.split('T')[0] === dateStr)
      .reduce((sum, t) => sum + t.amount, 0)
    const dayExpense = transactions
      .filter((t) => t.type === 'EXPENSE' && t.date.split('T')[0] === dateStr)
      .reduce((sum, t) => sum + t.amount, 0)
    cumulative += dayIncome - dayExpense
    result.push({ label: dayLabel, value: cumulative })
  }
  return result
}

/** Compute daily transaction count for the last N days */
function computeCountData(transactions: Transaction[], days = 10): { label: string; value: number }[] {
  const now = new Date()
  const result: { label: string; value: number }[] = []

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const dayLabel = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
    const dayCount = transactions.filter((t) => t.date.split('T')[0] === dateStr).length
    result.push({ label: dayLabel, value: dayCount })
  }
  return result
}

/** Compute daily savings rate for the last N days */
function computeSavingsData(transactions: Transaction[], days = 10): { label: string; value: number }[] {
  const now = new Date()
  const result: { label: string; value: number }[] = []

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const dayLabel = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
    const dayIncome = transactions
      .filter((t) => t.type === 'INCOME' && t.date.split('T')[0] === dateStr)
      .reduce((sum, t) => sum + t.amount, 0)
    const dayExpense = transactions
      .filter((t) => t.type === 'EXPENSE' && t.date.split('T')[0] === dateStr)
      .reduce((sum, t) => sum + t.amount, 0)
    const rate = dayIncome > 0 ? ((dayIncome - dayExpense) / dayIncome) * 100 : 0
    result.push({ label: dayLabel, value: Math.max(0, rate) })
  }
  return result
}

// ─── MiniSparkline ────────────────────────────────────────────────────────────

function MiniSparkline({ data, color, className }: { data: { label: string; value: number }[]; color: string; className?: string }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const values = data.map((d) => d.value)
  const maxVal = Math.max(...values, 1)
  const minVal = Math.min(...values, 0)
  const range = maxVal - minVal || 1

  return (
    <div className={cn('sparkline-container', className)}>
      {data.map((item, i) => {
        const normalizedHeight = ((item.value - minVal) / range) * 100
        const height = Math.max(2, (normalizedHeight / 100) * 22)
        const opacity = 0.35 + (i / data.length) * 0.65

        return (
          <div
            key={i}
            className="sparkline-bar cursor-pointer"
            style={{
              height: `${height}px`,
              backgroundColor: color,
              opacity: hoveredIndex !== null ? (hoveredIndex === i ? 1 : 0.4) : opacity,
            }}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          />
        )
      })}
      {/* Tooltip on hover */}
      {hoveredIndex !== null && data[hoveredIndex] && (
        <div className="pointer-events-none absolute -top-7 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-popover px-1.5 py-0.5 text-[10px] font-medium text-popover-foreground shadow-md border">
          {data[hoveredIndex].label}: {data[hoveredIndex].value.toLocaleString('ru-RU')}
        </div>
      )}
    </div>
  )
}

// ─── Change Badge ─────────────────────────────────────────────────────────────

interface ChangeBadgeProps {
  current: number
  previous: number | null | undefined
  invertGoodBad?: boolean // true for expenses (down = good)
  unit?: string
}

function ChangeBadge({ current, previous, invertGoodBad = false, unit = '%' }: ChangeBadgeProps) {
  if (previous == null || previous === 0) return null

  let change: number
  if (unit === '%') {
    // Savings rate: difference in percentage points
    change = current - previous
  } else {
    change = ((current - previous) / Math.abs(previous)) * 100
  }

  const isPositive = change > 0
  const isZero = change === 0
  if (isZero) return null

  // For expenses: down is good (green), up is bad (red)
  const isGood = invertGoodBad ? !isPositive : isPositive
  const Icon = isPositive ? TrendingUp : TrendingDown

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums',
        isGood
          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
          : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
      )}
    >
      <Icon className="h-2.5 w-2.5" />
      {Math.abs(change).toFixed(1)}{unit}
    </span>
  )
}

// ─── Summary Cards ────────────────────────────────────────────────────────────

interface SummaryCardsProps {
  stats: StatsResponse | null
  isLoading: boolean
  transactions: Transaction[]
  previousMonthStats: StatsResponse | null
}

export function SummaryCards({ stats, isLoading, transactions, previousMonthStats }: SummaryCardsProps) {
  // Pre-compute sparkline data from real transactions
  const incomeSparkline = useMemo(() => computeDailyData(transactions, 'INCOME'), [transactions])
  const expenseSparkline = useMemo(() => computeDailyData(transactions, 'EXPENSE'), [transactions])
  const balanceSparkline = useMemo(() => computeBalanceData(transactions), [transactions])
  const savingsSparkline = useMemo(() => computeSavingsData(transactions), [transactions])
  const countSparkline = useMemo(() => computeCountData(transactions), [transactions])
  const txCount = transactions.length

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton-shimmer h-[100px] rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5 stagger-children">
      {/* Income Card */}
      <Card className="card-hover border-l-4 border-l-emerald-500 py-4">
        <CardContent className="px-4 py-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span className="text-xs font-medium">Доходы</span>
            </div>
            <MiniSparkline data={incomeSparkline} color="#10b981" />
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <p className="text-lg font-bold text-emerald-600 tabular-nums dark:text-emerald-400">
              {formatCurrency(stats?.totalIncome ?? 0)}
            </p>
            <ChangeBadge
              current={stats?.totalIncome ?? 0}
              previous={previousMonthStats?.totalIncome}
            />
          </div>
        </CardContent>
      </Card>

      {/* Expenses Card */}
      <Card className="card-hover border-l-4 border-l-red-500 py-4">
        <CardContent className="px-4 py-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingDown className="h-4 w-4 text-red-500" />
              <span className="text-xs font-medium">Расходы</span>
            </div>
            <MiniSparkline data={expenseSparkline} color="#ef4444" />
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <p className="text-lg font-bold text-red-500 tabular-nums dark:text-red-400">
              {formatCurrency(stats?.totalExpense ?? 0)}
            </p>
            <ChangeBadge
              current={stats?.totalExpense ?? 0}
              previous={previousMonthStats?.totalExpense}
              invertGoodBad
            />
          </div>
        </CardContent>
      </Card>

      {/* Balance Card */}
      <Card className="card-hover border-l-4 border-l-blue-500 py-4">
        <CardContent className="px-4 py-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Wallet className="h-4 w-4 text-blue-500" />
              <span className="text-xs font-medium">Баланс</span>
            </div>
            <MiniSparkline data={balanceSparkline} color="#3b82f6" />
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <p className={cn('text-lg font-bold tabular-nums', (stats?.balance ?? 0) >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-500 dark:text-red-400')}>
              {formatCurrency(stats?.balance ?? 0)}
            </p>
            <ChangeBadge
              current={stats?.balance ?? 0}
              previous={previousMonthStats?.balance}
            />
          </div>
        </CardContent>
      </Card>

      {/* Savings Rate Card */}
      <Card className="card-hover border-l-4 border-l-amber-500 py-4">
        <CardContent className="px-4 py-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <PiggyBank className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-medium">Сбережения</span>
            </div>
            <MiniSparkline data={savingsSparkline} color="#f59e0b" />
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <p className="text-lg font-bold text-amber-600 tabular-nums dark:text-amber-400">
              {stats?.savingsRate != null ? `${Math.round(stats.savingsRate)}%` : '0%'}
            </p>
            <ChangeBadge
              current={stats?.savingsRate ?? 0}
              previous={previousMonthStats?.savingsRate}
              unit="%"
            />
          </div>
        </CardContent>
      </Card>

      {/* Transactions Count Card */}
      <Card className="card-hover border-l-4 border-l-slate-400 py-4 dark:border-l-slate-500">
        <CardContent className="px-4 py-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Receipt className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              <span className="text-xs font-medium">Транзакций</span>
            </div>
            <MiniSparkline data={countSparkline} color="#64748b" />
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <p className="text-lg font-bold text-slate-600 tabular-nums dark:text-slate-300">
              {txCount}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
