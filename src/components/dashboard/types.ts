// ─── Dashboard Types ────────────────────────────────────────────────────────────

export interface DiaryEntry {
  id: string
  date: string
  mood: number | null
  title: string | null
}

export interface FinanceStats {
  totalIncome: number
  totalExpense: number
  balance: number
  byCategory: { categoryName: string; categoryColor: string; total: number }[]
}

export interface NutritionStats {
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

export interface FeedPost {
  id: string
  entityType: string
  entityId: string
  caption: string | null
  createdAt: string
  user: { name: string; avatar: string | null }
  _count: { likes: number; comments: number }
}

export interface Transaction {
  id: string
  date: string
  amount: number
  type: string
}

export interface HabitItem {
  id: string
  name: string
  emoji: string
  todayCompleted: boolean
  streak: number
  last7Days?: Record<string, boolean>
}

export interface BudgetCategory {
  id: string
  categoryId: string
  categoryName: string
  categoryIcon: string
  categoryColor: string
  amount: number
  spent: number
  percentage: number
}

export interface BudgetData {
  budgets: BudgetCategory[]
  totalBudget: number
  totalSpent: number
  totalRemaining: number
  totalPercentage: number
}
