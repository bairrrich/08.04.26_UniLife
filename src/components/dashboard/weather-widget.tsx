'use client'

import { useMemo, memo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Check, X, CloudSun, CloudRain, Sun, Cloud, Thermometer } from 'lucide-react'

// ─── Props ────────────────────────────────────────────────────────────────────

interface MoodWeatherProps {
  /** Average mood 1-5, or null if no data */
  avgMood: number | null
  /** Productivity score 0-100 */
  productivityScore: number
  /** Whether user wrote a diary entry today */
  hasDiaryEntry: boolean
  /** Whether user completed a workout today */
  hasWorkout: boolean
  /** Whether all habits are completed */
  habitsCompleted: boolean
}

// ─── Weather Config ───────────────────────────────────────────────────────────

interface WeatherConfig {
  label: string
  emoji: string
  description: string
  icon: typeof Sun
  gradient: string
  iconGradient: string
  glowClass: string
  tempColor: string
}

function getWeatherConfig(avgMood: number | null): WeatherConfig {
  if (avgMood === null) {
    return {
      label: 'Ясно',
      emoji: '🌤️',
      description: 'Запишите настроение, чтобы увидеть прогноз',
      icon: CloudSun,
      gradient: 'from-sky-300/15 via-cyan-200/5 to-amber-200/10',
      iconGradient: 'from-sky-400 to-cyan-500',
      glowClass: 'shadow-sky-500/20',
      tempColor: 'text-sky-600 dark:text-sky-400',
    }
  }
  if (avgMood >= 4) {
    return {
      label: 'Солнечно',
      emoji: '☀️',
      description: 'Ваш день наполнен позитивом!',
      icon: Sun,
      gradient: 'from-amber-300/20 via-orange-200/10 to-yellow-300/15',
      iconGradient: 'from-amber-400 to-orange-500',
      glowClass: 'shadow-amber-500/25',
      tempColor: 'text-amber-600 dark:text-amber-400',
    }
  }
  if (avgMood >= 2) {
    return {
      label: 'Облачно',
      emoji: '⛅',
      description: 'День переменчивый, но это нормально',
      icon: Cloud,
      gradient: 'from-slate-300/15 via-gray-200/5 to-slate-400/10',
      iconGradient: 'from-slate-400 to-slate-500',
      glowClass: 'shadow-slate-500/20',
      tempColor: 'text-slate-600 dark:text-slate-400',
    }
  }
  return {
    label: 'Дождливо',
    emoji: '🌧️',
    description: 'Непогода — время для заботы о себе',
    icon: CloudRain,
    gradient: 'from-blue-300/20 via-indigo-200/10 to-cyan-300/15',
    iconGradient: 'from-blue-400 to-indigo-500',
    glowClass: 'shadow-blue-500/20',
    tempColor: 'text-blue-600 dark:text-blue-400',
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default memo(function MoodWeatherWidget({
  avgMood,
  productivityScore,
  hasDiaryEntry,
  hasWorkout,
  habitsCompleted,
}: MoodWeatherProps) {
  const config = useMemo(() => getWeatherConfig(avgMood), [avgMood])
  const WeatherIcon = config.icon

  // Map productivity score to temperature 0-40°
  const temperature = useMemo(() => {
    return Math.round((productivityScore / 100) * 40)
  }, [productivityScore])

  // Forecast items
  const forecastItems = useMemo(() => [
    {
      label: 'Дневник',
      emoji: '📝',
      done: hasDiaryEntry,
    },
    {
      label: 'Тренировка',
      emoji: '🏃',
      done: hasWorkout,
    },
    {
      label: 'Привычки',
      emoji: '✅',
      done: habitsCompleted,
    },
  ], [hasDiaryEntry, hasWorkout, habitsCompleted])

  const completedCount = forecastItems.filter(f => f.done).length

  return (
    <Card className="card-hover glass-card overflow-hidden rounded-xl border relative">
      <CardContent className="relative p-0">
        {/* Multi-layered gradient background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient}`} />
        <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-gradient-to-br from-amber-400/10 to-orange-500/5 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-gradient-to-br from-sky-400/8 to-cyan-500/5 blur-2xl pointer-events-none" />

        <div className="relative p-4 space-y-1">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                Настроение
              </p>
              <p className="mt-0.5 text-sm font-medium text-foreground/90">
                {config.emoji} {config.label}
              </p>
            </div>
            {/* Floating weather icon */}
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${config.iconGradient} shadow-lg ${config.glowClass}`}>
              <WeatherIcon className="h-5 w-5 text-white" />
            </div>
          </div>

          {/* "Temperature" display */}
          <div className="mt-2 flex items-end gap-2">
            <div className="flex items-baseline gap-0.5">
              <span className={`text-4xl font-extrabold tabular-nums tracking-tighter leading-none ${config.tempColor}`}>
                {temperature}°
              </span>
            </div>
            <div className="mb-0.5 flex flex-col">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Thermometer className="h-3 w-3" />
                Продуктивность
              </span>
              <span className="text-[10px] text-muted-foreground/70 font-medium">
                {config.description}
              </span>
            </div>
          </div>

          {/* Forecast: 3 activity items */}
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Прогноз дня
              </span>
              <span className={`text-[10px] font-bold tabular-nums rounded-full px-1.5 py-0.5 ${
                completedCount === 3
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                  : completedCount > 0
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                    : 'bg-muted text-muted-foreground'
              }`}>
                {completedCount}/{forecastItems.length}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {forecastItems.map((item) => (
                <div
                  key={item.label}
                  className={`flex flex-col items-center gap-1 rounded-lg border p-2 transition-colors ${
                    item.done
                      ? 'bg-emerald-50/80 border-emerald-200/50 dark:bg-emerald-950/20 dark:border-emerald-800/30'
                      : 'bg-background/50 border-border/30'
                  }`}
                >
                  {item.done ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-muted-foreground/40" />
                  )}
                  <span className="text-xs">{item.emoji}</span>
                  <span className={`text-[10px] font-medium leading-tight text-center ${
                    item.done
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-muted-foreground'
                  }`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})
