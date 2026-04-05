'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { MOOD_EMOJI } from '@/lib/format'
import { DiaryEntry } from './types'
import { formatDateKey, parseEntryDate } from './helpers'

interface MoodTrendProps {
  entries: DiaryEntry[]
  today: Date
  className?: string
}

export function MoodTrend({ entries, today, className }: MoodTrendProps) {
  const weekData = useMemo(() => {
    const data: { dateKey: string; dayLabel: string; mood: number | null; isToday: boolean }[] = []

    // Build a quick lookup: dateKey → first entry's mood
    const moodMap = new Map<string, number | null>()
    for (const entry of entries) {
      const key = formatDateKey(parseEntryDate(entry.date))
      if (!moodMap.has(key)) {
        moodMap.set(key, entry.mood)
      }
    }

    // Last 7 days (from 6 days ago to today)
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = formatDateKey(d)
      const isToday = i === 0
      const dayLabel = format(d, 'EEE', { locale: ru })

      data.push({
        dateKey: key,
        dayLabel,
        mood: moodMap.get(key) ?? null,
        isToday,
      })
    }

    return data
  }, [entries, today])

  // Calculate average mood for the week
  const avgMood = useMemo(() => {
    const moods = weekData.filter((d) => d.mood !== null).map((d) => d.mood!)
    if (moods.length === 0) return null
    return moods.reduce((a, b) => a + b, 0) / moods.length
  }, [weekData])

  const maxBarHeight = 40 // px
  const minBarHeight = 4 // px

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex items-end gap-[6px] h-[52px]">
        {weekData.map((d, idx) => {
          const height = d.mood
            ? minBarHeight + ((d.mood / 5) * (maxBarHeight - minBarHeight))
            : minBarHeight + 2 // default empty bar height

          return (
            <div key={d.dateKey} className="flex flex-col items-center gap-[3px]">
              {/* Bar */}
              <div
                className={cn(
                  'w-[10px] rounded-sm transition-all duration-300',
                  d.mood
                    ? 'bg-gradient-to-t from-emerald-500 to-emerald-400 shadow-sm shadow-emerald-500/30'
                    : 'bg-muted',
                  d.isToday && d.mood && 'ring-1 ring-emerald-300 dark:ring-emerald-600'
                )}
                style={{ height: `${height}px` }}
                title={
                  d.mood
                    ? `${d.dayLabel}: ${MOOD_EMOJI[d.mood]} ${d.mood}/5`
                    : `${d.dayLabel}: нет данных`
                }
              />
              {/* Day label */}
              <span
                className={cn(
                  'text-[9px] leading-none font-medium',
                  d.isToday ? 'text-primary' : 'text-muted-foreground/60'
                )}
              >
                {d.dayLabel}
              </span>
            </div>
          )
        })}
      </div>

      {/* Average badge */}
      {avgMood !== null && (
        <div className="ml-1 flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5">
          <span className="text-xs">{MOOD_EMOJI[Math.round(avgMood)]}</span>
          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
            {avgMood.toFixed(1)}
          </span>
        </div>
      )}
    </div>
  )
}
