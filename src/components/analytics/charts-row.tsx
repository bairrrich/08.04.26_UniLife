import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  LineChart,
  Line,
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

export function ChartsRow({ loading, moodChartData, spendingChartData, period }: ChartsRowProps) {
  return (
    <div className="stagger-children grid gap-4 lg:grid-cols-2">
      {/* Mood Trend */}
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
                <LineChart data={moodChartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
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
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="mood"
                    stroke="var(--color-mood)"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: 'var(--color-mood)', strokeWidth: 2, stroke: 'var(--color-background)' }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                    connectNulls={false}
                  />
                </LineChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* Spending Trend */}
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
                <AreaChart data={spendingChartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-spending)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-spending)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-income)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-income)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
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
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name) => (
                          <span className="tabular-nums">
                            {formatCurrency(value as number)}
                          </span>
                        )}
                      />
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke="var(--color-income)"
                    fill="url(#incomeGradient)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="spending"
                    stroke="var(--color-spending)"
                    fill="url(#spendingGradient)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </AreaChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
