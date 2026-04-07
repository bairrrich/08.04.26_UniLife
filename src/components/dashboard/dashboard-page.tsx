'use client'

import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useAppStore } from '@/store/use-app-store'
import { AppModule } from '@/store/use-app-store'
import { LayoutDashboard, Settings2, CalendarDays, Flame, Target, Sparkles } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import {
  toDateStr,
  getTodayStr,
  getCurrentMonthStr,
  getWeekRange,
  calculateStreak,
  getRelativeTime,
} from '@/lib/format'

import DashboardSection from './dashboard-section'
import QuickInsightsCard from './quick-insights-card'

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
  PIE_COLORS,
} from './constants'

import {
  loadWidgetConfig,
  saveWidgetConfig,
  DEFAULT_SECTIONS,
  type SavedWidgetConfig,
} from './widget-config'
import WidgetCustomizer from './widget-customizer'

const widgetLoad = () => <div className="h-[200px] rounded-xl skeleton-shimmer" />
const smallLoad = () => <div className="h-[100px] rounded-xl skeleton-shimmer" />

// ─── Lazy-loaded Widgets ──────────────────────────────────────────────
const WelcomeWidget = dynamic(() => import('./welcome-widget'), { ssr: false, loading: widgetLoad })
const MotivationalBanner = dynamic(() => import('./motivational-banner'), { ssr: false, loading: smallLoad })

const ProductivityScore = dynamic(() => import('./productivity-score'), { ssr: false, loading: widgetLoad })
const StatCards = dynamic(() => import('./stat-cards'), { ssr: false, loading: widgetLoad })

const QuickMoodWidget = dynamic(() => import('./quick-mood-widget'), { ssr: false, loading: smallLoad })
const MiniCalendar = dynamic(() => import('./mini-calendar'), { ssr: false, loading: widgetLoad })

const DailyInspiration = dynamic(() => import('./daily-inspiration'), { ssr: false, loading: widgetLoad })
const QuickActions = dynamic(() => import('./quick-actions'), { ssr: false, loading: widgetLoad })
const AiInsightsWidget = dynamic(() => import('./ai-insights-widget'), { ssr: false, loading: widgetLoad })

const WeeklyInsights = dynamic(() => import('./weekly-insights'), { ssr: false, loading: widgetLoad })
const WeeklyActivityChart = dynamic(() => import('./weekly-activity-chart'), { ssr: false, loading: widgetLoad })
const SpendingTrendChart = dynamic(() => import('./spending-trend-chart'), { ssr: false, loading: widgetLoad })
const WeeklyMoodChart = dynamic(() => import('./weekly-mood-chart'), { ssr: false, loading: widgetLoad })
const ExpensePieChart = dynamic(() => import('./expense-pie-chart'), { ssr: false, loading: widgetLoad })

const RecentTransactions = dynamic(() => import('./recent-transactions'), { ssr: false, loading: widgetLoad })
const FinanceQuickView = dynamic(() => import('./finance-quick-view'), { ssr: false, loading: widgetLoad })
const BudgetOverview = dynamic(() => import('./budget-overview'), { ssr: false, loading: widgetLoad })

const HabitsProgress = dynamic(() => import('./habits-progress'), { ssr: false, loading: widgetLoad })
const ActivityHeatmap = dynamic(() => import('./activity-heatmap'), { ssr: false, loading: widgetLoad })
const CurrentStreaks = dynamic(() => import('./current-streaks'), { ssr: false, loading: widgetLoad })
const MoodDots = dynamic(() => import('./mood-dots'), { ssr: false, loading: widgetLoad })
const NutritionSummaryWidget = dynamic(() => import('./nutrition-summary-widget'), { ssr: false, loading: widgetLoad })

const QuickNotesWidget = dynamic(() => import('./quick-notes-widget'), { ssr: false, loading: widgetLoad })
const WeatherWidget = dynamic(() => import('./weather-widget'), { ssr: false, loading: widgetLoad })
const FocusTimerWidget = dynamic(() => import('./focus-timer-widget'), { ssr: false, loading: widgetLoad })
const BreathingWidget = dynamic(() => import('./breathing-widget'), { ssr: false, loading: widgetLoad })

