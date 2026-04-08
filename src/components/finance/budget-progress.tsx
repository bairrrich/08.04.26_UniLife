'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Target, TrendingUp, TrendingDown, AlertTriangle, ChevronRight, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'
import { toast } from 'sonner'

// ─── Types ──────────────────────────────────────────────────────────────────

interface BudgetItem {
  id: string
  categoryId: string
  categoryName: string
  categoryIcon: string
  categoryColor: string
  amount: number
  spent: number
  period: string
  startDate: string
  endDate: string | null
  percentage: number
}

interface BudgetSummary {
  budgets: BudgetItem[]
  totalBudget: number
  totalSpent: number
  totalRemaining: number
  totalPercentage: number
}

interface BudgetProgressProps {
  month: string
  isLoading?: boolean
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getColorClass(pct: number) {
  if (pct >= 90) return 'text-rose-600 dark:text-rose-400'
  if (pct >= 70) return 'text-amber-600 dark:text-amber-400'
  return 'text-emerald-600 dark:text-emerald-400'
}

function getProgressTrack(pct: number) {
  if (pct >= 90) return 'bg-rose-500/20'
  if (pct >= 70) return 'bg-amber-500/20'
  return 'bg-emerald-500/20'
}

function getProgressIndicator(pct: number) {
  if (pct >= 90) return '[&>div]:bg-rose-500'
  if (pct >= 70) return '[&>div]:bg-amber-500'
  return '[&>div]:bg-emerald-500'
}

function getIconBg(pct: number) {
  if (pct >= 90) return 'bg-rose-100 dark:bg-rose-950 dark:text-rose-400'
  if (pct >= 70) return 'bg-amber-100 dark:bg-amber-950 dark:text-amber-400'
  return 'bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400'
}

function getStatusLabel(pct: number) {
  if (pct >= 100) return 'Превышен!'
  if (pct >= 90) return 'Критично'
  if (pct >= 70) return 'Внимание'
  return 'В норме'
}

function getStatusBadge(pct: number) {
  if (pct >= 90) return 'destructive' as const
  if (pct >= 70) return 'secondary' as const
  return 'default' as const
}

// ─── Component ──────────────────────────────────────────────────────────────

export function BudgetProgress({ month, isLoading: parentLoading }: BudgetProgressProps) {
  const [data, setData] = useState<BudgetSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchBudgets = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/budgets?month=${month}`)
      if (res.ok) {
        const json = await res.json()
        setData(json.data)
      } else {
        setData(null)
      }
    } catch {
      setData(null)
    } finally {
      setIsLoading(false)
    }
  }, [month])

  useEffect(() => { fetchBudgets() }, [fetchBudgets])

  const loading = isLoading || parentLoading

  if (loading) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-7 rounded-lg" />
              <Skeleton className="h-4 w-36" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-3 w-full rounded-full mb-3" />
          <div className="flex justify-between">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
        </CardContent>
      </Card>
    )
  }

  // No budget data — show CTA
  if (!data || data.totalBudget === 0 || data.budgets.length === 0) {
    return (
      <Card className="card-hover overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400/20 to-teal-500/20">
              <Target className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Бюджет на месяц</p>
              <p className="text-xs text-muted-foreground">
                Установите лимиты расходов по категориям для контроля
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="shrink-0 gap-1.5 text-xs"
              onClick={() => toast.info('Перейдите во вкладку «Бюджет» для настройки')}
            >
              <Plus className="h-3 w-3" />
              <span className="hidden sm:inline">Установить</span>
              <ChevronRight className="h-3 w-3 sm:hidden" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const pct = Math.min(data.totalPercentage, 100)
  const overBudget = data.totalSpent > data.totalBudget

  return (
    <Card className="card-hover overflow-hidden">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={cn('flex h-7 w-7 items-center justify-center rounded-lg', getIconBg(data.totalPercentage))}>
              {data.totalPercentage >= 90 ? (
                <AlertTriangle className="h-4 w-4" />
              ) : data.totalPercentage >= 70 ? (
                <TrendingDown className="h-4 w-4" />
              ) : (
                <TrendingUp className="h-4 w-4" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold">Бюджет на месяц</p>
              <p className="text-[11px] text-muted-foreground">
                <span className="font-medium tabular-nums">{formatCurrency(data.totalSpent)}</span>
                {' из '}
                <span className="font-medium tabular-nums">{formatCurrency(data.totalBudget)}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getStatusBadge(data.totalPercentage)} className="tabular-nums text-xs">
              {getStatusLabel(data.totalPercentage)}
            </Badge>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <Progress
            value={pct}
            className={cn('h-2.5', getProgressTrack(data.totalPercentage), getProgressIndicator(data.totalPercentage))}
          />
          <div className="flex items-center justify-between text-[11px]">
            <span className={cn('font-semibold tabular-nums', getColorClass(data.totalPercentage))}>
              {Math.round(data.totalPercentage)}% использовано
            </span>
            <span className="text-muted-foreground">
              {data.budgets.length} {data.budgets.length === 1 ? 'категория' : data.budgets.length < 5 ? 'категории' : 'категорий'}
            </span>
          </div>
        </div>

        {/* Remaining / Overspent */}
        <div className={cn(
          'mt-3 flex items-center justify-between rounded-lg p-2.5',
          overBudget
            ? 'bg-rose-50 dark:bg-rose-950/30'
            : 'bg-emerald-50 dark:bg-emerald-950/30'
        )}>
          <div className="flex items-center gap-1.5">
            {overBudget ? (
              <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
            ) : (
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            )}
            <span className="text-xs font-medium">
              {overBudget ? 'Перерасход' : 'Остаток'}
            </span>
          </div>
          <span className={cn(
            'text-sm font-bold tabular-nums',
            overBudget
              ? 'text-rose-600 dark:text-rose-400'
              : 'text-emerald-600 dark:text-emerald-400'
          )}>
            {overBudget ? '-' : '+'}{formatCurrency(Math.abs(data.totalRemaining))}
          </span>
        </div>

        {/* Top 3 categories approaching limit */}
        {data.budgets.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-[11px] font-medium text-muted-foreground">Статус по категориям</p>
            {data.budgets
              .sort((a, b) => b.percentage - a.percentage)
              .slice(0, 3)
              .map((budget) => (
                <div key={budget.id} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: budget.categoryColor }} />
                  <span className="text-[11px] text-muted-foreground flex-1 truncate">{budget.categoryName}</span>
                  <span className={cn('text-[11px] font-semibold tabular-nums', getColorClass(budget.percentage))}>
                    {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                  </span>
                </div>
              ))}
            {data.budgets.length > 3 && (
              <p className="text-[10px] text-muted-foreground/60 text-center">
                и ещё {data.budgets.length - 3}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
