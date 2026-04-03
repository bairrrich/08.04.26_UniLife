'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Dumbbell,
  Plus,
  Clock,
  Flame,
  ChevronDown,
  ChevronUp,
  Trash2,
  Trophy,
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

  // Form handlers
  const resetForm = () => {
    setFormName('')
    setFormDate(new Date().toISOString().split('T')[0])
    setFormDuration('')
    setFormNote('')
    setFormExercises([emptyExercise(0)])
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Dumbbell className="h-6 w-6" />
            Тренировки
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Журнал упражнений и тренировок
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="py-4">
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
        <Card className="py-4">
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
        <Card className="py-4">
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
        <Card className="py-4">
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
      </div>

      {/* Month Selector */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => changeMonth(-1)}>
          <ChevronUp className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium min-w-[160px] text-center">
          {formatMonth(month)}
        </span>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => changeMonth(1)}>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>

      {/* Workout List */}
      {loading ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground text-sm">
            Загрузка...
          </CardContent>
        </Card>
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

              return (
                <Card
                  key={workout.id}
                  className={`border-l-4 ${borderColor} hover:shadow-sm transition cursor-pointer`}
                  onClick={() => toggleExpand(workout.id)}
                >
                  <CardHeader className="pb-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-base">{workout.name}</CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          {workout.exercises.length} упр.
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        {workout.durationMin && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {workout.durationMin} мин
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
