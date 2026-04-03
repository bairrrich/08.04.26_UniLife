'use client'

import { useEffect, useState, useCallback } from 'react'
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

  // ── Data Fetching ──────────────────────────────────────────────────────
  const fetchAllData = useCallback(async () => {
    setLoading(true)
    const currentMonth = getCurrentMonthStr()
    const today = getTodayStr()
    const { from, to } = getWeekRange()

    const requests = [
      fetch(`/api/diary?month=${currentMonth}`).then((r) => r.json()),
      fetch('/api/finance/stats').then((r) => r.json()),
      fetch(`/api/nutrition/stats?date=${today}`).then((r) => r.json()),
      fetch(`/api/workout?month=${currentMonth}`).then((r) => r.json()),
      fetch('/api/feed?limit=5').then((r) => r.json()),
      fetch(`/api/diary?from=${from}&to=${to}`).then((r) => r.json()),
    ]

    try {
      const [diaryMonthRes, financeRes, nutritionRes, workoutRes, feedRes, diaryWeekRes] =
        await Promise.allSettled(requests)

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
      if (financeRes.status === 'fulfilled' && financeRes.value.totalIncome !== undefined) {
        setFinanceStats(financeRes.value)
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
  const quickActions: { label: string; icon: React.ReactNode; module: AppModule }[] = [
    { label: 'Новая запись', icon: <Plus className="h-4 w-4" />, module: 'diary' },
    { label: 'Добавить расход', icon: <TrendingDown className="h-4 w-4" />, module: 'finance' },
    { label: 'Записать приём пищи', icon: <Utensils className="h-4 w-4" />, module: 'nutrition' },
    { label: 'Новая тренировка', icon: <Dumbbell className="h-4 w-4" />, module: 'workout' },
  ]

  // ── Feed item icon by entityType ───────────────────────────────────────
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

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Привет, Пользователь! 👋
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

      {/* ── Stats Cards Grid ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Дневник */}
        {loading ? (
          <Skeleton className="h-[120px] rounded-xl" />
        ) : (
          <Card className="rounded-xl border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Дневник
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
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
                  <p className="text-xs text-muted-foreground">записей за неделю</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Финансы */}
        {loading ? (
          <Skeleton className="h-[120px] rounded-xl" />
        ) : (
          <Card className="rounded-xl border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Финансы
              </CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  <span className="text-sm font-semibold text-emerald-600">
                    {financeStats ? formatCurrency(financeStats.totalIncome) : '0 ₽'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingDown className="h-3 w-3 text-red-500" />
                  <span className="text-sm font-semibold text-red-600">
                    {financeStats ? formatCurrency(financeStats.totalExpense) : '0 ₽'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Питание */}
        {loading ? (
          <Skeleton className="h-[120px] rounded-xl" />
        ) : (
          <Card className="rounded-xl border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Питание
              </CardTitle>
              <Flame className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pt-0">
              <div>
                <p className="text-lg font-semibold">
                  {todayKcal.toLocaleString('ru-RU')}
                  <span className="text-sm font-normal text-muted-foreground">
                    {' '}/ {kcalGoal.toLocaleString('ru-RU')} ккал
                  </span>
                </p>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((todayKcal / kcalGoal) * 100, 100)}%`,
                      backgroundColor:
                        todayKcal > kcalGoal
                          ? 'hsl(var(--destructive))'
                          : 'hsl(var(--chart-1))',
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Тренировки */}
        {loading ? (
          <Skeleton className="h-[120px] rounded-xl" />
        ) : (
          <Card className="rounded-xl border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Тренировки
              </CardTitle>
              <Dumbbell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pt-0">
              <div>
                <p className="text-lg font-semibold">{workouts.length}</p>
                <p className="text-xs text-muted-foreground">тренировок в этом месяце</p>
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
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) => (
              <Button
                key={action.module}
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setActiveModule(action.module)}
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Charts Section ─────────────────────────────────────────────── */}
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
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : feedPosts.length > 0 ? (
            <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
              {feedPosts.map((post) => {
                const createdAt = new Date(post.createdAt)
                const timeAgo = getTimeAgo(createdAt)

                return (
                  <div
                    key={post.id}
                    className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50"
                  >
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      {getEntityIcon(post.entityType)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px]">
                          {getEntityTypeLabel(post.entityType)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{timeAgo}</span>
                      </div>
                      {post.caption && (
                        <p className="mt-1 line-clamp-2 text-sm text-foreground">
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
