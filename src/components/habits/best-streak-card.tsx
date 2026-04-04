'use client'

import { Flame } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { HabitData } from './types'

interface BestStreakCardProps {
  habits: HabitData[]
}

export function BestStreakCard({ habits }: BestStreakCardProps) {
  const bestHabit = [...habits].sort((a, b) => b.streak - a.streak)[0]
  if (!bestHabit || bestHabit.streak === 0) return null

  return (
    <Card className="card-hover rounded-xl border overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent pointer-events-none" />
      <CardContent className="relative p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/20">
              <Flame className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Лучшая серия</h3>
              <p className="text-xs text-muted-foreground">Привычка с самой длинной серией</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{bestHabit.emoji}</span>
            <div className="text-right">
              <p className="text-sm font-medium">{bestHabit.name}</p>
              <div className="flex items-center gap-1 justify-end">
                <span className="text-lg">🔥</span>
                <span className="text-lg font-bold tabular-nums text-orange-600 dark:text-orange-400">{bestHabit.streak}</span>
                <span className="text-[10px] text-muted-foreground">дн.</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
