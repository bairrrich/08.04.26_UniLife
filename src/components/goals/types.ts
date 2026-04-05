// ─── Goals Types ─────────────────────────────────────────────────────────────

export interface Milestone {
  id: string
  title: string
  completed: boolean
}

export interface GoalData {
  id: string
  title: string
  description: string | null
  category: string
  targetValue: number | null
  currentValue: number
  unit: string | null
  deadline: string | null
  startDate: string | null
  priority: string | null
  status: string
  progress: number
  milestones: string | null  // JSON string of Milestone[]
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

export type FilterTab = 'all' | 'active' | 'completed' | 'paused'

export type CategoryFilter = 'all' | 'personal' | 'health' | 'finance' | 'career' | 'learning'
