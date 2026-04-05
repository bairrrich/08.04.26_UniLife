'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { BarChart3 } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface DayActivity {
  dayName: string
  dateKey: string
  diary: number
  workouts: number
  habits: number
  isToday: boolean
}

interface WeeklyActivityChartProps {
  loading: boolean
  data: DayActivity[]
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TOOLTIP_COLORS = {
  diary: 'bg-emerald-500',
  workouts: 'bg-blue-500',
  habits: 'bg-violet-500',
}

const TOOLTIP_LABELS = {
  diary: 'Дневник',
  workouts: 'Тренировки',
  habits: 'Привычки',
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function WeeklyActivityChart({ loading, data }: WeeklyActivityChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const maxTotal = useMemo(() => {
    if (data.length === 0) return 1
    return Math.max(...data.map((d) => d.diary + d.workouts + d.habits), 1)
  }, [data])

  return (
    <Card className="rounded-xl border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="h-4 w-4 text-emerald-500" />
          Активность за неделю
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3 py-2">
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        ) : (
          <>
            {/* Legend */}
            <div className="mb-4 flex flex-wrap items-center gap-4">
              {(['diary', 'workouts', 'habits'] as const).map((key) => (
                <div key={key} className="flex items-center gap-1.5">
                  <div className={`h-2.5 w-2.5 rounded-sm ${TOOLTIP_COLORS[key]}`} />
                  <span className="text-xs text-muted-foreground">{TOOLTIP_LABELS[key]}</span>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="relative">
              {/* Y-axis guide lines */}
              <div className="pointer-events-none absolute inset-0 flex flex-col justify-between py-1">
                {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
                  <div key={pct} className="flex items-center gap-2">
                    <span className="w-5 text-right text-[10px] tabular-nums text-muted-foreground/60">
                      {Math.round(maxTotal * (1 - pct))}
                    </span>
                    <div className="h-px flex-1 bg-border/40" />
                  </div>
                ))}
              </div>

              {/* Bars */}
              <div className="relative flex items-end justify-between gap-2 pt-6 pb-1 pl-7">
                {data.map((day, idx) => {
                  const total = day.diary + day.workouts + day.habits
                  const heightPct = total > 0 ? (total / maxTotal) * 100 : 0
                  const isHovered = hoveredIndex === idx

                  return (
                    <div
                      key={day.dateKey}
                      className="group relative flex flex-1 flex-col items-center gap-1"
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      {/* Stacked bar */}
                      <div
                        className={`flex w-full flex-col justify-end rounded-md transition-all duration-300 ${
                          day.isToday ? 'gap-0.5' : 'gap-0'
                        }`}
                        style={{ height: '140px' }}
                      >
                        {total === 0 ? (
                          <div className="h-1 w-full rounded bg-muted" />
                        ) : (
                          <>
                            {/* Diary segment */}
                            {day.diary > 0 && (
                              <div
                                className="w-full rounded-t-sm bg-emerald-500 transition-all duration-300 first:rounded-t-md"
                                style={{
                                  height: `${(day.diary / maxTotal) * 100}%`,
                                  opacity: isHovered ? 1 : 0.85,
                                }}
                              />
                            )}
                            {/* Workouts segment */}
                            {day.workouts > 0 && (
                              <div
                                className="w-full bg-blue-500 transition-all duration-300"
                                style={{
                                  height: `${(day.workouts / maxTotal) * 100}%`,
                                  opacity: isHovered ? 1 : 0.85,
                                }}
                              />
                            )}
                            {/* Habits segment */}
                            {day.habits > 0 && (
                              <div
                                className="w-full rounded-b-sm bg-violet-500 transition-all duration-300 last:rounded-b-md"
                                style={{
                                  height: `${(day.habits / maxTotal) * 100}%`,
                                  opacity: isHovered ? 1 : 0.85,
                                }}
                              />
                            )}
                          </>
                        )}
                      </div>

                      {/* Day label */}
                      <span
                        className={`text-xs font-medium transition-colors ${
                          day.isToday
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {day.dayName}
                      </span>

                      {/* Today indicator dot */}
                      {day.isToday && (
                        <div className="h-1 w-1 rounded-full bg-emerald-500" />
                      )}

                      {/* Hover tooltip */}
                      {isHovered && total > 0 && (
                        <div className="absolute -top-2 left-1/2 z-10 -translate-x-1/2 -translate-y-full animate-in fade-in-0 zoom-in-95">
                          <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-lg">
                            <p className="mb-1 font-semibold text-popover-foreground">
                              {day.dayName}
                              {day.isToday && (
                                <span className="ml-1 text-emerald-500">(сегодня)</span>
                              )}
                            </p>
                            <div className="space-y-0.5">
                              {day.diary > 0 && (
                                <div className="flex items-center gap-1.5">
                                  <div className="h-1.5 w-1.5 rounded-sm bg-emerald-500" />
                                  <span className="text-popover-foreground">
                                    Дневник: {day.diary}
                                  </span>
                                </div>
                              )}
                              {day.workouts > 0 && (
                                <div className="flex items-center gap-1.5">
                                  <div className="h-1.5 w-1.5 rounded-sm bg-blue-500" />
                                  <span className="text-popover-foreground">
                                    Тренировки: {day.workouts}
                                  </span>
                                </div>
                              )}
                              {day.habits > 0 && (
                                <div className="flex items-center gap-1.5">
                                  <div className="h-1.5 w-1.5 rounded-sm bg-violet-500" />
                                  <span className="text-popover-foreground">
                                    Привычки: {day.habits}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="mt-1 border-t pt-1 font-medium text-popover-foreground">
                              Итого: {total}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
