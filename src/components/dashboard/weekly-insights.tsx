'use client'

import { useMemo, memo } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Flame,
  CalendarCheck,
  BarChart3,
  Trophy,
  Target,
  SmilePlus,
  TrendingUp,
  TrendingDown,
  Minus,
  BookOpen,
  Dumbbell,
  Wallet,
  Utensils,
  Zap,
} from 'lucide-react'
import { MOOD_EMOJI, toDateStr } from '@/lib/format'
import type { DiaryEntry, Workout, Transaction, HabitItem } from './types'

// ─── Props ────────────────────────────────────────────────────────────────────

interface WeeklyInsightsProps {
  loading: boolean
  diaryEntries: DiaryEntry[]
  workouts: Workout[]
  transactionsData: Transaction[]
  habitsData: {
    data: HabitItem[]
    stats: { totalActive: number; completedToday: number; bestStreak: number }
  } | null
  recentMoods: { date: string; mood: number | null }[]
  hasMealsToday: boolean
  waterTodayMl: number
  dailyProgress: number
  maxStreak: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const RU_DAYS = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье']

function getDayName(dateStr: string): string {
  const d = new Date(dateStr)
  const dayIndex = d.getDay() === 0 ? 6 : d.getDay() - 1
  return RU_DAYS[dayIndex]
}

// ─── Insight Card ─────────────────────────────────────────────────────────────

interface InsightItem {
  icon: React.ReactNode
  label: string
  value: string
  subtitle?: string
  trend?: 'up' | 'down' | 'neutral'
  trendLabel?: string
  colorClass: string
  bgClass: string
  iconBgClass: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export default memo(function WeeklyInsights({
  loading,
  diaryEntries,
  workouts,
  transactionsData,
  habitsData,
  recentMoods,
  hasMealsToday,
  waterTodayMl,
  dailyProgress,
  maxStreak,
}: WeeklyInsightsProps) {
  const insights = useMemo<InsightItem[]>(() => {
    if (loading) return []

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // ── 1. Streak ────────────────────────────────────────────────
    const streakVal = maxStreak > 0 ? `${maxStreak} дн.` : 'Нет'
    const streakColor = maxStreak >= 7 ? 'text-emerald-600 dark:text-emerald-400' : maxStreak >= 3 ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'
    const streakBg = maxStreak >= 7 ? 'from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20' : maxStreak >= 3 ? 'from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/20' : 'from-muted/50 to-transparent'
    const streakIconBg = maxStreak >= 7 ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400' : maxStreak >= 3 ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400' : 'bg-muted text-muted-foreground'

    // ── 2. Most Active Day ───────────────────────────────────────
    const activityByDate = new Map<string, number>()
    for (const e of diaryEntries) {
      const key = toDateStr(new Date(e.date))
      activityByDate.set(key, (activityByDate.get(key) ?? 0) + 1)
    }
    for (const w of workouts) {
      const key = toDateStr(new Date(w.date))
      activityByDate.set(key, (activityByDate.get(key) ?? 0) + 1)
    }
    for (const t of transactionsData) {
      const key = toDateStr(new Date(t.date))
      activityByDate.set(key, (activityByDate.get(key) ?? 0) + 1)
    }

    let mostActiveDay = 'Нет данных'
    let mostActiveCount = 0
    activityByDate.forEach((count, dateStr) => {
      if (count > mostActiveCount) {
        mostActiveCount = count
        mostActiveDay = getDayName(dateStr)
      }
    })

    // ── 3. Weekly Score (this week vs prev week) ─────────────────
    const weekMs = 7 * 24 * 60 * 60 * 1000
    const thisWeekStart = new Date(today)
    const dayOfWeek = today.getDay()
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    thisWeekStart.setDate(today.getDate() - mondayOffset)
    thisWeekStart.setHours(0, 0, 0, 0)
    const prevWeekStart = new Date(thisWeekStart.getTime() - weekMs)
    const prevWeekEnd = new Date(thisWeekStart.getTime() - 1)

    const countActivitiesInRange = (from: Date, to: Date) => {
      const fromMs = from.getTime()
      const toMs = to.getTime()
      let count = 0
      for (const e of diaryEntries) {
        const d = new Date(e.date).getTime()
        if (d >= fromMs && d <= toMs) count++
      }
      for (const w of workouts) {
        const d = new Date(w.date).getTime()
        if (d >= fromMs && d <= toMs) count++
      }
      for (const t of transactionsData) {
        const d = new Date(t.date).getTime()
        if (d >= fromMs && d <= toMs) count++
      }
      return count
    }

    const thisWeekScore = countActivitiesInRange(thisWeekStart, today)
    const prevWeekScore = countActivitiesInRange(prevWeekStart, prevWeekEnd)
    let scoreTrend: 'up' | 'down' | 'neutral' = 'neutral'
    let scoreTrendLabel = ''
    if (prevWeekScore > 0) {
      const pctChange = Math.round(((thisWeekScore - prevWeekScore) / prevWeekScore) * 100)
      if (pctChange > 0) {
        scoreTrend = 'up'
        scoreTrendLabel = `+${pctChange}%`
      } else if (pctChange < 0) {
        scoreTrend = 'down'
        scoreTrendLabel = `${pctChange}%`
      } else {
        scoreTrend = 'neutral'
        scoreTrendLabel = '0%'
      }
    } else {
      scoreTrendLabel = '—'
    }

    // ── 4. Top Category ─────────────────────────────────────────
    const thisWeekMs1 = thisWeekStart.getTime()
    const todayMs = today.getTime()
    const weekDiary = diaryEntries.filter((e) => {
      const d = new Date(e.date).getTime()
      return d >= thisWeekMs1 && d <= todayMs
    }).length
    const weekWorkouts = workouts.filter((w) => {
      const d = new Date(w.date).getTime()
      return d >= thisWeekMs1 && d <= todayMs
    }).length
    const weekTransactions = transactionsData.filter((t) => {
      const d = new Date(t.date).getTime()
      return d >= thisWeekMs1 && d <= todayMs
    }).length

    const categories = [
      { name: 'Дневник', count: weekDiary, icon: <BookOpen className="h-3.5 w-3.5" /> },
      { name: 'Тренировки', count: weekWorkouts, icon: <Dumbbell className="h-3.5 w-3.5" /> },
      { name: 'Финансы', count: weekTransactions, icon: <Wallet className="h-3.5 w-3.5" /> },
    ]
    categories.sort((a, b) => b.count - a.count)
    const topCategory = categories[0].count > 0 ? categories[0].name : 'Нет данных'
    const topCategoryIcon = categories[0].count > 0 ? categories[0].icon : null

    // ── 5. Completion Rate ───────────────────────────────────────
    const completionRate = dailyProgress
    const completionColor = completionRate >= 80 ? 'text-emerald-600 dark:text-emerald-400' : completionRate >= 40 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'
    const completionBg = completionRate >= 80 ? 'from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20' : completionRate >= 40 ? 'from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/20' : 'from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/20'
    const completionIconBg = completionRate >= 80 ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400' : completionRate >= 40 ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400' : 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400'

    // ── 6. Mood Trend ───────────────────────────────────────────
    const thisWeekMoods = recentMoods.filter((m) => m.mood !== null).slice(0, 7)
    const lastWeekMoods = recentMoods.slice(0, 7).filter((m) => m.mood !== null)
    // Use the most recent moods for this week
    const avgMood = thisWeekMoods.length > 0
      ? thisWeekMoods.reduce((sum, m) => sum + (m.mood ?? 0), 0) / thisWeekMoods.length
      : 0
    const moodEmoji = avgMood > 0 ? MOOD_EMOJI[Math.round(avgMood)] : '—'

    // Calculate trend by comparing recent vs older moods
    let moodTrend: 'up' | 'down' | 'neutral' = 'neutral'
    let moodTrendLabel = ''
    if (recentMoods.length >= 3) {
      const recentHalf = recentMoods.filter((m) => m.mood !== null).slice(0, 3)
      const olderHalf = recentMoods.filter((m) => m.mood !== null).slice(3, 6)
      if (recentHalf.length > 0 && olderHalf.length > 0) {
        const recentAvg = recentHalf.reduce((s, m) => s + (m.mood ?? 0), 0) / recentHalf.length
        const olderAvg = olderHalf.reduce((s, m) => s + (m.mood ?? 0), 0) / olderHalf.length
        const diff = recentAvg - olderAvg
        if (diff > 0.3) {
          moodTrend = 'up'
          moodTrendLabel = 'Растёт'
        } else if (diff < -0.3) {
          moodTrend = 'down'
          moodTrendLabel = 'Падает'
        } else {
          moodTrend = 'neutral'
          moodTrendLabel = 'Стабильно'
        }
      }
    }

    const moodTrendColor = moodTrend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : moodTrend === 'down' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'
    const moodTrendBg = moodTrend === 'up' ? 'from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20' : moodTrend === 'down' ? 'from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/20' : 'from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/20'
    const moodTrendIconBg = moodTrend === 'up' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400' : moodTrend === 'down' ? 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400'

    return [
      {
        icon: <Flame className="h-4 w-4" />,
        label: 'Серия активности',
        value: streakVal,
        subtitle: maxStreak >= 7 ? 'Отличная серия!' : maxStreak > 0 ? 'Продолжайте!' : 'Начните сегодня',
        colorClass: streakColor,
        bgClass: streakBg,
        iconBgClass: streakIconBg,
      },
      {
        icon: <CalendarCheck className="h-4 w-4" />,
        label: 'Самый активный день',
        value: mostActiveDay,
        subtitle: mostActiveCount > 0 ? `${mostActiveCount} действий` : '',
        colorClass: 'text-blue-600 dark:text-blue-400',
        bgClass: 'from-blue-50 to-sky-50 dark:from-blue-950/30 dark:to-sky-950/20',
        iconBgClass: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400',
      },
      {
        icon: <Zap className="h-4 w-4" />,
        label: 'Оценка недели',
        value: `${thisWeekScore} баллов`,
        subtitle: `против ${prevWeekScore} на прошлой`,
        trend: scoreTrend,
        trendLabel: scoreTrendLabel,
        colorClass: scoreTrend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : scoreTrend === 'down' ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground',
        bgClass: scoreTrend === 'up' ? 'from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20' : scoreTrend === 'down' ? 'from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/20' : 'from-muted/50 to-transparent',
        iconBgClass: scoreTrend === 'up' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400' : scoreTrend === 'down' ? 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400' : 'bg-muted text-muted-foreground',
      },
      {
        icon: topCategoryIcon || <Trophy className="h-4 w-4" />,
        label: 'Топ категория',
        value: topCategory,
        subtitle: topCategory !== 'Нет данных' ? 'за эту неделю' : '',
        colorClass: 'text-violet-600 dark:text-violet-400',
        bgClass: 'from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/20',
        iconBgClass: 'bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-400',
      },
      {
        icon: <Target className="h-4 w-4" />,
        label: 'Прогресс дня',
        value: `${completionRate}%`,
        subtitle: completionRate >= 80 ? 'Отличный результат!' : completionRate >= 40 ? 'Хороший темп' : 'Есть над чем работать',
        colorClass: completionColor,
        bgClass: completionBg,
        iconBgClass: completionIconBg,
      },
      {
        icon: <SmilePlus className="h-4 w-4" />,
        label: 'Тренд настроения',
        value: moodEmoji,
        subtitle: moodTrendLabel || 'Недостаточно данных',
        trend: moodTrend,
        colorClass: moodTrendColor,
        bgClass: moodTrendBg,
        iconBgClass: moodTrendIconBg,
      },
    ]
  }, [loading, diaryEntries, workouts, transactionsData, recentMoods, maxStreak, dailyProgress])

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <Card className="rounded-xl border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="h-4 w-4 text-teal-500" />
          Инсайты недели
        </CardTitle>
        <div className="mt-1 h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[100px] rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="stagger-children grid grid-cols-2 gap-3 lg:grid-cols-3">
            {insights.map((insight) => (
              <div
                key={insight.label}
                className={`card-hover flex flex-col gap-2 rounded-xl bg-gradient-to-br ${insight.bgClass} p-3.5 transition-all duration-200`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    {insight.label}
                  </span>
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${insight.iconBgClass}`}>
                    {insight.icon}
                  </div>
                </div>
                <div className="flex items-end gap-1.5">
                  <span className={`text-lg font-bold tabular-nums ${insight.colorClass}`}>
                    {insight.value}
                  </span>
                  {insight.trend && insight.trendLabel && (
                    <span className={`flex items-center gap-0.5 text-xs font-medium ${
                      insight.trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' :
                      insight.trend === 'down' ? 'text-red-600 dark:text-red-400' :
                      'text-muted-foreground'
                    }`}>
                      {insight.trend === 'up' && <TrendingUp className="h-3 w-3" />}
                      {insight.trend === 'down' && <TrendingDown className="h-3 w-3" />}
                      {insight.trend === 'neutral' && <Minus className="h-3 w-3" />}
                      {insight.trendLabel}
                    </span>
                  )}
                </div>
                {insight.subtitle && (
                  <span className="text-[11px] text-muted-foreground leading-snug">
                    {insight.subtitle}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
})
