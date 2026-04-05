'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { safeJson } from '@/lib/safe-fetch'
import { getCurrentMonthStr, getRelativeTime } from '@/lib/format'
import { toast } from 'sonner'

import type { Workout, ExerciseData } from './types'
import {
  detectWorkoutType,
  WORKOUT_PRESETS,
  emptyExercise,
  parseSets,
  calculateVolume,
} from './constants'

// ─── Custom Hook ─────────────────────────────────────────────────────────────

export function useWorkouts() {
  // ── State ──────────────────────────────────────────────────────────────────
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

  // ── Data fetching ──────────────────────────────────────────────────────────
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

  // ── Computed values ────────────────────────────────────────────────────────
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

  // ── Handlers ───────────────────────────────────────────────────────────────
  const resetForm = () => {
    setFormName('')
    setFormDate(new Date().toISOString().split('T')[0])
    setFormDuration('')
    setFormNote('')
    setFormExercises([emptyExercise(0)])
  }

  const handleApplyPreset = (preset: typeof WORKOUT_PRESETS[0]) => {
    setFormName(preset.name)
    setFormDuration(preset.duration.toString())
    setFormExercises(preset.exercises.map((ex, idx) => ({ ...ex, order: idx })))
  }

  const handleSubmit = async () => {
    if (!formName.trim() || !formDate) return
    toast.dismiss()
    const exercises = formExercises.filter((ex) => ex.name.trim()).map((ex, idx) => ({
      name: ex.name.trim(), sets: ex.sets, order: idx,
    }))
    try {
      const res = await fetch('/api/workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName.trim(),
          date: formDate,
          durationMin: formDuration ? parseInt(formDuration) : null,
          note: formNote.trim() || null,
          exercises,
        }),
      })
      const json = await safeJson(res)
      if (json && json.success) {
        toast.success('Тренировка добавлена')
        setDialogOpen(false)
        resetForm()
        fetchWorkouts()
      } else {
        toast.error('Ошибка при добавлении тренировки')
      }
    } catch (err) {
      console.error('Failed to create workout:', err)
      toast.error('Ошибка: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка'))
    }
  }

  const openEditDialog = (workout: Workout) => {
    setEditingWorkout(workout)
    setFormName(workout.name)
    setFormDate(workout.date.split('T')[0])
    setFormDuration(workout.durationMin?.toString() ?? '')
    setFormNote(workout.note ?? '')
    setFormExercises(
      workout.exercises.length > 0
        ? workout.exercises.map((ex, idx) => {
            const sets = parseSets(ex.sets)
            return {
              id: ex.id,
              name: ex.name,
              sets: sets.length > 0 ? sets : [{ weight: 0, reps: 10, completed: false }],
              order: idx,
            }
          })
        : [emptyExercise(0)]
    )
    setEditDialogOpen(true)
  }

  const handleEditSubmit = async () => {
    if (!editingWorkout || !formName.trim() || !formDate) return
    toast.dismiss()
    const exercises = formExercises.filter((ex) => ex.name.trim()).map((ex, idx) => ({
      ...(ex.id ? { id: ex.id } : {}),
      name: ex.name.trim(),
      sets: ex.sets,
      order: idx,
    }))
    try {
      const res = await fetch(`/api/workout/${editingWorkout.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName.trim(),
          date: formDate,
          durationMin: formDuration ? parseInt(formDuration) : null,
          note: formNote.trim() || null,
          exercises,
        }),
      })
      const json = await safeJson(res)
      if (json && json.success) {
        toast.success('Тренировка обновлена')
        setEditDialogOpen(false)
        setEditingWorkout(null)
        resetForm()
        fetchWorkouts()
      } else {
        toast.error('Ошибка при обновлении тренировки')
      }
    } catch (err) {
      console.error('Failed to update workout:', err)
      toast.error('Ошибка: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка'))
    }
  }

  const toggleExpand = (id: string) => setExpandedId(expandedId === id ? null : id)

  const changeMonth = (direction: number) => {
    const [y, m] = month.split('-').map(Number)
    const newDate = new Date(y, m - 1 + direction, 1)
    setMonth(`${newDate.getFullYear()}-${(newDate.getMonth() + 1).toString().padStart(2, '0')}`)
  }

  return {
    // State
    workouts,
    loading,
    month,
    expandedId,
    dialogOpen,
    editDialogOpen,
    editingWorkout,
    formName,
    formDate,
    formDuration,
    formNote,
    formExercises,
    // Setters
    setDialogOpen,
    setEditDialogOpen,
    setFormName,
    setFormDate,
    setFormDuration,
    setFormNote,
    setFormExercises,
    // Computed
    totalWorkouts,
    totalMinutes,
    totalHours,
    avgDuration,
    totalExercises,
    exerciseTypes,
    totalVolume,
    lastWorkoutTime,
    // Handlers
    handleSubmit,
    handleEditSubmit,
    handleApplyPreset,
    openEditDialog,
    toggleExpand,
    changeMonth,
    closeEditDialog: () => { setEditDialogOpen(false); setEditingWorkout(null); resetForm() },
  }
}
