'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Cloud, Sun, CloudRain, Snowflake, Wind, Droplets, Eye } from 'lucide-react'

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
  sunny: { icon: Sun, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/20', label: 'Ясно' },
  'partly-cloudy': { icon: Cloud, color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-950/20', label: 'Переменная облачность' },
  cloudy: { icon: Cloud, color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-950/20', label: 'Облачно' },
  rainy: { icon: CloudRain, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/20', label: 'Дождь' },
  snowy: { icon: Snowflake, color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-950/20', label: 'Снег' },
}

export function WeatherWidget() {
  const config = CONDITION_CONFIG[WEATHER_DATA.condition]
  const WeatherIcon = config.icon

  return (
    <Card className="card-hover overflow-hidden rounded-xl border">
      <CardContent className="relative p-0">
        {/* Background gradient */}
        <div className={`absolute inset-0 ${config.bg} opacity-50`} />

        <div className="relative p-4">
          {/* Header with city and condition */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Погода</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{WEATHER_DATA.city}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background/80 backdrop-blur-sm shadow-sm">
              <WeatherIcon className={`h-5 w-5 ${config.color}`} />
            </div>
          </div>

          {/* Temperature */}
          <div className="mt-3 flex items-end gap-1">
            <span className="text-3xl font-bold tabular-nums tracking-tight">
              {WEATHER_DATA.temp}°
            </span>
            <span className="mb-1 text-sm text-muted-foreground">
              Ощущается {WEATHER_DATA.feelsLike}°
            </span>
          </div>

          {/* Condition */}
          <p className="mt-1 text-xs text-muted-foreground">{config.label}</p>

          {/* Weather details grid */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center gap-1 rounded-lg bg-background/60 p-2">
              <Droplets className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-xs font-semibold tabular-nums">{WEATHER_DATA.humidity}%</span>
              <span className="text-[10px] text-muted-foreground">Влажность</span>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-lg bg-background/60 p-2">
              <Wind className="h-3.5 w-3.5 text-teal-500" />
              <span className="text-xs font-semibold tabular-nums">{WEATHER_DATA.wind} м/с</span>
              <span className="text-[10px] text-muted-foreground">Ветер</span>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-lg bg-background/60 p-2">
              <Eye className="h-3.5 w-3.5 text-gray-500" />
              <span className="text-xs font-semibold tabular-nums">{WEATHER_DATA.visibility} км</span>
              <span className="text-[10px] text-muted-foreground">Видимость</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
