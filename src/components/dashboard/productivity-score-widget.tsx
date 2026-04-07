'use client'

import { useEffect, useState, useCallback, memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { CheckCircle2, XCircle, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { AnimatedNumber } from '@/components/ui/animated-number'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ProductivityData {
  score: number
  breakdown: {
    habits: {
      completed: number
      total: number
      points: number
      maxPoints: number
      label: string
    }
    diary: {
      hasEntry: boolean
      count: number
      points: number
      maxPoints: number
      label: string
    }
    nutrition: {
      mealsLogged: number
      points: number
      maxPoints: number
      label: string
    }
    workout: {
      hasWorkout: boolean
      count: number
      points: number
      maxPoints: number
      label: string
    }
    finance: {
      withinBudget: boolean
      totalExpense: number
      totalBudget: number
      points: number
      maxPoints: number
      label: string
      hasBudget: boolean
    }
  }
  date: string
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getScoreColor(score: number) {
  if (score >= 70) {
    return {
      stroke: 'stroke-emerald-500',
      text: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      iconBg: 'bg-emerald-500/10',
      glowRing: 'ring-emerald-500/20',
    }
  }
  if (score >= 40) {
    return {
      stroke: 'stroke-sky-500',
      text: 'text-sky-600 dark:text-sky-400',
      bg: 'bg-sky-50 dark:bg-sky-950/30',
      iconBg: 'bg-sky-500/10',
      glowRing: 'ring-sky-500/20',
    }
  }
  return {
    stroke: 'stroke-rose-500',
    text: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    iconBg: 'bg-rose-500/10',
    glowRing: 'ring-rose-500/20',
  }
}

function getMotivationalMessage(score: number): string {
  if (score >= 90) return 'Невероятный день! Ты на пике продуктивности! 🏆'
  if (score >= 70) return 'Отличная работа! Так держать! 💪'
  if (score >= 50) return 'Хороший прогресс, продолжай в том же духе! ✨'
  if (score >= 30) return 'Неплохое начало, есть куда расти! 🌱'
  if (score >= 10) return 'Маленькие шаги ведут к большим результатам! 🚶'
  return 'Каждый день — новый шанс начать! ⚡'
}

function getScoreBadgeText(score: number): string {
  if (score >= 90) return 'Потрясающе'
  if (score >= 70) return 'Отлично'
  if (score >= 50) return 'Хорошо'
  if (score >= 30) return 'Неплохо'
  if (score >= 10) return 'Начало'
  return 'Старт'
}

// ─── Component ─────────────────────────────────────────────────────────────────

const ProductivityScoreWidget = memo(function ProductivityScoreWidget() {
  const [data, setData] = useState<ProductivityData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/productivity')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      if (!json.success || !json.data) throw new Error('Invalid response')
      setData(json.data)
    } catch (err) {
      console.error('Productivity score fetch error:', err)
      toast.error('Не удалось загрузить оценку продуктивности')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // ── Score calculation ───────────────────────────────────────────────────
  const score = data?.score ?? 0
  const colors = score >= 0 ? getScoreColor(score) : getScoreColor(0)
  const circumference = 2 * Math.PI * 54
  const dashOffset = circumference * (1 - score / 100)
  const motivationalMessage = getMotivationalMessage(score)
  const badgeText = getScoreBadgeText(score)

  // ── Activity list ───────────────────────────────────────────────────────
  const activities = data
    ? [
        {
          label: data.breakdown.habits.label,
          done: data.breakdown.habits.completed > 0,
          full: data.breakdown.habits.completed === data.breakdown.habits.total,
          points: data.breakdown.habits.points,
          maxPoints: data.breakdown.habits.maxPoints,
        },
        {
          label: data.breakdown.diary.label,
          done: data.breakdown.diary.hasEntry,
          full: data.breakdown.diary.hasEntry,
          points: data.breakdown.diary.points,
          maxPoints: data.breakdown.diary.maxPoints,
        },
        {
          label: data.breakdown.nutrition.label,
          done: data.breakdown.nutrition.mealsLogged >= 3,
          full: data.breakdown.nutrition.points === data.breakdown.nutrition.maxPoints,
          points: data.breakdown.nutrition.points,
          maxPoints: data.breakdown.nutrition.maxPoints,
        },
        {
          label: data.breakdown.workout.label,
          done: data.breakdown.workout.hasWorkout,
          full: data.breakdown.workout.hasWorkout,
          points: data.breakdown.workout.points,
          maxPoints: data.breakdown.workout.maxPoints,
        },
        {
          label: data.breakdown.finance.label,
          done: data.breakdown.finance.withinBudget || !data.breakdown.finance.hasBudget,
          full: data.breakdown.finance.withinBudget || !data.breakdown.finance.hasBudget,
          points: data.breakdown.finance.points,
          maxPoints: data.breakdown.finance.maxPoints,
        },
      ]
    : []

  // ── Loading skeleton ────────────────────────────────────────────────────
  if (loading) {
    return (
      <Card className="card-hover rounded-xl border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-7 rounded-lg" />
            <Skeleton className="h-5 w-36" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-6 py-4 sm:flex-row sm:items-start">
            <Skeleton className="h-36 w-36 shrink-0 rounded-full" />
            <div className="flex-1 space-y-3 w-full">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="card-hover animate-slide-up rounded-xl border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 shadow-sm shadow-emerald-500/20">
              <Zap className="h-4 w-4 text-white" />
            </div>
            Оценка продуктивности
          </CardTitle>
          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
            {badgeText}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-6 py-2 sm:flex-row sm:items-start">
          {/* ── Circular Progress Ring ───────────────────────────────────── */}
          <div className={`relative flex h-36 w-36 shrink-0 items-center justify-center`}>
            {/* Pulse ring */}
            <div className={`absolute inset-0 rounded-full ring-4 ${colors.glowRing} animate-[pulse-ring_2.5s_ease-in-out_infinite]`} />

            <svg className="h-36 w-36 -rotate-90" viewBox="0 0 120 120">
              {/* Background circle */}
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                strokeWidth="10"
                className="stroke-muted"
              />
              {/* Score arc */}
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                strokeWidth="10"
                strokeLinecap="round"
                className={`${colors.stroke} transition-all duration-1000 ease-out`}
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
              />
            </svg>

            {/* Score number in center */}
            <div className="absolute flex flex-col items-center">
              <span className={`text-3xl font-bold tabular-nums ${colors.text}`}>
                <AnimatedNumber value={score} duration={800} />
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                из 100
              </span>
            </div>
          </div>

          {/* ── Activity Breakdown ──────────────────────────────────────── */}
          <div className="flex-1 space-y-2 w-full">
            {activities.map((activity) => (
              <div
                key={activity.label}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  activity.full
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/20'
                    : activity.done
                      ? 'bg-amber-50/60 dark:bg-amber-950/10'
                      : 'bg-muted/50'
                }`}
              >
                {activity.full ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                ) : activity.done ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-500" />
                ) : (
                  <XCircle className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                )}
                <span
                  className={`flex-1 text-xs ${
                    activity.full
                      ? 'font-medium text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  {activity.label}
                </span>
                <span
                  className={`text-[11px] font-semibold tabular-nums ${
                    activity.full
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : activity.done
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-muted-foreground/60'
                  }`}
                >
                  +{activity.points}
                </span>
              </div>
            ))}

            {/* ── Motivational Message ──────────────────────────────────── */}
            <div className={`mt-2 rounded-lg px-3 py-2.5 text-center ${colors.bg}`}>
              <p className={`text-sm font-medium ${colors.text}`}>
                {motivationalMessage}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

export default ProductivityScoreWidget
