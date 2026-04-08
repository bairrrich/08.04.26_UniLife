'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Wallet, ArrowRight, TrendingDown } from 'lucide-react'

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
  if (pct <= 80) return 'bg-emerald-500'
  if (pct <= 100) return 'bg-amber-500'
  return 'bg-rose-500'
}

function getProgressTrackColor(pct: number): string {
  if (pct <= 80) return 'bg-emerald-100 dark:bg-emerald-900/30'
  if (pct <= 100) return 'bg-amber-100 dark:bg-amber-900/30'
  return 'bg-rose-100 dark:bg-rose-900/30'
}

function getProgressTextColor(pct: number): string {
  if (pct <= 80) return 'text-emerald-600 dark:text-emerald-400'
  if (pct <= 100) return 'text-amber-600 dark:text-amber-400'
  return 'text-rose-600 dark:text-rose-400'
}

function getRemainingColor(remaining: number, totalBudget: number, totalSpent: number): string {
  if (totalSpent > totalBudget) return 'text-rose-600 dark:text-rose-400'
  if (remaining <= 0) return 'text-rose-600 dark:text-rose-400'
  return 'text-emerald-600 dark:text-emerald-400'
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BudgetOverview({ loading, budgetData, onNavigateToFinance }: BudgetOverviewProps) {
  // ── Loading skeleton ──
  if (loading) {
    return (
      <Card className="card-hover rounded-xl border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-7 rounded-lg" />
            <Skeleton className="h-5 w-24" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Total budget amounts */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-2.5 w-full rounded-full" />
            <Skeleton className="h-3 w-40" />
          </div>
          {/* Category items */}
          <div className="space-y-3 pt-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
          {/* Footer link */}
          <Skeleton className="h-4 w-20 pt-2" />
        </CardContent>
      </Card>
    )
  }

  // ── Empty state ──
  if (!budgetData || budgetData.budgets.length === 0) {
    return (
      <Card className="card-hover rounded-xl border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
              <Wallet className="h-4 w-4 text-emerald-500" />
            </div>
            Бюджет
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-950/40 dark:to-teal-950/30">
              <Wallet className="h-6 w-6 text-emerald-500" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Установите бюджет в разделе Финансы
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Контролируйте расходы по категориям
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 gap-1.5 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
              onClick={onNavigateToFinance}
            >
              Открыть финансы
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // ── Data view ──
  const { totalBudget, totalSpent, totalRemaining, totalPercentage } = budgetData

  // Sort budgets by spent amount descending, take top 3
  const topCategories = [...budgetData.budgets]
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 3)

  // Calculate percentage of total spending for each category
  const topWithPct = topCategories.map((cat) => ({
    ...cat,
    pctOfTotal: totalSpent > 0 ? Math.round((cat.spent / totalSpent) * 100) : 0,
  }))

  // Maximum spent among top categories for relative bar scaling
  const maxSpent = Math.max(...topCategories.map((c) => c.spent), 1)

  const remainingColor = getRemainingColor(totalRemaining, totalBudget, totalSpent)
  const progressColor = getProgressColor(totalPercentage)
  const progressTrack = getProgressTrackColor(totalPercentage)
  const progressText = getProgressTextColor(totalPercentage)

  return (
    <Card className="animate-slide-up card-hover rounded-xl border">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
            <Wallet className="h-4 w-4 text-emerald-500" />
          </div>
          Бюджет
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* ── Overall budget status ── */}
        <div className="space-y-2.5">
          {/* Total budget / Total spent */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/40 px-3 py-2">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Бюджет
              </p>
              <p className="mt-0.5 text-sm font-semibold tabular-nums">
                {formatCurrency(totalBudget)}
              </p>
            </div>
            <div className="rounded-lg bg-muted/40 px-3 py-2">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Потрачено
              </p>
              <p className={`mt-0.5 text-sm font-semibold tabular-nums ${progressText}`}>
                {formatCurrency(totalSpent)}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className={`h-2.5 w-full overflow-hidden rounded-full ${progressTrack}`}>
              <div
                className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                style={{ width: `${Math.min(totalPercentage, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {totalPercentage}%
              </span>
              <span className={`text-xs font-semibold tabular-nums ${remainingColor}`}>
                Осталось {formatCurrency(totalSpent > totalBudget ? totalBudget - totalSpent : totalRemaining)}
              </span>
            </div>
          </div>
        </div>

        {/* ── Over-budget warning ── */}
        {totalPercentage > 100 && (
          <div className="flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 dark:bg-rose-950/20">
            <TrendingDown className="h-4 w-4 shrink-0 text-rose-500" />
            <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
              Бюджет превышен на {formatCurrency(totalSpent - totalBudget)}!
            </p>
          </div>
        )}

        {/* ── Top 3 spending categories ── */}
        {topWithPct.length > 0 && (
          <div className="stagger-children space-y-3 pt-1">
            <p className="text-xs font-medium text-muted-foreground">
              Топ расходов по категориям
            </p>
            {topWithPct.map((cat) => (
              <div key={cat.id} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.categoryColor || 'hsl(var(--muted-foreground))' }}
                    />
                    <span className="text-sm font-medium truncate max-w-[120px]">
                      {cat.categoryName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-right">
                    <span className="text-xs tabular-nums text-muted-foreground whitespace-nowrap">
                      {formatCurrency(cat.spent)}
                    </span>
                    <span className="text-[10px] tabular-nums text-muted-foreground/70">
                      {cat.pctOfTotal}%
                    </span>
                  </div>
                </div>
                {/* Relative bar (scaled to max spent) */}
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${maxSpent > 0 ? (cat.spent / maxSpent) * 100 : 0}%`,
                      backgroundColor: cat.categoryColor || 'hsl(var(--muted-foreground))',
                      opacity: 0.8,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── "Подробнее" link ── */}
        <div className="pt-1">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 h-auto p-0 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
            onClick={onNavigateToFinance}
          >
            Подробнее
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
