'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Cloud, Sun, CloudRain, Snowflake, Wind, Droplets, Eye, Thermometer } from 'lucide-react'

// Static weather data for demo purposes
const WEATHER_DATA = {
  temp: 15,
  feelsLike: 12,
  condition: 'partly-cloudy' as const,
  conditionText: 'Переменная облачность',
  humidity: 65,
  wind: 12,
  visibility: 10,
  pressure: 1015,
  city: 'Москва',
}

const CONDITION_CONFIG = {
  sunny: {
    icon: Sun,
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    gradient: 'from-amber-400/15 via-orange-300/5 to-yellow-400/10',
    iconGradient: 'from-amber-400 to-orange-500',
    glowClass: 'shadow-amber-500/20',
    label: 'Ясно',
  },
  'partly-cloudy': {
    icon: Cloud,
    color: 'text-sky-500',
    bg: 'bg-sky-50 dark:bg-sky-950/20',
    gradient: 'from-sky-400/15 via-blue-300/5 to-indigo-400/10',
    iconGradient: 'from-sky-400 to-blue-500',
    glowClass: 'shadow-sky-500/20',
    label: 'Переменная облачность',
  },
  cloudy: {
    icon: Cloud,
    color: 'text-gray-500',
    bg: 'bg-gray-50 dark:bg-gray-950/20',
    gradient: 'from-gray-400/10 via-slate-300/5 to-gray-400/10',
    iconGradient: 'from-gray-400 to-slate-500',
    glowClass: 'shadow-gray-500/20',
    label: 'Облачно',
  },
  rainy: {
    icon: CloudRain,
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    gradient: 'from-blue-400/15 via-indigo-300/5 to-cyan-400/10',
    iconGradient: 'from-blue-400 to-indigo-500',
    glowClass: 'shadow-blue-500/20',
    label: 'Дождь',
  },
  snowy: {
    icon: Snowflake,
    color: 'text-cyan-500',
    bg: 'bg-cyan-50 dark:bg-cyan-950/20',
    gradient: 'from-cyan-400/15 via-teal-300/5 to-sky-400/10',
    iconGradient: 'from-cyan-400 to-teal-500',
    glowClass: 'shadow-cyan-500/20',
    label: 'Снег',
  },
}

export function WeatherWidget() {
  const config = CONDITION_CONFIG[WEATHER_DATA.condition]
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
                {WEATHER_DATA.city}
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
              {WEATHER_DATA.temp}°
            </span>
            <div className="mb-0.5 flex flex-col">
              <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                <Thermometer className="h-3 w-3" />
                Ощущается {WEATHER_DATA.feelsLike}°
              </span>
              <span className="text-xs text-muted-foreground/70 font-medium">
                {config.label}
              </span>
            </div>
          </div>

          {/* Weather details grid */}
          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center gap-0.5 rounded-lg bg-background/50 backdrop-blur-sm border border-border/30 p-2 transition-colors hover:bg-background/70">
              <Droplets className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-xs font-bold tabular-nums">{WEATHER_DATA.humidity}%</span>
              <span className="text-[10px] text-muted-foreground leading-tight">Влажность</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 rounded-lg bg-background/50 backdrop-blur-sm border border-border/30 p-2 transition-colors hover:bg-background/70">
              <Wind className="h-3.5 w-3.5 text-teal-500" />
              <span className="text-xs font-bold tabular-nums">{WEATHER_DATA.wind} м/с</span>
              <span className="text-[10px] text-muted-foreground leading-tight">Ветер</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 rounded-lg bg-background/50 backdrop-blur-sm border border-border/30 p-2 transition-colors hover:bg-background/70">
              <Eye className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-xs font-bold tabular-nums">{WEATHER_DATA.visibility} км</span>
              <span className="text-[10px] text-muted-foreground leading-tight">Видимость</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
