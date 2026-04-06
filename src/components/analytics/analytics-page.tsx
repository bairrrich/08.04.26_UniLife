'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart3,
  CalendarDays,
  BookOpen,
  Dumbbell,
  Flame,
  Target,
  Inbox,
  Smile,
  Wallet,
  CheckCircle2,
  Library,
  TrendingUp,
  Activity,
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
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
import {
  AnimatedNumber,
} from '@/components/ui/animated-number'
import { RU_DAYS_SHORT, formatCurrency } from '@/lib/format'
import type { ChartConfig } from '@/components/ui/chart'

// ─── Types ────────────────────────────────────────────────────────────────────

type Period = '7d' | '30d' | '3m' | 'all'

interface Overview {
  totalDiaryEntries: number
  totalWorkouts: number
  totalCalories: number
  totalDaysTracked: number
  totalHabitsCompleted: number
  totalTransactions: number
}

interface MonthlyActivityItem {
  month: string
  year: number
  monthIdx: number
  diary: number
  workouts: number
  habits: number
  meals: number
}

interface MoodDistItem {
  mood: number
  emoji: string
  label: string
  count: number
  percentage: number
}

interface TopCategoryItem {
  name: string
  amount: number
  color: string
}

interface HabitTrendItem {
  week: string
  rate: number
}

interface CollectionsDistItem {
  type: string
  count: number
}

interface HeatmapCell {
  weekIdx: number
  dayIdx: number
  date: string
  count: number
  dayNum: number
}

interface AnalyticsData {
  overview: Overview
  monthlyActivity: MonthlyActivityItem[]
  moodDistribution: MoodDistItem[]
  topCategories: TopCategoryItem[]
  habitCompletionTrend: HabitTrendItem[]
  collectionsDistribution: CollectionsDistItem[]
  weeklyHeatmap: { cells: HeatmapCell[]; maxCount: number }
}

// ─── Chart configs ────────────────────────────────────────────────────────────

const monthlyChartConfig: ChartConfig = {
  diary: { label: 'Дневник', color: '#3b82f6' },
  workouts: { label: 'Тренировки', color: '#ef4444' },
  habits: { label: 'Привычки', color: '#10b981' },
  meals: { label: 'Питание', color: '#f97316' },
}

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#64748b']

const MOOD_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981']

const COLLECTION_COLORS = ['#3b82f6', '#ef4444', '#a855f7', '#f97316', '#10b981', '#ec4899', '#14b8a6', '#f59e0b', '#64748b']

const habitChartConfig: ChartConfig = {
  rate: { label: 'Выполнение', color: '#10b981' },
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>('30d')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<AnalyticsData | null>(null)

  const fetchData = useCallback(async (p: Period) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/analytics?period=${p}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      if (json.success && json.data) {
        setData(json.data)
      }
    } catch (err) {
      console.error('Analytics fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData(period)
  }, [period, fetchData])

  const hasData = data && (
    data.overview.totalDiaryEntries > 0 ||
    data.overview.totalWorkouts > 0 ||
    data.overview.totalCalories > 0 ||
    data.overview.totalHabitsCompleted > 0 ||
    data.overview.totalTransactions > 0
  )

  const periodLabel = useMemo(() => {
    switch (period) {
      case '7d': return '7 дней'
      case '30d': return '30 дней'
      case '3m': return '3 месяца'
      case 'all': return 'Всё время'
      default: return '30 дней'
    }
  }, [period])

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="animate-slide-up space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-gradient-to-br from-blue-400/20 to-violet-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 top-0 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-400/15 to-teal-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 shadow-sm">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight">Аналитика</h1>
                  <Badge variant="secondary" className="hidden gap-1 text-[10px] font-normal sm:inline-flex">
                    <CalendarDays className="h-2.5 w-2.5" />
                    {periodLabel}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Полная статистика по всем модулям
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
              <TabsTrigger value="7d" className="text-xs sm:text-sm">7 дней</TabsTrigger>
              <TabsTrigger value="30d" className="text-xs sm:text-sm">30 дней</TabsTrigger>
              <TabsTrigger value="3m" className="text-xs sm:text-sm">3 месяца</TabsTrigger>
              <TabsTrigger value="all" className="text-xs sm:text-sm">Всё время</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* ── Empty State ─────────────────────────────────────────────────── */}
      {!loading && !hasData && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-muted-foreground/25 bg-gradient-to-b from-muted/30 to-transparent py-16">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-400/20 to-violet-500/20">
            <Inbox className="h-8 w-8 text-muted-foreground/60" />
          </div>
          <h3 className="mb-1 text-lg font-semibold text-muted-foreground">Нет данных</h3>
          <p className="max-w-xs text-center text-sm text-muted-foreground/70">
            Начните вести дневник, добавлять расходы или тренировки, чтобы увидеть аналитику
          </p>
        </div>
      )}

      {/* ── Content ─────────────────────────────────────────────────────── */}
      {(loading || hasData) && (
        <>
          {/* ── 1. Overview Stats Cards ──────────────────────────────────── */}
          <OverviewStatsCards loading={loading} data={data} />

          {/* ── 2. Monthly Activity Chart ────────────────────────────────── */}
          <MonthlyActivityChart loading={loading} data={data} />

          {/* ── 3 & 4. Mood Distribution + Top Categories ────────────────── */}
          <div className="stagger-children grid gap-4 lg:grid-cols-2">
            <MoodDistributionChart loading={loading} data={data} />
            <TopCategoriesChart loading={loading} data={data} />
          </div>

          {/* ── 5. Habit Completion Trend ───────────────────────────────── */}
          <HabitCompletionTrend loading={loading} data={data} />

          {/* ── 6. Collections Distribution ──────────────────────────────── */}
          <CollectionsDistribution loading={loading} data={data} />

          {/* ── 7. Weekly Heatmap ────────────────────────────────────────── */}
          <WeeklyHeatmapSection loading={loading} data={data} />
        </>
      )}
    </div>
  )
}

