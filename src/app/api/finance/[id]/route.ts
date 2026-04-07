import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { parseBody, DEMO_USER_ID, transactionTypeSchema } from '@/lib/api'

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

const updateTransactionSchema = z.object({
  type: transactionTypeSchema.optional(),
  amount: z.number().positive('Сумма должна быть положительной'),
  categoryId: z.string().optional(),
  date: z.string().min(1, 'Дата обязательна'),
  description: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
})

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

    const data = await parseBody(request, updateTransactionSchema)
    if (!data) return

    const { type, amount, categoryId, date, description, note } = data

    // Validate category if provided (business logic check)
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
        amount,
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
