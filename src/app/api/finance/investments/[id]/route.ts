import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { DEMO_USER_ID, apiSuccess, apiSuccessMessage, apiError, apiServerError } from '@/lib/api'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const existing = await db.investment.findUnique({ where: { id } })
    if (!existing || existing.userId !== DEMO_USER_ID) {
      return apiError('Not found', 404)
    }

    const body = await request.json()
    const { name, type, icon, color, targetAmount, description } = body

    const investment = await db.investment.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(type !== undefined && { type }),
        ...(icon !== undefined && { icon }),
        ...(color !== undefined && { color }),
        ...(targetAmount !== undefined && { targetAmount: targetAmount ? parseFloat(targetAmount) : null }),
        ...(description !== undefined && { description: description || null }),
      },
    })

    return apiSuccess(investment)
  } catch (error) {
    console.error('PUT investment error:', error)
    return apiServerError('Failed to update investment')
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const existing = await db.investment.findUnique({ where: { id } })
    if (!existing || existing.userId !== DEMO_USER_ID) {
      return apiError('Not found', 404)
    }

    await db.investment.delete({ where: { id } })
    return apiSuccessMessage('Инвестиция удалена')
  } catch (error) {
    console.error('DELETE investment error:', error)
    return apiServerError('Failed to delete investment')
  }
}

// POST /api/finance/investments/[id] — add a transaction to an investment
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const existing = await db.investment.findUnique({ where: { id } })
    if (!existing || existing.userId !== DEMO_USER_ID) {
      return apiError('Not found', 404)
    }

    const body = await request.json()
    const { type, amount, units, pricePerUnit, date, note } = body
    if (!type || !amount || !date) {
      return apiError('type, amount, date required')
    }
    if (!['BUY', 'SELL', 'DEPOSIT', 'WITHDRAWAL', 'DIVIDEND'].includes(type)) {
      return apiError('Invalid type')
    }

    const tx = await db.investmentTx.create({
      data: {
        investmentId: id,
        type,
        amount: parseFloat(amount),
        units: units ? parseFloat(units) : null,
        pricePerUnit: pricePerUnit ? parseFloat(pricePerUnit) : null,
        date: new Date(date),
        note: note || null,
      },
    })

    return apiSuccess(tx, 201)
  } catch (error) {
    console.error('POST investment tx error:', error)
    return apiServerError('Failed to add investment transaction')
  }
}
