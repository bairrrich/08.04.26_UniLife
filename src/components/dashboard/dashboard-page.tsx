'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useAppStore } from '@/store/use-app-store'
import { AppModule } from '@/store/use-app-store'
import {
  BookOpen,
  Dumbbell,
  Target,
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

// ─── Lazy-loaded Widgets (bundled into 5 barrel chunks) ─────────────────
// Bundle: widgets-display (5 small display widgets → 1 chunk)
const DailyProgress = dynamic(() => import('./widgets-display').then(m => ({ default: m.DailyProgress })), { ssr: false, loading: () => <div className="h-[200px] rounded-xl bg-muted/30 animate-pulse" /> })
const MotivationalQuote = dynamic(() => import('./widgets-display').then(m => ({ default: m.MotivationalQuote })), { ssr: false, loading: () => <div className="h-[200px] rounded-xl bg-muted/30 animate-pulse" /> })
const MoodDots = dynamic(() => import('./widgets-display').then(m => ({ default: m.MoodDots })), { ssr: false, loading: () => <div className="h-[200px] rounded-xl bg-muted/30 animate-pulse" /> })
const StreakWidget = dynamic(() => import('./widgets-display').then(m => ({ default: m.StreakWidget })), { ssr: false, loading: () => <div className="h-[200px] rounded-xl bg-muted/30 animate-pulse" /> })
const QuickActions = dynamic(() => import('./widgets-display').then(m => ({ default: m.QuickActions })), { ssr: false, loading: () => <div className="h-[200px] rounded-xl bg-muted/30 animate-pulse" /> })

// Bundle: widgets-activity (4 activity/transaction widgets → 1 chunk)
const ActivityFeed = dynamic(() => import('./widgets-activity').then(m => ({ default: m.ActivityFeed })), { ssr: false, loading: () => <div className="h-[200px] rounded-xl bg-muted/30 animate-pulse" /> })
const RecentTransactions = dynamic(() => import('./widgets-activity').then(m => ({ default: m.RecentTransactions })), { ssr: false, loading: () => <div className="h-[200px] rounded-xl bg-muted/30 animate-pulse" /> })
const ActivityHeatmap = dynamic(() => import('./widgets-activity').then(m => ({ default: m.ActivityHeatmap })), { ssr: false, loading: () => <div className="h-[200px] rounded-xl bg-muted/30 animate-pulse" /> })
const WeeklyInsights = dynamic(() => import('./widgets-activity').then(m => ({ default: m.WeeklyInsights })), { ssr: false, loading: () => <div className="h-[200px] rounded-xl bg-muted/30 animate-pulse" /> })

// Bundle: widgets-charts (5 chart widgets → 1 chunk)
const MoodBarChart = dynamic(() => import('./widgets-charts').then(m => ({ default: m.MoodBarChart })), { ssr: false, loading: () => <div className="h-[200px] rounded-xl bg-muted/30 animate-pulse" /> })
const ExpensePieChart = dynamic(() => import('./widgets-charts').then(m => ({ default: m.ExpensePieChart })), { ssr: false, loading: () => <div className="h-[200px] rounded-xl bg-muted/30 animate-pulse" /> })
const SpendingTrendChart = dynamic(() => import('./widgets-charts').then(m => ({ default: m.SpendingTrendChart })), { ssr: false, loading: () => <div className="h-[200px] rounded-xl bg-muted/30 animate-pulse" /> })
const WeeklyMoodChart = dynamic(() => import('./widgets-charts').then(m => ({ default: m.WeeklyMoodChart })), { ssr: false, loading: () => <div className="h-[200px] rounded-xl bg-muted/30 animate-pulse" /> })
const WeeklyActivityChart = dynamic(() => import('./widgets-charts').then(m => ({ default: m.WeeklyActivityChart })), { ssr: false, loading: () => <div className="h-[200px] rounded-xl bg-muted/30 animate-pulse" /> })

// Bundle: widgets-stats (5 stats/info widgets → 1 chunk)
const StatCards = dynamic(() => import('./widgets-stats').then(m => ({ default: m.StatCards })), { ssr: false, loading: () => <div className="h-[200px] rounded-xl bg-muted/30 animate-pulse" /> })
const HabitsProgress = dynamic(() => import('./widgets-stats').then(m => ({ default: m.HabitsProgress })), { ssr: false, loading: () => <div className="h-[200px] rounded-xl bg-muted/30 animate-pulse" /> })
const WeeklySummary = dynamic(() => import('./widgets-stats').then(m => ({ default: m.WeeklySummary })), { ssr: false, loading: () => <div className="h-[200px] rounded-xl bg-muted/30 animate-pulse" /> })
const MoodStreak = dynamic(() => import('./widgets-stats').then(m => ({ default: m.MoodStreak })), { ssr: false, loading: () => <div className="h-[200px] rounded-xl bg-muted/30 animate-pulse" /> })
const ProductivityScore = dynamic(() => import('./widgets-stats').then(m => ({ default: m.ProductivityScore })), { ssr: false, loading: () => <div className="h-[200px] rounded-xl bg-muted/30 animate-pulse" /> })

// Bundle: widgets-panels (3 complex panel widgets → 1 chunk)
const DailyChecklist = dynamic(() => import('./widgets-panels').then(m => ({ default: m.DailyChecklist })), { ssr: false, loading: () => <div className="h-[200px] rounded-xl bg-muted/30 animate-pulse" /> })
const BudgetOverview = dynamic(() => import('./widgets-panels').then(m => ({ default: m.BudgetOverview })), { ssr: false, loading: () => <div className="h-[200px] rounded-xl bg-muted/30 animate-pulse" /> })
const NotificationCenter = dynamic(() => import('./widgets-panels').then(m => ({ default: m.NotificationCenter })), { ssr: false, loading: () => <div className="h-[200px] rounded-xl bg-muted/30 animate-pulse" /> })

// Individual heavy widgets (each → own chunk)
const QuickNotes = dynamic(() => import('./quick-notes').then(m => ({ default: m.QuickNotes })), { ssr: false, loading: () => <div className="h-[200px] rounded-xl bg-muted/30 animate-pulse" /> })
const WeatherWidget = dynamic(() => import('./weather-widget').then(m => ({ default: m.WeatherWidget })), { ssr: false, loading: () => <div className="h-[200px] rounded-xl bg-muted/30 animate-pulse" /> })
const FocusTimerWidget = dynamic(() => import('./focus-timer-widget').then(m => ({ default: m.FocusTimerWidget })), { ssr: false, loading: () => <div className="h-[200px] rounded-xl bg-muted/30 animate-pulse" /> })
const AchievementsWidget = dynamic(() => import('./achievements/achievements-widget').then(m => ({ default: m.AchievementsWidget })), { ssr: false, loading: () => <div className="h-[200px] rounded-xl bg-muted/30 animate-pulse" /> })
const QuickAddMenu = dynamic(() => import('./quick-add-menu').then(m => ({ default: m.QuickAddMenu })), { ssr: false, loading: () => <div className="h-[200px] rounded-xl bg-muted/30 animate-pulse" /> })
const FinanceQuickView = dynamic(() => import('./finance-quick-view').then(m => ({ default: m.FinanceQuickView })), { ssr: false, loading: () => <div className="h-[200px] rounded-xl bg-muted/30 animate-pulse" /> })


// AnimatedNumber is now used inside leaf components to isolate animation state

// ─── Component ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const setActiveModule = useAppStore((s) => s.setActiveModule)

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

  // Productivity score animation is inside ProductivityScore component

  // ── Time Ago Helper ───────────────────────────────────────────
  const getTimeAgo = useCallback((dateStr: string): string => {
    return getRelativeTime(dateStr)
  }, [])

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <div className="animate-slide-up space-y-8">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-20 -top-16 h-64 w-64 rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 top-8 h-40 w-40 rounded-full bg-gradient-to-br from-amber-400/15 to-orange-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {getGreeting()}, Алексей! 👋
            </h1>
            <p className="mt-1 text-sm capitalize text-muted-foreground">
              {formatDate(now)}
            </p>
          </div>
          {!loading && (
            <p className="text-sm text-muted-foreground">
              Настроение: {todayMood ? moodEmojis[todayMood] : ' ещё не отмечено'} ·{' '}
              {weekEntryCount} записей на этой неделе
            </p>
          )}
        </div>

        {/* Daily Progress Bar */}
        {!loading && <DailyProgress progress={dailyProgress} />}
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

      {/* ── Quick Actions ──────────────────────────────────────────────── */}
      <QuickActions onNavigate={setActiveModule} />

      {/* ── Weekly Activity Chart ─────────────────────────────────── */}
      <WeeklyActivityChart loading={loading} data={weeklyActivity} />

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

      {/* ── Quick Notes, Weather & Focus Timer ────────────────── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <QuickNotes />
        <WeatherWidget />
        <FocusTimerWidget />
      </div>

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

      {/* ── Quick Add Menu (Floating FAB) ────────────────────────── */}
      <QuickAddMenu />
    </div>
  )
}
