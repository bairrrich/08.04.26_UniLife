'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Target, Trophy, TrendingUp, Clock } from 'lucide-react'
import type { GoalData } from './types'

interface GoalStatsProps {
  goals: GoalData[]
  stats: { totalGoals: number; completedGoals: number; avgProgress: number }
}

// ─── Animated counter hook ───────────────────────────────────────────────────
function useAnimatedValue(target: number, duration = 800) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    const start = performance.now()
    const from = value
    const diff = target - from
    if (diff === 0) return
    let rafId: number
    const step = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setValue(Math.round(from + diff * eased))
      if (progress < 1) rafId = requestAnimationFrame(step)
    }
    rafId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafId)
  }, [target, duration])
  return value
}

// ─── Mini trend bars ────────────────────────────────────────────────────────
function MiniTrendBars({ goals }: { goals: GoalData[] }) {
  const months = useMemo(() => {
    const now = new Date()
    const result = []
    for (let i = 2; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)
      const monthGoals = goals.filter((g) => {
        const created = new Date(g.createdAt)
        return created >= d && created <= monthEnd
      })
      const completed = monthGoals.filter((g) => g.status === 'completed').length
      const rate = monthGoals.length > 0 ? Math.round((completed / monthGoals.length) * 100) : 0
      const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']
      result.push({
        label: monthNames[d.getMonth()],
        rate,
        count: monthGoals.length,
      })
    }
    return result
  }, [goals])

  const maxRate = Math.max(...months.map((m) => m.rate), 1)

  return (
    <div className="flex items-end gap-1.5 h-10">
      {months.map((m, i) => (
        <div key={i} className="flex flex-col items-center gap-0.5">
          <span className="text-[9px] text-muted-foreground tabular-nums">{m.rate}%</span>
          <div
            className="w-5 rounded-sm transition-all duration-700 ease-out"
            style={{
              height: `${Math.max(4, (m.rate / maxRate) * 24)}px`,
              backgroundColor: m.rate >= 70 ? '#10b981' : m.rate >= 40 ? '#f59e0b' : '#ef4444',
              opacity: 0.8,
            }}
          />
          <span className="text-[9px] text-muted-foreground">{m.label}</span>
        </div>
      ))}
    </div>
  )
}

export function GoalStats({ goals, stats }: GoalStatsProps) {
  const animatedTotal = useAnimatedValue(stats.totalGoals)
  const animatedCompleted = useAnimatedValue(stats.completedGoals)
  const animatedAvg = useAnimatedValue(stats.avgProgress)

  // Count goals with deadlines within 7 days
  const approachingDeadlineCount = useMemo(() => {
    const now = new Date()
    return goals.filter((g) => {
      if (!g.deadline || g.status === 'completed') return false
      const dl = new Date(g.deadline)
      const diffDays = Math.ceil((dl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return diffDays >= 0 && diffDays <= 7
    }).length
  }, [goals])

  // SVG progress ring params
  const ringRadius = 40
  const ringCircumference = 2 * Math.PI * ringRadius

  return (
    <>
      {/* Overall Progress Summary */}
      <Card className="card-hover rounded-xl border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4 text-violet-500" />
              Общий прогресс
            </div>
            {approachingDeadlineCount > 0 && (
              <div className="flex items-center gap-1 text-xs text-amber-500 dark:text-amber-400">
                <Clock className="h-3.5 w-3.5" />
                <span className="font-medium">{approachingDeadlineCount} дедлайн{approachingDeadlineCount === 1 ? '' : 'ов'}</span>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
              <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="stats-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r={ringRadius} fill="none" strokeWidth="8" className="stroke-muted/50" />
                <circle
                  cx="50" cy="50" r={ringRadius} fill="none" strokeWidth="8" strokeLinecap="round"
                  stroke="url(#stats-ring-grad)"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringCircumference * (1 - stats.avgProgress / 100)}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-xl font-bold tabular-nums text-violet-600 dark:text-violet-400">
                  {animatedAvg}%
                </span>
              </div>
            </div>
            <div className="flex-1 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-center sm:text-left">
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-2xl font-bold tabular-nums">{animatedTotal}</p>
                  <p className="text-xs text-muted-foreground">Всего целей</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                    {animatedCompleted}
                  </p>
                  <p className="text-xs text-muted-foreground">Достигнуто</p>
                </div>
              </div>
              {/* Mini trend */}
              {goals.length > 0 && (
                <div className="pt-1">
                  <p className="text-[10px] text-muted-foreground mb-1">Тренд завершения (3 мес.)</p>
                  <MiniTrendBars goals={goals} />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 stagger-children">
        <Card className="card-hover overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5" />
          <CardContent className="relative flex items-center gap-3 p-4">
            <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
              <Target className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold tabular-nums">{animatedTotal}</p>
              <p className="text-xs text-muted-foreground truncate">Всего целей</p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/5" />
          <CardContent className="relative flex items-center gap-3 p-4">
            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
              <Trophy className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold tabular-nums">{animatedCompleted}</p>
              <p className="text-xs text-muted-foreground truncate">Завершено</p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-amber-600/5" />
          <CardContent className="relative flex items-center gap-3 p-4">
            <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
              <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold tabular-nums">{animatedAvg}%</p>
              <p className="text-xs text-muted-foreground truncate">Ср. прогресс</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
