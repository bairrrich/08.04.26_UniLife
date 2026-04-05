'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Plus, Trash2, Timer, Sparkles } from 'lucide-react'
import {
  WORKOUT_PRESETS,
  detectWorkoutType,
  WORKOUT_TYPE_CONFIG,
  emptyExercise,
} from './constants'
import type { ExerciseData } from './types'

// ─── Exercise Type Presets ──────────────────────────────────────────────────

const EXERCISE_TYPE_PRESETS = [
  { label: 'Сила', emoji: '🏋️', type: 'strength' as const },
  { label: 'Кардио', emoji: '💪', type: 'cardio' as const },
  { label: 'Растяжка', emoji: '🧘', type: 'stretch' as const },
  { label: 'HIIT', emoji: '⚡', type: 'hiit' as const },
]

const WORKOUT_NAME_PRESETS = [
  { label: 'Сила', emoji: '💪', prefix: 'Сила 💪' },
  { label: 'Кардио', emoji: '🏃', prefix: 'Кардио 🏃' },
  { label: 'Растяжка', emoji: '🧘', prefix: 'Растяжка 🧘' },
  { label: 'HIIT', emoji: '⚡', prefix: 'HIIT ⚡' },
]

// ─── Day-of-Week Workout Suggestions ─────────────────────────────────────────

const DAY_WORKOUT_SUGGESTIONS: Record<number, string> = {
  0: 'Воскресенье: Активный отдых',
  1: 'Понедельник: Грудь и трицепс',
  2: 'Вторник: Спина и бицепс',
  3: 'Среда: Ноги и ягодицы',
  4: 'Четверг: Плечи и пресс',
  5: 'Пятница: Кардио и растяжка',
  6: 'Суббота: Полное тело',
}

// ─── Shared Exercise Editor ─────────────────────────────────────────────────

function ExerciseEditor({
  exercises,
  onExercisesChange,
}: {
  exercises: ExerciseData[]
  onExercisesChange: (exercises: ExerciseData[]) => void
}) {
  const addExercise = () => onExercisesChange([...exercises, emptyExercise(exercises.length)])
  const removeExercise = (index: number) => {
    if (exercises.length <= 1) return
    onExercisesChange(exercises.filter((_, i) => i !== index))
  }
  const updateName = (index: number, name: string) => {
    const updated = [...exercises]
    updated[index] = { ...updated[index], name }
    onExercisesChange(updated)
  }
  const updateSet = (exerciseIndex: number, setIndex: number, field: 'weight' | 'reps' | 'completed', value: number | boolean) => {
    const updated = [...exercises]
    const newSets = [...updated[exerciseIndex].sets]
    newSets[setIndex] = { ...newSets[setIndex], [field]: value }
    updated[exerciseIndex] = { ...updated[exerciseIndex], sets: newSets }
    onExercisesChange(updated)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Упражнения</Label>
        <Button variant="outline" size="sm" onClick={addExercise}>
          <Plus className="h-3.5 w-3.5 mr-1" />
          Добавить
        </Button>
      </div>

      {/* Exercise type quick presets */}
      <div className="flex gap-2">
        {EXERCISE_TYPE_PRESETS.map((preset) => {
          const config = WORKOUT_TYPE_CONFIG[preset.type]
          return (
            <button
              key={preset.type}
              type="button"
              onClick={() => onExercisesChange([...exercises, { ...emptyExercise(exercises.length), name: `${preset.label} #${exercises.length + 1}` }])}
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-muted/60 active-press ${config.iconBg}`}
            >
              <span>{preset.emoji}</span>
              <span>{preset.label}</span>
            </button>
          )
        })}
      </div>

      {exercises.map((exercise, exIdx) => (
        <Card key={exIdx} className="border-dashed">
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground w-5">{exIdx + 1}.</span>
              <Input
                placeholder="Название упражнения"
                value={exercise.name}
                onChange={(e) => updateName(exIdx, e.target.value)}
                className="flex-1"
              />
              {exercises.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeExercise(exIdx)}
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
                  <span className="text-xs text-muted-foreground flex items-center">{setIdx + 1}</span>
                  <Input
                    type="number"
                    value={set.weight || ''}
                    onChange={(e) => updateSet(exIdx, setIdx, 'weight', Number(e.target.value))}
                    placeholder="0"
                    className="h-8 text-sm"
                  />
                  <Input
                    type="number"
                    value={set.reps || ''}
                    onChange={(e) => updateSet(exIdx, setIdx, 'reps', Number(e.target.value))}
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
  )
}

// ─── Add Workout Dialog ─────────────────────────────────────────────────────

interface WorkoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  formName: string
  formDate: string
  formDuration: string
  formNote: string
  formExercises: ExerciseData[]
  onNameChange: (val: string) => void
  onDateChange: (val: string) => void
  onDurationChange: (val: string) => void
  onNoteChange: (val: string) => void
  onExercisesChange: (exercises: ExerciseData[]) => void
  onSubmit: () => void
  onApplyPreset: (preset: typeof WORKOUT_PRESETS[0]) => void
  title: string
  submitLabel: string
  showPresets?: boolean
}

export function WorkoutDialog({
  open,
  onOpenChange,
  formName,
  formDate,
  formDuration,
  formNote,
  formExercises,
  onNameChange,
  onDateChange,
  onDurationChange,
  onNoteChange,
  onExercisesChange,
  onSubmit,
  onApplyPreset,
  title,
  submitLabel,
  showPresets,
}: WorkoutDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          {showPresets && (
            <>
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
                        onClick={() => onApplyPreset(preset)}
                      >
                        <span className="text-muted-foreground">{pConfig.icon}</span>
                        <span className="text-xs font-medium">{preset.label}</span>
                      </Button>
                    )
                  })}
                </div>
              </div>
              <Separator />
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Название</Label>
                <button
                  type="button"
                  onClick={() => onNameChange(DAY_WORKOUT_SUGGESTIONS[new Date().getDay()] || '')}
                  className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Sparkles className="h-3 w-3" />
                  Предложение дня
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-1.5">
                {WORKOUT_NAME_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      const currentName = formName.replace(/^(Сила 💪|Кардио 🏃|Растяжка 🧘|HIIT ⚡)\s*/, '').trim()
                      onNameChange(`${preset.prefix}${currentName ? ` ${currentName}` : ''}`)
                    }}
                    className="inline-flex items-center gap-1 rounded-full border bg-muted/30 px-2.5 py-1 text-xs font-medium transition-colors hover:bg-muted/60 active-press"
                  >
                    <span>{preset.emoji}</span>
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
              <Input placeholder="Тренировка груди" value={formName} onChange={(e) => onNameChange(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Дата</Label>
              <Input type="date" value={formDate} onChange={(e) => onDateChange(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Длительность (мин)</Label>
              <Input type="number" placeholder="60" value={formDuration} onChange={(e) => onDurationChange(e.target.value)} />
            </div>
            <div className="flex items-end pb-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Timer className="h-3.5 w-3.5" />
                <span>Расчётное время: ~{Math.max(formExercises.length, 0) * 5} мин</span>
                <span className="text-[10px] text-muted-foreground/60">(~5 мин/упр.)</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Заметки</Label>
            <Textarea placeholder="Как прошла тренировка..." value={formNote} onChange={(e) => onNoteChange(e.target.value)} rows={2} />
          </div>

          <Separator />
          <ExerciseEditor exercises={formExercises} onExercisesChange={onExercisesChange} />

          <Button className="w-full" onClick={onSubmit} disabled={!formName.trim() || !formDate}>
            {submitLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
