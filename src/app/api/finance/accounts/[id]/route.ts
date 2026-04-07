import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { DEMO_USER_ID, apiSuccess, apiSuccessMessage, apiError, apiServerError } from '@/lib/api'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const existing = await db.account.findUnique({ where: { id } })
    if (!existing || existing.userId !== DEMO_USER_ID) {
      return apiError('Not found', 404)
    }

    const body = await request.json()
    const { name, type, icon, color, balance, isDefault } = body

    if (isDefault) {
      await db.account.updateMany({
        where: { userId: DEMO_USER_ID, isDefault: true },
        data: { isDefault: false },
      })
    }

    const account = await db.account.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(type !== undefined && { type }),
        ...(icon !== undefined && { icon }),
        ...(color !== undefined && { color }),
        ...(balance !== undefined && { balance: parseFloat(balance) }),
        ...(isDefault !== undefined && { isDefault }),
      },
    })

    return apiSuccess(account)
  } catch (error) {
    console.error('PUT account error:', error)
    return apiServerError('Failed to update account')
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const existing = await db.account.findUnique({ where: { id } })
    if (!existing || existing.userId !== DEMO_USER_ID) {
      return apiError('Not found', 404)
    }

    await db.account.delete({ where: { id } })
    return apiSuccessMessage('Счёт удалён')
  } catch (error) {
    console.error('DELETE account error:', error)
    return apiServerError('Failed to delete account')
  }
}
