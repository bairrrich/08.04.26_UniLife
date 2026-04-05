// ─── Habits Types ─────────────────────────────────────────────────────────────

export interface HabitData {
  id: string
  name: string
  emoji: string
  color: string
  frequency: string
  targetCount: number
  category: string
  todayCompleted: boolean
  streak: number
  bestStreak: number
  last7Days: Record<string, boolean>
  lastMonthDays: Record<string, boolean>
  createdAt: string
  archived: boolean
}

export interface HabitsResponse {
  success: boolean
  data: HabitData[]
  stats: {
    totalActive: number
    completedToday: number
    bestStreak: number
  }
}
