'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'

// ─── Types ──────────────────────────────────────────────────────────────

interface EarningsDataPoint {
  date: string
  day: number
  amount: number
}

interface EarningsChartProps {
  earnings: Array<{ date: string; amount: number }>
  isLoading: boolean
}

// ─── Chart Config ───────────────────────────────────────────────────────

const earningsChartConfig: ChartConfig = {
  amount: {
    label: 'Заработок',
    color: 'hsl(199, 89%, 48%)',
  },
}

// ─── Gradient IDs ───────────────────────────────────────────────────────

const GRADIENT_ID = 'earningsBarGradient'

// ─── Component ──────────────────────────────────────────────────────────

export function EarningsChart({ earnings, isLoading }: EarningsChartProps) {
  // Transform earnings array into chart data grouped by day
  const chartData = useMemo(() => {
    const grouped = new Map<number, number>()
    for (const e of earnings) {
      const day = parseInt(e.date.split('-')[2], 10)
      grouped.set(day, (grouped.get(day) ?? 0) + e.amount)
    }

    const maxDay = Math.max(...grouped.keys(), 1)
    const data: EarningsDataPoint[] = []

    for (let d = 1; d <= maxDay; d++) {
      data.push({
        date: String(d),
        day: d,
        amount: grouped.get(d) ?? 0,
      })
    }

    return data
  }, [earnings])

  // Total earnings for display
  const totalEarnings = useMemo(() => {
    return earnings.reduce((sum, e) => sum + e.amount, 0)
  }, [earnings])

  // Max amount for Y-axis formatting
  const maxAmount = useMemo(() => {
    return Math.max(...chartData.map(d => d.amount), 1)
  }, [chartData])

  if (isLoading) {
    return (
      <Card className="card-hover overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500" />
        <CardContent className="p-4">
          <div className="skeleton-shimmer h-[220px] rounded-xl" />
        </CardContent>
      </Card>
    )
  }

  if (chartData.length === 0 || totalEarnings === 0) {
    return null
  }

  return (
    <Card className="card-hover overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500" />
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-900/50">
              <BarChart3 className="h-4 w-4 text-sky-500" />
            </div>
            Заработок по дням
          </CardTitle>
          <span className="text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
            {totalEarnings.toLocaleString('ru-RU')} ₽
          </span>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <ChartContainer config={earningsChartConfig} className="h-[200px] w-full">
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id={GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity={1} />
                <stop offset="50%" stopColor="#06b6d4" stopOpacity={0.85} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.7} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10 }}
              interval={0}
              tickFormatter={(v: number) => String(v)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10 }}
              tickFormatter={(v: number) => {
                if (v === 0) return '0'
                if (v >= 1000) return `${(v / 1000).toFixed(0)}к`
                return String(v)
              }}
              width={35}
            />
            <ChartTooltip
              content={<ChartTooltipContent />}
              formatter={(value: number) => (
                <span className="font-medium tabular-nums">
                  {value.toLocaleString('ru-RU')} ₽
                </span>
              )}
              labelFormatter={(label: number) => `День ${label}`}
            />
            <Bar
              dataKey="amount"
              fill={`url(#${GRADIENT_ID})`}
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.amount > 0 ? `url(#${GRADIENT_ID})` : 'transparent'}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
