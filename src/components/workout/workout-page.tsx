'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Dumbbell,
  Plus,
  Clock,
  Flame,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Trash2,
  Trophy,
  Weight,
  Zap,
  Heart,
  StretchHorizontal,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

// ======================== Types ========================

interface SetData {
  weight: number
  reps: number
  completed: boolean
}

interface ExerciseData {
  name: string
  sets: SetData[]
  order: number
}

interface Workout {
  id: string
  name: string
  date: string
  durationMin: number | null
  note: string | null
  exercises: {
    id: string
    name: string
    sets: string
    notes: string | null
    order: number
  }[]
  createdAt: string
}

// ======================== Workout Type Detection ========================

type WorkoutType = 'strength' | 'cardio' | 'hiit' | 'stretch'

function detectWorkoutType(name: string): WorkoutType {
  const lower = name.toLowerCase()
  if (lower.includes('кардио') || lower.includes('cardio') || lower.includes('бег') || lower.includes('ходьба')) return 'cardio'
  if (lower.includes('hiit') || lower.includes('интервал') || lower.includes('табата')) return 'hiit'
  if (lower.includes('растяж') || lower.includes('йога') || lower.includes('stretch')) return 'stretch'
  return 'strength'
}

const WORKOUT_TYPE_CONFIG: Record<WorkoutType, {
  icon: React.ReactNode
  topBorderColor: string
  label: string
}> = {
  strength: { icon: <Dumbbell className="h-4 w-4" />, topBorderColor: 'border-t-rose-400', label: 'Силовая' },
  cardio: { icon: <Clock className="h-4 w-4" />, topBorderColor: 'border-t-purple-400', label: 'Кардио' },
  hiit: { icon: <Flame className="h-4 w-4" />, topBorderColor: 'border-t-orange-400', label: 'HIIT' },
  stretch: { icon: <StretchHorizontal className="h-4 w-4" />, topBorderColor: 'border-t-emerald-400', label: 'Растяжка' },
}

// ======================== Preset Templates ========================

const WORKOUT_PRESETS: {
  label: string
  name: string
  duration: number
  exercises: ExerciseData[]
}[] = [
  {
    label: 'Кардио 30 мин',
    name: 'Кардио тренировка',
    duration: 30,
    exercises: [
      { name: 'Бег', sets: [{ weight: 0, reps: 1, completed: false }], order: 0 },
      { name: 'Прыжки со скакалкой', sets: [{ weight: 0, reps: 3, completed: false }], order: 1 },
      { name: 'Велотренажёр', sets: [{ weight: 0, reps: 1, completed: false }], order: 2 },
    ],
  },
  {
    label: 'Силовая 45 мин',
    name: 'Силовая тренировка',
    duration: 45,
    exercises: [
      { name: 'Жим штанги', sets: [{ weight: 60, reps: 10, completed: false }, { weight: 60, reps: 10, completed: false }, { weight: 60, reps: 8, completed: false }], order: 0 },
      { name: 'Приседания', sets: [{ weight: 80, reps: 10, completed: false }, { weight: 80, reps: 10, completed: false }, { weight: 80, reps: 8, completed: false }], order: 1 },
      { name: 'Подтягивания', sets: [{ weight: 0, reps: 8, completed: false }, { weight: 0, reps: 8, completed: false }, { weight: 0, reps: 6, completed: false }], order: 2 },
      { name: 'Тяга верхнего блока', sets: [{ weight: 50, reps: 12, completed: false }, { weight: 50, reps: 12, completed: false }], order: 3 },
    ],
  },
  {
    label: 'HIIT 20 мин',
    name: 'HIIT тренировка',
    duration: 20,
    exercises: [
      { name: 'Бёрпи', sets: [{ weight: 0, reps: 15, completed: false }, { weight: 0, reps: 15, completed: false }, { weight: 0, reps: 15, completed: false }], order: 0 },
      { name: 'Выпады с прыжком', sets: [{ weight: 0, reps: 20, completed: false }, { weight: 0, reps: 20, completed: false }], order: 1 },
      { name: 'Отжимания', sets: [{ weight: 0, reps: 20, completed: false }, { weight: 0, reps: 20, completed: false }], order: 2 },
      { name: 'Планка', sets: [{ weight: 0, reps: 1, completed: false }], order: 3 },
    ],
  },
  {
    label: 'Растяжка 15 мин',
    name: 'Растяжка',
    duration: 15,
    exercises: [
      { name: 'Наклоны к ногам', sets: [{ weight: 0, reps: 1, completed: false }], order: 0 },
      { name: 'Растяжка бёдер', sets: [{ weight: 0, reps: 1, completed: false }], order: 1 },
      { name: 'Поза ребёнка', sets: [{ weight: 0, reps: 1, completed: false }], order: 2 },
      { name: 'Поза кобры', sets: [{ weight: 0, reps: 1, completed: false }], order: 3 },
    ],
  },
]

