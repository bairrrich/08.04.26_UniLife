import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const USER_ID = 'user_demo_001'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verify ownership
    const existing = await db.waterLog.findUnique({
      where: { id },
    })

    if (!existing || existing.userId !== USER_ID) {
      return NextResponse.json(
        { success: false, error: 'Запись воды не найдена' },
        { status: 404 }
      )
    }

    // Delete the water log
    await db.waterLog.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'Запись воды удалена' })
  } catch (error) {
    console.error('Water DELETE error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete water log' },
      { status: 500 }
    )
  }
}
