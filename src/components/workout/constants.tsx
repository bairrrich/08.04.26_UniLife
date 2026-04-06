import {
  Dumbbell,
  Clock,
  Flame,
  StretchHorizontal,
  Heart,
  Wind,
  Zap,
  Activity,
} from 'lucide-react'
import type { ExerciseData } from './types'

// ─── Workout Type Detection ─────────────────────────────────────────────────

export type WorkoutType = 'strength' | 'cardio' | 'hiit' | 'stretch' | 'flexibility' | 'calisthenics' | 'other'

export function detectWorkoutType(name: string): WorkoutType {
  const lower = name.toLowerCase()
  if (lower.includes('кардио') || lower.includes('cardio') || lower.includes('бег') || lower.includes('ходьба') || lower.includes('пробеж')) return 'cardio'
  if (lower.includes('hiit') || lower.includes('интервал') || lower.includes('табата')) return 'hiit'
  if (lower.includes('растяж') || lower.includes('йога') || lower.includes('stretch') || lower.includes('размин')) return 'stretch'
  if (lower.includes('вес собственного') || lower.includes('турник') || lower.includes('брусья') || lower.includes('calisthenics') || lower.includes('отжиман')) return 'calisthenics'
  return 'strength'
}

export const WORKOUT_TYPE_CONFIG: Record<string, {
  icon: React.ReactNode
  topBorderColor: string
  label: string
  iconBg: string
  iconColor: string
}> = {
  strength: { icon: <Dumbbell className="h-4 w-4" />, topBorderColor: 'border-t-rose-400', label: 'Силовая', iconBg: 'bg-rose-100 dark:bg-rose-900/50', iconColor: 'text-rose-600 dark:text-rose-400' },
  cardio: { icon: <Heart className="h-4 w-4" />, topBorderColor: 'border-t-purple-400', label: 'Кардио', iconBg: 'bg-purple-100 dark:bg-purple-900/50', iconColor: 'text-purple-600 dark:text-purple-400' },
  hiit: { icon: <Flame className="h-4 w-4" />, topBorderColor: 'border-t-orange-400', label: 'HIIT', iconBg: 'bg-orange-100 dark:bg-orange-900/50', iconColor: 'text-orange-600 dark:text-orange-400' },
  stretch: { icon: <Wind className="h-4 w-4" />, topBorderColor: 'border-t-emerald-400', label: 'Растяжка', iconBg: 'bg-emerald-100 dark:bg-emerald-900/50', iconColor: 'text-emerald-600 dark:text-emerald-400' },
  flexibility: { icon: <Wind className="h-4 w-4" />, topBorderColor: 'border-teal-400', label: 'Гибкость', iconBg: 'bg-teal-100 dark:bg-teal-900/50', iconColor: 'text-teal-600 dark:text-teal-400' },
  calisthenics: { icon: <Activity className="h-4 w-4" />, topBorderColor: 'border-cyan-400', label: 'Калистеника', iconBg: 'bg-cyan-100 dark:bg-cyan-900/50', iconColor: 'text-cyan-600 dark:text-cyan-400' },
  other: { icon: <Zap className="h-4 w-4" />, topBorderColor: 'border-gray-400', label: 'Другое', iconBg: 'bg-gray-100 dark:bg-gray-900/50', iconColor: 'text-gray-600 dark:text-gray-400' },
}

// ─── Preset Templates ───────────────────────────────────────────────────────

