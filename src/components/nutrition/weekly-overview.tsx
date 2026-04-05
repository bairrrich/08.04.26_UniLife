'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus, Flame, Calendar, BarChart3, Target } from 'lucide-react'
import { getTodayStr } from '@/lib/format'
import type { NutritionGoals } from './nutrition-goals-dialog'
import { RU_DAYS_SHORT } from '@/lib/format'

interface WeeklyOverviewProps {
  goals: NutritionGoals | null
}

interface DailyData {
  date: string
  day: string
  kcal: number
  isToday: boolean
}

export function WeeklyOverview({ goals }: WeeklyOverviewProps) {
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
        console.error('Failed to fetch weekly overview data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchWeeklyData()
  }, [])

  const stats = useMemo(() => {
    if (data.length === 0) return null

    const daysWithData = data.filter((d) => d.kcal > 0)

    // Average daily
    const totalKcal = daysWithData.reduce((s, d) => s + d.kcal, 0)
    const avgDaily = daysWithData.length > 0 ? Math.round(totalKcal / daysWithData.length) : 0

    // Best day (highest calorie intake)
    const bestDay = daysWithData.length > 0
      ? daysWithData.reduce((best, d) => d.kcal > best.kcal ? d : best, daysWithData[0])
      : null

    // Calorie trend: compare this week's first half vs second half (or vs last 7 days)
    // Since we have 7 days, compare first 3 days avg vs last 3 days avg (skip today)
    const firstHalf = data.slice(0, 3).filter((d) => d.kcal > 0)
    const secondHalf = data.slice(4).filter((d) => d.kcal > 0)

    let trendPct = 0
    if (firstHalf.length > 0 && secondHalf.length > 0) {
      const firstAvg = firstHalf.reduce((s, d) => s + d.kcal, 0) / firstHalf.length
      const secondAvg = secondHalf.reduce((s, d) => s + d.kcal, 0) / secondHalf.length
      if (firstAvg > 0) {
        trendPct = Math.round(((secondAvg - firstAvg) / firstAvg) * 100)
      }
    }

    const goalKcal = goals?.dailyKcal ?? 2200
    const daysOnTarget = daysWithData.filter(
      (d) => d.kcal >= goalKcal * 0.9 && d.kcal <= goalKcal * 1.1
    ).length

    return { avgDaily, bestDay, trendPct, daysOnTarget, totalDaysWithData: daysWithData.length }
  }, [data, goals])

  if (loading) {
    return (
      <Card className="mb-6 rounded-xl">
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="skeleton-shimmer h-20 rounded-xl" />
            <div className="skeleton-shimmer h-20 rounded-xl" />
            <div className="skeleton-shimmer h-20 rounded-xl" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats || stats.totalDaysWithData === 0) return null

  const TrendIcon = stats.trendPct > 0 ? TrendingUp : stats.trendPct < 0 ? TrendingDown : Minus
  const trendColor = stats.trendPct > 0
    ? 'text-amber-600 dark:text-amber-400'
    : stats.trendPct < 0
      ? 'text-emerald-600 dark:text-emerald-400'
      : 'text-muted-foreground'
  const trendBg = stats.trendPct > 0
    ? 'bg-amber-100 dark:bg-amber-900/30'
    : stats.trendPct < 0
      ? 'bg-emerald-100 dark:bg-emerald-900/30'
      : 'bg-gray-100 dark:bg-gray-900/30'

  return (
    <Card className="mb-6 rounded-xl overflow-hidden glass-card">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <BarChart3 className="size-4 text-orange-500" />
          <span className="text-sm font-semibold">На этой неделе</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {/* Calorie trend */}
          <div className="rounded-xl bg-muted/40 p-3 flex flex-col items-center text-center">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${trendBg} mb-2`}>
              <TrendIcon className={`size-4 ${trendColor}`} />
            </div>
            <span className={`text-base font-bold tabular-nums ${trendColor}`}>
              {stats.trendPct > 0 ? '+' : ''}{stats.trendPct}%
            </span>
            <span className="text-[10px] text-muted-foreground mt-0.5">vs начало недели</span>
          </div>

          {/* Best day */}
          <div className="rounded-xl bg-muted/40 p-3 flex flex-col items-center text-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30 mb-2">
              <Flame className="size-4 text-orange-500" />
            </div>
            {stats.bestDay ? (
              <>
                <span className="text-base font-bold tabular-nums">{stats.bestDay.kcal}</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">
                  ккал · {stats.bestDay.day}
                </span>
              </>
            ) : (
              <>
                <span className="text-base font-bold tabular-nums">—</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">нет данных</span>
              </>
            )}
          </div>

          {/* Average daily */}
          <div className="rounded-xl bg-muted/40 p-3 flex flex-col items-center text-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 mb-2">
              <Target className="size-4 text-blue-500" />
            </div>
            <span className="text-base font-bold tabular-nums">{stats.avgDaily}</span>
            <span className="text-[10px] text-muted-foreground mt-0.5">среднее ккал/день</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
