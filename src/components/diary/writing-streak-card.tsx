'use client'

import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Flame, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DiaryEntry } from './types'
import { formatDateKey, parseEntryDate } from './helpers'

interface WritingStreakCardProps {
  entries: DiaryEntry[]
  today: Date
  isLoading: boolean
  className?: string
}

export function WritingStreakCard({ entries, today, isLoading, className }: WritingStreakCardProps) {
  const streak = useMemo(() => {
    if (entries.length === 0) return 0

    // Build set of unique date keys
    const dateKeys = new Set<string>()
    for (const entry of entries) {
      dateKeys.add(formatDateKey(parseEntryDate(entry.date)))
    }

    const todayStr = formatDateKey(today)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = formatDateKey(yesterday)

    // Streak must start from today or yesterday
    if (!dateKeys.has(todayStr) && !dateKeys.has(yesterdayStr)) return 0

    let count = 0
    const checkDate = new Date(today)

    while (true) {
      const key = formatDateKey(checkDate)
      if (dateKeys.has(key)) {
        count++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }

    return count
  }, [entries, today])

  if (isLoading) {
    return (
      <Card className={cn('rounded-xl overflow-hidden', className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="skeleton-shimmer h-10 w-10 rounded-xl" />
            <div className="space-y-1.5 flex-1">
              <div className="skeleton-shimmer h-4 w-40 rounded" />
              <div className="skeleton-shimmer h-3 w-28 rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const hasStreak = streak > 0

  return (
    <Card
      className={cn(
        'rounded-xl overflow-hidden',
        'bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/20',
        'border-orange-200/40 dark:border-orange-800/20',
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
            hasStreak && streak >= 7
              ? 'bg-gradient-to-br from-orange-400 to-red-500 shadow-lg shadow-orange-500/25'
              : hasStreak && streak >= 3
                ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/25'
                : hasStreak
                  ? 'bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg shadow-yellow-500/20'
                  : 'bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-500'
          )}>
            {hasStreak ? (
              <Flame className="h-5 w-5 text-white" />
            ) : (
              <Sparkles className="h-5 w-5 text-white" />
            )}
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">
                {hasStreak ? 'Серия:' : 'Начни серию!'}
              </span>
              {hasStreak && (
                <span className={cn(
                  'text-xl font-bold tabular-nums animate-count-fade-in',
                  streak >= 7
                    ? 'text-orange-600 dark:text-orange-400'
                    : streak >= 3
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-yellow-600 dark:text-yellow-400'
                )}>
                  {streak}
                </span>
              )}
              {hasStreak && (
                <span className="text-sm text-muted-foreground">
                  {streak === 1 ? 'день' : streak < 5 ? 'дня' : 'дней'}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {hasStreak && streak >= 7
                ? 'Потрясающе! Вы пишете уже больше недели 🔥'
                : hasStreak && streak >= 3
                  ? 'Отличная привычка — продолжайте!'
                  : hasStreak
                    ? 'Хорошее начало, не останавливайтесь!'
                    : 'Напишите хотя бы одну запись сегодня'
              }
            </p>
          </div>

          {/* Streak dots visual */}
          {hasStreak && (
            <div className="flex items-center gap-1 shrink-0">
              {Array.from({ length: Math.min(streak, 7) }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-2 w-2 rounded-full animate-fade-in',
                    i < streak
                      ? streak >= 7
                        ? 'bg-orange-400'
                        : streak >= 3
                          ? 'bg-amber-400'
                          : 'bg-yellow-400'
                      : 'bg-muted'
                  )}
                  style={{ animationDelay: `${i * 80}ms` }}
                />
              ))}
              {streak > 7 && (
                <span className="text-[10px] text-muted-foreground font-medium tabular-nums ml-0.5">
                  +{streak - 7}
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
