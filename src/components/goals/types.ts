// ─── Goals Types ─────────────────────────────────────────────────────────────

export interface GoalData {
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

export interface GoalsResponse {
  success: boolean
  data: GoalData[]
  stats: {
    totalGoals: number
    completedGoals: number
    avgProgress: number
  }
}

export type FilterTab = 'all' | 'active' | 'completed'
