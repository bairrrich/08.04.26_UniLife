'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Flame, BookOpen, Dumbbell, Target, UtensilsCrossed } from 'lucide-react'
import { getCurrentMonthStr, getTodayStr, toDateStr, calculateStreak } from '@/lib/format'
import { fetchJson } from '@/lib/safe-fetch'

// ─── Types ────────────────────────────────────────────────────────────────────

interface StreakEntry {
  icon: React.ReactNode
  name: string
  streak: number
  color: 'emerald' | 'amber' | 'muted'
}

interface HabitsResponse {
  success: boolean
  data: Array<{ streak: number; todayCompleted: boolean; last7Days: Record<string, boolean> }>
  stats: { totalActive: number; completedToday: number; bestStreak: number }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStreakColor(streak: number): 'emerald' | 'amber' | 'muted' {
  if (streak >= 7) return 'emerald'
  if (streak >= 3) return 'amber'
  return 'muted'
}

function getBarColorClass(color: 'emerald' | 'amber' | 'muted'): string {
  switch (color) {
    case 'emerald':
      return 'bg-emerald-500 dark:bg-emerald-400'
    case 'amber':
      return 'bg-amber-500 dark:bg-amber-400'
    case 'muted':
      return 'bg-muted-foreground/40'
  }
}

function getBarTrackClass(): string {
  return 'bg-muted/40 dark:bg-muted/20'
}

function getTextClass(color: 'emerald' | 'amber' | 'muted'): string {
  switch (color) {
    case 'emerald':
      return 'text-emerald-600 dark:text-emerald-400'
    case 'amber':
      return 'text-amber-600 dark:text-amber-400'
    case 'muted':
      return 'text-muted-foreground'
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CurrentStreaks() {
  const [loading, setLoading] = useState(true)
  const [streaks, setStreaks] = useState<StreakEntry[]>([])

  useEffect(() => {
    async function fetchStreaks() {
      try {
        const month = getCurrentMonthStr()
        const today = getTodayStr()

        const [diaryRes, habitsRes, workoutRes, nutritionRes] = await Promise.allSettled([
          fetchJson<{ success: boolean; data: Array<{ date: string }> }>(`/api/diary?month=${month}`),
          fetchJson<HabitsResponse>('/api/habits'),
          fetchJson<{ success: boolean; data: Array<{ date: string }> }>(`/api/workout?month=${month}`),
          fetchJson<{ success: boolean; data: Array<{ date: string }> }>(`/api/nutrition?date=${today}`),
        ])

        // Diary streak
        let diaryStreak = 0
        if (diaryRes.status === 'fulfilled' && diaryRes.value?.success) {
          const dates = diaryRes.value.data.map((e) => e.date)
          diaryStreak = calculateStreak(dates)
        }

        // Habits streak (best streak across all habits)
        let habitsStreak = 0
        if (habitsRes.status === 'fulfilled' && habitsRes.value?.success) {
          habitsStreak = habitsRes.value.stats.bestStreak ?? 0
        }

        // Workout streak
        let workoutStreak = 0
        if (workoutRes.status === 'fulfilled' && workoutRes.value?.success) {
          const dates = workoutRes.value.data.map((w) => w.date)
          workoutStreak = calculateStreak(dates)
        }

        // Nutrition — check consecutive days with meals logged this month
        let nutritionStreak = 0
        if (nutritionRes.status === 'fulfilled' && nutritionRes.value?.success) {
          // For today check, we just need to know if there are meals today
          // For streak, we'd need full month data
          const todayMealCount = nutritionRes.value.data?.length ?? 0
          if (todayMealCount > 0) {
            // Fetch full month to calculate nutrition streak
            const monthNutrition = await fetchJson<{ success: boolean; data: Array<{ date: string }> }>(
              `/api/nutrition?month=${month}`
            )
            if (monthNutrition?.success) {
              const dates = monthNutrition.data.map((m) => m.date)
              nutritionStreak = calculateStreak(dates)
            }
          }
        }

        // Build streak entries, only include those with streak > 0
        const entries: StreakEntry[] = [
          {
            icon: <BookOpen className="h-3.5 w-3.5 text-emerald-500" />,
            name: 'Дневник',
            streak: diaryStreak,
            color: getStreakColor(diaryStreak),
          },
          {
            icon: <Dumbbell className="h-3.5 w-3.5 text-blue-500" />,
            name: 'Тренировки',
            streak: workoutStreak,
            color: getStreakColor(workoutStreak),
          },
          {
            icon: <Target className="h-3.5 w-3.5 text-violet-500" />,
            name: 'Привычки',
            streak: habitsStreak,
            color: getStreakColor(habitsStreak),
          },
          {
            icon: <UtensilsCrossed className="h-3.5 w-3.5 text-orange-500" />,
            name: 'Питание',
            streak: nutritionStreak,
            color: getStreakColor(nutritionStreak),
          },
        ]

        // Sort by streak desc, limit to 4
        entries.sort((a, b) => b.streak - a.streak)
        const hasAnyStreak = entries.some((e) => e.streak > 0)
        setStreaks(hasAnyStreak ? entries.slice(0, 4) : [])
      } catch (err) {
        console.error('Current streaks fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStreaks()
  }, [])

  const hasAnyStreak = useMemo(() => streaks.some((s) => s.streak > 0), [streaks])

  return (
    <Card className="animate-slide-up card-hover rounded-xl border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Flame className="h-4 w-4 text-orange-500" />
          Текущие серии
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        ) : hasAnyStreak ? (
          <div className="space-y-3">
            {streaks.map((entry) => (
              <div key={entry.name} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-muted/60">
                      {entry.icon}
                    </div>
                    <span className="text-sm font-medium">{entry.name}</span>
                    {entry.streak >= 3 && (
                      <span className="text-xs">&#x1F525;</span>
                    )}
                  </div>
                  <span className={`text-sm font-bold tabular-nums ${getTextClass(entry.color)}`}>
                    {entry.streak}&nbsp;дн.
                  </span>
                </div>
                {/* Progress bar */}
                <div className={`h-1.5 w-full rounded-full overflow-hidden ${getBarTrackClass()}`}>
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${getBarColorClass(entry.color)}`}
                    style={{
                      width: `${Math.min((entry.streak / 30) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400/20 to-primary/20">
              <Flame className="h-5 w-5 text-muted-foreground/60" />
            </div>
            <p className="text-center text-sm font-medium text-muted-foreground">
              Начните серию сегодня!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
