import { db } from '@/lib/db'
import { DEMO_USER_ID, apiSuccess, apiServerError } from '@/lib/api'

interface ModuleLastActivity {
  diary: string | null
  transactions: string | null
  meals: string | null
  workouts: string | null
  collections: string | null
  posts: string | null
  habits: string | null
  goals: string | null
  shifts: string | null
}

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
      shiftCount,
      // Last activity queries
      diaryLast,
      transactionLast,
      mealLast,
      workoutLast,
      collectionLast,
      postLast,
      habitLast,
      goalLast,
      shiftLast,
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
      db.shift.count({ where: { userId: DEMO_USER_ID } }),
      // Get the most recent updatedAt for each module
      db.diaryEntry.findFirst({
        where: { userId: DEMO_USER_ID },
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true },
      }),
      db.transaction.findFirst({
        where: { userId: DEMO_USER_ID },
        orderBy: { date: 'desc' },
        select: { date: true },
      }),
      db.meal.findFirst({
        where: { userId: DEMO_USER_ID },
        orderBy: { date: 'desc' },
        select: { date: true },
      }),
      db.workout.findFirst({
        where: { userId: DEMO_USER_ID },
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true },
      }),
      db.collectionItem.findFirst({
        where: { userId: DEMO_USER_ID },
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true },
      }),
      db.post.findFirst({
        where: { userId: DEMO_USER_ID },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
      db.habit.findFirst({
        where: { userId: DEMO_USER_ID },
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true },
      }),
      db.goal.findFirst({
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true },
      }),
      db.shift.findFirst({
        where: { userId: DEMO_USER_ID },
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true },
      }),
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
      goalCount +
      shiftCount

    // Rough storage estimate: ~500 bytes per record on average
    const storageEstimateKB = Math.round(totalRecords * 0.5)

    const lastActivity: ModuleLastActivity = {
      diary: diaryLast?.updatedAt?.toISOString() ?? null,
      transactions: transactionLast?.date?.toISOString() ?? null,
      meals: mealLast?.date?.toISOString() ?? null,
      workouts: workoutLast?.updatedAt?.toISOString() ?? null,
      collections: collectionLast?.updatedAt?.toISOString() ?? null,
      posts: postLast?.createdAt?.toISOString() ?? null,
      habits: habitLast?.updatedAt?.toISOString() ?? null,
      goals: goalLast?.updatedAt?.toISOString() ?? null,
      shifts: shiftLast?.updatedAt?.toISOString() ?? null,
    }

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
        shifts: shiftCount,
      },
      lastActivity,
      totalRecords,
      storageEstimateKB,
    })
  } catch (error) {
    console.error('Stats error:', error)
    return apiServerError('Failed to fetch stats')
  }
}
