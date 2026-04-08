'use client'

import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface RecentMood {
  date: string
  mood: number | null
}

interface MoodStreakProps {
  loading: boolean
  recentMoods: RecentMood[]  // last 7 days of mood data
  streak: number
  todayMood: number | null
}

// ─── Constants ────────────────────────────────────────────────────────────────

const moodEmojis: Record<number, string> = {
  1: '😢',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😄',
}

const moodBgColors: Record<number, string> = {
  1: 'bg-red-100 dark:bg-red-950/50',
  2: 'bg-amber-100 dark:bg-amber-950/50',
  3: 'bg-yellow-100 dark:bg-yellow-950/50',
  4: 'bg-lime-100 dark:bg-lime-950/50',
  5: 'bg-emerald-100 dark:bg-emerald-950/50',
}

const dayNamesShort = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const dayIndex = d.getDay() === 0 ? 6 : d.getDay() - 1
  return dayNamesShort[dayIndex]
}

function getStreakFlameSize(streak: number): string {
  if (streak >= 14) return 'text-3xl'
  if (streak >= 7) return 'text-2xl'
  return 'text-xl'
}

function getStreakLabel(streak: number): string {
  const lastDigit = streak % 10
  const lastTwo = streak % 100
  if (lastTwo >= 11 && lastTwo <= 14) return `${streak} дней подряд`
  if (lastDigit === 1) return `${streak} день подряд`
  if (lastDigit >= 2 && lastDigit <= 4) return `${streak} дня подряд`
  return `${streak} дней подряд`
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MoodStreak({ loading, recentMoods, streak, todayMood }: MoodStreakProps) {
  if (loading) {
    return (
      <Card className="rounded-xl border card-hover animate-slide-up py-3">
        <CardContent className="flex flex-col items-center justify-between gap-3 sm:flex-row sm:items-center">
          {/* Skeleton emoji circles */}
          <div className="flex items-center gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="skeleton-shimmer h-9 w-9 rounded-full" />
                <div className="skeleton-shimmer h-3 w-5 rounded" />
              </div>
            ))}
          </div>
          {/* Skeleton text */}
          <div className="flex items-center gap-2">
            <div className="skeleton-shimmer h-6 w-10 rounded" />
            <div className="skeleton-shimmer h-4 w-24 rounded" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const hasNoStreak = streak === 0 && todayMood === null
  const isToday = (mood: number | null, index: number) => index === recentMoods.length - 1

  return (
    <Card className="rounded-xl border card-hover animate-slide-up py-3">
      <CardContent className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Last 7 days mood circles */}
        <div className="flex items-center gap-2 overflow-x-auto sm:overflow-visible pb-1 sm:pb-0 scrollbar-none">
          {recentMoods.map((item, idx) => {
            const mood = item.mood
            const isTodayEntry = isToday(mood, idx)

            return (
              <div key={item.date} className="flex flex-col items-center gap-1">
                {mood !== null && mood !== undefined ? (
                  <div
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-full text-base transition-transform duration-200',
                      moodBgColors[mood],
                      isTodayEntry && 'ring-2 ring-primary ring-offset-1',
                    )}
                  >
                    {moodEmojis[mood]}
                  </div>
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-muted" />
                )}
                <span className={cn(
                  'text-[10px]',
                  isTodayEntry ? 'font-semibold text-foreground' : 'text-muted-foreground'
                )}>
                  {getDayLabel(item.date)}
                </span>
              </div>
            )
          })}
        </div>

        {/* Streak info */}
        <div className="flex items-center gap-2.5">
          {streak >= 3 && (
            <span
              className={cn(
                getStreakFlameSize(streak),
                'transition-transform duration-200',
                streak >= 7 && 'animate-pulse',
              )}
              role="img"
              aria-label="fire streak"
            >
              🔥
            </span>
          )}
          {hasNoStreak ? (
            <p className="text-sm font-medium text-muted-foreground">
              Начни серию!
            </p>
          ) : (
            <div className="flex flex-col items-end">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold tabular-nums">{streak}</span>
              </div>
              <span className="text-[11px] text-muted-foreground">
                {getStreakLabel(streak)}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
