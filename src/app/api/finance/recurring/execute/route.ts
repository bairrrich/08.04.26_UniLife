import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const DEMO_USER_ID = 'user_demo_001'

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
      return NextResponse.json({ error: 'recurringId is required' }, { status: 400 })
    }

    const recurring = await db.recurringTransaction.findUnique({
      where: { id: recurringId },
      include: { category: true },
    })

    if (!recurring) {
      return NextResponse.json({ error: 'Recurring transaction not found' }, { status: 404 })
    }

    if (!recurring.isActive) {
      return NextResponse.json({ error: 'Recurring transaction is inactive' }, { status: 400 })
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

    return NextResponse.json({
      success: true,
      data: { transaction, recurring: updated },
    })
  } catch (error) {
    console.error('POST /api/finance/recurring/execute error:', error)
    return NextResponse.json({ error: 'Failed to execute recurring transaction' }, { status: 500 })
  }
}
