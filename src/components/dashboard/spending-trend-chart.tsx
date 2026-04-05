'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { formatCurrency } from '@/lib/format'
import { spendingTrendConfig } from './constants'

// ─── Props ────────────────────────────────────────────────────────────────────

interface SpendingTrendChartProps {
  loading: boolean
  weeklySpendingData: { day: string; spending: number }[]
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SpendingTrendChart({ loading, weeklySpendingData }: SpendingTrendChartProps) {
  return (
    <Card className="rounded-xl border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Динамика расходов за неделю</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[220px] w-full rounded-lg" />
        ) : weeklySpendingData.length > 0 ? (
          <ChartContainer config={spendingTrendConfig} className="h-[220px] w-full">
            <AreaChart data={weeklySpendingData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={60}
                tick={{ fontSize: 12 }}
                tickFormatter={(value: number) => `${value.toLocaleString('ru-RU')} ₽`}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => (
                      <span className="font-medium">{formatCurrency(value as number)}</span>
                    )}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="spending"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                fill="url(#spendingGradient)"
                dot={{ r: 4, fill: 'hsl(var(--chart-1))', strokeWidth: 2, stroke: 'hsl(var(--background))' }}
                activeDot={{ r: 6, fill: 'hsl(var(--chart-1))', strokeWidth: 2, stroke: 'hsl(var(--background))' }}
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
            Нет данных о расходах за эту неделю
          </div>
        )}
      </CardContent>
    </Card>
  )
}
