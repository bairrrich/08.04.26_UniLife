'use client'

import { useState, useEffect, useMemo } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Flame } from 'lucide-react'

interface HabitStreak {
  id: string
  name: string
  emoji: string
  streak: number
}

export function StreaksWidget() {
  const [loading, setLoading] = useState(true)
  const [habits, setHabits] = useState<HabitStreak[]>([])

  useEffect(() => {
    async function fetchHabits() {
      try {
        const res = await fetch('/api/habits')
        if (!res.ok) throw new Error('Failed to fetch')
        const json = await res.json()
        if (json.success && Array.isArray(json.data)) {
          setHabits(json.data)
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchHabits()
  }, [])

  // Sort by streak descending, take top 5
  const topStreaks = useMemo(() => {
    return [...habits]
      .filter((h) => h.streak > 0)
      .sort((a, b) => b.streak - a.streak)
      .slice(0, 5)
  }, [habits])

  return (
    <Card className="card-hover rounded-xl border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Flame className="h-4 w-4 text-orange-500" />
          Серии
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-8 w-12 rounded-lg" />
              </div>
            ))}
          </div>
        ) : topStreaks.length > 0 ? (
          <div className="space-y-2">
            {topStreaks.map((habit, index) => (
              <div
                key={habit.id}
                className="flex items-center gap-3 rounded-xl bg-muted/40 px-4 py-3 transition-colors hover:bg-muted/70"
              >
                {/* Rank indicator */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background shadow-sm text-lg">
                  {habit.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{habit.name}</p>
                  {index === 0 && (
                    <p className="text-[10px] text-orange-500 font-semibold">🔥 Лучшая серия</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-0.5">
                  <div className="flex items-center gap-1">
                    <span className="text-lg">🔥</span>
                    <span className="text-base font-bold tabular-nums text-foreground">
                      {habit.streak}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">дней</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-950/40">
              <span className="text-2xl">🔥</span>
            </div>
            <p className="text-sm font-medium">Начните серию сегодня!</p>
            <p className="mt-1 text-xs text-muted-foreground max-w-[200px]">
              Выполняйте привычки каждый день, чтобы поддерживать серию
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