// ======================== Helpers ========================

function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split('-').map(Number)
  const months = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
  ]
  return `${months[month - 1]} ${year}`
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

function getWorkoutBorderColor(name: string): string {
  const lower = name.toLowerCase()
  if (lower.includes('груд') || lower.includes('chest')) return 'border-l-rose-400'
  if (lower.includes('спин') || lower.includes('back')) return 'border-l-blue-400'
  if (lower.includes('ног') || lower.includes('leg')) return 'border-l-emerald-400'
  if (lower.includes('плеч') || lower.includes('shoulder')) return 'border-l-amber-400'
  if (lower.includes('кардио') || lower.includes('cardio')) return 'border-l-purple-400'
  if (lower.includes('рука') || lower.includes('arm')) return 'border-l-orange-400'
  return 'border-l-gray-300'
}

function parseSets(setsJson: string): SetData[] {
  try {
    return JSON.parse(setsJson)
  } catch {
    return []
  }
}

function formatSetSummary(sets: SetData[]): string {
  if (!sets || sets.length === 0) return ''
  const completedSets = sets.filter((s) => s.completed)
  if (completedSets.length === 0) return `${sets.length} подходов`
  const avgReps = Math.round(
    completedSets.reduce((a, s) => a + s.reps, 0) / completedSets.length
  )
  const avgWeight = Math.round(
    completedSets.reduce((a, s) => a + s.weight, 0) / completedSets.length
  )
  return `${sets.length}×${avgReps} @ ${avgWeight}кг`
}

function calculateVolume(sets: SetData[]): number {
  if (!sets || sets.length === 0) return 0
  return sets
    .filter((s) => s.completed)
    .reduce((sum, s) => sum + (s.weight * s.reps), 0)
}

function formatVolume(volume: number): string {
  if (volume >= 1000) return `${(volume / 1000).toFixed(1)}т`
  return `${volume}кг`
}

function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function emptyExercise(index: number): ExerciseData {
  return {
    name: '',
    sets: [
      { weight: 0, reps: 10, completed: false },
      { weight: 0, reps: 10, completed: false },
      { weight: 0, reps: 10, completed: false },
    ],
    order: index,
  }
}

