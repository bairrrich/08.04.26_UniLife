import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, Check, Flame } from 'lucide-react'

interface HabitStatsProps {
  stats: { totalActive: number; completedToday: number; bestStreak: number }
}

export function HabitStats({ stats }: HabitStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-4 stagger-children">
      <Card className="card-hover overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5" />
        <CardContent className="relative flex items-center gap-3 p-4">
          <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
            <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-bold tabular-nums">{stats.totalActive}</p>
            <p className="text-xs text-muted-foreground truncate">Активные привычки</p>
          </div>
        </CardContent>
      </Card>

      <Card className="card-hover overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/5" />
        <CardContent className="relative flex items-center gap-3 p-4">
          <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
            <Check className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-bold tabular-nums">{stats.completedToday}</p>
            <p className="text-xs text-muted-foreground truncate">Выполнено сегодня</p>
          </div>
        </CardContent>
      </Card>

      <Card className="card-hover overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/5" />
        <CardContent className="relative flex items-center gap-3 p-4">
          <div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
            <Flame className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-bold tabular-nums">{stats.bestStreak}</p>
            <p className="text-xs text-muted-foreground truncate">Лучшая серия</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
