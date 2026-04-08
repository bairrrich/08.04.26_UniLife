// ─── Achievement Types ────────────────────────────────────────────────────────

export type AchievementCategory =
  | 'diary'
  | 'finance'
  | 'workout'
  | 'habits'
  | 'nutrition'
  | 'collections'
  | 'goals'
  | 'feed'
  | 'general'

export interface Achievement {
  /** Unique identifier (e.g. "first_diary_entry") */
  id: string
  /** Display name */
  name: string
  /** Short description */
  description: string
  /** Emoji icon */
  icon: string
  /** Gradient colors for the badge circle */
  gradient: string
  /** Module category */
  category: AchievementCategory
  /** Category label in Russian */
  categoryLabel: string
  /** Whether the achievement is earned (computed at runtime) */
  earned: boolean
  /** ISO date string when earned */
  earnedAt: string | null
  /** Whether this was just earned (for animation) */
  newlyEarned?: boolean
  /** Target threshold value (e.g. 7 for "7 day streak") */
  threshold?: number
  /** Current progress toward the threshold */
  current?: number
}

/** Context data passed to the achievement evaluator */
export interface AchievementContext {
  diaryEntries: { id: string; date: string; mood: number | null; title: string | null }[]
  financeStats: {
    totalIncome: number
    totalExpense: number
    savingsRate: number | null
  } | null
  transactionsCount: number
  transactionsData: { id: string; date: string; amount: number; type: string }[]
  workouts: { id: string; date: string; durationMin: number | null }[]
  habitsData: {
    data: { id: string; name: string; todayCompleted: boolean; streak: number; last7Days?: Record<string, boolean> }[]
    stats: { totalActive: number; completedToday: number; bestStreak: number }
  } | null
  nutritionStats: {
    totalKcal: number
    totalProtein: number
    totalFat: number
    totalCarbs: number
  } | null
  waterTodayMl: number
  hasMealsToday: boolean
  todayMood: number | null
  todayWorkoutDone: boolean
  allHabitsCompleted: boolean
}

/** Persisted achievement from the API */
export interface PersistedAchievement {
  id: string
  key: string
  title: string
  description: string
  icon: string
  category: string
  earnedAt: string
}
