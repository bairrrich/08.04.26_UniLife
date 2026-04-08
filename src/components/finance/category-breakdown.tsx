'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatCurrency } from '@/lib/format'
import { getCategoryIcon } from './constants'
import type { StatsResponse } from './types'

interface CategoryBreakdownProps {
  stats: StatsResponse | null
  isLoading: boolean
  selectedCategoryId?: string | null
  onSelectCategory?: (categoryId: string | null) => void
}

export function CategoryBreakdown({ stats, isLoading, selectedCategoryId, onSelectCategory }: CategoryBreakdownProps) {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const resetTimer = setTimeout(() => setAnimated(false), 0)
    let animTimer: ReturnType<typeof setTimeout>
    if (!isLoading && stats?.byCategory?.length) {
      animTimer = setTimeout(() => setAnimated(true), 100)
    }
    return () => { clearTimeout(resetTimer); clearTimeout(animTimer) }
  }, [isLoading, stats])

  if (isLoading) {
    return <div className="skeleton-shimmer h-[300px] rounded-xl w-full" />
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">По категориям</CardTitle>
          {selectedCategoryId && onSelectCategory && (
            <button
              onClick={() => onSelectCategory(null)}
              className="text-[10px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              Сбросить фильтр
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[220px]">
          <div className="flex flex-col gap-3 stagger-children">
            {stats?.byCategory && stats.byCategory.length > 0 ? (
              stats.byCategory.map((cat) => {
                const totalExpense = stats.totalExpense || 1
                const pct = Math.round((cat.total / totalExpense) * 100)
                const isSelected = selectedCategoryId === cat.categoryId
                return (
                  <div
                    key={cat.categoryId}
                    className={`
                      space-y-1.5 p-2 -mx-2 rounded-lg cursor-pointer transition-all
                      ${onSelectCategory ? 'hover:bg-muted/40 active-press' : ''}
                      ${isSelected ? 'bg-muted/60 ring-1 ring-primary/20' : ''}
                    `}
                    onClick={() => onSelectCategory?.(isSelected ? null : cat.categoryId)}
                    role={onSelectCategory ? 'button' : undefined}
                    tabIndex={onSelectCategory ? 0 : undefined}
                  >
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
                          style={{ backgroundColor: `${cat.categoryColor}18`, color: cat.categoryColor }}
                        >
                          {getCategoryIcon(cat.categoryIcon)}
                        </div>
                        <span className="font-medium truncate">
                          {cat.categoryName}
                        </span>
                        {isSelected && (
                          <Badge variant="default" className="text-[9px] px-1.5 py-0 h-4">фильтр</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0 text-right">
                        <span className="font-semibold tabular-nums">{formatCurrency(cat.total)}</span>
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0 h-4 font-medium tabular-nums"
                          style={{
                            backgroundColor: `${cat.categoryColor}18`,
                            color: cat.categoryColor,
                          }}
                        >
                          {pct}%
                        </Badge>
                      </div>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: animated ? `${pct}%` : '0%',
                          backgroundColor: cat.categoryColor,
                        }}
                      />
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                Нет данных
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
