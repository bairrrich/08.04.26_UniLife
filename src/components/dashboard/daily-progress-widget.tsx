'use client'

import { useMemo, useSyncExternalStore } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  BookOpen,
  Utensils,
  Dumbbell,
  Target,
  Droplets,
  Check,
  Circle,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Props ────────────────────────────────────────────────────────────────────

interface DailyProgressWidgetProps {
  hasDiaryToday: boolean
  hasMealsToday: boolean
  hasWorkoutToday: boolean
  habitsCompleted: number
  habitsTotal: number
  waterGlasses: number
  waterGoal: number
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChecklistEntry {
  id: string
  label: string
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  completed: boolean
  subtitle?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildItems(props: DailyProgressWidgetProps): ChecklistEntry[] {
  const {
    hasDiaryToday,
    hasMealsToday,
    hasWorkoutToday,
    habitsCompleted,
    habitsTotal,
    waterGlasses,
    waterGoal,
  } = props

  return [
    {
      id: 'diary',
      label: 'Запись в дневнике',
      icon: <BookOpen className="h-3.5 w-3.5" />,
      iconBg: 'bg-emerald-100 dark:bg-emerald-950/50',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      completed: hasDiaryToday,
    },
    {
      id: 'meals',
      label: 'Записан приём пищи',
      icon: <Utensils className="h-3.5 w-3.5" />,
      iconBg: 'bg-orange-100 dark:bg-orange-950/50',
      iconColor: 'text-orange-600 dark:text-orange-400',
      completed: hasMealsToday,
    },
    {
      id: 'workout',
      label: 'Тренировка выполнена',
      icon: <Dumbbell className="h-3.5 w-3.5" />,
      iconBg: 'bg-blue-100 dark:bg-blue-950/50',
      iconColor: 'text-blue-600 dark:text-blue-400',
      completed: hasWorkoutToday,
    },
    {
      id: 'habits',
      label: 'Привычки выполнены',
      icon: <Target className="h-3.5 w-3.5" />,
      iconBg: 'bg-violet-100 dark:bg-violet-950/50',
      iconColor: 'text-violet-600 dark:text-violet-400',
      completed: habitsTotal > 0 && habitsCompleted === habitsTotal,
      subtitle: `${habitsCompleted} из ${habitsTotal}`,
    },
    {
      id: 'water',
      label: '8 стаканов воды',
      icon: <Droplets className="h-3.5 w-3.5" />,
      iconBg: 'bg-sky-100 dark:bg-sky-950/50',
      iconColor: 'text-sky-600 dark:text-sky-400',
      completed: waterGlasses >= waterGoal,
      subtitle: `${waterGlasses} из ${waterGoal}`,
    },
  ]
}

function calcPercentage(items: ChecklistEntry[]): number {
  if (items.length === 0) return 0
  const done = items.filter((i) => i.completed).length
  return Math.round((done / items.length) * 100)
}

function getMotivation(pct: number): string {
  if (pct === 100) return 'Отличный день! Все задачи выполнены! 🎉'
  if (pct >= 81) return 'Почти всё готово, осталось совсем чуть-чуть! 💪'
  if (pct >= 51) return 'Хороший прогресс, продолжайте в том же духе! 🚀'
  if (pct >= 21) return 'Хорошее начало, впереди ещё много дел! ⭐'
  return 'Новый день — новые возможности! Давайте начнём! ☀️'
}

function getProgressColor(pct: number): string {
  if (pct >= 80) return '[&>div]:bg-emerald-500'
  if (pct >= 50) return '[&>div]:bg-amber-500'
  return '[&>div]:bg-rose-500'
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DailyProgressWidget({
  hasDiaryToday,
  hasMealsToday,
  hasWorkoutToday,
  habitsCompleted,
  habitsTotal,
  waterGlasses,
  waterGoal,
}: DailyProgressWidgetProps) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  const items = useMemo(
    () =>
      buildItems({
        hasDiaryToday,
        hasMealsToday,
        hasWorkoutToday,
        habitsCompleted,
        habitsTotal,
        waterGlasses,
        waterGoal,
      }),
    [hasDiaryToday, hasMealsToday, hasWorkoutToday, habitsCompleted, habitsTotal, waterGlasses, waterGoal],
  )

  const completedCount = items.filter((i) => i.completed).length
  const percentage = calcPercentage(items)
  const motivation = getMotivation(percentage)
  const allComplete = completedCount === items.length

  // ── Pre-mount skeleton ─────────────────────────────────────────────────
  if (!mounted) {
    return (
      <Card className="glass-card rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
              <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            Прогресс за сегодня
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="skeleton-shimmer h-2 w-full rounded-full" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="skeleton-shimmer h-7 w-7 shrink-0 rounded-full" />
                <div className="flex-1 space-y-1">
                  <div className="skeleton-shimmer h-3.5 w-32 rounded-md" />
                  <div className="skeleton-shimmer h-3 w-20 rounded-md" />
                </div>
                <div className="skeleton-shimmer h-5 w-5 shrink-0 rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="animate-slide-up card-hover glass-card rounded-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
              <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            Прогресс за сегодня
          </CardTitle>
          <Badge
            variant={allComplete ? 'default' : 'secondary'}
            className={cn(
              'tabular-nums text-xs',
              allComplete && 'bg-emerald-500 hover:bg-emerald-500',
            )}
          >
            {completedCount}/{items.length}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* ── Overall progress bar ────────────────────────────────────── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Выполнено
            </span>
            <span
              className={cn(
                'text-xs font-semibold tabular-nums',
                percentage >= 80
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : percentage >= 50
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-rose-600 dark:text-rose-400',
              )}
            >
              {percentage}%
            </span>
          </div>
          <Progress
            value={percentage}
            className={cn('h-2', getProgressColor(percentage))}
          />
        </div>

        {/* ── Motivational message ────────────────────────────────────── */}
        <p className="text-xs text-muted-foreground leading-relaxed">
          {motivation}
        </p>

        {/* ── Checklist items with stagger animation ──────────────────── */}
        <div className="stagger-children space-y-1">
          {items.map((item) => (
            <div
              key={item.id}
              className={cn(
                'flex items-center gap-3 rounded-lg px-2.5 py-2 transition-colors duration-200',
                item.completed
                  ? 'bg-muted/30'
                  : 'bg-transparent',
              )}
            >
              {/* Icon */}
              <div
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-opacity duration-200',
                  item.iconBg,
                  item.iconColor,
                  item.completed && 'opacity-50',
                )}
              >
                {item.icon}
              </div>

              {/* Label + subtitle */}
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    'text-sm font-medium transition-colors duration-200',
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
                      'text-[11px] tabular-nums mt-0.5',
                      item.completed
                        ? 'text-muted-foreground/60'
                        : 'text-muted-foreground',
                    )}
                  >
                    {item.subtitle}
                  </p>
                )}
              </div>

              {/* Checkmark or empty circle */}
              {item.completed ? (
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white transition-transform duration-300 scale-100">
                  <Check className="h-3 w-3" />
                </div>
              ) : (
                <Circle className="h-5 w-5 shrink-0 text-muted-foreground/25" />
              )}
            </div>
          ))}
        </div>

        {/* ── All-complete celebration ─────────────────────────────────── */}
        {allComplete && (
          <div className="mt-1 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-2.5 text-center dark:from-emerald-950/30 dark:to-teal-950/30">
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              Все задачи на сегодня выполнены! 🎉
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
