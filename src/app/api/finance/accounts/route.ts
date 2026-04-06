import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const DEMO_USER_ID = 'user_demo_001'

export async function GET() {
  try {
    const accounts = await db.account.findMany({
      where: { userId: DEMO_USER_ID },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    })
    return NextResponse.json({ success: true, data: accounts })
  } catch (error) {
    console.error('GET /api/finance/accounts error:', error)
    return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, type, icon, color, balance, isDefault } = body
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

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

    return NextResponse.json({ success: true, data: account }, { status: 201 })
  } catch (error) {
    console.error('POST /api/finance/accounts error:', error)
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }
}
