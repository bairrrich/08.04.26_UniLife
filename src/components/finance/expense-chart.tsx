'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Receipt, BarChart3, TrendingUp } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { chartConfig } from './constants'
import { cn } from '@/lib/utils'
import type { ChartDataPoint } from './types'

interface ExpenseChartProps {
  chartData: ChartDataPoint[]
  isLoading: boolean
}

export function ExpenseChart({ chartData, isLoading }: ExpenseChartProps) {
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar')

  if (isLoading) {
    return <div className="skeleton-shimmer h-[300px] rounded-xl w-full lg:col-span-2" />
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Receipt className="h-4 w-4 text-muted-foreground" />
            Расходы по дням
          </CardTitle>
          {/* Chart type toggle */}
          <div className="flex items-center gap-1 rounded-lg bg-muted p-0.5">
            <button
              onClick={() => setChartType('bar')}
              className={cn(
                'flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all',
                chartType === 'bar'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <BarChart3 className="h-3 w-3" />
              Столбцы
            </button>
            <button
              onClick={() => setChartType('line')}
              className={cn(
                'flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all',
                chartType === 'line'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <TrendingUp className="h-3 w-3" />
              Линии
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          {chartType === 'bar' ? (
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
                interval={Math.floor(chartData.length / 10)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}к`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="expense"
                fill="var(--color-expense)"
                radius={[4, 4, 0, 0]}
                maxBarSize={20}
              />
              <Bar
                dataKey="income"
                fill="var(--color-income)"
                radius={[4, 4, 0, 0]}
                maxBarSize={20}
              />
            </BarChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
                interval={Math.floor(chartData.length / 10)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}к`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="expense"
                stroke="var(--color-expense)"
                strokeWidth={2}
                dot={{ r: 3, fill: 'var(--color-expense)' }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="income"
                stroke="var(--color-income)"
                strokeWidth={2}
                dot={{ r: 3, fill: 'var(--color-income)' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
