'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { memo } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Trophy,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Star,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AchievementBadge } from './achievement-badge'
import { ACHIEVEMENT_DEFINITIONS, CATEGORY_COLORS } from './constants'
import type { Achievement, AchievementContext, PersistedAchievement } from './types'
import type { DiaryEntry, FinanceStats, NutritionStats, Workout, HabitItem, BudgetData } from '../types'

// ─── Props ────────────────────────────────────────────────────────────────────

interface AchievementsWidgetProps {
  loading: boolean
  diaryEntries: DiaryEntry[]
  financeStats: FinanceStats | null
  transactionsData: { id: string; date: string; amount: number; type: string }[]
  workouts: Workout[]
  habitsData: {
    data: HabitItem[]
    stats: { totalActive: number; completedToday: number; bestStreak: number }
  } | null
  nutritionStats: NutritionStats | null
  waterTodayMl: number
  hasMealsToday: boolean
  todayMood: number | null
  todayWorkoutDone: boolean
  allHabitsCompleted: boolean
  budgetData: BudgetData | null
}

// ─── Achievement Evaluator ────────────────────────────────────────────────────

function evaluateAchievement(
  id: string,
  ctx: AchievementContext
): { earned: boolean; earnedAt: string | null } {
  const now = new Date()
  const todayDateStr = now.toISOString().split('T')[0]

  const savingsRate = ctx.financeStats
    ? ctx.financeStats.totalIncome > 0
      ? Math.round(((ctx.financeStats.totalIncome - ctx.financeStats.totalExpense) / ctx.financeStats.totalIncome) * 100)
      : 0
    : 0

  const totalWorkoutMin = ctx.workouts.reduce((sum, w) => sum + (w.durationMin ?? 0), 0)
  const hasAnyHabit = (ctx.habitsData?.data ?? []).length > 0
  const has7DayHabitStreak = (ctx.habitsData?.data ?? []).some((h) => h.streak >= 7)
  const hasAnyNutrition = ctx.nutritionStats !== null && ctx.nutritionStats.totalKcal > 0

  // Week range for workout streak
  const weekAgo = new Date(now)
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weekAgoStr = weekAgo.toISOString().split('T')[0]
  const weekWorkouts = ctx.workouts.filter((w) => new Date(w.date).toISOString().split('T')[0] >= weekAgoStr).length

  // Diary streak
  const dates = [...new Set(ctx.diaryEntries.map((e) => new Date(e.date).toISOString().split('T')[0]))].sort().reverse()
  let diaryStreak = 0
  if (dates.length > 0) {
    const todayKey = todayDateStr
    const yesterdayKey = (() => { const d = new Date(now); d.setDate(d.getDate() - 1); return d.toISOString().split('T')[0] })()
    if (dates[0] === todayKey || dates[0] === yesterdayKey) {
      diaryStreak = 1
      for (let i = 0; i < dates.length - 1; i++) {
        const curr = new Date(dates[i])
        const prev = new Date(dates[i + 1])
        const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24))
        if (diffDays === 1) {
          diaryStreak++
        } else {
          break
        }
      }
    }
  }

  // Early bird
  const hasEarlyBirdEntry = ctx.diaryEntries.some((e) => {
    const d = new Date(e.date)
    const isToday = d.toISOString().split('T')[0] === todayDateStr
    return isToday && d.getHours() < 8
  })

  // Active day
  const todayDiaryDone = ctx.diaryEntries.some((e) => new Date(e.date).toISOString().split('T')[0] === todayDateStr)
  const activeDay = todayDiaryDone && ctx.todayWorkoutDone && ctx.hasMealsToday && ctx.allHabitsCompleted

  switch (id) {
    // ── Diary ──
    case 'first_diary_entry':
      return { earned: ctx.diaryEntries.length > 0, earnedAt: ctx.diaryEntries.length > 0 ? ctx.diaryEntries[ctx.diaryEntries.length - 1]?.date ?? null : null }

    case 'diary_streak_3':
      return { earned: diaryStreak >= 3, earnedAt: diaryStreak >= 3 ? todayDateStr : null }

    case 'diary_streak_7':
      return { earned: diaryStreak >= 7, earnedAt: diaryStreak >= 7 ? todayDateStr : null }

    case 'diary_30_entries':
      return { earned: ctx.diaryEntries.length >= 30, earnedAt: ctx.diaryEntries.length >= 30 ? ctx.diaryEntries[Math.max(0, ctx.diaryEntries.length - 30)]?.date ?? null : null }

    // ── Finance ──
    case 'first_transaction':
      return { earned: ctx.transactionsCount > 0, earnedAt: ctx.transactionsCount > 0 ? ctx.transactionsData[0]?.date ?? null : null }

    case 'savings_rate_positive':
      return { earned: savingsRate > 0, earnedAt: savingsRate > 0 ? todayDateStr : null }

    case 'finance_100_transactions':
      return { earned: ctx.transactionsCount >= 100, earnedAt: ctx.transactionsCount >= 100 ? todayDateStr : null }

    // ── Workout ──
    case 'first_workout':
      return { earned: ctx.workouts.length > 0, earnedAt: ctx.workouts.length > 0 ? ctx.workouts[0]?.date ?? null : null }

    case 'workout_streak_3':
      return { earned: weekWorkouts >= 3, earnedAt: weekWorkouts >= 3 ? todayDateStr : null }

    case 'workout_marathon':
      return { earned: totalWorkoutMin >= 1000, earnedAt: totalWorkoutMin >= 1000 ? ctx.workouts[ctx.workouts.length - 1]?.date ?? null : null }

    // ── Habits ──
    case 'first_habit_complete':
      return { earned: hasAnyHabit && (ctx.habitsData?.stats.completedToday ?? 0) > 0, earnedAt: hasAnyHabit && (ctx.habitsData?.stats.completedToday ?? 0) > 0 ? todayDateStr : null }

    case 'all_habits_complete':
      return { earned: ctx.allHabitsCompleted, earnedAt: ctx.allHabitsCompleted ? todayDateStr : null }

    case 'habits_streak_7':
      return { earned: has7DayHabitStreak, earnedAt: has7DayHabitStreak ? todayDateStr : null }

    // ── Nutrition ──
    case 'first_meal':
      return { earned: ctx.hasMealsToday, earnedAt: ctx.hasMealsToday ? todayDateStr : null }

    case 'water_goal':
      return { earned: ctx.waterTodayMl >= 2000, earnedAt: ctx.waterTodayMl >= 2000 ? todayDateStr : null }

    // ── Collections ──
    case 'first_collection':
      // Checked via API persistence
      return { earned: false, earnedAt: null }

    case 'collections_10':
      return { earned: false, earnedAt: null }

    // ── Goals ──
    case 'first_goal_set':
      return { earned: false, earnedAt: null }

    case 'first_goal_completed':
      return { earned: false, earnedAt: null }

    // ── Feed ──
    case 'first_post':
      return { earned: false, earnedAt: null }

    // ── General ──
    case 'general_active_day':
      return { earned: activeDay, earnedAt: activeDay ? todayDateStr : null }

    case 'general_early_bird':
      return { earned: hasEarlyBirdEntry, earnedAt: hasEarlyBirdEntry ? todayDateStr : null }

    default:
      return { earned: false, earnedAt: null }
  }
}

