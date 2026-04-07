import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { DEMO_USER_ID, apiSuccess, apiError, apiServerError } from '@/lib/api'

export async function GET() {
  try {
    const goals = await db.savingsGoal.findMany({
      where: { userId: DEMO_USER_ID },
      orderBy: { createdAt: 'desc' },
    })
    return apiSuccess(goals)
  } catch (error) {
    console.error('GET /api/finance/savings-goals error:', error)
    return apiServerError('Failed to fetch savings goals')
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, targetAmount, icon, color, deadline, description } = body

    if (!name) return apiError('Name is required')
    if (!targetAmount || parseFloat(targetAmount) <= 0) {
      return apiError('Target amount is required and must be positive')
    }

    const goal = await db.savingsGoal.create({
      data: {
        userId: DEMO_USER_ID,
        name,
        targetAmount: parseFloat(targetAmount),
        icon: icon || 'piggy-bank',
        color: color || '#10b981',
        deadline: deadline ? new Date(deadline) : null,
        description: description || null,
      },
    })

    return apiSuccess(goal, 201)
  } catch (error) {
    console.error('POST /api/finance/savings-goals error:', error)
    return apiServerError('Failed to create savings goal')
  }
}