// ─── 1. Overview Stats Cards ──────────────────────────────────────────────────

function OverviewStatsCards({ loading, data }: { loading: boolean; data: AnalyticsData | null }) {
  const cards = [
    {
      label: 'Записи в дневнике',
      value: data?.overview.totalDiaryEntries ?? 0,
      icon: BookOpen,
      gradient: 'from-emerald-500/10 to-teal-500/10',
      borderGrad: 'from-emerald-400 to-teal-500',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/50',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      textColor: 'text-emerald-700 dark:text-emerald-300',
    },
    {
      label: 'Тренировки',
      value: data?.overview.totalWorkouts ?? 0,
      icon: Dumbbell,
      gradient: 'from-blue-500/10 to-sky-500/10',
      borderGrad: 'from-blue-400 to-sky-500',
      iconBg: 'bg-blue-100 dark:bg-blue-900/50',
      iconColor: 'text-blue-600 dark:text-blue-400',
      textColor: 'text-blue-700 dark:text-blue-300',
    },
    {
      label: 'Калории потреблено',
      value: data?.overview.totalCalories ?? 0,
      icon: Flame,
      gradient: 'from-orange-500/10 to-amber-500/10',
      borderGrad: 'from-orange-400 to-amber-500',
      iconBg: 'bg-orange-100 dark:bg-orange-900/50',
      iconColor: 'text-orange-600 dark:text-orange-400',
      textColor: 'text-orange-700 dark:text-orange-300',
      suffix: ' ккал',
    },
    {
      label: 'Дней отслеживания',
      value: data?.overview.totalDaysTracked ?? 0,
      icon: CalendarDays,
      gradient: 'from-violet-500/10 to-purple-500/10',
      borderGrad: 'from-violet-400 to-purple-500',
      iconBg: 'bg-violet-100 dark:bg-violet-900/50',
      iconColor: 'text-violet-600 dark:text-violet-400',
      textColor: 'text-violet-700 dark:text-violet-300',
    },
    {
      label: 'Привычки выполнены',
      value: data?.overview.totalHabitsCompleted ?? 0,
      icon: Target,
      gradient: 'from-pink-500/10 to-rose-500/10',
      borderGrad: 'from-pink-400 to-rose-500',
      iconBg: 'bg-pink-100 dark:bg-pink-900/50',
      iconColor: 'text-pink-600 dark:text-pink-400',
      textColor: 'text-pink-700 dark:text-pink-300',
    },
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="rounded-xl border">
            <CardContent className="p-4">
              <div className="skeleton-shimmer mb-3 h-4 w-24 rounded-md" />
              <div className="skeleton-shimmer h-8 w-16 rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="stagger-children grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card
            key={card.label}
            className={`card-hover relative overflow-hidden rounded-xl border border-transparent bg-gradient-to-br ${card.gradient} dark:border-white/5`}
          >
            <div className={`absolute left-0 top-0 h-full w-1 rounded-l-xl bg-gradient-to-b ${card.borderGrad}`} />
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">{card.label}</p>
                <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${card.iconBg}`}>
                  <Icon className={`h-3.5 w-3.5 ${card.iconColor}`} />
                </div>
              </div>
              <p className={`mt-2 text-xl font-bold tabular-nums ${card.textColor}`}>
                <AnimatedNumber value={card.value} />
                {card.suffix && <span className="text-sm font-medium">{card.suffix}</span>}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

// ─── 2. Monthly Activity Chart ────────────────────────────────────────────────

function MonthlyActivityChart({ loading, data }: { loading: boolean; data: AnalyticsData | null }) {
  if (loading) {
    return (
      <Card className="rounded-xl border">
        <CardContent className="p-4">
          <div className="skeleton-shimmer mb-4 h-5 w-48 rounded-md" />
          <div className="skeleton-shimmer h-[300px] rounded-md" />
        </CardContent>
      </Card>
    )
  }

  const chartData = data?.monthlyActivity ?? []

  return (
    <Card className="card-hover rounded-xl border">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Activity className="h-4 w-4 text-blue-500" />
          Активность по месяцам
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Количество записей по модулям за последние 12 месяцев
        </p>
      </CardHeader>
      <CardContent>
        {chartData.every((d) => d.diary === 0 && d.workouts === 0 && d.habits === 0 && d.meals === 0) ? (
          <div className="flex h-[300px] items-center justify-center rounded-lg bg-muted/30">
            <div className="text-center">
              <Activity className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Нет данных об активности</p>
            </div>
          </div>
        ) : (
          <ChartContainer config={monthlyChartConfig} className="h-[300px] w-full">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
                allowDecimals={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Line type="monotone" dataKey="diary" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="Дневник" />
              <Line type="monotone" dataKey="workouts" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} name="Тренировки" />
              <Line type="monotone" dataKey="habits" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Привычки" />
              <Line type="monotone" dataKey="meals" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} name="Питание" />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

// ─── 3. Mood Distribution ────────────────────────────────────────────────────

function MoodDistributionChart({ loading, data }: { loading: boolean; data: AnalyticsData | null }) {
  if (loading) {
    return (
      <Card className="rounded-xl border">
        <CardContent className="p-4">
          <div className="skeleton-shimmer mb-4 h-5 w-40 rounded-md" />
          <div className="skeleton-shimmer h-[260px] rounded-md" />
        </CardContent>
      </Card>
    )
  }

  const moodData = data?.moodDistribution ?? []
  const hasMoodData = moodData.some((d) => d.count > 0)

  // For the donut chart, filter out zero values
  const chartData = moodData.filter((d) => d.count > 0)

  return (
    <Card className="card-hover rounded-xl border">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Smile className="h-4 w-4 text-amber-500" />
          Распределение настроений
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Настроения из дневника
        </p>
      </CardHeader>
      <CardContent>
        {!hasMoodData ? (
          <div className="flex h-[260px] items-center justify-center rounded-lg bg-muted/30">
            <div className="text-center">
              <Smile className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Нет данных о настроениях</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="h-[200px] w-[200px] shrink-0">
              <ChartContainer config={{ value: { label: 'Записи', color: '#f59e0b' } }} className="h-[200px] w-[200px]">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="emoji"
                    stroke="none"
                  >
                    {chartData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={MOOD_COLORS[Math.min(Math.max(entry.mood - 1, 0), MOOD_COLORS.length - 1)]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<MoodTooltip />} />
                </PieChart>
              </ChartContainer>
            </div>
            <div className="flex flex-1 flex-col gap-2.5">
              {moodData.map((item) => (
                <div key={item.mood} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{item.emoji}</span>
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold tabular-nums">{item.count}</span>
                    <span className="text-[10px] text-muted-foreground tabular-nums">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function MoodTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: MoodDistItem }> }) {
  if (active && payload && payload.length) {
    const item = payload[0].payload
    return (
      <div className="rounded-lg border bg-background p-2.5 shadow-md">
        <p className="text-sm font-semibold">
          {item.emoji} {item.label}: {item.count} ({item.percentage}%)
        </p>
      </div>
    )
  }
  return null
}

// ─── 4. Top Expense Categories ────────────────────────────────────────────────

function TopCategoriesChart({ loading, data }: { loading: boolean; data: AnalyticsData | null }) {
  if (loading) {
    return (
      <Card className="rounded-xl border">
        <CardContent className="p-4">
          <div className="skeleton-shimmer mb-4 h-5 w-40 rounded-md" />
          <div className="skeleton-shimmer h-[260px] rounded-md" />
        </CardContent>
      </Card>
    )
  }

  const categories = data?.topCategories ?? []
  const maxAmount = Math.max(...categories.map((c) => c.amount), 1)

  return (
    <Card className="card-hover rounded-xl border">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Wallet className="h-4 w-4 text-amber-500" />
          Топ категории расходов
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Наибольшие расходы по категориям
        </p>
      </CardHeader>
      <CardContent>
        {categories.length === 0 ? (
          <div className="flex h-[260px] items-center justify-center rounded-lg bg-muted/30">
            <div className="text-center">
              <Wallet className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Нет финансовых данных</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map((cat, idx) => (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: cat.color || PIE_COLORS[idx % PIE_COLORS.length] }}
                    />
                    <span className="text-xs font-medium">{cat.name}</span>
                  </div>
                  <span className="text-xs font-semibold tabular-nums">{formatCurrency(cat.amount)}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(cat.amount / maxAmount) * 100}%`,
                      backgroundColor: cat.color || PIE_COLORS[idx % PIE_COLORS.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── 5. Habit Completion Trend ────────────────────────────────────────────────

function HabitCompletionTrend({ loading, data }: { loading: boolean; data: AnalyticsData | null }) {
  if (loading) {
    return (
      <Card className="rounded-xl border">
        <CardContent className="p-4">
          <div className="skeleton-shimmer mb-4 h-5 w-48 rounded-md" />
          <div className="skeleton-shimmer h-[260px] rounded-md" />
        </CardContent>
      </Card>
    )
  }

  const trendData = data?.habitCompletionTrend ?? []
  const hasData = trendData.some((d) => d.rate > 0)

  return (
    <Card className="card-hover rounded-xl border">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          Тренд выполнения привычек
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Процент выполнения за последние 8 недель
        </p>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex h-[260px] items-center justify-center rounded-lg bg-muted/30">
            <div className="text-center">
              <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Нет данных о привычках</p>
            </div>
          </div>
        ) : (
          <ChartContainer config={habitChartConfig} className="h-[260px] w-full">
            <BarChart data={trendData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="habitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
              <XAxis
                dataKey="week"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10 }}
                angle={-20}
                textAnchor="end"
                height={50}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
              />
              <ChartTooltip content={<HabitTooltip />} />
              <Bar
                dataKey="rate"
                fill="url(#habitGrad)"
                radius={[6, 6, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

function HabitTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2.5 shadow-md">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold tabular-nums">{payload[0].value}%</p>
      </div>
    )
  }
  return null
}

// ─── 6. Collections Distribution ──────────────────────────────────────────────

function CollectionsDistribution({ loading, data }: { loading: boolean; data: AnalyticsData | null }) {
  if (loading) {
    return (
      <Card className="rounded-xl border">
        <CardContent className="p-4">
          <div className="skeleton-shimmer mb-4 h-5 w-48 rounded-md" />
          <div className="skeleton-shimmer h-[260px] rounded-md" />
        </CardContent>
      </Card>
    )
  }

  const collData = data?.collectionsDistribution ?? []
  const hasData = collData.length > 0

  const chartData = collData.filter((d) => d.count > 0)

  return (
    <Card className="card-hover rounded-xl border">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Library className="h-4 w-4 text-violet-500" />
          Коллекции по типам
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Распределение элементов по категориям
        </p>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex h-[260px] items-center justify-center rounded-lg bg-muted/30">
            <div className="text-center">
              <Library className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Нет данных о коллекциях</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="h-[200px] w-[200px] shrink-0">
              <ChartContainer config={{ value: { label: 'Элементов', color: '#8b5cf6' } }} className="h-[200px] w-[200px]">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={2}
                    dataKey="count"
                    nameKey="type"
                    stroke="none"
                  >
                    {chartData.map((_, idx) => (
                      <Cell key={`cell-${idx}`} fill={COLLECTION_COLORS[idx % COLLECTION_COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<CollectionsTooltip />} />
                </PieChart>
              </ChartContainer>
            </div>
            <div className="flex flex-1 flex-col gap-2.5">
              {collData.map((item, idx) => (
                <div key={item.type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: COLLECTION_COLORS[idx % COLLECTION_COLORS.length] }}
                    />
                    <span className="text-xs font-medium">{item.type}</span>
                  </div>
                  <span className="text-xs font-semibold tabular-nums">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function CollectionsTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: CollectionsDistItem }> }) {
  if (active && payload && payload.length) {
    const item = payload[0].payload
    return (
      <div className="rounded-lg border bg-background p-2.5 shadow-md">
        <p className="text-sm font-semibold">
          {item.type}: {item.count}
        </p>
      </div>
    )
  }
  return null
}

// ─── 7. Weekly Heatmap ────────────────────────────────────────────────────────

function WeeklyHeatmapSection({ loading, data }: { loading: boolean; data: AnalyticsData | null }) {
  if (loading) {
    return (
      <Card className="rounded-xl border">
        <CardContent className="p-4">
          <div className="skeleton-shimmer mb-4 h-5 w-48 rounded-md" />
          <div className="skeleton-shimmer h-[180px] rounded-md" />
        </CardContent>
      </Card>
    )
  }

  const heatmapData = data?.weeklyHeatmap ?? { cells: [], maxCount: 1 }
  const cells = heatmapData.cells
  const maxCount = heatmapData.maxCount || 1

  // Organize into grid: 12 weeks × 7 days
  const grid: HeatmapCell[][] = []
  for (let w = 0; w < 12; w++) {
    const weekCells = cells.filter((c) => c.weekIdx === w).sort((a, b) => a.dayIdx - b.dayIdx)
    grid.push(weekCells)
  }

  const getHeatColor = (count: number) => {
    if (count === 0) return 'bg-muted/40 dark:bg-muted/20'
    const intensity = count / maxCount
    if (intensity <= 0.25) return 'bg-emerald-200 dark:bg-emerald-900/60'
    if (intensity <= 0.5) return 'bg-emerald-300 dark:bg-emerald-700/70'
    if (intensity <= 0.75) return 'bg-emerald-500 dark:bg-emerald-500/80'
    return 'bg-emerald-700 dark:bg-emerald-400'
  }

  return (
    <Card className="card-hover rounded-xl border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              Тепловая карта активности
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Последние 12 недель — интенсивность активности по дням
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span>Меньше</span>
            <div className="h-3 w-3 rounded-sm bg-muted/40 dark:bg-muted/20" />
            <div className="h-3 w-3 rounded-sm bg-emerald-200 dark:bg-emerald-900/60" />
            <div className="h-3 w-3 rounded-sm bg-emerald-300 dark:bg-emerald-700/70" />
            <div className="h-3 w-3 rounded-sm bg-emerald-500 dark:bg-emerald-500/80" />
            <div className="h-3 w-3 rounded-sm bg-emerald-700 dark:bg-emerald-400" />
            <span>Больше</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-flex flex-col gap-1 min-w-fit">
            {/* Day labels + grid */}
            {RU_DAYS_SHORT.map((dayLabel, dayIdx) => (
              <div key={dayLabel} className="flex items-center gap-1">
                <span className="w-7 text-right text-[10px] text-muted-foreground pr-1">{dayLabel}</span>
                {grid.map((weekCells, weekIdx) => {
                  const cell = weekCells.find((c) => c.dayIdx === dayIdx)
                  const isFuture = cell ? new Date(cell.date) > new Date() : false
                  return (
                    <div
                      key={`${weekIdx}-${dayIdx}`}
                      className={`h-3.5 w-3.5 rounded-sm transition-colors ${isFuture ? 'bg-muted/10' : getHeatColor(cell?.count ?? 0)}`}
                      title={cell ? `${cell.date}: ${cell.count} действий` : ''}
                    />
                  )
                })}
              </div>
            ))}
            {/* Week numbers */}
            <div className="mt-0.5 flex items-center gap-1 pl-8">
              {grid.map((weekCells, weekIdx) => (
                <div key={weekIdx} className="w-3.5 text-center text-[8px] text-muted-foreground/50">
                  {weekCells.length > 0 ? weekCells[0].dayNum : ''}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
