'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Flame, BookOpen, Dumbbell, Utensils, Target } from 'lucide-react'
import { SkeletonCard } from './skeleton-components'
import type { ModuleStreak } from './types'

// ─── Component ───────────────────────────────────────────────────────────────

interface ModuleStreaksProps {
  loading: boolean
  streaks: ModuleStreak[]
}

export function ModuleStreaks({ loading, streaks }: ModuleStreaksProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  const iconMap: Record<string, React.ReactNode> = {
    Дневник: <BookOpen className="h-4 w-4" />,
    Тренировки: <Dumbbell className="h-4 w-4" />,
    Питание: <Utensils className="h-4 w-4" />,
    Привычки: <Target className="h-4 w-4" />,
  }

  const longestStreak = streaks.length > 0
    ? Math.max(...streaks.map((s) => s.streak))
    : 0

  return (
    <div className="stagger-children grid grid-cols-2 gap-3 lg:grid-cols-4">
      {streaks.map((streak) => {
        const isLongest = streak.streak === longestStreak && streak.streak > 0

        return (
          <Card
            key={streak.module}
            className={`card-hover relative overflow-hidden rounded-xl border ${streak.streak > 0 ? 'border-transparent' : ''} ${streak.streak > 0 ? streak.bgColor + ' dark:' + streak.darkBgColor : ''}`}
          >
            {/* Streak fire badge for longest */}
            {isLongest && streak.streak > 1 && (
              <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-red-500 shadow-sm">
                <Flame className="h-3 w-3 text-white" />
              </div>
            )}

            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-lg ${streak.streak > 0 ? 'bg-white/60 dark:bg-black/20' : 'bg-muted/60'}`}
                >
                  <span className={streak.streak > 0 ? streak.color : 'text-muted-foreground'}>
                    {streak.emoji || iconMap[streak.module]}
                  </span>
                </div>
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  {streak.module}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-baseline gap-1.5">
                <p className="text-2xl font-bold tabular-nums">
                  {streak.streak}
                </p>
                <p className="text-xs text-muted-foreground">
                  {streak.streak === 1 ? 'день' : streak.streak < 5 ? 'дня' : 'дней'}
                </p>
              </div>
              {streak.streak > 0 && (
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min((streak.streak / Math.max(longestStreak, 1)) * 100, 100)}%`,
                      backgroundColor: streak.color === 'text-emerald-600' ? '#10b981' :
                        streak.color === 'text-blue-600' ? '#3b82f6' :
                          streak.color === 'text-orange-600' ? '#f97316' : '#8b5cf6',
                    }}
                  />
                </div>
              )}
              {streak.streak === 0 && (
                <p className="mt-1 text-[10px] text-muted-foreground/60">
                  Нет активности
                </p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
