'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import { Lock, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Props ────────────────────────────────────────────────────────────────────

interface AchievementStats {
  diaryCount: number
  workoutCount: number
  habitsCompleted: number
  habitsTotal: number
  streak: number
  totalEntries: number
}

// ─── Achievement Definitions ──────────────────────────────────────────────────

interface AchievementDef {
  id: string
  title: string
  description: string
  icon: string
  condition: (s: AchievementStats) => boolean
  category: 'diary' | 'fitness' | 'habits' | 'streak' | 'general'
  gradient: string
}

const CATEGORY_GRADIENTS: Record<string, string> = {
  diary: 'from-emerald-400 to-teal-500',
  fitness: 'from-orange-400 to-rose-500',
  habits: 'from-violet-400 to-purple-500',
  streak: 'from-amber-400 to-orange-500',
  general: 'from-cyan-400 to-emerald-500',
}

const CATEGORY_LABELS: Record<string, string> = {
  diary: 'Дневник',
  fitness: 'Тренировки',
  habits: 'Привычки',
  streak: 'Серии',
  general: 'Общие',
}

const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first-diary', title: 'Первый шаг', description: 'Создайте первую запись в дневнике', icon: '📝', condition: (s) => s.diaryCount >= 1, category: 'diary', gradient: CATEGORY_GRADIENTS.diary },
  { id: 'diary-10', title: 'Писатель', description: '10 записей в дневнике', icon: '✍️', condition: (s) => s.diaryCount >= 10, category: 'diary', gradient: CATEGORY_GRADIENTS.diary },
  { id: 'diary-30', title: 'Дневник никого не оставит равнодушным', description: '30 записей в дневнике', icon: '📖', condition: (s) => s.diaryCount >= 30, category: 'diary', gradient: CATEGORY_GRADIENTS.diary },
  { id: 'first-workout', title: 'Начало пути', description: 'Завершите первую тренировку', icon: '🏃', condition: (s) => s.workoutCount >= 1, category: 'fitness', gradient: CATEGORY_GRADIENTS.fitness },
  { id: 'workout-10', title: 'Спортсмен', description: '10 тренировок', icon: '💪', condition: (s) => s.workoutCount >= 10, category: 'fitness', gradient: CATEGORY_GRADIENTS.fitness },
  { id: 'workout-30', title: 'Железная воля', description: '30 тренировок', icon: '🏆', condition: (s) => s.workoutCount >= 30, category: 'fitness', gradient: CATEGORY_GRADIENTS.fitness },
  { id: 'habit-master', title: 'Мастер привычек', description: 'Выполните все привычки за день', icon: '✅', condition: (s) => s.habitsCompleted > 0 && s.habitsCompleted === s.habitsTotal, category: 'habits', gradient: CATEGORY_GRADIENTS.habits },
  { id: 'streak-7', title: 'Неделя огня', description: 'Серия 7 дней', icon: '🔥', condition: (s) => s.streak >= 7, category: 'streak', gradient: CATEGORY_GRADIENTS.streak },
  { id: 'streak-30', title: 'Месяц без перерыва', description: 'Серия 30 дней', icon: '⭐', condition: (s) => s.streak >= 30, category: 'streak', gradient: CATEGORY_GRADIENTS.streak },
  { id: 'active-50', title: 'Активный пользователь', description: '50 записей всего', icon: '🎯', condition: (s) => s.totalEntries >= 50, category: 'general', gradient: CATEGORY_GRADIENTS.general },
  { id: 'active-100', title: 'Легенда UniLife', description: '100 записей всего', icon: '👑', condition: (s) => s.totalEntries >= 100, category: 'general', gradient: CATEGORY_GRADIENTS.general },
  { id: 'all-round', title: 'Универсал', description: 'Используйте все модули', icon: '🌈', condition: (s) => s.diaryCount >= 1 && s.workoutCount >= 1 && s.habitsCompleted >= 1, category: 'general', gradient: CATEGORY_GRADIENTS.general },
]

// ─── Filter type ──────────────────────────────────────────────────────────────

type FilterCategory = 'all' | AchievementDef['category']

