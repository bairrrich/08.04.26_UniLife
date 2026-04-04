'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Dumbbell, Plus, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { safeJson } from '@/lib/safe-fetch'
import { getCurrentMonthStr, getRelativeTime } from '@/lib/format'
import { toast } from 'sonner'

import type { Workout, ExerciseData } from './types'
import {
  detectWorkoutType,
  WORKOUT_TYPE_CONFIG,
  WORKOUT_PRESETS,
  emptyExercise,
  parseSets,
  calculateVolume,
  formatVolume,
} from './constants'
import { StatCards } from './stat-cards'
import { WorkoutCard } from './workout-card'
import { WorkoutDialog } from './workout-dialog'
import { MonthNav } from './month-nav'

// ─── Component ─────────────────────────────────────────────────────────────

export function WorkoutPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(getCurrentMonthStr())
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null)

  // Form state
  const [formName, setFormName] = useState('')
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0])
  const [formDuration, setFormDuration] = useState('')
  const [formNote, setFormNote] = useState('')
  const [formExercises, setFormExercises] = useState<ExerciseData[]>([emptyExercise(0)])

  const fetchWorkouts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/workout?month=${month}`)
      const json = await safeJson(res)
      if (json && json.success) setWorkouts(json.data)
    } catch (err) {
      console.error('Failed to fetch workouts:', err)
    } finally {
      setLoading(false)
    }
  }, [month])

  useEffect(() => { fetchWorkouts() }, [fetchWorkouts])

  // Summary calculations
  const totalWorkouts = workouts.length
  const totalMinutes = workouts.reduce((sum, w) => sum + (w.durationMin ?? 0), 0)
  const totalHours = (totalMinutes / 60).toFixed(1)
  const avgDuration = totalWorkouts > 0 ? Math.round(totalMinutes / totalWorkouts) : 0
  const totalExercises = workouts.reduce((sum, w) => sum + w.exercises.length, 0)

  const exerciseTypes = useMemo(() => {
    const types = new Set<string>()
    workouts.forEach((w) => types.add(detectWorkoutType(w.name)))
    return Array.from(types)
  }, [workouts])

  const totalVolume = useMemo(() => {
    let volume = 0
    workouts.forEach((w) => {
      if (detectWorkoutType(w.name) === 'strength') {
        w.exercises.forEach((ex) => { volume += calculateVolume(parseSets(ex.sets)) })
      }
    })
    return volume
  }, [workouts])

  const lastWorkoutTime = useMemo(() => {
    if (workouts.length === 0) return null
    const sorted = [...workouts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    return getRelativeTime(sorted[0].date)
  }, [workouts])

  // Form handlers
  const resetForm = () => {
    setFormName(''); setFormDate(new Date().toISOString().split('T')[0])
    setFormDuration(''); setFormNote(''); setFormExercises([emptyExercise(0)])
  }

  const handleApplyPreset = (preset: typeof WORKOUT_PRESETS[0]) => {
    setFormName(preset.name)
    setFormDuration(preset.duration.toString())
    setFormExercises(preset.exercises.map((ex, idx) => ({ ...ex, order: idx })))
  }

  const handleSubmit = async () => {
    if (!formName.trim() || !formDate) return
    toast.dismiss()
    const exercises = formExercises.filter((ex) => ex.name.trim()).map((ex, idx) => ({ name: ex.name.trim(), sets: ex.sets, order: idx }))
    try {
      const res = await fetch('/api/workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formName.trim(), date: formDate, durationMin: formDuration ? parseInt(formDuration) : null, note: formNote.trim() || null, exercises }),
      })
      const json = await safeJson(res)
      if (json && json.success) { toast.success('Тренировка добавлена'); setDialogOpen(false); resetForm(); fetchWorkouts() }
      else { toast.error('Ошибка при добавлении тренировки') }
    } catch (err) { console.error('Failed to create workout:', err); toast.error('Ошибка: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка')) }
  }

  const openEditDialog = (workout: Workout) => {
    setEditingWorkout(workout); setFormName(workout.name)
    setFormDate(workout.date.split('T')[0]); setFormDuration(workout.durationMin?.toString() ?? '')
    setFormNote(workout.note ?? '')
    setFormExercises(
      workout.exercises.length > 0
        ? workout.exercises.map((ex, idx) => {
            const sets = parseSets(ex.sets)
            return { id: ex.id, name: ex.name, sets: sets.length > 0 ? sets : [{ weight: 0, reps: 10, completed: false }], order: idx }
          })
        : [emptyExercise(0)]
    )
    setEditDialogOpen(true)
  }

  const handleEditSubmit = async () => {
    if (!editingWorkout || !formName.trim() || !formDate) return
    toast.dismiss()
    const exercises = formExercises.filter((ex) => ex.name.trim()).map((ex, idx) => ({
      ...(ex.id ? { id: ex.id } : {}), name: ex.name.trim(), sets: ex.sets, order: idx,
    }))
    try {
      const res = await fetch(`/api/workout/${editingWorkout.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formName.trim(), date: formDate, durationMin: formDuration ? parseInt(formDuration) : null, note: formNote.trim() || null, exercises }),
      })
      const json = await safeJson(res)
      if (json && json.success) { toast.success('Тренировка обновлена'); setEditDialogOpen(false); setEditingWorkout(null); resetForm(); fetchWorkouts() }
      else { toast.error('Ошибка при обновлении тренировки') }
    } catch (err) { console.error('Failed to update workout:', err); toast.error('Ошибка: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка')) }
  }

  const toggleExpand = (id: string) => setExpandedId(expandedId === id ? null : id)
  const changeMonth = (direction: number) => {
    const [y, m] = month.split('-').map(Number)
    const newDate = new Date(y, m - 1 + direction, 1)
    setMonth(`${newDate.getFullYear()}-${(newDate.getMonth() + 1).toString().padStart(2, '0')}`)
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Dumbbell className="h-6 w-6" />
            Тренировки
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Журнал упражнений и тренировок
            {lastWorkoutTime && (
              <span className="ml-2 inline-flex items-center gap-1 text-xs">
                · Последняя: <span className="font-medium text-foreground">{lastWorkoutTime}</span>
              </span>
            )}
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить
        </Button>
      </div>

      <StatCards
        totalWorkouts={totalWorkouts}
        totalMinutes={totalMinutes}
        avgDuration={avgDuration}
        totalExercises={totalExercises}
        totalVolume={totalVolume}
      />

      {/* Exercise Type Badges + Duration Row */}
      {!loading && workouts.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {exerciseTypes.map((type) => {
            const config = WORKOUT_TYPE_CONFIG[type as keyof typeof WORKOUT_TYPE_CONFIG]
            return (
              <Badge key={type} variant="secondary" className="gap-1.5 px-2.5 py-1 text-xs font-medium">
                {config?.icon}{config?.label || type}
              </Badge>
            )
          })}
          <Separator orientation="vertical" className="h-4 mx-1" />
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span className="font-semibold tabular-nums">{totalHours}ч</span> за месяц
          </span>
        </div>
      )}

      <MonthNav month={month} onChange={changeMonth} />

      {/* Workout List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer h-[100px] rounded-xl" />
          ))}
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton-shimmer h-24 rounded-xl" />
            ))}
          </div>
        </div>
      ) : workouts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Dumbbell className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-muted-foreground font-medium">Нет тренировок</p>
            <p className="text-muted-foreground text-sm mt-1">Добавьте первую тренировку за этот месяц</p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="max-h-[600px]">
          <div className="space-y-3">
            {workouts.map((workout) => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                isExpanded={expandedId === workout.id}
                onToggle={() => toggleExpand(workout.id)}
                onEdit={openEditDialog}
              />
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Dialogs */}
      <WorkoutDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        formName={formName}
        formDate={formDate}
        formDuration={formDuration}
        formNote={formNote}
        formExercises={formExercises}
        onNameChange={setFormName}
        onDateChange={setFormDate}
        onDurationChange={setFormDuration}
        onNoteChange={setFormNote}
        onExercisesChange={setFormExercises}
        onSubmit={handleSubmit}
        onApplyPreset={handleApplyPreset}
        title="Новая тренировка"
        submitLabel="Сохранить тренировку"
        showPresets
      />
      <WorkoutDialog
        open={editDialogOpen}
        onOpenChange={(open) => { setEditDialogOpen(open); if (!open) { setEditingWorkout(null); resetForm() } }}
        formName={formName}
        formDate={formDate}
        formDuration={formDuration}
        formNote={formNote}
        formExercises={formExercises}
        onNameChange={setFormName}
        onDateChange={setFormDate}
        onDurationChange={setFormDuration}
        onNoteChange={setFormNote}
        onExercisesChange={setFormExercises}
        onSubmit={handleEditSubmit}
        onApplyPreset={handleApplyPreset}
        title="Редактирование тренировки"
        submitLabel="Сохранить изменения"
      />
    </div>
  )
}

export default WorkoutPage
