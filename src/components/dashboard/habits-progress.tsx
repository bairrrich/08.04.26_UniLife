'use client'

import { memo } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Target, CheckCircle2 } from 'lucide-react'
import type { HabitItem } from './types'
import type { AppModule } from '@/store/use-app-store'
import { AnimatedNumber } from '@/components/ui/animated-number'

// ─── Props ────────────────────────────────────────────────────────────────────

interface HabitsProgressProps {
  loading: boolean
  totalActive: number
  completedToday: number
  habitsPercentage: number
  circumference: number
  dashOffset: number
  uncompletedHabits: HabitItem[]
  allHabitsCompleted: boolean
  onNavigate: (module: AppModule) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export const HabitsProgress = memo(function HabitsProgress({
  loading,
  totalActive,
  completedToday,
  habitsPercentage,
  circumference,
  dashOffset,
  uncompletedHabits,
  allHabitsCompleted,
  onNavigate,
}: HabitsProgressProps) {
  return (
    <Card className="rounded-xl border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="h-4 w-4 text-emerald-500" />
          Привычки сегодня
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center gap-8 py-4">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ) : totalActive === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Target className="mb-2 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Нет активных привычек</p>
            <Button
              variant="link"
              className="mt-1 h-auto p-0 text-xs text-emerald-500"
              onClick={() => onNavigate('habits')}
            >
              Добавить привычку →
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            {/* Circular Progress */}
            <div className="relative flex h-28 w-28 shrink-0 items-center justify-center">
              <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  strokeWidth="8"
                  className="stroke-muted"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  strokeWidth="8"
                  strokeLinecap="round"
                  className="stroke-emerald-500 transition-all duration-700 ease-out"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                  <AnimatedNumber value={habitsPercentage} />
                  <span className="text-lg">%</span>
                </span>
              </div>
            </div>

            {/* Stats & Uncompleted List */}
            <div className="flex-1 space-y-3 text-center sm:text-left">
              <p className="text-sm font-medium text-muted-foreground">
                <span className="tabular-nums text-base font-semibold text-foreground">
                  {completedToday}
                </span>{' '}
                из{' '}
                <span className="tabular-nums text-base font-semibold text-foreground">
                  {totalActive}
                </span>{' '}
                выполнено
              </p>

              {allHabitsCompleted ? (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 dark:bg-emerald-950/30">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                    Все привычки выполнены! 🎉
                  </p>
                </div>
              ) : uncompletedHabits.length > 0 ? (
                <div className="space-y-1.5">
                  {uncompletedHabits.map((habit) => (
                    <button
                      key={habit.id}
                      onClick={() => onNavigate('habits')}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-muted/60"
                    >
                      <span className="text-base">{habit.emoji}</span>
                      <span className="flex-1">{habit.name}</span>
                      <span className="text-xs text-muted-foreground">→</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
})

export default HabitsProgress
