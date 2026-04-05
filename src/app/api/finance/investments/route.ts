import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const DEMO_USER_ID = 'user_demo_001'

export async function GET() {
  try {
    const investments = await db.investment.findMany({
      where: { userId: DEMO_USER_ID },
      orderBy: { createdAt: 'desc' },
      include: {
        transactions: { orderBy: { date: 'desc' } },
      },
    })

    // Compute totals for each investment
    const enriched = investments.map((inv) => {
      const totalInvested = inv.transactions
        .filter((t) => t.type === 'BUY' || t.type === 'DEPOSIT')
        .reduce((s, t) => s + t.amount, 0)
      const totalReturned = inv.transactions
        .filter((t) => t.type === 'SELL' || t.type === 'WITHDRAWAL' || t.type === 'DIVIDEND')
        .reduce((s, t) => s + t.amount, 0)
      const totalUnits = inv.transactions
        .filter((t) => t.type === 'BUY')
        .reduce((s, t) => s + (t.units || 0), 0)
      return { ...inv, totalInvested, totalReturned, totalUnits, profit: totalReturned - totalInvested }
    })

    const totalInvested = enriched.reduce((s, i) => s + i.totalInvested, 0)
    const totalReturned = enriched.reduce((s, i) => s + i.totalReturned, 0)

    return NextResponse.json({
      success: true,
      data: {
        investments: enriched,
        totalInvested,
        totalReturned,
        totalProfit: totalReturned - totalInvested,
      },
    })
  } catch (error) {
    console.error('GET investments error:', error)
    return NextResponse.json({ error: 'Failed to fetch investments' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, type, icon, color, targetAmount, description } = body
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

    const investment = await db.investment.create({
      data: {
        userId: DEMO_USER_ID,
        name,
        type: type || 'STOCK',
        icon: icon || 'trending-up',
        color: color || '#6b7280',
        targetAmount: targetAmount ? parseFloat(targetAmount) : null,
        description: description || null,
      },
    })

    return NextResponse.json({ success: true, data: investment }, { status: 201 })
  } catch (error) {
    console.error('POST investment error:', error)
    return NextResponse.json({ error: 'Failed to create investment' }, { status: 500 })
  }
}
