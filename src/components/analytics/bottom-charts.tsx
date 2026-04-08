'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
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
} from '@/components/ui/chart'
import {
  Apple,
  Flame,
  Dumbbell,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { nutritionChartConfig, workoutPieConfig, categoryBarConfig } from './constants'
import { SkeletonChart } from './skeleton-components'
import type { NutritionSummary, WorkoutDistributionPoint, TopCategoryPoint } from './types'

// ─── Nutrition Chart Data ────────────────────────────────────────────────────

function getNutritionBarData(summary: NutritionSummary) {
  return [
    { name: 'Калории', value: summary.avgKcal, target: 2200, fill: '#f97316', unit: 'ккал' },
    { name: 'Белки', value: summary.avgProtein, target: 150, fill: '#10b981', unit: 'г' },
    { name: 'Жиры', value: summary.avgFat, target: 80, fill: '#f59e0b', unit: 'г' },
    { name: 'Углеводы', value: summary.avgCarbs, target: 250, fill: '#3b82f6', unit: 'г' },
  ]
}

// ─── Nutrition Chart ──────────────────────────────────────────────────────────

interface NutritionChartProps {
  loading: boolean
  nutritionSummary: NutritionSummary
}

export function NutritionChart({ loading, nutritionSummary }: NutritionChartProps) {
  if (loading) return <SkeletonChart />

  const nutritionData = getNutritionBarData(nutritionSummary)

  return (
    <Card className="card-hover rounded-xl border">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Apple className="h-4 w-4 text-orange-500" />
          Среднее питание за день
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Средние значения за {nutritionSummary.daysWithData} {nutritionSummary.daysWithData === 1 ? 'день' : nutritionSummary.daysWithData < 5 ? 'дня' : 'дней'}
        </p>
      </CardHeader>
      <CardContent>
        {nutritionSummary.daysWithData === 0 ? (
          <div className="flex h-[250px] items-center justify-center rounded-lg bg-muted/30">
            <div className="text-center">
              <Apple className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Нет данных о питании</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {/* Horizontal BarChart */}
            <ChartContainer config={nutritionChartConfig} className="h-[180px] w-full">
              <BarChart data={nutritionData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-muted" />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10 }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                  width={80}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, _name, item) => {
                        const payload = item.payload as { unit: string; target: number }
                        return (
                          <span className="tabular-nums">
                            {value as number}{payload.unit} / {payload.target}{payload.unit}
                          </span>
                        )
                      }}
                    />
                  }
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={20}>
                  {nutritionData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>

            {/* Mini progress bars */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {nutritionData.map((item) => (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: item.fill }} />
                      <span className="text-[11px] font-medium text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="text-[11px] tabular-nums font-medium" style={{ color: item.fill }}>
                      {item.value}{item.unit}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/50">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min((item.value / item.target) * 100, 100)}%`,
                        backgroundColor: item.fill,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Workout Distribution Chart ───────────────────────────────────────────────

interface WorkoutDistributionChartProps {
  loading: boolean
  workoutDistribution: WorkoutDistributionPoint[]
  workoutCount: number
}

// Custom label for pie chart
const RADIAN = Math.PI / 180
function renderCustomizedLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: {
  cx: number
  cy: number
  midAngle?: number
  innerRadius?: number
  outerRadius?: number
  percent?: number
}) {
  if (!percent || !midAngle || !innerRadius || !outerRadius || percent < 0.08) return null
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export function WorkoutDistributionChart({ loading, workoutDistribution, workoutCount }: WorkoutDistributionChartProps) {
  if (loading) return <SkeletonChart />

  return (
    <Card className="card-hover rounded-xl border">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Dumbbell className="h-4 w-4 text-blue-500" />
          Распределение тренировок
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          По типам ({workoutCount} {workoutCount === 1 ? 'тренировка' : workoutCount < 5 ? 'тренировки' : 'тренировок'})
        </p>
      </CardHeader>
      <CardContent>
        {workoutDistribution.length === 0 ? (
          <div className="flex h-[250px] items-center justify-center rounded-lg bg-muted/30">
            <div className="text-center">
              <Dumbbell className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Нет данных о тренировках</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-start sm:gap-4">
          <ChartContainer config={workoutPieConfig} className="h-[160px] sm:h-[200px] w-[160px] sm:w-[200px] shrink-0">
              <PieChart>
                <Pie
                  data={workoutDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  strokeWidth={2}
                  label={renderCustomizedLabel}
                  labelLine={false}
                >
                  {workoutDistribution.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
            <div className="flex flex-col gap-2">
              {workoutDistribution.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 shrink-0 rounded-sm"
                    style={{ backgroundColor: entry.fill }}
                  />
                  <span className="text-sm text-muted-foreground">{entry.name}</span>
                  <Badge variant="secondary" className="ml-auto tabular-nums text-xs">
                    {entry.value}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Top Categories Chart ─────────────────────────────────────────────────────

interface TopCategoriesChartProps {
  loading: boolean
  topCategories: TopCategoryPoint[]
}

export function TopCategoriesChart({ loading, topCategories }: TopCategoriesChartProps) {
  if (loading) return <SkeletonChart />

  return (
    <Card className="card-hover rounded-xl border">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <TrendingUp className="h-4 w-4 text-amber-500" />
          Топ-5 категорий расходов
        </CardTitle>
      </CardHeader>
      <CardContent>
        {topCategories.length === 0 ? (
          <div className="flex h-[250px] items-center justify-center rounded-lg bg-muted/30">
            <div className="text-center">
              <Wallet className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Нет данных о расходах</p>
            </div>
          </div>
        ) : (
          <ChartContainer config={categoryBarConfig} className="h-[250px] w-full">
            <BarChart data={topCategories} layout="vertical" margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-muted" />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}к` : String(v)}
              />
              <YAxis
                type="category"
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
                width={100}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => (
                      <span className="tabular-nums">{formatCurrency(value as number)}</span>
                    )}
                  />
                }
              />
              <Bar dataKey="amount" radius={[0, 6, 6, 0]} maxBarSize={28}>
                {topCategories.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
