// ─── Types ────────────────────────────────────────────────────────────────────

export interface DiaryEntry {
  id: string
  date: string
  mood: number | null
  title: string | null
  createdAt?: string
  content?: string
}

export interface Transaction {
  id: string
  date: string
  amount: number
  type: string
  createdAt?: string
  category?: {
    name: string
    color: string
    icon: string
  } | null
}

export interface NutritionDay {
  date: string
  totalKcal: number
  totalProtein: number
  totalFat: number
  totalCarbs: number
}

export interface MealEntry {
  id: string
  date: string
  createdAt?: string
  type: string
}

export interface Workout {
  id: string
  name: string
  date: string
  durationMin: number | null
  createdAt?: string
}

export interface HabitItem {
  id: string
  name: string
  emoji: string
  todayCompleted: boolean
  streak: number
  last7Days: Record<string, boolean>
}

export interface NutritionSummary {
  avgKcal: number
  avgProtein: number
  avgFat: number
  avgCarbs: number
  daysWithData: number
}

export interface ActivityStats {
  totalActions: number
  avgDaily: string
  mostActiveDay: string
  mostActiveModule: string
  sparkline?: number[]
  mostProductiveDay?: string
}

export interface MoodChartDataPoint {
  label: string
  mood: number
  fullLabel: string
}

export interface SpendingChartDataPoint {
  label: string
  spending: number
  income: number
}

export interface WorkoutDistributionPoint {
  name: string
  value: number
  fill: string
}

export interface TopCategoryPoint {
  name: string
  amount: number
  fill: string
}

export interface HabitsHeatmapCell {
  date: string
  completed: boolean
  day: number
  completedCount?: number
  totalCount?: number
  dayOfWeek?: number
}

// ─── New Analytics Types ──────────────────────────────────────────────────────

export interface WeeklyActivityCell {
 date: string
  day: number
  dayOfWeek: number
  dayLabel: string
  diary: number
  workouts: number
  meals: number
  habitsCompleted: number
  total: number
}

export interface ModuleStreak {
 module: string
  emoji: string
  streak: number
  color: string
  bgColor: string
  darkBgColor: string
}

export interface TimeOfDayPoint {
  period: string
  count: number
  fill: string
}

export interface MoodTrendPoint {
  date: string
  label: string
  mood: number
  weekAvg: number | null
}
