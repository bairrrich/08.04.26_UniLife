'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAppStore } from '@/store/use-app-store'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Crosshair, Plus, ArrowRight } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface GoalItem {
  id: string
  title: string
  progress: number
  status: string
  category: string
  deadline: string | null
  updatedAt: string
}

interface RecentGoalsWidgetProps {
  loading?: boolean
}

// ─── Category colors ─────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  personal: 'bg-emerald-500',
  health: 'bg-rose-500',
  finance: 'bg-amber-500',
  career: 'bg-blue-500',
  learning: 'bg-violet-500',
}

const CATEGORY_LABELS: Record<string, string> = {
  personal: 'Личное',
  health: 'Здоровье',
  finance: 'Финансы',
  career: 'Карьера',
  learning: 'Обучение',
}

function getProgressColor(progress: number): string {
  if (progress >= 80) return '[&>div]:bg-emerald-500'
  if (progress >= 50) return '[&>div]:bg-sky-500'
  if (progress >= 25) return '[&>div]:bg-amber-500'
  return '[&>div]:bg-rose-500'
}

function getProgressTrackColor(progress: number): string {
  if (progress >= 80) return 'bg-emerald-100 dark:bg-emerald-950/40'
  if (progress >= 50) return 'bg-sky-100 dark:bg-sky-950/40'
  if (progress >= 25) return 'bg-amber-100 dark:bg-amber-950/40'
  return 'bg-rose-100 dark:bg-rose-950/40'
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function RecentGoalsWidget({ loading: externalLoading }: RecentGoalsWidgetProps) {
  const [goals, setGoals] = useState<GoalItem[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const setActiveModule = useAppStore((s) => s.setActiveModule)

  const fetchGoals = useCallback(async () => {
    try {
      const res = await fetch('/api/goals')
      if (!res.ok) return
      const json = await res.json()
      if (!json.success || !json.data) return

      // Get 3 most recently active goals (updated recently, non-completed first)
      const sorted = [...json.data]
        .filter((g: GoalItem) => g.status !== 'completed')
        .sort((a: GoalItem, b: GoalItem) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 3)

      // If less than 3 active, fill with completed goals
      if (sorted.length < 3) {
        const completed = [...json.data]
          .filter((g: GoalItem) => g.status === 'completed')
          .sort((a: GoalItem, b: GoalItem) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        sorted.push(...completed.slice(0, 3 - sorted.length))
      }

      setGoals(sorted)
    } catch {
      // Silent fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!externalLoading) {
      fetchGoals()
    }
  }, [externalLoading, fetchGoals])

  const handleQuickProgress = useCallback(async (goalId: string, currentProgress: number) => {
    setUpdatingId(goalId)
    try {
      const newProgress = Math.min(100, currentProgress + 5)
      const res = await fetch(`/api/goals/${goalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress: newProgress }),
      })
      if (res.ok) {
        setGoals((prev) =>
          prev.map((g) => (g.id === goalId ? { ...g, progress: newProgress } : g))
        )
      }
    } catch {
      // Silent fail
    } finally {
      setUpdatingId(null)
    }
  }, [])

  const isLoading = externalLoading || loading

  return (
    <Card className="animate-slide-up card-hover rounded-xl border">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-900/50">
            <Crosshair className="h-4 w-4 text-sky-500" />
          </div>
          Активные цели
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-xs text-muted-foreground"
          onClick={() => setActiveModule('goals')}
        >
          Все цели
          <ArrowRight className="h-3 w-3" />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32 rounded" />
                  <Skeleton className="h-4 w-8 rounded" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        ) : goals.length === 0 ? (
          <div className="py-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 dark:bg-sky-900/30">
              <Crosshair className="h-6 w-6 text-sky-500/60" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Нет активных целей</p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Поставьте цель, чтобы отслеживать прогресс
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 gap-1.5"
              onClick={() => setActiveModule('goals')}
            >
              <Plus className="h-3.5 w-3.5" />
              Поставить цель
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => (
              <div
                key={goal.id}
                className="group rounded-xl p-3 transition-colors hover:bg-muted/40"
              >
                {/* Goal header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div
                      className={`h-2 w-2 shrink-0 rounded-full ${CATEGORY_COLORS[goal.category] || 'bg-gray-400'}`}
                    />
                    <p className="text-sm font-medium truncate">{goal.title}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                      {goal.progress}%
                    </span>
                    {goal.status !== 'completed' && (
                      <button
                        onClick={() => handleQuickProgress(goal.id, goal.progress)}
                        disabled={updatingId === goal.id}
                        className="flex h-5 w-5 items-center justify-center rounded-md text-muted-foreground/60 opacity-0 transition-all group-hover:opacity-100 hover:bg-emerald-100 hover:text-emerald-600 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-400 disabled:opacity-50"
                        title="+5% прогресса"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-2">
                  <div className={`flex-1 h-2 rounded-full overflow-hidden ${getProgressTrackColor(goal.progress)}`}>
                    <Progress
                      value={goal.progress}
                      className={`h-2 rounded-full ${getProgressColor(goal.progress)}`}
                    />
                  </div>
                  {goal.deadline && (
                    <span className="text-[10px] text-muted-foreground/60 shrink-0 tabular-nums">
                      {new Date(goal.deadline).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  )}
                </div>

                {/* Category label */}
                <div className="mt-1.5">
                  <span className="text-[10px] text-muted-foreground/50">
                    {CATEGORY_LABELS[goal.category] || goal.category}
                    {goal.status === 'completed' && ' · Выполнена'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
