'use client'

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import Image from 'next/image'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/use-app-store'
import { AppModule } from '@/store/use-app-store'
import {
  BookOpen,
  Wallet,
  Apple,
  Dumbbell,
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowRight,
  Heart,
  Flame,
  Utensils,
  Target,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Trophy,
} from 'lucide-react'
import { BudgetOverview } from './budget-overview'
import { NotificationCenter } from './notification-center'
import { QuickNotes } from './quick-notes'
import { FocusTimer } from './focus-timer'
import { WeatherWidget } from './weather-widget'
import { ActivityHeatmap } from './activity-heatmap'
import { FinanceQuickView } from './finance-quick-view'
import { MoodStreak } from './mood-streak'
import { WeeklyMoodChart } from './weekly-mood-chart'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import type { ChartConfig } from '@/components/ui/chart'

// ─── Types ────────────────────────────────────────────────────────────────────

interface DiaryEntry {
  id: string
  date: string
  mood: number | null
  title: string | null
}

interface FinanceStats {
  totalIncome: number
  totalExpense: number
  balance: number
  byCategory: { categoryName: string; categoryColor: string; total: number }[]
}

interface NutritionStats {
  totalKcal: number
  totalProtein: number
  totalFat: number
  totalCarbs: number
}

interface Workout {
  id: string
  name: string
  date: string
  durationMin: number | null
}

interface FeedPost {
  id: string
  entityType: string
  entityId: string
  caption: string | null
  createdAt: string
  user: { name: string; avatar: string | null }
  _count: { likes: number }
}

interface Transaction {
  id: string
  date: string
  amount: number
  type: string
}

interface HabitItem {
  id: string
  name: string
  emoji: string
  todayCompleted: boolean
  streak: number
}

interface BudgetCategory {
  id: string
  categoryId: string
  categoryName: string
  categoryIcon: string
  categoryColor: string
  amount: number
  spent: number
  percentage: number
}

interface BudgetData {
  budgets: BudgetCategory[]
  totalBudget: number
  totalSpent: number
  totalRemaining: number
  totalPercentage: number
}

// ─── Constants ────────────────────────────────────────────────────────────────

const moodEmojis: Record<number, string> = {
  1: '😢',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😄',
}

const moodLabels: Record<number, string> = {
  1: 'Ужасно',
  2: 'Плохо',
  3: 'Нормально',
  4: 'Хорошо',
  5: 'Отлично',
}

const dayNamesShort = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

const MOTIVATIONAL_QUOTES = [
  { text: 'Каждый день — это новая возможность стать лучше.', author: 'Неизвестный автор' },
  { text: 'Маленькие шаги каждый день приводят к большим результатам.', author: 'Неизвестный автор' },
  { text: 'Дисциплина — это мост между целями и достижениями.', author: 'Джим Рон' },
  { text: 'Успех — это сумма маленьких усилий, повторяемых день за днём.', author: 'Роберт Кольер' },
  { text: 'Не бойся идти медленно, бойся стоять на месте.', author: 'Китайская пословица' },
  { text: 'Лучшее время посадить дерево было 20 лет назад. Следующее лучшее время — сейчас.', author: 'Китайская пословица' },
  { text: 'Единственный способ сделать отличную работу — любить то, что делаешь.', author: 'Стив Джобс' },
  { text: 'Трудности — это не препятствия, а указатели на пути.', author: 'Ральф Уолдо Эмерсон' },
  { text: 'Будь тем изменением, которое хочешь видеть в мире.', author: 'Махатма Ганди' },
  { text: 'Сила не в том, чтобы не падать, а в том, чтобы каждый раз вставать.', author: 'Конфуций' },
  { text: 'Ваше будущее создаётся тем, что вы делаете сегодня, а не завтра.', author: 'Роберт Кийосаки' },
  { text: 'Повседневные привычки — невидимая архитектура счастливой жизни.', author: 'Джеймс Клир' },
]

