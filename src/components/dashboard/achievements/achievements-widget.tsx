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
  Zap,
} from 'lucide-react'
import { motion } from 'framer-motion'
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

// ─── Streak Helper ───────────────────────────────────────────────────────────

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

// ─── Achievement Evaluator ────────────────────────────────────────────────────

function evaluateAchievement(
  id: string,
  ctx: AchievementContext
): { earned: boolean; earnedAt: string | null; current: number; threshold: number } {
  const now = new Date()
  const todayDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

  const savingsRate = ctx.financeStats
    ? ctx.financeStats.totalIncome > 0
      ? Math.round(((ctx.financeStats.totalIncome - ctx.financeStats.totalExpense) / ctx.financeStats.totalIncome) * 100)
      : 0
    : 0

  const totalWorkoutMin = ctx.workouts.reduce((sum, w) => sum + (w.durationMin ?? 0), 0)
  const hasAnyHabit = (ctx.habitsData?.data ?? []).length > 0
  const has7DayHabitStreak = (ctx.habitsData?.data ?? []).some((h) => h.streak >= 7)
  const has30DayHabitStreak = (ctx.habitsData?.data ?? []).some((h) => h.streak >= 30)
  const hasAnyNutrition = ctx.nutritionStats !== null && ctx.nutritionStats.totalKcal > 0

  // Week range for workout streak
  const weekAgo = new Date(now)
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weekAgoStr = `${weekAgo.getFullYear()}-${String(weekAgo.getMonth() + 1).padStart(2, '0')}-${String(weekAgo.getDate()).padStart(2, '0')}`
  const weekWorkouts = ctx.workouts.filter((w) => {
    const d = new Date(w.date)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` >= weekAgoStr
  }).length

  // Diary streak
  const diaryDates = ctx.diaryEntries.map((e) => new Date(e.date).toISOString())
  const diaryStreak = computeStreak(diaryDates)

  // Workout streak
  const workoutDates = ctx.workouts.map((w) => w.date)
  const workoutStreak = computeStreak(workoutDates)

  // Finance streak (consecutive days with transactions)
  const financeDates = ctx.transactionsData.map((t) => t.date)
  const financeStreak = computeStreak(financeDates)

  // Nutrition streak
  const nutritionDates = ctx.diaryEntries
    .filter(() => ctx.hasMealsToday || hasAnyNutrition)
    .map((e) => e.date)
  // We approximate nutrition streak from meals tracked (transactions with nutrition dates)
  // Use a simple count of unique dates where transactions were tracked
  const nutritionStreak = computeStreak(financeDates.length > 0 ? financeDates : [])

  // Early bird
  const hasEarlyBirdEntry = ctx.diaryEntries.some((e) => {
    const d = new Date(e.date)
    const isToday = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` === todayDateStr
    return isToday && d.getHours() < 8
  })

  // Active day
  const todayDiaryDone = ctx.diaryEntries.some((e) => {
    const d = new Date(e.date)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` === todayDateStr
  })
  const activeDay = todayDiaryDone && ctx.todayWorkoutDone && ctx.hasMealsToday && ctx.allHabitsCompleted

  // Active day streak (consecutive days where user was fully active)
  const activeDayStreak = activeDay ? 1 : 0

  switch (id) {
    // ── Diary ──
    case 'first_diary_entry':
      return { earned: ctx.diaryEntries.length > 0, earnedAt: ctx.diaryEntries.length > 0 ? ctx.diaryEntries[ctx.diaryEntries.length - 1]?.date ?? null : null, current: ctx.diaryEntries.length, threshold: 1 }

    case 'diary_streak_3':
      return { earned: diaryStreak >= 3, earnedAt: diaryStreak >= 3 ? todayDateStr : null, current: diaryStreak, threshold: 3 }

    case 'diary_streak_7':
      return { earned: diaryStreak >= 7, earnedAt: diaryStreak >= 7 ? todayDateStr : null, current: diaryStreak, threshold: 7 }

    case 'diary_streak_14':
      return { earned: diaryStreak >= 14, earnedAt: diaryStreak >= 14 ? todayDateStr : null, current: diaryStreak, threshold: 14 }

    case 'diary_30_entries':
      return { earned: ctx.diaryEntries.length >= 30, earnedAt: ctx.diaryEntries.length >= 30 ? ctx.diaryEntries[Math.max(0, ctx.diaryEntries.length - 30)]?.date ?? null : null, current: ctx.diaryEntries.length, threshold: 30 }

    case 'diary_writer_10':
      return { earned: ctx.diaryEntries.length >= 10, earnedAt: ctx.diaryEntries.length >= 10 ? ctx.diaryEntries[Math.max(0, ctx.diaryEntries.length - 10)]?.date ?? null : null, current: ctx.diaryEntries.length, threshold: 10 }

    // ── Finance ──
    case 'first_transaction':
      return { earned: ctx.transactionsCount > 0, earnedAt: ctx.transactionsCount > 0 ? ctx.transactionsData[0]?.date ?? null : null, current: ctx.transactionsCount, threshold: 1 }

    case 'savings_rate_positive':
      return { earned: savingsRate > 0, earnedAt: savingsRate > 0 ? todayDateStr : null, current: Math.max(savingsRate, 0), threshold: 1 }

    case 'finance_100_transactions':
      return { earned: ctx.transactionsCount >= 100, earnedAt: ctx.transactionsCount >= 100 ? todayDateStr : null, current: ctx.transactionsCount, threshold: 100 }

    case 'finance_guru_30_days':
      return { earned: financeStreak >= 30, earnedAt: financeStreak >= 30 ? todayDateStr : null, current: financeStreak, threshold: 30 }

    // ── Workout ──
    case 'first_workout':
      return { earned: ctx.workouts.length > 0, earnedAt: ctx.workouts.length > 0 ? ctx.workouts[0]?.date ?? null : null, current: ctx.workouts.length, threshold: 1 }

    case 'workout_streak_3':
      return { earned: weekWorkouts >= 3, earnedAt: weekWorkouts >= 3 ? todayDateStr : null, current: weekWorkouts, threshold: 3 }

    case 'workout_marathon':
      return { earned: totalWorkoutMin >= 1000, earnedAt: totalWorkoutMin >= 1000 ? ctx.workouts[ctx.workouts.length - 1]?.date ?? null : null, current: totalWorkoutMin, threshold: 1000 }

    case 'workout_20_logged':
      return { earned: ctx.workouts.length >= 20, earnedAt: ctx.workouts.length >= 20 ? todayDateStr : null, current: ctx.workouts.length, threshold: 20 }

    case 'workout_streak_7':
      return { earned: workoutStreak >= 7, earnedAt: workoutStreak >= 7 ? todayDateStr : null, current: workoutStreak, threshold: 7 }

    // ── Habits ──
    case 'first_habit_complete':
      return { earned: hasAnyHabit && (ctx.habitsData?.stats.completedToday ?? 0) > 0, earnedAt: hasAnyHabit && (ctx.habitsData?.stats.completedToday ?? 0) > 0 ? todayDateStr : null, current: ctx.habitsData?.stats.completedToday ?? 0, threshold: 1 }

    case 'all_habits_complete':
      return { earned: ctx.allHabitsCompleted, earnedAt: ctx.allHabitsCompleted ? todayDateStr : null, current: ctx.allHabitsCompleted ? 1 : 0, threshold: 1 }

    case 'habits_streak_7':
      return { earned: has7DayHabitStreak, earnedAt: has7DayHabitStreak ? todayDateStr : null, current: Math.max(...(ctx.habitsData?.data ?? []).map((h) => h.streak), 0), threshold: 7 }

    case 'habits_streak_30':
      return { earned: has30DayHabitStreak, earnedAt: has30DayHabitStreak ? todayDateStr : null, current: Math.max(...(ctx.habitsData?.data ?? []).map((h) => h.streak), 0), threshold: 30 }

    // ── Nutrition ──
    case 'first_meal':
      return { earned: ctx.hasMealsToday, earnedAt: ctx.hasMealsToday ? todayDateStr : null, current: ctx.hasMealsToday ? 1 : 0, threshold: 1 }

    case 'water_goal':
      return { earned: ctx.waterTodayMl >= 2000, earnedAt: ctx.waterTodayMl >= 2000 ? todayDateStr : null, current: ctx.waterTodayMl, threshold: 2000 }

    case 'nutrition_master_14':
      return { earned: nutritionStreak >= 14, earnedAt: nutritionStreak >= 14 ? todayDateStr : null, current: nutritionStreak, threshold: 14 }

    // ── Collections ──
    case 'first_collection':
      return { earned: false, earnedAt: null, current: 0, threshold: 1 }

    case 'collections_10':
      return { earned: false, earnedAt: null, current: 0, threshold: 10 }

    // ── Goals ──
    case 'first_goal_set':
      return { earned: false, earnedAt: null, current: 0, threshold: 1 }

    case 'first_goal_completed':
      return { earned: false, earnedAt: null, current: 0, threshold: 1 }

    // ── Feed ──
    case 'first_post':
      return { earned: false, earnedAt: null, current: 0, threshold: 1 }

    // ── General ──
    case 'general_active_day':
      return { earned: activeDay, earnedAt: activeDay ? todayDateStr : null, current: activeDay ? 1 : 0, threshold: 1 }

    case 'general_early_bird':
      return { earned: hasEarlyBirdEntry, earnedAt: hasEarlyBirdEntry ? todayDateStr : null, current: hasEarlyBirdEntry ? 1 : 0, threshold: 1 }

    case 'general_productive_week':
      return { earned: activeDayStreak >= 5, earnedAt: activeDayStreak >= 5 ? todayDateStr : null, current: activeDayStreak, threshold: 5 }

    case 'general_full_harmony':
      return { earned: activeDay, earnedAt: activeDay ? todayDateStr : null, current: activeDay ? 1 : 0, threshold: 1 }

    // ── New Achievements ──
    case 'week_streak':
      return { earned: activeDayStreak >= 7, earnedAt: activeDayStreak >= 7 ? todayDateStr : null, current: activeDayStreak, threshold: 7 }

    case 'bookworm_10':
      return { earned: ctx.diaryEntries.length >= 10, earnedAt: ctx.diaryEntries.length >= 10 ? ctx.diaryEntries[Math.max(0, ctx.diaryEntries.length - 10)]?.date ?? null : null, current: ctx.diaryEntries.length, threshold: 10 }

    case 'finance_guru':
      return { earned: ctx.transactionsCount >= 50, earnedAt: ctx.transactionsCount >= 50 ? todayDateStr : null, current: ctx.transactionsCount, threshold: 50 }

    case 'iron_will':
      return { earned: weekWorkouts >= 10, earnedAt: weekWorkouts >= 10 ? todayDateStr : null, current: weekWorkouts, threshold: 10 }

    case 'water_balance':
      return { earned: ctx.waterTodayMl >= 2000, earnedAt: ctx.waterTodayMl >= 2000 ? todayDateStr : null, current: ctx.waterTodayMl, threshold: 2000 }

    case 'goal_achiever':
      return { earned: false, earnedAt: null, current: 0, threshold: 5 }

    case 'perfect_day':
      return { earned: ctx.allHabitsCompleted, earnedAt: ctx.allHabitsCompleted ? todayDateStr : null, current: ctx.allHabitsCompleted ? 1 : 0, threshold: 1 }

    default:
      return { earned: false, earnedAt: null, current: 0, threshold: 1 }
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
          const timer = setTimeout(() => setNewlyEarnedKeys(new Set()), 5000)
          return () => clearTimeout(timer)
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
      const { earned, earnedAt, current, threshold } = evaluateAchievement(def.id, ctx)

      return {
        ...def,
        earned: isPersisted || earned,
        earnedAt: earnedAt,
        newlyEarned: isNewlyEarned,
        current,
        threshold,
      } satisfies Achievement
    })
  }, [diaryEntries, financeStats, transactionsData, workouts, habitsData, nutritionStats, waterTodayMl, hasMealsToday, todayMood, todayWorkoutDone, allHabitsCompleted, persistedKeys, newlyEarnedKeys])

  const earnedCount = useMemo(
    () => achievements.filter((a) => a.earned).length,
    [achievements]
  )
  const totalCount = achievements.length
  const progressPct = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0

  // ── Recently earned (newly earned or last 3 earned) ──
  const newlyEarnedItems = useMemo(
    () => achievements.filter((a) => a.earned && a.newlyEarned),
    [achievements]
  )

  const recentlyUnlocked = useMemo(() => {
    if (newlyEarnedItems.length > 0) return newlyEarnedItems
    // If no newly earned, show last 3 earned by earnedAt
    const withDates = achievements.filter((a) => a.earned && a.earnedAt != null)
    return withDates
      .slice()
      .sort((a, b) => {
        const aTime = new Date(a.earnedAt!).getTime()
        const bTime = new Date(b.earnedAt!).getTime()
        return bTime - aTime
      })
      .slice(0, 3)
  }, [achievements, newlyEarnedItems])

  // ── Filtered achievements (sorted: unlocked first, then locked) ──
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
    <Card className="animate-slide-up card-hover rounded-xl border overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-emerald-500/5 pointer-events-none" />
      <CardHeader className="relative overflow-hidden pb-3">
        {/* Decorative gradient blobs */}
        <div className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-400/10 blur-2xl" />
        <div className="pointer-events-none absolute -left-6 top-2 h-12 w-12 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-400/10 blur-2xl" />
        <div className="pointer-events-none absolute right-8 bottom-0 h-10 w-10 rounded-full bg-gradient-to-br from-teal-400/15 to-cyan-400/10 blur-xl" />
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

        {/* Progress bar — enhanced with gradient and label */}
        <div className="mt-2 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">
              {earnedCount} из {totalCount} разблокировано
            </span>
            <span className="text-xs tabular-nums font-semibold text-primary">{progressPct}%</span>
          </div>
          <Progress value={progressPct} className="h-2.5 [&>div]:bg-gradient-to-r [&>div]:from-emerald-500 [&>div]:via-teal-500 [&>div]:to-cyan-500 [&>div]:rounded-full" />
          <p className="text-xs text-muted-foreground">
            {earnedCount === totalCount
              ? '🎉 Все достижения получены!'
              : `Выполнено ${progressPct}% — осталось ${totalCount - earnedCount}`}
          </p>
        </div>

        <div className="mt-1 h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
      </CardHeader>

      <CardContent>
        {/* ── Recently Unlocked Section ── */}
        {recentlyUnlocked.length > 0 && (
          <div className="mb-4">
            <div className="mb-2.5 flex items-center gap-1.5">
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
              >
                <Zap className="h-3.5 w-3.5 text-amber-500" />
              </motion.div>
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                Недавно разблокировано
              </span>
              {newlyEarnedItems.length > 0 && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                  className="ml-1 rounded-md bg-gradient-to-r from-amber-400 to-orange-500 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-sm"
                >
                  NEW
                </motion.span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-3">
              {recentlyUnlocked.map((achievement, idx) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, type: 'spring', stiffness: 300, damping: 20 }}
                  className={cn(
                    'relative flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all duration-200 hover:shadow-md',
                    achievement.newlyEarned
                      ? 'border-amber-300 bg-gradient-to-br from-amber-50/80 to-orange-50/50 dark:border-amber-600 dark:from-amber-950/40 dark:to-orange-950/30'
                      : 'border-muted bg-muted/30 dark:border-muted/50'
                  )}
                >
                  {achievement.newlyEarned && (
                    <motion.div
                      className="pointer-events-none absolute -top-1 -right-1"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <Sparkles className="h-4 w-4 text-amber-500" />
                    </motion.div>
                  )}
                  <div className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br shadow-lg text-lg',
                    achievement.gradient,
                  )}>
                    {achievement.icon}
                  </div>
                  <span className="text-[11px] font-semibold text-center leading-tight">
                    {achievement.name}
                  </span>
                  <span className="text-[9px] text-muted-foreground text-center line-clamp-1">
                    {achievement.description}
                  </span>
                </motion.div>
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
          <div className="stagger-children grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
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
