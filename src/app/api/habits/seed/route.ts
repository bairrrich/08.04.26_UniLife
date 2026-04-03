import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

const USER_ID = 'user_demo_001'

export async function POST() {
  try {
    const habitData = [
      { name: 'Утренняя зарядка', emoji: '✅', color: '#10b981', frequency: 'daily', targetCount: 1 },
      { name: 'Чтение 30 минут', emoji: '📚', color: '#3b82f6', frequency: 'daily', targetCount: 1 },
      { name: '8 стаканов воды', emoji: '💧', color: '#06b6d4', frequency: 'daily', targetCount: 1 },
      { name: 'Медитация', emoji: '🧘‍♂️', color: '#8b5cf6', frequency: 'daily', targetCount: 1 },
      { name: 'Бег 5 км', emoji: '🏃‍♂️', color: '#f97316', frequency: 'weekly', targetCount: 1 },
    ]

    const now = new Date()

    await db.habitLog.deleteMany({ where: { habit: { userId: USER_ID } } })
    await db.habit.deleteMany({ where: { userId: USER_ID } })

    for (const h of habitData) {
      const habit = await db.habit.create({
        data: { userId: USER_ID, ...h },
      })

      for (let i = 1; i < 14; i++) {
        if (h.frequency === 'weekly' && Math.random() > 0.3) continue
        if (Math.random() > 0.8) continue

        const date = new Date(now)
        date.setDate(date.getDate() - i)
        date.setHours(8, 0, 0, 0)

        try {
          await db.habitLog.create({
            data: { habitId: habit.id, date, count: 1 },
          })
        } catch {
          // Skip duplicate dates
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Habits seeded' })
  } catch (error) {
    console.error('Habits seed error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
