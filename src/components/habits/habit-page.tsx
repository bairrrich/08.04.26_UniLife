'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { safeJson } from '@/lib/safe-fetch'
import { Plus, Target, Flame, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import type { HabitData, HabitsResponse } from './types'
import { getTodayDateBadge, getMotivationalPhrase, getLast7Days } from './constants'
import { HabitStats } from './habit-stats'
import { WeeklyProgress } from './weekly-progress'
import { HabitCard } from './habit-card'
import { HabitDialog } from './habit-dialog'

export default function HabitsPage() {
  const [habits, setHabits] = useState<HabitData[]>([])
  const [stats, setStats] = useState({ totalActive: 0, completedToday: 0, bestStreak: 0 })
  const [loading, setLoading] = useState(true)

  // Add dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [formName, setFormName] = useState('')
  const [formEmoji, setFormEmoji] = useState('✅')
  const [formColor, setFormColor] = useState('#10b981')
  const [formFrequency, setFormFrequency] = useState('daily')
  const [formTargetCount, setFormTargetCount] = useState('1')

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editId, setEditId] = useState('')
  const [editName, setEditName] = useState('')
  const [editEmoji, setEditEmoji] = useState('✅')
  const [editColor, setEditColor] = useState('#10b981')
  const [editFrequency, setEditFrequency] = useState('daily')
  const [editTargetCount, setEditTargetCount] = useState('1')

  // Delete confirmation state (inline)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const deleteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cleanup delete timer on unmount
  useEffect(() => {
    return () => { if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current) }
  }, [])

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

  // ─── Handlers ────────────────────────────────────────────────────────────

  const resetAddForm = () => {
    setFormName(''); setFormEmoji('✅'); setFormColor('#10b981')
    setFormFrequency('daily'); setFormTargetCount('1')
  }

  const handleCreate = async () => {
    if (!formName.trim()) return
    toast.dismiss()
    try {
      const res = await fetch('/api/habits', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName.trim(), emoji: formEmoji, color: formColor,
          frequency: formFrequency, targetCount: parseInt(formTargetCount) || 1,
        }),
      })
      const json = await safeJson<{ success: boolean }>(res)
      if (json && json.success) {
        toast.success('Привычка создана'); setAddDialogOpen(false); resetAddForm(); fetchHabits()
      } else {
        toast.error('Ошибка при создании привычки')
      }
    } catch (err) {
      console.error('Failed to create habit:', err)
      toast.error('Ошибка: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка'))
    }
  }

  const handleToggle = async (habitId: string) => {
    toast.dismiss()
    try {
      const res = await fetch(`/api/habits/${habitId}`, { method: 'PUT' })
      const json = await safeJson<{ success: boolean }>(res)
      if (json && json.success) fetchHabits()
    } catch (err) {
      console.error('Failed to toggle habit:', err)
      toast.error('Ошибка')
    }
  }

  const handleEdit = (habit: HabitData) => {
    setEditId(habit.id); setEditName(habit.name); setEditEmoji(habit.emoji)
    setEditColor(habit.color); setEditFrequency(habit.frequency)
    setEditTargetCount(String(habit.targetCount)); setEditDialogOpen(true)
  }

  const handleUpdate = async () => {
    if (!editName.trim()) return
    toast.dismiss()
    try {
      const res = await fetch(`/api/habits/${editId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(), emoji: editEmoji, color: editColor,
          frequency: editFrequency, targetCount: parseInt(editTargetCount) || 1,
        }),
      })
      const json = await safeJson<{ success: boolean }>(res)
      if (json && json.success) {
        toast.success('Привычка обновлена'); setEditDialogOpen(false); fetchHabits()
      } else {
        toast.error('Ошибка при обновлении привычки')
      }
    } catch (err) {
      console.error('Failed to update habit:', err)
      toast.error('Ошибка: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка'))
    }
  }

  const handleDeleteClick = (habitId: string) => {
    if (deleteConfirmId === habitId) {
      if (deleteTimerRef.current) { clearTimeout(deleteTimerRef.current); deleteTimerRef.current = null }
      setDeleteConfirmId(null); handleDelete(habitId)
    } else {
      if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current)
      setDeleteConfirmId(habitId)
      deleteTimerRef.current = setTimeout(() => { setDeleteConfirmId(null); deleteTimerRef.current = null }, 3000)
    }
  }

  const handleDelete = async (habitId: string) => {
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
  }

  const last7Days = useMemo(() => getLast7Days(), [])

  // ─── Weekly Completion Rate ─────────────────────────────────────────────

  const weeklyStats = useMemo(() => {
    if (habits.length === 0) return { rate: 0, color: 'emerald' as const }
    let totalCompleted = 0
    const totalPossible = habits.length * 7
    for (const habit of habits) {
      for (const day of last7Days) {
        if (habit.last7Days[day]) totalCompleted++
      }
    }
    const rate = Math.round((totalCompleted / totalPossible) * 100)
    const color = rate >= 70 ? ('emerald' as const) : rate >= 40 ? ('amber' as const) : ('red' as const)
    return { rate, color }
  }, [habits, last7Days])

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="relative">
        <div className="absolute -top-12 -left-12 h-48 w-48 rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-gradient-to-br from-amber-400/15 to-orange-500/10 blur-3xl pointer-events-none" />
        <div className="relative flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Target className="h-6 w-6" />
              Привычки
              <Badge variant="secondary" className="text-[10px] px-2 py-0.5 font-normal ml-1">
                <Calendar className="h-3 w-3 mr-1" />
                {getTodayDateBadge()}
              </Badge>
            </h2>
            <p className="text-muted-foreground text-sm mt-1">Трекер привычек и достижений</p>
          </div>
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />Добавить привычку
          </Button>
        </div>
      </div>

      <HabitDialog
        open={addDialogOpen} onOpenChange={(open) => { setAddDialogOpen(open); if (!open) resetAddForm() }}
        title="Новая привычка" name={formName} setName={setFormName}
        emoji={formEmoji} setEmoji={setFormEmoji} color={formColor} setColor={setFormColor}
        frequency={formFrequency} setFrequency={setFormFrequency}
        targetCount={formTargetCount} setTargetCount={setFormTargetCount}
        submitLabel="Создать привычку" onSubmit={handleCreate}
      />

      <HabitDialog
        open={editDialogOpen} onOpenChange={setEditDialogOpen}
        title="Редактировать привычку" name={editName} setName={setEditName}
        emoji={editEmoji} setEmoji={setEditEmoji} color={editColor} setColor={setEditColor}
        frequency={editFrequency} setFrequency={setEditFrequency}
        targetCount={editTargetCount} setTargetCount={setEditTargetCount}
        submitLabel="Сохранить изменения" onSubmit={handleUpdate}
      />

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`stat-skel-${i}`} className="skeleton-shimmer h-[100px] rounded-xl" />
            ))}
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`habit-skel-${i}`} className="skeleton-shimmer h-20 rounded-xl" />
            ))}
          </div>
        </div>
      ) : habits.length === 0 ? (
        <Card className="animate-slide-up overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-amber-500/5 pointer-events-none" />
          <CardContent className="relative py-16 text-center">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
              <Target className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Нет привычек</h3>
            <p className="text-muted-foreground text-sm mb-1 max-w-xs mx-auto">
              Начните отслеживать свои привычки прямо сейчас.
            </p>
            <p className="text-sm text-muted-foreground/70 italic mb-5 max-w-sm mx-auto">
              &ldquo;{getMotivationalPhrase()}&rdquo;
            </p>
            <Button
              onClick={() => setAddDialogOpen(true)}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all"
            >
              <Plus className="h-4 w-4 mr-2" />Создать первую привычку
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <HabitStats stats={stats} />

          {/* Best Streak Record */}
          {(() => {
            const bestHabit = [...habits].sort((a, b) => b.streak - a.streak)[0]
            if (!bestHabit || bestHabit.streak === 0) return null
            return (
              <Card className="card-hover rounded-xl border overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent pointer-events-none" />
                <CardContent className="relative p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/20">
                        <Flame className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold">Лучшая серия</h3>
                        <p className="text-xs text-muted-foreground">Привычка с самой длинной серией</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{bestHabit.emoji}</span>
                      <div className="text-right">
                        <p className="text-sm font-medium">{bestHabit.name}</p>
                        <div className="flex items-center gap-1 justify-end">
                          <span className="text-lg">🔥</span>
                          <span className="text-lg font-bold tabular-nums text-orange-600 dark:text-orange-400">{bestHabit.streak}</span>
                          <span className="text-[10px] text-muted-foreground">дн.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })()}

          <WeeklyProgress rate={weeklyStats.rate} color={weeklyStats.color} />

          {/* Streak Records */}
          <Card className="card-hover rounded-xl border">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Flame className="h-4 w-4 text-orange-500" />
                Рекорды привычек
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {habits
                  .filter(h => h.streak > 0)
                  .sort((a, b) => b.streak - a.streak)
                  .slice(0, 5)
                  .map((habit, index) => (
                    <div key={habit.id} className="flex items-center gap-3 rounded-lg bg-muted/30 px-3 py-2.5">
                      <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold tabular-nums
                        ${index === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' :
                          index === 1 ? 'bg-gray-100 text-gray-600 dark:bg-gray-800/40 dark:text-gray-400' :
                          index === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400' :
                          'bg-muted text-muted-foreground'}`}>
                        {index + 1}
                      </span>
                      <span className="text-lg">{habit.emoji}</span>
                      <span className="flex-1 text-sm font-medium">{habit.name}</span>
                      <div className="flex items-center gap-1">
                        <Flame className="h-3.5 w-3.5 text-orange-500" />
                        <span className="text-sm font-semibold tabular-nums text-orange-600 dark:text-orange-400">{habit.streak}</span>
                        <span className="text-[10px] text-muted-foreground">дн.</span>
                      </div>
                    </div>
                  ))}
                {habits.filter(h => h.streak > 0).length === 0 && (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    Начните выполнять привычки, чтобы здесь появились рекорды
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Habit List */}
          <div className="stagger-children space-y-3">
            {habits.map((habit) => (
              <HabitCard
                key={habit.id} habit={habit} last7Days={last7Days}
                onToggle={handleToggle} onEdit={handleEdit}
                onDeleteClick={handleDeleteClick} deleteConfirmId={deleteConfirmId}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
