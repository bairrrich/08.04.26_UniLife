'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart3, TrendingDown, TrendingUp, Minus } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts'
import { RU_DAYS_SHORT } from '@/lib/format'
import type { NutritionGoals } from './nutrition-goals-dialog'

interface WeeklyNutritionChartProps {
  goals: NutritionGoals | null
}

interface DailyData {
  date: string
  day: string
  kcal: number
  isToday: boolean
}

export function WeeklyNutritionChart({ goals }: WeeklyNutritionChartProps) {
  const [data, setData] = useState<DailyData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchWeeklyData() {
      try {
        const days: DailyData[] = []
        for (let i = 6; i >= 0; i--) {
          const d = new Date()
          d.setDate(d.getDate() - i)
          const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
          const dayOfWeek = d.getDay()
          // RU_DAYS_SHORT is Mon-based: Пн=0, Вт=1, ..., Вс=6
          const mappedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1

          let kcal = 0
          try {
            const res = await fetch(`/api/nutrition/stats?date=${dateStr}`)
            if (res.ok) {
              const json = await res.json()
              if (json.success) {
                kcal = json.data.totalKcal || 0
              }
            }
          } catch {
            // skip failed day fetches
          }

          days.push({
            date: dateStr,
            day: RU_DAYS_SHORT[mappedDay],
            kcal,
            isToday: i === 0,
          })
        }
        setData(days)
      } catch (err) {
        console.error('Failed to fetch weekly nutrition data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchWeeklyData()
  }, [])

  const stats = useMemo(() => {
    if (data.length === 0) return null

    const kcalValues = data.map((d) => d.kcal)
    const totalKcal = kcalValues.reduce((s, v) => s + v, 0)
    const avgKcal = Math.round(totalKcal / kcalValues.length)
    const goalKcal = goals?.dailyKcal ?? 2200

    const daysOnTarget = kcalValues.filter(
      (k) => k > 0 && k >= goalKcal * 0.9 && k <= goalKcal * 1.1
    ).length

    const daysWithData = kcalValues.filter((k) => k > 0)
    const bestDay = daysWithData.length > 0
      ? Math.min(...daysWithData.map((k) => Math.abs(k - goalKcal)))
      : null
    const bestDayIdx = bestDay !== null
      ? daysWithData.findIndex((k) => Math.abs(k - goalKcal) === bestDay)
      : -1

    const worstKcal = daysWithData.length > 0
      ? Math.max(...daysWithData, 0)
      : 0
    const worstDayIdx = daysWithData.findIndex((k) => k === worstKcal)

    const trend = daysWithData.length >= 2
      ? daysWithData[daysWithData.length - 1] - daysWithData[daysWithData.length - 2]
      : 0

    return {
      avgKcal,
      daysOnTarget,
      daysWithData: daysWithData.length,
      bestDay: bestDayIdx >= 0 ? data[data.indexOf(daysWithData[bestDayIdx])] : null,
      worstDay: worstDayIdx >= 0 ? data[data.indexOf(daysWithData[worstDayIdx])] : null,
      trend,
    }
  }, [data, goals])

  const goalKcal = goals?.dailyKcal ?? 2200

  const getBarColor = (kcal: number) => {
    if (kcal === 0) return '#e5e7eb' // gray-200
    const ratio = kcal / goalKcal
    if (ratio <= 1.0) return '#10b981' // emerald-500
    if (ratio <= 1.1) return '#f59e0b' // amber-500
    return '#ef4444' // red-500
  }

  const chartData = data.map((d) => ({
    ...d,
    fill: getBarColor(d.kcal),
  }))

  if (loading) {
    return (
      <Card className="rounded-xl">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="size-5 text-orange-500" />
              Динамика за неделю
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="skeleton-shimmer h-[200px] rounded-lg" />
          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="skeleton-shimmer h-10 rounded-lg" />
            <div className="skeleton-shimmer h-10 rounded-lg" />
            <div className="skeleton-shimmer h-10 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-xl card-hover">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="size-5 text-orange-500" />
            Динамика за неделю
          </CardTitle>
          <div className="flex items-center gap-1.5">
            <span className="inline-block size-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] text-muted-foreground">в норме</span>
            <span className="ml-1 inline-block size-2 rounded-full bg-amber-500" />
            <span className="text-[10px] text-muted-foreground">~10%</span>
            <span className="ml-1 inline-block size-2 rounded-full bg-red-500" />
            <span className="text-[10px] text-muted-foreground">+10%</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Chart */}
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
                tickFormatter={(value: string) => value}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
                tickFormatter={(value: number) => `${value}`}
                width={45}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const d = payload[0]?.payload as DailyData
                  return (
                    <div className="rounded-lg border bg-background p-2.5 shadow-md">
                      <p className="text-xs font-medium text-muted-foreground">{d.day}, {d.date}</p>
                      <p className="text-sm font-bold tabular-nums">
                        {d.kcal} <span className="text-xs font-normal text-muted-foreground">ккал</span>
                      </p>
                      {d.kcal > 0 && (
                        <p className={`text-xs font-medium ${d.kcal <= goalKcal ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                          {d.kcal <= goalKcal ? '✓ В пределах нормы' : `+${d.kcal - goalKcal} сверх нормы`}
                        </p>
                      )}
                    </div>
                  )
                }}
              />
              <ReferenceLine
                y={goalKcal}
                stroke="#f97316"
                strokeDasharray="6 3"
                strokeWidth={1.5}
                label={{
                  value: `${goalKcal}`,
                  position: 'right',
                  fill: '#f97316',
                  fontSize: 11,
                  fontWeight: 600,
                }}
              />
              <Bar dataKey="kcal" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Stats row */}
        {stats && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center rounded-lg bg-muted/50 p-2">
              <span className="text-[10px] text-muted-foreground">Среднее</span>
              <span className="text-sm font-bold tabular-nums">{stats.avgKcal}</span>
              <span className="text-[10px] text-muted-foreground">ккал/день</span>
            </div>
            <div className="flex flex-col items-center rounded-lg bg-muted/50 p-2">
              <span className="text-[10px] text-muted-foreground">В норме</span>
              <span className="text-sm font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{stats.daysOnTarget}</span>
              <span className="text-[10px] text-muted-foreground">из {stats.daysWithData} дней</span>
            </div>
            <div className="flex flex-col items-center rounded-lg bg-muted/50 p-2">
              <span className="text-[10px] text-muted-foreground">Тренд</span>
              {stats.trend > 50 ? (
                <TrendingUp className="size-4 text-red-500 dark:text-red-400" />
              ) : stats.trend < -50 ? (
                <TrendingDown className="size-4 text-emerald-500 dark:text-emerald-400" />
              ) : (
                <Minus className="size-4 text-muted-foreground" />
              )}
              <span className="text-[10px] text-muted-foreground">
                {stats.trend > 0 ? `+${stats.trend}` : stats.trend} ккал
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
