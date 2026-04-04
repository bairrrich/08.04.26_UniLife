'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Dumbbell, Clock, Flame, Trophy, Weight } from 'lucide-react'
import { formatVolume } from './constants'

interface StatCardsProps {
  totalWorkouts: number
  totalMinutes: number
  avgDuration: number
  totalExercises: number
  totalVolume: number
}

export function StatCards({
  totalWorkouts,
  totalMinutes,
  avgDuration,
  totalExercises,
  totalVolume,
}: StatCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 stagger-children">
      <Card className="card-hover py-4">
        <CardContent className="flex items-center gap-3 px-4 py-0">
          <div className="h-10 w-10 rounded-lg bg-rose-100 flex items-center justify-center">
            <Dumbbell className="h-5 w-5 text-rose-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{totalWorkouts}</p>
            <p className="text-xs text-muted-foreground">Тренировок</p>
          </div>
        </CardContent>
      </Card>
      <Card className="card-hover py-4">
        <CardContent className="flex items-center gap-3 px-4 py-0">
          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <Clock className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{totalMinutes}</p>
            <p className="text-xs text-muted-foreground">Минут всего</p>
          </div>
        </CardContent>
      </Card>
      <Card className="card-hover py-4">
        <CardContent className="flex items-center gap-3 px-4 py-0">
          <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
            <Flame className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{avgDuration}</p>
            <p className="text-xs text-muted-foreground">Среднее (мин)</p>
          </div>
        </CardContent>
      </Card>
      <Card className="card-hover py-4">
        <CardContent className="flex items-center gap-3 px-4 py-0">
          <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
            <Trophy className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{totalExercises}</p>
            <p className="text-xs text-muted-foreground">Упражнений</p>
          </div>
        </CardContent>
      </Card>
      <Card className="card-hover py-4 border-t-4 border-t-violet-500">
        <CardContent className="flex items-center gap-3 px-4 py-0">
          <div className="h-10 w-10 rounded-lg bg-violet-100 flex items-center justify-center">
            <Weight className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <p className="text-2xl font-bold tabular-nums">{formatVolume(totalVolume)}</p>
            <p className="text-xs text-muted-foreground">Объём (сила)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
