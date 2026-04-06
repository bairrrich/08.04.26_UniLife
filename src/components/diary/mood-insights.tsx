'use client'

import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Flame, TrendingUp, Smile, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MOOD_EMOJI, MOOD_LABELS, MOOD_COLORS, RU_DAYS_SHORT } from '@/lib/format'
import { DiaryEntry } from './types'
import { formatDateKey, parseEntryDate } from './helpers'

// ─── Types ─────────────────────────────────────────────────────────────────

interface WeekDayData {
  dateKey: string
  dayLabel: string
  dayIndex: number
  mood: number | null
  isToday: boolean
  hasEntry: boolean
}

interface MoodInsightsProps {
  entries: DiaryEntry[]
  today: Date
  className?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function getMonday(d: Date): Date {
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(d)
  monday.setDate(d.getDate() + diff)
  monday.setHours(0, 0, 0, 0)
  return monday
}

function getMoodBarColor(mood: number): string {
  const colors: Record<number, string> = {
    1: 'bg-red-400 dark:bg-red-500',
    2: 'bg-orange-400 dark:bg-orange-500',
    3: 'bg-yellow-400 dark:bg-yellow-500',
    4: 'bg-lime-400 dark:bg-lime-500',
    5: 'bg-emerald-400 dark:bg-emerald-500',
  }
  return colors[mood] || 'bg-muted'
}

function getMoodBarBg(mood: number): string {
  const colors: Record<number, string> = {
    1: 'bg-red-100 dark:bg-red-950/50',
    2: 'bg-orange-100 dark:bg-orange-950/50',
    3: 'bg-yellow-100 dark:bg-yellow-950/50',
    4: 'bg-lime-100 dark:bg-lime-950/50',
    5: 'bg-emerald-100 dark:bg-emerald-950/50',
  }
  return colors[mood] || 'bg-muted/50'
}

// ─── Component ─────────────────────────────────────────────────────────────

export function MoodInsights({ entries, today, className }: MoodInsightsProps) {
  // Build week data (Mon-Sun)
  const weekData = useMemo<WeekDayData[]>(() => {
    const monday = getMonday(today)
    const moodMap = new Map<string, { mood: number | null; hasEntry: boolean }>()

    for (const entry of entries) {
      const key = formatDateKey(parseEntryDate(entry.date))
      if (!moodMap.has(key)) {
        moodMap.set(key, { mood: null, hasEntry: false })
      }
      const existing = moodMap.get(key)!
      existing.hasEntry = true
      if (entry.mood !== null && existing.mood === null) {
        existing.mood = entry.mood
      }
    }

    const data: WeekDayData[] = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      const key = formatDateKey(d)
      const info = moodMap.get(key)

      data.push({
        dateKey: key,
        dayLabel: RU_DAYS_SHORT[i],
        dayIndex: i,
        mood: info?.mood ?? null,
        isToday: i === (today.getDay() === 0 ? 6 : today.getDay() - 1),
        hasEntry: info?.hasEntry ?? false,
      })
    }

    return data
  }, [entries, today])

