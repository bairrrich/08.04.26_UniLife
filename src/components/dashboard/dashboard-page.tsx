'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useAppStore } from '@/store/use-app-store'
import { AppModule } from '@/store/use-app-store'
import {
  BookOpen,
  Dumbbell,
  Target,
  Clock,
} from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import {
  toDateStr,
  getTodayStr,
  getCurrentMonthStr,
  getWeekRange,
  getGreeting,
  getDayOfYear,
  calculateStreak,
  getRelativeTime,
  MOOD_EMOJI,
} from '@/lib/format'
import { useUserPrefs } from '@/lib/use-user-prefs'

import type {
  DiaryEntry,
  FinanceStats,
  NutritionStats,
  Workout,
  FeedPost,
  Transaction,
  HabitItem,
  BudgetData,
} from './types'
import {
  moodEmojis,
  moodLabels,
  dayNamesShort,
  MOTIVATIONAL_QUOTES,
  PIE_COLORS,
  formatDate,
} from './constants'

const widgetLoad = () => <div className="h-[200px] rounded-xl bg-muted/30 animate-pulse" />
const smallLoad = () => <div className="h-[100px] rounded-xl bg-muted/30 animate-pulse" />

// ─── Lazy-loaded Widgets ──────────────────────────────────────────────
const DailyProgress = dynamic(() => import('./daily-progress'), { ssr: false, loading: widgetLoad })
const MotivationalQuote = dynamic(() => import('./motivational-quote'), { ssr: false, loading: widgetLoad })
const MoodDots = dynamic(() => import('./mood-dots'), { ssr: false, loading: widgetLoad })
const StreakWidget = dynamic(() => import('./streak-widget'), { ssr: false, loading: widgetLoad })
const QuickActions = dynamic(() => import('./quick-actions'), { ssr: false, loading: widgetLoad })

const ActivityFeed = dynamic(() => import('./activity-feed'), { ssr: false, loading: widgetLoad })
const RecentTransactions = dynamic(() => import('./recent-transactions'), { ssr: false, loading: widgetLoad })
const ActivityHeatmap = dynamic(() => import('./activity-heatmap'), { ssr: false, loading: widgetLoad })
const WeeklyInsights = dynamic(() => import('./weekly-insights'), { ssr: false, loading: widgetLoad })

const MoodBarChart = dynamic(() => import('./mood-bar-chart'), { ssr: false, loading: widgetLoad })
const ExpensePieChart = dynamic(() => import('./expense-pie-chart'), { ssr: false, loading: widgetLoad })
const SpendingTrendChart = dynamic(() => import('./spending-trend-chart'), { ssr: false, loading: widgetLoad })
const WeeklyMoodChart = dynamic(() => import('./weekly-mood-chart'), { ssr: false, loading: widgetLoad })
const WeeklyActivityChart = dynamic(() => import('./weekly-activity-chart'), { ssr: false, loading: widgetLoad })

const StatCards = dynamic(() => import('./stat-cards'), { ssr: false, loading: widgetLoad })
const HabitsProgress = dynamic(() => import('./habits-progress'), { ssr: false, loading: widgetLoad })
const WeeklySummary = dynamic(() => import('./weekly-summary'), { ssr: false, loading: widgetLoad })
const MoodStreak = dynamic(() => import('./mood-streak'), { ssr: false, loading: widgetLoad })
const ProductivityScore = dynamic(() => import('./productivity-score'), { ssr: false, loading: widgetLoad })

const DailyChecklist = dynamic(() => import('./daily-checklist'), { ssr: false, loading: widgetLoad })
const BudgetOverview = dynamic(() => import('./budget-overview'), { ssr: false, loading: widgetLoad })
const NotificationCenter = dynamic(() => import('./notification-center'), { ssr: false, loading: widgetLoad })

