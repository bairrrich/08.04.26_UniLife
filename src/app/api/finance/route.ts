import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const DEMO_USER_ID = 'user_demo_001'

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
      },
    })

    return NextResponse.json({ transactions })
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
    const body = await request.json()
    const { type, amount, categoryId, subCategoryId, date, description, note } = body

    // Validate required fields
    if (!type || !amount || !date) {
      return NextResponse.json(
        { error: 'Missing required fields: type, amount, date' },
        { status: 400 },
      )
    }

    if (!['INCOME', 'EXPENSE', 'TRANSFER'].includes(type)) {
      return NextResponse.json(
        { error: 'type must be INCOME, EXPENSE, or TRANSFER' },
        { status: 400 },
      )
    }

    // Validate category exists when provided
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
        amount: parseFloat(amount),
        currency: 'RUB',
        categoryId: categoryId || '',
        subCategoryId: subCategoryId || null,
        date: new Date(date),
        description: description || null,
        note: note || null,
      },
      include: {
        category: true,
        subCategory: true,
      },
    })

    return NextResponse.json({ transaction }, { status: 201 })
  } catch (error) {
    console.error('POST /api/finance error:', error)
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 },
    )
  }
}
