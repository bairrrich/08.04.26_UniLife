import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { DEMO_USER_ID, apiSuccess, apiError, apiServerError } from '@/lib/api'

function getNextDate(date: Date, frequency: string): Date {
  const next = new Date(date)
  switch (frequency) {
    case 'DAILY':
      next.setDate(next.getDate() + 1)
      break
    case 'WEEKLY':
      next.setDate(next.getDate() + 7)
      break
    case 'MONTHLY':
      next.setMonth(next.getMonth() + 1)
      break
    case 'YEARLY':
      next.setFullYear(next.getFullYear() + 1)
      break
  }
  return next
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { recurringId } = body

    if (!recurringId) {
      return apiError('recurringId is required')
    }

    const recurring = await db.recurringTransaction.findUnique({
      where: { id: recurringId },
      include: { category: true },
    })

    if (!recurring) {
      return apiError('Recurring transaction not found', 404)
    }

    if (!recurring.isActive) {
      return apiError('Recurring transaction is inactive')
    }

    // Create the actual transaction
    const transaction = await db.transaction.create({
      data: {
        userId: DEMO_USER_ID,
        type: recurring.type,
        amount: recurring.amount,
        currency: 'RUB',
        categoryId: recurring.categoryId,
        date: recurring.nextDate,
        description: recurring.description || `${recurring.category.name} (повторяющаяся)`,
        note: recurring.note || null,
        isRecurring: true,
        recurringId: recurring.id,
      },
    })

    // Update the recurring transaction
    const nextDate = getNextDate(recurring.nextDate, recurring.frequency)
    const updated = await db.recurringTransaction.update({
      where: { id: recurring.id },
      data: {
        lastExecuted: recurring.nextDate,
        nextDate,
      },
      include: {
        category: {
          select: { id: true, name: true, icon: true, color: true, type: true },
        },
      },
    })

    return apiSuccess({ transaction, recurring: updated })
  } catch (error) {
    console.error('POST /api/finance/recurring/execute error:', error)
    return apiServerError('Failed to execute recurring transaction')
  }
}
