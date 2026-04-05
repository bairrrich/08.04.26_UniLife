'use client'

import { Flame } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { HabitData } from './types'

interface StreakRecordsProps {
  habits: HabitData[]
}

const RANK_STYLES = [
  'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  'bg-gray-100 text-gray-600 dark:bg-gray-800/40 dark:text-gray-400',
  'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
  'bg-muted text-muted-foreground',
]

export function StreakRecords({ habits }: StreakRecordsProps) {
  const ranked = habits
    .filter(h => h.streak > 0)
    .sort((a, b) => b.streak - a.streak)
    .slice(0, 5)

  return (
    <Card className="card-hover rounded-xl border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Flame className="h-4 w-4 text-orange-500" />
          Рекорды привычек
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {ranked.map((habit, index) => (
            <div key={habit.id} className="flex items-center gap-3 rounded-lg bg-muted/30 px-3 py-2.5">
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold tabular-nums ${RANK_STYLES[index] ?? RANK_STYLES[3]}`}>
                {index + 1}
              </span>
              <span className="text-lg">{habit.emoji}</span>
              <span className="flex-1 text-sm font-medium">{habit.name}</span>
              <div className="flex items-center gap-1">
                <Flame className="h-3.5 w-3.5 text-orange-500" />
                <span className="text-sm font-semibold tabular-nums text-orange-600 dark:text-orange-400">{habit.streak}</span>
                <span className="text-[10px] text-muted-foreground">дн.</span>
              </div>
            </div>
          ))}
          {ranked.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Начните выполнять привычки, чтобы здесь появились рекорды
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
