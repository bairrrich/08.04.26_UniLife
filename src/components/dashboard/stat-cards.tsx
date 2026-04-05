'use client'

import { memo } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BookOpen,
  Wallet,
  Dumbbell,
  Flame,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { MOOD_EMOJI, formatCurrency } from '@/lib/format'
import { AnimatedNumber } from '@/components/ui/animated-number'

// ─── Props ────────────────────────────────────────────────────────────────────

interface StatCardsProps {
  loading: boolean
  todayMood: number | null
  weekEntries: number
  totalIncome: number
  totalExpense: number
  todayKcal: number
  workoutsCount: number
  kcalGoal: number
}

// ─── Component ────────────────────────────────────────────────────────────────

export const StatCards = memo(function StatCards({
  loading,
  todayMood,
  weekEntries,
  totalIncome,
  totalExpense,
  todayKcal,
  workoutsCount,
  kcalGoal,
}: StatCardsProps) {
  return (
    <div className="stagger-children grid grid-cols-2 gap-4 lg:grid-cols-4">
      {/* Дневник */}
      {loading ? (
        <Skeleton className="h-[130px] rounded-xl" />
      ) : (
        <Card className="card-hover group rounded-xl border border-transparent bg-gradient-to-br from-emerald-50 to-teal-50 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg dark:from-emerald-950/40 dark:to-teal-950/30 dark:border-emerald-800/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              Дневник
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
              <BookOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <span className="text-3xl">
                {todayMood ? MOOD_EMOJI[todayMood] : '📝'}
              </span>
              <div>
                <p className="text-lg font-semibold tabular-nums">
                  <AnimatedNumber value={weekEntries} />
                </p>
                <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">записей за неделю</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Финансы */}
      {loading ? (
        <Skeleton className="h-[130px] rounded-xl" />
      ) : (
        <Card className="card-hover group rounded-xl border border-transparent bg-gradient-to-br from-amber-50 to-yellow-50 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg dark:from-amber-950/40 dark:to-yellow-950/30 dark:border-amber-800/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300">
              Финансы
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
              <Wallet className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-emerald-500" />
                <span className="text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                  <AnimatedNumber value={totalIncome} formatter={(v) => formatCurrency(v)} />
                </span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingDown className="h-3 w-3 text-red-500" />
                <span className="text-sm font-semibold tabular-nums text-red-600 dark:text-red-400">
                  <AnimatedNumber value={totalExpense} formatter={(v) => formatCurrency(v)} />
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Питание */}
      {loading ? (
        <Skeleton className="h-[130px] rounded-xl" />
      ) : (
        <Card className="card-hover group rounded-xl border border-transparent bg-gradient-to-br from-orange-50 to-amber-50 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg dark:from-orange-950/40 dark:to-amber-950/30 dark:border-orange-800/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
              Питание
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/50">
              <Flame className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div>
              <p className="text-lg font-semibold tabular-nums">
                <AnimatedNumber value={todayKcal} />
                <span className="text-sm font-normal text-muted-foreground">
                  {' '}/ {kcalGoal.toLocaleString('ru-RU')} ккал
                </span>
              </p>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-orange-100 dark:bg-orange-900/30">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min((todayKcal / kcalGoal) * 100, 100)}%`,
                    backgroundColor:
                      todayKcal > kcalGoal
                        ? 'hsl(var(--destructive))'
                        : '#f97316',
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Тренировки */}
      {loading ? (
        <Skeleton className="h-[130px] rounded-xl" />
      ) : (
        <Card className="card-hover group rounded-xl border border-transparent bg-gradient-to-br from-blue-50 to-sky-50 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg dark:from-blue-950/40 dark:to-sky-950/30 dark:border-blue-800/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Тренировки
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
              <Dumbbell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div>
              <p className="text-lg font-semibold tabular-nums">
                <AnimatedNumber value={workoutsCount} />
              </p>
              <p className="text-xs text-blue-600/70 dark:text-blue-400/70">тренировок в этом месяце</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
})

export default StatCards
