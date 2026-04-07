import { db } from '@/lib/db'
import { DEMO_USER_ID, apiSuccess, apiServerError } from '@/lib/api'

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
      habitCount,
      goalCount,
    ] = await Promise.all([
      db.diaryEntry.count({ where: { userId: DEMO_USER_ID } }),
      db.transaction.count({ where: { userId: DEMO_USER_ID } }),
      db.category.count({ where: { userId: DEMO_USER_ID } }),
      db.meal.count({ where: { userId: DEMO_USER_ID } }),
      db.waterLog.count({ where: { userId: DEMO_USER_ID } }),
      db.workout.count({ where: { userId: DEMO_USER_ID } }),
      db.collectionItem.count({ where: { userId: DEMO_USER_ID } }),
      db.post.count({ where: { userId: DEMO_USER_ID } }),
      db.comment.count(),
      db.like.count(),
      db.habit.count({ where: { userId: DEMO_USER_ID } }),
      db.goal.count({ where: { userId: DEMO_USER_ID } }),
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
      likeCount +
      habitCount +
      goalCount

    // Rough storage estimate: ~500 bytes per record on average
    const storageEstimateKB = Math.round(totalRecords * 0.5)

    return apiSuccess({
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
        habits: habitCount,
        goals: goalCount,
      },
      totalRecords,
      storageEstimateKB,
    })
  } catch (error) {
    console.error('Stats error:', error)
    return apiServerError('Failed to fetch stats')
  }
}
