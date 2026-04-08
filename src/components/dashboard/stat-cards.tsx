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

// ─── Stat Card Data ──────────────────────────────────────────────────────────

interface StatCardDef {
  title: string
  titleColor: string
  icon: typeof BookOpen
  iconGradient: string
  iconBgDark: string
  cardGradient: string
  cardGradientDark: string
  cardBorder: string
  trendUp?: boolean
  trendLabel?: string
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
        <Skeleton className="h-[140px] rounded-xl" />
      ) : (
        <Card className="card-hover group rounded-xl border border-transparent bg-gradient-to-br from-emerald-50 to-teal-50 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg dark:from-emerald-950/40 dark:to-teal-950/30 dark:border-emerald-800/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              Дневник
            </CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-sm shadow-emerald-500/20 dark:from-emerald-500 dark:to-teal-600">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <span className="text-3xl">
                {todayMood ? MOOD_EMOJI[todayMood] : '📝'}
              </span>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-xl font-bold tabular-nums text-foreground">
                    <AnimatedNumber value={weekEntries} />
                  </p>
                  {weekEntries > 0 && (
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                  )}
                </div>
                <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">записей за неделю</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Финансы */}
      {loading ? (
        <Skeleton className="h-[140px] rounded-xl" />
      ) : (
        <Card className="card-hover group rounded-xl border border-transparent bg-gradient-to-br from-amber-50 to-yellow-50 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg dark:from-amber-950/40 dark:to-yellow-950/30 dark:border-amber-800/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300">
              Финансы
            </CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm shadow-amber-500/20 dark:from-amber-500 dark:to-orange-600">
              <Wallet className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                  <AnimatedNumber value={totalIncome} formatter={(v) => formatCurrency(v)} />
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <TrendingDown className="h-3.5 w-3.5 text-red-500" />
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
        <Skeleton className="h-[140px] rounded-xl" />
      ) : (
        <Card className="card-hover group rounded-xl border border-transparent bg-gradient-to-br from-orange-50 to-amber-50 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg dark:from-orange-950/40 dark:to-amber-950/30 dark:border-orange-800/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
              Питание
            </CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-amber-500 shadow-sm shadow-orange-500/20 dark:from-orange-500 dark:to-amber-600">
              <Flame className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xl font-bold tabular-nums text-foreground">
                  <AnimatedNumber value={todayKcal} />
                </p>
                {todayKcal > 0 && (
                  <TrendingUp className="h-3.5 w-3.5 text-orange-500" />
                )}
              </div>
              <span className="text-sm font-normal text-muted-foreground">
                / {kcalGoal.toLocaleString('ru-RU')} ккал
              </span>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-orange-100 dark:bg-orange-900/30">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min((todayKcal / kcalGoal) * 100, 100)}%`,
                    backgroundColor:
                      todayKcal > kcalGoal
                        ? 'hsl(var(--destructive))'
                        : 'hsl(var(--chart-1))',
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Тренировки */}
      {loading ? (
        <Skeleton className="h-[140px] rounded-xl" />
      ) : (
        <Card className="card-hover group rounded-xl border border-transparent bg-gradient-to-br from-sky-50 to-cyan-50 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg dark:from-sky-950/40 dark:to-cyan-950/30 dark:border-sky-800/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-sky-700 dark:text-sky-300">
              Тренировки
            </CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-cyan-500 shadow-sm shadow-sky-500/20 dark:from-sky-500 dark:to-cyan-600">
              <Dumbbell className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-1.5">
              <p className="text-xl font-bold tabular-nums text-foreground">
                <AnimatedNumber value={workoutsCount} />
              </p>
              {workoutsCount > 0 && (
                <TrendingUp className="h-3.5 w-3.5 text-sky-500" />
              )}
            </div>
            <p className="text-xs text-sky-600/70 dark:text-sky-400/70">тренировок в этом месяце</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
})

export default StatCards
