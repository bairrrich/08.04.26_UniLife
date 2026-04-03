import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const USER_ID = 'user_demo_001'

// GET /api/goals — Fetch all goals for the demo user
export async function GET() {
  try {
    const goals = await db.goal.findMany({
      where: { userId: USER_ID },
      orderBy: { createdAt: 'desc' },
    })

    // Calculate stats
    const totalGoals = goals.length
    const completedGoals = goals.filter((g) => g.status === 'completed').length
    const avgProgress = totalGoals > 0
      ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / totalGoals)
      : 0

    return NextResponse.json({
      success: true,
      data: goals,
      stats: {
        totalGoals,
        completedGoals,
        avgProgress,
      },
    })
  } catch (error) {
    console.error('Goals GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch goals' },
      { status: 500 }
    )
  }
}

// POST /api/goals — Create a new goal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      category,
      targetValue,
      currentValue,
      unit,
      deadline,
      status,
      progress,
    } = body

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, error: 'title is required' },
        { status: 400 }
      )
    }

    const goal = await db.goal.create({
      data: {
        userId: USER_ID,
        title: title.trim(),
        description: description?.trim() || null,
        category: category || 'personal',
        targetValue: targetValue != null ? Number(targetValue) : null,
        currentValue: currentValue != null ? Number(currentValue) : 0,
        unit: unit?.trim() || null,
        deadline: deadline ? new Date(deadline) : null,
        status: status || 'active',
        progress: progress != null ? Math.min(100, Math.max(0, Number(progress))) : 0,
      },
    })

    return NextResponse.json({ success: true, data: goal }, { status: 201 })
  } catch (error) {
    console.error('Goals POST error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create goal' },
      { status: 500 }
    )
  }
}
