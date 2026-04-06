'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Clock, ChevronUp, ChevronDown, Pencil, Trash2, Weight, Timer, Trophy, Dumbbell, Heart, Wind, Zap, Activity } from 'lucide-react'
import {
  detectWorkoutType,
  WORKOUT_TYPE_CONFIG,
  parseSets,
  formatSetSummary,
  calculateVolume,
  formatVolume,
  formatDate,
  getWorkoutBorderColor,
} from './constants'
import type { Workout } from './types'

interface WorkoutCardProps {
  workout: Workout
  isExpanded: boolean
  onToggle: () => void
  onEdit: (workout: Workout) => void
  onDelete?: (workoutId: string) => void
  exerciseMaxWeights?: Record<string, number>
}

// Map exercise names to icons based on keywords
function getExerciseIcon(name: string) {
  const lower = name.toLowerCase()
  if (lower.includes('жим') || lower.includes('bench') || lower.includes('press') || lower.includes('штанг') || lower.includes('гантел') || lower.includes('подтягив') || lower.includes('присед') || lower.includes('тяга') || lower.includes('рычаг') || lower.includes('отжиман') || lower.includes('выпады') || lower.includes('бёрпи') || lower.includes('планка')) {
    return <Dumbbell className="size-3.5 text-rose-500" />
  }
  if (lower.includes('бег') || lower.includes('кардио') || lower.includes('пробеж') || lower.includes('ходьба') || lower.includes('вел') || lower.includes('скакал') || lower.includes('эллипс') || lower.includes('гребн')) {
    return <Heart className="size-3.5 text-purple-500" />
  }
  if (lower.includes('растяж') || lower.includes('йога') || lower.includes('stretch') || lower.includes('размин') || lower.includes('наклон') || lower.includes('поза') || lower.includes('скрут')) {
    return <Wind className="size-3.5 text-emerald-500" />
  }
  return <Zap className="size-3.5 text-amber-500" />
}

export function WorkoutCard({ workout, isExpanded, onToggle, onEdit, onDelete, exerciseMaxWeights }: WorkoutCardProps) {
  const workoutType = detectWorkoutType(workout.name)
  const typeConfig = WORKOUT_TYPE_CONFIG[workoutType] || WORKOUT_TYPE_CONFIG.strength
  const borderColor = getWorkoutBorderColor(workout.name)

  // Difficulty calculation
  const difficulty = useMemo(() => {
    const duration = workout.durationMin ?? 0
    const exerciseCount = workout.exercises.length
    let score = 0
    // Duration scoring
    if (duration >= 60) score += 2
    else if (duration >= 40) score += 1
    // Exercise count scoring
    if (exerciseCount >= 6) score += 2
    else if (exerciseCount >= 4) score += 1
    // Total sets
    const totalSets = workout.exercises.reduce((s, ex) => s + parseSets(ex.sets).length, 0)
    if (totalSets >= 15) score += 1
    if (score <= 1) return { label: 'Лёгкая', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/40', dots: 1 }
    if (score <= 2) return { label: 'Средняя', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/40', dots: 2 }
    return { label: 'Сложная', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-100 dark:bg-rose-900/40', dots: 3 }
  }, [workout.durationMin, workout.exercises])

  const workoutVolume = workout.exercises.reduce((sum, ex) => {
    const sets = parseSets(ex.sets)
    return sum + calculateVolume(sets)
  }, 0)

  // Check if any exercise in this workout has a new PR
  const hasNewPR = exerciseMaxWeights && workout.exercises.some((ex) => {
    const sets = parseSets(ex.sets)
    const exMaxWeight = sets.length > 0 ? Math.max(...sets.map((s) => s.weight)) : 0
    return exMaxWeight > 0 && exerciseMaxWeights[ex.name.toLowerCase()] === exMaxWeight
  })

  const exerciseCountText = `${workout.exercises.length} ${workout.exercises.length === 1 ? 'упражнение' : workout.exercises.length < 5 ? 'упражнения' : 'упражнений'}`

  return (
    <Card
      className={`card-hover border-l-2 ${borderColor} hover:shadow-sm transition cursor-pointer`}
      onClick={onToggle}
    >
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${typeConfig.iconBg}`}>
              <span className={typeConfig.iconColor}>{typeConfig.icon}</span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm sm:text-base truncate">{workout.name}</CardTitle>
                {hasNewPR && (
                  <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 border-0 text-[10px] px-1.5 py-0 font-semibold shrink-0">
                    🏆 Новый рекорд!
                  </Badge>
                )}
              </div>
              <span className="text-[11px] text-muted-foreground">
                {exerciseCountText}
              </span>
              <Badge variant="secondary" className={`text-[9px] px-1.5 py-0 h-4 border-0 ${difficulty.bg} ${difficulty.color}`}>
                {'●'.repeat(difficulty.dots)}{'○'.repeat(3 - difficulty.dots)} {difficulty.label}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 text-sm text-muted-foreground shrink-0">
            {workout.durationMin && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {workout.durationMin} мин
              </span>
            )}
            {workoutVolume > 0 && (
              <span className="flex items-center gap-1 text-xs font-medium text-violet-600 dark:text-violet-400">
                <Weight className="h-3 w-3" />
                {formatVolume(workoutVolume)}
              </span>
            )}
            <span className="hidden sm:inline">{formatDate(workout.date)}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
              onClick={(e) => { e.stopPropagation(); onEdit(workout) }}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={(e) => { e.stopPropagation(); onDelete(workout.id) }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
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
                const exerciseVolume = sets.filter((s) => s.completed).reduce((sum, s) => sum + (s.weight * s.reps), 0)
                return (
                  <div key={exercise.id}>
                    <div className="rounded-lg bg-muted/50 p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {getExerciseIcon(exercise.name)}
                          <span className="text-sm font-medium">{exercise.name}</span>
                          {isPersonalBest && (
                            <span className="inline-flex items-center gap-0.5 text-amber-500" title="Личный рекорд">
                              <Trophy className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {exerciseVolume > 0 && (
                            <span className="text-[10px] text-violet-600 dark:text-violet-400 tabular-nums">
                              {formatVolume(exerciseVolume)}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground tabular-nums">{formatSetSummary(sets)}</span>
                        </div>
                      </div>
                      {sets.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {sets.map((set, idx) => (
                            <div
                              key={idx}
                              className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs ${
                                set.completed ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-background text-muted-foreground'
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
