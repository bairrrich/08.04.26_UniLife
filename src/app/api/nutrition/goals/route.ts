import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { DEMO_USER_ID, apiSuccess, apiServerError } from '@/lib/api'

const DEFAULT_GOALS = {
  dailyKcal: 2200,
  dailyProtein: 150,
  dailyFat: 80,
  dailyCarbs: 250,
  dailyWater: 2000,
}

// GET /api/nutrition/goals — return current goals (or defaults if none set)
export async function GET() {
  try {
    const goal = await db.nutritionGoal.findUnique({
      where: { userId: DEMO_USER_ID },
    })

    if (goal) {
      return apiSuccess({
        dailyKcal: goal.dailyKcal,
        dailyProtein: goal.dailyProtein,
        dailyFat: goal.dailyFat,
        dailyCarbs: goal.dailyCarbs,
        dailyWater: goal.dailyWater,
      })
    }

    // Return defaults, but also seed them so future reads are consistent
    await db.nutritionGoal.create({
      data: { userId: DEMO_USER_ID, ...DEFAULT_GOALS },
    })

    return apiSuccess(DEFAULT_GOALS)
  } catch (error) {
    console.error('GET /api/nutrition/goals error:', error)
    return apiServerError('Failed to fetch nutrition goals')
  }
}

// PUT /api/nutrition/goals — update goals (upsert)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { dailyKcal, dailyProtein, dailyFat, dailyCarbs, dailyWater } = body

    // Validate
    const parsed = {
      dailyKcal: Math.max(500, Math.min(10000, parseInt(dailyKcal) || DEFAULT_GOALS.dailyKcal)),
      dailyProtein: Math.max(10, Math.min(500, parseInt(dailyProtein) || DEFAULT_GOALS.dailyProtein)),
      dailyFat: Math.max(10, Math.min(300, parseInt(dailyFat) || DEFAULT_GOALS.dailyFat)),
      dailyCarbs: Math.max(10, Math.min(800, parseInt(dailyCarbs) || DEFAULT_GOALS.dailyCarbs)),
      dailyWater: Math.max(500, Math.min(10000, parseInt(dailyWater) || DEFAULT_GOALS.dailyWater)),
    }

    const goal = await db.nutritionGoal.upsert({
      where: { userId: DEMO_USER_ID },
      update: parsed,
      create: { userId: DEMO_USER_ID, ...parsed },
    })

    return apiSuccess({
      dailyKcal: goal.dailyKcal,
      dailyProtein: goal.dailyProtein,
      dailyFat: goal.dailyFat,
      dailyCarbs: goal.dailyCarbs,
      dailyWater: goal.dailyWater,
    })
  } catch (error) {
    console.error('PUT /api/nutrition/goals error:', error)
    return apiServerError('Failed to update nutrition goals')
  }
}
