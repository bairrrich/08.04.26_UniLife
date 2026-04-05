import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

const USER_ID = 'user_demo_001'

export async function GET() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Run all counts in parallel for efficiency
    const [
      diaryCount,
      financeCount,
      nutritionCount,
      workoutCount,
      habitsResult,
      goalsCount,
      collectionsCount,
      feedCount,
    ] = await Promise.all([
      // Diary: entries created today
      db.diaryEntry.count({
        where: {
          userId: USER_ID,
          createdAt: { gte: today, lt: tomorrow },
        },
      }),
      // Finance: transactions today
      db.transaction.count({
        where: {
          userId: USER_ID,
          date: { gte: today, lt: tomorrow },
        },
      }),
      // Nutrition: meals today
      db.meal.count({
        where: {
          userId: USER_ID,
          date: { gte: today, lt: tomorrow },
        },
      }),
      // Workout: workouts today
      db.workout.count({
        where: {
          userId: USER_ID,
          date: { gte: today, lt: tomorrow },
        },
      }),
      // Habits: uncompleted today
      db.habit.count({
        where: {
          userId: USER_ID,
          logs: {
            none: {
              date: { gte: today, lt: tomorrow },
            },
          },
        },
      }),
      // Goals: active goals with progress >= 80%
      db.goal.count({
        where: {
          userId: USER_ID,
          status: 'active',
          progress: { gte: 80 },
        },
      }),
      // Collections: total items
      db.collectionItem.count({
        where: {
          userId: USER_ID,
        },
      }),
      // Feed: posts from last 24 hours (as proxy for "new")
      db.post.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      }),
    ])

    const counts: Record<string, number> = {
      diary: diaryCount,
      finance: financeCount,
      nutrition: nutritionCount,
      workout: workoutCount,
      habits: habitsResult,
      goals: goalsCount,
      collections: collectionsCount,
      feed: feedCount,
    }

    return NextResponse.json({ success: true, counts })
  } catch (error) {
    console.error('Module counts error:', error)
    return NextResponse.json(
      { success: false, counts: {} },
      { status: 500 }
    )
  }
}
