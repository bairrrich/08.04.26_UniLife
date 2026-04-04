'use client'

import { memo } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BookOpen,
  Dumbbell,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Apple,
} from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { AnimatedNumber } from '@/components/ui/animated-number'

// ─── Props ────────────────────────────────────────────────────────────────────

interface WeeklySummaryProps {
  loading: boolean
  weekEntryCount: number
  weekWorkoutCount: number
  weekExpenseSum: number
  completedToday: number
  totalActive: number
  todayKcal: number
  maxStreak: number
}

// ─── Component ────────────────────────────────────────────────────────────────

export const WeeklySummary = memo(function WeeklySummary({
  loading,
  weekEntryCount,
  weekWorkoutCount,
  weekExpenseSum,
  completedToday,
  totalActive,
  todayKcal,
  maxStreak,
}: WeeklySummaryProps) {
  return (
    <Card className="rounded-xl border">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="h-4 w-4 text-blue-500" />
          Итого за неделю
        </CardTitle>
        <div className="mt-1 h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-[88px] rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            {/* Diary entries */}
            <div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-3.5 transition-colors hover:bg-emerald-100/80 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
                <BookOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">Записи</p>
                <div className="flex items-center gap-1">
                  <p className="text-lg font-semibold tabular-nums text-emerald-700 dark:text-emerald-300">
                    <AnimatedNumber value={weekEntryCount} />
                  </p>
                  {weekEntryCount > 0 && (
                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                  )}
                </div>
              </div>
            </div>

            {/* Workouts */}
            <div className="flex items-center gap-3 rounded-xl bg-blue-50 p-3.5 transition-colors hover:bg-blue-100/80 dark:bg-blue-950/30 dark:hover:bg-blue-950/50">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/50">
                <Dumbbell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">Тренировки</p>
                <div className="flex items-center gap-1">
                  <p className="text-lg font-semibold tabular-nums text-blue-700 dark:text-blue-300">
                    <AnimatedNumber value={weekWorkoutCount} />
                  </p>
                  {weekWorkoutCount > 0 && (
                    <TrendingUp className="h-3 w-3 text-blue-500" />
                  )}
                </div>
              </div>
            </div>

            {/* Expenses */}
            <div className="flex items-center gap-3 rounded-xl bg-amber-50 p-3.5 transition-colors hover:bg-amber-100/80 dark:bg-amber-950/30 dark:hover:bg-amber-950/50">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/50">
                <TrendingDown className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">Расходы</p>
                <div className="flex items-center gap-1">
                  <p className="text-base font-semibold tabular-nums text-amber-700 dark:text-amber-300">
                    {formatCurrency(weekExpenseSum)}
                  </p>
                  {weekExpenseSum > 0 && (
                    <TrendingDown className="h-3 w-3 text-amber-500" />
                  )}
                </div>
              </div>
            </div>

            {/* Habits */}
            <div className="flex items-center gap-3 rounded-xl bg-violet-50 p-3.5 transition-colors hover:bg-violet-100/80 dark:bg-violet-950/30 dark:hover:bg-violet-950/50">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/50">
                <CheckCircle2 className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">Привычки</p>
                <div className="flex items-center gap-1">
                  <p className="text-lg font-semibold tabular-nums text-violet-700 dark:text-violet-300">
                    {completedToday}<span className="text-sm font-normal text-muted-foreground"> / {totalActive}</span>
                  </p>
                  {completedToday > 0 && (
                    <TrendingUp className="h-3 w-3 text-violet-500" />
                  )}
                </div>
              </div>
            </div>

            {/* Nutrition */}
            <div className="flex items-center gap-3 rounded-xl bg-orange-50 p-3.5 transition-colors hover:bg-orange-100/80 dark:bg-orange-950/30 dark:hover:bg-orange-950/50 col-span-2 lg:col-span-1">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/50">
                <Apple className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">Калории</p>
                <div className="flex items-center gap-1">
                  <p className="text-lg font-semibold tabular-nums text-orange-700 dark:text-orange-300">
                    <AnimatedNumber value={todayKcal} />
                  </p>
                  {todayKcal > 0 && (
                    <TrendingUp className="h-3 w-3 text-orange-500" />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
})
