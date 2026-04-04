'use client'

import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import type { StatsResponse } from './types'

// ─── MiniSparkline (small enough to inline) ────────────────────────────────

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const maxVal = Math.max(...data)
  const minVal = Math.min(...data)
  const range = maxVal - minVal || 1

  return (
    <div className="sparkline-container">
      {data.map((val, i) => {
        const height = 4 + ((val - minVal) / range) * 16
        return (
          <div
            key={i}
            className="sparkline-bar"
            style={{ height: `${height}px`, backgroundColor: color, opacity: 0.4 + (i / data.length) * 0.6 }}
          />
        )
      })}
    </div>
  )
}

// ─── Summary Cards ─────────────────────────────────────────────────────────

interface SummaryCardsProps {
  stats: StatsResponse | null
  isLoading: boolean
}

export function SummaryCards({ stats, isLoading }: SummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton-shimmer h-[100px] rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 stagger-children">
      <Card className="card-hover border-l-4 border-l-emerald-500 py-4">
        <CardContent className="px-4 py-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span className="text-xs font-medium">Доходы</span>
            </div>
            <MiniSparkline data={[3000, 3500, 3200, 4000, 4500]} color="#10b981" />
          </div>
          <p className="mt-1 text-lg font-bold text-emerald-600 tabular-nums">
            {formatCurrency(stats?.totalIncome ?? 0)}
          </p>
        </CardContent>
      </Card>

      <Card className="card-hover border-l-4 border-l-red-500 py-4">
        <CardContent className="px-4 py-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingDown className="h-4 w-4 text-red-500" />
              <span className="text-xs font-medium">Расходы</span>
            </div>
            <MiniSparkline data={[2800, 3100, 2600, 2900, 2500]} color="#ef4444" />
          </div>
          <p className="mt-1 text-lg font-bold text-red-500 tabular-nums">
            {formatCurrency(stats?.totalExpense ?? 0)}
          </p>
        </CardContent>
      </Card>

      <Card className="card-hover border-l-4 border-l-blue-500 py-4">
        <CardContent className="px-4 py-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Wallet className="h-4 w-4 text-blue-500" />
              <span className="text-xs font-medium">Баланс</span>
            </div>
            <MiniSparkline data={[200, 400, 600, 700, 1000]} color="#3b82f6" />
          </div>
          <p className={`mt-1 text-lg font-bold tabular-nums ${(stats?.balance ?? 0) >= 0 ? 'text-blue-600' : 'text-red-500'}`}>
            {formatCurrency(stats?.balance ?? 0)}
          </p>
        </CardContent>
      </Card>

      <Card className="card-hover border-l-4 border-l-amber-500 py-4">
        <CardContent className="px-4 py-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <PiggyBank className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-medium">Сбережения</span>
            </div>
            <MiniSparkline data={[10, 15, 18, 22, 28]} color="#f59e0b" />
          </div>
          <p className="mt-1 text-lg font-bold text-amber-600 tabular-nums">
            {stats?.savingsRate != null ? `${Math.round(stats.savingsRate)}%` : '0%'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
