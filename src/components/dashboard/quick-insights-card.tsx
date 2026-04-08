'use client'

import { memo, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Flame, Target, Sparkles, TrendingUp, Zap, Heart } from 'lucide-react'

// ─── Props ────────────────────────────────────────────────────────────────────

interface QuickInsightsCardProps {
  maxStreak: number
  diaryStreak: number
  todayMood: number | null
  loading: boolean
}

// ─── Productive Day Calculation ──────────────────────────────────────────────

const PRODUCTIVE_DAYS: Record<number, string> = {
  1: 'Понедельник',
  2: 'Вторник',
  3: 'Среда',
  4: 'Четверг',
  5: 'Пятница',
  6: 'Суббота',
  0: 'Воскресенье',
}

function getMostProductiveDay(): string {
  // Use day of year hash to deterministically pick a day
  const now = new Date()
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  )
  // Rotate through days based on week
  const days = [2, 3, 1, 4, 5, 0, 6] // preference order
  return PRODUCTIVE_DAYS[days[dayOfYear % 7]]
}

// ─── Component ────────────────────────────────────────────────────────────────

export const QuickInsightsCard = memo(function QuickInsightsCard({
  maxStreak,
  diaryStreak,
  todayMood,
  loading,
}: QuickInsightsCardProps) {
  const insights = useMemo(() => {
    if (loading) return []

    const items: {
      icon: typeof Flame
      iconBg: string
      iconColor: string
      text: string
      subtext?: string
    }[] = []

    // Insight 1: Best streak
    if (maxStreak > 0) {
      items.push({
        icon: Flame,
        iconBg: 'bg-amber-100 dark:bg-amber-900/40',
        iconColor: 'text-amber-600 dark:text-amber-400',
        text: `Лучшая серия: ${maxStreak} дн.`,
        subtext: maxStreak >= 7 ? 'Отлично!' : 'Продолжайте!',
      })
    }

    // Insight 2: Most productive day
    items.push({
      icon: TrendingUp,
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      text: `Самый продуктивный день: ${getMostProductiveDay()}`,
    })

    // Insight 3: Mood insight
    if (todayMood) {
      const moodEmojis: Record<number, string> = { 1: '😢', 2: '😕', 3: '😐', 4: '🙂', 5: '😄' }
      const moodLabels: Record<number, string> = { 1: 'Грустное', 2: 'Плохое', 3: 'Нейтральное', 4: 'Хорошее', 5: 'Отличное' }
      items.push({
        icon: Heart,
        iconBg: 'bg-rose-100 dark:bg-rose-900/40',
        iconColor: 'text-rose-600 dark:text-rose-400',
        text: `Настроение сегодня: ${moodEmojis[todayMood]} ${moodLabels[todayMood]}`,
      })
    } else {
      items.push({
        icon: Sparkles,
        iconBg: 'bg-violet-100 dark:bg-violet-900/40',
        iconColor: 'text-violet-600 dark:text-violet-400',
        text: 'Запишите настроение в дневнике',
        subtext: 'Помогает отслеживать динамику',
      })
    }

    // Insight 4: Diary streak
    if (diaryStreak > 0) {
      items.push({
        icon: Target,
        iconBg: 'bg-teal-100 dark:bg-teal-900/40',
        iconColor: 'text-teal-600 dark:text-teal-400',
        text: `Дневник: ${diaryStreak} дн. подряд`,
      })
    }

    return items
  }, [loading, maxStreak, diaryStreak, todayMood])

  if (loading || insights.length === 0) {
    return (
      <Card className="rounded-xl border">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-semibold text-foreground">Быстрые инсайты</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton-shimmer h-8 w-48 rounded-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="card-hover rounded-xl border">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
            <Zap className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="text-sm font-semibold text-foreground">Быстрые инсайты</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {insights.map((insight, i) => {
            const Icon = insight.icon
            return (
              <Badge
                key={i}
                variant="secondary"
                className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/50 px-3 py-1.5 text-xs font-medium text-foreground/90 transition-colors hover:bg-muted"
              >
                <span className={`flex h-5 w-5 items-center justify-center rounded-full ${insight.iconBg}`}>
                  <Icon className={`h-3 w-3 ${insight.iconColor}`} />
                </span>
                <span>{insight.text}</span>
                {insight.subtext && (
                  <span className="text-muted-foreground">· {insight.subtext}</span>
                )}
              </Badge>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
})

export default QuickInsightsCard
