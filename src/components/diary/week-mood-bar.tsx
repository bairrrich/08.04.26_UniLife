'use client'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { MOOD_COLORS, MOOD_EMOJI, MOOD_LABELS } from '@/lib/format'

interface WeekMoodBarProps {
  todayMood: number | null
  onQuickMood: (mood: number) => void
}

export function WeekMoodBar({ todayMood, onQuickMood }: WeekMoodBarProps) {
  return (
    <Card className="card-hover rounded-xl border overflow-hidden">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className={cn(
              'flex h-12 w-12 items-center justify-center rounded-xl text-2xl',
              todayMood ? MOOD_COLORS[todayMood] : 'bg-muted'
            )}>
              {todayMood ? MOOD_EMOJI[todayMood] : '😶'}
            </div>
            <div>
              <p className="text-sm font-semibold">
                {todayMood ? `Настроение: ${MOOD_LABELS[todayMood]}` : 'Как настроение сегодня?'}
              </p>
              <p className="text-xs text-muted-foreground">
                {todayMood ? 'Нажмите, чтобы изменить' : 'Выберите эмодзи ниже'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => onQuickMood(m)}
                className={cn(
                  'h-10 w-10 rounded-xl flex items-center justify-center text-xl transition-all duration-200',
                  'hover:scale-110 active-press',
                  todayMood === m
                    ? cn('ring-2 ring-offset-2 ring-primary scale-105', MOOD_COLORS[m])
                    : 'bg-muted/50 hover:bg-muted'
                )}
                title={MOOD_LABELS[m]}
              >
                {MOOD_EMOJI[m]}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
