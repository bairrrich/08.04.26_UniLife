'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { safeJson } from '@/lib/safe-fetch'
import { toast } from 'sonner'
import type { HabitData, HabitsResponse } from './types'
import { getLast7Days } from './constants'

// ─── State shape ────────────────────────────────────────────────────────────

interface AddFormState {
  dialogOpen: boolean
  name: string
  emoji: string
  color: string
  frequency: string
  targetCount: string
  category: string
  reminderTime: string
}

interface EditFormState {
  dialogOpen: boolean
  id: string
  name: string
  emoji: string
  color: string
  frequency: string
  targetCount: string
  category: string
  reminderTime: string
}

interface UseHabitsReturn {
  // Data
  habits: HabitData[]
  archivedHabits: HabitData[]
  stats: { totalActive: number; completedToday: number; bestStreak: number }
  loading: boolean
  last7Days: string[]
  weeklyStats: { rate: number; color: 'emerald' | 'amber' | 'red' }
  categoryFilter: string
  setCategoryFilter: (v: string) => void

  // Add form
  addForm: AddFormState
  setAddForm: React.Dispatch<React.SetStateAction<AddFormState>>

  // Edit form
  editForm: EditFormState
  setEditForm: React.Dispatch<React.SetStateAction<EditFormState>>

  // Delete confirmation
  deleteConfirmId: string | null
  handleDeleteClick: (habitId: string) => void

  // Archive
  handleArchive: (habitId: string) => void
  handleUnarchive: (habitId: string) => void

  // Actions
  handleCreate: () => Promise<void>
  handleToggle: (habitId: string) => Promise<void>
  handleEdit: (habit: HabitData) => void
  handleUpdate: () => Promise<void>
  handleDelete: (habitId: string) => Promise<void>
}

const DEFAULT_ADD_FORM: AddFormState = {
  dialogOpen: false,
  name: '',
  emoji: '✅',
  color: '#10b981',
  frequency: 'daily',
  targetCount: '1',
  category: 'health',
  reminderTime: '',
}

const DEFAULT_EDIT_FORM: EditFormState = {
  dialogOpen: false,
  id: '',
  name: '',
  emoji: '✅',
  color: '#10b981',
  frequency: 'daily',
  targetCount: '1',
  category: 'health',
  reminderTime: '',
}