const PIE_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--chart-1) / 0.5)',
  'hsl(var(--chart-2) / 0.5)',
  'hsl(var(--chart-3) / 0.5)',
]

const moodChartConfig: ChartConfig = {
  mood: {
    label: 'Настроение',
    color: 'hsl(var(--chart-1))',
  },
}

const expensePieConfig: ChartConfig = {
  amount: {
    label: 'Расходы',
    color: 'hsl(var(--chart-1))',
  },
}

const spendingTrendConfig: ChartConfig = {
  spending: {
    label: 'Расходы',
    color: 'hsl(var(--chart-1))',
  },
}

// ─── Helper Functions ─────────────────────────────────────────────────────────

const formatDate = (date: Date) => {
  return date.toLocaleDateString('ru-RU', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const getTodayStr = () => {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const getCurrentMonthStr = () => {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

const getWeekRange = () => {
  const now = new Date()
  const day = now.getDay()
  const diff = day === 0 ? 6 : day - 1
  const monday = new Date(now)
  monday.setDate(now.getDate() - diff)
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)
  return { from: monday.toISOString(), to: sunday.toISOString() }
}

const getLast7DaysRange = () => {
  const now = new Date()
  const sevenDaysAgo = new Date(now)
  sevenDaysAgo.setDate(now.getDate() - 6)
  sevenDaysAgo.setHours(0, 0, 0, 0)
  return { from: sevenDaysAgo.toISOString(), to: now.toISOString() }
}

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'Доброе утро'
  if (hour >= 12 && hour < 17) return 'Добрый день'
  if (hour >= 17 && hour < 22) return 'Добрый вечер'
  return 'Доброй ночи'
}

const getDayOfYear = () => {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - start.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

const toDateStr = (d: Date) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const calculateStreak = (dates: string[]): number => {
  if (dates.length === 0) return 0

  const uniqueDates = new Set(
    dates.map((d) => {
      const date = new Date(d)
      return toDateStr(date)
    })
  )

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = toDateStr(today)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = toDateStr(yesterday)

  if (!uniqueDates.has(todayStr) && !uniqueDates.has(yesterdayStr)) return 0

  let streak = 0
  const checkDate = uniqueDates.has(todayStr) ? new Date(today) : new Date(yesterday)

  while (true) {
    const checkStr = toDateStr(checkDate)
    if (uniqueDates.has(checkStr)) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}

// ─── Animated Counter Hook ───────────────────────────────────────────────────

function useAnimatedCounter(target: number, duration = 600, enabled = true): number {
  const [value, setValue] = useState(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    let startTime: number | null = null

    const animate = (timestamp: number) => {
      // All setState calls are inside rAF callbacks (asynchronous), never synchronous in the effect body
      if (!enabled || target === 0) {
        setValue(0)
        return
      }

      if (startTime === null) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)

      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(target * eased))

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration, enabled])

  return value
}

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
  const [quoteIndex, setQuoteIndex] = useState(() => getDayOfYear() % MOTIVATIONAL_QUOTES.length)
  const [quoteRefreshing, setQuoteRefreshing] = useState(false)

  // ── Data Fetching (sequential with delay to avoid Turbopack crash) ────
  const fetchWithTimeout = useCallback(async (url: string, timeoutMs = 8000) => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const res = await fetch(url, { signal: controller.signal })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const text = await res.text()
      // Guard against HTML responses (Next.js 404 page)
      if (text.trimStart().startsWith('<')) throw new Error('Received HTML instead of JSON')
      return JSON.parse(text)
    } finally {
      clearTimeout(timer)
    }
  }, [])

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

  const fetchAllData = useCallback(async () => {
    setLoading(true)
    const currentMonth = getCurrentMonthStr()
    const today = getTodayStr()
    const { from, to } = getWeekRange()

    // Fetch sequentially with small delays to avoid overloading Turbopack
    const fetchOne = (url: string) => fetchWithTimeout(url).then((v) => ({ status: 'fulfilled' as const, value: v })).catch((e) => ({ status: 'rejected' as const, reason: e }))

    try {
      const diaryMonthRes = await fetchOne(`/api/diary?month=${currentMonth}`)
      await sleep(100)
      const financeRes = await fetchOne(`/api/finance/stats?month=${currentMonth}`)
      await sleep(100)
      const nutritionRes = await fetchOne(`/api/nutrition/stats?date=${today}`)
      await sleep(100)
      const workoutRes = await fetchOne(`/api/workout?month=${currentMonth}`)
      await sleep(100)
      const feedRes = await fetchOne('/api/feed?limit=5')
      await sleep(100)
      const diaryWeekRes = await fetchOne(`/api/diary?from=${from}&to=${to}`)
      await sleep(100)
      const financeTransactionsRes = await fetchOne(`/api/finance?month=${currentMonth}`)
      await sleep(100)
      const habitsRes = await fetchOne('/api/habits')
      await sleep(100)
      const budgetRes = await fetchOne(`/api/budgets?month=${currentMonth}`)
      await sleep(100)
      const mealsTodayRes = await fetchOne(`/api/nutrition?date=${today}`)

      // Monthly diary entries
      if (diaryMonthRes.status === 'fulfilled' && diaryMonthRes.value.data) {
        setDiaryEntries(diaryMonthRes.value.data)
      }

      // Weekly mood for chart
      if (diaryWeekRes.status === 'fulfilled' && diaryWeekRes.value.data) {
        const weekEntries = diaryWeekRes.value.data as DiaryEntry[]
        const moodByDay = new Map<string, number>()

        for (const entry of weekEntries) {
          if (entry.mood) {
            const d = new Date(entry.date)
            const dayIndex = d.getDay() === 0 ? 6 : d.getDay() - 1
            const dayName = dayNamesShort[dayIndex]
            moodByDay.set(dayName, entry.mood)
          }
        }

        const moodData = dayNamesShort.map((day) => ({
          day,
          mood: moodByDay.get(day) ?? 0,
          label: moodByDay.get(day)
            ? moodEmojis[moodByDay.get(day)!] + ' ' + moodLabels[moodByDay.get(day)!]
            : 'Нет данных',
        }))
        setWeeklyMoodData(moodData)
      }

      // Finance stats
      if (financeRes.status === 'fulfilled' && financeRes.value.success && financeRes.value.data) {
        setFinanceStats(financeRes.value.data)
      }

      // Finance transactions for weekly spending & weekly summary
      if (
        financeTransactionsRes.status === 'fulfilled' &&
        financeTransactionsRes.value.success &&
        financeTransactionsRes.value.data
      ) {
        const transactions = financeTransactionsRes.value.data as Transaction[]
        setTransactionsData(transactions)
        const now = new Date()

        // Build last 7 days map
        const dailySpending = new Map<string, number>()
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now)
          d.setDate(now.getDate() - i)
          d.setHours(0, 0, 0, 0)
          const dateStr = d.toISOString().split('T')[0]
          dailySpending.set(dateStr, 0)
        }

        // Aggregate expense transactions by day
        for (const t of transactions) {
          if (t.type === 'EXPENSE') {
            const tDate = new Date(t.date)
            const dateStr = tDate.toISOString().split('T')[0]
            if (dailySpending.has(dateStr)) {
              dailySpending.set(dateStr, (dailySpending.get(dateStr) ?? 0) + t.amount)
            }
          }
        }

        // Convert to chart data
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
      }

      // Nutrition stats
      if (nutritionRes.status === 'fulfilled' && nutritionRes.value.success && nutritionRes.value.data) {
        setNutritionStats(nutritionRes.value.data)
      }

      // Workouts
      if (workoutRes.status === 'fulfilled' && workoutRes.value.success && workoutRes.value.data) {
        setWorkouts(workoutRes.value.data)
      }

      // Feed posts
      if (feedRes.status === 'fulfilled' && feedRes.value.success && feedRes.value.data) {
        setFeedPosts(feedRes.value.data)
      }

      // Habits data
      if (habitsRes.status === 'fulfilled' && habitsRes.value.success && habitsRes.value.data) {
        setHabitsData({
          data: habitsRes.value.data,
          stats: habitsRes.value.stats,
        })
      }

      // Budget data
      if (budgetRes.status === 'fulfilled' && budgetRes.value.success && budgetRes.value.data) {
        setBudgetData(budgetRes.value.data)
      }

      // Meals today (for notification center)
      if (mealsTodayRes.status === 'fulfilled' && mealsTodayRes.value.success && mealsTodayRes.value.data) {
        setHasMealsToday(mealsTodayRes.value.data.length > 0)
      }
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
  const now = new Date()

  // Today's mood
  const todayEntry = diaryEntries.find((e) => {
    const d = new Date(e.date)
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    )
  })
  const todayMood = todayEntry?.mood ?? null

  // Entries this week
  const { from: weekFrom, to: weekTo } = getWeekRange()
  const weekEntryCount = diaryEntries.filter((e) => {
    const d = new Date(e.date).getTime()
    return d >= new Date(weekFrom).getTime() && d <= new Date(weekTo).getTime()
  }).length

  // Workouts this week
  const weekWorkoutCount = workouts.filter((w) => {
    const d = new Date(w.date).getTime()
    return d >= new Date(weekFrom).getTime() && d <= new Date(weekTo).getTime()
  }).length

  // Weekly expenses sum
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

  // Habits progress
  const totalActive = habitsData?.stats.totalActive ?? 0
  const completedToday = habitsData?.stats.completedToday ?? 0
  const habitsPercentage = totalActive > 0 ? Math.round((completedToday / totalActive) * 100) : 0
  const uncompletedHabits = (habitsData?.data ?? []).filter((h) => !h.todayCompleted).slice(0, 3)
  const allHabitsCompleted = totalActive > 0 && completedToday === totalActive
  const circumference = 251.3
  const dashOffset = circumference * (1 - habitsPercentage / 100)

  // ── Sync notification count to global store ──────────────────────────
  useEffect(() => {
    if (loading) return
    const hasMoodToday = !!todayMood
    const uncompletedHabitsCount = totalActive - completedToday
    const notificationCount = (hasMoodToday ? 0 : 1) + (hasMealsToday ? 0 : 1) + uncompletedHabitsCount
    useAppStore.getState().setNotificationCount(notificationCount)
  }, [loading, todayMood, hasMealsToday, totalActive, completedToday])

  // Nutrition goal (default 2200 kcal)
  const kcalGoal = 2200
  const todayKcal = nutritionStats?.totalKcal ?? 0

  // ── Activity Heatmap Data ──────────────────────────────────────────────
  const heatmapData = useMemo(() => {
    const activityMap = new Map<string, number>()

    const addCount = (dateStr: string) => {
      // Normalize date to YYYY-MM-DD
      const d = new Date(dateStr)
      const key = toDateStr(d)
      activityMap.set(key, (activityMap.get(key) ?? 0) + 1)
    }

    for (const e of diaryEntries) addCount(e.date)
    for (const t of transactionsData) addCount(t.date)
    for (const w of workouts) addCount(w.date)
    // Use completedToday as today's habit log count
    if (completedToday > 0) {
      const todayKey = toDateStr(new Date())
      activityMap.set(todayKey, (activityMap.get(todayKey) ?? 0) + completedToday)
    }

    return Array.from(activityMap.entries()).map(([date, count]) => ({ date, count }))
  }, [diaryEntries, transactionsData, workouts, completedToday])

  // ── Streaks ────────────────────────────────────────────────────────────
  const diaryStreak = calculateStreak(diaryEntries.map((e) => e.date))
  const workoutStreak = calculateStreak(workouts.map((w) => w.date))
  const habitsStreak = habitsData?.stats.bestStreak ?? 0
  const maxStreak = Math.max(diaryStreak, workoutStreak, habitsStreak)

  const streakItems = [
    { icon: <BookOpen className="h-4 w-4 text-emerald-500" />, name: 'Дневник', streak: diaryStreak },
    { icon: <Dumbbell className="h-4 w-4 text-blue-500" />, name: 'Тренировки', streak: workoutStreak },
    { icon: <Target className="h-4 w-4 text-violet-500" />, name: 'Привычки', streak: habitsStreak },
  ]

  // ── Recent Moods (last 7 days) ───────────────────────────────────────
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

  // ── Animated Counters ──────────────────────────────────────────────────
  const animWeekEntries = useAnimatedCounter(weekEntryCount, 600, !loading)
  const animIncome = useAnimatedCounter(financeStats?.totalIncome ?? 0, 600, !loading)
  const animExpense = useAnimatedCounter(financeStats?.totalExpense ?? 0, 600, !loading)
  const animKcal = useAnimatedCounter(todayKcal, 600, !loading)
  const animWorkouts = useAnimatedCounter(workouts.length, 600, !loading)
  const animHabitsPct = useAnimatedCounter(habitsPercentage, 600, !loading)
  const animWeekWorkouts = useAnimatedCounter(weekWorkoutCount, 600, !loading)

  // ── Quote Handlers ─────────────────────────────────────────────────────
  const handleRefreshQuote = () => {
    setQuoteRefreshing(true)
    const newIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)
    setQuoteIndex(newIndex)
    setTimeout(() => setQuoteRefreshing(false), 400)
  }

  // ── Expense Pie Data ───────────────────────────────────────────────────
  const expensePieData =
    financeStats?.byCategory.map((cat, i) => ({
      name: cat.categoryName,
      value: cat.total,
      fill: PIE_COLORS[i % PIE_COLORS.length],
    })) ?? []

  // ── Quick Actions ──────────────────────────────────────────────────────
  const quickActions: {
    label: string
    icon: React.ReactNode
    module: AppModule
    iconBg: string
  }[] = [
    {
      label: 'Новая запись',
      icon: <Plus className="h-4 w-4" />,
      module: 'diary',
      iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
    },
    {
      label: 'Добавить расход',
      icon: <TrendingDown className="h-4 w-4" />,
      module: 'finance',
      iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
    },
    {
      label: 'Записать приём пищи',
      icon: <Utensils className="h-4 w-4" />,
      module: 'nutrition',
      iconBg: 'bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400',
    },
    {
      label: 'Новая тренировка',
      icon: <Dumbbell className="h-4 w-4" />,
      module: 'workout',
      iconBg: 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
    },
  ]

  // ── Feed item helpers ──────────────────────────────────────────────────
  const getEntityTypeLabel = (type: string) => {
    switch (type) {
      case 'diary':
        return 'Дневник'
      case 'workout':
        return 'Тренировка'
      case 'meal':
        return 'Питание'
      case 'transaction':
        return 'Финансы'
      default:
        return type
    }
  }

  const getEntityBorderColor = (type: string) => {
    switch (type) {
      case 'diary':
        return 'border-l-blue-500'
      case 'workout':
        return 'border-l-orange-500'
      case 'meal':
        return 'border-l-green-500'
      case 'transaction':
        return 'border-l-yellow-500'
      default:
        return 'border-l-pink-500'
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────

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
      </div>

      {/* ── Stats Cards Grid ───────────────────────────────────────────── */}
      <div className="stagger-children grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Дневник */}
        {loading ? (
          <Skeleton className="h-[130px] rounded-xl" />
        ) : (
          <Card className="card-hover group rounded-xl border border-transparent bg-gradient-to-br from-emerald-50 to-teal-50 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg dark:from-emerald-950/40 dark:to-teal-950/30 dark:border-emerald-800/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                Дневник
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
                <BookOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-2">
                <span className="text-3xl">
                  {todayMood ? moodEmojis[todayMood] : '📝'}
                </span>
                <div>
                  <p className="text-lg font-semibold tabular-nums">
                    {animWeekEntries}
                  </p>
                  <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">записей за неделю</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Финансы */}
        {loading ? (
          <Skeleton className="h-[130px] rounded-xl" />
        ) : (
          <Card className="card-hover group rounded-xl border border-transparent bg-gradient-to-br from-amber-50 to-yellow-50 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg dark:from-amber-950/40 dark:to-yellow-950/30 dark:border-amber-800/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300">
                Финансы
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
                <Wallet className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  <span className="text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(animIncome)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingDown className="h-3 w-3 text-red-500" />
                  <span className="text-sm font-semibold tabular-nums text-red-600 dark:text-red-400">
                    {formatCurrency(animExpense)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Питание */}
        {loading ? (
          <Skeleton className="h-[130px] rounded-xl" />
        ) : (
          <Card className="card-hover group rounded-xl border border-transparent bg-gradient-to-br from-orange-50 to-amber-50 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg dark:from-orange-950/40 dark:to-amber-950/30 dark:border-orange-800/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
                Питание
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/50">
                <Flame className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div>
                <p className="text-lg font-semibold tabular-nums">
                  {animKcal.toLocaleString('ru-RU')}
                  <span className="text-sm font-normal text-muted-foreground">
                    {' '}/ {kcalGoal.toLocaleString('ru-RU')} ккал
                  </span>
                </p>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-orange-100 dark:bg-orange-900/30">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((todayKcal / kcalGoal) * 100, 100)}%`,
                      backgroundColor:
                        todayKcal > kcalGoal
                          ? 'hsl(var(--destructive))'
                          : '#f97316',
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Тренировки */}
        {loading ? (
          <Skeleton className="h-[130px] rounded-xl" />
        ) : (
          <Card className="card-hover group rounded-xl border border-transparent bg-gradient-to-br from-blue-50 to-sky-50 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg dark:from-blue-950/40 dark:to-sky-950/30 dark:border-blue-800/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Тренировки
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
                <Dumbbell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div>
                <p className="text-lg font-semibold tabular-nums">{animWorkouts}</p>
                <p className="text-xs text-blue-600/70 dark:text-blue-400/70">тренировок в этом месяце</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── Quick Actions ──────────────────────────────────────────────── */}
      <Card className="rounded-xl border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Быстрые действия</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {quickActions.map((action) => (
              <button
                key={action.module}
                onClick={() => setActiveModule(action.module)}
                className="group flex items-center gap-2.5 rounded-xl border bg-accent px-4 py-3 text-sm font-medium transition-all duration-200 hover:scale-[1.03] hover:bg-accent/80 hover:shadow-md active:scale-[0.98] hover-glow"
              >
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110 ${action.iconBg}`}
                >
                  {action.icon}
                </div>
                {action.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Daily Motivational Quote ───────────────────────────────────── */}
      <Card className="overflow-hidden rounded-xl border border-transparent bg-gradient-to-br from-emerald-50 via-teal-50/50 to-cyan-50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-cyan-950/20">
        <CardContent className="relative p-5">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-200/30 blur-2xl dark:bg-emerald-800/20" />
          <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-teal-200/30 blur-xl dark:bg-teal-800/20" />

          <div className="relative">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                  <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                  Вдохновение дня
                </h3>
              </div>
              <button
                onClick={handleRefreshQuote}
                className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white/60 hover:text-emerald-600 dark:hover:bg-white/10 dark:hover:text-emerald-400"
                title="Другая цитата"
              >
                <RefreshCw className={`h-3.5 w-3.5 transition-transform duration-300 ${quoteRefreshing ? 'rotate-180' : ''}`} />
              </button>
            </div>

            <blockquote className="relative pl-3">
              <div className="absolute bottom-0 left-0 top-0 w-0.5 rounded-full bg-gradient-to-b from-emerald-400 to-teal-400" />
              <p className="text-sm leading-relaxed font-medium text-foreground/90">
                &laquo;{MOTIVATIONAL_QUOTES[quoteIndex].text}&raquo;
              </p>
              <footer className="mt-2 text-xs text-muted-foreground">
                — {MOTIVATIONAL_QUOTES[quoteIndex].author}
              </footer>
            </blockquote>
          </div>
        </CardContent>
      </Card>

      {/* ── Mood Streak Tracker ──────────────────────────────────────── */}
      <MoodStreak
        loading={loading}
        recentMoods={recentMoods}
        streak={diaryStreak}
        todayMood={todayMood}
      />

      {/* ── Weekly Mood Trend Line Chart ──────────────────────────── */}
      <WeeklyMoodChart
        loading={loading}
        moodData={weeklyMoodData.map((d) => ({
          day: d.day,
          mood: d.mood > 0 ? d.mood : null,
          date: d.label,
        }))}
      />

      {/* ── Today's Habits Progress ──────────────────────────────────── */}
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
                onClick={() => setActiveModule('habits')}
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
                    {animHabitsPct}%
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
                        onClick={() => setActiveModule('habits')}
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

      {/* ── Activity Heatmap ────────────────────────────────────────── */}
      <ActivityHeatmap loading={loading} activityData={heatmapData} />

      {/* ── Budget Overview ─────────────────────────────────────────── */}
      <BudgetOverview
        loading={loading}
        budgetData={budgetData}
        onNavigateToFinance={() => setActiveModule('finance')}
      />

      {/* ── Notification Center ────────────────────────────────────────── */}
      <NotificationCenter
        loading={loading}
        hasDiaryToday={!!todayMood}
        hasMealsToday={hasMealsToday}
        uncompletedHabitsCount={totalActive - completedToday}
        onNavigate={(module) => setActiveModule(module as AppModule)}
      />

      {/* ── Quick Notes, Weather & Focus Timer ────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <QuickNotes />
        <WeatherWidget />
        <FocusTimer />
      </div>

      {/* ── Finance Quick View ────────────────────────────────────────── */}
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

      {/* ── Charts Section ─────────────────────────────────────────────── */}
      <div className="space-y-4">
        {/* Weekly Spending Trend — Full Width */}
        <Card className="rounded-xl border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Динамика расходов за неделю</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[220px] w-full rounded-lg" />
            ) : weeklySpendingData.length > 0 ? (
              <ChartContainer config={spendingTrendConfig} className="h-[220px] w-full">
                <AreaChart data={weeklySpendingData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={60}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value: number) => `${value.toLocaleString('ru-RU')} ₽`}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => (
                          <span className="font-medium">
                            {formatCurrency(value as number)}
                          </span>
                        )}
                      />
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="spending"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    fill="url(#spendingGradient)"
                    dot={{ r: 4, fill: 'hsl(var(--chart-1))', strokeWidth: 2, stroke: 'hsl(var(--background))' }}
                    activeDot={{ r: 6, fill: 'hsl(var(--chart-1))', strokeWidth: 2, stroke: 'hsl(var(--background))' }}
                  />
                </AreaChart>
              </ChartContainer>
            ) : (
              <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
                Нет данных о расходах за эту неделю
              </div>
            )}
          </CardContent>
        </Card>

        {/* Two-column chart grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Weekly Mood Chart */}
          <Card className="rounded-xl border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Настроение за неделю</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[250px] w-full rounded-lg" />
              ) : weeklyMoodData.length > 0 ? (
                <ChartContainer config={moodChartConfig} className="h-[250px] w-full">
                  <BarChart data={weeklyMoodData} margin={{ top: 8, right: 8, bottom: 0, left: -10 }}>
                    <XAxis
                      dataKey="day"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      domain={[0, 5]}
                      ticks={[1, 2, 3, 4, 5]}
                      tickLine={false}
                      axisLine={false}
                      width={30}
                      tick={{ fontSize: 12 }}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value, _name, item) => {
                            const label = item.payload.label as string
                            return <span>{label}</span>
                          }}
                        />
                      }
                    />
                    <Bar
                      dataKey="mood"
                      fill="hsl(var(--chart-1))"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
                  Нет данных о настроении за эту неделю
                </div>
              )}
            </CardContent>
          </Card>

          {/* Monthly Expense Pie Chart */}
          <Card className="rounded-xl border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Расходы по категориям</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[250px] w-full rounded-lg" />
              ) : expensePieData.length > 0 ? (
                <ChartContainer config={expensePieConfig} className="h-[250px] w-full">
                  <PieChart>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value, _name, item) => {
                            const name = item.payload.name as string
                            return (
                              <span>
                                {name}: {formatCurrency(value as number)}
                              </span>
                            )
                          }}
                        />
                      }
                    />
                    <Pie
                      data={expensePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {expensePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                  </PieChart>
                </ChartContainer>
              ) : (
                <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
                  Нет расходов в этом месяце
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Focus Timer moved to grid above with QuickNotes & WeatherWidget */}

      {/* ── Recent Activity Feed ───────────────────────────────────────── */}
      <Card className="rounded-xl border">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">Последняя активность</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-muted-foreground"
            onClick={() => setActiveModule('feed')}
          >
            Все записи
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : feedPosts.length > 0 ? (
            <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
              {feedPosts.map((post) => {
                const createdAt = new Date(post.createdAt)
                const timeAgo = getTimeAgo(createdAt)

                return (
                  <div
                    key={post.id}
                    className={`flex items-start gap-3 rounded-xl border-l-4 p-3 transition-colors hover:bg-muted/50 ${getEntityBorderColor(post.entityType)}`}
                  >
                    <Image
                      src="/unilife-logo.png"
                      alt="User avatar"
                      width={36}
                      height={36}
                      className="mt-0.5 h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-background"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{post.user.name}</span>
                        <Badge variant="secondary" className="text-[10px]">
                          {getEntityTypeLabel(post.entityType)}
                        </Badge>
                        <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                          {timeAgo}
                        </span>
                      </div>
                      {post.caption && (
                        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                          {post.caption}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Heart className="mb-2 h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">Пока нет записей в ленте</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Streak Tracking Widget ─────────────────────────────────────── */}
      <Card className="rounded-xl border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Flame className="h-4 w-4 text-orange-500" />
            Рекорды серий
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {streakItems.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center gap-3 rounded-xl bg-muted/40 px-4 py-3 transition-colors hover:bg-muted/70"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background shadow-sm">
                    {item.icon}
                  </div>
                  <span className="flex-1 text-sm font-medium">{item.name}</span>
                  <div className="flex items-center gap-1.5">
                    {item.streak >= 7 && <span className="text-base">🔥</span>}
                    {item.streak === maxStreak && maxStreak > 0 && (
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400">
                        <Trophy className="mr-1 h-3 w-3" />
                        Рекорд
                      </Badge>
                    )}
                    <span className="text-base font-bold tabular-nums text-foreground">
                      {item.streak}
                    </span>
                    <span className="text-xs text-muted-foreground">дней</span>
                  </div>
                </div>
              ))}

              {maxStreak === 0 && (
                <p className="py-2 text-center text-xs text-muted-foreground">
                  Начните отслеживать активности, чтобы увидеть серии
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Weekly Summary (Enhanced) ──────────────────────────────────── */}
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
                      {animWeekEntries}
                    </p>
                    {animWeekEntries > 0 && (
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
                      {animWeekWorkouts}
                    </p>
                    {animWeekWorkouts > 0 && (
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
                      {animKcal.toLocaleString('ru-RU')}
                    </p>
                    {animKcal > 0 && (
                      <TrendingUp className="h-3 w-3 text-orange-500" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Utility ──────────────────────────────────────────────────────────────────

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'только что'
  if (diffMins < 60) return `${diffMins} мин назад`
  if (diffHours < 24) return `${diffHours} ч назад`
  if (diffDays < 7) return `${diffDays} д назад`
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}
