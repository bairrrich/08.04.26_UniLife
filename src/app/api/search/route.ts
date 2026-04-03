import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const USER_ID = 'user_demo_001'
const LIMIT = 5

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim() || ''

  if (q.length < 2) {
    return NextResponse.json({
      success: true,
      data: {
        diary: [],
        finance: [],
        nutrition: [],
        workout: [],
        collections: [],
        feed: [],
      },
    })
  }

  try {
    const likePattern = `%${q}%`

    // Diary entries
    const diary = await db.diaryEntry.findMany({
      where: {
        userId: USER_ID,
        OR: [
          { title: { contains: q } },
          { content: { contains: q } },
        ],
      },
      select: { id: true, title: true, content: true, date: true },
      orderBy: { date: 'desc' },
      take: LIMIT,
    })

    // Transactions
    const finance = await db.transaction.findMany({
      where: {
        userId: USER_ID,
        OR: [
          { description: { contains: q } },
          { note: { contains: q } },
        ],
      },
      select: { id: true, description: true, amount: true, date: true, type: true },
      orderBy: { date: 'desc' },
      take: LIMIT,
    })

    // Meals (with items)
    const mealIds = await db.mealItem.findMany({
      where: { name: { contains: q } },
      select: { mealId: true },
      distinct: ['mealId'],
      take: LIMIT,
    }).then((items) => items.map((i) => i.mealId))

    const nutrition = await db.meal.findMany({
      where: {
        userId: USER_ID,
        OR: [
          { note: { contains: q } },
          ...(mealIds.length > 0 ? [{ id: { in: mealIds } }] : []),
        ],
      },
      select: { id: true, type: true, note: true, date: true },
      orderBy: { date: 'desc' },
      take: LIMIT,
    })

    // Workouts
    const workoutExerciseIds = await db.workoutExercise.findMany({
      where: { name: { contains: q } },
      select: { workoutId: true },
      distinct: ['workoutId'],
      take: LIMIT,
    }).then((items) => items.map((i) => i.workoutId))

    const workout = await db.workout.findMany({
      where: {
        userId: USER_ID,
        OR: [
          { name: { contains: q } },
          ...(workoutExerciseIds.length > 0 ? [{ id: { in: workoutExerciseIds } }] : []),
        ],
      },
      select: { id: true, name: true, durationMin: true, date: true },
      orderBy: { date: 'desc' },
      take: LIMIT,
    })

    // Collection items
    const collections = await db.collectionItem.findMany({
      where: {
        userId: USER_ID,
        OR: [
          { title: { contains: q } },
          { author: { contains: q } },
        ],
      },
      select: { id: true, title: true, author: true, type: true },
      orderBy: { createdAt: 'desc' },
      take: LIMIT,
    })

    // Posts
    const feed = await db.post.findMany({
      where: {
        userId: USER_ID,
        caption: { contains: q },
      },
      select: { id: true, caption: true, entityType: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: LIMIT,
    })

    return NextResponse.json({
      success: true,
      data: {
        diary: diary.map((d) => ({
          id: d.id,
          title: d.title || 'Без названия',
          content: d.content?.substring(0, 120),
          date: d.date,
          type: 'diary' as const,
        })),
        finance: finance.map((f) => ({
          id: f.id,
          description: f.description || 'Без описания',
          amount: f.amount,
          date: f.date,
          type: 'finance' as const,
        })),
        nutrition: nutrition.map((n) => ({
          id: n.id,
          mealType: n.type,
          note: n.note || '',
          date: n.date,
          type: 'nutrition' as const,
        })),
        workout: workout.map((w) => ({
          id: w.id,
          name: w.name,
          durationMin: w.durationMin,
          date: w.date,
          type: 'workout' as const,
        })),
        collections: collections.map((c) => ({
          id: c.id,
          title: c.title,
          author: c.author || '',
          itemType: c.type,
          type: 'collections' as const,
        })),
        feed: feed.map((f) => ({
          id: f.id,
          caption: f.caption || '',
          entityType: f.entityType,
          createdAt: f.createdAt,
          type: 'feed' as const,
        })),
      },
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка при поиске' },
      { status: 500 },
    )
  }
}
