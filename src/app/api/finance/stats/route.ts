import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { DEMO_USER_ID, apiSuccess, apiServerError } from '@/lib/api'

// GET /api/finance/stats — Financial summary for a given month
// Query params: ?month=YYYY-MM (defaults to current month)
// Returns: { totalIncome, totalExpense, balance, savingsRate, byCategory: [...] }
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const monthParam = searchParams.get('month')

    const now = new Date()
    let year = now.getFullYear()
    let month = now.getMonth()

    if (monthParam) {
      const [y, m] = monthParam.split('-').map(Number)
      if (y && m) {
        year = y
        month = m - 1
      }
    }

    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999)

    // Fetch all transactions for the month with category info
    const transactions = await db.transaction.findMany({
      where: {
        userId: DEMO_USER_ID,
        date: { gte: startDate, lte: endDate },
      },
      include: {
        category: true,
      },
    })

    // Compute totals
    let totalIncome = 0
    let totalExpense = 0
    const categoryMap = new Map<
      string,
      {
        categoryId: string
        categoryName: string
        categoryColor: string
        total: number
      }
    >()

    for (const t of transactions) {
      if (t.type === 'INCOME') {
        totalIncome += t.amount
      } else if (t.type === 'EXPENSE') {
        totalExpense += t.amount

        const existing = categoryMap.get(t.categoryId)
        if (existing) {
          existing.total += t.amount
        } else {
          categoryMap.set(t.categoryId, {
            categoryId: t.categoryId,
            categoryName: t.category.name,
            categoryColor: t.category.color,
            total: t.amount,
          })
        }
      }
    }

    const balance = totalIncome - totalExpense
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0
    const byCategory = Array.from(categoryMap.values()).sort((a, b) => b.total - a.total)

    return apiSuccess({
      period: { year, month: month + 1 },
      totalIncome,
      totalExpense,
      balance,
      savingsRate,
      byCategory,
    })
  } catch (error) {
    console.error('GET /api/finance/stats error:', error)
    return apiServerError('Failed to fetch financial stats')
  }
}
