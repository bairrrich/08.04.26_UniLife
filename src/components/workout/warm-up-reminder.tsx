'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Wind, Flame, Timer, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WarmUpReminderProps {
  workoutCount: number
}

export function WarmUpReminder({ workoutCount }: WarmUpReminderProps) {
  if (workoutCount === 0) return null

  return (
    <Card className="card-hover overflow-hidden border-l-4 border-l-emerald-400">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-md shadow-emerald-500/20">
            <Wind className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-sm font-semibold">Не забудь разминку!</p>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 border-0">
                5–10 мин
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Flame className="h-3 w-3 text-orange-500" />
                Лёгкий бег + суставная гимнастика
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {['Наклоны', 'Вращения руками', 'Махи ногами', 'Приседания без веса'].map((ex) => (
                <span
                  key={ex}
                  className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 text-[10px] text-emerald-700 dark:text-emerald-300 font-medium"
                >
                  <ChevronRight className="h-2.5 w-2.5" />
                  {ex}
                </span>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