const QuickNotes = dynamic(() => import('./quick-notes'), { ssr: false, loading: widgetLoad })
const WeatherWidget = dynamic(() => import('./weather-widget'), { ssr: false, loading: widgetLoad })
const FocusTimerWidget = dynamic(() => import('./focus-timer-widget'), { ssr: false, loading: widgetLoad })
const AchievementsWidget = dynamic(() => import('./achievements/achievements-widget'), { ssr: false, loading: widgetLoad })
const RecentGoals = dynamic(() => import('./recent-goals-widget'), { ssr: false, loading: widgetLoad })
const RecentDiary = dynamic(() => import('./recent-diary-widget'), { ssr: false, loading: widgetLoad })
const FinanceQuickView = dynamic(() => import('./finance-quick-view'), { ssr: false, loading: widgetLoad })
const DailyTip = dynamic(() => import('./daily-tip'), { ssr: false, loading: smallLoad })
const DailyGoalsBanner = dynamic(() => import('./daily-goals-banner'), { ssr: false, loading: smallLoad })
const WelcomeWidget = dynamic(() => import('./welcome-widget'), { ssr: false, loading: widgetLoad })
const QuickNotesWidget = dynamic(() => import('./quick-notes-widget'), { ssr: false, loading: widgetLoad })
const DailyProgressWidget = dynamic(() => import('./daily-progress-widget'), { ssr: false, loading: widgetLoad })
const MoodWeatherIndicator = dynamic(() => import('./mood-weather-indicator'), { ssr: false, loading: () => <div className="h-[56px] w-[280px] skeleton-shimmer rounded-xl" /> })
const NutritionSummaryWidget = dynamic(() => import('./nutrition-summary-widget'), { ssr: false, loading: widgetLoad })
const CurrentStreaks = dynamic(() => import('./current-streaks'), { ssr: false, loading: widgetLoad })
const WeeklyScore = dynamic(() => import('./weekly-score'), { ssr: false, loading: widgetLoad })
const MiniCalendar = dynamic(() => import('./mini-calendar'), { ssr: false, loading: widgetLoad })
const QuickMoodWidget = dynamic(() => import('./quick-mood-widget'), { ssr: false, loading: smallLoad })
const BreathingWidget = dynamic(() => import('./breathing-widget'), { ssr: false, loading: widgetLoad })
const AiInsightsWidget = dynamic(() => import('./ai-insights-widget'), { ssr: false, loading: widgetLoad })
const ProductivityBreakdown = dynamic(() => import('./productivity-breakdown'), { ssr: false, loading: widgetLoad })
const DailyInspiration = dynamic(() => import('./daily-inspiration'), { ssr: false, loading: widgetLoad })


// AnimatedNumber is now used inside leaf components to isolate animation state

