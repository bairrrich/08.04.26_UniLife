'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
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
import {
  BarChart3,
  BookOpen,
  Wallet,
  TrendingUp,
  TrendingDown,
  Dumbbell,
  Target,
  Apple,
  Flame,
  Smile,
  Sparkles,
  CalendarDays,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Period = 'week' | 'month' | 'year'

interface DiaryEntry {
  id: string
  date: string
  mood: number | null
  title: string | null
}

interface Transaction {
  id: string
  date: string
  amount: number
  type: string
  category?: {
    name: string
    color: string
    icon: string
  } | null
}

interface NutritionDay {
  date: string
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

interface HabitItem {
  id: string
  name: string
  emoji: string
  todayCompleted: boolean
  streak: number
  last7Days: Record<string, boolean>
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MOOD_EMOJIS: Record<number, string> = {
  1: '😢',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😄',
}

const MOOD_LABELS: Record<number, string> = {
  1: 'Ужасно',
  2: 'Плохо',
  3: 'Нормально',
  4: 'Хорошо',
  5: 'Отлично',
}

const DAY_NAMES_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const MONTH_NAMES = [
  'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
  'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек',
]
const MONTH_NAMES_FULL = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
]

const PIE_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--chart-1) / 0.6)',
  'hsl(var(--chart-2) / 0.6)',
  'hsl(var(--chart-3) / 0.6)',
]

const WORKOUT_TYPE_MAP: Record<string, string> = {
  'жим': 'Сила',
  'присед': 'Сила',
  'рука': 'Сила',
  'нога': 'Сила',
  'грудь': 'Сила',
  'спина': 'Сила',
  'плеч': 'Сила',
  'пресс': 'Сила',
  'bench': 'Сила',
  'squat': 'Сила',
  'deadlift': 'Сила',
  'pull': 'Сила',
  'бег': 'Кардио',
  'run': 'Кардио',
  'кардио': 'Кардио',
  'вело': 'Кардио',
  'плавание': 'Кардио',
  'прыжки': 'Кардио',
  'йога': 'Гибкость',
  'растяжк': 'Гибкость',
  'stretch': 'Гибкость',
  'HIIT': 'HIIT',
  'hiit': 'HIIT',
  'кроссфит': 'HIIT',
  'интервал': 'HIIT',
}

const WORKOUT_TYPE_COLORS: Record<string, string> = {
  'Сила': 'hsl(var(--chart-1))',
  'Кардио': 'hsl(var(--chart-4))',
  'Гибкость': 'hsl(var(--chart-2))',
  'HIIT': 'hsl(var(--chart-5))',
  'Другое': 'hsl(var(--chart-3))',
}

const moodChartConfig: ChartConfig = {
  mood: { label: 'Настроение', color: 'hsl(var(--chart-1))' },
}

const spendingChartConfig: ChartConfig = {
  spending: { label: 'Расходы', color: 'hsl(var(--chart-1))' },
  income: { label: 'Доходы', color: 'hsl(var(--chart-2))' },
}

const nutritionChartConfig: ChartConfig = {
  calories: { label: 'Калории', color: 'hsl(var(--chart-4))' },
  protein: { label: 'Белки', color: 'hsl(var(--chart-1))' },
  fat: { label: 'Жиры', color: 'hsl(var(--chart-3))' },
  carbs: { label: 'Углеводы', color: 'hsl(var(--chart-2))' },
}

const workoutPieConfig: ChartConfig = {
  value: { label: 'Тренировки', color: 'hsl(var(--chart-1))' },
  'Сила': { label: 'Сила', color: 'hsl(var(--chart-1))' },
  'Кардио': { label: 'Кардио', color: 'hsl(var(--chart-4))' },
  'Гибкость': { label: 'Гибкость', color: 'hsl(var(--chart-2))' },
  'HIIT': { label: 'HIIT', color: 'hsl(var(--chart-5))' },
  'Другое': { label: 'Другое', color: 'hsl(var(--chart-3))' },
}

