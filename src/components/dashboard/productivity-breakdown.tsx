'use client'

import { memo, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { CalendarDays } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BreakdownItem {
  label: string
  emoji: string
  completed: number
  total: number
  color: string
  percentage: number
}

interface ProductivityBreakdownProps {
  loading: boolean
  data: BreakdownItem[] | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getOverallColor(score: number): string {
  if (score >= 75) return 'text-emerald-600 dark:text-emerald-400'
  if (score >= 50) return 'text-amber-600 dark:text-amber-400'
  if (score >= 25) return 'text-orange-600 dark:text-orange-400'
  return 'text-red-500 dark:text-red-400'
}

function getOverallBg(score: number): string {
  if (score >= 75) return 'bg-emerald-50 dark:bg-emerald-950/30'
  if (score >= 50) return 'bg-amber-50 dark:bg-amber-950/30'
  if (score >= 25) return 'bg-orange-50 dark:bg-orange-950/30'
  return 'bg-red-50 dark:bg-red-950/30'
}

function getBarTrackColor(color: string): string {
  switch (color) {
    case 'emerald':
      return 'bg-emerald-100 dark:bg-emerald-900/30'
    case 'blue':
      return 'bg-blue-100 dark:bg-blue-900/30'
    case 'violet':
      return 'bg-violet-100 dark:bg-violet-900/30'
    case 'orange':
      return 'bg-orange-100 dark:bg-orange-900/30'
    default:
      return 'bg-muted'
  }
}

function getBarFillColor(color: string): string {
  switch (color) {
    case 'emerald':
      return 'bg-emerald-500 dark:bg-emerald-400'
    case 'blue':
      return 'bg-blue-500 dark:bg-blue-400'
    case 'violet':
      return 'bg-violet-500 dark:bg-violet-400'
    case 'orange':
      return 'bg-orange-500 dark:bg-orange-400'
    default:
      return 'bg-muted-foreground'
  }
}

function getTextColor(color: string): string {
  switch (color) {
    case 'emerald':
      return 'text-emerald-600 dark:text-emerald-400'
    case 'blue':
      return 'text-blue-600 dark:text-blue-400'
    case 'violet':
      return 'text-violet-600 dark:text-violet-400'
    case 'orange':
      return 'text-orange-600 dark:text-orange-400'
    default:
      return 'text-muted-foreground'
  }
}

function getEmojiBgColor(color: string): string {
  switch (color) {
    case 'emerald':
      return 'bg-emerald-100 dark:bg-emerald-900/40'
    case 'blue':
      return 'bg-blue-100 dark:bg-blue-900/40'
    case 'violet':
      return 'bg-violet-100 dark:bg-violet-900/40'
    case 'orange':
      return 'bg-orange-100 dark:bg-orange-900/40'
    default:
      return 'bg-muted'
  }
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <Card className="hover-lift rounded-xl border">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
        </div>
        <div className="mt-2 flex items-end gap-3">
          <Skeleton className="h-10 w-16 rounded-lg" />
          <Skeleton className="h-3 w-32 rounded" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-7 w-7 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3.5 w-16 rounded" />
                <Skeleton className="h-3.5 w-10 rounded" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ProductivityBreakdown = memo(function ProductivityBreakdown({
  loading,
  data,
}: ProductivityBreakdownProps) {
  // ── Overall score (average of all percentages) ──────────────────────
  const overallScore = useMemo(() => {
    if (!data || data.length === 0) return 0
    const sum = data.reduce((acc, item) => acc + item.percentage, 0)
    return Math.round(sum / data.length)
  }, [data])

  if (loading || !data) {
    return <LoadingSkeleton />
  }

  const overallColor = getOverallColor(overallScore)
  const overallBg = getOverallBg(overallScore)

  return (
    <Card className="hover-lift rounded-xl border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarDays className="h-4 w-4 text-primary" />
            Продуктивность по модулям
          </CardTitle>
          <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <CalendarDays className="h-3 w-3" />
            Сегодня
          </span>
        </div>

        {/* Overall Score */}
        <div className="mt-2 flex items-end gap-3">
          <span className={`text-2xl font-bold tabular-nums ${overallColor} animate-count-fade-in`}>
            {overallScore}%
          </span>
          <span className="mb-0.5 text-xs text-muted-foreground">
            средняя продуктивность
          </span>
        </div>
        <div className={`mt-1 h-1.5 w-full overflow-hidden rounded-full ${overallBg}`}>
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              overallScore >= 75
                ? 'bg-emerald-500 dark:bg-emerald-400'
                : overallScore >= 50
                  ? 'bg-amber-500 dark:bg-amber-400'
                  : overallScore >= 25
                    ? 'bg-orange-500 dark:bg-orange-400'
                    : 'bg-red-500 dark:bg-red-400'
            }`}
            style={{ width: `${overallScore}%` }}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {data.map((item, index) => (
          <div
            key={item.label}
            className="flex items-center gap-3"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            {/* Emoji icon */}
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm ${getEmojiBgColor(item.color)}`}
            >
              {item.emoji}
            </div>

            {/* Label + Bar */}
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  {item.label}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">
                    {item.completed}/{item.total}
                  </span>
                  <span
                    className={`text-xs font-semibold tabular-nums ${getTextColor(item.color)} animate-count-fade-in`}
                  >
                    {item.percentage}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className={`h-2 w-full overflow-hidden rounded-full ${getBarTrackColor(item.color)}`}>
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${getBarFillColor(item.color)}`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
})

export default ProductivityBreakdown