function formatRelativeTime(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffDays === 0) return 'сегодня'
  if (diffDays === 1) return 'вчера'
  if (diffDays < 7) return `${diffDays} дн. назад`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} нед. назад`
  return formatDate(dateStr)
}

// ======================== Component ========================

export function WorkoutPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(getCurrentMonth())
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

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
      const json = await res.json()
      if (json.success) setWorkouts(json.data)
    } catch (err) {
      console.error('Failed to fetch workouts:', err)
    } finally {
      setLoading(false)
    }
  }, [month])

  useEffect(() => {
    fetchWorkouts()
  }, [fetchWorkouts])

  // Summary calculations
  const totalWorkouts = workouts.length
  const totalMinutes = workouts.reduce((sum, w) => sum + (w.durationMin ?? 0), 0)
  const avgDuration =
    totalWorkouts > 0 ? Math.round(totalMinutes / totalWorkouts) : 0
  const totalExercises = workouts.reduce(
    (sum, w) => sum + w.exercises.length,
    0
  )

  // Total volume calculation (sets × reps × weight for all strength exercises)
  const totalVolume = useMemo(() => {
    let volume = 0
    workouts.forEach((w) => {
      const wType = detectWorkoutType(w.name)
      if (wType === 'strength') {
        w.exercises.forEach((ex) => {
          const sets = parseSets(ex.sets)
          volume += calculateVolume(sets)
        })
      }
    })
    return volume
  }, [workouts])

  // Last workout relative time
  const lastWorkoutTime = useMemo(() => {
    if (workouts.length === 0) return null
    const sorted = [...workouts].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    return formatRelativeTime(sorted[0].date)
  }, [workouts])

  // Form handlers
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
    setFormExercises(
      preset.exercises.map((ex, idx) => ({
        ...ex,
        order: idx,
      }))
    )
  }

  const handleAddExercise = () => {
    setFormExercises([...formExercises, emptyExercise(formExercises.length)])
  }

  const handleRemoveExercise = (index: number) => {
    if (formExercises.length <= 1) return
    setFormExercises(formExercises.filter((_, i) => i !== index))
  }

  const handleExerciseNameChange = (index: number, name: string) => {
    const updated = [...formExercises]
    updated[index] = { ...updated[index], name }
    setFormExercises(updated)
  }

  const handleSetChange = (
    exerciseIndex: number,
    setIndex: number,
    field: 'weight' | 'reps' | 'completed',
    value: number | boolean
  ) => {
    const updated = [...formExercises]
    const newSets = [...updated[exerciseIndex].sets]
    newSets[setIndex] = { ...newSets[setIndex], [field]: value }
    updated[exerciseIndex] = { ...updated[exerciseIndex], sets: newSets }
    setFormExercises(updated)
  }

  const handleSubmit = async () => {
    if (!formName.trim() || !formDate) return

    toast.dismiss()
    const exercises = formExercises
      .filter((ex) => ex.name.trim())
      .map((ex, idx) => ({
        name: ex.name.trim(),
        sets: ex.sets,
        order: idx,
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
      const json = await res.json()
      if (json.success) {
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

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const changeMonth = (direction: number) => {
    const [y, m] = month.split('-').map(Number)
    const newDate = new Date(y, m - 1 + direction, 1)
    setMonth(
      `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}`
    )
  }

  // ======================== Render ========================

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
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Добавить
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Новая тренировка</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              {/* Preset Templates */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Шаблоны</Label>
                <div className="grid grid-cols-2 gap-2">
                  {WORKOUT_PRESETS.map((preset) => {
                    const pType = detectWorkoutType(preset.name)
                    const pConfig = WORKOUT_TYPE_CONFIG[pType]
                    return (
                      <Button
                        key={preset.label}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-auto py-2.5 flex-col gap-1 text-center hover:bg-muted/50"
                        onClick={() => handleApplyPreset(preset)}
                      >
                        <span className="text-muted-foreground">{pConfig.icon}</span>
                        <span className="text-xs font-medium">{preset.label}</span>
                      </Button>
                    )
                  })}
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Название</Label>
                  <Input
                    placeholder="Тренировка груди"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Дата</Label>
                  <Input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Длительность (мин)</Label>
                <Input
                  type="number"
                  placeholder="60"
                  value={formDuration}
                  onChange={(e) => setFormDuration(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Заметки</Label>
                <Textarea
                  placeholder="Как прошла тренировка..."
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  rows={2}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Упражнения</Label>
                  <Button variant="outline" size="sm" onClick={handleAddExercise}>
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Добавить
                  </Button>
                </div>

                {formExercises.map((exercise, exIdx) => (
                  <Card key={exIdx} className="border-dashed">
                    <CardContent className="pt-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground w-5">
                          {exIdx + 1}.
                        </span>
                        <Input
                          placeholder="Название упражнения"
                          value={exercise.name}
                          onChange={(e) =>
                            handleExerciseNameChange(exIdx, e.target.value)
                          }
                          className="flex-1"
                        />
                        {formExercises.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                            onClick={() => handleRemoveExercise(exIdx)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2 pl-7">
                        <div className="text-xs text-muted-foreground font-medium">Подход</div>
                        <div className="text-xs text-muted-foreground font-medium">Вес (кг)</div>
                        <div className="text-xs text-muted-foreground font-medium">Повторения</div>
                        {exercise.sets.map((set, setIdx) => (
                          <div key={setIdx} className="contents">
                            <span className="text-xs text-muted-foreground flex items-center">
                              {setIdx + 1}
                            </span>
                            <Input
                              type="number"
                              value={set.weight || ''}
                              onChange={(e) =>
                                handleSetChange(
                                  exIdx,
                                  setIdx,
                                  'weight',
                                  Number(e.target.value)
                                )
                              }
                              placeholder="0"
                              className="h-8 text-sm"
                            />
                            <Input
                              type="number"
                              value={set.reps || ''}
                              onChange={(e) =>
                                handleSetChange(
                                  exIdx,
                                  setIdx,
                                  'reps',
                                  Number(e.target.value)
                                )
                              }
                              placeholder="10"
                              className="h-8 text-sm"
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button className="w-full" onClick={handleSubmit} disabled={!formName.trim() || !formDate}>
                Сохранить тренировку
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 stagger-children">
        <Card className="card-hover py-4">
          <CardContent className="flex items-center gap-3 px-4 py-0">
            <div className="h-10 w-10 rounded-lg bg-rose-100 flex items-center justify-center">
              <Dumbbell className="h-5 w-5 text-rose-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalWorkouts}</p>
              <p className="text-xs text-muted-foreground">Тренировок</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover py-4">
          <CardContent className="flex items-center gap-3 px-4 py-0">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalMinutes}</p>
              <p className="text-xs text-muted-foreground">Минут всего</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover py-4">
          <CardContent className="flex items-center gap-3 px-4 py-0">
            <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Flame className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{avgDuration}</p>
              <p className="text-xs text-muted-foreground">Среднее (мин)</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover py-4">
          <CardContent className="flex items-center gap-3 px-4 py-0">
            <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Trophy className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalExercises}</p>
              <p className="text-xs text-muted-foreground">Упражнений</p>
            </div>
          </CardContent>
        </Card>
        {/* Total Volume Card */}
        <Card className="card-hover py-4 border-t-4 border-t-violet-500">
          <CardContent className="flex items-center gap-3 px-4 py-0">
            <div className="h-10 w-10 rounded-lg bg-violet-100 flex items-center justify-center">
              <Weight className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">{formatVolume(totalVolume)}</p>
              <p className="text-xs text-muted-foreground">Объём (сила)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Month Selector */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => changeMonth(-1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium min-w-[160px] text-center">
          {formatMonth(month)}
        </span>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => changeMonth(1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

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
            <p className="text-muted-foreground text-sm mt-1">
              Добавьте первую тренировку за этот месяц
            </p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="max-h-[600px]">
          <div className="space-y-3">
            {workouts.map((workout) => {
              const isExpanded = expandedId === workout.id
              const borderColor = getWorkoutBorderColor(workout.name)
              const workoutType = detectWorkoutType(workout.name)
              const typeConfig = WORKOUT_TYPE_CONFIG[workoutType]

              // Calculate per-workout volume
              const workoutVolume = workout.exercises.reduce((sum, ex) => {
                if (workoutType === 'strength') {
                  const sets = parseSets(ex.sets)
                  return sum + calculateVolume(sets)
                }
                return sum
              }, 0)

              return (
                <Card
                  key={workout.id}
                  className={`card-hover border-l-4 ${borderColor} ${typeConfig.topBorderColor} hover:shadow-sm transition cursor-pointer`}
                  onClick={() => toggleExpand(workout.id)}
                >
                  <CardHeader className="pb-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {/* Workout Type Icon */}
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          workoutType === 'strength' ? 'bg-rose-100 text-rose-600' :
                          workoutType === 'cardio' ? 'bg-purple-100 text-purple-600' :
                          workoutType === 'hiit' ? 'bg-orange-100 text-orange-600' :
                          'bg-emerald-100 text-emerald-600'
                        }`}>
                          {typeConfig.icon}
                        </div>
                        <CardTitle className="text-base">{workout.name}</CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          {workout.exercises.length} упр.
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        {/* Duration */}
                        {workout.durationMin && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {workout.durationMin} мин
                          </span>
                        )}
                        {/* Volume for strength */}
                        {workoutType === 'strength' && workoutVolume > 0 && (
                          <span className="flex items-center gap-1 text-xs font-medium text-violet-600">
                            <Weight className="h-3 w-3" />
                            {formatVolume(workoutVolume)}
                          </span>
                        )}
                        <span>{formatDate(workout.date)}</span>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  {isExpanded && (
                    <CardContent className="pt-2 space-y-4">
                      {workout.note && (
                        <p className="text-sm text-muted-foreground italic">
                          {workout.note}
                        </p>
                      )}
                      {workout.exercises.length > 0 ? (
                        <div className="space-y-3">
                          {workout.exercises.map((exercise) => {
                            const sets = parseSets(exercise.sets)
                            return (
                              <div key={exercise.id} className="rounded-lg bg-muted/50 p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">
                                    {exercise.name}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatSetSummary(sets)}
                                  </span>
                                </div>
                                {sets.length > 0 && (
                                  <div className="flex gap-2 flex-wrap">
                                    {sets.map((set, idx) => (
                                      <div
                                        key={idx}
                                        className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs ${
                                          set.completed
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-background text-muted-foreground'
                                        }`}
                                      >
                                        <span className="font-medium">
                                          {idx + 1}
                                        </span>
                                        <Separator orientation="vertical" className="h-3" />
                                        <span>
                                          {set.weight}кг × {set.reps}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Нет упражнений
                        </p>
                      )}
                    </CardContent>
                  )}
                </Card>
              )
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
