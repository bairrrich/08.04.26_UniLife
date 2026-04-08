import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { parseBody, DEMO_USER_ID } from '@/lib/api'

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

const createGoalSchema = z.object({
  title: z.string().min(1, 'Название обязательно'),
  description: z.string().optional(),
  category: z.string().optional(),
  targetValue: z.number().optional().nullable(),
  currentValue: z.number().optional(),
  unit: z.string().optional(),
  deadline: z.string().optional(),
  startDate: z.string().optional(),
  status: z.string().optional(),
  progress: z.number().min(0).max(100).optional(),
  priority: z.string().optional(),
  milestones: z.unknown().optional(),
})

// GET /api/goals — Fetch all goals for the demo user
export async function GET() {
  try {
    const goals = await db.goal.findMany({
      where: { userId: DEMO_USER_ID },
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
    const data = await parseBody(request, createGoalSchema)
    if (!data) return

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
    } = data

    const goal = await db.goal.create({
      data: {
        userId: DEMO_USER_ID,
        title: title.trim(),
        description: description?.trim() || null,
        category: category || 'personal',
        targetValue: targetValue != null ? Number(targetValue) : null,
        currentValue: currentValue != null ? Number(currentValue) : 0,
        unit: unit?.trim() || null,
        deadline: deadline ? new Date(deadline) : null,
        status: status || 'active',
        progress: progress != null ? Math.min(100, Math.max(0, Number(progress))) : 0,
        priority: priority || 'medium',
        milestones: milestones ? JSON.stringify(milestones) : '[]',
        ...(startDate ? { createdAt: new Date(startDate) } : {}),
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
