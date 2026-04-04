'use client'

import { useState, useEffect, useCallback } from 'react'
import { safeJson } from '@/lib/safe-fetch'
import { Crosshair, Plus, Target, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import type { GoalData, GoalsResponse, FilterTab } from './types'
import { getMotivationalPhrase } from './constants'
import { GoalStats } from './goal-stats'
import { GoalCard } from './goal-card'
import { GoalDialog } from './goal-dialog'

export default function GoalsPage() {
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

  const filteredGoals = goals.filter((g) => {
    if (filterTab === 'active') return g.status === 'active'
    if (filterTab === 'completed') return g.status === 'completed'
    return true
  })

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

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-20 -top-16 h-64 w-64 rounded-full bg-gradient-to-br from-violet-400/20 to-purple-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 top-8 h-40 w-40 rounded-full bg-gradient-to-br from-emerald-400/15 to-teal-500/10 blur-3xl" />
        <div className="relative flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Crosshair className="h-6 w-6" />Цели
            </h2>
            <p className="text-muted-foreground text-sm mt-1">Трекер целей и достижений</p>
          </div>
          <Button onClick={openAddDialog}>
            <Plus className="h-4 w-4 mr-2" />Новая цель
          </Button>
          <GoalDialog
            open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm() }}
            editingGoal={editingGoal}
            formTitle={formTitle} setFormTitle={setFormTitle}
            formDescription={formDescription} setFormDescription={setFormDescription}
            formCategory={formCategory} setFormCategory={setFormCategory}
            formTargetValue={formTargetValue} setFormTargetValue={setFormTargetValue}
            formCurrentValue={formCurrentValue} setFormCurrentValue={setFormCurrentValue}
            formUnit={formUnit} setFormUnit={setFormUnit}
            formDeadline={formDeadline} setFormDeadline={setFormDeadline}
            formStatus={formStatus} setFormStatus={setFormStatus}
            formProgress={formProgress} setFormProgress={setFormProgress}
            submitting={submitting} onSubmit={handleSubmit}
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`stat-skel-${i}`} className="skeleton-shimmer h-[100px] rounded-xl" />
            ))}
          </div>
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={`tab-skel-${i}`} className="h-9 w-24 rounded-lg" />
            ))}
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`goal-skel-${i}`} className="skeleton-shimmer h-32 rounded-xl" />
            ))}
          </div>
        </div>
      ) : goals.length === 0 ? (
        <Card className="animate-slide-up overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-amber-500/5 pointer-events-none" />
          <CardContent className="relative py-16 text-center">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
              <Target className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Нет целей</h3>
            <p className="text-muted-foreground text-sm mb-1 max-w-xs mx-auto">
              Поставьте первую цель и начните двигаться к ней.
            </p>
            <p className="text-sm text-muted-foreground/70 italic mb-5 max-w-sm mx-auto">
              &ldquo;{getMotivationalPhrase()}&rdquo;
            </p>
            <Button
              onClick={openAddDialog}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all"
            >
              <Plus className="h-4 w-4 mr-2" />Поставить цель
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <GoalStats goals={goals} stats={stats} />

          {/* Filter Tabs */}
          <div className="flex gap-2">
            {([
              { key: 'all' as FilterTab, label: 'Все' },
              { key: 'active' as FilterTab, label: 'Активные' },
              { key: 'completed' as FilterTab, label: 'Завершённые' },
            ]).map((tab) => (
              <button
                key={tab.key} type="button"
                onClick={() => setFilterTab(tab.key)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  filterTab === tab.key
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                }`}
              >
                {tab.label}
                <span className="ml-1.5 text-xs opacity-70">
                  {tab.key === 'all'
                    ? goals.length
                    : tab.key === 'active'
                      ? goals.filter((g) => g.status === 'active').length
                      : goals.filter((g) => g.status === 'completed').length
                  }
                </span>
              </button>
            ))}
          </div>

          {filteredGoals.length === 0 ? (
            <Card className="animate-slide-up overflow-hidden relative py-12">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-sky-500/5 pointer-events-none" />
              <CardContent className="relative flex flex-col items-center py-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-400/80 to-sky-400/80 flex items-center justify-center mb-3 shadow-lg shadow-violet-500/15">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm font-medium text-foreground/80">
                  {filterTab === 'active'
                    ? 'Нет активных целей'
                    : filterTab === 'completed'
                      ? 'Нет завершённых целей'
                      : 'Нет целей в этой категории'
                  }
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1 italic">
                  &ldquo;{getMotivationalPhrase()}&rdquo;
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="stagger-children space-y-3">
              {filteredGoals.map((goal) => (
                <GoalCard
                  key={goal.id} goal={goal}
                  onEdit={openEditDialog}
                  onUpdateProgress={handleUpdateProgress}
                  onComplete={handleComplete}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
