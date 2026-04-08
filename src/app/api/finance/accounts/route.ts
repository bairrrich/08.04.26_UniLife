import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { DEMO_USER_ID, apiSuccess, apiError, apiServerError } from '@/lib/api'

export async function GET() {
  try {
    const accounts = await db.account.findMany({
      where: { userId: DEMO_USER_ID },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    })
    return apiSuccess(accounts)
  } catch (error) {
    console.error('GET /api/finance/accounts error:', error)
    return apiServerError('Failed to fetch accounts')
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, type, icon, color, balance, isDefault } = body
    if (!name) return apiError('Name is required')

    // If setting as default, unset other defaults
    if (isDefault) {
      await db.account.updateMany({
        where: { userId: DEMO_USER_ID, isDefault: true },
        data: { isDefault: false },
      })
    }

    const account = await db.account.create({
      data: {
        userId: DEMO_USER_ID,
        name,
        type: type || 'CASH',
        icon: icon || 'wallet',
        color: color || '#6b7280',
        balance: parseFloat(balance) || 0,
        isDefault: isDefault || false,
      },
    })

    return apiSuccess(account, 201)
  } catch (error) {
    console.error('POST /api/finance/accounts error:', error)
    return apiServerError('Failed to create account')
  }
}
