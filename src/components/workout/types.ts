// ─── Workout Module Types ───────────────────────────────────────────────────

export interface SetData {
  weight: number
  reps: number
  completed: boolean
}

export interface ExerciseData {
  id?: string
  name: string
  sets: SetData[]
  order: number
}

export interface Workout {
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

export type WorkoutType = 'strength' | 'cardio' | 'hiit' | 'stretch'
