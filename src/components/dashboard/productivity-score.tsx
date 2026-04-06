'use client'

import { useMemo, memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Zap, TrendingUp } from 'lucide-react'
import { AnimatedNumber } from '@/components/ui/animated-number'

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProductivityScoreProps {
  loading: boolean
  diaryWritten: boolean
  waterMl: number
  workoutDone: boolean
  habitsCompleted: number
  habitsTotal: number
  nutritionLogged: boolean
  score: number
  /** 7-day score history for sparkline (newest last) */
  scoreHistory?: number[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getScoreColor(score: number): { stroke: string; text: string; bg: string; ring: string; barGradient: string } {
  if (score >= 81) {
    return {
      stroke: 'stroke-yellow-500',
      text: 'text-yellow-600 dark:text-yellow-400',
      bg: 'bg-yellow-50 dark:bg-yellow-950/30',
      ring: 'ring-yellow-500/20',
      barGradient: 'bg-gradient-to-r from-yellow-400 to-amber-500',
    }
  }
  if (score >= 61) {
    return {
      stroke: 'stroke-emerald-500',
      text: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      ring: 'ring-emerald-500/20',
      barGradient: 'bg-gradient-to-r from-emerald-400 to-teal-500',
    }
  }
  if (score >= 31) {
    return {
      stroke: 'stroke-amber-500',
      text: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      ring: 'ring-amber-500/20',
      barGradient: 'bg-gradient-to-r from-amber-400 to-orange-500',
    }
  }
  return {
    stroke: 'stroke-red-500',
    text: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/30',
    ring: 'ring-red-500/20',
    barGradient: 'bg-gradient-to-r from-red-400 to-rose-500',
  }
}

function getScoreLabel(score: number): string {
  if (score >= 81) return 'Мастер продуктивности'
  if (score >= 61) return 'Восходящая звезда'
  if (score >= 31) return 'Стабильный прогресс'
  if (score >= 1) return 'Начало пути'
  return 'Время действовать!'
}

function getStatusText(score: number): string {
  if (score >= 90) return 'Невероятный день! 🔥'
  if (score >= 75) return 'Отличный день! ✨'
  if (score >= 60) return 'Хороший день! 👍'
  if (score >= 40) return 'Можно лучше 💪'
  if (score >= 20) return 'Начни с малого 🌱'
  return 'Время действовать! ⚡'
}

function getBreakdownItems(
  diaryWritten: boolean,
  waterMl: number,
  workoutDone: boolean,
  habitsCompleted: number,
  habitsTotal: number,
  nutritionLogged: boolean,
) {
  const items = [
    {
      label: 'Дневник',
      emoji: '📝',
      done: diaryWritten,
      points: 25,
      maxPoints: 25,
      detail: diaryWritten ? '+25 очков' : '0 из 25',
      progress: diaryWritten ? 100 : 0,
    },
    {
      label: 'Привычки',
      emoji: '✅',
      done: habitsTotal > 0 && habitsCompleted === habitsTotal,
      points: habitsTotal > 0 ? Math.round((habitsCompleted / habitsTotal) * 25) : 0,
      maxPoints: 25,
      detail: `${habitsCompleted} из ${habitsTotal}`,
      progress: habitsTotal > 0 ? Math.round((habitsCompleted / habitsTotal) * 100) : 0,
    },
    {
      label: 'Тренировка',
      emoji: '💪',
      done: workoutDone,
      points: workoutDone ? 25 : 0,
      maxPoints: 25,
      detail: workoutDone ? '+25 очков' : '0 из 25',
      progress: workoutDone ? 100 : 0,
    },
    {
      label: 'Питание',
      emoji: '🥗',
      done: nutritionLogged,
      points: nutritionLogged ? 25 : 0,
      maxPoints: 25,
      detail: nutritionLogged ? '+25 очков' : '0 из 25',
      progress: nutritionLogged ? 100 : 0,
    },
  ]
  return items
}

// ─── Sparkline Component ──────────────────────────────────────────────────────

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null

  const width = 140
  const height = 32
  const padding = 2

  const maxVal = Math.max(...data, 1)
  const minVal = 0
  const range = maxVal - minVal || 1

  const points = data.map((val, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2)
    const y = height - padding - ((val - minVal) / range) * (height - padding * 2)
    return `${x},${y}`
  })

  const pathD = `M ${points.join(' L ')}`

  // Area fill path
  const areaD = `${pathD} L ${padding + (width - padding * 2)},${height - padding} L ${padding},${height - padding} Z`

  const dayLabels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

  return (
    <svg viewBox={`0 0 ${width} ${height + 14}`} className="w-full h-auto">
      {/* Gradient definition */}
      <defs>
        <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {/* Area fill */}
      <path d={areaD} fill="url(#sparkGradient)" />

      {/* Line */}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Data points */}
      {data.map((val, i) => {
        const x = padding + (i / (data.length - 1)) * (width - padding * 2)
        const y = height - padding - ((val - minVal) / range) * (height - padding * 2)
        const isLast = i === data.length - 1

        return (
          <g key={i}>
            <circle
              cx={x}
              cy={y}
              r={isLast ? 3 : 1.5}
              fill={isLast ? color : 'white'}
              stroke={color}
              strokeWidth={isLast ? 0 : 1}
            />
            {/* Day label */}
            <text
              x={x}
              y={height + 10}
              textAnchor="middle"
              className="fill-muted-foreground"
              fontSize="7"
            >
              {dayLabels[i] || ''}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ProductivityScore = memo(function ProductivityScore({
  loading,
  diaryWritten,
  waterMl,
  workoutDone,
  habitsCompleted,
  habitsTotal,
  nutritionLogged,
  score,
  scoreHistory = [],
}: ProductivityScoreProps) {
  const colors = useMemo(() => getScoreColor(score), [score])
  const statusText = useMemo(() => getStatusText(score), [score])
  const scoreLabel = useMemo(() => getScoreLabel(score), [score])
  const breakdown = useMemo(
    () => getBreakdownItems(diaryWritten, waterMl, workoutDone, habitsCompleted, habitsTotal, nutritionLogged),
    [diaryWritten, waterMl, workoutDone, habitsCompleted, habitsTotal, nutritionLogged],
  )

  const circumference = 2 * Math.PI * 54
  const dashOffset = circumference * (1 - score / 100)

  // Sparkline color based on score
  const sparkColor = useMemo(() => {
    if (score >= 81) return '#eab308' // yellow
    if (score >= 61) return '#10b981' // emerald
    if (score >= 31) return '#f59e0b' // amber
    return '#ef4444' // red
  }, [score])

  return (
    <Card className="card-hover rounded-xl border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="h-4 w-4 text-emerald-500" />
            Продуктивность сегодня
          </CardTitle>
          {!loading && (
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
              {scoreLabel}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-6 py-4">
            <Skeleton className="h-36 w-36 shrink-0 rounded-full" />
            <div className="flex-1 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-5 w-full rounded-md" />
              ))}
              <Skeleton className="h-20 w-full rounded-md" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            {/* Animated Circular Gauge */}
            <div className="relative flex h-36 w-36 shrink-0 items-center justify-center">
              {/* Pulse ring */}
              <div
                className={`absolute inset-0 rounded-full ${colors.ring} ring-4 animate-[pulse-ring_3s_ease-in-out_infinite]`}
              />
              {/* Background circle */}
              <svg className="h-36 w-36 -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  strokeWidth="10"
                  className="stroke-muted"
                />
                {/* Score arc */}
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  strokeWidth="10"
                  strokeLinecap="round"
                  className={`${colors.stroke} transition-all duration-1000 ease-out`}
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                />
              </svg>
              {/* Score number — animated locally */}
              <div className="absolute flex flex-col items-center">
                <span className={`text-3xl font-bold tabular-nums ${colors.text}`}>
                  <AnimatedNumber value={score} duration={800} />
                </span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  из 100
                </span>
              </div>
            </div>

            {/* Breakdown list + Sparkline */}
            <div className="flex-1 space-y-2 w-full">
              {breakdown.map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                    item.done
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/20'
                      : 'bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                        item.progress === 100
                          ? 'bg-emerald-500 text-white'
                          : item.progress > 0
                            ? 'bg-amber-500 text-white'
                            : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {item.progress === 100 ? '✓' : item.progress > 0 ? '◇' : '·'}
                    </span>
                    <span className="text-xs">{item.emoji}</span>
                    <span
                      className={
                        item.progress === 100
                          ? 'font-medium text-foreground'
                          : 'text-muted-foreground'
                      }
                    >
                      {item.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Mini progress bar */}
                    <div className="hidden sm:block w-12 h-1 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${item.progress === 100 ? colors.barGradient : 'bg-amber-400/60'}`}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                    <span
                      className={`text-xs font-semibold tabular-nums ${
                        item.progress === 100
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : item.progress > 0
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-muted-foreground'
                      }`}
                    >
                      +{item.points}
                    </span>
                  </div>
                </div>
              ))}

              {/* Status */}
              <div className={`mt-2 rounded-lg px-3 py-2 text-center font-medium ${colors.bg}`}>
                <p className={`text-sm ${colors.text}`}>{statusText}</p>
              </div>

              {/* Sparkline: 7-day score history */}
              {scoreHistory.length >= 2 && (
                <div className="mt-3 rounded-lg bg-muted/30 p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <TrendingUp className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[11px] font-medium text-muted-foreground">
                      Динамика за неделю
                    </span>
                  </div>
                  <Sparkline data={scoreHistory} color={sparkColor} />
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
})

export default ProductivityScore
