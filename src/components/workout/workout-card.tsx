'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Clock, ChevronUp, ChevronDown, Pencil, Weight } from 'lucide-react'
import {
  detectWorkoutType,
  WORKOUT_TYPE_CONFIG,
  parseSets,
  formatSetSummary,
  calculateVolume,
  formatDate,
  getWorkoutBorderColor,
} from './constants'
import type { Workout } from './types'

interface WorkoutCardProps {
  workout: Workout
  isExpanded: boolean
  onToggle: () => void
  onEdit: (workout: Workout) => void
}

export function WorkoutCard({ workout, isExpanded, onToggle, onEdit }: WorkoutCardProps) {
  const workoutType = detectWorkoutType(workout.name)
  const typeConfig = WORKOUT_TYPE_CONFIG[workoutType]
  const borderColor = getWorkoutBorderColor(workout.name)

  const workoutVolume = workout.exercises.reduce((sum, ex) => {
    if (workoutType === 'strength') {
      const sets = parseSets(ex.sets)
      return sum + calculateVolume(sets)
    }
    return sum
  }, 0)

  return (
    <Card
      className={`card-hover border-l-4 ${borderColor} ${typeConfig.topBorderColor} hover:shadow-sm transition cursor-pointer`}
      onClick={onToggle}
    >
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
              workoutType === 'strength' ? 'bg-rose-100 text-rose-600' :
              workoutType === 'cardio' ? 'bg-purple-100 text-purple-600' :
              workoutType === 'hiit' ? 'bg-orange-100 text-orange-600' :
              'bg-emerald-100 text-emerald-600'
            }`}>
              {typeConfig.icon}
            </div>
            <CardTitle className="text-base">{workout.name}</CardTitle>
            <Badge variant="secondary" className="text-xs">{workout.exercises.length} упр.</Badge>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {workout.durationMin && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {workout.durationMin} мин
              </span>
            )}
            {workoutType === 'strength' && workoutVolume > 0 && (
              <span className="flex items-center gap-1 text-xs font-medium text-violet-600">
                <Weight className="h-3 w-3" />
                {workoutVolume >= 1000 ? `${(workoutVolume / 1000).toFixed(1)}т` : `${workoutVolume}кг`}
              </span>
            )}
            <span>{formatDate(workout.date)}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
              onClick={(e) => { e.stopPropagation(); onEdit(workout) }}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="pt-2 space-y-4">
          {workout.note && (
            <p className="text-sm text-muted-foreground italic">{workout.note}</p>
          )}
          {workout.exercises.length > 0 ? (
            <div className="space-y-3">
              {workout.exercises.map((exercise) => {
                const sets = parseSets(exercise.sets)
                return (
                  <div key={exercise.id} className="rounded-lg bg-muted/50 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{exercise.name}</span>
                      <span className="text-xs text-muted-foreground">{formatSetSummary(sets)}</span>
                    </div>
                    {sets.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {sets.map((set, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs ${
                              set.completed ? 'bg-emerald-100 text-emerald-700' : 'bg-background text-muted-foreground'
                            }`}
                          >
                            <span className="font-medium">{idx + 1}</span>
                            <Separator orientation="vertical" className="h-3" />
                            <span>{set.weight}кг × {set.reps}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Нет упражнений</p>
          )}
        </CardContent>
      )}
    </Card>
  )
}
