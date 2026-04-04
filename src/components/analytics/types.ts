// ─── Types ────────────────────────────────────────────────────────────────────

export interface DiaryEntry {
  id: string
  date: string
  mood: number | null
  title: string | null
}

export interface Transaction {
  id: string
  date: string
  amount: number
  type: string
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

export interface Workout {
  id: string
  name: string
  date: string
  durationMin: number | null
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
