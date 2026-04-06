'use client'

import { useMemo } from 'react'
import { Flame } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DiaryEntry } from './types'
import { formatDateKey, parseEntryDate } from './helpers'

interface WritingStreakBadgeProps {
  entries: DiaryEntry[]
  today: Date
  className?: string
}

export function WritingStreakBadge({ entries, today, className }: WritingStreakBadgeProps) {
  const streak = useMemo(() => {
    // Build set of unique date keys
    const dateKeys = new Set<string>()
    for (const entry of entries) {
      dateKeys.add(formatDateKey(parseEntryDate(entry.date)))
    }

    const todayStr = formatDateKey(today)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = formatDateKey(yesterday)

    // Streak must start from today or yesterday
    if (!dateKeys.has(todayStr) && !dateKeys.has(yesterdayStr)) return 0

    let count = 0
    const checkDate = new Date(today)

    while (true) {
      const key = formatDateKey(checkDate)
      if (dateKeys.has(key)) {
        count++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }

    return count
  }, [entries, today])

  if (streak < 2) return null

  return (
    <div className={cn(
      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1',
      'bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-950/40 dark:to-amber-950/40',
      'border border-orange-200/50 dark:border-orange-800/30',
      className
    )}>
      <Flame className={cn(
        'h-4 w-4',
        streak >= 7 ? 'text-orange-500' : streak >= 3 ? 'text-amber-500' : 'text-yellow-500'
      )} />
      <span className={cn(
        'text-xs font-bold tabular-nums',
        streak >= 7 ? 'text-orange-600 dark:text-orange-400' : streak >= 3 ? 'text-amber-600 dark:text-amber-400' : 'text-yellow-600 dark:text-yellow-400'
      )}>
        {streak}
      </span>
      <span className="text-[10px] text-muted-foreground font-medium hidden sm:inline">
        {streak === 1 ? 'день' : streak < 5 ? 'дня' : 'дней'}
      </span>
    </div>
  )
}
