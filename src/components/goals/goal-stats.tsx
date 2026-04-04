import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Target, Trophy, TrendingUp } from 'lucide-react'
import type { GoalData } from './types'

interface GoalStatsProps {
  goals: GoalData[]
  stats: { totalGoals: number; completedGoals: number; avgProgress: number }
}

export function GoalStats({ goals, stats }: GoalStatsProps) {
  return (
    <>
      {/* Overall Progress Summary */}
      <Card className="card-hover rounded-xl border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4 text-violet-500" />
            Общий прогресс
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
              <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" strokeWidth="8" className="stroke-muted" />
                <circle
                  cx="50" cy="50" r="40" fill="none" strokeWidth="8" strokeLinecap="round"
                  className="stroke-violet-500 transition-all duration-700 ease-out"
                  strokeDasharray={251.3}
                  strokeDashoffset={251.3 * (1 - stats.avgProgress / 100)}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-xl font-bold tabular-nums text-violet-600 dark:text-violet-400">
                  {stats.avgProgress}%
                </span>
              </div>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-3 text-center sm:text-left">
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-2xl font-bold tabular-nums">{goals.length}</p>
                <p className="text-xs text-muted-foreground">Всего целей</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                  {stats.completedGoals}
                </p>
                <p className="text-xs text-muted-foreground">Достигнуто</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 stagger-children">
        <Card className="card-hover overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5" />
          <CardContent className="relative flex items-center gap-3 p-4">
            <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
              <Target className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold tabular-nums">{stats.totalGoals}</p>
              <p className="text-xs text-muted-foreground truncate">Всего целей</p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/5" />
          <CardContent className="relative flex items-center gap-3 p-4">
            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
              <Trophy className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold tabular-nums">{stats.completedGoals}</p>
              <p className="text-xs text-muted-foreground truncate">Завершено</p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-amber-600/5" />
          <CardContent className="relative flex items-center gap-3 p-4">
            <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
              <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold tabular-nums">{stats.avgProgress}%</p>
              <p className="text-xs text-muted-foreground truncate">Средний прогресс</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
