import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { DEMO_USER_ID, apiSuccess, apiSuccessMessage, apiError, apiServerError } from '@/lib/api'

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

    return apiSuccess(categories)
  } catch (error) {
    console.error('GET /api/finance/categories error:', error)
    return apiServerError('Failed to fetch categories')
  }
}

// POST /api/finance/categories — Create a new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, type, icon, color } = body

    if (!name || !type) {
      return apiError('Missing required fields: name, type')
    }

    if (!['INCOME', 'EXPENSE', 'TRANSFER'].includes(type)) {
      return apiError('type must be INCOME, EXPENSE, or TRANSFER')
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

    return apiSuccess(category, 201)
  } catch (error) {
    console.error('POST /api/finance/categories error:', error)
    return apiServerError('Failed to create category')
  }
}
