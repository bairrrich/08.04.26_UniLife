'use client'

import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Flame, TrendingUp, Smile, BarChart3, Zap } from 'lucide-react'
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
    3: 'bg-gray-400 dark:bg-gray-500',
    4: 'bg-green-400 dark:bg-green-500',
    5: 'bg-emerald-400 dark:bg-emerald-500',
  }
  return colors[mood] || 'bg-muted'
}

function getMoodBarBg(mood: number): string {
  const colors: Record<number, string> = {
    1: 'bg-red-100 dark:bg-red-950/50',
    2: 'bg-orange-100 dark:bg-orange-950/50',
    3: 'bg-gray-100 dark:bg-gray-800/40',
    4: 'bg-green-100 dark:bg-green-950/50',
    5: 'bg-emerald-100 dark:bg-emerald-950/50',
  }
  return colors[mood] || 'bg-muted/50'
}

// Color tint for stat cards based on average mood
function getMoodStatTint(mood: number | null): { bg: string; border: string; text: string } {
  if (!mood) return {
    bg: 'bg-gradient-to-b from-gray-50/80 to-transparent dark:from-gray-950/30 dark:to-transparent',
    border: 'border border-gray-200/60 dark:border-gray-800/30',
    text: 'text-gray-600 dark:text-gray-400',
  }
  if (mood <= 2) return {
    bg: 'bg-gradient-to-b from-red-50/80 to-transparent dark:from-red-950/30 dark:to-transparent',
    border: 'border border-red-200/60 dark:border-red-900/30',
    text: 'text-red-600 dark:text-red-400',
  }
  if (mood <= 3) return {
    bg: 'bg-gradient-to-b from-gray-50/80 to-transparent dark:from-gray-950/30 dark:to-transparent',
    border: 'border border-gray-200/60 dark:border-gray-800/30',
    text: 'text-gray-600 dark:text-gray-400',
  }
  if (mood <= 4) return {
    bg: 'bg-gradient-to-b from-green-50/80 to-transparent dark:from-green-950/30 dark:to-transparent',
    border: 'border border-green-200/60 dark:border-green-900/30',
    text: 'text-green-600 dark:text-green-400',
  }
  return {
    bg: 'bg-gradient-to-b from-emerald-50/80 to-transparent dark:from-emerald-950/30 dark:to-transparent',
    border: 'border border-emerald-200/60 dark:border-emerald-900/30',
    text: 'text-emerald-600 dark:text-emerald-400',
  }
}

