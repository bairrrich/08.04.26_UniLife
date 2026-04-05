'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { formatCurrency } from '@/lib/format'
import { expensePieConfig } from './constants'

// ─── Props ────────────────────────────────────────────────────────────────────

interface ExpensePieChartProps {
  loading: boolean
  expensePieData: { name: string; value: number; fill: string }[]
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ExpensePieChart({ loading, expensePieData }: ExpensePieChartProps) {
  return (
    <Card className="rounded-xl border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Расходы по категориям</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[250px] w-full rounded-lg" />
        ) : expensePieData.length > 0 ? (
          <ChartContainer config={expensePieConfig} className="h-[250px] w-full">
            <PieChart>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, _name, item) => {
                      const name = item.payload.name as string
                      return <span>{name}: {formatCurrency(value as number)}</span>
                    }}
                  />
                }
              />
              <Pie
                data={expensePieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {expensePieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartLegend content={<ChartLegendContent nameKey="name" />} />
            </PieChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
            Нет расходов в этом месяце
          </div>
        )}
      </CardContent>
    </Card>
  )
}
