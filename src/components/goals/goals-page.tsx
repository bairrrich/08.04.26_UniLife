'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Crosshair,
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
  TrendingUp,
  Target,
  Clock,
  AlertCircle,
  Heart,
  GraduationCap,
  Briefcase,
  Zap,
  Trophy,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

// ======================== Types ========================

interface GoalData {
  id: string
  title: string
  description: string | null
  category: string
  targetValue: number | null
  currentValue: number
  unit: string | null
  deadline: string | null
  status: string
  progress: number
  createdAt: string
  updatedAt: string
}

interface GoalsResponse {
  success: boolean
  data: GoalData[]
  stats: {
    totalGoals: number
    completedGoals: number
    avgProgress: number
  }
}

// ======================== Constants ========================

type FilterTab = 'all' | 'active' | 'completed'

const CATEGORY_CONFIG: Record<string, {
  label: string
  icon: React.ReactNode
  badgeClass: string
  bgClass: string
  iconBgClass: string
}> = {
  personal: {
    label: 'Личное',
    icon: <Heart className="h-3.5 w-3.5" />,
    badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
    bgClass: 'from-emerald-500/10 to-emerald-600/5',
    iconBgClass: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
  health: {
    label: 'Здоровье',
    icon: <Zap className="h-3.5 w-3.5" />,
    badgeClass: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400',
    bgClass: 'from-rose-500/10 to-rose-600/5',
    iconBgClass: 'bg-rose-100 dark:bg-rose-900/30',
  },
  finance: {
    label: 'Финансы',
    icon: <TrendingUp className="h-3.5 w-3.5" />,
    badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
    bgClass: 'from-amber-500/10 to-amber-600/5',
    iconBgClass: 'bg-amber-100 dark:bg-amber-900/30',
  },
  career: {
    label: 'Карьера',
    icon: <Briefcase className="h-3.5 w-3.5" />,
    badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
    bgClass: 'from-blue-500/10 to-blue-600/5',
    iconBgClass: 'bg-blue-100 dark:bg-blue-900/30',
  },
  learning: {
    label: 'Обучение',
    icon: <GraduationCap className="h-3.5 w-3.5" />,
    badgeClass: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400',
    bgClass: 'from-violet-500/10 to-violet-600/5',
    iconBgClass: 'bg-violet-100 dark:bg-violet-900/30',
  },
}

const STATUS_CONFIG: Record<string, {
  label: string
  color: string
  dotClass: string
}> = {
  active: {
    label: 'Активна',
    color: 'text-emerald-600 dark:text-emerald-400',
    dotClass: 'bg-emerald-500',
  },
  completed: {
    label: 'Завершена',
    color: 'text-blue-600 dark:text-blue-400',
    dotClass: 'bg-blue-500',
  },
  abandoned: {
    label: 'Заброшена',
    color: 'text-muted-foreground',
    dotClass: 'bg-muted-foreground/40',
  },
}

const MOTIVATIONAL_PHRASES = [
  'Каждая цель — это шаг к лучшей версии себя.',
  'Великие дела начинаются с малого первого шага.',
  'Дисциплина и настойчивость превращают мечты в реальность.',
  'Тот, кто чётко видит цель, уже на полпути к ней.',
  'Сегодняшние усилия — завтрашние достижения.',
]

const CATEGORY_OPTIONS = [
  { value: 'personal', label: 'Личное' },
  { value: 'health', label: 'Здоровье' },
  { value: 'finance', label: 'Финансы' },
  { value: 'career', label: 'Карьера' },
  { value: 'learning', label: 'Обучение' },
]

const STATUS_OPTIONS = [
  { value: 'active', label: 'Активна' },
  { value: 'completed', label: 'Завершена' },
  { value: 'abandoned', label: 'Заброшена' },
]

// ======================== Helpers ========================

function getMotivationalPhrase(): string {
  const idx = new Date().getDate() % MOTIVATIONAL_PHRASES.length
  return MOTIVATIONAL_PHRASES[idx]
}

function getDeadlineCountdown(deadline: string | null): string | null {
  if (!deadline) return null
  const now = new Date()
  const dl = new Date(deadline)
  const diffMs = dl.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return `${Math.abs(diffDays)} дн. просрочено`
  if (diffDays === 0) return 'Сегодня дедлайн'
  if (diffDays === 1) return '1 день осталось'
  if (diffDays <= 4) return `${diffDays} дня осталось`
  return `${diffDays} дней осталось`
}

function getProgressColor(progress: number): string {
  if (progress >= 80) return '[&>div]:bg-emerald-500'
  if (progress >= 50) return '[&>div]:bg-blue-500'
  if (progress >= 25) return '[&>div]:bg-amber-500'
  return '[&>div]:bg-rose-500'
}

function getProgressTrackColor(progress: number): string {
  if (progress >= 80) return 'bg-emerald-100 dark:bg-emerald-900/30'
  if (progress >= 50) return 'bg-blue-100 dark:bg-blue-900/30'
  if (progress >= 25) return 'bg-amber-100 dark:bg-amber-900/30'
  return 'bg-rose-100 dark:bg-rose-900/30'
}

function getProgressTextColor(progress: number): string {
  if (progress >= 80) return 'text-emerald-600 dark:text-emerald-400'
  if (progress >= 50) return 'text-blue-600 dark:text-blue-400'
  if (progress >= 25) return 'text-amber-600 dark:text-amber-400'
  return 'text-rose-600 dark:text-rose-400'
}

// ======================== Component ========================

export function GoalsPage() {
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
      const json: GoalsResponse = await res.json()
      if (json.success) {
        setGoals(json.data)
        setStats(json.stats)
      }
    } catch (err) {
      console.error('Failed to fetch goals:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchGoals()
  }, [fetchGoals])

  // ======================== Filtered Goals ========================

  const filteredGoals = goals.filter((g) => {
    if (filterTab === 'active') return g.status === 'active'
    if (filterTab === 'completed') return g.status === 'completed'
    return true
  })

  // ======================== Dialog Handlers ========================

  const resetForm = () => {
    setFormTitle('')
    setFormDescription('')
    setFormCategory('personal')
    setFormTargetValue('')
    setFormCurrentValue('0')
    setFormUnit('')
    setFormDeadline('')
    setFormStatus('active')
    setFormProgress('0')
    setEditingGoal(null)
  }

  const openAddDialog = () => {
    resetForm()
    setDialogOpen(true)
  }

  const openEditDialog = (goal: GoalData) => {
    setEditingGoal(goal)
    setFormTitle(goal.title)
    setFormDescription(goal.description || '')
    setFormCategory(goal.category)
    setFormTargetValue(goal.targetValue != null ? String(goal.targetValue) : '')
    setFormCurrentValue(String(goal.currentValue))
    setFormUnit(goal.unit || '')
    setFormDeadline(goal.deadline ? goal.deadline.split('T')[0] : '')
    setFormStatus(goal.status)
    setFormProgress(String(goal.progress))
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!formTitle.trim()) return

    toast.dismiss()
    setSubmitting(true)
    try {
      const body = {
        title: formTitle.trim(),
        description: formDescription.trim() || null,
        category: formCategory,
        targetValue: formTargetValue ? Number(formTargetValue) : null,
        currentValue: Number(formCurrentValue) || 0,
        unit: formUnit.trim() || null,
        deadline: formDeadline ? new Date(formDeadline).toISOString() : null,
        status: formStatus,
        progress: Math.min(100, Math.max(0, Number(formProgress) || 0)),
      }

      if (editingGoal) {
        const res = await fetch(`/api/goals/${editingGoal.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        const json = await res.json()
        if (json.success) {
          toast.success('Цель обновлена')
          setDialogOpen(false)
          fetchGoals()
        } else {
          toast.error('Ошибка при обновлении цели')
        }
      } else {
        const res = await fetch('/api/goals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        const json = await res.json()
        if (json.success) {
          toast.success('Цель создана')
          setDialogOpen(false)
          fetchGoals()
        } else {
          toast.error('Ошибка при создании цели')
        }
      }
    } catch (err) {
      console.error('Failed to save goal:', err)
      toast.error('Ошибка: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка'))
    } finally {
      setSubmitting(false)
    }
  }

  // ======================== Quick Actions ========================

  const handleUpdateProgress = async (goal: GoalData) => {
    toast.dismiss()
    try {
      const newProgress = Math.min(100, goal.progress + 5)
      const res = await fetch(`/api/goals/${goal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress: newProgress }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success(`Прогресс: ${newProgress}%`)
        fetchGoals()
      }
    } catch (err) {
      toast.error('Ошибка обновления прогресса')
    }
  }

  const handleComplete = async (goal: GoalData) => {
    toast.dismiss()
    try {
      const res = await fetch(`/api/goals/${goal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed', progress: 100 }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success('Цель завершена! 🎉')
        fetchGoals()
      }
    } catch (err) {
      toast.error('Ошибка завершения цели')
    }
  }

  const handleDelete = async (goalId: string) => {
    toast.dismiss()
    try {
      const res = await fetch(`/api/goals/${goalId}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) {
        toast.success('Цель удалена')
        fetchGoals()
      } else {
        toast.error('Ошибка при удалении цели')
      }
    } catch (err) {
      console.error('Failed to delete goal:', err)
      toast.error('Ошибка: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка'))
    }
  }

  // ======================== Render ========================

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header with decorative gradient blobs */}
      <div className="relative">
        <div className="absolute -top-12 -left-12 h-48 w-48 rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-gradient-to-br from-amber-400/15 to-orange-500/10 blur-3xl pointer-events-none" />

        <div className="relative flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Crosshair className="h-6 w-6" />
              Цели
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Трекер целей и достижений
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm() }}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Новая цель
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingGoal ? 'Редактировать цель' : 'Новая цель'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                {/* Title */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Название *</label>
                  <Input
                    placeholder="Например: Выучить TypeScript"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Описание</label>
                  <Textarea
                    placeholder="Подробности о вашей цели..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Category + Status row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Категория</label>
                    <Select value={formCategory} onValueChange={setFormCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORY_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Статус</label>
                    <Select value={formStatus} onValueChange={setFormStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Target value row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Целевое</label>
                    <Input
                      type="number"
                      placeholder="100"
                      value={formTargetValue}
                      onChange={(e) => setFormTargetValue(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Текущее</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formCurrentValue}
                      onChange={(e) => setFormCurrentValue(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Единица</label>
                    <Input
                      placeholder="кг, ₽, раз"
                      value={formUnit}
                      onChange={(e) => setFormUnit(e.target.value)}
                    />
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Прогресс ({formProgress || 0}%)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formProgress || 0}
                    onChange={(e) => setFormProgress(e.target.value)}
                    className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                  />
                </div>

                {/* Deadline */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Дедлайн</label>
                  <Input
                    type="date"
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={handleSubmit}
                  disabled={!formTitle.trim() || submitting}
                >
                  {submitting ? 'Сохранение...' : editingGoal ? 'Сохранить изменения' : 'Создать цель'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ======================== Loading State (Skeleton) ======================== */}
      {loading ? (
        <div className="space-y-6">
          {/* Skeleton Stats Row */}
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`stat-skel-${i}`} className="skeleton-shimmer h-[100px] rounded-xl" />
            ))}
          </div>
          {/* Skeleton Filter Tabs */}
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={`tab-skel-${i}`} className="h-9 w-24 rounded-lg" />
            ))}
          </div>
          {/* Skeleton Goal Cards */}
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`goal-skel-${i}`} className="skeleton-shimmer h-32 rounded-xl" />
            ))}
          </div>
        </div>
      ) : goals.length === 0 ? (
        /* ======================== Empty State ======================== */
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
              <Plus className="h-4 w-4 mr-2" />
              Поставить цель
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* ======================== Content ======================== */
        <>
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 stagger-children">
            <Card className="card-hover overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5" />
              <CardContent className="relative flex items-center gap-3 p-4">
                <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                  <Target className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-bold tabular-nums">{stats.totalGoals}</p>
                  <p className="text-xs text-muted-foreground truncate">Всего целей</p>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/5" />
              <CardContent className="relative flex items-center gap-3 p-4">
                <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                  <Trophy className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-bold tabular-nums">{stats.completedGoals}</p>
                  <p className="text-xs text-muted-foreground truncate">Завершено</p>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-amber-600/5" />
              <CardContent className="relative flex items-center gap-3 p-4">
                <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                  <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-bold tabular-nums">{stats.avgProgress}%</p>
                  <p className="text-xs text-muted-foreground truncate">Средний прогресс</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            {([
              { key: 'all' as FilterTab, label: 'Все' },
              { key: 'active' as FilterTab, label: 'Активные' },
              { key: 'completed' as FilterTab, label: 'Завершённые' },
            ]).map((tab) => (
              <button
                key={tab.key}
                type="button"
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

          {/* Goal Cards */}
          {filteredGoals.length === 0 ? (
            <Card className="py-12 text-center">
              <CardContent className="flex flex-col items-center">
                <AlertCircle className="h-8 w-8 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">
                  {filterTab === 'active'
                    ? 'Нет активных целей'
                    : filterTab === 'completed'
                      ? 'Нет завершённых целей'
                      : 'Нет целей в этой категории'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="stagger-children space-y-3">
              {filteredGoals.map((goal) => {
                const catConfig = CATEGORY_CONFIG[goal.category] || CATEGORY_CONFIG.personal
                const statusConfig = STATUS_CONFIG[goal.status] || STATUS_CONFIG.active
                const countdown = getDeadlineCountdown(goal.deadline)
                const isOverdue = countdown && goal.deadline && new Date(goal.deadline) < new Date() && goal.status === 'active'

                return (
                  <Card
                    key={goal.id}
                    className="card-hover overflow-hidden relative"
                  >
                    <CardContent className="p-4 space-y-3">
                      {/* Top row: Category badge + Status */}
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className={`text-xs gap-1 ${catConfig.badgeClass}`}>
                          {catConfig.icon}
                          {catConfig.label}
                        </Badge>
                        <div className="flex items-center gap-1.5">
                          <div className={`h-2 w-2 rounded-full ${statusConfig.dotClass}`} />
                          <span className={`text-xs font-medium ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                        </div>
                      </div>

                      {/* Title + Description */}
                      <div>
                        <h3 className="font-semibold text-sm leading-tight">
                          {goal.status === 'completed' && (
                            <span className="line-through text-muted-foreground mr-1.5">
                              {goal.title}
                            </span>
                          )}
                          {goal.status !== 'completed' && goal.title}
                          {goal.status === 'completed' && (
                            <CheckCircle className="inline h-3.5 w-3.5 text-blue-500 ml-1" />
                          )}
                        </h3>
                        {goal.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {goal.description}
                          </p>
                        )}
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Прогресс</span>
                          <span className={`text-xs font-bold tabular-nums ${getProgressTextColor(goal.progress)}`}>
                            {goal.progress}%
                          </span>
                        </div>
                        <Progress
                          value={goal.progress}
                          className={`h-2 ${getProgressTrackColor(goal.progress)} ${getProgressColor(goal.progress)}`}
                        />
                      </div>

                      {/* Info row: Target + Deadline */}
                      <div className="flex items-center gap-4 flex-wrap">
                        {goal.targetValue != null && (
                          <div className="flex items-center gap-1.5">
                            <Target className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground tabular-nums">
                              {goal.currentValue} / {goal.targetValue}
                              {goal.unit ? ` ${goal.unit}` : ''}
                            </span>
                          </div>
                        )}
                        {countdown && (
                          <div className={`flex items-center gap-1.5 ${isOverdue ? 'text-rose-500' : 'text-muted-foreground'}`}>
                            <Clock className="h-3.5 w-3.5" />
                            <span className="text-xs tabular-nums">{countdown}</span>
                          </div>
                        )}
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center gap-1 pt-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => openEditDialog(goal)}
                          title="Редактировать"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        {goal.status === 'active' && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-emerald-500"
                              onClick={() => handleUpdateProgress(goal)}
                              title="+5% прогресса"
                            >
                              <TrendingUp className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-blue-500"
                              onClick={() => handleComplete(goal)}
                              title="Завершить"
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                        <div className="ml-auto">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(goal.id)}
                            title="Удалить"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                    {/* Left colored border accent */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl opacity-60"
                      style={{
                        backgroundColor:
                          goal.category === 'health' ? '#f43f5e' :
                          goal.category === 'finance' ? '#f59e0b' :
                          goal.category === 'career' ? '#3b82f6' :
                          goal.category === 'learning' ? '#8b5cf6' :
                          '#10b981',
                      }}
                    />
                  </Card>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
