import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { DEMO_USER_ID, apiSuccess, apiError, apiServerError } from '@/lib/api'

const MEAL_TYPES = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'] as const

// GET /api/nutrition/stats?date=YYYY-MM-DD
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateStr = searchParams.get('date')

    if (!dateStr) {
      return apiError('Date query parameter is required. Use ?date=YYYY-MM-DD')
    }

    const startOfDay = new Date(dateStr + 'T00:00:00.000Z')
    const endOfDay = new Date(dateStr + 'T23:59:59.999Z')

    if (isNaN(startOfDay.getTime())) {
      return apiError('Invalid date format. Use YYYY-MM-DD')
    }

    // Fetch all meals for the day with items
    const meals = await db.meal.findMany({
      where: {
        userId: DEMO_USER_ID,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        items: true,
      },
      orderBy: { type: 'asc' },
    })

    // Compute totals
    let totalKcal = 0
    let totalProtein = 0
    let totalFat = 0
    let totalCarbs = 0

    // Initialize by-meal-type breakdown
    const byMealType: Record<string, { kcal: number; protein: number; fat: number; carbs: number; mealCount: number }> = {}
    for (const mt of MEAL_TYPES) {
      byMealType[mt] = { kcal: 0, protein: 0, fat: 0, carbs: 0, mealCount: 0 }
    }

    for (const meal of meals) {
      const mealTotals = { kcal: 0, protein: 0, fat: 0, carbs: 0 }

      for (const item of meal.items) {
        mealTotals.kcal += item.kcal
        mealTotals.protein += item.protein
        mealTotals.fat += item.fat
        mealTotals.carbs += item.carbs
      }

      totalKcal += mealTotals.kcal
      totalProtein += mealTotals.protein
      totalFat += mealTotals.fat
      totalCarbs += mealTotals.carbs

      const mealType = meal.type as (typeof MEAL_TYPES)[number]
      if (byMealType[mealType]) {
        byMealType[mealType].kcal += mealTotals.kcal
        byMealType[mealType].protein += mealTotals.protein
        byMealType[mealType].fat += mealTotals.fat
        byMealType[mealType].carbs += mealTotals.carbs
        byMealType[mealType].mealCount += 1
      }
    }

    return apiSuccess({
      date: dateStr,
      totalKcal: Math.round(totalKcal),
      totalProtein: Math.round(totalProtein * 10) / 10,
      totalFat: Math.round(totalFat * 10) / 10,
      totalCarbs: Math.round(totalCarbs * 10) / 10,
      byMealType,
    })
  } catch (error) {
    console.error('GET /api/nutrition/stats error:', error)
    return apiServerError('Failed to fetch nutrition stats')
  }
}
