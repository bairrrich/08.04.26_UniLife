import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { DEMO_USER_ID } from '@/lib/api';


// GET /api/budgets?month=YYYY-MM — Returns budgets with spent amounts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')

    if (!month) {
      return NextResponse.json(
        { error: 'Missing required query param: month (YYYY-MM)' },
        { status: 400 },
      )
    }

    const [year, m] = month.split('-').map(Number)
    if (!year || !m || m < 1 || m > 12) {
      return NextResponse.json(
        { error: 'Invalid month format. Use YYYY-MM' },
        { status: 400 },
      )
    }

    const monthStart = new Date(year, m - 1, 1)
    const monthEnd = new Date(year, m, 0, 23, 59, 59, 999)

    // Fetch budgets for the month (where startDate falls within this month or covers it)
    const budgets = await db.budget.findMany({
      where: {
        userId: DEMO_USER_ID,
        startDate: { lte: monthEnd },
        OR: [
          { endDate: null },
          { endDate: { gte: monthStart } },
        ],
      },
      include: {
        category: true,
      },
      orderBy: { amount: 'desc' },
    })

    // For each budget, calculate total spent in the matching category this month
    const budgetsWithSpent = await Promise.all(
      budgets.map(async (budget) => {
        const spent = await db.transaction.aggregate({
          where: {
            userId: DEMO_USER_ID,
            categoryId: budget.categoryId,
            type: 'EXPENSE',
            date: { gte: monthStart, lte: monthEnd },
          },
          _sum: { amount: true },
        })

        return {
          id: budget.id,
          categoryId: budget.categoryId,
          categoryName: budget.category.name,
          categoryIcon: budget.category.icon,
          categoryColor: budget.category.color,
          amount: budget.amount,
          spent: spent._sum.amount ?? 0,
          period: budget.period,
          startDate: budget.startDate,
          endDate: budget.endDate,
          percentage: budget.amount > 0
            ? Math.round(((spent._sum.amount ?? 0) / budget.amount) * 100)
            : 0,
        }
      }),
    )

    // Calculate totals
    const totalBudget = budgetsWithSpent.reduce((sum, b) => sum + b.amount, 0)
    const totalSpent = budgetsWithSpent.reduce((sum, b) => sum + b.spent, 0)

    return NextResponse.json({
      success: true,
      data: {
        budgets: budgetsWithSpent,
        totalBudget,
        totalSpent,
        totalRemaining: Math.max(totalBudget - totalSpent, 0),
        totalPercentage: totalBudget > 0
          ? Math.round((totalSpent / totalBudget) * 100)
          : 0,
      },
    })
  } catch (error) {
    console.error('GET /api/budgets error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch budgets' },
      { status: 500 },
    )
  }
}

// POST /api/budgets — Create a new budget
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { categoryId, amount, month } = body

    if (!categoryId || !amount || !month) {
      return NextResponse.json(
        { error: 'Missing required fields: categoryId, amount, month' },
        { status: 400 },
      )
    }

    const [year, m] = month.split('-').map(Number)
    if (!year || !m || m < 1 || m > 12) {
      return NextResponse.json(
        { error: 'Invalid month format. Use YYYY-MM' },
        { status: 400 },
      )
    }

    // Check for existing budget in this category for this month
    const startDate = new Date(year, m - 1, 1)
    const endDate = new Date(year, m, 0, 23, 59, 59, 999)

    const existingBudget = await db.budget.findFirst({
      where: {
        userId: DEMO_USER_ID,
        categoryId,
        startDate: { gte: startDate, lte: endDate },
      },
    })

    if (existingBudget) {
      return NextResponse.json(
        { error: 'Бюджет для этой категории уже существует на этот месяц' },
        { status: 409 },
      )
    }

    // Validate category exists
    const category = await db.category.findUnique({
      where: { id: categoryId },
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Категория не найдена' },
        { status: 400 },
      )
    }

    const budget = await db.budget.create({
      data: {
        userId: DEMO_USER_ID,
        categoryId,
        amount: parseFloat(amount),
        period: 'MONTH',
        startDate,
        endDate,
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json({ success: true, data: budget }, { status: 201 })
  } catch (error) {
    console.error('POST /api/budgets error:', error)
    return NextResponse.json(
      { error: 'Failed to create budget' },
      { status: 500 },
    )
  }
}

// PUT /api/budgets?id=xxx — Update a budget
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Missing required query param: id' },
        { status: 400 },
      )
    }

    const body = await request.json()
    const { amount } = body

    if (!amount || parseFloat(amount) <= 0) {
      return NextResponse.json(
        { error: 'Missing or invalid field: amount (must be > 0)' },
        { status: 400 },
      )
    }

    const existing = await db.budget.findUnique({
      where: { id },
    })

    if (!existing || existing.userId !== DEMO_USER_ID) {
      return NextResponse.json(
        { error: 'Бюджет не найден' },
        { status: 404 },
      )
    }

    const budget = await db.budget.update({
      where: { id },
      data: { amount: parseFloat(amount) },
      include: { category: true },
    })

    return NextResponse.json({ success: true, data: budget })
  } catch (error) {
    console.error('PUT /api/budgets error:', error)
    return NextResponse.json(
      { error: 'Failed to update budget' },
      { status: 500 },
    )
  }
}

// DELETE /api/budgets?id=xxx — Delete a budget
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Missing required query param: id' },
        { status: 400 },
      )
    }

    const existing = await db.budget.findUnique({
      where: { id },
    })

    if (!existing || existing.userId !== DEMO_USER_ID) {
      return NextResponse.json(
        { error: 'Бюджет не найден' },
        { status: 404 },
      )
    }

    await db.budget.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/budgets error:', error)
    return NextResponse.json(
      { error: 'Failed to delete budget' },
      { status: 500 },
    )
  }
}
