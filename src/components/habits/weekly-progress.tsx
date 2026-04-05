import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { BarChart3 } from 'lucide-react'

type ProgressColor = 'emerald' | 'amber' | 'red'

interface WeeklyProgressProps {
  rate: number
  color: ProgressColor
}

const COLOR_CLASSES: Record<ProgressColor, { bar: string; track: string; text: string; iconBg: string }> = {
  emerald: {
    bar: '[&>div]:bg-emerald-500',
    track: 'bg-emerald-100 dark:bg-emerald-900/30',
    text: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
  amber: {
    bar: '[&>div]:bg-amber-500',
    track: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
  },
  red: {
    bar: '[&>div]:bg-red-500',
    track: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-600 dark:text-red-400',
    iconBg: 'bg-red-100 dark:bg-red-900/30',
  },
}

export function WeeklyProgress({ rate, color }: WeeklyProgressProps) {
  const classes = COLOR_CLASSES[color]
  return (
    <Card className="card-hover overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 pointer-events-none" />
      <CardContent className="relative p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className={`h-9 w-9 rounded-lg ${classes.iconBg} flex items-center justify-center shrink-0`}>
            <BarChart3 className={`h-4.5 w-4.5 ${classes.text}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold">Прогресс за неделю</h3>
            <p className="text-xs text-muted-foreground">
              В среднем <span className={`font-semibold ${classes.text}`}>{rate}%</span> привычек выполнено
            </p>
          </div>
          <span className={`text-2xl font-bold tabular-nums ${classes.text}`}>
            {rate}%
          </span>
        </div>
        <Progress
          value={rate}
          className={`h-2.5 ${classes.track} ${classes.bar}`}
        />
      </CardContent>
    </Card>
  )
}
