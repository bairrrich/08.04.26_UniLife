'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Line,
  ComposedChart,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Smile, TrendingUp } from 'lucide-react'
import { MOOD_EMOJI } from '@/lib/format'
import { moodTrendChartConfig } from './constants'
import { SkeletonChart } from './skeleton-components'
import type { MoodTrendPoint } from './types'

// ─── Custom Tooltip ────────────────────────────────────────────────────────────

function MoodTrendTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string; dataKey: string }>
  label?: string
}) {
  if (!active || !payload || payload.length === 0) return null

  const moodEntry = payload.find((p) => p.dataKey === 'mood')
  const weekAvgEntry = payload.find((p) => p.dataKey === 'weekAvg')

  if (!moodEntry || moodEntry.value === 0) return null

  const moodVal = Math.round(moodEntry.value)

  return (
    <div className="rounded-lg border bg-background p-2.5 shadow-md">
      <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex items-center gap-2">
        <span className="text-sm">
          {MOOD_EMOJI[moodVal] || ''} {moodVal}/5
        </span>
      </div>
      {weekAvgEntry && weekAvgEntry.value > 0 && (
        <p className="mt-1 text-[11px] text-muted-foreground">
          <TrendingUp className="inline h-3 w-3" /> Ср. неделя: {weekAvgEntry.value.toFixed(1)}
        </p>
      )}
    </div>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

interface MoodTrendsChartProps {
  loading: boolean
  data: MoodTrendPoint[]
}

export function MoodTrendsChart({ loading, data }: MoodTrendsChartProps) {
  if (loading) return <SkeletonChart />

  const hasMoodData = data.some((d) => d.mood > 0)

  return (
    <Card className="card-hover rounded-xl border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Smile className="h-4 w-4 text-emerald-500" />
              Тренд настроения
            </CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Настроение за 30 дней с еженедельным средним
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] text-muted-foreground">Настроение</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="text-[10px] text-muted-foreground">Ср. неделя</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!hasMoodData ? (
          <div className="flex h-[250px] items-center justify-center rounded-lg bg-muted/30">
            <div className="text-center">
              <Smile className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Нет данных о настроении за 30 дней</p>
            </div>
          </div>
        ) : (
          <ChartContainer config={moodTrendChartConfig} className="h-[250px] w-full">
            <ComposedChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="moodTrendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10 }}
                interval={2}
              />
              <YAxis
                domain={[0, 5]}
                ticks={[1, 2, 3, 4, 5]}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => MOOD_EMOJI[v] || ''}
                width={30}
              />
              <ChartTooltip content={<MoodTrendTooltip />} />
              <Area
                type="monotone"
                dataKey="mood"
                stroke="#10b981"
                fill="url(#moodTrendGradient)"
                strokeWidth={2}
                dot={(props: Record<string, unknown>) => {
                  const { cx, cy, value } = props as { cx: number; cy: number; value: number }
                  if (!value || value === 0) return <g key={`dot-${cx}`} />
                  return (
                    <circle
                      key={`dot-${cx}`}
                      cx={cx}
                      cy={cy}
                      r={3.5}
                      fill="#10b981"
                      strokeWidth={1.5}
                      stroke="hsl(var(--background))"
                    />
                  )
                }}
                activeDot={{ r: 5, strokeWidth: 2, stroke: '#10b981' }}
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="weekAvg"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="6 3"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: '#f59e0b', fill: '#f59e0b' }}
                connectNulls={false}
              />
            </ComposedChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
