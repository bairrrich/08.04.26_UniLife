'use client'

import { useState, useMemo, useCallback, memo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Brain, RefreshCw, BookOpen, Dumbbell, Wallet, Target, Droplets, Smile, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────────────────

interface AiInsightsWidgetProps {
  loading?: boolean
  weekEntryCount?: number
  weekWorkoutCount?: number
  transactionsData?: Array<{ type: string; amount: number; date: string }>
  habitsPercentage?: number
  habitsTotal?: number
  habitsCompleted?: number
  waterTodayMl?: number
  recentMoods?: Array<{ date: string; mood: number | null }>
  weekExpenseSum?: number
}

type InsightCategory = 'diary' | 'workout' | 'finance' | 'habits' | 'water' | 'mood' | 'general'

interface Insight {
  id: string
  category: InsightCategory
  icon: React.ReactNode
  text: string
  borderGradient: string
  accentBg: string
  accentText: string
}

// ── Category Visual Config ─────────────────────────────────────────────

const CATEGORY_CONFIG: Record<InsightCategory, {
  icon: React.ReactNode
  borderGradient: string
  accentBg: string
  accentText: string
  label: string
}> = {
  diary: {
    icon: <BookOpen className="h-4 w-4" />,
    borderGradient: 'from-emerald-400 via-emerald-500 to-teal-500',
    accentBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    accentText: 'text-emerald-600 dark:text-emerald-400',
    label: 'Дневник',
  },
  workout: {
    icon: <Dumbbell className="h-4 w-4" />,
    borderGradient: 'from-blue-400 via-blue-500 to-cyan-500',
    accentBg: 'bg-blue-100 dark:bg-blue-900/30',
    accentText: 'text-blue-600 dark:text-blue-400',
    label: 'Тренировки',
  },
  finance: {
    icon: <Wallet className="h-4 w-4" />,
    borderGradient: 'from-amber-400 via-orange-500 to-red-400',
    accentBg: 'bg-amber-100 dark:bg-amber-900/30',
    accentText: 'text-amber-600 dark:text-amber-400',
    label: 'Финансы',
  },
  habits: {
    icon: <Target className="h-4 w-4" />,
    borderGradient: 'from-violet-400 via-violet-500 to-purple-500',
    accentBg: 'bg-violet-100 dark:bg-violet-900/30',
    accentText: 'text-violet-600 dark:text-violet-400',
    label: 'Привычки',
  },
  water: {
    icon: <Droplets className="h-4 w-4" />,
    borderGradient: 'from-sky-400 via-cyan-400 to-teal-400',
    accentBg: 'bg-sky-100 dark:bg-sky-900/30',
    accentText: 'text-sky-600 dark:text-sky-400',
    label: 'Гидратация',
  },
  mood: {
    icon: <Smile className="h-4 w-4" />,
    borderGradient: 'from-rose-400 via-pink-400 to-fuchsia-400',
    accentBg: 'bg-rose-100 dark:bg-rose-900/30',
    accentText: 'text-rose-600 dark:text-rose-400',
    label: 'Настроение',
  },
  general: {
    icon: <Sparkles className="h-4 w-4" />,
    borderGradient: 'from-slate-300 via-gray-400 to-zinc-400',
    accentBg: 'bg-slate-100 dark:bg-slate-900/30',
    accentText: 'text-slate-600 dark:text-slate-400',
    label: 'Совет дня',
  },
}

// ── Insight Generation (Pure Functions) ────────────────────────────────

function generateDiaryInsight(count: number): Insight | null {
  const cfg = CATEGORY_CONFIG.diary
  if (count === 0) {
    return {
      id: 'diary-0',
      category: 'diary',
      icon: cfg.icon,
      text: 'На этой неделе ещё нет записей в дневнике. Попробуйте написать хотя бы пару строк о своих мыслях и чувствах 📝',
      borderGradient: cfg.borderGradient,
      accentBg: cfg.accentBg,
      accentText: cfg.accentText,
    }
  }
  if (count < 3) {
    return {
      id: 'diary-low',
      category: 'diary',
      icon: cfg.icon,
      text: `Вы писали в дневник лишь ${count} ${count === 1 ? 'раз' : 'раза'} на этой неделе. Регулярные записи помогают отслеживать эмоции 📝`,
      borderGradient: cfg.borderGradient,
      accentBg: cfg.accentBg,
      accentText: cfg.accentText,
    }
  }
  if (count >= 5) {
    return {
      id: 'diary-high',
      category: 'diary',
      icon: cfg.icon,
      text: `${count} записей в дневнике за неделю — отличная дисциплина! Продолжайте документировать свой путь 📖`,
      borderGradient: cfg.borderGradient,
      accentBg: cfg.accentBg,
      accentText: cfg.accentText,
    }
  }
  return null
}

function generateWorkoutInsight(count: number): Insight | null {
  const cfg = CATEGORY_CONFIG.workout
  if (count > 3) {
    return {
      id: 'workout-great',
      category: 'workout',
      icon: cfg.icon,
      text: `Отличная неделя тренировок! ${count} занятий — это впечатляющий результат 🏋️`,
      borderGradient: cfg.borderGradient,
      accentBg: cfg.accentBg,
      accentText: cfg.accentText,
    }
  }
  if (count === 0) {
    return {
      id: 'workout-none',
      category: 'workout',
      icon: cfg.icon,
      text: 'На этой неделе ещё не было тренировок. Даже 15 минут активности улучшат ваше самочувствие 🏃',
      borderGradient: cfg.borderGradient,
      accentBg: cfg.accentBg,
      accentText: cfg.accentText,
    }
  }
  return null
}

function generateFinanceInsight(
  transactions: Array<{ type: string; amount: number; date: string }>,
  weekExpenseSum: number,
): Insight | null {
  if (!transactions.length) return null
  const cfg = CATEGORY_CONFIG.finance

  const now = new Date()
  const thisWeekStart = new Date(now)
  thisWeekStart.setDate(now.getDate() - 7)
  thisWeekStart.setHours(0, 0, 0, 0)

  const lastWeekStart = new Date(thisWeekStart)
  lastWeekStart.setDate(thisWeekStart.getDate() - 7)
  const lastWeekEnd = new Date(thisWeekStart)

  const lastWeekExpenses = transactions
    .filter((t) => {
      if (t.type !== 'EXPENSE') return false
      const d = new Date(t.date).getTime()
      return d >= lastWeekStart.getTime() && d < lastWeekEnd.getTime()
    })
    .reduce((sum, t) => sum + t.amount, 0)

  if (lastWeekExpenses > 0) {
    const changePercent = Math.round(((weekExpenseSum - lastWeekExpenses) / lastWeekExpenses) * 100)
    if (changePercent > 15) {
      return {
        id: 'finance-up',
        category: 'finance',
        icon: cfg.icon,
        text: `Расходы выросли на ${changePercent}% по сравнению с прошлой неделей. Проверьте бюджет 💰`,
        borderGradient: cfg.borderGradient,
        accentBg: cfg.accentBg,
        accentText: cfg.accentText,
      }
    }
    if (changePercent < -15) {
      return {
        id: 'finance-down',
        category: 'finance',
        icon: cfg.icon,
        text: `Расходы снизились на ${Math.abs(changePercent)}%! Отличная работа по экономии 💰`,
        borderGradient: cfg.borderGradient,
        accentBg: cfg.accentBg,
        accentText: cfg.accentText,
      }
    }
  }

  return null
}

function generateHabitsInsight(percentage: number, total: number, completed: number): Insight | null {
  if (total === 0) return null
  const cfg = CATEGORY_CONFIG.habits

  if (percentage >= 80) {
    return {
      id: 'habits-great',
      category: 'habits',
      icon: cfg.icon,
      text: `Привычки выполняются на ${percentage}%! Вы на пути к формированию полезных привычек 🎯`,
      borderGradient: cfg.borderGradient,
      accentBg: cfg.accentBg,
      accentText: cfg.accentText,
    }
  }
  if (percentage === 100) {
    return {
      id: 'habits-perfect',
      category: 'habits',
      icon: cfg.icon,
      text: `Все ${total} привычек выполнены! Идеальная дисциплина сегодня 🎯`,
      borderGradient: cfg.borderGradient,
      accentBg: cfg.accentBg,
      accentText: cfg.accentText,
    }
  }
  if (percentage > 0 && percentage < 50) {
    return {
      id: 'habits-low',
      category: 'habits',
      icon: cfg.icon,
      text: `Выполнено ${completed} из ${total} привычек. Есть над чем поработать, но вы уже начали! 🎯`,
      borderGradient: cfg.borderGradient,
      accentBg: cfg.accentBg,
      accentText: cfg.accentText,
    }
  }
  return null
}

function generateWaterInsight(ml: number): Insight | null {
  const cfg = CATEGORY_CONFIG.water
  const glasses = Math.round(ml / 250)
  const goalGlasses = 8

  if (glasses >= goalGlasses) {
    return {
      id: 'water-good',
      category: 'water',
      icon: cfg.icon,
      text: `Гидратация в норме! Вы выпили ${glasses} стаканов воды 💧`,
      borderGradient: cfg.borderGradient,
      accentBg: cfg.accentBg,
      accentText: cfg.accentText,
    }
  }
  if (glasses >= goalGlasses * 0.6) {
    return {
      id: 'water-almost',
      category: 'water',
      icon: cfg.icon,
      text: `Выпито ${glasses} из ${goalGlasses} стаканов. Ещё немного до дневной нормы! 💧`,
      borderGradient: cfg.borderGradient,
      accentBg: cfg.accentBg,
      accentText: cfg.accentText,
    }
  }
  if (glasses > 0 && glasses < goalGlasses * 0.6) {
    return {
      id: 'water-low',
      category: 'water',
      icon: cfg.icon,
      text: `Только ${glasses} стаканов воды за сегодня. Не забывайте пить regularly! 💧`,
      borderGradient: cfg.borderGradient,
      accentBg: cfg.accentBg,
      accentText: cfg.accentText,
    }
  }
  return null
}

function generateMoodInsight(recentMoods: Array<{ date: string; mood: number | null }>): Insight | null {
  const cfg = CATEGORY_CONFIG.mood
  const moodsWithData = recentMoods.filter((m) => m.mood !== null && m.mood > 0)
  if (moodsWithData.length === 0) return null

  const avgMood = moodsWithData.reduce((sum, m) => sum + (m.mood ?? 0), 0) / moodsWithData.length

  if (avgMood >= 3.5) {
    return {
      id: 'mood-positive',
      category: 'mood',
      icon: cfg.icon,
      text: 'Ваше настроение в основном позитивное. Продолжайте в том же духе! 😊',
      borderGradient: cfg.borderGradient,
      accentBg: cfg.accentBg,
      accentText: cfg.accentText,
    }
  }
  if (avgMood <= 1.5) {
    return {
      id: 'mood-low',
      category: 'mood',
      icon: cfg.icon,
      text: 'Ваше настроение в последнее время снизилось. Попробуйте прогулку или разговор с близким человеком 💙',
      borderGradient: cfg.borderGradient,
      accentBg: cfg.accentBg,
      accentText: cfg.accentText,
    }
  }
  return null
}

const GENERAL_INSIGHTS = [
  'Начните день с маленького шага к большой цели 🌟',
  'Каждый прогресс, даже маленький — это всё равно прогресс 🚀',
  'Не забывайте делать перерывы. Отдых — часть продуктивности ☕',
  'Фокус на главном — ключ к результатам 🎯',
  'Похвалите себя за то, что уже сделали сегодня 👏',
]

function generateGeneralInsight(): Insight {
  const cfg = CATEGORY_CONFIG.general
  const text = GENERAL_INSIGHTS[Math.floor(Math.random() * GENERAL_INSIGHTS.length)]
  return {
    id: 'general-' + Math.random().toString(36).slice(2, 7),
    category: 'general',
    icon: cfg.icon,
    text,
    borderGradient: cfg.borderGradient,
    accentBg: cfg.accentBg,
    accentText: cfg.accentText,
  }
}

function generateAllInsights(props: AiInsightsWidgetProps): Insight[] {
  const insights: Insight[] = []

  const diaryInsight = generateDiaryInsight(props.weekEntryCount ?? 0)
  if (diaryInsight) insights.push(diaryInsight)

  const workoutInsight = generateWorkoutInsight(props.weekWorkoutCount ?? 0)
  if (workoutInsight) insights.push(workoutInsight)

  const financeInsight = generateFinanceInsight(
    props.transactionsData ?? [],
    props.weekExpenseSum ?? 0,
  )
  if (financeInsight) insights.push(financeInsight)

  const habitsInsight = generateHabitsInsight(
    props.habitsPercentage ?? 0,
    props.habitsTotal ?? 0,
    props.habitsCompleted ?? 0,
  )
  if (habitsInsight) insights.push(habitsInsight)

  const waterInsight = generateWaterInsight(props.waterTodayMl ?? 0)
  if (waterInsight) insights.push(waterInsight)

  const moodInsight = generateMoodInsight(props.recentMoods ?? [])
  if (moodInsight) insights.push(moodInsight)

  // Always include at least one general insight
  insights.push(generateGeneralInsight())

  // Shuffle and take up to 3
  const shuffled = insights.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 3)
}

