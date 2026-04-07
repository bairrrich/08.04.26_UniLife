'use client'

import { Card } from '@/components/ui/card'
import {
  Brain,
  Flame,
  Smile,
  CalendarDays,
  Clock,
  TrendingUp,
  Dumbbell,
  Sparkles,
} from 'lucide-react'
import { MOOD_EMOJI, MOOD_LABELS } from '@/lib/format'
import type { ModuleStreak, TimeOfDayPoint } from './types'

// ─── Insight Card Types ───────────────────────────────────────────────────────

interface InsightCardData {
  icon: React.ReactNode
  title: string
  description: string
  gradientFrom: string
  gradientTo: string
  iconColor: string
  textColor: string
}

// ─── Component ───────────────────────────────────────────────────────────────

interface PersonalInsightsProps {
  loading: boolean
  mostProductiveDay: string | null
  bestMoodDay: string | null
  bestMood: number
  longestStreakModule: ModuleStreak | null
  peakTimePeriod: TimeOfDayPoint | null
  totalActions: number
  avgMood: number
}

export function PersonalInsights({
  loading,
  mostProductiveDay,
  bestMoodDay,
  bestMood,
  longestStreakModule,
  peakTimePeriod,
  totalActions,
  avgMood,
}: PersonalInsightsProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="skeleton-shimmer h-7 w-7 rounded-lg" />
          <div className="skeleton-shimmer h-4 w-40 rounded-md" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer h-20 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  const insights: InsightCardData[] = []

  // 1. Most productive day
  if (mostProductiveDay && mostProductiveDay !== '—') {
    insights.push({
      icon: <Brain className="h-5 w-5" />,
      title: 'Самый продуктивный день',
      description: mostProductiveDay,
      gradientFrom: 'from-emerald-500/10',
      gradientTo: 'to-teal-500/5',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      textColor: 'text-emerald-700 dark:text-emerald-300',
    })
  }

  // 2. Best mood day
  if (bestMoodDay && bestMood > 0) {
    insights.push({
      icon: <Smile className="h-5 w-5" />,
      title: 'Лучший день по настроению',
      description: `${bestMoodDay} — ${MOOD_EMOJI[bestMood]} ${MOOD_LABELS[bestMood]}`,
      gradientFrom: 'from-amber-500/10',
      gradientTo: 'to-yellow-500/5',
      iconColor: 'text-amber-600 dark:text-amber-400',
      textColor: 'text-amber-700 dark:text-amber-300',
    })
  }

  // 3. Longest streak
  if (longestStreakModule && longestStreakModule.streak > 0) {
    insights.push({
      icon: <Flame className="h-5 w-5" />,
      title: 'Самая длинная серия',
      description: `${longestStreakModule.emoji} ${longestStreakModule.module}: ${longestStreakModule.streak} дней`,
      gradientFrom: 'from-orange-500/10',
      gradientTo: 'to-red-500/5',
      iconColor: 'text-orange-600 dark:text-orange-400',
      textColor: 'text-orange-700 dark:text-orange-300',
    })
  }

  // 4. Peak activity time
  if (peakTimePeriod && peakTimePeriod.count > 0) {
    const periodEmoji: Record<string, string> = {
      'Утро': '🌅',
      'День': '☀️',
      'Вечер': '🌆',
      'Ночь': '🌙',
    }
    insights.push({
      icon: <Clock className="h-5 w-5" />,
      title: 'Пик активности',
      description: `${periodEmoji[peakTimePeriod.period] || ''} ${peakTimePeriod.period}`,
      gradientFrom: 'from-indigo-500/10',
      gradientTo: 'to-violet-500/5',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      textColor: 'text-indigo-700 dark:text-indigo-300',
    })
  }

  // 5. Average mood
  if (avgMood > 0) {
    insights.push({
      icon: <Sparkles className="h-5 w-5" />,
      title: 'Среднее настроение',
      description: `${avgMood.toFixed(1)}/5 ${MOOD_EMOJI[Math.round(avgMood)] || ''}`,
      gradientFrom: 'from-violet-500/10',
      gradientTo: 'to-purple-500/5',
      iconColor: 'text-violet-600 dark:text-violet-400',
      textColor: 'text-violet-700 dark:text-violet-300',
    })
  }

  if (insights.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500">
          <Sparkles className="h-3.5 w-3.5 text-white" />
        </div>
        <h2 className="text-sm font-semibold">Персональные инсайты</h2>
      </div>

      <div className="stagger-children grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {insights.map((insight, i) => (
          <Card
            key={i}
            className={`card-hover group overflow-hidden rounded-xl border bg-gradient-to-br ${insight.gradientFrom} ${insight.gradientTo} dark:from-muted/20 dark:to-transparent`}
          >
            <div className="p-4">
              <div className="mb-2 flex items-center gap-2.5">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/80 shadow-sm dark:bg-muted/60 ${insight.iconColor}`}>
                  {insight.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">
                    {insight.title}
                  </p>
                  <p className={`text-sm font-semibold truncate ${insight.textColor}`}>
                    {insight.description}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
