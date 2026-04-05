'use client'

import { useMemo, memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Zap } from 'lucide-react'
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
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getScoreColor(score: number): { stroke: string; text: string; bg: string; ring: string } {
  if (score >= 75) {
    return {
      stroke: 'stroke-emerald-500',
      text: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      ring: 'ring-emerald-500/20',
    }
  }
  if (score >= 50) {
    return {
      stroke: 'stroke-amber-500',
      text: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      ring: 'ring-amber-500/20',
    }
  }
  return {
    stroke: 'stroke-red-500',
    text: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/30',
    ring: 'ring-red-500/20',
  }
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
      done: diaryWritten,
      points: 25,
      detail: diaryWritten ? 'Запись написана' : 'Не написан',
    },
    {
      label: 'Вода',
      done: waterMl >= 1000,
      points: 20,
      detail: `${waterMl} мл из 2000 мл`,
    },
    {
      label: 'Тренировка',
      done: workoutDone,
      points: 25,
      detail: workoutDone ? 'Выполнена' : 'Не выполнена',
    },
    {
      label: 'Привычки',
      done: habitsTotal > 0 && habitsCompleted === habitsTotal,
      points: 15,
      detail: `${habitsCompleted} из ${habitsTotal}`,
    },
    {
      label: 'Питание',
      done: nutritionLogged,
      points: 15,
      detail: nutritionLogged ? 'Записано' : 'Не записано',
    },
  ]
  return items
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
}: ProductivityScoreProps) {
  const colors = useMemo(() => getScoreColor(score), [score])
  const statusText = useMemo(() => getStatusText(score), [score])
  const breakdown = useMemo(
    () => getBreakdownItems(diaryWritten, waterMl, workoutDone, habitsCompleted, habitsTotal, nutritionLogged),
    [diaryWritten, waterMl, workoutDone, habitsCompleted, habitsTotal, nutritionLogged],
  )

  const circumference = 2 * Math.PI * 54
  const dashOffset = circumference * (1 - score / 100)

  return (
    <Card className="card-hover rounded-xl border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Zap className="h-4 w-4 text-emerald-500" />
          Продуктивность сегодня
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-6 py-4">
            <Skeleton className="h-36 w-36 shrink-0 rounded-full" />
            <div className="flex-1 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-5 w-full rounded-md" />
              ))}
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

            {/* Breakdown list */}
            <div className="flex-1 space-y-2">
              {breakdown.map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-sm transition-colors ${
                    item.done
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/20'
                      : 'bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                        item.done
                          ? 'bg-emerald-500 text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {item.done ? '✓' : '·'}
                    </span>
                    <span
                      className={
                        item.done
                          ? 'font-medium text-foreground'
                          : 'text-muted-foreground'
                      }
                    >
                      {item.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{item.detail}</span>
                    <span
                      className={`text-xs font-semibold tabular-nums ${
                        item.done
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-muted-foreground'
                      }`}
                    >
                      +{item.points}
                    </span>
                  </div>
                </div>
              ))}

              {/* Status */}
              <div className={`mt-3 rounded-lg px-3 py-2 text-center font-medium ${colors.bg}`}>
                <p className={`text-sm ${colors.text}`}>{statusText}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
})

export default ProductivityScore