// ── Skeleton State ──────────────────────────────────────────────────────

function InsightsSkeleton() {
  return (
    <Card className="overflow-hidden rounded-xl border border-border/50">
      <div className="h-1.5 w-full bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400" />
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-44" />
            </div>
          </div>
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
        <div className="space-y-2.5">
          <Skeleton className="h-[72px] w-full rounded-lg" />
          <Skeleton className="h-[72px] w-full rounded-lg" />
          <Skeleton className="h-[72px] w-full rounded-lg" />
        </div>
      </CardContent>
    </Card>
  )
}

// ── Single Insight Card ────────────────────────────────────────────────

function InsightCard({ insight }: { insight: Insight }) {
  const cfg = CATEGORY_CONFIG[insight.category]

  return (
    <div className="group relative flex items-start gap-3 rounded-lg border border-border/40 bg-muted/20 p-3 transition-all duration-200 hover:bg-muted/40">
      {/* Gradient left border accent */}
      <div className={cn(
        'absolute left-0 top-0 bottom-0 w-1 rounded-l-lg bg-gradient-to-b',
        insight.borderGradient,
      )} />

      {/* Icon */}
      <div className={cn(
        'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-105',
        cfg.accentBg,
        cfg.accentText,
      )}>
        {cfg.icon}
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          {cfg.label}
        </p>
        <p className="text-sm leading-relaxed text-foreground/90">
          {insight.text}
        </p>
      </div>
    </div>
  )
}

