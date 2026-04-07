import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { DEMO_USER_ID, apiSuccessMessage, apiError, apiServerError } from '@/lib/api'

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
      return apiError('Not found', 404)
    }

    if (investment.transactions.length === 0) {
      return apiError('Transaction not found', 404)
    }

    await db.investmentTx.delete({ where: { id: txId } })

    return apiSuccessMessage('Транзакция удалена')
  } catch (error) {
    console.error('DELETE investment tx error:', error)
    return apiServerError('Failed to delete transaction')
  }
}