export const WORKOUT_PRESETS: {
  label: string
  name: string
  duration: number
  exercises: ExerciseData[]
}[] = [
  {
    label: 'Утренняя пробежка',
    name: 'Утренняя пробежка',
    duration: 30,
    exercises: [
      { name: 'Бег', sets: [{ weight: 0, reps: 1, completed: false }], order: 0 },
      { name: 'Прыжки со скакалкой', sets: [{ weight: 0, reps: 3, completed: false }], order: 1 },
      { name: 'Велотренажёр', sets: [{ weight: 0, reps: 1, completed: false }], order: 2 },
    ],
  },
  {
    label: 'Силовая тренировка',
    name: 'Силовая тренировка',
    duration: 60,
    exercises: [
      { name: 'Жим штанги', sets: [{ weight: 60, reps: 10, completed: false }, { weight: 60, reps: 10, completed: false }, { weight: 60, reps: 8, completed: false }], order: 0 },
      { name: 'Приседания', sets: [{ weight: 80, reps: 10, completed: false }, { weight: 80, reps: 10, completed: false }, { weight: 80, reps: 8, completed: false }], order: 1 },
      { name: 'Подтягивания', sets: [{ weight: 0, reps: 8, completed: false }, { weight: 0, reps: 8, completed: false }, { weight: 0, reps: 6, completed: false }], order: 2 },
      { name: 'Тяга верхнего блока', sets: [{ weight: 50, reps: 12, completed: false }, { weight: 50, reps: 12, completed: false }], order: 3 },
    ],
  },
  {
    label: 'Растяжка',
    name: 'Растяжка',
    duration: 20,
    exercises: [
      { name: 'Наклоны к ногам', sets: [{ weight: 0, reps: 1, completed: false }], order: 0 },
      { name: 'Растяжка бёдер', sets: [{ weight: 0, reps: 1, completed: false }], order: 1 },
      { name: 'Поза ребёнка', sets: [{ weight: 0, reps: 1, completed: false }], order: 2 },
      { name: 'Поза кобры', sets: [{ weight: 0, reps: 1, completed: false }], order: 3 },
    ],
  },
  {
    label: 'HIIT',
    name: 'HIIT тренировка',
    duration: 25,
    exercises: [
      { name: 'Бёрпи', sets: [{ weight: 0, reps: 15, completed: false }, { weight: 0, reps: 15, completed: false }, { weight: 0, reps: 15, completed: false }], order: 0 },
      { name: 'Выпады с прыжком', sets: [{ weight: 0, reps: 20, completed: false }, { weight: 0, reps: 20, completed: false }], order: 1 },
      { name: 'Отжимания', sets: [{ weight: 0, reps: 20, completed: false }, { weight: 0, reps: 20, completed: false }], order: 2 },
      { name: 'Планка', sets: [{ weight: 0, reps: 1, completed: false }], order: 3 },
    ],
  },
]

// ─── Helpers ────────────────────────────────────────────────────────────────

export function emptyExercise(index: number): ExerciseData {
  return {
    id: crypto.randomUUID(),
    name: '',
    sets: [
      { weight: 0, reps: 10, completed: false },
      { weight: 0, reps: 10, completed: false },
      { weight: 0, reps: 10, completed: false },
    ],
    order: index,
  }
}

export function parseSets(setsJson: string): import('./types').SetData[] {
  try {
    return JSON.parse(setsJson)
  } catch {
    return []
  }
}

export function formatSetSummary(sets: import('./types').SetData[]): string {
  if (!sets || sets.length === 0) return ''
  const completedSets = sets.filter((s) => s.completed)
  if (completedSets.length === 0) return `${sets.length} подходов`
  const avgReps = Math.round(completedSets.reduce((a, s) => a + s.reps, 0) / completedSets.length)
  const avgWeight = Math.round(completedSets.reduce((a, s) => a + s.weight, 0) / completedSets.length)
  return `${sets.length}×${avgReps} @ ${avgWeight}кг`
}

export function calculateVolume(sets: import('./types').SetData[]): number {
  if (!sets || sets.length === 0) return 0
  return sets.filter((s) => s.completed).reduce((sum, s) => sum + (s.weight * s.reps), 0)
}

export function formatVolume(volume: number): string {
  if (volume >= 1000) return `${(volume / 1000).toFixed(1)}т`
  return `${volume}кг`
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

export function getWorkoutBorderColor(name: string): string {
  const lower = name.toLowerCase()
  if (lower.includes('груд') || lower.includes('chest')) return 'border-l-rose-400'
  if (lower.includes('спин') || lower.includes('back')) return 'border-l-blue-400'
  if (lower.includes('ног') || lower.includes('leg')) return 'border-l-emerald-400'
  if (lower.includes('плеч') || lower.includes('shoulder')) return 'border-l-amber-400'
  if (lower.includes('кардио') || lower.includes('cardio') || lower.includes('бег') || lower.includes('пробеж')) return 'border-l-purple-400'
  if (lower.includes('рука') || lower.includes('arm')) return 'border-l-orange-400'
  if (lower.includes('hiit') || lower.includes('интервал')) return 'border-l-orange-400'
  if (lower.includes('растяж') || lower.includes('йога') || lower.includes('stretch')) return 'border-l-emerald-400'
  return 'border-l-teal-400'
}

// ─── Workout Motivational Phrases ───────────────────────────────────────────

export const WORKOUT_PHRASES = [
  'Тренировка — лучшее вложение в своё тело!',
  'Начни с малого — и постепенно достигай большего',
  'Каждая тренировка делает тебя сильнее',
  'Дисциплина — ключ к результатам',
]
