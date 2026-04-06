import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const DEMO_USER_ID = 'user_demo_001'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; txId: string }> }
) {
  try {
    const { id, txId } = await params

    // Verify the investment belongs to the user
    const investment = await db.investment.findUnique({
      where: { id },
      include: { transactions: { where: { id: txId } } },
    })

    if (!investment || investment.userId !== DEMO_USER_ID) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (investment.transactions.length === 0) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    await db.investmentTx.delete({ where: { id: txId } })

    return NextResponse.json({ success: true, message: 'Транзакция удалена' })
  } catch (error) {
    console.error('DELETE investment tx error:', error)
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 })
  }
}
