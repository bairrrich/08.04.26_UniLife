'use client'

import { useMemo } from 'react'
import { MOOD_EMOJI } from '@/lib/format'
import { Sun, CloudSun, Cloud, CloudRain, CloudSnow } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface MoodWeatherIndicatorProps {
  todayMood: number | null
  recentMoods: { date: string; mood: number | null }[]
  weekEntryCount: number
}

// ─── Mood → Weather Mapping ──────────────────────────────────────────────────

interface WeatherConfig {
  icon: typeof Sun
  gradient: string
  label: string
  iconColor: string
  bgColor: string
}

const MOOD_WEATHER: Record<number, WeatherConfig> = {
  5: {
    icon: Sun,
    gradient: 'from-amber-400 to-orange-400',
    label: 'Прекрасное настроение',
    iconColor: 'text-amber-500',
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
  },
  4: {
    icon: CloudSun,
    gradient: 'from-emerald-400 to-teal-400',
    label: 'Хорошее настроение',
    iconColor: 'text-emerald-500',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
  },
  3: {
    icon: Cloud,
    gradient: 'from-slate-400 to-gray-400',
    label: 'Нейтральное настроение',
    iconColor: 'text-slate-500',
    bgColor: 'bg-slate-50 dark:bg-slate-950/30',
  },
  2: {
    icon: CloudRain,
    gradient: 'from-blue-400 to-indigo-400',
    label: 'Пониженное настроение',
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
  },
  1: {
    icon: CloudSnow,
    gradient: 'from-violet-400 to-purple-400',
    label: 'Грустное настроение',
    iconColor: 'text-violet-500',
    bgColor: 'bg-violet-50 dark:bg-violet-950/30',
  },
}

const DEFAULT_WEATHER: WeatherConfig = {
  icon: Cloud,
  gradient: 'from-slate-300 to-gray-300',
  label: 'Настроение ещё не отмечено',
  iconColor: 'text-muted-foreground',
  bgColor: 'bg-muted/50',
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MoodWeatherIndicator({
  todayMood,
  recentMoods,
  weekEntryCount,
}: MoodWeatherIndicatorProps) {
  const avgMood = useMemo(() => {
    const moods = recentMoods.filter((m) => m.mood !== null)
    if (moods.length === 0) return null
    return moods.reduce((s, m) => s + (m.mood ?? 0), 0) / moods.length
  }, [recentMoods])

  const displayMood = todayMood ?? Math.round(avgMood ?? 3)
  const config = MOOD_WEATHER[displayMood] ?? DEFAULT_WEATHER
  const WeatherIcon = config.icon

  return (
    <div
      className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2 ${config.bgColor} border-border/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-sm`}
    >
      {/* Weather icon with gradient background */}
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${config.gradient} shadow-sm`}
      >
        <WeatherIcon className="h-4.5 w-4.5 text-white" />
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-base">{MOOD_EMOJI[displayMood] || '😐'}</span>
          {todayMood ? (
            <span className="text-xs font-semibold">{config.label}</span>
          ) : avgMood !== null ? (
            <span className="text-xs font-medium text-muted-foreground">
              Ср. {avgMood.toFixed(1)}
            </span>
          ) : (
            <span className="text-xs font-medium text-muted-foreground">
              {config.label}
            </span>
          )}
        </div>
        <p className="text-[10px] tabular-nums text-muted-foreground">
          {weekEntryCount} запис{weekEntryCount === 1 ? 'ь' : weekEntryCount < 5 ? 'и' : 'ей'} за неделю
        </p>
      </div>

      {/* Mini mood dots for last 7 days */}
      <div className="hidden items-center gap-1 sm:flex">
        {recentMoods.slice(-7).map((m, i) => (
          <div
            key={i}
            className="flex h-5 w-5 items-center justify-center rounded-full text-[10px]"
            style={{
              background: m.mood
                ? `oklch(0.95 0.01 ${m.mood >= 4 ? 155 : m.mood >= 3 ? 85 : 30})`
                : 'oklch(0.94 0.005 155)',
            }}
            title={m.mood ? MOOD_EMOJI[m.mood] : '—'}
          >
            {m.mood ? MOOD_EMOJI[m.mood] : '·'}
          </div>
        ))}
      </div>
    </div>
  )
}
