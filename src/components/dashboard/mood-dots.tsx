'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Heart } from 'lucide-react'
import { MOOD_EMOJI, MOOD_LABELS } from '@/lib/format'
import { dayNamesShort } from './constants'

// ─── Props ────────────────────────────────────────────────────────────────────

interface MoodDotsProps {
  recentMoods: { date: string; mood: number | null }[]
  diaryStreak: number
  now: Date
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MoodDots({ recentMoods, diaryStreak, now }: MoodDotsProps) {
  return (
    <Card className="rounded-xl border">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-900/30">
              <Heart className="h-4 w-4 text-rose-500" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold truncate">Настроение за неделю</h3>
              <p className="text-[11px] text-muted-foreground">Текущая серия: <span className="font-semibold text-rose-500 dark:text-rose-400">{diaryStreak} дн.</span></p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {recentMoods.map((m, i) => {
              const moodColor = m.mood === 1 ? 'bg-red-500 dark:bg-red-400'
                : m.mood === 2 ? 'bg-orange-500 dark:bg-orange-400'
                : m.mood === 3 ? 'bg-yellow-400 dark:bg-yellow-300'
                : m.mood === 4 ? 'bg-green-500 dark:bg-green-400'
                : m.mood === 5 ? 'bg-emerald-500 dark:bg-emerald-400'
                : 'bg-gray-200 dark:bg-gray-700'
              const dayLabel = dayNamesShort[(now.getDay() - (6 - i) + 7) % 7] || dayNamesShort[i]
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div
                    className={`h-6 w-6 rounded-full transition-all duration-300 ${moodColor}`}
                    title={m.mood ? `${MOOD_EMOJI[m.mood]} ${MOOD_LABELS[m.mood]}` : 'Нет данных'}
                  />
                  <span className="text-[9px] text-muted-foreground">{dayLabel}</span>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
