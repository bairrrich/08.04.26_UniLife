'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Zap,
  CalendarDays,
  Trophy,
  TrendingUp,
  Clock,
} from 'lucide-react'
import type { Period } from '@/lib/format'
import { RU_DAYS_SHORT } from '@/lib/format'
import { AnimatedNumber } from '@/components/ui/animated-number'
import type { ActivityStats } from './types'

interface ActivityOverviewProps {
  loading: boolean
  activityStats: ActivityStats
  period: Period
}

// ─── 7-day Sparkline ─────────────────────────────────────────────────────────

function Sparkline({ data }: { data: number[] }) {
  if (!data || data.length === 0) return null
  const max = Math.max(...data, 1)

  return (
    <div className="flex items-end gap-[5px]" style={{ height: 40 }}>
      {data.map((value, i) => {
        const barHeight = Math.max(3, (value / max) * 100)
        const dayLabel = RU_DAYS_SHORT[i % 7]
        return (
          <div key={i} className="flex flex-col items-center gap-1">
            <div
              className="sparkline-bar rounded-sm transition-all duration-300"
              style={{
                width: '18px',
                height: `${barHeight}%`,
                backgroundColor: value > 0
                  ? `rgba(16, 185, 129, ${0.4 + (value / max) * 0.6})`
                  : 'rgba(16, 185, 129, 0.15)',
              }}
            />
            <span className="text-[9px] text-muted-foreground leading-none">{dayLabel}</span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ActivityOverview({ loading, activityStats, period }: ActivityOverviewProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="rounded-xl border">
            <CardHeader className="pb-2">
              <div className="skeleton-shimmer h-4 w-24 rounded-md" />
            </CardHeader>
            <CardContent>
              <div className="skeleton-shimmer mb-2 h-8 w-20 rounded-md" />
              <div className="skeleton-shimmer h-3 w-28 rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const sparkline = activityStats.sparkline ?? []

  return (
    <Card className="card-hover rounded-xl border border-border bg-gradient-to-br from-background to-muted/30 dark:from-background dark:to-muted/10">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500">
            <Zap className="h-3.5 w-3.5 text-white" />
          </div>
          Обзор активности
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Ключевые показатели за{' '}
          {period === 'week' ? 'текущую неделю' : period === 'month' ? 'текущий месяц' : 'текущий год'}
        </p>
      </CardHeader>
      <CardContent>
        {/* 7-day sparkline at top */}
        {sparkline.length > 0 && (
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Активность за неделю</span>
            </div>
            <Sparkline data={sparkline} />
          </div>
        )}

        <div className="stagger-children grid grid-cols-2 gap-3 lg:grid-cols-5">
          {/* Total Actions */}
          <div className="flex items-center gap-3 rounded-xl bg-emerald-50/60 p-3 dark:bg-emerald-950/30">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
              <Zap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold tabular-nums leading-tight"><AnimatedNumber value={activityStats.totalActions} /></p>
              <p className="text-[11px] text-muted-foreground leading-tight truncate">Всего действий</p>
            </div>
          </div>

          {/* Most Active Day */}
          <div className="flex items-center gap-3 rounded-xl bg-amber-50/60 p-3 dark:bg-amber-950/30">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
              <CalendarDays className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold leading-tight truncate">{activityStats.mostActiveDay}</p>
              <p className="text-[11px] text-muted-foreground leading-tight truncate">Самый активный день</p>
            </div>
          </div>

          {/* Most Active Module */}
          <div className="flex items-center gap-3 rounded-xl bg-violet-50/60 p-3 dark:bg-violet-950/30">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/50">
              <Trophy className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold leading-tight truncate">{activityStats.mostActiveModule}</p>
              <p className="text-[11px] text-muted-foreground leading-tight truncate">Самый активный модуль</p>
            </div>
          </div>

          {/* Average Daily Actions */}
          <div className="flex items-center gap-3 rounded-xl bg-blue-50/60 p-3 dark:bg-blue-950/30">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
              <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold tabular-nums leading-tight"><AnimatedNumber value={parseFloat(activityStats.avgDaily)} /></p>
              <p className="text-[11px] text-muted-foreground leading-tight truncate">Среднее за день</p>
            </div>
          </div>

          {/* Most Productive Day of Week */}
          <div className="flex items-center gap-3 rounded-xl bg-rose-50/60 p-3 dark:bg-rose-950/30 col-span-2 lg:col-span-1">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/50">
              <Clock className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold leading-tight truncate">{activityStats.mostProductiveDay ?? '—'}</p>
              <p className="text-[11px] text-muted-foreground leading-tight truncate">Самый продуктивный день</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
