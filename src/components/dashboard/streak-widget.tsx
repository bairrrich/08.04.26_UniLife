'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Flame, Trophy, BookOpen, Dumbbell, Target } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

// ─── Props ────────────────────────────────────────────────────────────────────

interface StreakItem {
  icon: ReactNode
  name: string
  streak: number
}

interface StreakWidgetProps {
  loading: boolean
  streakItems: StreakItem[]
  maxStreak: number
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function StreakWidget({ loading, streakItems, maxStreak }: StreakWidgetProps) {
  return (
    <Card className="animate-slide-up card-hover rounded-xl border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 shadow-sm">
            <Flame className="h-4 w-4 text-white" />
          </div>
          Рекорды серий
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="stagger-children space-y-2">
            {streakItems.map((item) => (
              <div
                key={item.name}
                className="flex min-h-[44px] items-center gap-3 rounded-xl bg-muted/40 px-4 py-3 transition-colors hover:bg-muted/70"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background shadow-sm">
                  {item.icon}
                </div>
                <span className="flex-1 text-sm font-medium">{item.name}</span>
                <div className="flex items-center gap-1.5">
                  {item.streak >= 7 && <span className="text-base">🔥</span>}
                  {item.streak === maxStreak && maxStreak > 0 && (
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400">
                      <Trophy className="mr-1 h-3 w-3" />
                      Рекорд
                    </Badge>
                  )}
                  <span className={cn(
                      'text-base font-bold tabular-nums',
                      item.streak >= 7 ? 'text-gradient-emerald' : 'text-foreground'
                    )}>
                    {item.streak}
                  </span>
                  <span className="text-xs text-muted-foreground">дней</span>
                </div>
              </div>
            ))}
            {maxStreak === 0 && (
              <p className="py-2 text-center text-xs text-muted-foreground">
                Начните отслеживать активности, чтобы увидеть серии
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
