import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const DEMO_USER_ID = 'user_demo_001'

// GET /api/finance/categories — List all categories with subCategories
// Query params: ?type=INCOME|EXPENSE|TRANSFER
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    const where: Record<string, unknown> = {}

    if (type) {
      where.type = type
    }

    // Return default categories (userId is null) plus user-specific categories
    const categories = await db.category.findMany({
      where: {
        OR: [
          { isDefault: true },
          { userId: DEMO_USER_ID },
        ],
        ...where,
      },
      orderBy: { name: 'asc' },
      include: {
        subCategories: {
          orderBy: { name: 'asc' },
        },
      },
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('GET /api/finance/categories error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 },
    )
  }
}

// POST /api/finance/categories — Create a new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, type, icon, color } = body

    if (!name || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: name, type' },
        { status: 400 },
      )
    }

    if (!['INCOME', 'EXPENSE', 'TRANSFER'].includes(type)) {
      return NextResponse.json(
        { error: 'type must be INCOME, EXPENSE, or TRANSFER' },
        { status: 400 },
      )
    }

    const category = await db.category.create({
      data: {
        name,
        type,
        icon: icon || 'circle',
        color: color || '#6b7280',
        userId: DEMO_USER_ID,
        isDefault: false,
      },
    })

    return NextResponse.json({ category }, { status: 201 })
  } catch (error) {
    console.error('POST /api/finance/categories error:', error)
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 },
    )
  }
}
