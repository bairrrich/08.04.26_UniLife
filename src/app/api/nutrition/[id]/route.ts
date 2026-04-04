import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const USER_ID = 'user_demo_001'

const VALID_MEAL_TYPES = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'] as const

// PUT /api/nutrition/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const body = await request.json()
    const { mealType, date, note, items } = body

    // Validate meal type
    if (!mealType || !VALID_MEAL_TYPES.includes(mealType.toUpperCase())) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid meal type. Must be one of: ${VALID_MEAL_TYPES.join(', ')}`,
        },
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

    // Verify the meal belongs to the user
    const existingMeal = await db.meal.findFirst({
      where: { id, userId: USER_ID },
    })

    if (!existingMeal) {
      return NextResponse.json(
        { success: false, error: 'Meal not found' },
        { status: 404 }
      )
    }

    // Update meal and replace items in a transaction
    const updatedMeal = await db.$transaction(async (tx) => {
      // Delete existing meal items
      await tx.mealItem.deleteMany({
        where: { mealId: id },
      })

      // Update the meal
      return tx.meal.update({
        where: { id },
        data: {
          type: mealType.toUpperCase(),
          date: parsedDate,
          note: note || null,
          items: {
            create: items.map((item: { name: string; calories?: number; kcal?: number; protein?: number; fat?: number; carbs?: number }) => ({
              name: item.name,
              kcal: item.calories ?? item.kcal ?? 0,
              protein: item.protein ?? 0,
              fat: item.fat ?? 0,
              carbs: item.carbs ?? 0,
            })),
          },
        },
        include: {
          items: {
            orderBy: { id: 'asc' },
          },
        },
      })
    })

    return NextResponse.json({ success: true, data: updatedMeal })
  } catch (error) {
    console.error('PUT /api/nutrition/[id] error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update meal' },
      { status: 500 }
    )
  }
}
