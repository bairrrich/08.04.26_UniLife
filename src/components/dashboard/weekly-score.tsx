'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, BookOpen, Dumbbell, Target, UtensilsCrossed } from 'lucide-react'
import { getTodayStr, getWeekRange } from '@/lib/format'
import { fetchJson } from '@/lib/safe-fetch'

// ─── Types ────────────────────────────────────────────────────────────────────

interface WeeklyScoreData {
  score: number
  diaryEntries: number
  workoutSessions: number
  habitsPercent: number
  nutritionLogged: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getScoreColor(
  score: number,
): { stroke: string; text: string; track: string } {
  if (score >= 70) {
    return {
      stroke: 'stroke-emerald-500 dark:stroke-emerald-400',
      text: 'text-emerald-600 dark:text-emerald-400',
      track: 'stroke-muted/20',
    }
  }
  if (score >= 40) {
    return {
      stroke: 'stroke-amber-500 dark:stroke-amber-400',
      text: 'text-amber-600 dark:text-amber-400',
      track: 'stroke-muted/20',
    }
  }
  return {
    stroke: 'stroke-red-500 dark:stroke-red-400',
    text: 'text-red-600 dark:text-red-400',
    track: 'stroke-muted/20',
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function WeeklyScore() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<WeeklyScoreData>({
    score: 0,
    diaryEntries: 0,
    workoutSessions: 0,
    habitsPercent: 0,
    nutritionLogged: false,
  })

  useEffect(() => {
    async function fetchWeeklyScore() {
      try {
        const today = getTodayStr()
        const { from, to } = getWeekRange()

        const [diaryRes, workoutRes, habitsRes, nutritionRes] = await Promise.allSettled([
          fetchJson<{ success: boolean; data: Array<{ date: string }> }>(
            `/api/diary?month=${today.slice(0, 7)}`,
          ),
          fetchJson<{ success: boolean; data: Array<{ date: string }> }>(
            `/api/workout?month=${today.slice(0, 7)}`,
          ),
          fetchJson<{
            success: boolean
            stats: { totalActive: number; completedToday: number; bestStreak: number }
          }>('/api/habits'),
          fetchJson<{ success: boolean; data: Array<{ date: string }> }>(
            `/api/nutrition?date=${today}`,
          ),
        ])

        const weekFrom = new Date(from)
        const weekTo = new Date(to)

        // Diary entries this week
        let diaryEntries = 0
        if (diaryRes.status === 'fulfilled' && diaryRes.value?.success) {
          diaryEntries = diaryRes.value.data.filter((e) => {
            const d = new Date(e.date)
            return d >= weekFrom && d <= weekTo
          }).length
        }

        // Workouts this week
        let workoutSessions = 0
        if (workoutRes.status === 'fulfilled' && workoutRes.value?.success) {
          workoutSessions = workoutRes.value.data.filter((w) => {
            const d = new Date(w.date)
            return d >= weekFrom && d <= weekTo
          }).length
        }

        // Habits completion rate today
        let habitsPercent = 0
        if (habitsRes.status === 'fulfilled' && habitsRes.value?.success) {
          const { totalActive, completedToday } = habitsRes.value.stats
          habitsPercent = totalActive > 0 ? Math.round((completedToday / totalActive) * 100) : 0
        }

        // Nutrition logged today
        let nutritionLogged = false
        if (nutritionRes.status === 'fulfilled' && nutritionRes.value?.success) {
          nutritionLogged = nutritionRes.value.data.length > 0
        }

        // Calculate score (0-100)
        const diaryPoints = Math.min(diaryEntries * 5, 25)
        const workoutPoints = Math.min(Math.round(workoutSessions * 8.33), 25)
        const habitsPoints = Math.round((habitsPercent / 100) * 25)
        const nutritionPoints = nutritionLogged ? 25 : 0
        const score = diaryPoints + workoutPoints + habitsPoints + nutritionPoints

        setData({ score, diaryEntries, workoutSessions, habitsPercent, nutritionLogged })
      } catch (err) {
        console.error('Weekly score fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchWeeklyScore()
  }, [])

  // ── SVG Gauge ─────────────────────────────────────────────────────────
  const RADIUS = 40
  const STROKE_WIDTH = 6
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS
  const CENTER = RADIUS + STROKE_WIDTH
  const SIZE = (RADIUS + STROKE_WIDTH) * 2

  const colors = useMemo(() => getScoreColor(data.score), [data.score])
  const dashOffset = useMemo(
    () => CIRCUMFERENCE * (1 - data.score / 100),
    [data.score],
  )

  return (
    <Card className="animate-slide-up card-hover rounded-xl border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="h-4 w-4 text-emerald-500" />
          Балл за неделю
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col items-center gap-4 py-2">
            <Skeleton className="h-[100px] w-[100px] rounded-full" />
            <div className="grid grid-cols-2 gap-2 w-full">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-lg" />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            {/* Circular SVG Gauge */}
            <div className="relative flex items-center justify-center" style={{ width: SIZE, height: SIZE }}>
              <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90">
                {/* Background circle */}
                <circle
                  cx={CENTER}
                  cy={CENTER}
                  r={RADIUS}
                  fill="none"
                  strokeWidth={STROKE_WIDTH}
                  className={colors.track}
                />
                {/* Foreground arc */}
                <circle
                  cx={CENTER}
                  cy={CENTER}
                  r={RADIUS}
                  fill="none"
                  strokeWidth={STROKE_WIDTH}
                  strokeLinecap="round"
                  className={`${colors.stroke} transition-all duration-1000 ease-out`}
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={dashOffset}
                />
              </svg>
              {/* Score number */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-2xl font-bold tabular-nums ${colors.text}`}>
                  {data.score}
                </span>
                <span className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
                  из 100
                </span>
              </div>
            </div>

            {/* Mini Stats Grid (2x2) */}
            <div className="grid w-full grid-cols-2 gap-2">
              <div className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2">
                <BookOpen className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground leading-tight">Дневник</p>
                  <p className="text-xs font-semibold tabular-nums">
                    {data.diaryEntries} {data.diaryEntries === 1 ? 'запись' : 'записей'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2">
                <Dumbbell className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground leading-tight">Тренировки</p>
                  <p className="text-xs font-semibold tabular-nums">
                    {data.workoutSessions} {data.workoutSessions === 1 ? 'сессия' : 'сессий'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2">
                <Target className="h-3.5 w-3.5 text-violet-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground leading-tight">Привычки</p>
                  <p className="text-xs font-semibold tabular-nums">{data.habitsPercent}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2">
                <UtensilsCrossed className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground leading-tight">Питание</p>
                  <p className={`text-xs font-semibold ${data.nutritionLogged ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                    {data.nutritionLogged ? 'Записано' : 'Не записано'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
