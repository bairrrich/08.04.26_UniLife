'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Flame, BookOpen, Dumbbell, Target, UtensilsCrossed, Award, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getCurrentMonthStr } from '@/lib/format'

// ─── Types ────────────────────────────────────────────────────────────────────

interface StreakData {
  name: string
  icon: React.ReactNode
  current: number
  best: number
  color: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

function getMotivationalMessage(streak: number): string {
  if (streak === 0) return 'Начни серию прямо сейчас!'
  if (streak === 1) return 'Отличное начало! 💪'
  if (streak === 2) return 'Два дня подряд — держи темп!'
  if (streak === 3) return 'Три дня! Серия набирает обороты 🔥'
  if (streak <= 6) return 'Невероятная последовательность! 🌟'
  if (streak <= 13) return 'Ты — машина продуктивности! ⚡'
  if (streak <= 20) return 'Легендарная серия! Простирается неделями 🏆'
  if (streak <= 29) return 'Почти месяц без пропусков! Невероятно! 🎯'
  return 'Месяц+ непрерывности! Ты — абсолютный чемпион! 👑'
}

function getFlameCount(streak: number): number {
  if (streak === 0) return 0
  if (streak < 3) return 1
  if (streak < 7) return 2
  if (streak < 14) return 3
  if (streak < 30) return 4
  return 5
}

function getStreakBarColor(streak: number): string {
  if (streak >= 14) return 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500'
  if (streak >= 7) return 'bg-gradient-to-r from-orange-500 to-amber-500'
  if (streak >= 3) return 'bg-gradient-to-r from-amber-400 to-orange-400'
  return 'bg-amber-400'
}

function getStreakTextColor(streak: number): string {
  if (streak >= 14) return 'text-red-500'
  if (streak >= 7) return 'text-orange-500'
  if (streak >= 3) return 'text-amber-500'
  return 'text-foreground'
}

// ─── Animated Flame Component ────────────────────────────────────────────────

function AnimatedFlame({ count, streak }: { count: number; streak: number }) {
  if (count === 0) return null

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="inline-block"
          style={{
            animation: `flame-flicker ${1 + i * 0.2}s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.1}s`,
            fontSize: streak >= 14 ? '1.25rem' : '1rem',
          }}
        >
          🔥
        </span>
      ))}
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CurrentStreaks() {
  const [loading, setLoading] = useState(true)
  const [streaks, setStreaks] = useState<StreakData[]>([])
  const [prevStreaks, setPrevStreaks] = useState<number[]>([])
  const prevStreaksRef = useRef<number[]>([])

  useEffect(() => {
    async function fetchStreaks() {
      try {
        const month = getCurrentMonthStr()

        const [diaryRes, habitsRes, workoutRes, nutritionRes] = await Promise.allSettled([
          fetch(`/api/diary?month=${month}`).then((r) => r.json()),
          fetch('/api/habits').then((r) => r.json()),
          fetch(`/api/workout?month=${month}`).then((r) => r.json()),
          fetch(`/api/nutrition?month=${month}`).then((r) => r.json()),
        ])

        // Diary streak
        let diaryStreak = 0
        let diaryBest = 0
        if (diaryRes.status === 'fulfilled' && diaryRes.value?.success) {
          const dates = diaryRes.value.data.map((e: { date: string }) => e.date)
          diaryStreak = computeStreak(dates)
          diaryBest = diaryStreak // best = current for now (no historical best tracking)
        }

        // Habits streak (best streak across all habits)
        let habitsStreak = 0
        let habitsBest = 0
        if (habitsRes.status === 'fulfilled' && habitsRes.value?.success) {
          habitsStreak = habitsRes.value.stats.bestStreak ?? 0
          habitsBest = habitsStreak
        }

        // Workout streak
        let workoutStreak = 0
        let workoutBest = 0
        if (workoutRes.status === 'fulfilled' && workoutRes.value?.success) {
          const dates = workoutRes.value.data.map((w: { date: string }) => w.date)
          workoutStreak = computeStreak(dates)
          workoutBest = workoutStreak
        }

        // Nutrition streak
        let nutritionStreak = 0
        let nutritionBest = 0
        if (nutritionRes.status === 'fulfilled' && nutritionRes.value?.success) {
          const dates = nutritionRes.value.data.map((m: { date: string }) => m.date)
          nutritionStreak = computeStreak(dates)
          nutritionBest = nutritionStreak
        }

        const newStreaks: StreakData[] = [
          {
            name: 'Дневник',
            icon: <BookOpen className="h-4 w-4 text-emerald-500" />,
            current: diaryStreak,
            best: diaryBest,
            color: 'emerald',
          },
          {
            name: 'Тренировки',
            icon: <Dumbbell className="h-4 w-4 text-blue-500" />,
            current: workoutStreak,
            best: workoutBest,
            color: 'blue',
          },
          {
            name: 'Привычки',
            icon: <Target className="h-4 w-4 text-violet-500" />,
            current: habitsStreak,
            best: habitsBest,
            color: 'violet',
          },
          {
            name: 'Питание',
            icon: <UtensilsCrossed className="h-4 w-4 text-orange-500" />,
            current: nutritionStreak,
            best: nutritionBest,
            color: 'orange',
          },
        ]

        // Sort by current streak descending
        newStreaks.sort((a, b) => b.current - a.current)
        const hasAnyStreak = newStreaks.some((e) => e.current > 0)
        setStreaks(hasAnyStreak ? newStreaks : [])
        setPrevStreaks(prevStreaksRef.current)
        prevStreaksRef.current = newStreaks.map((s) => s.current)
      } catch (err) {
        console.error('Current streaks fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStreaks()
  }, [])

  const hasAnyStreak = useMemo(() => streaks.some((s) => s.current > 0), [streaks])
  const overallBest = useMemo(() => Math.max(...streaks.map((s) => s.best), 0), [streaks])
  const topStreak = streaks.find((s) => s.current > 0)

  // Overall motivational message based on longest current streak
  const motivationText = useMemo(() => {
    if (!topStreak) return 'Начните серию сегодня! 🌱'
    return getMotivationalMessage(topStreak.current)
  }, [topStreak])

  return (
    <Card className="animate-slide-up card-hover rounded-xl border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="relative">
              <Flame className="h-4 w-4 text-orange-500" />
              {topStreak && topStreak.current >= 3 && (
                <span className="absolute -top-1 -right-1 text-[8px]">🔥</span>
              )}
            </div>
            Серии активности
          </CardTitle>
          {overallBest > 0 && (
            <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 dark:bg-amber-950/30">
              <Award className="h-3 w-3 text-amber-500" />
              <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 tabular-nums">
                Рекорд: {overallBest} дн.
              </span>
            </div>
          )}
        </div>
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
            {/* Motivational banner */}
            <div className="rounded-lg bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 px-4 py-2.5 dark:from-orange-950/20 dark:via-amber-950/20 dark:to-yellow-950/20">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
                  {motivationText}
                </p>
              </div>
            </div>

            {/* Streak entries */}
            {streaks.map((entry, idx) => {
              const flameCount = getFlameCount(entry.current)
              const isAnimating = prevStreaks[idx] !== undefined && prevStreaks[idx] !== entry.current && entry.current > prevStreaks[idx]

              return (
                <div key={entry.name} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted/60">
                        {entry.icon}
                      </div>
                      <span className="text-sm font-medium">{entry.name}</span>
                      {flameCount > 0 && (
                        <AnimatedFlame count={Math.min(flameCount, 3)} streak={entry.current} />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'text-sm font-bold tabular-nums transition-all duration-300',
                          getStreakTextColor(entry.current),
                          isAnimating && 'animate-bounce-in',
                        )}
                      >
                        {entry.current}
                        <span className="text-[11px] font-normal text-muted-foreground ml-0.5">дн.</span>
                      </span>
                      {entry.best > entry.current && (
                        <span className="text-[10px] text-muted-foreground tabular-nums">
                          ← {entry.best} рекорд
                        </span>
                      )}
                      {entry.current === overallBest && overallBest > 0 && entry.current > 0 && (
                        <span className="text-[10px]">👑</span>
                      )}
                    </div>
                  </div>
                  {/* Streak progress bar */}
                  <div className="h-1.5 w-full rounded-full bg-muted/40 overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-700 ease-out',
                        getStreakBarColor(entry.current),
                      )}
                      style={{
                        width: `${Math.min((entry.current / 30) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-950/30 dark:to-amber-950/30">
              <Flame className="h-6 w-6 text-orange-400" />
            </div>
            <p className="text-center text-sm font-medium text-muted-foreground">
              Начните серию сегодня!
            </p>
            <p className="text-center text-xs text-muted-foreground/70 max-w-[200px]">
              Записывайте дневник, тренировки, привычки и питание, чтобы.build streaks
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Streak Calculator (local) ────────────────────────────────────────────────

function computeStreak(dates: string[]): number {
  if (dates.length === 0) return 0

  const uniqueDates = new Set(
    dates.map((d) => {
      const dt = new Date(d)
      return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
    })
  )

  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`

  if (!uniqueDates.has(todayStr) && !uniqueDates.has(yesterdayStr)) return 0

  let streak = 0
  const checkDate = uniqueDates.has(todayStr) ? new Date(now) : new Date(yesterday)

  while (true) {
    const checkStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`
    if (uniqueDates.has(checkStr)) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}