const ActivityFeed = dynamic(() => import('./activity-feed'), { ssr: false, loading: widgetLoad })
const AchievementsWidget = dynamic(() => import('./achievements/achievements-widget'), { ssr: false, loading: widgetLoad })
const RecentGoals = dynamic(() => import('./recent-goals-widget'), { ssr: false, loading: widgetLoad })
const RecentDiary = dynamic(() => import('./recent-diary-widget'), { ssr: false, loading: widgetLoad })

const WeeklyChallengeWidget = dynamic(() => import('./weekly-challenge-widget'), { ssr: false, loading: widgetLoad })

const MoodRecommendations = dynamic(() => import('./mood-recommendations'), { ssr: false, loading: widgetLoad })
const DataStatsWidget = dynamic(() => import('./data-stats-widget'), { ssr: false, loading: widgetLoad })
const TipsCarousel = dynamic(() => import('./tips-carousel'), { ssr: false, loading: widgetLoad })
const DailyTipsWidget = dynamic(() => import('./daily-tips-widget'), { ssr: false, loading: widgetLoad })
const DailyChecklistWidget = dynamic(() => import('./daily-checklist-widget'), { ssr: false, loading: widgetLoad })

const NotificationCenter = dynamic(() => import('./notification-center'), { ssr: false, loading: widgetLoad })


