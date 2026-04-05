'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Trophy, Weight, Clock, Target, TrendingUp } from 'lucide-react'
import { formatVolume } from './constants'

interface PersonalRecordsProps {
  heaviestWeight: number
  longestDuration: number
  mostExercises: number
  totalVolumeAllTime: number
}

export function PersonalRecords({
  heaviestWeight,
  longestDuration,
  mostExercises,
  totalVolumeAllTime,
}: PersonalRecordsProps) {
  const hasAnyRecord = heaviestWeight > 0 || longestDuration > 0 || mostExercises > 0 || totalVolumeAllTime > 0

  if (!hasAnyRecord) return null

  const records = [
    {
      icon: <Weight className="h-4 w-4" />,
      iconBg: 'bg-rose-100 dark:bg-rose-900/50',
      iconColor: 'text-rose-600 dark:text-rose-400',
      label: 'Тяжесть',
      value: `${heaviestWeight} кг`,
      description: 'Максимальный вес',
    },
    {
      icon: <Clock className="h-4 w-4" />,
      iconBg: 'bg-blue-100 dark:bg-blue-900/50',
      iconColor: 'text-blue-600 dark:text-blue-400',
      label: 'Длительность',
      value: `${longestDuration} мин`,
      description: 'Самая длинная тренировка',
    },
    {
      icon: <Target className="h-4 w-4" />,
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/50',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      label: 'Упражнения',
      value: `${mostExercises}`,
      description: 'Максимум за тренировку',
    },
    {
      icon: <TrendingUp className="h-4 w-4" />,
      iconBg: 'bg-violet-100 dark:bg-violet-900/50',
      iconColor: 'text-violet-600 dark:text-violet-400',
      label: 'Общий объём',
      value: formatVolume(totalVolumeAllTime),
      description: 'Всего за все время',
    },
  ]

  return (
    <Card className="overflow-hidden card-hover">
      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-transparent to-rose-500/5 pointer-events-none" />
      <CardContent className="relative py-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 shadow-md shadow-orange-500/20">
            <Trophy className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold">Личные рекорды</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {records.map((record) => (
            <div key={record.label} className="flex items-start gap-2.5 rounded-lg bg-muted/40 p-2.5">
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${record.iconBg}`}>
                <span className={record.iconColor}>{record.icon}</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold tabular-nums">{record.value}</p>
                <p className="text-[10px] text-muted-foreground leading-tight">{record.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
