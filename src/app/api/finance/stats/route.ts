import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

const DEMO_USER_ID = 'user_demo_001'

// GET /api/finance/stats — Financial summary for the current month
// Returns: { totalIncome, totalExpense, balance, byCategory: [...] }
export async function GET() {
  try {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()

    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999)

    // Fetch all transactions for the current month with category info
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

        // Aggregate by category for expenses
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
    const byCategory = Array.from(categoryMap.values()).sort((a, b) => b.total - a.total)

    return NextResponse.json({
      period: { year, month: month + 1 },
      totalIncome,
      totalExpense,
      balance,
      byCategory,
    })
  } catch (error) {
    console.error('GET /api/finance/stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch financial stats' },
      { status: 500 },
    )
  }
}
