import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const DEMO_USER_ID = 'user_demo_001'

export async function GET() {
  try {
    const goals = await db.savingsGoal.findMany({
      where: { userId: DEMO_USER_ID },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ success: true, data: goals })
  } catch (error) {
    console.error('GET /api/finance/savings-goals error:', error)
    return NextResponse.json({ error: 'Failed to fetch savings goals' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, targetAmount, icon, color, deadline, description } = body

    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    if (!targetAmount || parseFloat(targetAmount) <= 0) {
      return NextResponse.json({ error: 'Target amount is required and must be positive' }, { status: 400 })
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

    return NextResponse.json({ success: true, data: goal }, { status: 201 })
  } catch (error) {
    console.error('POST /api/finance/savings-goals error:', error)
    return NextResponse.json({ error: 'Failed to create savings goal' }, { status: 500 })
  }
}
