import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  BookOpen,
  Wallet,
  TrendingUp,
  TrendingDown,
  Dumbbell,
  Target,
  Flame,
  Smile,
  Sparkles,
} from 'lucide-react'
import { MOOD_EMOJI, formatCurrency } from '@/lib/format'
import { SkeletonCard } from './skeleton-components'

interface OverviewStatsProps {
  loading: boolean
  diaryCount: number
  avgMood: number
  totalExpenses: number
  totalIncome: number
  savingsRate: number
  workoutCount: number
  totalMinutes: number
  totalHabits: number
  completedHabits: number
  habitsRate: number
}

export function OverviewStats({
  loading,
  diaryCount,
  avgMood,
  totalExpenses,
  totalIncome,
  savingsRate,
  workoutCount,
  totalMinutes,
  totalHabits,
  completedHabits,
  habitsRate,
}: OverviewStatsProps) {
  return (
    <div className="stagger-children grid grid-cols-2 gap-3 lg:grid-cols-4">
      {loading ? (
        <>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </>
      ) : (
        <>
          {/* Diary Stats */}
          <Card className="card-hover rounded-xl border border-transparent bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 dark:border-emerald-800/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                Записи в дневнике
              </CardTitle>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
                <BookOpen className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xl font-bold tabular-nums">{diaryCount}</p>
              <div className="mt-1 flex items-center gap-1">
                <Smile className="h-3 w-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  Ср. настроение:{' '}
                  <span className="font-medium tabular-nums text-emerald-600 dark:text-emerald-400">
                    {avgMood > 0 ? `${avgMood.toFixed(1)} ${MOOD_EMOJI[Math.round(avgMood)] || ''}` : '—'}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Finance Stats */}
          <Card className="card-hover rounded-xl border border-transparent bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/40 dark:to-yellow-950/30 dark:border-amber-800/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-amber-700 dark:text-amber-300">
                Расходы / Доходы
              </CardTitle>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
                <Wallet className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-1.5">
                <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                <span className="text-base font-bold tabular-nums text-red-600 dark:text-red-400">
                  {formatCurrency(totalExpenses)}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-emerald-500" />
                <p className="text-xs text-muted-foreground">
                  Сбережения:{' '}
                  <span className={`font-medium tabular-nums ${savingsRate >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {savingsRate}%
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Workout Stats */}
          <Card className="card-hover rounded-xl border border-transparent bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-950/40 dark:to-sky-950/30 dark:border-blue-800/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-blue-700 dark:text-blue-300">
                Тренировки
              </CardTitle>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
                <Dumbbell className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xl font-bold tabular-nums">{workoutCount}</p>
              <div className="mt-1 flex items-center gap-1">
                <Flame className="h-3 w-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  Всего минут:{' '}
                  <span className="font-medium tabular-nums text-blue-600 dark:text-blue-400">
                    {totalMinutes}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Habits Stats */}
          <Card className="card-hover rounded-xl border border-transparent bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/40 dark:to-purple-950/30 dark:border-violet-800/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-violet-700 dark:text-violet-300">
                Привычки
              </CardTitle>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/50">
                <Target className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xl font-bold tabular-nums">{habitsRate}%</p>
              <div className="mt-1 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  {completedHabits} из {totalHabits} сегодня
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
