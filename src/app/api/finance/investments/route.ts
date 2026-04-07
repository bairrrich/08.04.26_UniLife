import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { DEMO_USER_ID, apiSuccess, apiError, apiServerError } from '@/lib/api'

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

    return apiSuccess({
      investments: enriched,
      totalInvested,
      totalReturned,
      totalProfit: totalReturned - totalInvested,
    })
  } catch (error) {
    console.error('GET investments error:', error)
    return apiServerError('Failed to fetch investments')
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, type, icon, color, targetAmount, description } = body
    if (!name) return apiError('Name is required')

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

    return apiSuccess(investment, 201)
  } catch (error) {
    console.error('POST investment error:', error)
    return apiServerError('Failed to create investment')
  }
}