// ─── Category Filter Tabs ─────────────────────────────────────────────────────

const ALL_CATEGORIES = [
  { key: 'all', label: 'Все', icon: '🏆' },
  { key: 'diary', label: 'Дневник', icon: '📖' },
  { key: 'finance', label: 'Финансы', icon: '💰' },
  { key: 'workout', label: 'Тренировки', icon: '💪' },
  { key: 'habits', label: 'Привычки', icon: '🎯' },
  { key: 'nutrition', label: 'Питание', icon: '🥗' },
  { key: 'collections', label: 'Коллекции', icon: '📚' },
  { key: 'goals', label: 'Цели', icon: '🎯' },
  { key: 'feed', label: 'Лента', icon: '📢' },
  { key: 'general', label: 'Общие', icon: '⭐' },
] as const

type CategoryFilter = (typeof ALL_CATEGORIES)[number]['key']

// ─── Component ────────────────────────────────────────────────────────────────

export const AchievementsWidget = memo(function AchievementsWidget({
  loading,
  diaryEntries,
  financeStats,
  transactionsData,
  workouts,
  habitsData,
  nutritionStats,
  waterTodayMl,
  hasMealsToday,
  todayMood,
  todayWorkoutDone,
  allHabitsCompleted,
  budgetData,
}: AchievementsWidgetProps) {
  const [showUnearned, setShowUnearned] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [persistedKeys, setPersistedKeys] = useState<Set<string>>(new Set())
  const [newlyEarnedKeys, setNewlyEarnedKeys] = useState<Set<string>>(new Set())

  // ── Fetch persisted achievements from API ──
  useEffect(() => {
    if (loading) return
    const controller = new AbortController()

    async function checkAchievements() {
      try {
        const res = await fetch('/api/achievements', { signal: controller.signal })
        if (!res.ok) return
        const json = await res.json()
        if (!json.success) return

        // Mark persisted achievement keys
        const persisted: PersistedAchievement[] = json.data?.persisted ?? []
        setPersistedKeys(new Set(persisted.map((a) => a.key)))

        // Mark newly earned keys for animation
        const newlyEarned = json.data?.earned ?? []
        if (newlyEarned.length > 0) {
          setNewlyEarnedKeys(new Set(newlyEarned.map((a: { key: string }) => a.key)))
          // Clear newly earned flag after 5 seconds
          setTimeout(() => setNewlyEarnedKeys(new Set()), 5000)
        }
      } catch {
        // Silently fail — fall back to client-side evaluation
      }
    }

    checkAchievements()
    return () => controller.abort()
  }, [loading])

  // ── Compute achievements ──
  const achievements: Achievement[] = useMemo(() => {
    const ctx: AchievementContext = {
      diaryEntries: diaryEntries.map((e) => ({ id: e.id, date: e.date, mood: e.mood, title: e.title })),
      financeStats: financeStats ? {
        totalIncome: financeStats.totalIncome,
        totalExpense: financeStats.totalExpense,
        savingsRate: financeStats.totalIncome > 0
          ? Math.round(((financeStats.totalIncome - financeStats.totalExpense) / financeStats.totalIncome) * 100)
          : null,
      } : null,
      transactionsCount: transactionsData.length,
      transactionsData: transactionsData.map((t) => ({ id: t.id, date: t.date, amount: t.amount, type: t.type })),
      workouts: workouts.map((w) => ({ id: w.id, date: w.date, durationMin: w.durationMin })),
      habitsData: habitsData ? {
        data: habitsData.data.map((h) => ({
          id: h.id,
          name: h.name,
          todayCompleted: h.todayCompleted,
          streak: h.streak,
        })),
        stats: habitsData.stats,
      } : null,
      nutritionStats,
      waterTodayMl,
      hasMealsToday,
      todayMood,
      todayWorkoutDone,
      allHabitsCompleted,
    }

    return ACHIEVEMENT_DEFINITIONS.map((def) => {
      const isPersisted = persistedKeys.has(def.id)
      const isNewlyEarned = newlyEarnedKeys.has(def.id)
      const { earned, earnedAt } = evaluateAchievement(def.id, ctx)

      return {
        ...def,
        earned: isPersisted || earned,
        earnedAt: earnedAt,
        newlyEarned: isNewlyEarned,
      } satisfies Achievement
    })
  }, [diaryEntries, financeStats, transactionsData, workouts, habitsData, nutritionStats, waterTodayMl, hasMealsToday, todayMood, todayWorkoutDone, allHabitsCompleted, persistedKeys, newlyEarnedKeys])

  const earnedCount = useMemo(
    () => achievements.filter((a) => a.earned).length,
    [achievements]
  )
  const totalCount = achievements.length
  const progressPct = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0

  // ── Recently earned (newly earned) ──
  const recentlyEarned = useMemo(
    () => achievements.filter((a) => a.earned && a.newlyEarned),
    [achievements]
  )

  // ── Filtered achievements ──
  const filteredAchievements = useMemo(() => {
    const filtered = categoryFilter === 'all'
      ? achievements
      : achievements.filter((a) => a.category === categoryFilter)

    const earned = filtered.filter((a) => a.earned && !a.newlyEarned)
    const unearned = filtered.filter((a) => !a.earned)
    return { earned, unearned }
  }, [achievements, categoryFilter])

  // ── Category badge count ──
  const categoryBadgeCount = useCallback(
    (key: CategoryFilter) => {
      if (key === 'all') return earnedCount
      return achievements.filter((a) => a.category === key && a.earned).length
    },
    [achievements, earnedCount]
  )

  // ── Loading state ──
  if (loading) {
    return (
      <Card className="rounded-xl border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-5 w-36" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="mb-4 h-3 w-full rounded-full" />
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-xl border">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm">
              <Trophy className="h-4 w-4 text-white" />
            </div>
            Достижения
          </CardTitle>
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-sm font-semibold tabular-nums">
              {earnedCount}
              <span className="text-muted-foreground font-normal"> / {totalCount}</span>
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-1 space-y-1.5">
          <Progress value={progressPct} className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-emerald-500 [&>div]:to-teal-500" />
          <p className="text-xs text-muted-foreground">
            {earnedCount === totalCount
              ? '🎉 Все достижения получены!'
              : `Выполнено ${progressPct}% — осталось ${totalCount - earnedCount}`}
          </p>
        </div>

        <div className="mt-1 h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
      </CardHeader>

      <CardContent>
        {/* ── Recently Earned Section ── */}
        {recentlyEarned.length > 0 && (
          <div className="mb-4">
            <div className="mb-2 flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                Новые достижения!
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {recentlyEarned.map((achievement) => (
                <div
                  key={achievement.id}
                  className={cn(
                    'animate-bounce-in flex flex-col items-center gap-1.5 rounded-xl border-2 border-amber-300 bg-amber-50/50 p-3 dark:border-amber-600 dark:bg-amber-950/30'
                  )}
                >
                  <div className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br shadow-lg text-lg',
                    achievement.gradient,
                  )}>
                    {achievement.icon}
                  </div>
                  <span className="text-xs font-semibold text-center leading-tight">
                    {achievement.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground text-center line-clamp-1">
                    {achievement.description}
                  </span>
                </div>
              ))}
            </div>
            <Separator className="mt-4" />
          </div>
        )}

        {/* Category Filter */}
        <div className="mb-4 flex flex-wrap gap-1.5">
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setCategoryFilter(cat.key)}
              className={cn(
                'inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors',
                categoryFilter === cat.key
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              {categoryBadgeCount(cat.key) > 0 && (
                <span
                  className={cn(
                    'ml-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold',
                    categoryFilter === cat.key
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                  )}
                >
                  {categoryBadgeCount(cat.key)}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Earned Achievements Grid */}
        {filteredAchievements.earned.length > 0 ? (
          <div className="stagger-children grid grid-cols-3 gap-2 sm:grid-cols-4">
            {filteredAchievements.earned.map((achievement) => (
              <AchievementBadge key={achievement.id} achievement={achievement} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-muted/80 to-muted/40">
              <Trophy className="h-7 w-7 text-muted-foreground/60" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              {categoryFilter === 'all'
                ? 'Пока нет достижений'
                : `Нет достижений в категории «${ALL_CATEGORIES.find((c) => c.key === categoryFilter)?.label}»`}
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Начните использовать приложение, чтобы получить первые бейджи
            </p>
          </div>
        )}

        {/* Separator */}
        {filteredAchievements.unearned.length > 0 && filteredAchievements.earned.length > 0 && (
          <Separator className="my-4" />
        )}

        {/* Show Unearned Toggle */}
        {filteredAchievements.unearned.length > 0 && (
          <>
            <button
              onClick={() => setShowUnearned((v) => !v)}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
            >
              {showUnearned ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5" />
                  Скрыть недоступные ({filteredAchievements.unearned.length})
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5" />
                  Показать все ({filteredAchievements.unearned.length} осталось)
                </>
              )}
            </button>

            {showUnearned && (
              <div className="stagger-children mt-3 grid max-h-96 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
                {filteredAchievements.unearned.map((achievement) => (
                  <AchievementBadge key={achievement.id} achievement={achievement} />
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
})

export default AchievementsWidget
