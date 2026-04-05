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
  sparklineData: { workouts: number; minutes: number; exercises: number; volume: number }[]
  periodComparison: { workouts: number; minutes: number; exercises: number; volume: number }
}

// Mini sparkline bar chart component using CSS
function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const maxVal = Math.max(...data, 1)
  // Use last 4 data points for compact display
  const bars = data.slice(-4)

  return (
    <div className="sparkline-container mt-1">
      {bars.map((val, i) => {
        const heightPct = Math.max((val / maxVal) * 100, 6)
        return (
          <div
            key={i}
            className="sparkline-bar animate-bar-grow"
            style={{
              height: `${heightPct}%`,
              backgroundColor: val > 0 ? color : 'currentColor',
              opacity: val > 0 ? 0.7 : 0.2,
              animationDelay: `${i * 100}ms`,
            }}
          />
        )
      })}
    </div>
  )
}

// Comparison text component
function ComparisonText({ pct }: { pct: number }) {
  if (pct === 0) return null
  const isPositive = pct > 0
  return (
    <span className={`text-[10px] font-medium ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
      {isPositive ? '+' : ''}{pct}% vs прошл. нед.
    </span>
  )
}

export function StatCards({
  totalWorkouts,
  totalMinutes,
  avgDuration,
  totalExercises,
  totalVolume,
  prCount,
  weeklyFrequency,
  sparklineData,
  periodComparison,
}: StatCardsProps) {
  const FreqIcon = weeklyFrequency.diff > 0 ? TrendingUp : weeklyFrequency.diff < 0 ? TrendingDown : Minus
  const freqColor = weeklyFrequency.diff > 0 ? 'text-emerald-600 dark:text-emerald-400' : weeklyFrequency.diff < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-muted-foreground'

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 stagger-children animate-slide-up">
      {/* Workouts */}
      <Card className="card-hover py-4">
        <CardContent className="flex items-center gap-3 px-4 py-0">
          <div className="h-10 w-10 rounded-lg bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center">
            <Dumbbell className="h-5 w-5 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-bold tabular-nums">{totalWorkouts}</p>
            <p className="text-xs text-muted-foreground">Тренировок</p>
            <MiniSparkline data={sparklineData.map((d) => d.workouts)} color="#f43f5e" />
            <ComparisonText pct={periodComparison.workouts} />
          </div>
        </CardContent>
      </Card>

      {/* Minutes */}
      <Card className="card-hover py-4">
        <CardContent className="flex items-center gap-3 px-4 py-0">
          <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
            <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-bold tabular-nums">{totalMinutes}</p>
            <p className="text-xs text-muted-foreground">Минут всего</p>
            <MiniSparkline data={sparklineData.map((d) => d.minutes)} color="#3b82f6" />
            <ComparisonText pct={periodComparison.minutes} />
          </div>
        </CardContent>
      </Card>

      {/* Avg Duration */}
      <Card className="card-hover py-4">
        <CardContent className="flex items-center gap-3 px-4 py-0">
          <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
            <Flame className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-bold tabular-nums">{avgDuration}</p>
            <p className="text-xs text-muted-foreground">Среднее (мин)</p>
          </div>
        </CardContent>
      </Card>

      {/* Exercises */}
      <Card className="card-hover py-4">
        <CardContent className="flex items-center gap-3 px-4 py-0">
          <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
            <Trophy className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-bold tabular-nums">{totalExercises}</p>
            <p className="text-xs text-muted-foreground">Упражнений</p>
            <MiniSparkline data={sparklineData.map((d) => d.exercises)} color="#10b981" />
            <ComparisonText pct={periodComparison.exercises} />
          </div>
        </CardContent>
      </Card>

      {/* Total Volume */}
      <Card className="card-hover py-4 border-t-4 border-t-violet-500">
        <CardContent className="flex items-center gap-3 px-4 py-0">
          <div className="h-10 w-10 rounded-lg bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center">
            <Weight className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-bold tabular-nums">{formatVolume(totalVolume)}</p>
            <p className="text-xs text-muted-foreground">Объём (сила)</p>
            <MiniSparkline data={sparklineData.map((d) => d.volume)} color="#8b5cf6" />
            <ComparisonText pct={periodComparison.volume} />
          </div>
        </CardContent>
      </Card>

      {/* PR Count */}
      <Card className="card-hover py-4">
        <CardContent className="flex items-center gap-3 px-4 py-0">
          <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Trophy className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-bold tabular-nums">{prCount}</p>
            <p className="text-xs text-muted-foreground">Рекордов</p>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Frequency */}
      <Card className="card-hover py-4">
        <CardContent className="flex items-center gap-3 px-4 py-0">
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${weeklyFrequency.diff > 0 ? 'bg-emerald-100 dark:bg-emerald-900/30' : weeklyFrequency.diff < 0 ? 'bg-rose-100 dark:bg-rose-900/30' : 'bg-gray-100 dark:bg-gray-900/30'}`}>
            <FreqIcon className={`h-5 w-5 ${freqColor}`} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <p className="text-2xl font-bold tabular-nums">{weeklyFrequency.thisWeek}</p>
              {weeklyFrequency.diff !== 0 && (
                <span className={`text-xs font-medium flex items-center gap-0.5 ${freqColor}`}>
                  {weeklyFrequency.diff > 0 ? '+' : ''}{weeklyFrequency.diff}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Тренировок / нед.</p>
            <MiniSparkline data={sparklineData.map((d) => d.workouts)} color="#10b981" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
