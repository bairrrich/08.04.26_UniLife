'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Check,
  Plus,
  Flame,
  Calendar,
  Target,
  TrendingUp,
  X,
  Edit2,
  Trash2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

// ======================== Types ========================

interface HabitData {
  id: string
  name: string
  emoji: string
  color: string
  frequency: string
  targetCount: number
  todayCompleted: boolean
  streak: number
  last7Days: Record<string, boolean>
  createdAt: string
}

interface HabitsResponse {
  success: boolean
  data: HabitData[]
  stats: {
    totalActive: number
    completedToday: number
    bestStreak: number
  }
}

// ======================== Constants ========================

const EMOJI_OPTIONS = [
  '✅', '🏃‍♂️', '📚', '💧', '🧘‍♂️', '💪', '🍎', '😴', '🧹', '✍️', '🎯',
]

const COLOR_OPTIONS = [
  '#10b981', '#3b82f6', '#06b6d4', '#8b5cf6', '#f97316',
  '#ef4444', '#ec4899', '#f59e0b', '#14b8a6', '#6366f1',
]

const DAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

// ======================== Helpers ========================

function getLast7Days(): string[] {
  const days: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr)
  const day = d.getDay()
  // Convert Sunday=0 to Monday-based index
  const idx = day === 0 ? 6 : day - 1
  return DAY_LABELS[idx]
}

// ======================== Component ========================

