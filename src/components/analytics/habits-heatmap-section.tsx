import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Target } from 'lucide-react'
import { SkeletonChart } from './skeleton-components'
import type { HabitsHeatmapCell, HabitItem } from './types'

interface HabitsHeatmapSectionProps {
  loading: boolean
  habitsHeatmap: HabitsHeatmapCell[]
  heatmapCompletionRate: number
  totalHabits: number
  habits: HabitItem[]
}

export function HabitsHeatmapSection({
  loading,
  habitsHeatmap,
  heatmapCompletionRate,
  totalHabits,
  habits,
}: HabitsHeatmapSectionProps) {
  if (loading) return <SkeletonChart />

  return (
    <Card className="card-hover rounded-xl border">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Target className="h-4 w-4 text-violet-500" />
          Карта привычек
        </CardTitle>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Последние 30 дней
          </p>
          <Badge
            variant="secondary"
            className="tabular-nums text-xs"
          >
            {heatmapCompletionRate}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {totalHabits === 0 ? (
          <div className="flex h-[250px] items-center justify-center rounded-lg bg-muted/30">
            <div className="text-center">
              <Target className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Нет активных привычек</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {/* Heatmap Grid */}
            <div className="grid grid-cols-10 gap-1.5">
              {habitsHeatmap.map((cell) => (
                <div
                  key={cell.date}
                  title={`${cell.date}: ${cell.completed ? 'Выполнено' : 'Не выполнено'}`}
                  className={`flex h-7 w-full items-center justify-center rounded-md text-[10px] tabular-nums transition-colors ${
                    cell.completed
                      ? 'bg-emerald-500 text-white font-medium'
                      : 'bg-muted/50 text-muted-foreground dark:bg-muted/30'
                  }`}
                >
                  {cell.day}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-sm bg-emerald-500" />
                <span className="text-xs text-muted-foreground">Выполнено</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-sm bg-muted/50 dark:bg-muted/30" />
                <span className="text-xs text-muted-foreground">Не выполнено</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-around rounded-lg bg-muted/30 px-4 py-3">
              <div className="text-center">
                <p className="text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                  {habitsHeatmap.filter((h) => h.completed).length}
                </p>
                <p className="text-[11px] text-muted-foreground">дней с привычками</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <p className="text-lg font-bold tabular-nums text-red-500">
                  {habitsHeatmap.filter((h) => !h.completed).length}
                </p>
                <p className="text-[11px] text-muted-foreground">пропущено</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <p className="text-lg font-bold tabular-nums text-foreground">
                  {habits.filter((h) => h.streak > 0).length}
                </p>
                <p className="text-[11px] text-muted-foreground">серия активна</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