// ─── Component ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const setActiveModule = useAppStore((s) => s.setActiveModule)

  // ── Widget Config ────────────────────────────────────────────────────
  const [widgetConfig, setWidgetConfig] = useState<SavedWidgetConfig | null>(null)
  const [customizerOpen, setCustomizerOpen] = useState(false)

  useEffect(() => {
    setWidgetConfig(loadWidgetConfig())
  }, [])

  const handleConfigChange = useCallback((newConfig: SavedWidgetConfig) => {
    setWidgetConfig(newConfig)
    saveWidgetConfig(newConfig)
  }, [])

  // ── State ────────────────────────────────────────────────────────────
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

  // ── Data Fetching with retry ─────────────────────────────────────────
  const MAX_RETRIES = 3
  const RETRY_DELAY = 2000

  const fetchAllData = useCallback(async (attempt = 0) => {
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

      if (!res.ok) {
        // Retry on 502/503/504 server errors
        if ((res.status === 502 || res.status === 503 || res.status === 504) && attempt < MAX_RETRIES) {
          console.warn(`Dashboard fetch got HTTP ${res.status}, retry ${attempt + 1}/${MAX_RETRIES} in ${RETRY_DELAY}ms...`)
          await new Promise((r) => setTimeout(r, RETRY_DELAY * (attempt + 1)))
          return fetchAllData(attempt + 1)
        }
        throw new Error(`HTTP ${res.status}`)
      }
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
      if (err instanceof DOMException && err.name === 'AbortError') {
        // Request was aborted (timeout or unmounted), retry
        if (attempt < MAX_RETRIES) {
          console.warn(`Dashboard fetch aborted, retry ${attempt + 1}/${MAX_RETRIES}...`)
          return fetchAllData(attempt + 1)
        }
      }
      console.error('Dashboard fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

  // ── Live clock (updates at midnight) ─────────────────────────────
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const msUntilMidnight = new Date().setHours(24, 0, 0, 0) - Date.now()
    const timer = setTimeout(() => setNow(new Date()), msUntilMidnight)
    return () => clearTimeout(timer)
  }, [now])

  // ── Derived Data (memoized) ────────────────────────────────────────────

  const { from: weekFrom, to: weekTo } = getWeekRange()

  const todayEntry = useMemo(() => diaryEntries.find((e) => {
    const d = new Date(e.date)
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    )
  }), [diaryEntries, now])
  const todayMood = todayEntry?.mood ?? null

  const weekEntryCount = useMemo(() => diaryEntries.filter((e) => {
    const d = new Date(e.date).getTime()
    return d >= new Date(weekFrom).getTime() && d <= new Date(weekTo).getTime()
  }).length, [diaryEntries, weekFrom, weekTo])

  const weekWorkoutCount = useMemo(() => workouts.filter((w) => {
    const d = new Date(w.date).getTime()
    return d >= new Date(weekFrom).getTime() && d <= new Date(weekTo).getTime()
  }).length, [workouts, weekFrom, weekTo])

  const weekExpenseSum = useMemo(() => transactionsData
    .filter((t) => {
      const d = new Date(t.date).getTime()
      return (
        t.type === 'EXPENSE' &&
        d >= new Date(weekFrom).getTime() &&
        d <= new Date(weekTo).getTime()
      )
    })
    .reduce((sum, t) => sum + t.amount, 0), [transactionsData, weekFrom, weekTo])

  const totalActive = habitsData?.stats.totalActive ?? 0
  const completedToday = habitsData?.stats.completedToday ?? 0
  const habitsPercentage = totalActive > 0 ? Math.round((completedToday / totalActive) * 100) : 0
  const uncompletedHabits = useMemo(() => (habitsData?.data ?? []).filter((h) => !h.todayCompleted).slice(0, 3), [habitsData?.data])
  const allHabitsCompleted = totalActive > 0 && completedToday === totalActive
  const circumference = 251.3
  const dashOffset = circumference * (1 - habitsPercentage / 100)

  // ── Sync notification count (useRef to avoid triggering re-renders) ──
  const prevNotificationCountRef = useRef<number | null>(null)
  useEffect(() => {
    if (loading) return
    const hasMoodToday = !!todayMood
    const uncompletedHabitsCount = totalActive - completedToday
    const notificationCount = (hasMoodToday ? 0 : 1) + (hasMealsToday ? 0 : 1) + uncompletedHabitsCount
    // Only update zustand if the count actually changed
    if (prevNotificationCountRef.current !== notificationCount) {
      prevNotificationCountRef.current = notificationCount
      useAppStore.getState().setNotificationCount(notificationCount)
    }
  }, [loading, todayMood, hasMealsToday, totalActive, completedToday])

  const kcalGoal = 2200
  const todayKcal = nutritionStats?.totalKcal ?? 0

  // ── Heatmap Data ────────────────────────────────────────────────────
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

  // ── Streaks ─────────────────────────────────────────────────────────
  const diaryStreak = useMemo(() => calculateStreak(diaryEntries.map((e) => e.date)), [diaryEntries])
  const workoutStreak = useMemo(() => calculateStreak(workouts.map((w) => w.date)), [workouts])
  const habitsStreak = habitsData?.stats.bestStreak ?? 0
  const maxStreak = Math.max(diaryStreak, workoutStreak, habitsStreak)


  // ── Recent Moods (last 7 days) ─────────────────────────────────────
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

  // ── Daily Progress ─────────────────────────────────────────────────
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

  // ── Weekly Activity Chart Data ──────────────────────────────────────
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

    type WeeklyActivityItem = { dayName: string; dateKey: string; diary: number; workouts: number; habits: number; isToday: boolean }
    const result: WeeklyActivityItem[] = []
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

  // ── Today's Workout ──────────────────────────────────────────────
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

  // ── Water Progress (0-100 based on 2000ml goal) ────────────────────
  const waterProgress = useMemo(() => {
    return Math.min(100, Math.round((waterTodayMl / 2000) * 100))
  }, [waterTodayMl])

  // ── Average Mood (last 7 days, or today if no history) ─────────────
  const avgMood = useMemo((): number | null => {
    const moodsWithData = recentMoods.filter(m => m.mood !== null)
    if (moodsWithData.length === 0) return null
    const sum = moodsWithData.reduce((acc, m) => acc + (m.mood ?? 0), 0)
    return Math.round((sum / moodsWithData.length) * 10) / 10
  }, [recentMoods])

  // ── Productivity Score (habits 40%, diary 20%, workout 20%, water 20%) ──
  const productivityScore = useMemo(() => {
    if (loading) return 0
    return Math.round(
      habitsPercentage * 0.4 +
      (!!todayEntry ? 20 : 0) +
      (todayWorkout ? 20 : 0) +
      waterProgress * 0.2
    )
  }, [loading, habitsPercentage, todayEntry, todayWorkout, waterProgress])

  // ── 7-Day Productivity Score History ───────────────────────────────
  const productivityScoreHistory = useMemo((): number[] => {
    if (loading) return []
    const history: number[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      d.setHours(0, 0, 0, 0)
      const dayStr = toDateStr(d)

      let dayScore = 0
      // Diary: any entry on this day → 25 pts
      const hasDiaryDay = diaryEntries.some((e) => toDateStr(new Date(e.date)) === dayStr)
      if (hasDiaryDay) dayScore += 25

      // Workout: any workout on this day → 25 pts
      const hasWorkoutDay = workouts.some((w) => toDateStr(new Date(w.date)) === dayStr)
      if (hasWorkoutDay) dayScore += 25

      // Meals: any meal on this day → 25 pts
      // Approximate from transactions on that day (meals are tracked per date)
      // For now use hasMealsToday for today only
      const isToday = dayStr === toDateStr(new Date())
      if (isToday && hasMealsToday) dayScore += 25

      // Habits: cannot compute per-day from current data for past days, skip
      // For today, use completedToday
      // For past days, we don't have per-day habit data readily available

      history.push(dayScore)
    }
    return history
  }, [loading, diaryEntries, workouts, hasMealsToday, now])

  // ── Productivity Breakdown Data ─────────────────────────────────────
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
      { label: 'Дневник', emoji: '📋', completed: !!todayMood ? 1 : 0, total: 1, color: 'emerald', percentage: !!todayMood ? 100 : 0 },
      { label: 'Тренировки', emoji: '💪', completed: todayWorkout ? 1 : 0, total: 1, color: 'blue', percentage: todayWorkout ? 100 : 0 },
      { label: 'Привычки', emoji: '✅', completed: completedToday, total: totalActive || 1, color: 'violet', percentage: totalActive > 0 ? Math.round((completedToday / totalActive) * 100) : 0 },
      { label: 'Питание', emoji: '🥗', completed: hasMealsToday ? 1 : 0, total: 1, color: 'orange', percentage: hasMealsToday ? 100 : 0 },
    ]
  }, [loading, todayMood, todayWorkout, completedToday, totalActive, hasMealsToday])

  const getTimeAgo = useCallback((dateStr: string): string => {
    return getRelativeTime(dateStr)
  }, [])

  // ── Stable navigation callbacks (avoid re-renders in memo'd children) ──
  const navigateToFinance = useCallback(() => setActiveModule('finance'), [setActiveModule])
  const navigateToFeed = useCallback(() => setActiveModule('feed'), [setActiveModule])
  const handleNotificationCenterNavigate = useCallback((module: AppModule) => setActiveModule(module), [setActiveModule])

  const expensePieData = useMemo(() =>
    financeStats?.byCategory.map((cat, i) => ({
      name: cat.categoryName,
      value: cat.total,
      fill: PIE_COLORS[i % PIE_COLORS.length],
    })) ?? [], [financeStats?.byCategory])

  const recentTransactions = useMemo(() => {
    return [...transactionsData]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
  }, [transactionsData])

  // ── Section renderer ────────────────────────────────────────────────
  const renderSection = (sectionId: string) => {
    const sectionDef = DEFAULT_SECTIONS.find(s => s.id === sectionId)
    const icon = <span>{sectionDef?.icon ?? '📌'}</span>
    const title = sectionDef?.title ?? sectionId
    const defaultCollapsed = sectionDef?.defaultCollapsed ?? false

    switch (sectionId) {
      case 'weekly-challenge':
        return (
          <DashboardSection key={sectionId} id={sectionId} title={title} icon={icon}>
            <WeeklyChallengeWidget />
          </DashboardSection>
        )

      case 'overview':
        return (
          <DashboardSection key={sectionId} id={sectionId} title={title} icon={icon}>
            <ProductivityScore
              loading={loading}
              habitsPercentage={habitsPercentage}
              hasDiaryEntry={!!todayEntry}
              hasWorkout={todayWorkout}
              waterProgress={waterProgress}
              scoreHistory={productivityScoreHistory}
            />
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
          </DashboardSection>
        )

      case 'today':
        return (
          <DashboardSection key={sectionId} id={sectionId} title={title} icon={icon}>
            <div className="grid gap-4 md:grid-cols-2">
              <QuickMoodWidget />
              <MiniCalendar />
            </div>
            <DailyChecklistWidget />
          </DashboardSection>
        )

      case 'quick-access':
        return (
          <DashboardSection key={sectionId} id={sectionId} title={title} icon={icon}>
            <QuickActions onNavigate={setActiveModule} />
            {/* Quick Insights Card */}
            <QuickInsightsCard
              maxStreak={maxStreak}
              diaryStreak={diaryStreak}
              todayMood={todayMood}
              loading={loading}
            />
          </DashboardSection>
        )

      case 'weekly':
        return (
          <DashboardSection key={sectionId} id={sectionId} title={title} icon={icon}>
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
            <WeeklyActivityChart loading={loading} data={weeklyActivity} />
          </DashboardSection>
        )

      case 'health':
        return (
          <DashboardSection key={sectionId} id={sectionId} title={title} icon={icon}>
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
            <CurrentStreaks />
            <MoodDots recentMoods={recentMoods} diaryStreak={diaryStreak} now={now} />
            <ActivityHeatmap loading={loading} activityData={heatmapData} />
            <NutritionSummaryWidget />
          </DashboardSection>
        )

      case 'charts':
        return (
          <DashboardSection key={sectionId} id={sectionId} title={title} defaultCollapsed={defaultCollapsed} icon={icon}>
            <SpendingTrendChart loading={loading} weeklySpendingData={weeklySpendingData} />
            <div className="grid gap-4 md:grid-cols-2">
              <WeeklyMoodChart
                loading={loading}
                moodData={weeklyMoodData.map((d) => ({
                  day: d.day,
                  mood: d.mood > 0 ? d.mood : null,
                  date: d.label,
                }))}
              />
              <ExpensePieChart loading={loading} expensePieData={expensePieData} />
            </div>
          </DashboardSection>
        )

      case 'finances':
        return (
          <DashboardSection key={sectionId} id={sectionId} title={title} defaultCollapsed={defaultCollapsed} icon={icon}>
            <RecentTransactions
              loading={loading}
              transactions={recentTransactions}
              getRelativeTime={getTimeAgo}
              onNavigateToFinance={navigateToFinance}
            />
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
            <BudgetOverview
              loading={loading}
              budgetData={budgetData}
              onNavigateToFinance={navigateToFinance}
            />
          </DashboardSection>
        )

      case 'inspiration':
        return (
          <DashboardSection key={sectionId} id={sectionId} title={title} defaultCollapsed={defaultCollapsed} icon={icon}>
            <AiInsightsWidget
              loading={loading}
              weekEntryCount={weekEntryCount}
              weekWorkoutCount={weekWorkoutCount}
              transactionsData={transactionsData}
              habitsPercentage={habitsPercentage}
              habitsTotal={totalActive}
              habitsCompleted={completedToday}
              waterTodayMl={waterTodayMl}
              recentMoods={recentMoods}
              weekExpenseSum={weekExpenseSum}
            />
            <DailyInspiration />
          </DashboardSection>
        )

      case 'tools':
        return (
          <DashboardSection key={sectionId} id={sectionId} title={title} defaultCollapsed={defaultCollapsed} icon={icon}>
            <QuickNotesWidget />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <WeatherWidget
                avgMood={avgMood}
                productivityScore={productivityScore}
                hasDiaryEntry={!!todayEntry}
                hasWorkout={todayWorkout}
                habitsCompleted={allHabitsCompleted}
              />
              <FocusTimerWidget />
              <BreathingWidget />
            </div>
          </DashboardSection>
        )

      case 'activity':
        return (
          <DashboardSection key={sectionId} id={sectionId} title={title} defaultCollapsed={defaultCollapsed} icon={icon}>
            <ActivityFeed
              loading={loading}
              feedPosts={feedPosts}
              getTimeAgo={getTimeAgo}
              onNavigateToFeed={navigateToFeed}
            />
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
            <div className="grid gap-4 md:grid-cols-2">
              <RecentGoals />
              <RecentDiary loading={loading} diaryEntries={diaryEntries} />
            </div>
          </DashboardSection>
        )

      case 'mood-recommendations':
        return (
          <DashboardSection key={sectionId} id={sectionId} title={title} defaultCollapsed={defaultCollapsed} icon={icon}>
            <MoodRecommendations todayMood={todayMood} />
          </DashboardSection>
        )

      case 'data-stats':
        return (
          <DashboardSection key={sectionId} id={sectionId} title={title} defaultCollapsed={defaultCollapsed} icon={icon}>
            <DataStatsWidget />
          </DashboardSection>
        )

      case 'tips-carousel':
        return (
          <DashboardSection key={sectionId} id={sectionId} title={title} defaultCollapsed={defaultCollapsed} icon={icon}>
            <TipsCarousel />
          </DashboardSection>
        )

      default:
        return null
    }
  }

  // ── Render ──────────────────────────────────────────────────────────

  return (
    <div className="animate-slide-up space-y-6">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <PageHeader
        icon={LayoutDashboard}
        title="Главная"
        description="Ваш личный центр управления жизнью"
        accent="emerald"
        compact
        badge={
          <Badge variant="secondary" className="hidden gap-1.5 text-[10px] font-normal sm:inline-flex">
            <CalendarDays className="h-3 w-3" />
            {now.toLocaleDateString('ru-RU', { weekday: 'long' })}
          </Badge>
        }
        actions={
          <button
            type="button"
            onClick={() => setCustomizerOpen(true)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-background/80 text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Настроить виджеты"
            title="Настроить виджеты"
          >
            <Settings2 className="h-4 w-4" />
          </button>
        }
      />

      {/* ── Welcome Widget (hero) ──────────────────────────────────── */}
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

      {/* ── Motivational Banner ───────────────────────────────────── */}
      <MotivationalBanner
        diaryStreak={diaryStreak}
        workoutStreak={workoutStreak}
        habitsStreak={habitsStreak}
      />

      {/* ── Configurable Sections ──────────────────────────────────── */}
      <div className="stagger-children">
        {widgetConfig ? (
          widgetConfig.order
            .filter((id) => widgetConfig.visible[id])
            .map(renderSection)
        ) : (
          <div className="space-y-4">
            <div className="skeleton-shimmer h-[300px] rounded-xl" />
            <div className="skeleton-shimmer h-[200px] rounded-xl" />
          </div>
        )}
      </div>

      {/* ── Notification Center (always visible) ──────────────────── */}
      <NotificationCenter
        loading={loading}
        hasDiaryToday={!!todayMood}
        hasMealsToday={hasMealsToday}
        uncompletedHabitsCount={totalActive - completedToday}
        onNavigate={handleNotificationCenterNavigate as (module: string) => void}
      />

      {/* ── Widget Customizer Dialog ──────────────────────────────── */}
      <WidgetCustomizer
        open={customizerOpen}
        onOpenChange={setCustomizerOpen}
        onConfigChange={handleConfigChange}
      />
    </div>
  )
}
