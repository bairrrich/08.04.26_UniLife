'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
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
  const [allWorkouts, setAllWorkouts] = useState<Workout[]>([])
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

  // Ref for stable callback access to form state
  const formRef = useRef({ name: formName, date: formDate, duration: formDuration, note: formNote, exercises: formExercises })
  formRef.current = { name: formName, date: formDate, duration: formDuration, note: formNote, exercises: formExercises }

  // ── Data fetching ──────────────────────────────────────────────────────────
  const fetchWorkouts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/workout?month=${month}`)
      const json = await safeJson<{ success?: boolean; data?: Workout[] }>(res)
      if (json && json.success && json.data) setWorkouts(json.data)
    } catch (err) {
      console.error('Failed to fetch workouts:', err)
    } finally {
      setLoading(false)
    }
  }, [month])

  const fetchAllWorkouts = useCallback(async () => {
    try {
      const res = await fetch('/api/workout')
      const json = await safeJson<{ success?: boolean; data?: Workout[] }>(res)
      if (json && json.success && json.data) setAllWorkouts(json.data)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => { fetchWorkouts() }, [fetchWorkouts])
  useEffect(() => { fetchAllWorkouts() }, [fetchAllWorkouts])

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
      w.exercises.forEach((ex) => { volume += calculateVolume(parseSets(ex.sets)) })
    })
    return volume
  }, [workouts])

  const lastWorkoutTime = useMemo(() => {
    if (workouts.length === 0) return null
    const sorted = [...workouts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    return getRelativeTime(sorted[0].date)
  }, [workouts])

  // ── Personal Records (from all workouts) ──────────────────────────────────

  const personalRecords = useMemo(() => {
    let heaviestWeight = 0
    let longestDuration = 0
    let mostExercises = 0
    let totalVolumeAllTime = 0
    const maxWeightsByName: Record<string, number> = {}

    allWorkouts.forEach((w) => {
      if (w.durationMin && w.durationMin > longestDuration) longestDuration = w.durationMin
      if (w.exercises.length > mostExercises) mostExercises = w.exercises.length
      w.exercises.forEach((ex) => {
        const sets = parseSets(ex.sets)
        sets.forEach((s) => {
          if (s.weight > heaviestWeight) heaviestWeight = s.weight
          if (s.completed) totalVolumeAllTime += s.weight * s.reps
          const nameLower = ex.name.toLowerCase()
          if (s.weight > (maxWeightsByName[nameLower] || 0)) {
            maxWeightsByName[nameLower] = s.weight
          }
        })
      })
    })

    const prCount = Object.keys(maxWeightsByName).length
    return { heaviestWeight, longestDuration, mostExercises, totalVolumeAllTime, maxWeightsByName, prCount }
  }, [allWorkouts])

  // ── Weekly Sparkline Data (last 7 days) ─────────────────────────────────────

  const sparklineData = useMemo(() => {
    const days: { workouts: number; minutes: number; exercises: number; volume: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      const dayWorkouts = allWorkouts.filter((w) => w.date.split('T')[0] === dateStr)
      let dayMinutes = 0
      let dayExercises = 0
      let dayVolume = 0
      dayWorkouts.forEach((w) => {
        dayMinutes += w.durationMin ?? 0
        dayExercises += w.exercises.length
        w.exercises.forEach((ex) => { dayVolume += calculateVolume(parseSets(ex.sets)) })
      })
      days.push({ workouts: dayWorkouts.length, minutes: dayMinutes, exercises: dayExercises, volume: dayVolume })
    }
    return days
  }, [allWorkouts])

  // ── Period Comparison (this week vs last week) ──────────────────────────────

  const periodComparison = useMemo(() => {
    const now = new Date()
    const thisWeekStart = new Date(now)
    thisWeekStart.setDate(now.getDate() - now.getDay() + 1)
    thisWeekStart.setHours(0, 0, 0, 0)
    const lastWeekStart = new Date(thisWeekStart)
    lastWeekStart.setDate(lastWeekStart.getDate() - 7)
    const lastWeekEnd = new Date(thisWeekStart)
    lastWeekEnd.setHours(-1)

    const thisWeekWorkouts = allWorkouts.filter((w) => new Date(w.date) >= thisWeekStart)
    const lastWeekWorkouts = allWorkouts.filter((w) => {
      const d = new Date(w.date)
      return d >= lastWeekStart && d <= lastWeekEnd
    })

    const thisMin = thisWeekWorkouts.reduce((s, w) => s + (w.durationMin ?? 0), 0)
    const lastMin = lastWeekWorkouts.reduce((s, w) => s + (w.durationMin ?? 0), 0)
    const thisEx = thisWeekWorkouts.reduce((s, w) => s + w.exercises.length, 0)
    const lastEx = lastWeekWorkouts.reduce((s, w) => s + w.exercises.length, 0)
    let thisVol = 0; let lastVol = 0
    thisWeekWorkouts.forEach((w) => { w.exercises.forEach((ex) => { thisVol += calculateVolume(parseSets(ex.sets)) }) })
    lastWeekWorkouts.forEach((w) => { w.exercises.forEach((ex) => { lastVol += calculateVolume(parseSets(ex.sets)) }) })

    const pct = (curr: number, prev: number) => prev > 0 ? Math.round(((curr - prev) / prev) * 100) : 0

    return {
      workouts: pct(thisWeekWorkouts.length, lastWeekWorkouts.length),
      minutes: pct(thisMin, lastMin),
      exercises: pct(thisEx, lastEx),
      volume: pct(thisVol, lastVol),
    }
  }, [allWorkouts])

  // ── Weekly Frequency Comparison ─────────────────────────────────────────────

  const weeklyFrequency = useMemo(() => {
    const now = new Date()
    const thisWeekStart = new Date(now)
    thisWeekStart.setDate(now.getDate() - now.getDay() + 1)
    thisWeekStart.setHours(0, 0, 0, 0)
    const lastWeekStart = new Date(thisWeekStart)
    lastWeekStart.setDate(lastWeekStart.getDate() - 7)
    const lastWeekEnd = new Date(thisWeekStart)
    lastWeekEnd.setHours(-1)

    const thisWeekCount = allWorkouts.filter((w) => new Date(w.date) >= thisWeekStart).length
    const lastWeekCount = allWorkouts.filter((w) => {
      const d = new Date(w.date)
      return d >= lastWeekStart && d <= lastWeekEnd
    }).length

    return { thisWeek: thisWeekCount, lastWeek: lastWeekCount, diff: thisWeekCount - lastWeekCount }
  }, [allWorkouts])

  // ── Handlers (stable callbacks) ──────────────────────────────────────────
  const resetForm = useCallback(() => {
    setFormName('')
    setFormDate(new Date().toISOString().split('T')[0])
    setFormDuration('')
    setFormNote('')
    setFormExercises([emptyExercise(0)])
  }, [])

  const handleApplyPreset = useCallback((preset: typeof WORKOUT_PRESETS[0]) => {
    setFormName(preset.name)
    setFormDuration(preset.duration.toString())
    setFormExercises(preset.exercises.map((ex, idx) => ({ ...ex, order: idx })))
  }, [])

  const handleSubmit = useCallback(async () => {
    const f = formRef.current
    if (!f.name.trim() || !f.date) return
    toast.dismiss()
    const exercises = f.exercises.filter((ex) => ex.name.trim()).map((ex, idx) => ({
      name: ex.name.trim(), sets: ex.sets, order: idx,
    }))
    try {
      const res = await fetch('/api/workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: f.name.trim(),
          date: f.date,
          durationMin: f.duration ? parseInt(f.duration) : null,
          note: f.note.trim() || null,
          exercises,
        }),
      })
      const json = await safeJson<{ success?: boolean; data?: unknown }>(res)
      if (json && json.success) {
        toast.success('Тренировка добавлена')
        setDialogOpen(false)
        resetForm()
        fetchWorkouts()
        fetchAllWorkouts()
      } else {
        toast.error('Ошибка при добавлении тренировки')
      }
    } catch (err) {
      console.error('Failed to create workout:', err)
      toast.error('Ошибка: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка'))
    }
  }, [fetchWorkouts, fetchAllWorkouts, resetForm])

  const openEditDialog = useCallback((workout: Workout) => {
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
  }, [])

  const handleEditSubmit = useCallback(async () => {
    const f = formRef.current
    // eslint-disable-next-line react-hooks/exhaustive-deps -- editingWorkout read from state at call time
    if (!editingWorkout || !f.name.trim() || !f.date) return
    toast.dismiss()
    const exercises = f.exercises.filter((ex) => ex.name.trim()).map((ex, idx) => ({
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
          name: f.name.trim(),
          date: f.date,
          durationMin: f.duration ? parseInt(f.duration) : null,
          note: f.note.trim() || null,
          exercises,
        }),
      })
      const json = await safeJson<{ success?: boolean; data?: unknown }>(res)
      if (json && json.success) {
        toast.success('Тренировка обновлена')
        setEditDialogOpen(false)
        setEditingWorkout(null)
        resetForm()
        fetchWorkouts()
        fetchAllWorkouts()
      } else {
        toast.error('Ошибка при обновлении тренировки')
      }
    } catch (err) {
      console.error('Failed to update workout:', err)
      toast.error('Ошибка: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка'))
    }
  }, [fetchWorkouts, fetchAllWorkouts, resetForm])

  const toggleExpand = useCallback((id: string) => setExpandedId(prev => prev === id ? null : id), [])

  const changeMonth = useCallback((direction: number) => {
    setMonth(prev => {
      const [y, m] = prev.split('-').map(Number)
      const newDate = new Date(y, m - 1 + direction, 1)
      return `${newDate.getFullYear()}-${(newDate.getMonth() + 1).toString().padStart(2, '0')}`
    })
  }, [])

  const handleDelete = useCallback(async (workoutId: string) => {
    try {
      const res = await fetch(`/api/workout/${workoutId}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Тренировка удалена')
        fetchWorkouts()
        fetchAllWorkouts()
      } else {
        toast.error('Не удалось удалить тренировку')
      }
    } catch {
      toast.error('Ошибка при удалении')
    }
  }, [fetchWorkouts, fetchAllWorkouts])

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
    personalRecords,
    weeklyFrequency,
    sparklineData,
    periodComparison,
    // Handlers
    handleSubmit,
    handleEditSubmit,
    handleApplyPreset,
    openEditDialog,
    toggleExpand,
    changeMonth,
    handleDelete,
    closeEditDialog: () => { setEditDialogOpen(false); setEditingWorkout(null); resetForm() },
  }
}