export function HabitsPage() {
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

  const fetchHabits = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/habits')
      const json: HabitsResponse = await res.json()
      if (json.success) {
        setHabits(json.data)
        setStats(json.stats)
      }
    } catch (err) {
      console.error('Failed to fetch habits:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHabits()
  }, [fetchHabits])

  // ======================== Handlers ========================

  const resetAddForm = () => {
    setFormName('')
    setFormEmoji('✅')
    setFormColor('#10b981')
    setFormFrequency('daily')
    setFormTargetCount('1')
  }

  const handleCreate = async () => {
    if (!formName.trim()) return

    toast.dismiss()
    try {
      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName.trim(),
          emoji: formEmoji,
          color: formColor,
          frequency: formFrequency,
          targetCount: parseInt(formTargetCount) || 1,
        }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success('Привычка создана')
        setAddDialogOpen(false)
        resetAddForm()
        fetchHabits()
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
      const json = await res.json()
      if (json.success) {
        fetchHabits()
      }
    } catch (err) {
      console.error('Failed to toggle habit:', err)
      toast.error('Ошибка')
    }
  }

  const handleEdit = (habit: HabitData) => {
    setEditId(habit.id)
    setEditName(habit.name)
    setEditEmoji(habit.emoji)
    setEditColor(habit.color)
    setEditFrequency(habit.frequency)
    setEditTargetCount(String(habit.targetCount))
    setEditDialogOpen(true)
  }

  const handleUpdate = async () => {
    if (!editName.trim()) return

    toast.dismiss()
    try {
      const res = await fetch(`/api/habits/${editId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          emoji: editEmoji,
          color: editColor,
          frequency: editFrequency,
          targetCount: parseInt(editTargetCount) || 1,
        }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success('Привычка обновлена')
        setEditDialogOpen(false)
        fetchHabits()
      } else {
        toast.error('Ошибка при обновлении привычки')
      }
    } catch (err) {
      console.error('Failed to update habit:', err)
      toast.error('Ошибка: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка'))
    }
  }

  const handleDelete = async (habitId: string) => {
    toast.dismiss()
    try {
      const res = await fetch(`/api/habits/${habitId}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) {
        toast.success('Привычка удалена')
        fetchHabits()
      } else {
        toast.error('Ошибка при удалении привычки')
      }
    } catch (err) {
      console.error('Failed to delete habit:', err)
      toast.error('Ошибка: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка'))
    }
  }

  const last7Days = getLast7Days()

  // ======================== Render ========================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Target className="h-6 w-6" />
            Привычки
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Трекер привычек и достижений
          </p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={(open) => { setAddDialogOpen(open); if (!open) resetAddForm() }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Добавить привычку
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Новая привычка</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Название</label>
                <Input
                  placeholder="Например: Утренняя зарядка"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>

              {/* Emoji picker */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Иконка</label>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setFormEmoji(emoji)}
                      className={`h-9 w-9 rounded-lg text-lg flex items-center justify-center transition-all ${
                        formEmoji === emoji
                          ? 'bg-primary/10 ring-2 ring-primary scale-110'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color picker */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Цвет</label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormColor(color)}
                      className={`h-8 w-8 rounded-full transition-all ${
                        formColor === color ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Frequency */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Частота</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormFrequency('daily')}
                    className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                      formFrequency === 'daily'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    Ежедневно
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormFrequency('weekly')}
                    className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                      formFrequency === 'weekly'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    Еженедельно
                  </button>
                </div>
              </div>

              {/* Target count */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Цель (раз в день)</label>
                <Input
                  type="number"
                  min="1"
                  max="99"
                  value={formTargetCount}
                  onChange={(e) => setFormTargetCount(e.target.value)}
                  className="w-24"
                />
              </div>

              <Button className="w-full" onClick={handleCreate} disabled={!formName.trim()}>
                Создать привычку
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="card-hover overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5" />
          <CardContent className="relative flex items-center gap-3 p-4">
            <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
              <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold tabular-nums">{stats.totalActive}</p>
              <p className="text-xs text-muted-foreground truncate">Активные привычки</p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/5" />
          <CardContent className="relative flex items-center gap-3 p-4">
            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
              <Check className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold tabular-nums">{stats.completedToday}</p>
              <p className="text-xs text-muted-foreground truncate">Выполнено сегодня</p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/5" />
          <CardContent className="relative flex items-center gap-3 p-4">
            <div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
              <Flame className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold tabular-nums">{stats.bestStreak}</p>
              <p className="text-xs text-muted-foreground truncate">Лучшая серия</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Habit List */}
      {loading ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground text-sm">
            Загрузка...
          </CardContent>
        </Card>
      ) : habits.length === 0 ? (
        <Card className="animate-slide-up">
          <CardContent className="py-16 text-center">
            <div className="h-16 w-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
              <Target className="h-8 w-8 text-emerald-500" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Нет привычек</h3>
            <p className="text-muted-foreground text-sm mb-4 max-w-xs mx-auto">
              Начните отслеживать свои привычки прямо сейчас. Каждый маленький шаг ведёт к большим достижениям!
            </p>
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Создать первую привычку
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="stagger-children space-y-3">
          {habits.map((habit) => (
            <Card
              key={habit.id}
              className={`card-hover animate-slide-up border-l-4 overflow-hidden`}
              style={{ borderLeftColor: habit.color }}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {/* Toggle button */}
                  <button
                    onClick={() => handleToggle(habit.id)}
                    className="shrink-0 transition-transform hover:scale-110 active:scale-95"
                  >
                    {habit.todayCompleted ? (
                      <div
                        className="h-8 w-8 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: habit.color }}
                      >
                        <Check className="h-4.5 w-4.5" />
                      </div>
                    ) : (
                      <div className="h-8 w-8 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center" />
                    )}
                  </button>

                  {/* Habit info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{habit.emoji}</span>
                      <span className={`font-medium text-sm ${habit.todayCompleted ? 'line-through text-muted-foreground' : ''}`}>
                        {habit.name}
                      </span>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {habit.frequency === 'daily' ? 'Ежедневно' : 'Еженедельно'}
                      </Badge>
                    </div>

                    {/* Weekly mini-grid */}
                    <div className="flex items-center gap-1.5 mt-2">
                      <Calendar className="h-3 w-3 text-muted-foreground shrink-0" />
                      <div className="flex gap-1">
                        {last7Days.map((day) => {
                          const completed = habit.last7Days[day]
                          const isToday = day === new Date().toISOString().split('T')[0]
                          return (
                            <div
                              key={day}
                              className="flex flex-col items-center gap-0.5"
                              title={`${getDayLabel(day)} ${day}`}
                            >
                              <div
                                className={`h-5 w-5 rounded-full transition-all ${
                                  completed
                                    ? 'scale-100'
                                    : 'border border-muted-foreground/20'
                                } ${isToday ? 'ring-2 ring-offset-1 ring-background' : ''}`}
                                style={{
                                  backgroundColor: completed ? habit.color : undefined,
                                  opacity: completed ? 1 : 0.4,
                                }}
                              />
                              <span className="text-[9px] text-muted-foreground leading-none">
                                {getDayLabel(day)}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Streak */}
                  {habit.streak > 0 && (
                    <div className="flex items-center gap-1 text-orange-500 shrink-0">
                      <Flame className="h-4 w-4" />
                      <span className="text-sm font-bold tabular-nums">{habit.streak}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => handleEdit(habit)}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(habit.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Редактировать привычку</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Название</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>

            {/* Emoji picker */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Иконка</label>
              <div className="flex flex-wrap gap-2">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setEditEmoji(emoji)}
                    className={`h-9 w-9 rounded-lg text-lg flex items-center justify-center transition-all ${
                      editEmoji === emoji
                        ? 'bg-primary/10 ring-2 ring-primary scale-110'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Color picker */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Цвет</label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setEditColor(color)}
                    className={`h-8 w-8 rounded-full transition-all ${
                      editColor === color ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Frequency */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Частота</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditFrequency('daily')}
                  className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    editFrequency === 'daily'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  Ежедневно
                </button>
                <button
                  type="button"
                  onClick={() => setEditFrequency('weekly')}
                  className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    editFrequency === 'weekly'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  Еженедельно
                </button>
              </div>
            </div>

            {/* Target count */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Цель (раз в день)</label>
              <Input
                type="number"
                min="1"
                max="99"
                value={editTargetCount}
                onChange={(e) => setEditTargetCount(e.target.value)}
                className="w-24"
              />
            </div>

            <Button className="w-full" onClick={handleUpdate} disabled={!editName.trim()}>
              Сохранить изменения
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
