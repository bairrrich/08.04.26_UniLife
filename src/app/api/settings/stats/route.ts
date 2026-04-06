import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

const USER_ID = 'user_demo_001'

export async function GET() {
  try {
    const [
      diaryCount,
      transactionCount,
      categoryCount,
      mealCount,
      waterLogCount,
      workoutCount,
      collectionCount,
      postCount,
      commentCount,
      likeCount,
    ] = await Promise.all([
      db.diaryEntry.count({ where: { userId: USER_ID } }),
      db.transaction.count({ where: { userId: USER_ID } }),
      db.category.count({ where: { userId: USER_ID } }),
      db.meal.count({ where: { userId: USER_ID } }),
      db.waterLog.count({ where: { userId: USER_ID } }),
      db.workout.count({ where: { userId: USER_ID } }),
      db.collectionItem.count({ where: { userId: USER_ID } }),
      db.post.count({ where: { userId: USER_ID } }),
      db.comment.count(),
      db.like.count(),
    ])

    const totalRecords =
      diaryCount +
      transactionCount +
      categoryCount +
      mealCount +
      waterLogCount +
      workoutCount +
      collectionCount +
      postCount +
      commentCount +
      likeCount

    // Rough storage estimate: ~500 bytes per record on average
    const storageEstimateKB = Math.round(totalRecords * 0.5)

    return NextResponse.json({
      success: true,
      data: {
        modules: {
          diary: diaryCount,
          transactions: transactionCount,
          categories: categoryCount,
          meals: mealCount,
          waterLogs: waterLogCount,
          workouts: workoutCount,
          collections: collectionCount,
          posts: postCount,
          comments: commentCount,
          likes: likeCount,
        },
        totalRecords,
        storageEstimateKB,
      },
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
