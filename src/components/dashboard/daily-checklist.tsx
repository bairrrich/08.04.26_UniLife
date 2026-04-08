'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { ClipboardCheck, BookOpen, Utensils, Dumbbell, Target, Droplets, Check, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Props ────────────────────────────────────────────────────────────────────

interface DailyChecklistProps {
  loading: boolean
  hasDiaryToday: boolean
  hasMealsToday: boolean
  workoutDone: boolean
  habitsCompleted: number
  habitsTotal: number
  waterMl: number
  onNavigate: (module: string) => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface ChecklistItem {
  id: string
  label: string
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  completed: boolean
  module: string
  subtitle?: string
}

function getChecklistItems(props: Omit<DailyChecklistProps, 'loading' | 'onNavigate'>): ChecklistItem[] {
  const {
    hasDiaryToday,
    hasMealsToday,
    workoutDone,
    habitsCompleted,
    habitsTotal,
    waterMl,
  } = props

  return [
    {
      id: 'diary',
      label: 'Записать дневник',
      icon: <BookOpen className="h-4 w-4" />,
      iconBg: 'bg-emerald-100 dark:bg-emerald-950/50',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      completed: hasDiaryToday,
      module: 'diary',
    },
    {
      id: 'nutrition',
      label: 'Записать приём пищи',
      icon: <Utensils className="h-4 w-4" />,
      iconBg: 'bg-orange-100 dark:bg-orange-950/50',
      iconColor: 'text-orange-600 dark:text-orange-400',
      completed: hasMealsToday,
      module: 'nutrition',
    },
    {
      id: 'workout',
      label: 'Выполнить тренировку',
      icon: <Dumbbell className="h-4 w-4" />,
      iconBg: 'bg-blue-100 dark:bg-blue-950/50',
      iconColor: 'text-blue-600 dark:text-blue-400',
      completed: workoutDone,
      module: 'workout',
    },
    {
      id: 'habits',
      label: 'Выполнить все привычки',
      icon: <Target className="h-4 w-4" />,
      iconBg: 'bg-violet-100 dark:bg-violet-950/50',
      iconColor: 'text-violet-600 dark:text-violet-400',
      completed: habitsTotal > 0 && habitsCompleted === habitsTotal,
      module: 'habits',
      subtitle: `${habitsCompleted} из ${habitsTotal}`,
    },
    {
      id: 'water',
      label: 'Выпить 8 стаканов воды',
      icon: <Droplets className="h-4 w-4" />,
      iconBg: 'bg-sky-100 dark:bg-sky-950/50',
      iconColor: 'text-sky-600 dark:text-sky-400',
      completed: waterMl >= 2000,
      module: 'nutrition',
      subtitle: `${waterMl} мл из 2000 мл`,
    },
  ]
}

function getProgressColor(pct: number) {
  if (pct >= 80) return 'bg-emerald-500'
  if (pct >= 50) return 'bg-amber-500'
  return 'bg-rose-500'
}

function getProgressTrackColor(pct: number) {
  if (pct >= 80) return 'bg-emerald-500/20'
  if (pct >= 50) return 'bg-amber-500/20'
  return 'bg-rose-500/20'
}

function getProgressTextColor(pct: number) {
  if (pct >= 80) return 'text-emerald-600 dark:text-emerald-400'
  if (pct >= 50) return 'text-amber-600 dark:text-amber-400'
  return 'text-rose-600 dark:text-rose-400'
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DailyChecklist({
  loading,
  hasDiaryToday,
  hasMealsToday,
  workoutDone,
  habitsCompleted,
  habitsTotal,
  waterMl,
  onNavigate,
}: DailyChecklistProps) {
  const items = useMemo(
    () =>
      getChecklistItems({
        hasDiaryToday,
        hasMealsToday,
        workoutDone,
        habitsCompleted,
        habitsTotal,
        waterMl,
      }),
    [hasDiaryToday, hasMealsToday, workoutDone, habitsCompleted, habitsTotal, waterMl],
  )

  const completedCount = items.filter((i) => i.completed).length
  const percentage = Math.round((completedCount / 5) * 100)
  const allComplete = completedCount === 5

  return (
    <Card className="card-hover animate-slide-up rounded-xl border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardCheck className="h-4 w-4 text-primary" />
            Ежедневный чек-лист
          </CardTitle>
          {!loading && (
            <Badge
              variant={allComplete ? 'default' : 'secondary'}
              className={cn(
                'tabular-nums',
                allComplete && 'bg-emerald-500 hover:bg-emerald-500',
              )}
            >
              {completedCount}/5
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {loading ? (
          /* ── Loading skeleton ────────────────────────────────────────── */
          <div className="space-y-4">
            <Skeleton className="h-2 w-full rounded-full" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-36 rounded-md" />
                    <Skeleton className="h-3 w-24 rounded-md" />
                  </div>
                  <Skeleton className="h-5 w-5 shrink-0 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* ── Progress bar ──────────────────────────────────────────── */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className={cn('font-medium tabular-nums', getProgressTextColor(percentage))}>
                  {completedCount} из 5 выполнено
                </span>
                <span className={cn('font-semibold tabular-nums', getProgressTextColor(percentage))}>
                  {percentage}%
                </span>
              </div>
              <div
                className={cn(
                  'h-2 w-full overflow-hidden rounded-full transition-colors duration-500',
                  getProgressTrackColor(percentage),
                )}
              >
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-700 ease-out',
                    getProgressColor(percentage),
                  )}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>

            {/* ── Checklist items ──────────────────────────────────────── */}
            <div className="stagger-children space-y-1">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.module)}
                  className={cn(
                    'flex min-h-[44px] w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-200',
                    item.completed
                      ? 'bg-muted/40 hover:bg-muted/60'
                      : 'hover:bg-accent/50',
                  )}
                >
                  {/* Icon circle */}
                  <div
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-opacity duration-200',
                      item.iconBg,
                      item.iconColor,
                      item.completed && 'opacity-50',
                    )}
                  >
                    {item.icon}
                  </div>

                  {/* Label + optional subtitle */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        'text-sm font-medium transition-all duration-200',
                        item.completed
                          ? 'text-muted-foreground line-through'
                          : 'text-foreground',
                      )}
                    >
                      {item.label}
                    </p>
                    {item.subtitle && (
                      <p
                        className={cn(
                          'text-xs tabular-nums mt-0.5',
                          item.completed
                            ? 'text-muted-foreground/70'
                            : 'text-muted-foreground',
                        )}
                      >
                        {item.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Check / empty circle */}
                  <div
                    className={cn(
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-all duration-300',
                      item.completed
                        ? 'bg-emerald-500 text-white scale-100'
                        : 'border-2 border-muted-foreground/30 text-transparent',
                    )}
                  >
                    <Check className="h-3 w-3" />
                  </div>
                </button>
              ))}
            </div>

            {/* ── Celebration state ────────────────────────────────────── */}
            {allComplete && (
              <div className="mt-2 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-3 text-center dark:from-emerald-950/30 dark:to-teal-950/30">
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                  Все задачи на сегодня выполнены! 🎉
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
