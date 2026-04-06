'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Clock } from 'lucide-react'
import { timeOfDayChartConfig } from './constants'
import { SkeletonChart } from './skeleton-components'
import type { TimeOfDayPoint } from './types'

// ─── Time Period Colors ───────────────────────────────────────────────────────

const PERIOD_COLORS: Record<string, string> = {
  'Утро': '#f59e0b',
  'День': '#10b981',
  'Вечер': '#6366f1',
  'Ночь': '#64748b',
}

const PERIOD_ICONS: Record<string, string> = {
  'Утро': '🌅',
  'День': '☀️',
  'Вечер': '🌆',
  'Ночь': '🌙',
}

// ─── Custom Tooltip ────────────────────────────────────────────────────────────

function TimeOfDayTooltip({ active, payload }: {
  active?: boolean
  payload?: Array<{ value: number; payload: { period: string; count: number } }>
}) {
  if (!active || !payload || payload.length === 0) return null
  const data = payload[0].payload
  return (
    <div className="rounded-lg border bg-background p-2.5 shadow-md">
      <p className="text-xs font-medium">
        {PERIOD_ICONS[data.period]} {data.period}
      </p>
      <p className="text-sm font-semibold tabular-nums">
        {data.count} {data.count === 1 ? 'действие' : data.count < 5 ? 'действия' : 'действий'}
      </p>
    </div>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

interface TimeOfDayChartProps {
  loading: boolean
  data: TimeOfDayPoint[]
}

export function TimeOfDayChart({ loading, data }: TimeOfDayChartProps) {
  if (loading) return <SkeletonChart />

  const hasData = data.some((d) => d.count > 0)
  const total = data.reduce((s, d) => s + d.count, 0)
  const peak = data.reduce((max, d) => (d.count > max.count ? d : max), data[0])

  return (
    <Card className="card-hover rounded-xl border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Clock className="h-4 w-4 text-indigo-500" />
              Время активности
            </CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Когда вы наиболее активны
            </p>
          </div>
          {hasData && peak.count > 0 && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Пик</p>
              <p className="text-sm font-semibold">
                {PERIOD_ICONS[peak.period]} {peak.period}
              </p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex h-[220px] items-center justify-center rounded-lg bg-muted/30">
            <div className="text-center">
              <Clock className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Нет данных о времени активности</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <ChartContainer config={timeOfDayChartConfig} className="h-[180px] w-full">
              <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                <XAxis
                  dataKey="period"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                  allowDecimals={false}
                />
                <ChartTooltip content={<TimeOfDayTooltip />} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={56}>
                  {data.map((entry) => (
                    <Cell key={entry.period} fill={PERIOD_COLORS[entry.period] || 'hsl(var(--chart-1))'} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>

            {/* Period breakdown */}
            <div className="grid grid-cols-4 gap-2">
              {data.map((entry) => (
                <div
                  key={entry.period}
                  className="flex flex-col items-center gap-1 rounded-lg bg-muted/30 p-2"
                >
                  <span className="text-base">{PERIOD_ICONS[entry.period]}</span>
                  <span className="text-xs text-muted-foreground">{entry.period}</span>
                  <span className="text-sm font-bold tabular-nums">{entry.count}</span>
                  {total > 0 && (
                    <span className="text-[10px] text-muted-foreground tabular-nums">
                      {Math.round((entry.count / total) * 100)}%
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
