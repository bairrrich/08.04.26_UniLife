import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { apiSuccess, apiServerError, DEMO_USER_ID as USER_ID } from '@/lib/api'

const LIMIT = 5

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  let q = searchParams.get('q')?.trim() || ''

  if (!q || q.length < 2) {
    return apiSuccess({ diary: [], finance: [], nutrition: [], workout: [], collections: [], feed: [], habits: [], goals: [] })
  }

  if (q.length > 100) {
    q = q.substring(0, 100)
  }

  try {
    // Diary — search title and content
    const diary = await db.diaryEntry.findMany({
      where: {
        userId: USER_ID,
        OR: [
          { title: { contains: q } },
          { content: { contains: q } },
        ],
      },
      orderBy: { date: 'desc' },
      take: LIMIT,
    })

    // Finance — search description and note
    const finance = await db.transaction.findMany({
      where: {
        userId: USER_ID,
        OR: [
          { description: { contains: q } },
          { note: { contains: q } },
        ],
      },
      orderBy: { date: 'desc' },
      take: LIMIT,
    })

    // Nutrition — search meal note and item names
    const meals = await db.meal.findMany({
      where: {
        userId: USER_ID,
        OR: [
          { note: { contains: q } },
          { items: { some: { name: { contains: q } } } },
        ],
      },
      orderBy: { date: 'desc' },
      take: LIMIT,
    })

    // Workouts — search workout name and exercise names
    const workouts = await db.workout.findMany({
      where: {
        userId: USER_ID,
        OR: [
          { name: { contains: q } },
          { exercises: { some: { name: { contains: q } } } },
        ],
      },
      orderBy: { date: 'desc' },
      take: LIMIT,
    })

    // Collections — search title and author
    const collections = await db.collectionItem.findMany({
      where: {
        userId: USER_ID,
        OR: [
          { title: { contains: q } },
          { author: { contains: q } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: LIMIT,
    })

    // Feed — search caption
    const feed = await db.post.findMany({
      where: {
        userId: USER_ID,
        caption: { contains: q },
      },
      orderBy: { createdAt: 'desc' },
      take: LIMIT,
    })

    // Habits — search name
    const habits = await db.habit.findMany({
      where: {
        userId: USER_ID,
        name: { contains: q },
      },
      orderBy: { createdAt: 'desc' },
      take: LIMIT,
    })

    // Goals — search title
    const goals = await db.goal.findMany({
      where: {
        userId: USER_ID,
        title: { contains: q },
      },
      orderBy: { createdAt: 'desc' },
      take: LIMIT,
    })

    return apiSuccess({
      diary: diary.map((d) => ({ id: d.id, title: d.title || 'Без названия', content: d.content?.substring(0, 120), date: d.date, type: 'diary' as const })),
      finance: finance.map((f) => ({ id: f.id, description: f.description || 'Без описания', amount: f.amount, date: f.date, type: 'finance' as const })),
      nutrition: meals.map((n) => ({ id: n.id, mealType: n.type, note: n.note || '', date: n.date, type: 'nutrition' as const })),
      workout: workouts.map((w) => ({ id: w.id, name: w.name, durationMin: w.durationMin, date: w.date, type: 'workout' as const })),
      collections: collections.map((c) => ({ id: c.id, title: c.title, author: c.author || '', itemType: c.type, type: 'collections' as const })),
      feed: feed.map((f) => ({ id: f.id, caption: f.caption || '', entityType: f.entityType, createdAt: f.createdAt, type: 'feed' as const })),
      habits: habits.map((h) => ({ id: h.id, name: h.name, emoji: h.emoji, type: 'habits' as const })),
      goals: goals.map((g) => ({ id: g.id, title: g.title, category: g.category, type: 'goals' as const })),
    })
  } catch (error) {
    console.error('Search error:', error)
    return apiServerError('Ошибка при поиске')
  }
}