// Trend line dot color based on mood value
function getTrendDotColor(mood: number | null): string {
  if (!mood) return 'bg-muted-foreground/20'
  if (mood <= 1) return 'bg-red-400 dark:bg-red-400'
  if (mood <= 2) return 'bg-orange-400 dark:bg-orange-400'
  if (mood <= 3) return 'bg-gray-400 dark:bg-gray-400'
  if (mood <= 4) return 'bg-green-400 dark:bg-green-400'
  return 'bg-emerald-400 dark:bg-emerald-400'
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

    while (streak < 365) {
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

  // Good mood streak (consecutive days with mood 4 or 5, counting backwards from today)
  const goodMoodStreak = useMemo(() => {
    let streak = 0
    const moodMap = new Map<string, number>()
    for (const entry of entries) {
      if (entry.mood !== null) {
        const key = formatDateKey(parseEntryDate(entry.date))
        if (!moodMap.has(key)) {
          moodMap.set(key, entry.mood)
        }
      }
    }

    const checkDate = new Date(today)
    checkDate.setHours(0, 0, 0, 0)

    while (streak < 365) {
      const key = formatDateKey(checkDate)
      const mood = moodMap.get(key)
      if (mood && mood >= 4) {
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

  // Color tinting based on average mood
  const avgMoodTint = getMoodStatTint(avgMood !== null ? Math.round(avgMood) : null)
  const freqMoodTint = getMoodStatTint(mostFrequentMood)

  // ─── Weekly Mood Trend Line (CSS-based) ───────────────────────────
  const trendDays = weekData
  const weekMoods = trendDays.map(d => d.mood)

  // Build the SVG path for the trend line
  const trendPath = useMemo(() => {
    const validPoints: { x: number; y: number }[] = []
    const width = 100
    const height = 28
    const padding = 6

    for (let i = 0; i < weekMoods.length; i++) {
      const mood = weekMoods[i]
      if (mood !== null) {
        const x = padding + (i / 6) * (width - padding * 2)
        const y = height - padding - ((mood - 1) / 4) * (height - padding * 2)
        validPoints.push({ x, y })
      }
    }

    if (validPoints.length === 0) return null
    if (validPoints.length === 1) {
      return { d: '', points: validPoints, gradientId: 'mood-trend-grad' }
    }

    // Build smooth path using line segments
    let d = `M ${validPoints[0].x} ${validPoints[0].y}`
    for (let i = 1; i < validPoints.length; i++) {
      d += ` L ${validPoints[i].x} ${validPoints[i].y}`
    }

    return { d, points: validPoints, gradientId: 'mood-trend-grad' }
  }, [weekMoods])

  return (
    <Card className={cn('rounded-xl border overflow-hidden card-hover', className)}>
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

          {/* Weekly Mood Trend Line (CSS/SVG-based) */}
          {trendPath && trendPath.points.length >= 2 && (
            <div className="mt-2 rounded-lg bg-muted/20 border border-border/30 p-2">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  Тренд недели
                </span>
              </div>
              <svg viewBox="0 0 100 28" className="w-full h-7" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="mood-trend-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="oklch(0.65 0.17 155)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="oklch(0.65 0.17 155)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Area fill under the line */}
                {trendPath.points.length >= 2 && (
                  <path
                    d={`${trendPath.d} L ${trendPath.points[trendPath.points.length - 1].x} 28 L ${trendPath.points[0].x} 28 Z`}
                    fill="url(#mood-trend-grad)"
                    className="transition-all duration-500"
                  />
                )}
                {/* Line */}
                <path
                  d={trendPath.d}
                  fill="none"
                  stroke="oklch(0.55 0.17 155)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-500"
                />
                {/* Dots */}
                {trendDays.map((day, i) => {
                  const mood = weekMoods[i]
                  if (mood === null) return null
                  const x = 6 + (i / 6) * 88
                  const y = 28 - 6 - ((mood - 1) / 4) * 16

                  return (
                    <g key={day.dateKey}>
                      <circle
                        cx={x}
                        cy={y}
                        r={day.isToday ? 2.5 : 1.8}
                        className={cn(
                          'transition-all duration-300',
                          day.isToday && 'ring-[1] ring-white dark:ring-gray-900'
                        )}
                        fill={
                          mood <= 1 ? '#f87171' :
                          mood <= 2 ? '#fb923c' :
                          mood <= 3 ? '#9ca3af' :
                          mood <= 4 ? '#4ade80' :
                          '#34d399'
                        }
                      />
                    </g>
                  )
                })}
              </svg>
              {/* Day labels under the trend */}
              <div className="flex justify-between px-0.5">
                {trendDays.map((day) => (
                  <span
                    key={day.dateKey}
                    className={cn(
                      'text-[8px] font-medium tabular-nums',
                      day.isToday ? 'text-primary' : 'text-muted-foreground/40'
                    )}
                  >
                    {day.dayLabel}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2">
          {/* Average Mood */}
          <div className={cn(
            'rounded-lg p-2.5 text-center',
            avgMoodTint.bg,
            avgMoodTint.border
          )}>
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <TrendingUp className={cn('h-3 w-3', avgMoodTint.text)} />
              <span className="text-[10px] text-muted-foreground font-medium">Среднее</span>
            </div>
            {avgMood !== null ? (
              <>
                <div className="text-2xl leading-none mb-0.5">{MOOD_EMOJI[Math.round(avgMood)]}</div>
                <div className={cn('text-sm font-bold tabular-nums', avgMoodTint.text)}>
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
            freqMoodTint.bg,
            freqMoodTint.border
          )}>
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Smile className={cn('h-3 w-3', freqMoodTint.text)} />
              <span className="text-[10px] text-muted-foreground font-medium">Частое</span>
            </div>
            {mostFrequentMood ? (
              <>
                <div className="text-2xl leading-none mb-0.5">{MOOD_EMOJI[mostFrequentMood]}</div>
                <div className={cn('text-[11px] font-semibold leading-tight', freqMoodTint.text)}>
                  {MOOD_LABELS[mostFrequentMood]}
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground/50">—</div>
            )}
          </div>

          {/* Good Mood Streak */}
          <div className={cn(
            'rounded-lg p-2.5 text-center',
            goodMoodStreak >= 3
              ? 'bg-gradient-to-b from-emerald-50/80 to-transparent dark:from-emerald-950/30 dark:to-transparent border border-emerald-200/60 dark:border-emerald-900/30'
              : goodMoodStreak >= 1
                ? 'bg-gradient-to-b from-green-50/80 to-transparent dark:from-green-950/30 dark:to-transparent border border-green-200/60 dark:border-green-900/30'
                : 'bg-gradient-to-b from-gray-50/80 to-transparent dark:from-gray-950/30 dark:to-transparent border border-gray-200/60 dark:border-gray-800/30'
          )}>
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Zap className={cn(
                'h-3 w-3',
                goodMoodStreak >= 3 ? 'text-emerald-500' :
                goodMoodStreak >= 1 ? 'text-green-500' :
                'text-muted-foreground/50'
              )} />
              <span className="text-[10px] text-muted-foreground font-medium">Серия</span>
            </div>
            {goodMoodStreak > 0 ? (
              <>
                <div className="flex items-center justify-center gap-0.5 text-xl font-bold tabular-nums leading-none mb-0.5 animate-count-fade-in">
                  {goodMoodStreak}
                  <span className="text-sm">{goodMoodStreak >= 3 ? '🔥' : '✨'}</span>
                </div>
                <div className="text-[10px] text-muted-foreground font-medium">
                  {goodMoodStreak === 1 ? 'хор. день' : goodMoodStreak < 5 ? 'хор. дня' : 'хор. дней'}
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground/50">—</div>
            )}
          </div>
        </div>

        {/* Mood Tracking Streak (original — all moods) + Good Mood Streak Indicator */}
        {moodStreak > 0 && (
          <div className="flex items-center gap-3 rounded-lg bg-muted/30 border border-border/30 px-3 py-2">
            <div className="flex items-center gap-1.5">
              <Flame className={cn(
                'h-3.5 w-3.5',
                moodStreak >= 3 ? 'text-orange-500' : 'text-muted-foreground/50'
              )} />
              <span className="text-xs font-medium text-muted-foreground">
                Серия отслеживания:
              </span>
              <span className={cn(
                'text-xs font-bold tabular-nums',
                moodStreak >= 3 ? 'text-orange-600 dark:text-orange-400' : 'text-foreground'
              )}>
                {moodStreak} {moodStreak === 1 ? 'день' : moodStreak < 5 ? 'дня' : 'дней'}
              </span>
            </div>
            {goodMoodStreak > 0 && (
              <>
                <div className="h-3 w-px bg-border/50" />
                <div className="flex items-center gap-1.5">
                  <Zap className={cn(
                    'h-3.5 w-3.5',
                    goodMoodStreak >= 3 ? 'text-emerald-500' : 'text-green-500'
                  )} />
                  <span className="text-xs font-medium text-muted-foreground">
                    Хорошее настроение:
                  </span>
                  <span className={cn(
                    'text-xs font-bold tabular-nums',
                    goodMoodStreak >= 3 ? 'text-emerald-600 dark:text-emerald-400' : 'text-green-600 dark:text-green-400'
                  )}>
                    {goodMoodStreak} {goodMoodStreak === 1 ? 'день' : goodMoodStreak < 5 ? 'дня' : 'дней'}
                  </span>
                  {goodMoodStreak >= 3 && (
                    <span className="text-xs">🔥</span>
                  )}
                </div>
              </>
            )}
          </div>
        )}

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
