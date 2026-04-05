// ─── Finance Module Types ───────────────────────────────────────────────────

export interface Category {
  id: string
  name: string
  type: string
  icon: string
  color: string
}

export interface Transaction {
  id: string
  type: string
  amount: number
  currency: string
  categoryId: string
  subCategoryId?: string | null
  date: string
  description?: string | null
  note?: string | null
  category?: Category
  subCategory?: { id: string; name: string; icon: string } | null
}

export interface StatsResponse {
  totalIncome: number
  totalExpense: number
  balance: number
  savingsRate: number
  byCategory: CategoryStat[]
}

export interface CategoryStat {
  categoryId: string
  categoryName: string
  categoryColor: string
  categoryIcon: string
  total: number
}

export interface ChartDataPoint {
  day: string
  expense: number
  income: number
}
