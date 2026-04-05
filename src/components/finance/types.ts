// ─── Finance Module Types ───────────────────────────────────────────────────

export interface Category {
  id: string
  name: string
  type: string
  icon: string
  color: string
}

export interface Account {
  id: string
  name: string
  type: string // CASH | BANK | SAVINGS | INVESTMENT | CRYPTO
  icon: string
  color: string
  balance: number
  currency: string
  isDefault: boolean
}

export interface Transaction {
  id: string
  type: string // INCOME | EXPENSE | TRANSFER
  amount: number
  currency: string
  categoryId: string
  subCategoryId?: string | null
  date: string
  description?: string | null
  note?: string | null
  fromAccountId?: string | null
  toAccountId?: string | null
  fromAccount?: Account | null
  toAccount?: Account | null
  category?: Category
  subCategory?: { id: string; name: string; icon: string } | null
}

export interface StatsResponse {
  totalIncome: number
  totalExpense: number
  totalTransfers: number
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
  transfer: number
}

// ─── Investment Types ──────────────────────────────────────────────────────

export interface Investment {
  id: string
  name: string
  type: string // STOCK | BOND | FUND | CRYPTO | DEPOSIT | METAL | OTHER
  icon: string
  color: string
  targetAmount?: number | null
  description?: string | null
  createdAt: string
  updatedAt: string
  transactions?: InvestmentTx[]
  // Computed
  totalInvested?: number
  totalReturned?: number
  totalUnits?: number
  profit?: number
}

export interface InvestmentTx {
  id: string
  investmentId: string
  type: string // BUY | SELL | DEPOSIT | WITHDRAWAL | DIVIDEND
  amount: number
  units?: number | null
  pricePerUnit?: number | null
  date: string
  note?: string | null
  createdAt: string
}

export interface InvestmentsResponse {
  investments: Investment[]
  totalInvested: number
  totalReturned: number
  totalProfit: number
}
