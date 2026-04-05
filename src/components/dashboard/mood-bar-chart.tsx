'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { moodChartConfig } from './constants'

// ─── Props ────────────────────────────────────────────────────────────────────

interface MoodBarChartProps {
  loading: boolean
  weeklyMoodData: { day: string; mood: number; label: string }[]
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MoodBarChart({ loading, weeklyMoodData }: MoodBarChartProps) {
  return (
    <Card className="rounded-xl border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Настроение за неделю</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[250px] w-full rounded-lg" />
        ) : weeklyMoodData.length > 0 ? (
          <ChartContainer config={moodChartConfig} className="h-[250px] w-full">
            <BarChart data={weeklyMoodData} margin={{ top: 8, right: 8, bottom: 0, left: -10 }}>
              <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
              <YAxis
                domain={[0, 5]}
                ticks={[1, 2, 3, 4, 5]}
                tickLine={false}
                axisLine={false}
                width={30}
                tick={{ fontSize: 12 }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, _name, item) => {
                      const label = item.payload.label as string
                      return <span>{label}</span>
                    }}
                  />
                }
              />
              <Bar dataKey="mood" fill="hsl(var(--chart-1))" radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
            Нет данных о настроении за эту неделю
          </div>
        )}
      </CardContent>
    </Card>
  )
}
