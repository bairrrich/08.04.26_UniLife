'use client'

import { useEffect, useState } from 'react'
import { BookOpen, Calendar, Flame, FileText, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AnimatedNumber } from '@/components/ui/animated-number'

export interface DiaryStats {
  totalEntries: number
  thisMonthEntries: number
  currentStreak: number
  averageWords: number
  longestEntry: { title: string; wordCount: number } | null
}

interface WritingStatsWidgetProps {
  className?: string
}

function StatCard({
  icon: Icon,
  value,
  label,
  iconColor,
  subValue,
}: {
  icon: React.ComponentType<{ className?: string }>
  value: number
  label: string
  iconColor: string
  subValue?: string
}) {
  return (
    <div className="glass-card rounded-xl p-3 min-w-[130px] flex-1 hover-lift active-press">
      <div className="flex items-center gap-2.5">
        <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0', iconColor)}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="text-lg font-bold tabular-nums leading-tight">
            <AnimatedNumber value={value} duration={500} />
          </div>
          <p className="text-[11px] text-muted-foreground leading-tight truncate">{label}</p>
        </div>
      </div>
      {subValue && (
        <p className="text-[10px] text-muted-foreground/60 mt-1.5 pl-[46px] truncate">{subValue}</p>
      )}
    </div>
  )
}

export function WritingStatsWidget({ className }: WritingStatsWidgetProps) {
  const [stats, setStats] = useState<DiaryStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/diary/stats')
        const json = await res.json()
        if (json && json.data) {
          setStats(json.data)
        }
      } catch (err) {
        console.error('Failed to fetch diary stats:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className={cn('flex gap-3 overflow-x-auto scrollbar-none', className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="glass-card rounded-xl p-3 min-w-[130px] flex-1 animate-pulse"
          >
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-muted" />
              <div className="space-y-1.5 flex-1">
                <div className="h-5 w-10 bg-muted rounded" />
                <div className="h-3 w-16 bg-muted rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className={cn('flex gap-3 overflow-x-auto scrollbar-none pb-1', className)}>
      <StatCard
        icon={BookOpen}
        value={stats.totalEntries}
        label="Всего записей"
        iconColor="bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
      />
      <StatCard
        icon={Calendar}
        value={stats.thisMonthEntries}
        label="За этот месяц"
        iconColor="bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
      />
      <StatCard
        icon={Flame}
        value={stats.currentStreak}
        label="Серия дней"
        iconColor="bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400"
      />
      <StatCard
        icon={FileText}
        value={stats.averageWords}
        label="Среднее слов"
        iconColor="bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400"
      />
      <StatCard
        icon={Trophy}
        value={stats.longestEntry?.wordCount ?? 0}
        label="Самая длинная"
        iconColor="bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
        subValue={stats.longestEntry?.title ? `${stats.longestEntry.title} (${stats.longestEntry.wordCount} сл.)` : undefined}
      />
    </div>
  )
}
