'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'

interface SavingsBalanceBarProps {
  totalIncome: number
  totalExpense: number
  isLoading: boolean
}

export function SavingsBalanceBar({ totalIncome, totalExpense, isLoading }: SavingsBalanceBarProps) {
  const [animatedWidth, setAnimatedWidth] = useState(0)

  const savings = totalIncome - totalExpense
  const hasSavings = savings > 0
  const isOverspending = savings < 0
  const savingsPercent = totalIncome > 0 ? Math.round((Math.abs(savings) / totalIncome) * 100) : 0

  useEffect(() => {
    if (isLoading) return
    // Reset width, then animate to target
    const resetTimer = setTimeout(() => setAnimatedWidth(0), 0)
    const t = setTimeout(() => {
      setAnimatedWidth(totalIncome > 0 ? Math.min(100, savingsPercent) : 0)
    }, 200)
    return () => { clearTimeout(resetTimer); clearTimeout(t) }
  }, [isLoading, totalIncome, savingsPercent])

  if (isLoading) {
    return (
      <Card className="card-hover rounded-xl">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="skeleton-shimmer h-4 w-32 rounded" />
              <div className="skeleton-shimmer h-4 w-24 rounded" />
            </div>
            <div className="skeleton-shimmer h-2 w-full rounded-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="card-hover rounded-xl">
      <CardContent className="p-4 space-y-3">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {hasSavings ? (
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <TrendingUp className="h-3.5 w-3.5" />
              </div>
            ) : isOverspending ? (
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
                <TrendingDown className="h-3.5 w-3.5" />
              </div>
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                <TrendingUp className="h-3.5 w-3.5" />
              </div>
            )}
            <span className="text-sm font-medium">Баланс доходов и расходов</span>
          </div>
          <span className={cn(
            'text-sm font-bold tabular-nums animate-count-fade-in',
            hasSavings && 'text-emerald-600 dark:text-emerald-400',
            isOverspending && 'text-rose-600 dark:text-rose-400',
            !hasSavings && !isOverspending && 'text-muted-foreground',
          )}>
            {hasSavings && 'Накопления: '}
            {isOverspending && 'Перерасход: '}
            {!hasSavings && !isOverspending && 'Накопления: '}
            {formatCurrency(Math.abs(savings))} ₽
            {hasSavings && totalIncome > 0 && (
              <span className="text-xs font-medium ml-1.5 opacity-75">({savingsPercent}%)</span>
            )}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted flex">
          {/* Green savings portion */}
          {hasSavings && (
            <div
              className="h-2 rounded-full bg-emerald-500 transition-all duration-700 ease-out"
              style={{ width: `${animatedWidth}%` }}
            />
          )}
          {/* Red overspending portion */}
          {isOverspending && (
            <div
              className="h-2 rounded-full bg-rose-500 transition-all duration-700 ease-out"
              style={{ width: `${animatedWidth}%` }}
            />
          )}
          {/* Zero state: tiny sliver */}
          {!hasSavings && !isOverspending && (
            <div
              className="h-2 rounded-full bg-slate-400 transition-all duration-700 ease-out"
              style={{ width: '2%' }}
            />
          )}
        </div>

        {/* Mini stats */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="tabular-nums">
            Доходы: <span className="font-medium text-foreground">{formatCurrency(totalIncome)} ₽</span>
          </span>
          <span className="tabular-nums">
            Расходы: <span className="font-medium text-foreground">{formatCurrency(totalExpense)} ₽</span>
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
