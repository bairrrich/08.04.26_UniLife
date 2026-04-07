import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { DEMO_USER_ID, apiSuccess, apiError, apiServerError } from '@/lib/api'

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
      return apiError(`Invalid meal type. Must be one of: ${VALID_MEAL_TYPES.join(', ')}`)
    }

    // Validate date
    if (!date) {
      return apiError('Date is required')
    }

    const parsedDate = new Date(date + 'T00:00:00.000Z')
    if (isNaN(parsedDate.getTime())) {
      return apiError('Invalid date format. Use YYYY-MM-DD')
    }

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return apiError('At least one meal item is required')
    }

    // Validate each item
    for (const item of items) {
      if (!item.name) {
        return apiError('Each meal item must have a name')
      }
    }

    // Verify the meal belongs to the user
    const existingMeal = await db.meal.findFirst({
      where: { id, userId: DEMO_USER_ID },
    })

    if (!existingMeal) {
      return apiError('Meal not found', 404)
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

    return apiSuccess(updatedMeal)
  } catch (error) {
    console.error('PUT /api/nutrition/[id] error:', error)
    return apiServerError('Failed to update meal')
  }
}
