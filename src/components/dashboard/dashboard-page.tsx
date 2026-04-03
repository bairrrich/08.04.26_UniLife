'use client'

import { useEffect, useState, useCallback } from 'react'
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
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
  const diff = day === 0 ? 6 : day - 1 // Monday-based week
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

  // ── Data Fetching ──────────────────────────────────────────────────────
  const fetchAllData = useCallback(async () => {
    setLoading(true)
    const currentMonth = getCurrentMonthStr()
    const today = getTodayStr()
    const { from, to } = getWeekRange()

    const requests = [
      fetch(`/api/diary?month=${currentMonth}`).then((r) => r.json()),
      fetch(`/api/finance/stats?month=${currentMonth}`).then((r) => r.json()),
      fetch(`/api/nutrition/stats?date=${today}`).then((r) => r.json()),
      fetch(`/api/workout?month=${currentMonth}`).then((r) => r.json()),
      fetch('/api/feed?limit=5').then((r) => r.json()),
      fetch(`/api/diary?from=${from}&to=${to}`).then((r) => r.json()),
      fetch(`/api/finance?month=${currentMonth}`).then((r) => r.json()),
    ]

    try {
      const [
        diaryMonthRes,
        financeRes,
        nutritionRes,
        workoutRes,
        feedRes,
        diaryWeekRes,
        financeTransactionsRes,
      ] = await Promise.allSettled(requests)

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
            const dayIndex = d.getDay() === 0 ? 6 : d.getDay() - 1 // Mon=0
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

      // Finance transactions for weekly spending
      if (
        financeTransactionsRes.status === 'fulfilled' &&
        financeTransactionsRes.value.success &&
        financeTransactionsRes.value.data
      ) {
        const transactions = financeTransactionsRes.value.data as Transaction[]
        const { from: week7From } = getLast7DaysRange()
        const now = new Date()

        // Build last 7 days map
        const dailySpending = new Map<string, number>()
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now)
          d.setDate(now.getDate() - i)
          d.setHours(0, 0, 0, 0)
          const dateStr = d.toISOString().split('T')[0]
          const dayIndex = d.getDay() === 0 ? 6 : d.getDay() - 1
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

  // Nutrition goal (default 2200 kcal)
  const kcalGoal = 2200
  const todayKcal = nutritionStats?.totalKcal ?? 0

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

  // ── Feed item icon & color by entityType ───────────────────────────────
  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'diary':
        return <BookOpen className="h-4 w-4 text-blue-500" />
      case 'workout':
        return <Dumbbell className="h-4 w-4 text-orange-500" />
      case 'meal':
        return <Apple className="h-4 w-4 text-green-500" />
      case 'transaction':
        return <Wallet className="h-4 w-4 text-yellow-500" />
      default:
        return <Heart className="h-4 w-4 text-pink-500" />
    }
  }

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
    <div className="space-y-8">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden">
        {/* Decorative gradient blob */}
        <div className="pointer-events-none absolute -right-20 -top-16 h-64 w-64 rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 top-8 h-40 w-40 rounded-full bg-gradient-to-br from-amber-400/15 to-orange-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Привет, Алексей! 👋
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
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Дневник */}
        {loading ? (
          <Skeleton className="h-[130px] rounded-xl" />
        ) : (
          <Card className="group rounded-xl border border-transparent bg-gradient-to-br from-emerald-50 to-teal-50 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg dark:from-emerald-950/40 dark:to-teal-950/30 dark:border-emerald-800/30">
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
                  <p className="text-lg font-semibold">
                    {weekEntryCount}
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
          <Card className="group rounded-xl border border-transparent bg-gradient-to-br from-amber-50 to-yellow-50 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg dark:from-amber-950/40 dark:to-yellow-950/30 dark:border-amber-800/30">
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
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    {financeStats ? formatCurrency(financeStats.totalIncome) : '0 ₽'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingDown className="h-3 w-3 text-red-500" />
                  <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                    {financeStats ? formatCurrency(financeStats.totalExpense) : '0 ₽'}
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
          <Card className="group rounded-xl border border-transparent bg-gradient-to-br from-orange-50 to-amber-50 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg dark:from-orange-950/40 dark:to-amber-950/30 dark:border-orange-800/30">
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
                <p className="text-lg font-semibold">
                  {todayKcal.toLocaleString('ru-RU')}
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
          <Card className="group rounded-xl border border-transparent bg-gradient-to-br from-blue-50 to-sky-50 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg dark:from-blue-950/40 dark:to-sky-950/30 dark:border-blue-800/30">
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
                <p className="text-lg font-semibold">{workouts.length}</p>
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
                className="group flex items-center gap-2.5 rounded-xl border bg-accent px-4 py-3 text-sm font-medium transition-all duration-200 hover:scale-[1.03] hover:bg-accent/80 hover:shadow-md active:scale-[0.98]"
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
    </div>
  )
}

// ─── Utility ──────────────────────────────────────────────────────────────────

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMinutes < 1) return 'только что'
  if (diffMinutes < 60) return `${diffMinutes} мин. назад`
  if (diffHours < 24) return `${diffHours} ч. назад`
  if (diffDays < 7) return `${diffDays} дн. назад`
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}
