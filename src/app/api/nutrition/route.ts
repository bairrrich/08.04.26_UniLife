import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const USER_ID = 'user_demo_001'

const VALID_MEAL_TYPES = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'] as const

// GET /api/nutrition?date=YYYY-MM-DD or ?month=YYYY-MM
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateStr = searchParams.get('date')
    const monthStr = searchParams.get('month')

    let where: any = { userId: USER_ID }

    if (dateStr) {
      // Specific day: start of day to end of day
      const startOfDay = new Date(dateStr + 'T00:00:00.000Z')
      const endOfDay = new Date(dateStr + 'T23:59:59.999Z')
      where.date = {
        gte: startOfDay,
        lte: endOfDay,
      }
    } else if (monthStr) {
      // Month range
      const [year, month] = monthStr.split('-').map(Number)
      const startOfMonth = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0))
      const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999))
      where.date = {
        gte: startOfMonth,
        lte: endOfMonth,
      }
    }

    const meals = await db.meal.findMany({
      where,
      include: {
        items: {
          orderBy: { id: 'asc' },
        },
      },
      orderBy: [{ date: 'asc' }, { type: 'asc' }],
    })

    return NextResponse.json({ success: true, data: meals })
  } catch (error) {
    console.error('GET /api/nutrition error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch meals' },
      { status: 500 }
    )
  }
}

// POST /api/nutrition
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, date, note, items } = body

    // Validate meal type
    if (!type || !VALID_MEAL_TYPES.includes(type.toUpperCase())) {
      return NextResponse.json(
        { success: false, error: `Invalid meal type. Must be one of: ${VALID_MEAL_TYPES.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate date
    if (!date) {
      return NextResponse.json(
        { success: false, error: 'Date is required' },
        { status: 400 }
      )
    }

    const parsedDate = new Date(date + 'T00:00:00.000Z')
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { success: false, error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      )
    }

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one meal item is required' },
        { status: 400 }
      )
    }

    // Validate each item
    for (const item of items) {
      if (!item.name) {
        return NextResponse.json(
          { success: false, error: 'Each meal item must have a name' },
          { status: 400 }
        )
      }
    }

    // Create meal with items in a transaction
    const meal = await db.meal.create({
      data: {
        userId: USER_ID,
        type: type.toUpperCase(),
        date: parsedDate,
        note: note || null,
        items: {
          create: items.map((item: any) => ({
            name: item.name,
            kcal: item.kcal ?? 0,
            protein: item.protein ?? 0,
            fat: item.fat ?? 0,
            carbs: item.carbs ?? 0,
            servingSize: item.servingSize ?? null,
            servingUnit: item.servingUnit ?? null,
          })),
        },
      },
      include: {
        items: {
          orderBy: { id: 'asc' },
        },
      },
    })

    return NextResponse.json({ success: true, data: meal }, { status: 201 })
  } catch (error) {
    console.error('POST /api/nutrition error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create meal' },
      { status: 500 }
    )
  }
}

// DELETE /api/nutrition?id=mealId
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const mealId = searchParams.get('id')

    if (!mealId) {
      return NextResponse.json(
        { success: false, error: 'Meal ID is required' },
        { status: 400 }
      )
    }

    // Verify the meal belongs to the user
    const meal = await db.meal.findFirst({
      where: { id: mealId, userId: USER_ID },
    })

    if (!meal) {
      return NextResponse.json(
        { success: false, error: 'Meal not found' },
        { status: 404 }
      )
    }

    // Delete the meal (cascade will delete meal items)
    await db.meal.delete({
      where: { id: mealId },
    })

    return NextResponse.json({ success: true, message: 'Meal deleted' })
  } catch (error) {
    console.error('DELETE /api/nutrition error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete meal' },
      { status: 500 }
    )
  }
}
