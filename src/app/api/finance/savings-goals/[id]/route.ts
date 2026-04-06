import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const DEMO_USER_ID = 'user_demo_001'

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
      return NextResponse.json({ error: 'Savings goal not found' }, { status: 404 })
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

    return NextResponse.json({ success: true, data: goal })
  } catch (error) {
    console.error('PUT /api/finance/savings-goals/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update savings goal' }, { status: 500 })
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
      return NextResponse.json({ error: 'Savings goal not found' }, { status: 404 })
    }

    await db.savingsGoal.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/finance/savings-goals/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete savings goal' }, { status: 500 })
  }
}