const categoryBarConfig: ChartConfig = {
  amount: { label: 'Сумма', color: 'hsl(var(--chart-1))' },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toDateStr = (d: Date) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const getDateRange = (period: Period) => {
  const now = new Date()
  const from = new Date(now)
  const to = new Date(now)

  if (period === 'week') {
    const day = now.getDay()
    const diff = day === 0 ? 6 : day - 1
    from.setDate(now.getDate() - diff)
    from.setHours(0, 0, 0, 0)
    to.setHours(23, 59, 59, 999)
  } else if (period === 'month') {
    from.setDate(1)
    from.setHours(0, 0, 0, 0)
    to.setHours(23, 59, 59, 999)
  } else {
    from.setMonth(0, 1)
    from.setHours(0, 0, 0, 0)
    to.setHours(23, 59, 59, 999)
  }

  return { from: from.toISOString(), to: to.toISOString() }
}

const getMonthStr = (date: Date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

const classifyWorkout = (name: string): string => {
  const lower = name.toLowerCase()
  for (const [key, type] of Object.entries(WORKOUT_TYPE_MAP)) {
    if (lower.includes(key.toLowerCase())) return type
  }
  return 'Другое'
}

// ─── Skeleton Components ──────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <Card className="rounded-xl border">
      <CardHeader className="pb-2">
        <div className="skeleton-shimmer h-4 w-24 rounded-md" />
      </CardHeader>
      <CardContent>
        <div className="skeleton-shimmer mb-2 h-8 w-32 rounded-md" />
        <div className="skeleton-shimmer h-3 w-20 rounded-md" />
      </CardContent>
    </Card>
  )
}

