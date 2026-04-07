import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { DEMO_USER_ID, apiSuccess, apiError, apiServerError } from '@/lib/api'

export async function GET(request: NextRequest) {
  try {
    const module_ = request.nextUrl.searchParams.get('module')

    if (!module_ || module_ === 'all') {
      const [diary, transactions, categories, meals, waterLogs, workouts, collections, posts] =
        await Promise.all([
          db.diaryEntry.findMany({ where: { userId: DEMO_USER_ID } }),
          db.transaction.findMany({
            where: { userId: DEMO_USER_ID },
            include: { category: true, subCategory: true },
          }),
          db.category.findMany({ where: { userId: DEMO_USER_ID } }),
          db.meal.findMany({
            where: { userId: DEMO_USER_ID },
            include: { items: true },
          }),
          db.waterLog.findMany({ where: { userId: DEMO_USER_ID } }),
          db.workout.findMany({
            where: { userId: DEMO_USER_ID },
            include: { exercises: true },
          }),
          db.collectionItem.findMany({ where: { userId: DEMO_USER_ID } }),
          db.post.findMany({
            where: { userId: DEMO_USER_ID },
            include: {
              user: { select: { id: true, name: true, email: true, avatar: true } },
              _count: { select: { likes: true, comments: true } },
            },
          }),
        ])

      return NextResponse.json({
        success: true,
        data: {
          diary,
          finance: { transactions, categories },
          nutrition: { meals, waterLogs },
          workouts,
          collections,
          feed: posts,
        },
        exportedAt: new Date().toISOString(),
      })
    }

    // Individual module exports
    switch (module_) {
      case 'diary': {
        const data = await db.diaryEntry.findMany({ where: { userId: DEMO_USER_ID } })
        return apiSuccess(data)
      }
      case 'finance': {
        const [transactions, categories] = await Promise.all([
          db.transaction.findMany({
            where: { userId: DEMO_USER_ID },
            include: { category: true, subCategory: true },
          }),
          db.category.findMany({ where: { userId: DEMO_USER_ID } }),
        ])
        return apiSuccess({ transactions, categories })
      }
      case 'nutrition': {
        const [meals, waterLogs] = await Promise.all([
          db.meal.findMany({
            where: { userId: DEMO_USER_ID },
            include: { items: true },
          }),
          db.waterLog.findMany({ where: { userId: DEMO_USER_ID } }),
        ])
        return apiSuccess({ meals, waterLogs })
      }
      case 'workout': {
        const data = await db.workout.findMany({
          where: { userId: DEMO_USER_ID },
          include: { exercises: true },
        })
        return apiSuccess(data)
      }
      case 'collections': {
        const data = await db.collectionItem.findMany({ where: { userId: DEMO_USER_ID } })
        return apiSuccess(data)
      }
      case 'feed': {
        const data = await db.post.findMany({
          where: { userId: DEMO_USER_ID },
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true } },
            _count: { select: { likes: true, comments: true } },
          },
        })
        return apiSuccess(data)
      }
      case 'habits': {
        const [habits, habitLogs] = await Promise.all([
          db.habit.findMany({ where: { userId: DEMO_USER_ID } }),
          db.habitLog.findMany({
            where: { habit: { userId: DEMO_USER_ID } },
          }),
        ])
        return apiSuccess({ habits, habitLogs })
      }
      case 'goals': {
        const data = await db.goal.findMany({ where: { userId: DEMO_USER_ID } })
        return apiSuccess(data)
      }
      default:
        return apiError(`Unknown module: ${module_}`)
    }
  } catch (error) {
    console.error('Export error:', error)
    return apiServerError('Failed to export data')
  }
}
