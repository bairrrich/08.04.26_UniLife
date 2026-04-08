import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, Check, Flame, Trophy, AlertTriangle, Sparkles } from 'lucide-react'
import type { HabitData } from './types'

interface HabitStatsProps {
  stats: { totalActive: number; completedToday: number; bestStreak: number }
  habits?: HabitData[]
}

export function HabitStats({ stats, habits }: HabitStatsProps) {
  // Find most consistent habit (highest completion rate in last 7 days)
  const mostConsistent = habits && habits.length > 0
    ? habits.reduce((best, h) => {
        const rate = Object.values(h.last7Days).filter(Boolean).length
        const bestRate = Object.values(best.last7Days).filter(Boolean).length
        return rate > bestRate ? h : best
      })
    : null

  // Find habit that needs attention (lowest completion rate)
  const needsAttention = habits && habits.length > 0
    ? habits.reduce((worst, h) => {
        const rate = Object.values(h.last7Days).filter(Boolean).length
        const worstRate = Object.values(worst.last7Days).filter(Boolean).length
        return rate < worstRate ? h : worst
      })
    : null

  // Total completions all-time
  const totalCompletions = habits
    ? habits.reduce((sum, h) => {
        return sum + Object.values(h.last7Days).filter(Boolean).length
      }, 0)
    : 0

  return (
    <>
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

      {/* Highlight cards: Most Consistent + Needs Attention + Total Completions */}
      {habits && habits.length >= 2 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-children mt-2">
          {/* Most consistent habit */}
          {mostConsistent && (
            <Card className="card-hover overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/8 to-purple-500/5 pointer-events-none" />
              <CardContent className="relative p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="h-4 w-4 text-violet-500" />
                  <span className="text-xs font-semibold text-violet-600 dark:text-violet-400">Самая стабильная</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{mostConsistent.emoji}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{mostConsistent.name}</p>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      {Object.values(mostConsistent.last7Days).filter(Boolean).length}/7 за неделю
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Needs attention */}
          {needsAttention && (
            <Card className="card-hover overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/8 to-orange-500/5 pointer-events-none" />
              <CardContent className="relative p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-xs font-semibold text-red-600 dark:text-red-400">Требует внимания</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{needsAttention.emoji}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{needsAttention.name}</p>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      {Object.values(needsAttention.last7Days).filter(Boolean).length}/7 за неделю
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Total completions */}
          <Card className="card-hover overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/8 to-teal-500/5 pointer-events-none" />
            <CardContent className="relative p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-emerald-500" />
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Всего выполнений</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xl font-bold tabular-nums">{totalCompletions}</p>
                  <p className="text-xs text-muted-foreground">за последние 7 дней</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