  // Mood streak (consecutive days with mood logged, counting backwards from today)
  const moodStreak = useMemo(() => {
    let streak = 0
    const dateKeys = new Set<string>()
    for (const entry of entries) {
      if (entry.mood !== null) {
        dateKeys.add(formatDateKey(parseEntryDate(entry.date)))
      }
    }

    const checkDate = new Date(today)
    checkDate.setHours(0, 0, 0, 0)

    while (true) {
      const key = formatDateKey(checkDate)
      if (dateKeys.has(key)) {
        streak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }

    return streak
  }, [entries, today])

  // Most frequent mood this week
  const mostFrequentMood = useMemo(() => {
    const moodCounts = new Map<number, number>()
    for (const day of weekData) {
      if (day.mood !== null) {
        moodCounts.set(day.mood, (moodCounts.get(day.mood) || 0) + 1)
      }
    }

    if (moodCounts.size === 0) return null

    let bestMood = 0
    let bestCount = 0
    for (const [mood, count] of moodCounts) {
      if (count > bestCount || (count === bestCount && mood > bestMood)) {
        bestMood = mood
        bestCount = count
      }
    }

    return bestMood
  }, [weekData])

  // Average mood score
  const avgMood = useMemo(() => {
    const moods = weekData.filter((d) => d.mood !== null).map((d) => d.mood!)
    if (moods.length === 0) return null
    return moods.reduce((a, b) => a + b, 0) / moods.length
  }, [weekData])

  // Days with mood this week
  const daysWithMood = weekData.filter((d) => d.mood !== null).length

  // Mood distribution (counts per mood level)
  const moodDistribution = useMemo(() => {
    const dist = [0, 0, 0, 0, 0] // index 0 = mood 1, etc.
    for (const day of weekData) {
      if (day.mood !== null && day.mood >= 1 && day.mood <= 5) {
        dist[day.mood - 1]++
      }
    }
    return dist
  }, [weekData])

  const maxDist = Math.max(...moodDistribution, 1)

  return (
    <Card className={cn('rounded-xl border overflow-hidden', className)}>
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shadow-sm">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold">Аналитика настроения</span>
          </div>
          <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground border-dashed">
            Эта неделя
          </Badge>
        </div>

        {/* Week Mood Distribution Bar Chart */}
        <div className="space-y-2">
          <div className="grid grid-cols-7 gap-1.5">
            {weekData.map((day) => {
              const barHeight = day.mood ? Math.max(8, (day.mood / 5) * 56) : 4

              return (
                <div key={day.dateKey} className="flex flex-col items-center gap-1">
                  {/* Emoji on top */}
                  {day.mood ? (
                    <span className="text-sm leading-none">{MOOD_EMOJI[day.mood]}</span>
                  ) : (
                    <span className="text-sm leading-none text-muted-foreground/30">—</span>
                  )}
                  {/* Bar */}
                  <div className={cn('w-full rounded-md overflow-hidden', getMoodBarBg(day.mood ?? 3), 'h-14 relative')}>
                    <div
                      className={cn(
                        'absolute bottom-0 left-0 right-0 rounded-md transition-all duration-500',
                        day.mood ? getMoodBarColor(day.mood) : 'bg-muted/30',
                        day.mood && 'shadow-sm'
                      )}
                      style={{ height: `${barHeight}px` }}
                    />
                  </div>
                  {/* Day label */}
                  <span
                    className={cn(
                      'text-[10px] font-medium tabular-nums',
                      day.isToday ? 'text-primary' : 'text-muted-foreground/60'
                    )}
                  >
                    {day.dayLabel}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2">
          {/* Average Mood */}
          <div className={cn(
            'rounded-lg p-2.5 text-center',
            'bg-gradient-to-b from-violet-50/80 to-transparent dark:from-violet-950/30 dark:to-transparent',
            'border border-violet-100/60 dark:border-violet-900/30'
          )}>
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <TrendingUp className="h-3 w-3 text-violet-500" />
              <span className="text-[10px] text-muted-foreground font-medium">Среднее</span>
            </div>
            {avgMood !== null ? (
              <>
                <div className="text-2xl leading-none mb-0.5">{MOOD_EMOJI[Math.round(avgMood)]}</div>
                <div className="text-sm font-bold text-violet-700 dark:text-violet-400 tabular-nums">
                  {avgMood.toFixed(1)}
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground/50">—</div>
            )}
          </div>

          {/* Most Frequent Mood */}
          <div className={cn(
            'rounded-lg p-2.5 text-center',
            'bg-gradient-to-b from-amber-50/80 to-transparent dark:from-amber-950/30 dark:to-transparent',
            'border border-amber-100/60 dark:border-amber-900/30'
          )}>
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Smile className="h-3 w-3 text-amber-500" />
              <span className="text-[10px] text-muted-foreground font-medium">Частое</span>
            </div>
            {mostFrequentMood ? (
              <>
                <div className="text-2xl leading-none mb-0.5">{MOOD_EMOJI[mostFrequentMood]}</div>
                <div className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 leading-tight">
                  {MOOD_LABELS[mostFrequentMood]}
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground/50">—</div>
            )}
          </div>

          {/* Mood Streak */}
          <div className={cn(
            'rounded-lg p-2.5 text-center',
            moodStreak >= 3
              ? 'bg-gradient-to-b from-orange-50/80 to-transparent dark:from-orange-950/30 dark:to-transparent border border-orange-100/60 dark:border-orange-900/30'
              : 'bg-gradient-to-b from-slate-50/80 to-transparent dark:from-slate-950/30 dark:to-transparent border border-slate-100/60 dark:border-slate-800/30'
          )}>
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Flame className={cn(
                'h-3 w-3',
                moodStreak >= 3 ? 'text-orange-500' : 'text-muted-foreground/50'
              )} />
              <span className="text-[10px] text-muted-foreground font-medium">Серия</span>
            </div>
            {moodStreak > 0 ? (
              <>
                <div className="text-xl font-bold tabular-nums leading-none mb-0.5 animate-count-fade-in">
                  {moodStreak}
                </div>
                <div className="text-[10px] text-muted-foreground font-medium">
                  {moodStreak === 1 ? 'день' : moodStreak < 5 ? 'дня' : 'дней'}
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground/50">—</div>
            )}
          </div>
        </div>

        {/* Mood Distribution Mini Bars */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              Распределение
            </span>
            <span className="text-[10px] text-muted-foreground/60 tabular-nums">
              {daysWithMood} из 7 дней
            </span>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((mood) => {
              const count = moodDistribution[mood - 1]
              const widthPercent = maxDist > 0 ? (count / maxDist) * 100 : 0

              return (
                <div key={mood} className="flex-1 flex flex-col items-center gap-0.5">
                  {/* Count */}
                  <span className={cn(
                    'text-[9px] tabular-nums font-semibold',
                    count > 0 ? 'text-foreground/70' : 'text-muted-foreground/30'
                  )}>
                    {count > 0 ? count : ''}
                  </span>
                  {/* Bar */}
                  <div className="w-full h-2 rounded-full bg-muted/40 overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        count > 0 ? getMoodBarColor(mood) : 'bg-transparent'
                      )}
                      style={{ width: `${Math.max(widthPercent, count > 0 ? 15 : 0)}%` }}
                    />
                  </div>
                  {/* Emoji */}
                  <span className="text-xs leading-none">{MOOD_EMOJI[mood]}</span>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
