import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const DEMO_USER_ID = 'user_demo_001'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verify ownership
    const existing = await db.transaction.findUnique({
      where: { id },
    })

    if (!existing || existing.userId !== DEMO_USER_ID) {
      return NextResponse.json(
        { success: false, error: 'Транзакция не найдена' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { type, amount, categoryId, date, description, note } = body

    if (!amount || !date) {
      return NextResponse.json(
        { success: false, error: 'amount and date are required' },
        { status: 400 }
      )
    }

    if (type && !['INCOME', 'EXPENSE', 'TRANSFER'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'type must be INCOME, EXPENSE, or TRANSFER' },
        { status: 400 }
      )
    }

    // Validate category if provided
    if (categoryId) {
      const category = await db.category.findUnique({ where: { id: categoryId } })
      if (!category) {
        return NextResponse.json(
          { success: false, error: 'Категория не найдена' },
          { status: 400 }
        )
      }
    }

    const transaction = await db.transaction.update({
      where: { id },
      data: {
        ...(type && { type }),
        amount: parseFloat(amount),
        ...(categoryId && { categoryId }),
        ...(date && { date: new Date(date) }),
        ...(description !== undefined && { description: description || null }),
        ...(note !== undefined && { note: note || null }),
      },
      include: {
        category: true,
        subCategory: true,
      },
    })

    return NextResponse.json({ success: true, data: transaction })
  } catch (error) {
    console.error('Finance PUT error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update transaction' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verify ownership
    const existing = await db.transaction.findUnique({
      where: { id },
    })

    if (!existing || existing.userId !== DEMO_USER_ID) {
      return NextResponse.json(
        { success: false, error: 'Транзакция не найдена' },
        { status: 404 }
      )
    }

    await db.transaction.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'Транзакция удалена' })
  } catch (error) {
    console.error('Finance DELETE error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete transaction' },
      { status: 500 }
    )
  }
}
