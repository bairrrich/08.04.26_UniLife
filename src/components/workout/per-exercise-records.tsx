'use client'

import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Trophy, Weight, Flame, Activity } from 'lucide-react'
import { formatVolume, parseSets } from './constants'
import type { Workout } from './types'

interface PerExerciseRecordsProps {
  workouts: Workout[]
}

interface ExerciseRecord {
  name: string
  maxWeight: number
  maxVolume: number
  totalSets: number
  bestWorkout: string
}

export function PerExerciseRecords({ workouts }: PerExerciseRecordsProps) {
  const records = useMemo(() => {
    const map = new Map<string, ExerciseRecord>()

    workouts.forEach((w) => {
      w.exercises.forEach((ex) => {
        const nameKey = ex.name.toLowerCase()
        const sets = parseSets(ex.sets)
        if (sets.length === 0) return

        const maxWeight = Math.max(...sets.map((s) => s.weight))
        const volume = calculateVolume(sets)
        const totalSets = sets.length

        const existing = map.get(nameKey)
        if (!existing) {
          map.set(nameKey, {
            name: ex.name,
            maxWeight,
            maxVolume: volume,
            totalSets,
            bestWorkout: w.date,
          })
        } else {
          if (maxWeight > existing.maxWeight) existing.maxWeight = maxWeight
          if (volume > existing.maxVolume) existing.maxVolume = volume
          existing.totalSets += totalSets
        }
      })
    })

    return Array.from(map.values())
      .sort((a, b) => b.maxWeight - a.maxWeight)
      .slice(0, 6)
  }, [workouts])

  if (records.length === 0) return null

  return (
    <Card className="card-hover overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 shadow-md shadow-orange-500/20">
            <Trophy className="h-4 w-4 text-white" />
          </div>
          <p className="text-sm font-semibold">Рекорды по упражнениям</p>
        </div>
        <div className="space-y-2">
          {records.map((record) => (
            <div
              key={record.name}
              className="flex items-center justify-between gap-3 rounded-lg bg-muted/40 p-2.5"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-rose-100 dark:bg-rose-900/50">
                  <Weight className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{record.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {record.totalSets} подходов всего
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 text-right">
                <div>
                  <p className="text-sm font-bold tabular-nums text-violet-600 dark:text-violet-400">
                    {record.maxWeight > 0 ? `${record.maxWeight} кг` : '—'}
                  </p>
                  <p className="text-[9px] text-muted-foreground">макс. вес</p>
                </div>
                <div>
                  <p className="text-sm font-bold tabular-nums text-blue-600 dark:text-blue-400">
                    {formatVolume(record.maxVolume)}
                  </p>
                  <p className="text-[9px] text-muted-foreground">объём</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function calculateVolume(sets: { weight: number; reps: number; completed: boolean }[]): number {
  if (!sets || sets.length === 0) return 0
  return sets.filter((s) => s.completed).reduce((sum, s) => sum + (s.weight * s.reps), 0)
}
