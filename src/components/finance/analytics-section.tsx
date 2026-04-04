'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, CalendarDays, Trophy } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { getCategoryIcon } from './constants'
import type { Transaction, Category } from './types'

interface SpendingInsights {
  avgDaily: number
  biggestExpense: Transaction
  top3: { categoryId: string; categoryName: string; categoryColor: string; categoryIcon: string; total: number }[]
  totalExpense: number
  daysInMonth: number
}

interface AnalyticsSectionProps {
  spendingInsights: SpendingInsights
  getCategoryForTx: (tx: Transaction) => Category
}

export function AnalyticsSection({ spendingInsights, getCategoryForTx }: AnalyticsSectionProps) {
  return (
    <Card className="card-hover rounded-xl border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="h-4 w-4 text-violet-500" />
          Аналитика расходов
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Average Daily */}
          <div className="flex items-center gap-3 rounded-xl bg-muted/40 p-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40">
              <CalendarDays className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Средний расход/день</p>
              <p className="text-base font-bold tabular-nums">{formatCurrency(spendingInsights.avgDaily)}</p>
              <p className="text-[10px] text-muted-foreground">{spendingInsights.daysInMonth} {spendingInsights.daysInMonth === 1 ? 'день' : 'дней'} с расходами</p>
            </div>
          </div>

          {/* Biggest Expense */}
          <div className="flex items-center gap-3 rounded-xl bg-muted/40 p-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/40">
              <Trophy className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">Крупнейший расход</p>
              <p className="text-base font-bold tabular-nums">{formatCurrency(spendingInsights.biggestExpense.amount)}</p>
              <p className="text-[10px] text-muted-foreground truncate">
                {spendingInsights.biggestExpense.description || getCategoryForTx(spendingInsights.biggestExpense).name}
              </p>
            </div>
          </div>

          {/* Top 3 Categories */}
          <div className="rounded-xl bg-muted/40 p-3.5">
            <p className="text-xs text-muted-foreground mb-2.5">Топ-3 категории</p>
            {spendingInsights.top3.length > 0 ? (
              <div className="space-y-2">
                {spendingInsights.top3.map((cat, idx) => (
                  <div key={cat.categoryId} className="flex items-center gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold text-muted-foreground bg-background">
                      {idx + 1}
                    </span>
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded" style={{ backgroundColor: `${cat.categoryColor}20`, color: cat.categoryColor }}>
                      {getCategoryIcon(cat.categoryIcon)}
                    </div>
                    <span className="text-xs font-medium truncate flex-1">{cat.categoryName}</span>
                    <span className="text-xs font-semibold tabular-nums">{formatCurrency(cat.total)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Нет данных</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
