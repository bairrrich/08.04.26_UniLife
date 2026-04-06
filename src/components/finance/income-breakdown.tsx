'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TrendingUp, PieChart as PieChartIcon, BarChart3 } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { formatCurrency } from '@/lib/format'
import { getCategoryIcon } from './constants'
import type { Transaction } from './types'
import { cn } from '@/lib/utils'

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
  count: number
}

type ViewMode = 'bars' | 'pie'

// Predefined palette for pie chart slices
const PIE_COLORS = [
  '#10b981', '#06b6d4', '#6366f1', '#f59e0b', '#ec4899',
  '#8b5cf6', '#14b8a6', '#f97316', '#64748b',
]

export function IncomeBreakdown({ transactions, isLoading }: IncomeBreakdownProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('pie')

  const { totalIncome, categories, top5 } = useMemo(() => {
    const incomeTx = transactions.filter((t) => t.type === 'INCOME')
    const totalIncome = incomeTx.reduce((sum, t) => sum + t.amount, 0)

    const catMap = new Map<string, IncomeCategoryItem>()
    incomeTx.forEach((tx) => {
      const catId = tx.categoryId
      const existing = catMap.get(catId)
      if (existing) {
        existing.total += tx.amount
        existing.count += 1
      } else {
        catMap.set(catId, {
          categoryId: catId,
          categoryName: tx.category?.name || 'Другое',
          categoryColor: tx.category?.color || '#6b7280',
          categoryIcon: tx.category?.icon || 'circle',
          total: tx.amount,
          count: 1,
        })
      }
    })

    const categories = Array.from(catMap.values()).sort((a, b) => b.total - a.total)
    const top5 = categories.slice(0, 5)
    return { totalIncome, categories, top5 }
  }, [transactions])

  // Pie chart data
  const pieData = useMemo(() => {
    if (top5.length === 0) return []
    const otherTotal = categories.slice(5).reduce((s, c) => s + c.total, 0)
    const data = top5.map((cat, i) => ({
      name: cat.categoryName,
      value: cat.total,
      color: cat.categoryColor || PIE_COLORS[i % PIE_COLORS.length],
      pct: totalIncome > 0 ? Math.round((cat.total / totalIncome) * 100) : 0,
    }))
    if (otherTotal > 0) {
      data.push({
        name: 'Прочее',
        value: otherTotal,
        color: '#94a3b8',
        pct: totalIncome > 0 ? Math.round((otherTotal / totalIncome) * 100) : 0,
      })
    }
    return data
  }, [top5, categories, totalIncome])

  if (isLoading) {
    return <div className="skeleton-shimmer h-[380px] rounded-xl w-full" />
  }

  return (
    <Card className="card-hover">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            Доходы по категориям
          </CardTitle>
          <div className="flex items-center gap-2">
            {totalIncome > 0 && (
              <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                +{formatCurrency(totalIncome)}
              </span>
            )}
            {/* View mode toggle */}
            <div className="flex items-center gap-0.5 rounded-lg bg-muted p-0.5">
              <button
                onClick={() => setViewMode('pie')}
                className={cn(
                  'rounded-md p-1.5 transition-colors',
                  viewMode === 'pie'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                title="Круговая диаграмма"
              >
                <PieChartIcon className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode('bars')}
                className={cn(
                  'rounded-md p-1.5 transition-colors',
                  viewMode === 'bars'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                title="Полоски"
              >
                <BarChart3 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Horizontal Stacked Bar */}
        {viewMode === 'bars' && totalIncome > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">Структура доходов</p>
            <div className="flex h-6 w-full overflow-hidden rounded-full">
              {pieData.map((item, i) => (
                <div
                  key={i}
                  className="h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full"
                  style={{
                    width: `${item.pct}%`,
                    backgroundColor: item.color,
                  }}
                  title={`${item.name}: ${formatCurrency(item.value)} (${item.pct}%)`}
                />
              ))}
            </div>
            {/* Stacked bar legend */}
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
              {pieData.map((item, i) => (
                <div key={i} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <div
                    className="h-2 w-2 rounded-sm shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="truncate max-w-[80px]">{item.name}</span>
                  <span className="font-medium tabular-nums text-foreground">{item.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pie Chart */}
        {viewMode === 'pie' && pieData.length > 0 && (
          <div className="mb-4 flex items-center justify-center">
            <div className="relative h-[180px] w-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid hsl(var(--border))',
                      backgroundColor: 'hsl(var(--card))',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] text-muted-foreground">Всего</span>
                <span className="text-sm font-bold tabular-nums text-foreground">{formatCurrency(totalIncome)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Top 5 Category List */}
        <ScrollArea className={viewMode === 'pie' ? 'h-[200px]' : 'h-[220px]'}>
          <div className="flex flex-col gap-3 stagger-children">
            {top5.length > 0 ? (
              top5.map((cat, i) => {
                const pct = totalIncome > 0 ? Math.round((cat.total / totalIncome) * 100) : 0
                return (
                  <div key={cat.categoryId} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="relative flex h-6 w-6 shrink-0 items-center justify-center">
                          {/* Color indicator ring */}
                          <div
                            className="absolute inset-0 rounded-full opacity-20"
                            style={{ backgroundColor: cat.categoryColor }}
                          />
                          <span className="relative text-xs" style={{ color: cat.categoryColor }}>
                            {getCategoryIcon(cat.categoryIcon)}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <span className="font-medium truncate block">{cat.categoryName}</span>
                          <span className="text-[10px] text-muted-foreground">{cat.count} транзакций</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 text-right">
                        <span className="font-semibold tabular-nums">{formatCurrency(cat.total)}</span>
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0 h-4 font-medium tabular-nums"
                          style={{
                            backgroundColor: `${cat.categoryColor}15`,
                            color: cat.categoryColor,
                          }}
                        >
                          {pct}%
                        </Badge>
                      </div>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: cat.categoryColor }}
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
