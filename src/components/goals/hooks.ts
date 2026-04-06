'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { safeJson } from '@/lib/safe-fetch'
import { toast } from 'sonner'
import type { GoalData, GoalsResponse, FilterTab, CategoryFilter } from './types'

export function useGoals() {
  const [goals, setGoals] = useState<GoalData[]>([])
  const [stats, setStats] = useState({ totalGoals: 0, completedGoals: 0, avgProgress: 0 })
  const [loading, setLoading] = useState(true)
  const [filterTab, setFilterTab] = useState<FilterTab>('all')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')

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
  const [formStartDate, setFormStartDate] = useState('')
  const [formPriority, setFormPriority] = useState('medium')
  const [formStatus, setFormStatus] = useState('active')
  const [formProgress, setFormProgress] = useState('0')
  const [formMilestones, setFormMilestones] = useState<string>('[]')
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
    if (filterTab === 'paused') return g.status === 'paused'
    return true
  }).filter((g) => {
    if (categoryFilter === 'all') return true
    if (categoryFilter === 'learning') return g.category === 'learning' || g.category === 'education'
    return g.category === categoryFilter
  }), [goals, filterTab, categoryFilter])

  // ─── Dialog Handlers ──────────────────────────────────────────────────────

  const resetForm = () => {
    setFormTitle(''); setFormDescription(''); setFormCategory('personal')
    setFormTargetValue(''); setFormCurrentValue('0'); setFormUnit('')
    setFormDeadline(''); setFormStartDate(''); setFormPriority('medium')
    setFormStatus('active'); setFormProgress('0'); setFormMilestones('[]')
    setEditingGoal(null)
  }

  const openAddDialog = () => { resetForm(); setDialogOpen(true) }

  const openEditDialog = (goal: GoalData) => {
    setEditingGoal(goal); setFormTitle(goal.title)
    setFormDescription(goal.description || ''); setFormCategory(goal.category)
    setFormTargetValue(goal.targetValue != null ? String(goal.targetValue) : '')
    setFormCurrentValue(String(goal.currentValue)); setFormUnit(goal.unit || '')
    setFormDeadline(goal.deadline ? goal.deadline.split('T')[0] : '')
    setFormStartDate(goal.startDate ? goal.startDate.split('T')[0] : '')
    setFormPriority(goal.priority || 'medium')
    setFormStatus(goal.status); setFormProgress(String(goal.progress))
    setFormMilestones(goal.milestones || '[]')
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
        startDate: formStartDate ? new Date(formStartDate).toISOString() : null,
        priority: formPriority,
        status: formStatus, progress: Math.min(100, Math.max(0, Number(formProgress) || 0)),
        milestones: formMilestones,
      }
      if (editingGoal) {
        const res = await fetch(`/api/goals/${editingGoal.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await safeJson<{ success?: boolean; data?: unknown }>(res)
        if (!json || !json.success) { toast.error('Ошибка при обновлении цели'); return }
        toast.success('Цель обновлена')
      } else {
        const res = await fetch('/api/goals', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        })
        const json = await safeJson<{ success?: boolean; data?: unknown }>(res)
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
      const json = await safeJson<{ success?: boolean; data?: unknown }>(res)
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
      const json = await safeJson<{ success?: boolean; data?: unknown }>(res)
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
      const json = await safeJson<{ success?: boolean; data?: unknown }>(res)
      if (!json || !json.success) { toast.error('Ошибка при удалении цели'); return }
      toast.success('Цель удалена'); fetchGoals()
    } catch (err) {
      console.error('Failed to delete goal:', err)
      toast.error('Ошибка: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка'))
    }
  }

  // ─── Milestone Toggle ────────────────────────────────────────────────────

  const handleMilestoneToggle = async (goalId: string, milestoneIndex: number) => {
    toast.dismiss()
    try {
      const goal = goals.find(g => g.id === goalId)
      if (!goal) return
      let milestones: Array<{ id: string; title: string; completed: boolean }> = []
      try {
        milestones = JSON.parse(goal.milestones || '[]')
      } catch { /* ignore */ }
      if (milestones[milestoneIndex]) {
        milestones[milestoneIndex].completed = !milestones[milestoneIndex].completed
      }
      const res = await fetch(`/api/goals/${goalId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ milestones: JSON.stringify(milestones) }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await safeJson<{ success?: boolean; data?: unknown }>(res)
      if (!json || !json.success) return
      fetchGoals()
    } catch {
      toast.error('Ошибка обновления этапа')
    }
  }

  return {
    // state
    goals, stats, loading, filterTab, setFilterTab, categoryFilter, setCategoryFilter,
    dialogOpen, handleDialogChange, editingGoal, submitting,
    // form
    formTitle, setFormTitle,
    formDescription, setFormDescription,
    formCategory, setFormCategory,
    formTargetValue, setFormTargetValue,
    formCurrentValue, setFormCurrentValue,
    formUnit, setFormUnit,
    formDeadline, setFormDeadline,
    formStartDate, setFormStartDate,
    formPriority, setFormPriority,
    formStatus, setFormStatus,
    formProgress, setFormProgress,
    formMilestones, setFormMilestones,
    // handlers
    openAddDialog, openEditDialog, handleSubmit,
    handleUpdateProgress, handleComplete, handleDelete,
    handleMilestoneToggle,
    // computed
    filteredGoals,
  }
}
