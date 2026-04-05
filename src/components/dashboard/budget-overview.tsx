'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PiggyBank, Plus, ArrowRight, TrendingDown } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface BudgetCategory {
  id: string
  categoryId: string
  categoryName: string
  categoryIcon: string
  categoryColor: string
  amount: number
  spent: number
  percentage: number
}

interface BudgetData {
  budgets: BudgetCategory[]
  totalBudget: number
  totalSpent: number
  totalRemaining: number
  totalPercentage: number
}

interface BudgetOverviewProps {
  loading: boolean
  budgetData: BudgetData | null
  onNavigateToFinance: () => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function getProgressColor(pct: number): string {
  if (pct < 70) return 'bg-emerald-500'
  if (pct < 90) return 'bg-amber-500'
  return 'bg-red-500'
}

function getProgressTrackColor(pct: number): string {
  if (pct < 70) return 'bg-emerald-100 dark:bg-emerald-900/30'
  if (pct < 90) return 'bg-amber-100 dark:bg-amber-900/30'
  return 'bg-red-100 dark:bg-red-900/30'
}

function getProgressTextColor(pct: number): string {
  if (pct < 70) return 'text-emerald-600 dark:text-emerald-400'
  if (pct < 90) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BudgetOverview({ loading, budgetData, onNavigateToFinance }: BudgetOverviewProps) {
  if (loading) {
    return (
      <Card className="card-hover rounded-xl border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-5 w-36" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-48" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // No budgets state
  if (!budgetData || budgetData.budgets.length === 0) {
    return (
      <Card className="card-hover rounded-xl border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/50">
              <PiggyBank className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            Бюджет на месяц
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-950/40 dark:to-orange-950/30">
              <PiggyBank className="h-6 w-6 text-amber-500" />
            </div>
            <p className="text-sm text-muted-foreground">
              Нет активных бюджетов
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Установите лимиты расходов по категориям
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 gap-1.5"
              onClick={onNavigateToFinance}
            >
              <Plus className="h-3.5 w-3.5" />
              Создать бюджет
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const topBudgets = budgetData.budgets.slice(0, 3)
  const { totalBudget, totalSpent, totalRemaining, totalPercentage } = budgetData

  return (
    <Card className="animate-slide-up card-hover rounded-xl border">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/50">
            <PiggyBank className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          Бюджет на месяц
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-muted-foreground"
          onClick={onNavigateToFinance}
        >
          Все
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Потрачено
            </span>
            <span className={`text-sm font-semibold tabular-nums ${getProgressTextColor(totalPercentage)}`}>
              {formatCurrency(totalSpent)} из {formatCurrency(totalBudget)}
            </span>
          </div>
          <div className={`h-2.5 w-full overflow-hidden rounded-full ${getProgressTrackColor(totalPercentage)}`}>
            <div
              className={`h-full rounded-full transition-all duration-500 ${getProgressColor(totalPercentage)}`}
              style={{ width: `${Math.min(totalPercentage, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Осталось{' '}
            <span className={`font-semibold tabular-nums ${getProgressTextColor(totalPercentage)}`}>
              {formatCurrency(totalRemaining)}
            </span>
          </p>
        </div>

        {/* Category breakdowns */}
        <div className="stagger-children space-y-3">
          {topBudgets.map((budget) => (
            <div key={budget.id} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: budget.categoryColor || '#6b7280' }}
                  />
                  <span className="text-sm font-medium">{budget.categoryName}</span>
                </div>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                </span>
              </div>
              <div className={`h-1.5 w-full overflow-hidden rounded-full ${getProgressTrackColor(budget.percentage)}`}>
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getProgressColor(budget.percentage)}`}
                  style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Warning if over budget */}
        {totalPercentage >= 90 && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 dark:bg-red-950/20">
            <TrendingDown className="h-4 w-4 shrink-0 text-red-500" />
            <p className="text-xs font-medium text-red-600 dark:text-red-400">
              {totalPercentage >= 100
                ? `Бюджет превышен на ${formatCurrency(totalSpent - totalBudget)}!`
                : `Осталось менее 10% бюджета. Будьте внимательны!`
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
