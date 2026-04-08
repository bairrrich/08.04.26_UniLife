import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { DEMO_USER_ID, apiSuccess, apiSuccessMessage, apiError, apiServerError } from '@/lib/api'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, targetAmount, currentAmount, icon, color, deadline, description } = body

    const existing = await db.savingsGoal.findFirst({
      where: { id, userId: DEMO_USER_ID },
    })
    if (!existing) {
      return apiError('Savings goal not found', 404)
    }

    const goal = await db.savingsGoal.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(targetAmount !== undefined && { targetAmount: parseFloat(targetAmount) }),
        ...(currentAmount !== undefined && { currentAmount: parseFloat(currentAmount) }),
        ...(icon !== undefined && { icon }),
        ...(color !== undefined && { color }),
        ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null }),
        ...(description !== undefined && { description }),
      },
    })

    return apiSuccess(goal)
  } catch (error) {
    console.error('PUT /api/finance/savings-goals/[id] error:', error)
    return apiServerError('Failed to update savings goal')
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.savingsGoal.findFirst({
      where: { id, userId: DEMO_USER_ID },
    })
    if (!existing) {
      return apiError('Savings goal not found', 404)
    }

    await db.savingsGoal.delete({ where: { id } })

    return apiSuccessMessage('Savings goal deleted')
  } catch (error) {
    console.error('DELETE /api/finance/savings-goals/[id] error:', error)
    return apiServerError('Failed to delete savings goal')
  }
}
