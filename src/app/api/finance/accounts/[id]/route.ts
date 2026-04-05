import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const DEMO_USER_ID = 'user_demo_001'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const existing = await db.account.findUnique({ where: { id } })
    if (!existing || existing.userId !== DEMO_USER_ID) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
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

    return NextResponse.json({ success: true, data: account })
  } catch (error) {
    console.error('PUT account error:', error)
    return NextResponse.json({ error: 'Failed to update account' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const existing = await db.account.findUnique({ where: { id } })
    if (!existing || existing.userId !== DEMO_USER_ID) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await db.account.delete({ where: { id } })
    return NextResponse.json({ success: true, message: 'Счёт удалён' })
  } catch (error) {
    console.error('DELETE account error:', error)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }
}
