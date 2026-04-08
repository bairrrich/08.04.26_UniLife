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
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import {
  Smile,
  TrendingDown,
  Wallet,
} from 'lucide-react'
import { MOOD_EMOJI, formatCurrency, type Period } from '@/lib/format'
import { moodChartConfig, spendingChartConfig } from './constants'
import { SkeletonChart } from './skeleton-components'
import type { MoodChartDataPoint, SpendingChartDataPoint } from './types'

interface ChartsRowProps {
  loading: boolean
  moodChartData: MoodChartDataPoint[]
  spendingChartData: SpendingChartDataPoint[]
  period: Period
}

// ─── Custom Tooltip for Mood ─────────────────────────────────────────────────

function MoodCustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (active && payload && payload.length && payload[0].value > 0) {
    const moodVal = Math.round(payload[0].value)
    return (
      <div className="rounded-lg border bg-background p-2.5 shadow-md">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold">
          {MOOD_EMOJI[moodVal] || ''} {moodVal}/5
        </p>
      </div>
    )
  }
  return null
}

// ─── Custom Tooltip for Spending ─────────────────────────────────────────────

function SpendingCustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2.5 shadow-md">
        <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-semibold tabular-nums">{formatCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ChartsRow({ loading, moodChartData, spendingChartData, period }: ChartsRowProps) {
  return (
    <div className="stagger-children grid gap-4 lg:grid-cols-2">
      {/* Mood Trend — AreaChart with gradient fill */}
      {loading ? (
        <SkeletonChart />
      ) : (
        <Card className="card-hover rounded-xl border">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Smile className="h-4 w-4 text-emerald-500" />
              Тренд настроения
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Среднее настроение по {period === 'week' ? 'дням' : period === 'month' ? 'неделям' : 'месяцам'}
            </p>
          </CardHeader>
          <CardContent>
            {moodChartData.every((d) => d.mood === 0) ? (
              <div className="flex h-[250px] items-center justify-center rounded-lg bg-muted/30">
                <div className="text-center">
                  <Smile className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">Нет данных о настроении</p>
                </div>
              </div>
            ) : (
              <ChartContainer config={moodChartConfig} className="h-[250px] w-full">
                <AreaChart data={moodChartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    domain={[0, 5]}
                    ticks={[1, 2, 3, 4, 5]}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => MOOD_EMOJI[v] || ''}
                  />
                  <ChartTooltip content={<MoodCustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="mood"
                    stroke="#10b981"
                    fill="url(#moodGradient)"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: 'hsl(var(--background))' }}
                    activeDot={{ r: 6, strokeWidth: 2, stroke: '#10b981' }}
                    connectNulls={false}
                  />
                </AreaChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* Spending Trend — BarChart with amber/emerald bars */}
      {loading ? (
        <SkeletonChart />
      ) : (
        <Card className="card-hover rounded-xl border">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <TrendingDown className="h-4 w-4 text-amber-500" />
              Расходы и доходы
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Динамика за {period === 'week' ? 'последнюю неделю' : period === 'month' ? 'месяц по неделям' : 'год по месяцам'}
            </p>
          </CardHeader>
          <CardContent>
            {spendingChartData.every((d) => d.spending === 0 && d.income === 0) ? (
              <div className="flex h-[250px] items-center justify-center rounded-lg bg-muted/30">
                <div className="text-center">
                  <Wallet className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">Нет финансовых данных</p>
                </div>
              </div>
            ) : (
              <ChartContainer config={spendingChartConfig} className="h-[250px] w-full">
                <BarChart data={spendingChartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}к` : String(v)}
                  />
                  <ChartTooltip content={<SpendingCustomTooltip />} />
                  <Bar
                    dataKey="income"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={24}
                    name="Доходы"
                  />
                  <Bar
                    dataKey="spending"
                    fill="#f59e0b"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={24}
                    name="Расходы"
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
