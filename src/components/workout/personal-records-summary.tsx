'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Trophy, Weight, Clock, Dumbbell } from 'lucide-react'

interface PersonalRecordsSummaryProps {
  heaviestWeight: number
  longestDuration: number
  totalWorkouts: number
}

export function PersonalRecordsSummary({
  heaviestWeight,
  longestDuration,
  totalWorkouts,
}: PersonalRecordsSummaryProps) {
  const hasAnyRecord = heaviestWeight > 0 || longestDuration > 0 || totalWorkouts > 0
  if (!hasAnyRecord) return null

  const records = [
    {
      icon: <Weight className="h-5 w-5" />,
      iconBg: 'bg-rose-100 dark:bg-rose-900/50',
      iconColor: 'text-rose-600 dark:text-rose-400',
      label: 'Макс. вес',
      value: `${heaviestWeight} кг`,
    },
    {
      icon: <Clock className="h-5 w-5" />,
      iconBg: 'bg-blue-100 dark:bg-blue-900/50',
      iconColor: 'text-blue-600 dark:text-blue-400',
      label: 'Самая длинная',
      value: `${longestDuration} мин`,
    },
    {
      icon: <Dumbbell className="h-5 w-5" />,
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/50',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      label: 'Всего тренировок',
      value: `${totalWorkouts}`,
    },
  ]

  return (
    <Card className="overflow-hidden card-hover">
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-rose-500/5 pointer-events-none" />
      <CardContent className="relative py-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 shadow-md shadow-orange-500/20">
            <Trophy className="h-4 w-4 text-white" />
          </div>
          <p className="text-sm font-semibold">Личные рекорды</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {records.map((record) => (
            <div key={record.label} className="flex flex-col items-center text-center gap-2 rounded-lg bg-muted/40 p-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${record.iconBg}`}>
                <span className={record.iconColor}>{record.icon}</span>
              </div>
              <p className="text-lg font-bold tabular-nums">{record.value}</p>
              <p className="text-[10px] text-muted-foreground leading-tight">{record.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
