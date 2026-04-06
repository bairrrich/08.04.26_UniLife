'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Target, Trophy, TrendingUp, Clock, AlertTriangle, CalendarCheck, BarChart3, ShieldCheck, ShieldAlert } from 'lucide-react'
import type { GoalData } from './types'
import { cn } from '@/lib/utils'
import { isGoalAtRisk, isGoalOnTrack } from './constants'

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
    const result: Array<{ label: string; rate: number; count: number }> = []
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
      } as { label: string; rate: number; count: number })
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
            className="w-5 rounded-full transition-all duration-700 ease-out"
            style={{
              height: `${Math.max(4, (m.rate / maxRate) * 24)}px`,
              background: m.rate >= 70
                ? 'linear-gradient(to top, #10b981, #34d399)'
                : m.rate >= 40
                  ? 'linear-gradient(to top, #f59e0b, #fbbf24)'
                  : 'linear-gradient(to top, #ef4444, #f87171)',
              opacity: 0.85,
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

  // Count overdue goals
  const overdueCount = useMemo(() => {
    const now = new Date()
    return goals.filter((g) => {
      if (!g.deadline || g.status === 'completed') return false
      const dl = new Date(g.deadline)
      const diffDays = Math.ceil((dl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return diffDays < 0
    }).length
  }, [goals])

  // ─── NEW: Average progress of ACTIVE goals only ───────────────────────────
  const activeAvgProgress = useMemo(() => {
    const activeGoals = goals.filter((g) => g.status === 'active')
    if (activeGoals.length === 0) return 0
    const avg = Math.round(activeGoals.reduce((sum, g) => sum + g.progress, 0) / activeGoals.length)
    return avg
  }, [goals])

  // ─── NEW: Goals completed THIS MONTH ──────────────────────────────────────
  const completedThisMonth = useMemo(() => {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
    return goals.filter((g) => {
      if (g.status !== 'completed') return false
      // Check if updated recently (completed this month as proxy)
      const updated = new Date(g.updatedAt)
      return updated >= monthStart && updated <= monthEnd
    }).length
  }, [goals])

  // Count active goals
  const activeCount = useMemo(() => {
    return goals.filter((g) => g.status === 'active').length
  }, [goals])

  // ─── NEW: On track vs At risk counts ─────────────────────────────────────
  const onTrackCount = useMemo(() => {
    return goals.filter((g) => isGoalOnTrack(g)).length
  }, [goals])

  const atRiskCount = useMemo(() => {
    return goals.filter((g) => isGoalAtRisk(g)).length
  }, [goals])

  // ─── NEW: Average completion rate ────────────────────────────────────────
  const completionRate = useMemo(() => {
    if (stats.totalGoals === 0) return 0
    return Math.round((stats.completedGoals / stats.totalGoals) * 100)
  }, [stats.totalGoals, stats.completedGoals])

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

  // ─── Nearest deadline calculation ─────────────────────────────────────────
  const nearestDeadline = useMemo(() => {
    const now = new Date()
    const activeWithDeadline = goals
      .filter((g) => g.deadline && g.status !== 'completed')
      .map((g) => ({
        ...g,
        daysLeft: Math.ceil((new Date(g.deadline!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
      }))
      .sort((a, b) => Math.abs(a.daysLeft) - Math.abs(b.daysLeft))

    return activeWithDeadline.length > 0 ? activeWithDeadline[0] : null
  }, [goals])

  // ─── Average progress speed calculation ───────────────────────────────────
  const avgProgressSpeed = useMemo(() => {
    const activeGoals = goals.filter((g) => g.status === 'active' && g.progress > 0)
    if (activeGoals.length === 0) return null

    const speeds = activeGoals.map((g) => {
      const created = new Date(g.createdAt)
      const now = new Date()
      const daysElapsed = Math.max(1, Math.ceil((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)))
      return g.progress / daysElapsed
    })

    const avgSpeed = speeds.reduce((sum, s) => sum + s, 0) / speeds.length
    return { value: Math.round(avgSpeed * 10) / 10, label: '% в день' }
  }, [goals])

  // Color for the average progress ring
  const progressRingColor = stats.avgProgress >= 70 ? '#10b981' : stats.avgProgress >= 40 ? '#f59e0b' : '#ef4444'
  const progressRingColorEnd = stats.avgProgress >= 70 ? '#059669' : stats.avgProgress >= 40 ? '#d97706' : '#dc2626'
  const progressTextColor = stats.avgProgress >= 70
    ? 'text-emerald-600 dark:text-emerald-400'
    : stats.avgProgress >= 40
      ? 'text-amber-600 dark:text-amber-400'
      : 'text-rose-600 dark:text-rose-400'

  // ─── Active avg progress color ────────────────────────────────────────────
  const activeProgressColor = activeAvgProgress >= 70 ? '#10b981' : activeAvgProgress >= 40 ? '#f59e0b' : '#ef4444'
  const activeProgressTextColor = activeAvgProgress >= 70
    ? 'text-emerald-600 dark:text-emerald-400'
    : activeAvgProgress >= 40
      ? 'text-amber-600 dark:text-amber-400'
      : 'text-rose-600 dark:text-rose-400'

  // SVG progress ring params
  const ringRadius = 40
  const ringCircumference = 2 * Math.PI * ringRadius

  return (
    <>
      {/* Overall Progress Summary with Enhanced Ring */}
      <Card className="card-hover rounded-xl border overflow-hidden">
        {/* Subtle gradient header background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-amber-500/5 pointer-events-none" />
        <CardHeader className="pb-3 relative">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-base">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <Target className="h-4 w-4 text-white" />
              </div>
              Общий прогресс
            </div>
            <div className="flex items-center gap-3">
              {overdueCount > 0 && (
                <div className="flex items-center gap-1 text-xs text-rose-500 dark:text-rose-400">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span className="font-medium">{overdueCount} просрочен{overdueCount === 1 ? 'а' : overdueCount > 1 && overdueCount < 5 ? 'о' : 'о'}</span>
                </div>
              )}
              {approachingDeadlineCount > 0 && (
                <div className="flex items-center gap-1 text-xs text-amber-500 dark:text-amber-400">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="font-medium">{approachingDeadlineCount} дедлайн{approachingDeadlineCount === 1 ? '' : 'ов'}</span>
                </div>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            {/* Enhanced circular progress ring with glow */}
            <div className="relative flex h-28 w-28 shrink-0 items-center justify-center">
              {/* Subtle glow behind ring */}
              <div
                className="absolute inset-2 rounded-full opacity-20 blur-lg"
                style={{ backgroundColor: progressRingColor }}
              />
              <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="stats-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={progressRingColor} />
                    <stop offset="100%" stopColor={progressRingColorEnd} />
                  </linearGradient>
                </defs>
                {/* Track */}
                <circle cx="50" cy="50" r={ringRadius} fill="none" strokeWidth="8" className="stroke-muted/50" />
                {/* Progress arc */}
                <circle
                  cx="50" cy="50" r={ringRadius} fill="none" strokeWidth="8" strokeLinecap="round"
                  stroke="url(#stats-ring-grad)"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringCircumference * (1 - stats.avgProgress / 100)}
                  className="transition-all duration-1000 ease-out"
                  style={{
                    filter: `drop-shadow(0 0 6px ${progressRingColor}40)`,
                  }}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className={cn('text-2xl font-bold tabular-nums animate-count-fade-in', progressTextColor)}>
                  {animatedAvg}%
                </span>
                <span className="text-[10px] text-muted-foreground">среднее</span>
              </div>
            </div>
            <div className="flex-1 space-y-3 w-full">
              {/* Color-coded stat boxes */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 p-3 border border-emerald-100 dark:border-emerald-800/30">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Trophy className="h-3.5 w-3.5 text-emerald-500" />
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Завершено</p>
                  </div>
                      <p className="text-xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400 animate-count-fade-in">{animatedCompleted}</p>
                </div>
                <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-3 border border-amber-100 dark:border-amber-800/30">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <TrendingUp className="h-3.5 w-3.5 text-amber-500" />
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Активных</p>
                  </div>
                      <div className="flex items-center gap-1">
                    <p className="text-xl font-bold tabular-nums text-amber-600 dark:text-amber-400 animate-count-fade-in">{activeCount}</p>
                    {overdueCount > 0 && (
                      <div className="relative">
                        <div className="h-2 w-2 rounded-full bg-rose-500" />
                        <div className="absolute inset-0 h-2 w-2 rounded-full bg-rose-500 animate-ping opacity-75" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="rounded-lg bg-rose-50 dark:bg-rose-900/20 p-3 border border-rose-100 dark:border-rose-800/30">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
                    <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">Просрочено</p>
                  </div>
                      <p className="text-xl font-bold tabular-nums text-rose-600 dark:text-rose-400 animate-count-fade-in">{overdueCount}</p>
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

      {/* Stats Row — Enhanced with all new stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 stagger-children">
        {/* Total Goals */}
        <Card className="card-hover overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5" />
          <CardContent className="relative flex items-center gap-3 p-4">
            <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
              <Target className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold tabular-nums animate-count-fade-in">{animatedTotal}</p>
              <p className="text-xs text-muted-foreground truncate">Всего целей</p>
            </div>
          </CardContent>
        </Card>

        {/* Completed — Emerald */}
        <Card className="card-hover overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-600/5" />
          <CardContent className="relative flex items-center gap-3 p-4">
            <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
              <Trophy className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400 animate-count-fade-in">{animatedCompleted}</p>
              <p className="text-xs text-muted-foreground truncate">Завершено</p>
            </div>
          </CardContent>
        </Card>

        {/* ─── NEW: Average progress across ALL goals ──────────────────────── */}
        <Card className="card-hover overflow-hidden relative">
          <div
            className="absolute inset-0 bg-gradient-to-br opacity-100"
            style={{
              backgroundImage: stats.avgProgress >= 70
                ? 'linear-gradient(to bottom right, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05))'
                : stats.avgProgress >= 40
                  ? 'linear-gradient(to bottom right, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05))'
                  : 'linear-gradient(to bottom right, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05))',
            }}
          />
          <CardContent className="relative flex items-center gap-3 p-4">
            <div className={cn(
              'h-10 w-10 rounded-lg flex items-center justify-center shrink-0',
              stats.avgProgress >= 70
                ? 'bg-emerald-100 dark:bg-emerald-900/30'
                : stats.avgProgress >= 40
                  ? 'bg-amber-100 dark:bg-amber-900/30'
                  : 'bg-rose-100 dark:bg-rose-900/30',
            )}>
              <BarChart3 className={cn(
                'h-5 w-5',
                stats.avgProgress >= 70
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : stats.avgProgress >= 40
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-rose-600 dark:text-rose-400',
              )} />
            </div>
            <div className="min-w-0">
              <p className={cn('text-2xl font-bold tabular-nums animate-count-fade-in', progressTextColor)}>
                {animatedAvg}%
              </p>
              <p className="text-xs text-muted-foreground truncate">Ср. прогресс</p>
            </div>
          </CardContent>
        </Card>

        {/* ─── NEW: Average progress of ACTIVE goals ───────────────────────── */}
        <Card className="card-hover overflow-hidden relative">
          <div
            className="absolute inset-0 bg-gradient-to-br opacity-100"
            style={{
              backgroundImage: activeAvgProgress >= 70
                ? 'linear-gradient(to bottom right, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05))'
                : activeAvgProgress >= 40
                  ? 'linear-gradient(to bottom right, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05))'
                  : 'linear-gradient(to bottom right, rgba(99, 102, 241, 0.1), rgba(79, 70, 229, 0.05))',
            }}
          />
          <CardContent className="relative flex items-center gap-3 p-4">
            <div className={cn(
              'h-10 w-10 rounded-lg flex items-center justify-center shrink-0',
              activeAvgProgress >= 70
                ? 'bg-emerald-100 dark:bg-emerald-900/30'
                : activeAvgProgress >= 40
                  ? 'bg-amber-100 dark:bg-amber-900/30'
                  : 'bg-indigo-100 dark:bg-indigo-900/30',
            )}>
              <TrendingUp className={cn(
                'h-5 w-5',
                activeAvgProgress >= 70
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : activeAvgProgress >= 40
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-indigo-600 dark:text-indigo-400',
              )} />
            </div>
            <div className="min-w-0">
              <p className={cn('text-2xl font-bold tabular-nums animate-count-fade-in', activeProgressTextColor)}>
                {activeAvgProgress}%
              </p>
              <p className="text-[10px] text-muted-foreground truncate">Ср. прогресс активных</p>
            </div>
          </CardContent>
        </Card>

        {/* ─── NEW: Completed This Month ───────────────────────────────────── */}
        <Card className="card-hover overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-violet-600/5" />
          <CardContent className="relative flex items-center gap-3 p-4">
            <div className="h-10 w-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
              <CalendarCheck className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div className="min-w-0">
              <p className={cn(
                'text-2xl font-bold tabular-nums animate-count-fade-in',
                completedThisMonth > 0 ? 'text-violet-600 dark:text-violet-400' : 'text-muted-foreground',
              )}>
                {completedThisMonth}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">Завершено в этом месяце</p>
            </div>
          </CardContent>
        </Card>

        {/* ─── NEW: Average completion rate ──────────────────────────────── */}
        <Card className="card-hover overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-indigo-600/5" />
          <CardContent className="relative flex items-center gap-3 p-4">
            <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
              <BarChart3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="min-w-0">
              <p className={cn('text-2xl font-bold tabular-nums animate-count-fade-in',
                completionRate >= 50
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-muted-foreground',
              )}>
                {completionRate}%
              </p>
              <p className="text-xs text-muted-foreground truncate">Доля завершённых</p>
            </div>
          </CardContent>
        </Card>

        {/* ─── NEW: On Track goals ─────────────────────────────────────────── */}
        <Card className="card-hover overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-600/5" />
          <CardContent className="relative flex items-center gap-3 p-4">
            <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="min-w-0">
              <p className={cn('text-2xl font-bold tabular-nums animate-count-fade-in',
                onTrackCount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground',
              )}>
                {onTrackCount}
              </p>
              <p className="text-xs text-muted-foreground truncate">В ритме</p>
            </div>
          </CardContent>
        </Card>

        {/* ─── NEW: At Risk goals ──────────────────────────────────────────── */}
        <Card className={cn(
          'card-hover overflow-hidden relative',
          atRiskCount > 0 && 'ring-1 ring-amber-200 dark:ring-amber-800/50',
        )}>
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-amber-600/5" />
          <CardContent className="relative flex items-center gap-3 p-4">
            <div className={cn(
              'h-10 w-10 rounded-lg flex items-center justify-center shrink-0',
              atRiskCount > 0 ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-slate-100 dark:bg-slate-900/30',
            )}>
              <ShieldAlert className={cn(
                'h-5 w-5',
                atRiskCount > 0
                  ? 'text-amber-500'
                  : 'text-slate-400 dark:text-slate-500',
              )} />
            </div>
            <div className="min-w-0">
              <p className={cn('text-2xl font-bold tabular-nums animate-count-fade-in',
                atRiskCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground',
              )}>
                {atRiskCount}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {atRiskCount > 0 ? 'Требуют внимания' : 'Нет проблемных'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