// ── Main Widget ─────────────────────────────────────────────────────────

export default memo(function AiInsightsWidget({
  loading = false,
  weekEntryCount = 0,
  weekWorkoutCount = 0,
  transactionsData = [],
  habitsPercentage = 0,
  habitsTotal = 0,
  habitsCompleted = 0,
  waterTodayMl = 0,
  recentMoods = [],
  weekExpenseSum = 0,
}: AiInsightsWidgetProps) {
  const [seed, setSeed] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  // Generate insights from data — re-compute when props or seed change
  const insights = useMemo(() => {
    if (loading) return [] as Insight[]
    return generateAllInsights({
      weekEntryCount,
      weekWorkoutCount,
      transactionsData,
      habitsPercentage,
      habitsTotal,
      habitsCompleted,
      waterTodayMl,
      recentMoods,
      weekExpenseSum,
    })
  }, [
    loading,
    weekEntryCount,
    weekWorkoutCount,
    transactionsData,
    habitsPercentage,
    habitsTotal,
    habitsCompleted,
    waterTodayMl,
    recentMoods,
    weekExpenseSum,
    seed,
  ])

  const handleRefresh = useCallback(() => {
    setRefreshing(true)
    // Small delay for visual feedback
    setTimeout(() => {
      setSeed((s) => s + 1)
      setRefreshing(false)
    }, 500)
  }, [])

  // ── Render ──────────────────────────────────────────────────────────

  if (loading) return <InsightsSkeleton />

  return (
    <Card className="card-hover overflow-hidden rounded-xl border border-border/50 shadow-sm">
      {/* ── Gradient Header Bar ───────────────────────────────────── */}
      <div className="h-1.5 w-full bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400" />

      <CardContent className="p-5">
        {/* ── Header ───────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30 shadow-sm">
              <Brain className="h-4 w-4 text-violet-500" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-semibold text-foreground">Умные инсайты</h3>
                <Sparkles className="h-3.5 w-3.5 text-violet-400" />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Персонализированные рекомендации
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-8 gap-1.5 px-2.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <RefreshCw
              className={cn(
                'h-3.5 w-3.5',
                refreshing && 'animate-spin',
              )}
            />
            <span className="hidden sm:inline">Обновить</span>
          </Button>
        </div>

        {/* ── Insights List ──────────────────────────────────────── */}
        <div className="stagger-children mt-4 max-h-48 space-y-2.5 overflow-y-auto pr-1 scrollbar-thin">
          {insights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>

        {/* ── Footer ───────────────────────────────────────────────── */}
        <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2.5">
          <p className="text-[10px] text-muted-foreground/60">
            На основе ваших данных
          </p>
          <p className="text-[10px] text-muted-foreground/60">
            {insights.length} {insights.length === 1 ? 'инсайт' : insights.length < 5 ? 'инсайта' : 'инсайтов'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
})
