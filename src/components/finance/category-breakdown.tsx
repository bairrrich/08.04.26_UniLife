'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatCurrency } from '@/lib/format'
import type { StatsResponse } from './types'

interface CategoryBreakdownProps {
  stats: StatsResponse | null
  isLoading: boolean
}

export function CategoryBreakdown({ stats, isLoading }: CategoryBreakdownProps) {
  if (isLoading) {
    return <div className="skeleton-shimmer h-[300px] rounded-xl w-full" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">По категориям</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[220px]">
          <div className="flex flex-col gap-3 stagger-children">
            {stats?.byCategory && stats.byCategory.length > 0 ? (
              stats.byCategory.map((cat) => {
                const totalExpense = stats.totalExpense || 1
                const pct = Math.round((cat.total / totalExpense) * 100)
                return (
                  <div key={cat.categoryId} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="inline-block h-3 w-3 shrink-0 rounded-full"
                          style={{ backgroundColor: cat.categoryColor }}
                        />
                        <span className="font-medium truncate">
                          {cat.categoryName}
                        </span>
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
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: cat.categoryColor }}
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
