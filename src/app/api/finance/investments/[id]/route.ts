import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const DEMO_USER_ID = 'user_demo_001'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const existing = await db.investment.findUnique({ where: { id } })
    if (!existing || existing.userId !== DEMO_USER_ID) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
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

    return NextResponse.json({ success: true, data: investment })
  } catch (error) {
    console.error('PUT investment error:', error)
    return NextResponse.json({ error: 'Failed to update investment' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const existing = await db.investment.findUnique({ where: { id } })
    if (!existing || existing.userId !== DEMO_USER_ID) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await db.investment.delete({ where: { id } })
    return NextResponse.json({ success: true, message: 'Инвестиция удалена' })
  } catch (error) {
    console.error('DELETE investment error:', error)
    return NextResponse.json({ error: 'Failed to delete investment' }, { status: 500 })
  }
}

// POST /api/finance/investments/[id] — add a transaction to an investment
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const existing = await db.investment.findUnique({ where: { id } })
    if (!existing || existing.userId !== DEMO_USER_ID) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const body = await request.json()
    const { type, amount, units, pricePerUnit, date, note } = body
    if (!type || !amount || !date) {
      return NextResponse.json({ error: 'type, amount, date required' }, { status: 400 })
    }
    if (!['BUY', 'SELL', 'DEPOSIT', 'WITHDRAWAL', 'DIVIDEND'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
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

    return NextResponse.json({ success: true, data: tx }, { status: 201 })
  } catch (error) {
    console.error('POST investment tx error:', error)
    return NextResponse.json({ error: 'Failed to add investment transaction' }, { status: 500 })
  }
}
