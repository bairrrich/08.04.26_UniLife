'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Wallet } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CategorySpending {
  name: string
  amount: number
  color: string
}

interface FinanceQuickViewProps {
  loading: boolean
  categories: CategorySpending[]
  totalExpense: number
  totalIncome: number
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

// ─── Component ────────────────────────────────────────────────────────────────

export default function FinanceQuickView({
  loading,
  categories,
  totalExpense,
  totalIncome,
}: FinanceQuickViewProps) {
  // Loading skeleton state
  if (loading) {
    return (
      <Card className="rounded-xl border card-hover animate-slide-up">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-5 w-28" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
          <Skeleton className="mt-3 h-4 w-3/4" />
        </CardContent>
      </Card>
    )
  }

  // Derive the max amount for percentage calculations
  const maxAmount = categories.length > 0
    ? Math.max(...categories.map((c) => c.amount), 1)
    : 1

  return (
    <Card className="rounded-xl border card-hover animate-slide-up">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/50">
            <Wallet className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          Расходы
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Category progress bars */}
        {categories.length === 0 ? (
          <p className="py-2 text-center text-sm text-muted-foreground">
            Нет данных о расходах
          </p>
        ) : (
          <div className="stagger-children space-y-3">
            {categories.map((category) => {
              const percentage = maxAmount > 0
                ? Math.round((category.amount / maxAmount) * 100)
                : 0

              return (
                <div key={category.name} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="truncate text-sm font-medium">
                      {category.name}
                    </span>
                    <span className="ml-2 shrink-0 text-xs tabular-nums font-medium text-muted-foreground">
                      {formatCurrency(category.amount)}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: category.color || '#059669',
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Income / Expense summary */}
        <div className="mt-4 border-t pt-3">
          <p className="text-xs tabular-nums text-muted-foreground">
            Доходы: <span className="font-medium text-emerald-600 dark:text-emerald-400">{formatCurrency(totalIncome)}</span>
            {' | '}
            Расходы: <span className="font-medium text-red-600 dark:text-red-400">{formatCurrency(totalExpense)}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
