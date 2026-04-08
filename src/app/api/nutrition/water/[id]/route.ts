import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { DEMO_USER_ID, apiSuccessMessage, apiError, apiServerError } from '@/lib/api'

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

    if (!existing || existing.userId !== DEMO_USER_ID) {
      return apiError('Запись воды не найдена', 404)
    }

    // Delete the water log
    await db.waterLog.delete({
      where: { id },
    })

    return apiSuccessMessage('Запись воды удалена')
  } catch (error) {
    console.error('Water DELETE error:', error)
    return apiServerError('Failed to delete water log')
  }
}
