'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { safeJson } from '@/lib/safe-fetch'
import { toast } from 'sonner'
import type { GoalData, GoalsResponse, FilterTab } from './types'

export function useGoals() {
  const [goals, setGoals] = useState<GoalData[]>([])
  const [stats, setStats] = useState({ totalGoals: 0, completedGoals: 0, avgProgress: 0 })
  const [loading, setLoading] = useState(true)
  const [filterTab, setFilterTab] = useState<FilterTab>('all')

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<GoalData | null>(null)
  const [formTitle, setFormTitle] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formCategory, setFormCategory] = useState('personal')
  const [formTargetValue, setFormTargetValue] = useState('')
  const [formCurrentValue, setFormCurrentValue] = useState('0')
  const [formUnit, setFormUnit] = useState('')
  const [formDeadline, setFormDeadline] = useState('')
  const [formStatus, setFormStatus] = useState('active')
  const [formProgress, setFormProgress] = useState('0')
  const [submitting, setSubmitting] = useState(false)

  const fetchGoals = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/goals')
      const json: GoalsResponse | null = await safeJson<GoalsResponse>(res)
      if (json && json.success) { setGoals(json.data); setStats(json.stats) }
    } catch (err) {
      console.error('Failed to fetch goals:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchGoals() }, [fetchGoals])

  const filteredGoals = useMemo(() => goals.filter((g) => {
    if (filterTab === 'active') return g.status === 'active'
    if (filterTab === 'completed') return g.status === 'completed'
    return true
  }), [goals, filterTab])

  // ─── Dialog Handlers ──────────────────────────────────────────────────────

  const resetForm = () => {
    setFormTitle(''); setFormDescription(''); setFormCategory('personal')
    setFormTargetValue(''); setFormCurrentValue('0'); setFormUnit('')
    setFormDeadline(''); setFormStatus('active'); setFormProgress('0')
    setEditingGoal(null)
  }

  const openAddDialog = () => { resetForm(); setDialogOpen(true) }

  const openEditDialog = (goal: GoalData) => {
    setEditingGoal(goal); setFormTitle(goal.title)
    setFormDescription(goal.description || ''); setFormCategory(goal.category)
    setFormTargetValue(goal.targetValue != null ? String(goal.targetValue) : '')
    setFormCurrentValue(String(goal.currentValue)); setFormUnit(goal.unit || '')
    setFormDeadline(goal.deadline ? goal.deadline.split('T')[0] : '')
    setFormStatus(goal.status); setFormProgress(String(goal.progress))
    setDialogOpen(true)
  }

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) resetForm()
  }

  const handleSubmit = async () => {
    if (!formTitle.trim()) return
    toast.dismiss(); setSubmitting(true)
    try {
      const body = {
        title: formTitle.trim(), description: formDescription.trim() || null,
        category: formCategory, targetValue: formTargetValue ? Number(formTargetValue) : null,
        currentValue: Number(formCurrentValue) || 0, unit: formUnit.trim() || null,
        deadline: formDeadline ? new Date(formDeadline).toISOString() : null,
        status: formStatus, progress: Math.min(100, Math.max(0, Number(formProgress) || 0)),
      }
      if (editingGoal) {
        const res = await fetch(`/api/goals/${editingGoal.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await safeJson(res)
        if (!json || !json.success) { toast.error('Ошибка при обновлении цели'); return }
        toast.success('Цель обновлена')
      } else {
        const res = await fetch('/api/goals', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        })
        const json = await safeJson(res)
        if (!json || !json.success) { toast.error('Ошибка при создании цели'); return }
        toast.success('Цель создана')
      }
      setDialogOpen(false); fetchGoals()
    } catch (err) {
      console.error('Failed to save goal:', err)
      toast.error('Ошибка: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка'))
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Quick Actions ────────────────────────────────────────────────────────

  const handleUpdateProgress = async (goal: GoalData) => {
    toast.dismiss()
    try {
      const newProgress = Math.min(100, goal.progress + 5)
      const res = await fetch(`/api/goals/${goal.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress: newProgress }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await safeJson(res)
      if (!json || !json.success) { toast.error('Ошибка обновления прогресса'); return }
      toast.success(`Прогресс: ${newProgress}%`); fetchGoals()
    } catch (err) {
      toast.error('Ошибка обновления прогресса')
    }
  }

  const handleComplete = async (goal: GoalData) => {
    toast.dismiss()
    try {
      const res = await fetch(`/api/goals/${goal.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed', progress: 100 }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await safeJson(res)
      if (!json || !json.success) { toast.error('Ошибка завершения цели'); return }
      toast.success('Цель завершена! 🎉'); fetchGoals()
    } catch (err) {
      toast.error('Ошибка завершения цели')
    }
  }

  const handleDelete = async (goalId: string) => {
    toast.dismiss()
    try {
      const res = await fetch(`/api/goals/${goalId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await safeJson(res)
      if (!json || !json.success) { toast.error('Ошибка при удалении цели'); return }
      toast.success('Цель удалена'); fetchGoals()
    } catch (err) {
      console.error('Failed to delete goal:', err)
      toast.error('Ошибка: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка'))
    }
  }

  return {
    // state
    goals, stats, loading, filterTab, setFilterTab,
    dialogOpen, handleDialogChange, editingGoal, submitting,
    // form
    formTitle, setFormTitle,
    formDescription, setFormDescription,
    formCategory, setFormCategory,
    formTargetValue, setFormTargetValue,
    formCurrentValue, setFormCurrentValue,
    formUnit, setFormUnit,
    formDeadline, setFormDeadline,
    formStatus, setFormStatus,
    formProgress, setFormProgress,
    // handlers
    openAddDialog, openEditDialog, handleSubmit,
    handleUpdateProgress, handleComplete, handleDelete,
    // computed
    filteredGoals,
  }
}