export function useHabits(): UseHabitsReturn {
  // ─── Core state ─────────────────────────────────────────────────────────
  const [habits, setHabits] = useState<HabitData[]>([])
  const [stats, setStats] = useState({ totalActive: 0, completedToday: 0, bestStreak: 0 })
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState('all')

  // ─── Dialog state ───────────────────────────────────────────────────────
  const [addForm, setAddForm] = useState<AddFormState>(DEFAULT_ADD_FORM)
  const [editForm, setEditForm] = useState<EditFormState>(DEFAULT_EDIT_FORM)

  // ─── Delete confirmation state ──────────────────────────────────────────
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const deleteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cleanup delete timer on unmount
  useEffect(() => {
    return () => { if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current) }
  }, [])

  // ─── Data fetching ──────────────────────────────────────────────────────
  const fetchHabits = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/habits')
      const json: HabitsResponse | null = await safeJson<HabitsResponse>(res)
      if (json && json.success) { setHabits(json.data); setStats(json.stats) }
    } catch (err) {
      console.error('Failed to fetch habits:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchHabits() }, [fetchHabits])

  // ─── Derived data ───────────────────────────────────────────────────────
  const last7Days = useMemo(() => getLast7Days(), [])

  const archivedHabits = useMemo(() => habits.filter(h => h.archived), [habits])

  const weeklyStats = useMemo(() => {
    const activeHabits = habits.filter(h => !h.archived)
    if (activeHabits.length === 0) return { rate: 0, color: 'emerald' as const }
    let totalCompleted = 0
    const totalPossible = activeHabits.length * 7
    for (const habit of activeHabits) {
      for (const day of last7Days) {
        if (habit.last7Days[day]) totalCompleted++
      }
    }
    const rate = Math.round((totalCompleted / totalPossible) * 100)
    const color = rate >= 70 ? ('emerald' as const) : rate >= 40 ? ('amber' as const) : ('red' as const)
    return { rate, color }
  }, [habits, last7Days])

  // ─── Helpers ────────────────────────────────────────────────────────────
  const resetAddForm = useCallback(() => {
    setAddForm(DEFAULT_ADD_FORM)
  }, [])

  const handleCreate = useCallback(async () => {
    if (!addForm.name.trim()) return
    toast.dismiss()
    try {
      const res = await fetch('/api/habits', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: addForm.name.trim(), emoji: addForm.emoji, color: addForm.color,
          frequency: addForm.frequency, targetCount: parseInt(addForm.targetCount) || 1,
          category: addForm.category,
        }),
      })
      const json = await safeJson<{ success: boolean }>(res)
      if (json && json.success) {
        toast.success('Привычка создана'); resetAddForm(); fetchHabits()
      } else {
        toast.error('Ошибка при создании привычки')
      }
    } catch (err) {
      console.error('Failed to create habit:', err)
      toast.error('Ошибка: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка'))
    }
  }, [addForm, resetAddForm, fetchHabits])

  const handleToggle = useCallback(async (habitId: string) => {
    toast.dismiss()
    try {
      const res = await fetch(`/api/habits/${habitId}`, { method: 'PUT' })
      const json = await safeJson<{ success: boolean }>(res)
      if (json && json.success) fetchHabits()
    } catch (err) {
      console.error('Failed to toggle habit:', err)
      toast.error('Ошибка')
    }
  }, [fetchHabits])

  const handleEdit = useCallback((habit: HabitData) => {
    setEditForm({
      dialogOpen: true,
      id: habit.id,
      name: habit.name,
      emoji: habit.emoji,
      color: habit.color,
      frequency: habit.frequency,
      targetCount: String(habit.targetCount),
      category: habit.category || 'other',
      reminderTime: '',
    })
  }, [])

  const handleUpdate = useCallback(async () => {
    if (!editForm.name.trim()) return
    toast.dismiss()
    try {
      const res = await fetch(`/api/habits/${editForm.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name.trim(), emoji: editForm.emoji, color: editForm.color,
          frequency: editForm.frequency, targetCount: parseInt(editForm.targetCount) || 1,
          category: editForm.category,
        }),
      })
      const json = await safeJson<{ success: boolean }>(res)
      if (json && json.success) {
        toast.success('Привычка обновлена'); setEditForm(f => ({ ...f, dialogOpen: false })); fetchHabits()
      } else {
        toast.error('Ошибка при обновлении привычки')
      }
    } catch (err) {
      console.error('Failed to update habit:', err)
      toast.error('Ошибка: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка'))
    }
  }, [editForm, fetchHabits])

  const handleDelete = useCallback(async (habitId: string) => {
    toast.dismiss()
    try {
      const res = await fetch(`/api/habits/${habitId}`, { method: 'DELETE' })
      const json = await safeJson<{ success: boolean }>(res)
      if (json && json.success) {
        toast.success('Привычка удалена'); fetchHabits()
      } else {
        toast.error('Ошибка при удалении привычки')
      }
    } catch (err) {
      console.error('Failed to delete habit:', err)
      toast.error('Ошибка: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка'))
    }
  }, [fetchHabits])

  const handleArchive = useCallback(async (habitId: string) => {
    toast.dismiss()
    try {
      const res = await fetch(`/api/habits/${habitId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived: true }),
      })
      const json = await safeJson<{ success: boolean }>(res)
      if (json && json.success) {
        toast.success('Привычка архивирована'); fetchHabits()
      } else {
        toast.error('Ошибка')
      }
    } catch {
      toast.error('Ошибка архивации')
    }
  }, [fetchHabits])

  const handleUnarchive = useCallback(async (habitId: string) => {
    toast.dismiss()
    try {
      const res = await fetch(`/api/habits/${habitId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived: false }),
      })
      const json = await safeJson<{ success: boolean }>(res)
      if (json && json.success) {
        toast.success('Привычка восстановлена'); fetchHabits()
      } else {
        toast.error('Ошибка')
      }
    } catch {
      toast.error('Ошибка восстановления')
    }
  }, [fetchHabits])

  const handleDeleteClick = useCallback((habitId: string) => {
    if (deleteConfirmId === habitId) {
      if (deleteTimerRef.current) { clearTimeout(deleteTimerRef.current); deleteTimerRef.current = null }
      setDeleteConfirmId(null); handleDelete(habitId)
    } else {
      if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current)
      setDeleteConfirmId(habitId)
      deleteTimerRef.current = setTimeout(() => { setDeleteConfirmId(null); deleteTimerRef.current = null }, 3000)
    }
  }, [deleteConfirmId, handleDelete])

  return {
    habits, archivedHabits, stats, loading, last7Days, weeklyStats,
    categoryFilter, setCategoryFilter,
    addForm, setAddForm,
    editForm, setEditForm,
    deleteConfirmId, handleDeleteClick,
    handleCreate, handleToggle, handleEdit, handleUpdate, handleDelete,
    handleArchive, handleUnarchive,
  }
}
