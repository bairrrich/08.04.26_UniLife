import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { DEMO_USER_ID, apiSuccess, apiError, apiServerError } from '@/lib/api'

export async function GET() {
  try {
    const recurring = await db.recurringTransaction.findMany({
      where: { userId: DEMO_USER_ID },
      include: {
        category: {
          select: { id: true, name: true, icon: true, color: true, type: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    return apiSuccess(recurring)
  } catch (error) {
    console.error('GET /api/finance/recurring error:', error)
    return apiServerError('Failed to fetch recurring transactions')
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, amount, categoryId, description, note, frequency, startDate } = body

    if (!type || !['INCOME', 'EXPENSE'].includes(type)) {
      return apiError('Valid type (INCOME/EXPENSE) is required')
    }
    if (!amount || parseFloat(amount) <= 0) {
      return apiError('Amount must be positive')
    }
    if (!categoryId) {
      return apiError('Category is required')
    }
    if (!frequency || !['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'].includes(frequency)) {
      return apiError('Valid frequency (DAILY/WEEKLY/MONTHLY/YEARLY) is required')
    }

    const nextDate = startDate ? new Date(startDate) : new Date()

    const recurring = await db.recurringTransaction.create({
      data: {
        userId: DEMO_USER_ID,
        type,
        amount: parseFloat(amount),
        categoryId,
        description: description || null,
        note: note || null,
        frequency,
        nextDate,
      },
      include: {
        category: {
          select: { id: true, name: true, icon: true, color: true, type: true },
        },
      },
    })

    return apiSuccess(recurring, 201)
  } catch (error) {
    console.error('POST /api/finance/recurring error:', error)
    return apiServerError('Failed to create recurring transaction')
  }
}