function SkeletonChart() {
  return (
    <Card className="rounded-xl border">
      <CardHeader className="pb-2">
        <div className="skeleton-shimmer h-4 w-36 rounded-md" />
      </CardHeader>
      <CardContent>
        <div className="skeleton-shimmer h-[250px] w-full rounded-lg" />
      </CardContent>
    </Card>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>('month')
  const [loading, setLoading] = useState(true)
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [habits, setHabits] = useState<HabitItem[]>([])
  const [nutritionDays, setNutritionDays] = useState<NutritionDay[]>([])

  // ── Data Fetching (sequential to avoid Turbopack crash) ────────────────
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

  const safeFetch = async (url: string, timeoutMs = 8000) => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const res = await fetch(url, { signal: controller.signal })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const text = await res.text()
      if (text.trimStart().startsWith('<')) throw new Error('Received HTML instead of JSON')
      return JSON.parse(text)
    } finally {
      clearTimeout(timer)
    }
  }

  const fetchOne = (url: string) => safeFetch(url).then((v) => ({ status: 'fulfilled' as const, value: v })).catch((e) => ({ status: 'rejected' as const, reason: e }))

  const fetchData = useCallback(async (p: Period) => {
    setLoading(true)
    const { from, to } = getDateRange(p)
    const currentMonth = getMonthStr(new Date())

    try {
      const diaryRes = await fetchOne(`/api/diary?from=${from}&to=${to}`)
      await sleep(150)
      const financeRes = await fetchOne(`/api/finance?month=${currentMonth}`)
      await sleep(150)
      const workoutRes = await fetchOne(`/api/workout?month=${currentMonth}`)
      await sleep(150)
      const habitsRes = await fetchOne('/api/habits')

      // Fetch nutrition stats sequentially with delay
      const fromDate = new Date(from)
      const toDate = new Date(to)
      const maxDays = p === 'year' ? 14 : p === 'month' ? 14 : 7
      const nutritionResults: { status: string; value: unknown; reason?: unknown }[] = []
      const cursor = new Date(fromDate)
      let dayCount = 0
      while (cursor <= toDate && dayCount < maxDays) {
        const dateStr = toDateStr(cursor)
        const result = await fetchOne(`/api/nutrition/stats?date=${dateStr}`)
        nutritionResults.push(result)
        await sleep(100)
        cursor.setDate(cursor.getDate() + 1)
        dayCount++
      }

      // Diary
      if (diaryRes.status === 'fulfilled' && diaryRes.value.data) {
        setDiaryEntries(diaryRes.value.data)
      } else {
        setDiaryEntries([])
      }

      // Transactions
      if (
        financeRes.status === 'fulfilled' &&
        financeRes.value.success &&
        financeRes.value.data
      ) {
        setTransactions(financeRes.value.data)
      } else {
        setTransactions([])
      }

      // Workouts
      if (
        workoutRes.status === 'fulfilled' &&
        workoutRes.value.success &&
        workoutRes.value.data
      ) {
        setWorkouts(workoutRes.value.data)
      } else {
        setWorkouts([])
      }

      // Habits
      if (
        habitsRes.status === 'fulfilled' &&
        habitsRes.value.success &&
        habitsRes.value.data
      ) {
        setHabits(habitsRes.value.data)
      } else {
        setHabits([])
      }

      // Nutrition days
      const nutritionData: NutritionDay[] = []
      for (let i = 0; i < nutritionResults.length; i++) {
        const res = nutritionResults[i]
        if (
          res &&
          res.status === 'fulfilled' &&
          res.value &&
          res.value.success &&
          res.value.data
        ) {
          nutritionData.push({
            date: res.value.data.date,
            totalKcal: res.value.data.totalKcal || 0,
            totalProtein: res.value.data.totalProtein || 0,
            totalFat: res.value.data.totalFat || 0,
            totalCarbs: res.value.data.totalCarbs || 0,
          })
        }
      }
      setNutritionDays(nutritionData)
    } catch (err) {
      console.error('Analytics fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData(period)
  }, [period, fetchData])

  // ── Derived Data ───────────────────────────────────────────────────────

  // 1. Overview Stats
  const diaryCount = diaryEntries.length
  const moodEntries = diaryEntries.filter((e) => e.mood !== null)
  const avgMood = moodEntries.length > 0
    ? moodEntries.reduce((s, e) => s + (e.mood ?? 0), 0) / moodEntries.length
    : 0

  const totalExpenses = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((s, t) => s + t.amount, 0)
  const totalIncome = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((s, t) => s + t.amount, 0)
  const savingsRate = totalIncome > 0
    ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100)
    : 0

  const workoutCount = workouts.length
  const totalMinutes = workouts.reduce((s, w) => s + (w.durationMin ?? 0), 0)

  const totalHabits = habits.length
  const completedHabits = habits.filter((h) => h.todayCompleted).length
  const habitsRate = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0

  // 2. Mood Trend Chart Data
  const moodChartData = useMemo(() => {
    const now = new Date()
    const entries = diaryEntries
      .filter((e) => e.mood !== null)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    if (period === 'week') {
      // Last 7 days with day names
      const data: { label: string; mood: number; fullLabel: string }[] = []
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now)
        d.setDate(now.getDate() - i)
        const dateStr = toDateStr(d)
        const dayIdx = d.getDay() === 0 ? 6 : d.getDay() - 1
        const entry = entries.find((e) => toDateStr(new Date(e.date)) === dateStr)
        data.push({
          label: DAY_NAMES_SHORT[dayIdx],
          mood: entry?.mood ?? 0,
          fullLabel: `${DAY_NAMES_SHORT[dayIdx]}: ${entry ? MOOD_EMOJIS[entry.mood!] + ' ' + MOOD_LABELS[entry.mood!] : 'Нет данных'}`,
        })
      }
      return data
    } else if (period === 'month') {
      // Group by week
      const data: { label: string; mood: number; fullLabel: string }[] = []
      const weekLabels = ['Нед 1', 'Нед 2', 'Нед 3', 'Нед 4', 'Нед 5']
      for (let w = 0; w < 5; w++) {
        const weekStart = new Date(now.getFullYear(), now.getMonth(), w * 7 + 1)
        const weekEnd = new Date(now.getFullYear(), now.getMonth(), (w + 1) * 7)
        const weekEntries = entries.filter((e) => {
          const d = new Date(e.date)
          return d >= weekStart && d < weekEnd && d.getMonth() === now.getMonth()
        })
        const avg = weekEntries.length > 0
          ? Math.round(weekEntries.reduce((s, e) => s + (e.mood ?? 0), 0) / weekEntries.length * 10) / 10
          : 0
        data.push({
          label: weekLabels[w] ?? `Н${w + 1}`,
          mood: avg,
          fullLabel: `${weekLabels[w]}: ${avg > 0 ? avg.toFixed(1) : 'Нет данных'}`,
        })
      }
      return data
    } else {
      // Year: monthly averages
      const data: { label: string; mood: number; fullLabel: string }[] = []
      for (let m = 0; m < 12; m++) {
        const monthEntries = entries.filter((e) => {
          const d = new Date(e.date)
          return d.getMonth() === m && d.getFullYear() === now.getFullYear()
        })
        const avg = monthEntries.length > 0
          ? Math.round(monthEntries.reduce((s, e) => s + (e.mood ?? 0), 0) / monthEntries.length * 10) / 10
          : 0
        data.push({
          label: MONTH_NAMES[m],
          mood: avg,
          fullLabel: `${MONTH_NAMES_FULL[m]}: ${avg > 0 ? avg.toFixed(1) : 'Нет данных'}`,
        })
      }
      return data
    }
  }, [diaryEntries, period])

  // 3. Spending Trend Data
  const spendingChartData = useMemo(() => {
    const now = new Date()
    const expenses = transactions.filter((t) => t.type === 'EXPENSE')
    const income = transactions.filter((t) => t.type === 'INCOME')

    if (period === 'week') {
      const data: { label: string; spending: number; income: number }[] = []
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now)
        d.setDate(now.getDate() - i)
        const dateStr = toDateStr(d)
        const dayIdx = d.getDay() === 0 ? 6 : d.getDay() - 1
        const dayExpenses = expenses
          .filter((t) => toDateStr(new Date(t.date)) === dateStr)
          .reduce((s, t) => s + t.amount, 0)
        const dayIncome = income
          .filter((t) => toDateStr(new Date(t.date)) === dateStr)
          .reduce((s, t) => s + t.amount, 0)
        data.push({
          label: DAY_NAMES_SHORT[dayIdx],
          spending: Math.round(dayExpenses),
          income: Math.round(dayIncome),
        })
      }
      return data
    } else if (period === 'month') {
      const data: { label: string; spending: number; income: number }[] = []
      const weekLabels = ['Нед 1', 'Нед 2', 'Нед 3', 'Нед 4', 'Нед 5']
      for (let w = 0; w < 5; w++) {
        const weekStart = new Date(now.getFullYear(), now.getMonth(), w * 7 + 1)
        const weekEnd = new Date(now.getFullYear(), now.getMonth(), (w + 1) * 7)
        const weekExpenses = expenses.filter((t) => {
          const d = new Date(t.date)
          return d >= weekStart && d < weekEnd && d.getMonth() === now.getMonth()
        }).reduce((s, t) => s + t.amount, 0)
        const weekIncome = income.filter((t) => {
          const d = new Date(t.date)
          return d >= weekStart && d < weekEnd && d.getMonth() === now.getMonth()
        }).reduce((s, t) => s + t.amount, 0)
        data.push({
          label: weekLabels[w] ?? `Н${w + 1}`,
          spending: Math.round(weekExpenses),
          income: Math.round(weekIncome),
        })
      }
      return data
    } else {
      const data: { label: string; spending: number; income: number }[] = []
      for (let m = 0; m < 12; m++) {
        const monthExpenses = expenses.filter((t) => {
          const d = new Date(t.date)
          return d.getMonth() === m && d.getFullYear() === now.getFullYear()
        }).reduce((s, t) => s + t.amount, 0)
        const monthIncome = income.filter((t) => {
          const d = new Date(t.date)
          return d.getMonth() === m && d.getFullYear() === now.getFullYear()
        }).reduce((s, t) => s + t.amount, 0)
        data.push({
          label: MONTH_NAMES[m],
          spending: Math.round(monthExpenses),
          income: Math.round(monthIncome),
        })
      }
      return data
    }
  }, [transactions, period])

  // 4. Nutrition Summary
  const nutritionSummary = useMemo(() => {
    if (nutritionDays.length === 0) {
      return { avgKcal: 0, avgProtein: 0, avgFat: 0, avgCarbs: 0, daysWithData: 0 }
    }
    const daysWithData = nutritionDays.filter((d) => d.totalKcal > 0).length
    const total = nutritionDays.reduce(
      (acc, d) => ({
        kcal: acc.kcal + d.totalKcal,
        protein: acc.protein + d.totalProtein,
        fat: acc.fat + d.totalFat,
        carbs: acc.carbs + d.totalCarbs,
      }),
      { kcal: 0, protein: 0, fat: 0, carbs: 0 }
    )
    const n = daysWithData || 1
    return {
      avgKcal: Math.round(total.kcal / n),
      avgProtein: Math.round(total.protein / n),
      avgFat: Math.round(total.fat / n),
      avgCarbs: Math.round(total.carbs / n),
      daysWithData,
    }
  }, [nutritionDays])

  // 5. Workout Distribution
  const workoutDistribution = useMemo(() => {
    const typeCounts: Record<string, number> = {}
    for (const w of workouts) {
      const type = classifyWorkout(w.name)
      typeCounts[type] = (typeCounts[type] || 0) + 1
    }
    return Object.entries(typeCounts)
      .map(([name, value]) => ({
        name,
        value,
        fill: WORKOUT_TYPE_COLORS[name] ?? 'hsl(var(--chart-3))',
      }))
      .sort((a, b) => b.value - a.value)
  }, [workouts])

  // 6. Top Expense Categories
  const topCategories = useMemo(() => {
    const catMap: Record<string, { name: string; total: number }> = {}
    for (const t of transactions) {
      if (t.type !== 'EXPENSE') continue
      const name = t.category?.name || 'Другое'
      if (!catMap[name]) catMap[name] = { name, total: 0 }
      catMap[name].total += t.amount
    }
    return Object.values(catMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map((c, i) => ({
        name: c.name.length > 14 ? c.name.slice(0, 14) + '...' : c.name,
        amount: Math.round(c.total),
        fill: PIE_COLORS[i % PIE_COLORS.length],
      }))
  }, [transactions])

  // 7. Habits Heatmap Data (last 30 days)
  const habitsHeatmap = useMemo(() => {
    const grid: { date: string; completed: boolean; day: number }[] = []
    const now = new Date()
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      const dateStr = toDateStr(d)
      // Check if any habit was completed on this day
      const anyCompleted = habits.some((h) => h.last7Days[dateStr])
      // More thorough check: calculate from habits data
      grid.push({
        date: dateStr,
        completed: anyCompleted,
        day: d.getDate(),
      })
    }
    return grid
  }, [habits])

  const heatmapCompletionRate = habitsHeatmap.length > 0
    ? Math.round((habitsHeatmap.filter((h) => h.completed).length / habitsHeatmap.length) * 100)
    : 0

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="animate-slide-up space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-20 -top-16 h-64 w-64 rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 top-8 h-40 w-40 rounded-full bg-gradient-to-br from-violet-400/15 to-indigo-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-sm">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Аналитика</h1>
                <p className="text-sm text-muted-foreground">
                  Статистика и тренды по всем модулям
                </p>
              </div>
            </div>
          </div>

          {/* Period Selector */}
          <Tabs
            value={period}
            onValueChange={(v) => setPeriod(v as Period)}
          >
            <TabsList className="bg-muted/60">
              <TabsTrigger value="week" className="text-xs sm:text-sm">Неделя</TabsTrigger>
              <TabsTrigger value="month" className="text-xs sm:text-sm">Месяц</TabsTrigger>
              <TabsTrigger value="year" className="text-xs sm:text-sm">Год</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* ── Overview Stats ─────────────────────────────────────────────── */}
      <div className="stagger-children grid grid-cols-2 gap-3 lg:grid-cols-4">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            {/* Diary Stats */}
            <Card className="card-hover rounded-xl border border-transparent bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 dark:border-emerald-800/30">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  Записи в дневнике
                </CardTitle>
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
                  <BookOpen className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xl font-bold tabular-nums">{diaryCount}</p>
                <div className="mt-1 flex items-center gap-1">
                  <Smile className="h-3 w-3 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    Ср. настроение:{' '}
                    <span className="font-medium tabular-nums text-emerald-600 dark:text-emerald-400">
                      {avgMood > 0 ? `${avgMood.toFixed(1)} ${MOOD_EMOJIS[Math.round(avgMood)] || ''}` : '—'}
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Finance Stats */}
            <Card className="card-hover rounded-xl border border-transparent bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/40 dark:to-yellow-950/30 dark:border-amber-800/30">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-amber-700 dark:text-amber-300">
                  Расходы / Доходы
                </CardTitle>
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
                  <Wallet className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-1.5">
                  <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                  <span className="text-base font-bold tabular-nums text-red-600 dark:text-red-400">
                    {formatCurrency(totalExpenses)}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  <p className="text-xs text-muted-foreground">
                    Сбережения:{' '}
                    <span className={`font-medium tabular-nums ${savingsRate >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {savingsRate}%
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Workout Stats */}
            <Card className="card-hover rounded-xl border border-transparent bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-950/40 dark:to-sky-950/30 dark:border-blue-800/30">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-blue-700 dark:text-blue-300">
                  Тренировки
                </CardTitle>
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
                  <Dumbbell className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xl font-bold tabular-nums">{workoutCount}</p>
                <div className="mt-1 flex items-center gap-1">
                  <Flame className="h-3 w-3 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    Всего минут:{' '}
                    <span className="font-medium tabular-nums text-blue-600 dark:text-blue-400">
                      {totalMinutes}
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Habits Stats */}
            <Card className="card-hover rounded-xl border border-transparent bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/40 dark:to-purple-950/30 dark:border-violet-800/30">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-violet-700 dark:text-violet-300">
                  Привычки
                </CardTitle>
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/50">
                  <Target className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xl font-bold tabular-nums">{habitsRate}%</p>
                <div className="mt-1 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    {completedHabits} из {totalHabits} сегодня
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* ── Charts Row: Mood + Spending ─────────────────────────────────── */}
      <div className="stagger-children grid gap-4 lg:grid-cols-2">
        {/* Mood Trend */}
        {loading ? (
          <SkeletonChart />
        ) : (
          <Card className="card-hover rounded-xl border">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Smile className="h-4 w-4 text-emerald-500" />
                Тренд настроения
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Среднее настроение по {period === 'week' ? 'дням' : period === 'month' ? 'неделям' : 'месяцам'}
              </p>
            </CardHeader>
            <CardContent>
              {moodChartData.every((d) => d.mood === 0) ? (
                <div className="flex h-[250px] items-center justify-center rounded-lg bg-muted/30">
                  <div className="text-center">
                    <Smile className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">Нет данных о настроении</p>
                  </div>
                </div>
              ) : (
                <ChartContainer config={moodChartConfig} className="h-[250px] w-full">
                  <LineChart data={moodChartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      domain={[0, 5]}
                      ticks={[1, 2, 3, 4, 5]}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => MOOD_EMOJIS[v] || ''}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="mood"
                      stroke="var(--color-mood)"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: 'var(--color-mood)', strokeWidth: 2, stroke: 'var(--color-background)' }}
                      activeDot={{ r: 6, strokeWidth: 2 }}
                      connectNulls={false}
                    />
                  </LineChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        )}

        {/* Spending Trend */}
        {loading ? (
          <SkeletonChart />
        ) : (
          <Card className="card-hover rounded-xl border">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <TrendingDown className="h-4 w-4 text-amber-500" />
                Расходы и доходы
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Динамика за {period === 'week' ? 'последнюю неделю' : period === 'month' ? 'месяц по неделям' : 'год по месяцам'}
              </p>
            </CardHeader>
            <CardContent>
              {spendingChartData.every((d) => d.spending === 0 && d.income === 0) ? (
                <div className="flex h-[250px] items-center justify-center rounded-lg bg-muted/30">
                  <div className="text-center">
                    <Wallet className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">Нет финансовых данных</p>
                  </div>
                </div>
              ) : (
                <ChartContainer config={spendingChartConfig} className="h-[250px] w-full">
                  <AreaChart data={spendingChartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-spending)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--color-spending)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-income)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--color-income)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}к` : String(v)}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value, name) => (
                            <span className="tabular-nums">
                              {formatCurrency(value as number)}
                            </span>
                          )}
                        />
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="income"
                      stroke="var(--color-income)"
                      fill="url(#incomeGradient)"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Area
                      type="monotone"
                      dataKey="spending"
                      stroke="var(--color-spending)"
                      fill="url(#spendingGradient)"
                      strokeWidth={2}
                      dot={false}
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                  </AreaChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── Nutrition Summary + Workout Distribution ────────────────────── */}
      <div className="stagger-children grid gap-4 lg:grid-cols-2">
        {/* Nutrition Summary */}
        {loading ? (
          <SkeletonChart />
        ) : (
          <Card className="card-hover rounded-xl border">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Apple className="h-4 w-4 text-orange-500" />
                Среднее питание за день
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Средние значения за {nutritionSummary.daysWithData} {nutritionSummary.daysWithData === 1 ? 'день' : nutritionSummary.daysWithData < 5 ? 'дня' : 'дней'}
              </p>
            </CardHeader>
            <CardContent>
              {nutritionSummary.daysWithData === 0 ? (
                <div className="flex h-[220px] items-center justify-center rounded-lg bg-muted/30">
                  <div className="text-center">
                    <Apple className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">Нет данных о питании</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-5 py-2">
                  {/* Calories */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Flame className="h-3.5 w-3.5 text-orange-500" />
                        <span className="text-sm font-medium">Калории</span>
                      </div>
                      <span className="text-sm font-semibold tabular-nums text-orange-600 dark:text-orange-400">
                        {nutritionSummary.avgKcal} <span className="text-xs font-normal text-muted-foreground">/ 2200 ккал</span>
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-orange-100 dark:bg-orange-900/30">
                      <div
                        className="h-full rounded-full bg-orange-500 transition-all duration-500"
                        style={{ width: `${Math.min((nutritionSummary.avgKcal / 2200) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Protein */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3.5 w-3.5 rounded-sm bg-emerald-500" />
                        <span className="text-sm font-medium">Белки</span>
                      </div>
                      <span className="text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                        {nutritionSummary.avgProtein}г <span className="text-xs font-normal text-muted-foreground">/ 150г</span>
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${Math.min((nutritionSummary.avgProtein / 150) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Fat */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3.5 w-3.5 rounded-sm bg-amber-500" />
                        <span className="text-sm font-medium">Жиры</span>
                      </div>
                      <span className="text-sm font-semibold tabular-nums text-amber-600 dark:text-amber-400">
                        {nutritionSummary.avgFat}г <span className="text-xs font-normal text-muted-foreground">/ 80г</span>
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-amber-100 dark:bg-amber-900/30">
                      <div
                        className="h-full rounded-full bg-amber-500 transition-all duration-500"
                        style={{ width: `${Math.min((nutritionSummary.avgFat / 80) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Carbs */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3.5 w-3.5 rounded-sm bg-blue-500" />
                        <span className="text-sm font-medium">Углеводы</span>
                      </div>
                      <span className="text-sm font-semibold tabular-nums text-blue-600 dark:text-blue-400">
                        {nutritionSummary.avgCarbs}г <span className="text-xs font-normal text-muted-foreground">/ 250г</span>
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-blue-100 dark:bg-blue-900/30">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-all duration-500"
                        style={{ width: `${Math.min((nutritionSummary.avgCarbs / 250) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Workout Distribution */}
        {loading ? (
          <SkeletonChart />
        ) : (
          <Card className="card-hover rounded-xl border">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Dumbbell className="h-4 w-4 text-blue-500" />
                Распределение тренировок
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                По типам ({workoutCount} {workoutCount === 1 ? 'тренировка' : workoutCount < 5 ? 'тренировки' : 'тренировок'})
              </p>
            </CardHeader>
            <CardContent>
              {workoutDistribution.length === 0 ? (
                <div className="flex h-[220px] items-center justify-center rounded-lg bg-muted/30">
                  <div className="text-center">
                    <Dumbbell className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">Нет данных о тренировках</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-start sm:gap-4">
                  <ChartContainer config={workoutPieConfig} className="h-[200px] w-[200px] shrink-0">
                    <PieChart>
                      <Pie
                        data={workoutDistribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        strokeWidth={2}
                      >
                        {workoutDistribution.map((entry, index) => (
                          <Cell key={index} fill={entry.fill} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ChartContainer>
                  <div className="flex flex-col gap-2">
                    {workoutDistribution.map((entry) => (
                      <div key={entry.name} className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 shrink-0 rounded-sm"
                          style={{ backgroundColor: entry.fill }}
                        />
                        <span className="text-sm text-muted-foreground">{entry.name}</span>
                        <Badge variant="secondary" className="ml-auto tabular-nums text-xs">
                          {entry.value}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── Top Categories + Habits Heatmap ─────────────────────────────── */}
      <div className="stagger-children grid gap-4 lg:grid-cols-2">
        {/* Top Expense Categories */}
        {loading ? (
          <SkeletonChart />
        ) : (
          <Card className="card-hover rounded-xl border">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <TrendingUp className="h-4 w-4 text-amber-500" />
                Топ-5 категорий расходов
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topCategories.length === 0 ? (
                <div className="flex h-[250px] items-center justify-center rounded-lg bg-muted/30">
                  <div className="text-center">
                    <Wallet className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">Нет данных о расходах</p>
                  </div>
                </div>
              ) : (
                <ChartContainer config={categoryBarConfig} className="h-[250px] w-full">
                  <BarChart data={topCategories} layout="vertical" margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis
                      type="number"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}к` : String(v)}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11 }}
                      width={100}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) => (
                            <span className="tabular-nums">{formatCurrency(value as number)}</span>
                          )}
                        />
                      }
                    />
                    <Bar dataKey="amount" radius={[0, 6, 6, 0]} maxBarSize={28}>
                      {topCategories.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        )}

        {/* Habits Heatmap */}
        {loading ? (
          <SkeletonChart />
        ) : (
          <Card className="card-hover rounded-xl border">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Target className="h-4 w-4 text-violet-500" />
                Карта привычек
              </CardTitle>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Последние 30 дней
                </p>
                <Badge
                  variant="secondary"
                  className="tabular-nums text-xs"
                >
                  {heatmapCompletionRate}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {totalHabits === 0 ? (
                <div className="flex h-[250px] items-center justify-center rounded-lg bg-muted/30">
                  <div className="text-center">
                    <Target className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">Нет активных привычек</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 py-2">
                  {/* Heatmap Grid */}
                  <div className="grid grid-cols-10 gap-1.5">
                    {habitsHeatmap.map((cell) => (
                      <div
                        key={cell.date}
                        title={`${cell.date}: ${cell.completed ? 'Выполнено' : 'Не выполнено'}`}
                        className={`flex h-7 w-full items-center justify-center rounded-md text-[10px] tabular-nums transition-colors ${
                          cell.completed
                            ? 'bg-emerald-500 text-white font-medium'
                            : 'bg-muted/50 text-muted-foreground dark:bg-muted/30'
                        }`}
                      >
                        {cell.day}
                      </div>
                    ))}
                  </div>

                  {/* Legend */}
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <div className="h-3 w-3 rounded-sm bg-emerald-500" />
                      <span className="text-xs text-muted-foreground">Выполнено</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-3 w-3 rounded-sm bg-muted/50 dark:bg-muted/30" />
                      <span className="text-xs text-muted-foreground">Не выполнено</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-around rounded-lg bg-muted/30 px-4 py-3">
                    <div className="text-center">
                      <p className="text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                        {habitsHeatmap.filter((h) => h.completed).length}
                      </p>
                      <p className="text-[11px] text-muted-foreground">дней с привычками</p>
                    </div>
                    <div className="h-8 w-px bg-border" />
                    <div className="text-center">
                      <p className="text-lg font-bold tabular-nums text-red-500">
                        {habitsHeatmap.filter((h) => !h.completed).length}
                      </p>
                      <p className="text-[11px] text-muted-foreground">пропущено</p>
                    </div>
                    <div className="h-8 w-px bg-border" />
                    <div className="text-center">
                      <p className="text-lg font-bold tabular-nums text-foreground">
                        {habits.filter((h) => h.streak > 0).length}
                      </p>
                      <p className="text-[11px] text-muted-foreground">серия активна</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
