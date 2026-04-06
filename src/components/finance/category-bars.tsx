'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3 } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Transaction } from './types'

// ─── Color palette for bars ──────────────────────────────────────────────────

const BAR_COLORS = [
  { name: 'emerald', bg: 'bg-emerald-500', text: 'text-emerald-500', ring: 'ring-emerald-500/30' },
  { name: 'amber', bg: 'bg-amber-500', text: 'text-amber-500', ring: 'ring-amber-500/30' },
  { name: 'rose', bg: 'bg-rose-500', text: 'text-rose-500', ring: 'ring-rose-500/30' },
  { name: 'blue', bg: 'bg-blue-500', text: 'text-blue-500', ring: 'ring-blue-500/30' },
  { name: 'violet', bg: 'bg-violet-500', text: 'text-violet-500', ring: 'ring-violet-500/30' },
  { name: 'teal', bg: 'bg-teal-500', text: 'text-teal-500', ring: 'ring-teal-500/30' },
]

interface CategoryBarsProps {
  transactions: Transaction[]
  isLoading: boolean
}

interface CategoryRow {
  name: string
  amount: number
  percentage: number
  colorIndex: number
}

export function CategoryBars({ transactions, isLoading }: CategoryBarsProps) {
  const [animated, setAnimated] = useState(false)

  const data = useMemo((): { rows: CategoryRow[]; total: number } => {
    const expenses = transactions.filter((t) => t.type === 'EXPENSE')
    if (expenses.length === 0) return { rows: [], total: 0 }

    // Group by category name
    const map = new Map<string, number>()
    for (const tx of expenses) {
      const name = tx.category?.name || 'Другое'
      map.set(name, (map.get(name) || 0) + tx.amount)
    }

    // Sort by amount descending
    const sorted = Array.from(map.entries()).sort((a, b) => b[1] - a[1])

    const total = sorted.reduce((s, [, amount]) => s + amount, 0)

    // Top 6, aggregate rest into "Прочие"
    let rows: CategoryRow[]
    if (sorted.length <= 6) {
      rows = sorted.map(([name, amount], i) => ({
        name,
        amount,
        percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
        colorIndex: i,
      }))
    } else {
      const top6 = sorted.slice(0, 6)
      const rest = sorted.slice(6)
      const restAmount = rest.reduce((s, [, amount]) => s + amount, 0)

      rows = [
        ...top6.map(([name, amount], i) => ({
          name,
          amount,
          percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
          colorIndex: i,
        })),
        {
          name: 'Прочие',
          amount: restAmount,
          percentage: total > 0 ? Math.round((restAmount / total) * 100) : 0,
          colorIndex: 6 % BAR_COLORS.length,
        },
      ]
    }

    return { rows, total }
  }, [transactions])

  useEffect(() => {
    if (!isLoading && data.rows.length > 0) {
      const resetTimer = setTimeout(() => setAnimated(false), 0)
      const t = setTimeout(() => setAnimated(true), 150)
      return () => { clearTimeout(resetTimer); clearTimeout(t) }
    }
  }, [isLoading, data.rows.length])

  if (isLoading) {
    return (
      <Card className="card-hover rounded-xl">
        <CardHeader className="pb-3">
          <div className="skeleton-shimmer h-5 w-44 rounded" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between">
                  <div className="skeleton-shimmer h-3.5 w-24 rounded" />
                  <div className="skeleton-shimmer h-3.5 w-16 rounded" />
                </div>
                <div className="skeleton-shimmer h-2.5 w-full rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (data.rows.length === 0) return null

  return (
    <Card className="card-hover rounded-xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
            <BarChart3 className="h-4 w-4" />
          </div>
          Расходы по категориям
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 stagger-children">
          {data.rows.map((row, i) => {
            const color = BAR_COLORS[row.colorIndex % BAR_COLORS.length]
            return (
              <div key={row.name} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={cn(
                        'h-2.5 w-2.5 rounded-full shrink-0',
                        color.bg
                      )}
                    />
                    <span className="text-sm font-medium truncate">{row.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-semibold tabular-nums animate-count-fade-in">
                      {formatCurrency(row.amount)}
                    </span>
                    <span className={cn(
                      'text-xs font-medium tabular-nums min-w-[36px] text-right',
                      color.text
                    )}>
                      {row.percentage}%
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      'h-2 rounded-full transition-all duration-700 ease-out',
                      color.bg
                    )}
                    style={{ width: animated ? `${row.percentage}%` : '0%' }}
                  />
                </div>
              </div>
            )
          })}

          {/* Total */}
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm font-semibold text-muted-foreground">Итого расходов</span>
            <span className="text-sm font-bold tabular-nums animate-count-fade-in">
              {formatCurrency(data.total)} ₽
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