// ─── Component ────────────────────────────────────────────────────────────────

export default function AchievementBadges(props: AchievementStats) {
  const [filter, setFilter] = useState<FilterCategory>('all')

  const results = useMemo(() => {
    return ACHIEVEMENTS.map((ach) => ({
      ...ach,
      unlocked: ach.condition(props),
    }))
  }, [props])

  const unlockedCount = results.filter((r) => r.unlocked).length

  const filteredResults = useMemo(() => {
    if (filter === 'all') return results
    return results.filter((r) => r.category === filter)
  }, [results, filter])

  const progressPct = Math.round((unlockedCount / ACHIEVEMENTS.length) * 100)

  return (
    <Card className="animate-fade-in card-hover rounded-xl border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm shadow-amber-500/20">
              <Trophy className="h-4 w-4 text-white" />
            </div>
            Достижения
          </CardTitle>
          <span className="text-xs font-semibold tabular-nums text-muted-foreground">
            {unlockedCount}/{ACHIEVEMENTS.length} достижений
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-700 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Category filter chips */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          <button
            onClick={() => setFilter('all')}
            className={cn(
              'rounded-full px-3 py-1 text-[11px] font-medium transition-colors',
              filter === 'all'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            Все
          </button>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key as FilterCategory)}
              className={cn(
                'rounded-full px-3 py-1 text-[11px] font-medium transition-colors',
                filter === key
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3 stagger-children">
          {filteredResults.map((achievement) => (
            <BadgeItem key={achievement.id} achievement={achievement} />
          ))}
        </div>

        {filteredResults.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Нет достижений в этой категории
          </p>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Badge Item ───────────────────────────────────────────────────────────────

interface BadgeItemProps {
  achievement: AchievementDef & { unlocked: boolean }
}

function BadgeItem({ achievement }: BadgeItemProps) {
  const { icon, title, description, gradient, unlocked, category } = achievement

  const badgeContent = (
    <div
      className={cn(
        'group relative flex flex-col items-center gap-2 rounded-xl p-3 transition-all duration-200 cursor-default',
        unlocked
          ? 'bg-background shadow-sm hover:shadow-md'
          : 'bg-muted/30 opacity-40 hover:opacity-60',
      )}
    >
      {/* Icon circle */}
      <div
        className={cn(
          'relative flex h-12 w-12 items-center justify-center rounded-full text-xl transition-all duration-200',
          unlocked
            ? cn(
                'bg-gradient-to-br shadow-lg',
                gradient,
                'ring-2 ring-background',
                'group-hover:scale-110',
              )
            : 'bg-muted text-muted-foreground',
        )}
      >
        {unlocked ? (
          icon
        ) : (
          <Lock className="h-4 w-4" />
        )}

        {/* Glow effect for unlocked */}
        {unlocked && (
          <div
            className={cn(
              'absolute -inset-1.5 rounded-full bg-gradient-to-br opacity-0 group-hover:opacity-30 blur-md transition-opacity duration-300',
              gradient,
            )}
          />
        )}

        {/* Lock overlay for locked badges */}
        {!unlocked && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-muted/50" />
        )}
      </div>

      {/* Title */}
      <span
        className={cn(
          'text-[11px] font-semibold leading-tight text-center line-clamp-2',
          unlocked ? 'text-foreground' : 'text-muted-foreground',
        )}
      >
        {title}
      </span>

      {/* Unlocked checkmark */}
      {unlocked && (
        <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-[8px] shadow-sm shadow-amber-500/30">
          ✓
        </div>
      )}
    </div>
  )

  // Tooltip with description on hover
  return (
    <Tooltip>
      <TooltipTrigger asChild>{badgeContent}</TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-[220px]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-base">{unlocked ? icon : '🔒'}</span>
          <p className="font-medium text-sm">{title}</p>
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
        <div className="mt-1.5 flex items-center gap-1.5">
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium',
              unlocked
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                : 'bg-muted text-muted-foreground',
            )}
          >
            {unlocked ? '✓ Получено' : `• ${CATEGORY_LABELS[category]}`}
          </span>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
