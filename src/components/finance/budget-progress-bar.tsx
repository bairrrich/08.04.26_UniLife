'use client'

import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface BudgetProgressBarProps {
  totalIncome: number
  totalExpense: number
  isLoading: boolean
}

export function BudgetProgressBar({ totalIncome, totalExpense, isLoading }: BudgetProgressBarProps) {
  const data = useMemo(() => {
    const ratio = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0
    const remaining = totalIncome - totalExpense
    const isOverBudget = totalExpense > totalIncome
    const safeRatio = Math.min(ratio, 100)
    return { ratio, remaining, isOverBudget, safeRatio }
  }, [totalIncome, totalExpense])

  if (isLoading) {
    return <div className="skeleton-shimmer h-20 rounded-xl" />
  }

  const getBarColor = () => {
    if (data.ratio <= 50) return 'from-emerald-400 to-emerald-500'
    if (data.ratio <= 75) return 'from-amber-400 to-amber-500'
    if (data.ratio <= 100) return 'from-orange-400 to-orange-500'
    return 'from-red-400 to-red-500'
  }

  const getTextColor = () => {
    if (data.ratio <= 50) return 'text-emerald-600 dark:text-emerald-400'
    if (data.ratio <= 75) return 'text-amber-600 dark:text-amber-400'
    if (data.ratio <= 100) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getIcon = () => {
    if (data.ratio <= 75) return <TrendingUp className="h-4 w-4" />
    if (data.ratio <= 100) return <AlertCircle className="h-4 w-4" />
    return <TrendingDown className="h-4 w-4" />
  }

  return (
    <TooltipProvider>
      <Card className="card-hover overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div className={cn('flex h-7 w-7 items-center justify-center rounded-lg', getTextColor().replace('text-', 'bg-').replace('-400', '-100').replace('-500', '-100').replace('-600', '-100'), 'dark:bg-opacity-20')}>
                {getIcon()}
              </div>
              <div>
                <p className="text-sm font-semibold">Бюджет месяца</p>
                <p className="text-[11px] text-muted-foreground">
                  Потрачено <span className="font-medium tabular-nums">{formatCurrency(totalExpense)}</span> из <span className="font-medium tabular-nums">{formatCurrency(totalIncome)}</span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className={cn('text-lg font-bold tabular-nums', getTextColor())}>
                {Math.round(data.ratio)}%
              </p>
              <p className="text-[10px] text-muted-foreground">
                {data.isOverBudget ? (
                  <span className="text-red-500">Перерасход {formatCurrency(Math.abs(data.remaining))}</span>
                ) : (
                  <span>Осталось {formatCurrency(data.remaining)}</span>
                )}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
            {/* Background segments */}
            <div className="absolute inset-0 flex">
              <div className="w-1/2 bg-emerald-100 dark:bg-emerald-900/30 border-r border-emerald-200 dark:border-emerald-800/40" />
              <div className="w-1/4 bg-amber-100 dark:bg-amber-900/30 border-r border-amber-200 dark:border-amber-800/40" />
              <div className="flex-1 bg-red-100 dark:bg-red-900/30" />
            </div>
            {/* Filled bar */}
            <div
              className={cn(
                'absolute inset-y-0 left-0 rounded-full bg-gradient-to-r transition-all duration-700 ease-out',
                getBarColor()
              )}
              style={{ width: `${data.safeRatio}%` }}
            />
            {/* Labels */}
            <div className="absolute inset-0 flex items-center justify-between px-1">
              <span className="text-[8px] font-medium text-muted-foreground/60">50%</span>
              <span className="text-[8px] font-medium text-muted-foreground/60">75%</span>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-2 flex items-center gap-4 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>Норма</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-amber-400" />
              <span>Внимание</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-red-400" />
              <span>Перерасход</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
