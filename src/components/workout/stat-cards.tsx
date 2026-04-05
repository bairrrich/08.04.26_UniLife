'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Dumbbell, Clock, Flame, Trophy, Weight, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { formatVolume } from './constants'

interface StatCardsProps {
  totalWorkouts: number
  totalMinutes: number
  avgDuration: number
  totalExercises: number
  totalVolume: number
  prCount: number
  weeklyFrequency: { thisWeek: number; lastWeek: number; diff: number }
}

export function StatCards({
  totalWorkouts,
  totalMinutes,
  avgDuration,
  totalExercises,
  totalVolume,
  prCount,
  weeklyFrequency,
}: StatCardsProps) {
  const FreqIcon = weeklyFrequency.diff > 0 ? TrendingUp : weeklyFrequency.diff < 0 ? TrendingDown : Minus
  const freqColor = weeklyFrequency.diff > 0 ? 'text-emerald-600 dark:text-emerald-400' : weeklyFrequency.diff < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-muted-foreground'
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 stagger-children animate-slide-up">
      <Card className="card-hover py-4">
        <CardContent className="flex items-center gap-3 px-4 py-0">
          <div className="h-10 w-10 rounded-lg bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center">
            <Dumbbell className="h-5 w-5 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <p className="text-2xl font-bold tabular-nums">{totalWorkouts}</p>
            <p className="text-xs text-muted-foreground">Тренировок</p>
          </div>
        </CardContent>
      </Card>
      <Card className="card-hover py-4">
        <CardContent className="flex items-center gap-3 px-4 py-0">
          <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
            <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-2xl font-bold tabular-nums">{totalMinutes}</p>
            <p className="text-xs text-muted-foreground">Минут всего</p>
          </div>
        </CardContent>
      </Card>
      <Card className="card-hover py-4">
        <CardContent className="flex items-center gap-3 px-4 py-0">
          <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
            <Flame className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-2xl font-bold tabular-nums">{avgDuration}</p>
            <p className="text-xs text-muted-foreground">Среднее (мин)</p>
          </div>
        </CardContent>
      </Card>
      <Card className="card-hover py-4">
        <CardContent className="flex items-center gap-3 px-4 py-0">
          <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
            <Trophy className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-2xl font-bold tabular-nums">{totalExercises}</p>
            <p className="text-xs text-muted-foreground">Упражнений</p>
          </div>
        </CardContent>
      </Card>
      <Card className="card-hover py-4 border-t-4 border-t-violet-500">
        <CardContent className="flex items-center gap-3 px-4 py-0">
          <div className="h-10 w-10 rounded-lg bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center">
            <Weight className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <p className="text-2xl font-bold tabular-nums">{formatVolume(totalVolume)}</p>
            <p className="text-xs text-muted-foreground">Объём (сила)</p>
          </div>
        </CardContent>
      </Card>
      <Card className="card-hover py-4">
        <CardContent className="flex items-center gap-3 px-4 py-0">
          <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Trophy className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-2xl font-bold tabular-nums">{prCount}</p>
            <p className="text-xs text-muted-foreground">Рекордов</p>
          </div>
        </CardContent>
      </Card>
      <Card className="card-hover py-4">
        <CardContent className="flex items-center gap-3 px-4 py-0">
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${weeklyFrequency.diff > 0 ? 'bg-emerald-100 dark:bg-emerald-900/30' : weeklyFrequency.diff < 0 ? 'bg-rose-100 dark:bg-rose-900/30' : 'bg-gray-100 dark:bg-gray-900/30'}`}>
            <FreqIcon className={`h-5 w-5 ${freqColor}`} />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <p className="text-2xl font-bold tabular-nums">{weeklyFrequency.thisWeek}</p>
              {weeklyFrequency.diff !== 0 && (
                <span className={`text-xs font-medium flex items-center gap-0.5 ${freqColor}`}>
                  {weeklyFrequency.diff > 0 ? '+' : ''}{weeklyFrequency.diff}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Тренировок / нед.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
