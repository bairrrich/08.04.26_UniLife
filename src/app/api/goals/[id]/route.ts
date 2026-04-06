import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const USER_ID = 'user_demo_001'

// PUT /api/goals/[id] — Update any fields of an existing goal
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const goal = await db.goal.findUnique({
      where: { id },
    })

    if (!goal || goal.userId !== USER_ID) {
      return NextResponse.json(
        { success: false, error: 'Goal not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const {
      title,
      description,
      category,
      targetValue,
      currentValue,
      unit,
      deadline,
      startDate,
      status,
      progress,
      priority,
      milestones,
    } = body

    const updated = await db.goal.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(category !== undefined && { category }),
        ...(targetValue !== undefined && { targetValue: targetValue != null ? Number(targetValue) : null }),
        ...(currentValue !== undefined && { currentValue: Number(currentValue) }),
        ...(unit !== undefined && { unit: unit?.trim() || null }),
        ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null }),
        ...(status !== undefined && { status }),
        ...(progress !== undefined && { progress: Math.min(100, Math.max(0, Number(progress))) }),
        ...(priority !== undefined && { priority }),
        ...(milestones !== undefined && { milestones }),
        ...(startDate !== undefined && { createdAt: startDate ? new Date(startDate) : goal.createdAt }),
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Goals PUT error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update goal' },
      { status: 500 }
    )
  }
}

// DELETE /api/goals/[id] — Remove a goal
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const goal = await db.goal.findUnique({
      where: { id },
    })

    if (!goal || goal.userId !== USER_ID) {
      return NextResponse.json(
        { success: false, error: 'Goal not found' },
        { status: 404 }
      )
    }

    await db.goal.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'Goal deleted' })
  } catch (error) {
    console.error('Goals DELETE error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete goal' },
      { status: 500 }
    )
  }
}