// ─── Component ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const setActiveModule = useAppStore((s) => s.setActiveModule)
  const { userName } = useUserPrefs()

  // ── Hydration guard — timezone-dependent rendering causes mismatch ────
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  // ── State ───────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true)
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([])
  const [financeStats, setFinanceStats] = useState<FinanceStats | null>(null)
  const [nutritionStats, setNutritionStats] = useState<NutritionStats | null>(null)
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([])
  const [weeklyMoodData, setWeeklyMoodData] = useState<
    { day: string; mood: number; label: string }[]
  >([])
  const [weeklySpendingData, setWeeklySpendingData] = useState<
    { day: string; spending: number }[]
  >([])
  const [habitsData, setHabitsData] = useState<{
    data: HabitItem[]
    stats: { totalActive: number; completedToday: number; bestStreak: number }
  } | null>(null)
  const [transactionsData, setTransactionsData] = useState<Transaction[]>([])
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null)
  const [hasMealsToday, setHasMealsToday] = useState(false)
  const [waterTodayMl, setWaterTodayMl] = useState(0)

  const [quoteIndex, setQuoteIndex] = useState(() => getDayOfYear() % MOTIVATIONAL_QUOTES.length)
  const [quoteRefreshing, setQuoteRefreshing] = useState(false)

  // ── Data Fetching ────────────────────────────────────────────────────
  const fetchAllData = useCallback(async () => {
    setLoading(true)
    const currentMonth = getCurrentMonthStr()
    const today = getTodayStr()
    const { from, to } = getWeekRange()

    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 15000)

      const res = await fetch(
        `/api/dashboard?month=${currentMonth}&today=${today}&weekFrom=${encodeURIComponent(from)}&weekTo=${encodeURIComponent(to)}`,
        { signal: controller.signal }
      )
      clearTimeout(timer)

      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const text = await res.text()
      if (text.trimStart().startsWith('<')) throw new Error('Received HTML instead of JSON')
      const json = JSON.parse(text)

      if (!json.success || !json.data) throw new Error('Invalid response')

      const data = json.data

      setDiaryEntries(data.diaryMonth || [])

      const weekEntries = (data.diaryWeek || []) as DiaryEntry[]
      const moodByDay = new Map<string, number>()
      for (const entry of weekEntries) {
        if (entry.mood) {
          const d = new Date(entry.date)
          const dayIndex = d.getDay() === 0 ? 6 : d.getDay() - 1
          const dayName = dayNamesShort[dayIndex]
          moodByDay.set(dayName, entry.mood)
        }
      }
      setWeeklyMoodData(
        dayNamesShort.map((day) => ({
          day,
          mood: moodByDay.get(day) ?? 0,
          label: moodByDay.get(day)
            ? moodEmojis[moodByDay.get(day)!] + ' ' + moodLabels[moodByDay.get(day)!]
            : 'Нет данных',
        }))
      )

      setFinanceStats(data.financeStats || null)

      const txns = (data.transactions || []) as Transaction[]
      setTransactionsData(txns)

      const now = new Date()
      const dailySpending = new Map<string, number>()
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now)
        d.setDate(now.getDate() - i)
        d.setHours(0, 0, 0, 0)
        const dateStr = d.toISOString().split('T')[0]
        dailySpending.set(dateStr, 0)
      }
      for (const t of txns) {
        if (t.type === 'EXPENSE') {
          const tDate = new Date(t.date)
          const dateStr = tDate.toISOString().split('T')[0]
          if (dailySpending.has(dateStr)) {
            dailySpending.set(dateStr, (dailySpending.get(dateStr) ?? 0) + t.amount)
          }
        }
      }
      const spendingData: { day: string; spending: number }[] = []
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now)
        d.setDate(now.getDate() - i)
        d.setHours(0, 0, 0, 0)
        const dateStr = d.toISOString().split('T')[0]
        const dayIndex = d.getDay() === 0 ? 6 : d.getDay() - 1
        spendingData.push({
          day: dayNamesShort[dayIndex],
          spending: dailySpending.get(dateStr) ?? 0,
        })
      }
      setWeeklySpendingData(spendingData)

      setNutritionStats(data.nutritionStats || null)
      setHasMealsToday(data.mealsToday || false)
      setWorkouts(data.workouts || [])
      setFeedPosts(data.feedPosts || [])
      setHabitsData({
        data: data.habits || [],
        stats: data.habitsStats || { totalActive: 0, completedToday: 0, bestStreak: 0 },
      })
      setBudgetData(data.budgetData || null)
      setWaterTodayMl(data.waterTodayMl || 0)
    } catch (err) {
      console.error('Dashboard fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

  // ── Derived Data ───────────────────────────────────────────────────────
  const now = useMemo(() => new Date(), [])

  // ── Current time (updates every minute) ────────────────────────────────
  const [currentTime, setCurrentTime] = useState('')
  useEffect(() => {
    const updateTime = () => {
      const n = new Date()
      setCurrentTime(
        `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`
      )
    }
    updateTime()
    const interval = setInterval(updateTime, 30000)
    return () => clearInterval(interval)
  }, [])

  // ── Most recent diary mood emoji ──────────────────────────────────────
  const recentMoodEmoji = useMemo(() => {
    if (diaryEntries.length === 0) return null
    const sorted = [...diaryEntries].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    const latest = sorted.find((e) => e.mood)
    return latest?.mood ? MOOD_EMOJI[latest.mood] : null
  }, [diaryEntries])

  const todayEntry = diaryEntries.find((e) => {
    const d = new Date(e.date)
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    )
  })
  const todayMood = todayEntry?.mood ?? null

  const { from: weekFrom, to: weekTo } = getWeekRange()
  const weekEntryCount = diaryEntries.filter((e) => {
    const d = new Date(e.date).getTime()
    return d >= new Date(weekFrom).getTime() && d <= new Date(weekTo).getTime()
  }).length

  const weekWorkoutCount = workouts.filter((w) => {
    const d = new Date(w.date).getTime()
    return d >= new Date(weekFrom).getTime() && d <= new Date(weekTo).getTime()
  }).length

  const weekExpenseSum = transactionsData
    .filter((t) => {
      const d = new Date(t.date).getTime()
      return (
        t.type === 'EXPENSE' &&
        d >= new Date(weekFrom).getTime() &&
        d <= new Date(weekTo).getTime()
      )
    })
    .reduce((sum, t) => sum + t.amount, 0)

  const totalActive = habitsData?.stats.totalActive ?? 0
  const completedToday = habitsData?.stats.completedToday ?? 0
  const habitsPercentage = totalActive > 0 ? Math.round((completedToday / totalActive) * 100) : 0
  const uncompletedHabits = (habitsData?.data ?? []).filter((h) => !h.todayCompleted).slice(0, 3)
  const allHabitsCompleted = totalActive > 0 && completedToday === totalActive
  const circumference = 251.3
  const dashOffset = circumference * (1 - habitsPercentage / 100)

  // ── Sync notification count ────────────────────────────────────
  useEffect(() => {
    if (loading) return
    const hasMoodToday = !!todayMood
    const uncompletedHabitsCount = totalActive - completedToday
    const notificationCount = (hasMoodToday ? 0 : 1) + (hasMealsToday ? 0 : 1) + uncompletedHabitsCount
    useAppStore.getState().setNotificationCount(notificationCount)
  }, [loading, todayMood, hasMealsToday, totalActive, completedToday])

  const kcalGoal = 2200
  const todayKcal = nutritionStats?.totalKcal ?? 0

  // ── Heatmap Data ──────────────────────────────────────────────────
  const heatmapData = useMemo(() => {
    const activityMap = new Map<string, number>()
    const addCount = (dateStr: string) => {
      const d = new Date(dateStr)
      const key = toDateStr(d)
      activityMap.set(key, (activityMap.get(key) ?? 0) + 1)
    }
    for (const e of diaryEntries) addCount(e.date)
    for (const t of transactionsData) addCount(t.date)
    for (const w of workouts) addCount(w.date)
    if (completedToday > 0) {
      const todayKey = toDateStr(new Date())
      activityMap.set(todayKey, (activityMap.get(todayKey) ?? 0) + completedToday)
    }
    return Array.from(activityMap.entries()).map(([date, count]) => ({ date, count }))
  }, [diaryEntries, transactionsData, workouts, completedToday])

  // ── Streaks ──────────────────────────────────────────────────────────
  const diaryStreak = calculateStreak(diaryEntries.map((e) => e.date))
  const workoutStreak = calculateStreak(workouts.map((w) => w.date))
  const habitsStreak = habitsData?.stats.bestStreak ?? 0
  const maxStreak = Math.max(diaryStreak, workoutStreak, habitsStreak)

  const streakItems = [
    { icon: <BookOpen className="h-4 w-4 text-emerald-500" />, name: 'Дневник', streak: diaryStreak },
    { icon: <Dumbbell className="h-4 w-4 text-blue-500" />, name: 'Тренировки', streak: workoutStreak },
    { icon: <Target className="h-4 w-4 text-violet-500" />, name: 'Привычки', streak: habitsStreak },
  ]

  // ── Recent Moods (last 7 days) ─────────────────────────────────
  const recentMoods = useMemo(() => {
    const moodMap = new Map<string, number | null>()
    for (const entry of diaryEntries) {
      const key = toDateStr(new Date(entry.date))
      if (!moodMap.has(key)) {
        moodMap.set(key, entry.mood)
      }
    }
    const result: { date: string; mood: number | null }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      const key = toDateStr(d)
      result.push({ date: key, mood: moodMap.get(key) ?? null })
    }
    return result
  }, [diaryEntries, now])

  // ── No animated counters here — animation is handled inside leaf
  //    components via <AnimatedNumber> to isolate re-renders ────

  // ── Quote Handlers ───────────────────────────────────────────────
  const handleRefreshQuote = () => {
    setQuoteRefreshing(true)
    const newIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)
    setQuoteIndex(newIndex)
    setTimeout(() => setQuoteRefreshing(false), 400)
  }

  // ── Expense Pie Data ────────────────────────────────────────────
  const expensePieData =
    financeStats?.byCategory.map((cat, i) => ({
      name: cat.categoryName,
      value: cat.total,
      fill: PIE_COLORS[i % PIE_COLORS.length],
    })) ?? []

  // ── Recent Transactions ──────────────────────────────────────────
  const recentTransactions = useMemo(() => {
    return [...transactionsData]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
  }, [transactionsData])

  // ── Daily Progress ────────────────────────────────────────────
  const dailyProgress = useMemo(() => {
    if (loading) return 0
    let pct = 0
    if (todayMood) pct += 20
    if (hasMealsToday) pct += 30
    const todayWorkout = workouts.some((w) => {
      const d = new Date(w.date)
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
      )
    })
    if (todayWorkout) pct += 30
    if (totalActive > 0 && completedToday === totalActive) pct += 20
    return pct
  }, [loading, todayMood, hasMealsToday, workouts, now, totalActive, completedToday])

  // ── Weekly Activity Chart Data (pure computed, no side effects) ─────
  const weeklyActivity = useMemo(() => {
    if (loading) return []
    const todayKey = toDateStr(now)
    const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

    const diaryByDay = new Map<string, number>()
    for (const e of diaryEntries) {
      const key = toDateStr(new Date(e.date))
      diaryByDay.set(key, (diaryByDay.get(key) ?? 0) + 1)
    }

    const workoutByDay = new Map<string, number>()
    for (const w of workouts) {
      const key = toDateStr(new Date(w.date))
      workoutByDay.set(key, (workoutByDay.get(key) ?? 0) + 1)
    }

    const habitsByDay = new Map<string, number>()
    for (const h of habitsData?.data ?? []) {
      for (const [dateStr] of Object.entries(h.last7Days || {})) {
        habitsByDay.set(dateStr, (habitsByDay.get(dateStr) ?? 0) + 1)
      }
    }

    const result: typeof weeklyActivity = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      const key = toDateStr(d)
      const dayIndex = d.getDay() === 0 ? 6 : d.getDay() - 1
      result.push({
        dayName: dayNames[dayIndex],
        dateKey: key,
        diary: diaryByDay.get(key) ?? 0,
        workouts: workoutByDay.get(key) ?? 0,
        habits: habitsByDay.get(key) ?? 0,
        isToday: key === todayKey,
      })
    }
    return result
  }, [loading, diaryEntries, workouts, habitsData, now])

  // ── Productivity Score ──────────────────────────────────────────
  const todayWorkout = useMemo(() => {
    return workouts.some((w) => {
      const d = new Date(w.date)
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
      )
    })
  }, [workouts, now])

  const productivityScore = useMemo(() => {
    if (loading) return 0
    let score = 0
    if (todayEntry) score += 25
    if (waterTodayMl >= 1000) score += 20
    if (todayWorkout) score += 25
    if (totalActive > 0) score += Math.round((completedToday / totalActive) * 15)
    if (hasMealsToday) score += 15
    return score
  }, [loading, todayEntry, waterTodayMl, todayWorkout, totalActive, completedToday, hasMealsToday])

  // ── Productivity Breakdown Data ──────────────────────────────────
  const productivityBreakdownData = useMemo((): Array<{
    label: string
    emoji: string
    completed: number
    total: number
    color: string
    percentage: number
  }> => {
    if (loading) return []
    return [
      {
        label: 'Дневник',
        emoji: '📋',
        completed: !!todayMood ? 1 : 0,
        total: 1,
        color: 'emerald',
        percentage: !!todayMood ? 100 : 0,
      },
      {
        label: 'Тренировки',
        emoji: '💪',
        completed: todayWorkout ? 1 : 0,
        total: 1,
        color: 'blue',
        percentage: todayWorkout ? 100 : 0,
      },
      {
        label: 'Привычки',
        emoji: '✅',
        completed: completedToday,
        total: totalActive || 1,
        color: 'violet',
        percentage: totalActive > 0 ? Math.round((completedToday / totalActive) * 100) : 0,
      },
      {
        label: 'Питание',
        emoji: '🥗',
        completed: hasMealsToday ? 1 : 0,
        total: 1,
        color: 'orange',
        percentage: hasMealsToday ? 100 : 0,
      },
    ]
  }, [loading, todayMood, todayWorkout, completedToday, totalActive, hasMealsToday])

  // Productivity score animation is inside ProductivityScore component

  // ── Time Ago Helper ───────────────────────────────────────────
  const getTimeAgo = useCallback((dateStr: string): string => {
    return getRelativeTime(dateStr)
  }, [])

  // ── Render ─────────────────────────────────────────────────────────

  // Show skeleton during SSR to avoid hydration mismatch from timezone-dependent content
  if (!mounted) {
    return (
      <div className="animate-slide-up space-y-8">
        <div className="skeleton-shimmer h-[200px] rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer h-[130px] rounded-xl" />
          ))}
        </div>
        <div className="skeleton-shimmer h-[300px] rounded-xl" />
        <div className="skeleton-shimmer h-[200px] rounded-xl" />
      </div>
    )
  }

  return (
    <div className="animate-slide-up space-y-8">
      {/* ── Welcome Widget (first, hero-style) ──────────────────────── */}
      <WelcomeWidget
        loading={loading}
        diaryStreak={diaryStreak}
        dailyProgress={dailyProgress}
        todayMood={todayMood}
        hasMealsToday={hasMealsToday}
        todayWorkoutDone={todayWorkout}
        habitsCompletedToday={completedToday}
        habitsTotal={totalActive}
      />

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-background via-muted/20 to-background p-5 sm:p-6">
        {/* Dot pattern background */}
        <div className="pointer-events-none absolute inset-0 dot-pattern opacity-30" />
        <div className="pointer-events-none absolute -right-20 -top-16 h-64 w-64 rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 top-8 h-40 w-40 rounded-full bg-gradient-to-br from-amber-400/15 to-orange-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {getGreeting()}, <span className="text-gradient-emerald">{userName}</span>! 👋
            </h1>
            <div className="mt-1 flex items-center gap-2">
              <p className="text-sm capitalize text-muted-foreground">
                {formatDate(now)}
              </p>
              {/* Current time badge */}
              <span className="inline-flex items-center gap-1 rounded-full border border-border/50 bg-muted/50 px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
                <Clock className="h-3 w-3" />
                {currentTime}
              </span>
              {/* Mood emoji from most recent diary entry */}
              {recentMoodEmoji && (
                <span className="inline-flex items-center text-sm" title="Настроение из последней записи">
                  {recentMoodEmoji}
                </span>
              )}
              {!recentMoodEmoji && !loading && (
                <span className="inline-flex items-center text-sm opacity-50" title="Нет записей о настроении">
                  😐
                </span>
              )}
            </div>
          </div>
          {/* Weather-like Mood Indicator */}
          {!loading && (
            <MoodWeatherIndicator
              todayMood={todayMood}
              recentMoods={recentMoods}
              weekEntryCount={weekEntryCount}
            />
          )}
        </div>

        {/* Daily Progress Bar */}
        {!loading && <DailyProgress progress={dailyProgress} />}
      </div>

      {/* ── Daily Tip ────────────────────────────────────────── */}
      <DailyTip />

      {/* ── Daily Goals Banner ────────────────────────────────── */}
      <DailyGoalsBanner />

      {/* ── Quick Notes & Daily Progress Widgets ────────────────── */}
      <div className="grid gap-4 md:grid-cols-2">
        <QuickNotesWidget />
        <DailyProgressWidget
          hasDiaryToday={!!todayMood}
          hasMealsToday={hasMealsToday}
          hasWorkoutToday={todayWorkout}
          habitsCompleted={completedToday}
          habitsTotal={totalActive}
          waterGlasses={Math.round(waterTodayMl / 250)}
          waterGoal={8}
        />
      </div>

      {/* ── Daily Checklist ─────────────────────────────────── */}
      <DailyChecklist
        loading={loading}
        hasDiaryToday={!!todayMood}
        hasMealsToday={hasMealsToday}
        workoutDone={todayWorkout}
        habitsCompleted={completedToday}
        habitsTotal={totalActive}
        waterMl={waterTodayMl}
        onNavigate={(module) => setActiveModule(module as AppModule)}
      />

      {/* ── Section: Your Day ────────────────────────────────────────── */}
      <div className="flex items-center gap-3 pt-2 pb-1">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Ваш день</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-muted-foreground/20 to-transparent" />
      </div>

      {/* ── Productivity Score ────────────────────────────────────── */}
      <ProductivityScore
        loading={loading}
        diaryWritten={!!todayEntry}
        waterMl={waterTodayMl}
        workoutDone={todayWorkout}
        habitsCompleted={completedToday}
        habitsTotal={totalActive}
        nutritionLogged={hasMealsToday}
        score={productivityScore}
      />

      {/* ── Stats Cards ─────────────────────────────────────────────── */}
      <StatCards
        loading={loading}
        todayMood={todayMood}
        weekEntries={weekEntryCount}
        totalIncome={financeStats?.totalIncome ?? 0}
        totalExpense={financeStats?.totalExpense ?? 0}
        todayKcal={todayKcal}
        workoutsCount={workouts.length}
        kcalGoal={kcalGoal}
      />

      {/* ── Quick Mood + Mini Calendar 2-column grid ─────────────── */}
      <div className="grid gap-4 md:grid-cols-2">
        <QuickMoodWidget />
        <MiniCalendar />
      </div>

      {/* ── Weekly Insights ──────────────────────────────────────────── */}
      <WeeklyInsights
        loading={loading}
        diaryEntries={diaryEntries}
        workouts={workouts}
        transactionsData={transactionsData}
        habitsData={habitsData}
        recentMoods={recentMoods}
        hasMealsToday={hasMealsToday}
        waterTodayMl={waterTodayMl}
        dailyProgress={dailyProgress}
        maxStreak={maxStreak}
      />

      {/* ── Section: Quick Access ────────────────────────────────────── */}
      <div className="flex items-center gap-3 pt-2 pb-1">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Быстрый доступ</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-muted-foreground/20 to-transparent" />
      </div>

      {/* ── Quick Actions ──────────────────────────────────────────────── */}
      <QuickActions onNavigate={setActiveModule} />

      {/* ── AI Insights ──────────────────────────────────────────── */}
      <AiInsightsWidget />

      {/* ── Productivity Breakdown ────────────────────────────────── */}
      <ProductivityBreakdown
        loading={loading}
        data={productivityBreakdownData.length > 0 ? productivityBreakdownData : null}
      />

      {/* ── Weekly Activity Chart ─────────────────────────────────── */}
      <WeeklyActivityChart loading={loading} data={weeklyActivity} />

      {/* ── Section: Finances ────────────────────────────────────────── */}
      <div className="flex items-center gap-3 pt-2 pb-1">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Финансы</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-muted-foreground/20 to-transparent" />
      </div>

      {/* ── Recent Transactions ───────────────────────────────────── */}
      <RecentTransactions
        loading={loading}
        transactions={recentTransactions}
        getRelativeTime={getTimeAgo}
        onNavigateToFinance={() => setActiveModule('finance')}
      />

      {/* ── Compact Mood Dots ────────────────────────────────────── */}
      <MoodDots recentMoods={recentMoods} diaryStreak={diaryStreak} now={now} />

      {/* ── Daily Motivational Quote ───────────────────────────────── */}
      <MotivationalQuote
        quoteIndex={quoteIndex}
        quoteRefreshing={quoteRefreshing}
        onRefresh={handleRefreshQuote}
      />

      {/* ── Daily Inspiration & Challenge Widget ──────────────────── */}
      <DailyInspiration />

      {/* ── Mood Streak ──────────────────────────────────────────────── */}
      <MoodStreak
        loading={loading}
        recentMoods={recentMoods}
        streak={diaryStreak}
        todayMood={todayMood}
      />

      {/* ── Weekly Mood Chart ─────────────────────────────────── */}
      <WeeklyMoodChart
        loading={loading}
        moodData={weeklyMoodData.map((d) => ({
          day: d.day,
          mood: d.mood > 0 ? d.mood : null,
          date: d.label,
        }))}
      />

      {/* ── Section: Health & Productivity ─────────────────────────── */}
      <div className="flex items-center gap-3 pt-2 pb-1">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Здоровье и продуктивность</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-muted-foreground/20 to-transparent" />
      </div>

      {/* ── Habits Progress ───────────────────────────────────────── */}
      <HabitsProgress
        loading={loading}
        totalActive={totalActive}
        completedToday={completedToday}
        habitsPercentage={habitsPercentage}
        circumference={circumference}
        dashOffset={dashOffset}
        uncompletedHabits={uncompletedHabits}
        allHabitsCompleted={allHabitsCompleted}
        onNavigate={setActiveModule}
      />

      {/* ── Activity Heatmap ──────────────────────────────────────── */}
      <ActivityHeatmap loading={loading} activityData={heatmapData} />

      {/* ── Budget Overview ─────────────────────────────────────── */}
      <BudgetOverview
        loading={loading}
        budgetData={budgetData}
        onNavigateToFinance={() => setActiveModule('finance')}
      />

      {/* ── Notification Center ──────────────────────────────────── */}
      <NotificationCenter
        loading={loading}
        hasDiaryToday={!!todayMood}
        hasMealsToday={hasMealsToday}
        uncompletedHabitsCount={totalActive - completedToday}
        onNavigate={(module) => setActiveModule(module as AppModule)}
      />

      {/* ── Section: Tracking ──────────────────────────────────────── */}
      <div className="flex items-center gap-3 pt-2 pb-1">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Отслеживание</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-muted-foreground/20 to-transparent" />
      </div>

      {/* ── Quick Notes, Weather & Focus Timer ────────────────── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <QuickNotes />
        <WeatherWidget />
        <FocusTimerWidget />
      </div>

      {/* ── Current Streaks & Weekly Score ────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <CurrentStreaks />
        <WeeklyScore />
      </div>

      {/* ── Nutrition Summary Widget ────────────────────────── */}
      <NutritionSummaryWidget />

      {/* ── Finance Quick View ────────────────────────────────── */}
      {!loading && financeStats && (
        <FinanceQuickView
          loading={loading}
          categories={
            [...financeStats.byCategory]
              .sort((a, b) => b.total - a.total)
              .slice(0, 5)
              .map((cat) => ({
                name: cat.categoryName,
                amount: cat.total,
                color: cat.categoryColor,
              }))
          }
          totalExpense={financeStats.totalExpense}
          totalIncome={financeStats.totalIncome}
        />
      )}

      {/* ── Charts Section ─────────────────────────────────────── */}
      <div className="space-y-4">
        <SpendingTrendChart loading={loading} weeklySpendingData={weeklySpendingData} />

        <div className="grid gap-4 md:grid-cols-2">
          <MoodBarChart loading={loading} weeklyMoodData={weeklyMoodData} />
          <ExpensePieChart loading={loading} expensePieData={expensePieData} />
        </div>
      </div>

      {/* ── Breathing Exercise Widget ────────────────────────────── */}
      <BreathingWidget />

      {/* ── Recent Activity Feed ───────────────────────────────── */}
      <ActivityFeed
        loading={loading}
        feedPosts={feedPosts}
        getTimeAgo={getTimeAgo}
        onNavigateToFeed={() => setActiveModule('feed')}
      />

      {/* ── Streak Tracking Widget ─────────────────────────────── */}
      <StreakWidget loading={loading} streakItems={streakItems} maxStreak={maxStreak} />

      {/* ── Achievements / Badges ──────────────────────────────── */}
      <AchievementsWidget
        loading={loading}
        diaryEntries={diaryEntries}
        financeStats={financeStats}
        transactionsData={transactionsData}
        workouts={workouts}
        habitsData={habitsData}
        nutritionStats={nutritionStats}
        waterTodayMl={waterTodayMl}
        hasMealsToday={hasMealsToday}
        todayMood={todayMood}
        todayWorkoutDone={todayWorkout}
        allHabitsCompleted={allHabitsCompleted}
        budgetData={budgetData}
      />

      {/* ── Weekly Summary ──────────────────────────────────────── */}
      <WeeklySummary
        loading={loading}
        weekEntryCount={weekEntryCount}
        weekWorkoutCount={weekWorkoutCount}
        weekExpenseSum={weekExpenseSum}
        completedToday={completedToday}
        totalActive={totalActive}
        todayKcal={todayKcal}
        maxStreak={maxStreak}
      />

      {/* ── Recent Goals & Diary Widgets ──────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2">
        <RecentGoals />
        <RecentDiary loading={loading} diaryEntries={diaryEntries} />
      </div>
    </div>
  )
}
