import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

const USER_ID = 'user_demo_001'

export async function POST() {
  try {
    await db.transaction.deleteMany({ where: { userId: USER_ID } })
    await db.mealItem.deleteMany({ where: { meal: { userId: USER_ID } } })
    await db.meal.deleteMany({ where: { userId: USER_ID } })
    await db.waterLog.deleteMany({ where: { userId: USER_ID } })
    await db.workoutExercise.deleteMany({ where: { workout: { userId: USER_ID } } })
    await db.workout.deleteMany({ where: { userId: USER_ID } })
    await db.collectionItem.deleteMany({ where: { userId: USER_ID } })
    await db.comment.deleteMany({ where: { post: { userId: USER_ID } } })
    await db.like.deleteMany({ where: { post: { userId: USER_ID } } })
    await db.post.deleteMany({ where: { userId: USER_ID } })
    await db.diaryEntry.deleteMany({ where: { userId: USER_ID } })
    await db.category.deleteMany({ where: { userId: USER_ID } })

    return NextResponse.json({ success: true, message: 'Все данные очищены' })
  } catch (error) {
    console.error('Clear data error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to clear data' },
      { status: 500 }
    )
  }
}
