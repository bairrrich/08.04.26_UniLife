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
import { workoutPieConfig, categoryBarConfig } from './constants'
import { SkeletonChart } from './skeleton-components'
import type { NutritionSummary, WorkoutDistributionPoint, TopCategoryPoint } from './types'

// ─── Nutrition Chart ──────────────────────────────────────────────────────────

interface NutritionChartProps {
  loading: boolean
  nutritionSummary: NutritionSummary
}

export function NutritionChart({ loading, nutritionSummary }: NutritionChartProps) {
  if (loading) return <SkeletonChart />

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
          <div className="flex h-[220px] items-center justify-center rounded-lg bg-muted/30">
            <div className="text-center">
              <Apple className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Нет данных о питании</p>
            </div>
          </div>
        ) : (
          <div className="space-y-5 py-2">
            {/* Calories */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="h-3.5 w-3.5 text-orange-500" />
                  <span className="text-sm font-medium">Калории</span>
                </div>
                <span className="text-sm font-semibold tabular-nums text-orange-600 dark:text-orange-400">
                  {nutritionSummary.avgKcal} <span className="text-xs font-normal text-muted-foreground">/ 2200 ккал</span>
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-orange-100 dark:bg-orange-900/30">
                <div
                  className="h-full rounded-full bg-orange-500 transition-all duration-500"
                  style={{ width: `${Math.min((nutritionSummary.avgKcal / 2200) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Protein */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3.5 w-3.5 rounded-sm bg-emerald-500" />
                  <span className="text-sm font-medium">Белки</span>
                </div>
                <span className="text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                  {nutritionSummary.avgProtein}г <span className="text-xs font-normal text-muted-foreground">/ 150г</span>
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${Math.min((nutritionSummary.avgProtein / 150) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Fat */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3.5 w-3.5 rounded-sm bg-amber-500" />
                  <span className="text-sm font-medium">Жиры</span>
                </div>
                <span className="text-sm font-semibold tabular-nums text-amber-600 dark:text-amber-400">
                  {nutritionSummary.avgFat}г <span className="text-xs font-normal text-muted-foreground">/ 80г</span>
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-amber-100 dark:bg-amber-900/30">
                <div
                  className="h-full rounded-full bg-amber-500 transition-all duration-500"
                  style={{ width: `${Math.min((nutritionSummary.avgFat / 80) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Carbs */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3.5 w-3.5 rounded-sm bg-blue-500" />
                  <span className="text-sm font-medium">Углеводы</span>
                </div>
                <span className="text-sm font-semibold tabular-nums text-blue-600 dark:text-blue-400">
                  {nutritionSummary.avgCarbs}г <span className="text-xs font-normal text-muted-foreground">/ 250г</span>
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-blue-100 dark:bg-blue-900/30">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${Math.min((nutritionSummary.avgCarbs / 250) * 100, 100)}%` }}
                />
              </div>
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
          <div className="flex h-[220px] items-center justify-center rounded-lg bg-muted/30">
            <div className="text-center">
              <Dumbbell className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Нет данных о тренировках</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-start sm:gap-4">
            <ChartContainer config={workoutPieConfig} className="h-[200px] w-[200px] shrink-0">
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
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
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
