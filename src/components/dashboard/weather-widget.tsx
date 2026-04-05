'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Cloud, Sun, CloudRain, Snowflake, Wind, Droplets, Eye, Thermometer, CloudLightning, CloudFog, CloudDrizzle } from 'lucide-react'

// Open-Meteo API types
interface OpenMeteoWeather {
  temperature: number
  windspeed: number
  weathercode: number
}

interface OpenMeteoResponse {
  current_weather: OpenMeteoWeather
}

// WMO Weather code to emoji + label + config mapping
const WEATHER_CODE_MAP: Record<number, { emoji: string; label: string; icon: typeof Sun; color: string; bg: string; gradient: string; iconGradient: string; glowClass: string }> = {
  0: { emoji: '☀️', label: 'Ясно', icon: Sun, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/20', gradient: 'from-amber-400/15 via-orange-300/5 to-yellow-400/10', iconGradient: 'from-amber-400 to-orange-500', glowClass: 'shadow-amber-500/20' },
  1: { emoji: '⛅', label: 'Малооблачно', icon: Sun, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/20', gradient: 'from-amber-400/15 via-sky-300/5 to-yellow-400/10', iconGradient: 'from-amber-400 to-sky-500', glowClass: 'shadow-amber-500/20' },
  2: { emoji: '⛅', label: 'Переменная облачность', icon: Cloud, color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-950/20', gradient: 'from-sky-400/15 via-blue-300/5 to-indigo-400/10', iconGradient: 'from-sky-400 to-blue-500', glowClass: 'shadow-sky-500/20' },
  3: { emoji: '⛅', label: 'Облачно', icon: Cloud, color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-950/20', gradient: 'from-slate-400/10 via-slate-300/5 to-slate-400/10', iconGradient: 'from-slate-400 to-slate-500', glowClass: 'shadow-slate-500/20' },
  45: { emoji: '🌫️', label: 'Туман', icon: CloudFog, color: 'text-slate-400', bg: 'bg-slate-50 dark:bg-slate-950/20', gradient: 'from-slate-400/10 via-slate-300/5 to-slate-400/10', iconGradient: 'from-slate-400 to-slate-500', glowClass: 'shadow-slate-500/20' },
  48: { emoji: '🌫️', label: 'Изморозь', icon: CloudFog, color: 'text-slate-400', bg: 'bg-slate-50 dark:bg-slate-950/20', gradient: 'from-slate-400/10 via-slate-300/5 to-slate-400/10', iconGradient: 'from-slate-400 to-slate-500', glowClass: 'shadow-slate-500/20' },
  51: { emoji: '🌧️', label: 'Морось', icon: CloudDrizzle, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/20', gradient: 'from-blue-400/15 via-indigo-300/5 to-cyan-400/10', iconGradient: 'from-blue-400 to-indigo-500', glowClass: 'shadow-blue-500/20' },
  53: { emoji: '🌧️', label: 'Морось', icon: CloudDrizzle, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/20', gradient: 'from-blue-400/15 via-indigo-300/5 to-cyan-400/10', iconGradient: 'from-blue-400 to-indigo-500', glowClass: 'shadow-blue-500/20' },
  55: { emoji: '🌧️', label: 'Сильная морось', icon: CloudDrizzle, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/20', gradient: 'from-blue-400/15 via-indigo-300/5 to-cyan-400/10', iconGradient: 'from-blue-400 to-indigo-500', glowClass: 'shadow-blue-500/20' },
  61: { emoji: '🌧️', label: 'Небольшой дождь', icon: CloudRain, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/20', gradient: 'from-blue-400/15 via-indigo-300/5 to-cyan-400/10', iconGradient: 'from-blue-400 to-indigo-500', glowClass: 'shadow-blue-500/20' },
  63: { emoji: '🌧️', label: 'Дождь', icon: CloudRain, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/20', gradient: 'from-blue-400/15 via-indigo-300/5 to-cyan-400/10', iconGradient: 'from-blue-400 to-indigo-500', glowClass: 'shadow-blue-500/20' },
  65: { emoji: '🌧️', label: 'Сильный дождь', icon: CloudRain, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/20', gradient: 'from-blue-400/15 via-indigo-300/5 to-cyan-400/10', iconGradient: 'from-blue-500 to-indigo-600', glowClass: 'shadow-blue-500/20' },
  71: { emoji: '❄️', label: 'Небольшой снег', icon: Snowflake, color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-950/20', gradient: 'from-cyan-400/15 via-teal-300/5 to-sky-400/10', iconGradient: 'from-cyan-400 to-teal-500', glowClass: 'shadow-cyan-500/20' },
  73: { emoji: '❄️', label: 'Снег', icon: Snowflake, color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-950/20', gradient: 'from-cyan-400/15 via-teal-300/5 to-sky-400/10', iconGradient: 'from-cyan-400 to-teal-500', glowClass: 'shadow-cyan-500/20' },
  75: { emoji: '❄️', label: 'Сильный снег', icon: Snowflake, color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-950/20', gradient: 'from-cyan-400/15 via-teal-300/5 to-sky-400/10', iconGradient: 'from-cyan-400 to-teal-500', glowClass: 'shadow-cyan-500/20' },
  77: { emoji: '❄️', label: 'Снежные зёрна', icon: Snowflake, color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-950/20', gradient: 'from-cyan-400/15 via-teal-300/5 to-sky-400/10', iconGradient: 'from-cyan-400 to-teal-500', glowClass: 'shadow-cyan-500/20' },
  80: { emoji: '🌧️', label: 'Ливень', icon: CloudRain, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/20', gradient: 'from-blue-400/15 via-indigo-300/5 to-cyan-400/10', iconGradient: 'from-blue-400 to-indigo-500', glowClass: 'shadow-blue-500/20' },
  81: { emoji: '🌧️', label: 'Сильный ливень', icon: CloudRain, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/20', gradient: 'from-blue-400/15 via-indigo-300/5 to-cyan-400/10', iconGradient: 'from-blue-500 to-indigo-600', glowClass: 'shadow-blue-500/20' },
  82: { emoji: '🌧️', label: 'Шквал', icon: CloudRain, color: 'text-blue-700', bg: 'bg-blue-50 dark:bg-blue-950/20', gradient: 'from-blue-500/15 via-indigo-300/5 to-cyan-400/10', iconGradient: 'from-blue-600 to-indigo-700', glowClass: 'shadow-blue-500/20' },
  85: { emoji: '❄️', label: 'Снегопад', icon: Snowflake, color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-950/20', gradient: 'from-cyan-400/15 via-teal-300/5 to-sky-400/10', iconGradient: 'from-cyan-400 to-teal-500', glowClass: 'shadow-cyan-500/20' },
  86: { emoji: '❄️', label: 'Сильный снегопад', icon: Snowflake, color: 'text-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-950/20', gradient: 'from-cyan-400/15 via-teal-300/5 to-sky-400/10', iconGradient: 'from-cyan-500 to-teal-600', glowClass: 'shadow-cyan-500/20' },
  95: { emoji: '⛈️', label: 'Гроза', icon: CloudLightning, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-950/20', gradient: 'from-violet-400/15 via-purple-300/5 to-indigo-400/10', iconGradient: 'from-violet-400 to-purple-500', glowClass: 'shadow-violet-500/20' },
  96: { emoji: '⛈️', label: 'Гроза с градом', icon: CloudLightning, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950/20', gradient: 'from-violet-400/15 via-purple-300/5 to-indigo-400/10', iconGradient: 'from-violet-500 to-purple-600', glowClass: 'shadow-violet-500/20' },
  99: { emoji: '⛈️', label: 'Гроза с градом', icon: CloudLightning, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950/20', gradient: 'from-violet-400/15 via-purple-300/5 to-indigo-400/10', iconGradient: 'from-violet-500 to-purple-600', glowClass: 'shadow-violet-500/20' },
}

// Default config for unknown codes
const DEFAULT_CONFIG = {
  emoji: '🌤️', label: 'Неизвестно', icon: Cloud,
  color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-950/20',
  gradient: 'from-sky-400/15 via-blue-300/5 to-indigo-400/10',
  iconGradient: 'from-sky-400 to-blue-500', glowClass: 'shadow-sky-500/20',
}

function getWeatherConfig(code: number) {
  return WEATHER_CODE_MAP[code] || DEFAULT_CONFIG
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────

function WeatherSkeleton() {
  return (
    <Card className="glass-card overflow-hidden rounded-xl border animate-slide-up relative">
      <CardContent className="relative p-0">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-400/10 via-blue-300/5 to-indigo-400/10" />
        <div className="relative p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <div className="skeleton-shimmer h-3 w-14 rounded" />
              <div className="skeleton-shimmer h-4 w-20 rounded" />
            </div>
            <div className="skeleton-shimmer h-11 w-11 rounded-xl" />
          </div>
          {/* Temperature */}
          <div className="flex items-end gap-2">
            <div className="skeleton-shimmer h-10 w-16 rounded" />
            <div className="space-y-1">
              <div className="skeleton-shimmer h-3 w-24 rounded" />
              <div className="skeleton-shimmer h-3 w-16 rounded" />
            </div>
          </div>
          {/* Details grid */}
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1 rounded-lg bg-background/50 border border-border/30 p-2">
                <div className="skeleton-shimmer h-3.5 w-3.5 rounded-full" />
                <div className="skeleton-shimmer h-3 w-8 rounded" />
                <div className="skeleton-shimmer h-2.5 w-12 rounded" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Error Fallback ───────────────────────────────────────────────────────

function WeatherError({ onRetry }: { onRetry: () => void }) {
  return (
    <Card className="glass-card overflow-hidden rounded-xl border animate-slide-up relative">
      <CardContent className="relative p-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-400/10 via-slate-300/5 to-slate-400/10" />
        <div className="relative p-4 flex flex-col items-center justify-center text-center py-6 space-y-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-slate-400 to-slate-500 shadow-lg shadow-slate-500/20">
            <Cloud className="h-5 w-5 text-white" />
          </div>
          <p className="text-sm font-medium text-foreground">Не удалось загрузить</p>
          <button
            type="button"
            onClick={onRetry}
            className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Попробовать снова
          </button>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────

export default function WeatherWidget() {
  const [weather, setWeather] = useState<OpenMeteoWeather | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchWeather = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current_weather=true&timezone=auto'
      )
      if (!res.ok) throw new Error('API error')
      const data: OpenMeteoResponse = await res.json()
      setWeather(data.current_weather)
    } catch (err) {
      console.error('Failed to fetch weather:', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWeather()
  }, [fetchWeather])

  if (loading) return <WeatherSkeleton />
  if (error || !weather) return <WeatherError onRetry={fetchWeather} />

  const config = getWeatherConfig(weather.weathercode)
  const WeatherIcon = config.icon

  return (
    <Card className="glass-card card-hover overflow-hidden rounded-xl border animate-slide-up relative">
      <CardContent className="relative p-0">
        {/* Multi-layered gradient background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient}`} />
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-sky-400/10 to-indigo-500/5 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-gradient-to-br from-amber-400/8 to-orange-500/5 blur-2xl pointer-events-none" />

        <div className="relative p-4 space-y-1">
          {/* Header with city and condition */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                Погода
              </p>
              <p className="mt-0.5 text-sm font-medium text-foreground/90">
                Москва
              </p>
            </div>
            {/* Floating weather icon */}
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${config.iconGradient} shadow-lg ${config.glowClass} float-animation`}>
              <WeatherIcon className="h-5 w-5 text-white" />
            </div>
          </div>

          {/* Temperature display */}
          <div className="mt-2 flex items-end gap-2">
            <span className="text-4xl font-extrabold tabular-nums tracking-tighter leading-none">
              {Math.round(weather.temperature)}°
            </span>
            <div className="mb-0.5 flex flex-col">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                {config.emoji} {config.label}
              </span>
              <span className="text-xs text-muted-foreground/70 font-medium">
                Реальное время
              </span>
            </div>
          </div>

          {/* Weather details grid */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="flex flex-col items-center gap-0.5 rounded-lg bg-background/50 backdrop-blur-sm border border-border/30 p-2 transition-colors hover:bg-background/70">
              <Wind className="h-3.5 w-3.5 text-teal-500" />
              <span className="text-xs font-bold tabular-nums">{weather.windspeed} м/с</span>
              <span className="text-[10px] text-muted-foreground leading-tight">Ветер</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 rounded-lg bg-background/50 backdrop-blur-sm border border-border/30 p-2 transition-colors hover:bg-background/70">
              <Thermometer className="h-3.5 w-3.5 text-orange-500" />
              <span className="text-xs font-bold tabular-nums">{Math.round(weather.temperature)}°C</span>
              <span className="text-[10px] text-muted-foreground leading-tight">Температура</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
