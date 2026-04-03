'use client'

import {
  Card,
  CardContent,
} from '@/components/ui/card'

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

// ─── Component ────────────────────────────────────────────────────────────────

export function MoodStreak({ loading, recentMoods, streak, todayMood }: MoodStreakProps) {
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

  return (
    <Card className="rounded-xl border card-hover animate-slide-up py-3">
      <CardContent className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Last 7 days mood circles */}
        <div className="flex items-center gap-2">
          {recentMoods.map((item) => {
            const mood = item.mood

            return (
              <div key={item.date} className="flex flex-col items-center gap-1">
                {mood !== null && mood !== undefined ? (
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-base ${moodBgColors[mood]}`}
                  >
                    {moodEmojis[mood]}
                  </div>
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-muted" />
                )}
                <span className="text-[10px] text-muted-foreground">
                  {getDayLabel(item.date)}
                </span>
              </div>
            )
          })}
        </div>

        {/* Streak info */}
        <div className="flex items-center gap-2">
          {streak >= 3 && (
            <span className="text-xl" role="img" aria-label="fire">
              🔥
            </span>
          )}
          {hasNoStreak ? (
            <p className="text-sm font-medium text-muted-foreground">
              Начни серию!
            </p>
          ) : (
            <>
              <span className="text-2xl font-bold tabular-nums">{streak}</span>
              <span className="text-sm text-muted-foreground">дней подряд</span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
