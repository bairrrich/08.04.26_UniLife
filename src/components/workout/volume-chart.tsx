'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3 } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { RU_DAYS_SHORT, toDateStr } from '@/lib/format'

interface VolumeDay {
  date: string
  day: string
  volume: number
  isToday: boolean
}

export function WorkoutVolumeChart() {
  const [data, setData] = useState<VolumeDay[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchVolumeData() {
      try {
        const days: VolumeDay[] = []
        for (let i = 6; i >= 0; i--) {
          const d = new Date()
          d.setDate(d.getDate() - i)
          const dateStr = toDateStr(d)
          const dayOfWeek = d.getDay()
          const mappedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1

          let volume = 0
          try {
            const res = await fetch(`/api/workout?month=${dateStr.substring(0, 7)}`)
            if (res.ok) {
              const json = await res.json()
              if (json.success && Array.isArray(json.data)) {
                const dayWorkouts = json.data.filter(
                  (w: { date: string }) => w.date && w.date.startsWith(dateStr)
                )
                dayWorkouts.forEach((w: { exercises: { sets: string }[] }) => {
                  w.exercises.forEach((ex: { sets: string }) => {
                    try {
                      const sets = JSON.parse(ex.sets)
                      if (Array.isArray(sets)) {
                        sets.forEach((s: { weight: number; reps: number; completed: boolean }) => {
                          if (s.completed) volume += s.weight * s.reps
                        })
                      }
                    } catch {
                      // skip
                    }
                  })
                })
              }
            }
          } catch {
            // skip
          }

          days.push({
            date: dateStr,
            day: RU_DAYS_SHORT[mappedDay],
            volume,
            isToday: i === 0,
          })
        }
        setData(days)
      } catch (err) {
        console.error('Failed to fetch workout volume data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchVolumeData()
  }, [])

  if (loading) {
    return (
      <Card className="rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="size-5 text-violet-500" />
            Объём тренировок
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="skeleton-shimmer h-[160px] rounded-lg" />
        </CardContent>
      </Card>
    )
  }

  const maxVolume = Math.max(...data.map((d) => d.volume), 1)

  return (
    <Card className="rounded-xl card-hover">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="size-5 text-violet-500" />
          Объём тренировок
          <span className="ml-auto text-xs font-normal text-muted-foreground">7 дней</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[160px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <defs>
                <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
                tickFormatter={(value: number) => value >= 1000 ? `${(value / 1000).toFixed(0)}т` : `${value}`}
                width={40}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const d = payload[0]?.payload as VolumeDay
                  return (
                    <div className="rounded-lg border bg-background p-2.5 shadow-md">
                      <p className="text-xs font-medium text-muted-foreground">{d.day}, {d.date}</p>
                      <p className="text-sm font-bold tabular-nums">
                        {d.volume >= 1000 ? `${(d.volume / 1000).toFixed(1)} т` : `${d.volume} кг`}
                      </p>
                    </div>
                  )
                }}
              />
              <Area
                type="monotone"
                dataKey="volume"
                stroke="#8b5cf6"
                strokeWidth={2}
                fill="url(#volumeGradient)"
                dot={(props: Record<string, unknown>) => {
                  const { cx, cy, payload } = props as { cx: number; cy: number; payload: VolumeDay }
                  return (
                    <circle
                      key={`dot-${payload.date}`}
                      cx={cx}
                      cy={cy}
                      r={payload.volume > 0 ? 3 : 0}
                      fill={payload.isToday ? '#8b5cf6' : '#a78bfa'}
                      stroke="hsl(var(--background))"
                      strokeWidth={1.5}
                    />
                  )
                }}
                activeDot={{ r: 5, fill: '#8b5cf6', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        {data.every((d) => d.volume === 0) && (
          <p className="text-center text-xs text-muted-foreground mt-1">Нет данных за эту неделю</p>
        )}
      </CardContent>
    </Card>
  )
}
