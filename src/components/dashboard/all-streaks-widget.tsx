'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Flame } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AllStreaksWidgetProps {
  diaryStreak: number
  workoutStreak: number
  habitsStreak: number
  loading: boolean
}

interface StreakCardData {
  emoji: string
  label: string
  value: number
}

// ─── Russian Pluralization ────────────────────────────────────────────────────

function pluralizeDays(n: number): string {
  const abs = Math.abs(n) % 100
  const lastDigit = abs % 10
  if (abs > 10 && abs < 20) return 'дней'
  if (lastDigit === 1) return 'день'
  if (lastDigit >= 2 && lastDigit <= 4) return 'дня'
  return 'дней'
}

// ─── Animated Counter Hook ────────────────────────────────────────────────────

function useAnimatedCounter(target: number, duration = 800): number {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (target === 0) {
      setCurrent(0)
      return
    }

    const steps = 20
    const stepValue = target / steps
    const interval = duration / steps
    let count = 0

    const timer = setInterval(() => {
      count++
      if (count >= steps) {
        setCurrent(target)
        clearInterval(timer)
      } else {
        setCurrent(Math.round(stepValue * count))
      }
    }, interval)

    return () => clearInterval(timer)
  }, [target, duration])

  return current
}

// ─── Skeleton Shimmer for Loading ─────────────────────────────────────────────

function StreakCardSkeleton() {
  return (
    <div className="skeleton-shimmer rounded-xl p-4">
      <div className="mb-2 h-8 w-8 rounded-lg bg-muted/60" />
      <div className="mb-1 h-6 w-16 rounded bg-muted/60" />
      <div className="h-3 w-20 rounded bg-muted/60" />
    </div>
  )
}

// ─── Individual Streak Card ───────────────────────────────────────────────────

function StreakCard({ data, index }: { data: StreakCardData; index: number }) {
  const animatedValue = useAnimatedCounter(data.value)
  const isActive = data.value > 0
  const isHot = data.value >= 7

  return (
    <div
      className={cn(
        'animate-slide-up rounded-xl border p-4 transition-all duration-300',
        isActive
          ? 'border-emerald-200/60 bg-emerald-50/50 shadow-sm dark:border-emerald-800/30 dark:bg-emerald-950/20'
          : 'border-border bg-muted/30'
      )}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Emoji icon */}
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-background/80 text-lg shadow-sm">
        {data.emoji}
      </div>

      {/* Streak count */}
      <div className="flex items-baseline gap-1.5">
        <span
          className={cn(
            'text-2xl font-bold tabular-nums leading-none',
            isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground/50'
          )}
        >
          {animatedValue}
        </span>
        {isHot && <span className="text-base">🔥</span>}
      </div>

      {/* Label with pluralized word */}
      <p
        className={cn(
          'mt-0.5 text-xs font-medium',
          isActive ? 'text-emerald-700/80 dark:text-emerald-400/70' : 'text-muted-foreground/50'
        )}
      >
        {data.value > 0 ? `${pluralizeDays(data.value)}` : 'Нет серии'}
      </p>

      {/* Module name */}
      <p className="mt-1 text-[11px] text-muted-foreground">
        {data.label}
      </p>
    </div>
  )
}

// ─── Main Widget ──────────────────────────────────────────────────────────────

export default function AllStreaksWidget({
  diaryStreak,
  workoutStreak,
  habitsStreak,
  loading,
}: AllStreaksWidgetProps) {
  const streaks: StreakCardData[] = [
    { emoji: '📋', label: 'Дневник', value: diaryStreak },
    { emoji: '💪', label: 'Тренировки', value: workoutStreak },
    { emoji: '✅', label: 'Привычки', value: habitsStreak },
  ]

  const maxStreak = Math.max(diaryStreak, workoutStreak, habitsStreak)

  if (loading) {
    return (
      <Card className="glass-card animate-slide-up card-hover rounded-xl border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <span>🔥</span>
            Все серии
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <StreakCardSkeleton key={i} />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass-card animate-slide-up card-hover rounded-xl border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <span>🔥</span>
            Все серии
          </CardTitle>
          {maxStreak > 0 && (
            <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 dark:bg-amber-950/30">
              <Flame className="h-3 w-3 text-amber-500" />
              <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 tabular-nums">
                Макс: {maxStreak} дн.
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="stagger-children grid grid-cols-3 gap-3">
          {streaks.map((streak, index) => (
            <StreakCard key={streak.label} data={streak} index={index} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
