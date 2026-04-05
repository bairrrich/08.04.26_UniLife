'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Clock, ChevronUp, ChevronDown, Pencil, Weight, Timer, Trophy } from 'lucide-react'
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
  exerciseMaxWeights?: Record<string, number>
}

export function WorkoutCard({ workout, isExpanded, onToggle, onEdit, exerciseMaxWeights }: WorkoutCardProps) {
  const workoutType = detectWorkoutType(workout.name)
  const typeConfig = WORKOUT_TYPE_CONFIG[workoutType] || WORKOUT_TYPE_CONFIG.strength
  const borderColor = getWorkoutBorderColor(workout.name)

  const workoutVolume = workout.exercises.reduce((sum, ex) => {
    const sets = parseSets(ex.sets)
    return sum + calculateVolume(sets)
  }, 0)

  return (
    <Card
      className={`card-hover border-l-2 ${borderColor} hover:shadow-sm transition cursor-pointer`}
      onClick={onToggle}
    >
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${typeConfig.iconBg}`}>
              <span className={typeConfig.iconColor}>{typeConfig.icon}</span>
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
            {workoutVolume > 0 && (
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
            <div className="space-y-2">
              {workout.exercises.map((exercise, exIdx) => {
                const sets = parseSets(exercise.sets)
                const exMaxWeight = sets.length > 0 ? Math.max(...sets.map((s) => s.weight)) : 0
                const isPersonalBest = exerciseMaxWeights && exMaxWeight > 0 && exerciseMaxWeights[exercise.name.toLowerCase()] === exMaxWeight
                const isCardio = sets.length > 0 && sets[0].weight === 0
                const restSeconds = isCardio ? 30 : 90
                return (
                  <div key={exercise.id}>
                    <div className="rounded-lg bg-muted/50 p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium">{exercise.name}</span>
                          {isPersonalBest && (
                            <span className="inline-flex items-center gap-0.5 text-amber-500" title="Личный рекорд">
                              <Trophy className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground tabular-nums">{formatSetSummary(sets)}</span>
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
                              <span className="font-medium tabular-nums">{idx + 1}</span>
                              <Separator orientation="vertical" className="h-3" />
                              <span className="tabular-nums">{set.weight}кг × {set.reps}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {sets.length > 1 && (
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground/70 pt-0.5">
                          <Timer className="h-3 w-3" />
                          <span>Отдых: {restSeconds}с между подходами</span>
                        </div>
                      )}
                    </div>
                    {exIdx < workout.exercises.length - 1 && (
                      <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground/50 py-2">
                        <Timer className="h-2.5 w-2.5" />
                        <span>Отдых: 60с</span>
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
