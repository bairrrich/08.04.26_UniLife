import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const DEMO_USER_ID = 'user_demo_001'

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
    return NextResponse.json({ success: true, data: recurring })
  } catch (error) {
    console.error('GET /api/finance/recurring error:', error)
    return NextResponse.json({ error: 'Failed to fetch recurring transactions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, amount, categoryId, description, note, frequency, startDate } = body

    if (!type || !['INCOME', 'EXPENSE'].includes(type)) {
      return NextResponse.json({ error: 'Valid type (INCOME/EXPENSE) is required' }, { status: 400 })
    }
    if (!amount || parseFloat(amount) <= 0) {
      return NextResponse.json({ error: 'Amount must be positive' }, { status: 400 })
    }
    if (!categoryId) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 })
    }
    if (!frequency || !['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'].includes(frequency)) {
      return NextResponse.json({ error: 'Valid frequency (DAILY/WEEKLY/MONTHLY/YEARLY) is required' }, { status: 400 })
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

    return NextResponse.json({ success: true, data: recurring }, { status: 201 })
  } catch (error) {
    console.error('POST /api/finance/recurring error:', error)
    return NextResponse.json({ error: 'Failed to create recurring transaction' }, { status: 500 })
  }
}
