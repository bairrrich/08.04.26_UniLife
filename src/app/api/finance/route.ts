import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { parseBody, DEMO_USER_ID } from '@/lib/api'
import { publishActivityEvent } from '@/lib/activity'
import { ACTIVITY_VISIBILITY_VALUES, getFinanceTransactionEventType } from '@/lib/activity-types'

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

const createTransactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
  amount: z.number().positive('Сумма должна быть положительной'),
  date: z.string().min(1, 'Дата обязательна'),
  categoryId: z.string().optional(),
  subCategoryId: z.string().optional(),
  description: z.string().optional(),
  note: z.string().optional(),
  fromAccountId: z.string().optional(),
  toAccountId: z.string().optional(),
  shareToFeed: z.boolean().optional(),
  visibility: z.enum(ACTIVITY_VISIBILITY_VALUES).optional(),
  caption: z.string().optional(),
})

// GET /api/finance — List transactions with category included
// Query params: ?month=YYYY-MM, ?type=INCOME|EXPENSE|TRANSFER, ?categoryId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')   // e.g. "2025-01"
    const type = searchParams.get('type')
    const categoryId = searchParams.get('categoryId')

    const where: Record<string, unknown> = { userId: DEMO_USER_ID }

    // Filter by month: match year and month of the date field
    if (month) {
      const [year, m] = month.split('-').map(Number)
      if (year && m) {
        const startDate = new Date(year, m - 1, 1)
        const endDate = new Date(year, m, 0, 23, 59, 59, 999)
        where.date = { gte: startDate, lte: endDate }
      }
    }

    if (type) {
      where.type = type
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    const transactions = await db.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        category: {
          include: {
            subCategories: true,
          },
        },
        subCategory: true,
        fromAccount: true,
        toAccount: true,
      },
    })

    return NextResponse.json({ success: true, data: transactions })
  } catch (error) {
    console.error('GET /api/finance error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 },
    )
  }
}

// POST /api/finance — Create a new transaction
export async function POST(request: NextRequest) {
  try {
    const data = await parseBody(request, createTransactionSchema)
    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 },
      )
    }

    const {
      type,
      amount,
      categoryId,
      subCategoryId,
      date,
      description,
      note,
      fromAccountId,
      toAccountId,
      shareToFeed,
      visibility,
      caption,
    } = data

    if (!categoryId) {
      return NextResponse.json(
        { success: false, error: 'Category is required for all transactions' },
        { status: 400 },
      )
    }

    if (type === 'TRANSFER' && (!fromAccountId || !toAccountId)) {
      return NextResponse.json(
        { success: false, error: 'fromAccountId and toAccountId are required for transfers' },
        { status: 400 },
      )
    }

    // Validate category exists when provided (business logic check)
    if (categoryId) {
      const category = await db.category.findUnique({ where: { id: categoryId } })
      if (!category) {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 400 },
        )
      }
    }

    const transaction = await db.transaction.create({
      data: {
        userId: DEMO_USER_ID,
        type,
        amount,
        currency: 'RUB',
        categoryId,
        subCategoryId: subCategoryId || null,
        date: new Date(date),
        description: description || null,
        note: note || null,
        fromAccountId: fromAccountId || null,
        toAccountId: toAccountId || null,
      },
      include: {
        category: true,
        subCategory: true,
        fromAccount: true,
        toAccount: true,
      },
    })

    await publishActivityEvent({
      userId: DEMO_USER_ID,
      type: getFinanceTransactionEventType(type),
      entityType: 'transaction',
      entityId: transaction.id,
      visibility: visibility ?? 'private',
      shareToFeed: shareToFeed ?? false,
      caption,
      payload: {
        amount: transaction.amount,
        currency: transaction.currency,
        transactionType: transaction.type,
        date: transaction.date.toISOString(),
        categoryId: transaction.categoryId,
      },
    })

    return NextResponse.json({ success: true, data: transaction }, { status: 201 })
  } catch (error) {
    console.error('POST /api/finance error:', error)
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 },
    )
  }
}
