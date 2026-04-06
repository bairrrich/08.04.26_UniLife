'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TrendingUp } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { getCategoryIcon } from './constants'
import type { Transaction } from './types'

interface IncomeBreakdownProps {
  transactions: Transaction[]
  isLoading: boolean
}

interface IncomeCategoryItem {
  categoryId: string
  categoryName: string
  categoryColor: string
  categoryIcon: string
  total: number
}

export function IncomeBreakdown({ transactions, isLoading }: IncomeBreakdownProps) {
  const { totalIncome, categories } = useMemo(() => {
    const incomeTx = transactions.filter((t) => t.type === 'INCOME')
    const totalIncome = incomeTx.reduce((sum, t) => sum + t.amount, 0)

    const catMap = new Map<string, IncomeCategoryItem>()
    incomeTx.forEach((tx) => {
      const catId = tx.categoryId
      const existing = catMap.get(catId)
      if (existing) {
        existing.total += tx.amount
      } else {
        catMap.set(catId, {
          categoryId: catId,
          categoryName: tx.category?.name || 'Другое',
          categoryColor: tx.category?.color || '#6b7280',
          categoryIcon: tx.category?.icon || 'circle',
          total: tx.amount,
        })
      }
    })

    const categories = Array.from(catMap.values()).sort((a, b) => b.total - a.total)
    return { totalIncome, categories }
  }, [transactions])

  if (isLoading) {
    return <div className="skeleton-shimmer h-[300px] rounded-xl w-full" />
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            Доходы по категориям
          </CardTitle>
          {totalIncome > 0 && (
            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
              +{formatCurrency(totalIncome)}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[220px]">
          <div className="flex flex-col gap-3 stagger-children">
            {categories.length > 0 ? (
              categories.map((cat) => {
                const pct = totalIncome > 0 ? Math.round((cat.total / totalIncome) * 100) : 0
                return (
                  <div key={cat.categoryId} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                          style={{ backgroundColor: `${cat.categoryColor}18`, color: cat.categoryColor }}
                        >
                          {getCategoryIcon(cat.categoryIcon)}
                        </div>
                        <span className="font-medium truncate">{cat.categoryName}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 text-right">
                        <span className="font-semibold tabular-nums">{formatCurrency(cat.total)}</span>
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0 h-4 font-medium tabular-nums bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        >
                          {pct}%
                        </Badge>
                      </div>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-emerald-500 transition-all duration-500 dark:bg-emerald-400"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                Нет доходов за этот период
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
