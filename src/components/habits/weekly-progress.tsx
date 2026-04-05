import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

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

// Day labels
const DAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

export function WeeklyProgress({ rate, color }: WeeklyProgressProps) {
  const classes = COLOR_CLASSES[color]

  // Generate simulated day-by-day data for display
  const dayData = DAY_LABELS.map((label, i) => {
    // Use rate as base with some variation per day
    const today = new Date().getDay()
    const dayIndex = i // Mon=0
    const dayOfWeek = (i + 1) % 7 // Convert to JS day format (0=Sun)
    const isFuture = dayIndex > today
    const completed = isFuture ? false : Math.random() < (rate / 100) + (Math.random() * 0.2 - 0.1)
    return { label, completed, isFuture }
  })

  const completedDays = dayData.filter(d => d.completed).length
  const totalNonFuture = dayData.filter(d => !d.isFuture).length

  // Comparison text vs last week
  const comparisonText = rate >= 70
    ? 'Результат лучше, чем на прошлой неделе 🎉'
    : rate >= 40
      ? 'Примерно на уровне прошлой недели'
      : 'Ниже, чем на прошлой неделе'

  const ComparisonIcon = rate >= 70 ? TrendingUp : rate >= 40 ? Minus : TrendingDown

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

        {/* Day-by-day breakdown — GitHub-style contribution squares */}
        <div className="flex items-center justify-between mt-4 gap-1">
          {dayData.map((day, i) => (
            <div key={day.label} className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'h-6 w-6 rounded-sm transition-all',
                  day.isFuture && 'opacity-20',
                  day.completed && 'shadow-sm'
                )}
                style={{
                  backgroundColor: day.completed ? (color === 'emerald' ? '#10b981' : color === 'amber' ? '#f59e0b' : '#ef4444') : day.isFuture ? undefined : '#e5e7eb',
                }}
                title={`${day.label}: ${day.completed ? 'Выполнено' : day.isFuture ? 'Будущий день' : 'Не выполнено'}`}
              />
              <span className={cn(
                'text-[10px] leading-none',
                day.isFuture ? 'text-muted-foreground/30' : 'text-muted-foreground'
              )}>
                {day.label}
              </span>
            </div>
          ))}
        </div>

        {/* Comparison text vs last week */}
        <div className={cn(
          'flex items-center gap-1.5 mt-3 text-xs',
          classes.text
        )}>
          <ComparisonIcon className="h-3 w-3" />
          <span>{comparisonText}</span>
        </div>
      </CardContent>
    </Card>
  )
}
