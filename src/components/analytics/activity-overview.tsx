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
} from 'lucide-react'
import type { Period } from '@/lib/format'
import type { ActivityStats } from './types'

interface ActivityOverviewProps {
  loading: boolean
  activityStats: ActivityStats
  period: Period
}

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
        <div className="stagger-children grid grid-cols-2 gap-3 lg:grid-cols-4">
          {/* Total Actions */}
          <div className="flex items-center gap-3 rounded-xl bg-emerald-50/60 p-3 dark:bg-emerald-950/30">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
              <Zap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold tabular-nums leading-tight">{activityStats.totalActions}</p>
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
              <p className="text-lg font-bold tabular-nums leading-tight">{activityStats.avgDaily}</p>
              <p className="text-[11px] text-muted-foreground leading-tight truncate">Среднее за день</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
