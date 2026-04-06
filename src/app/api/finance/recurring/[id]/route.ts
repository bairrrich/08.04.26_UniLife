import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const DEMO_USER_ID = 'user_demo_001'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { type, amount, categoryId, description, note, frequency, nextDate, isActive } = body

    const existing = await db.recurringTransaction.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Recurring transaction not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (type !== undefined && ['INCOME', 'EXPENSE'].includes(type)) updateData.type = type
    if (amount !== undefined) updateData.amount = parseFloat(amount)
    if (categoryId !== undefined) updateData.categoryId = categoryId
    if (description !== undefined) updateData.description = description || null
    if (note !== undefined) updateData.note = note || null
    if (frequency !== undefined && ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'].includes(frequency)) updateData.frequency = frequency
    if (nextDate !== undefined) updateData.nextDate = new Date(nextDate)
    if (isActive !== undefined) updateData.isActive = Boolean(isActive)

    const updated = await db.recurringTransaction.update({
      where: { id },
      data: updateData,
      include: {
        category: {
          select: { id: true, name: true, icon: true, color: true, type: true },
        },
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('PUT /api/finance/recurring/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update recurring transaction' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.recurringTransaction.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Recurring transaction not found' }, { status: 404 })
    }

    await db.recurringTransaction.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Recurring transaction deleted' })
  } catch (error) {
    console.error('DELETE /api/finance/recurring/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete recurring transaction' }, { status: 500 })
  }
}
