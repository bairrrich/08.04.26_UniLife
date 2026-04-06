import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const USER_ID = 'user_demo_001'
const LIMIT = 5

// Escape single quotes for SQL
function esc(s: string): string {
  return s.replace(/'/g, "''")
}

// Build a case-insensitive LIKE condition for SQLite.
// SQLite doesn't support COLLATE NOCASE for Cyrillic, so we use
// OR with all case combinations. For Cyrillic text, toLowerCase/toUpperCase
// may not perfectly roundtrip, so we include the original + lower + upper.
function buildLikeConditions(column: string, query: string): string {
  const q = esc(query)
  const l = esc(query.toLowerCase())
  const u = esc(query.toUpperCase())
  // Title case: first char uppercase, rest lowercase (e.g. "Бег" from "бег")
  const t = esc(query.charAt(0).toUpperCase() + query.slice(1).toLowerCase())
  // Deduplicate and filter same-as-original
  const variants = [q, l, u, t].filter((v, i, arr) => arr.indexOf(v) === i)
  if (variants.length === 1) {
    return `${column} LIKE '%${variants[0]}%'`
  }
  return `(${variants.map((v) => `${column} LIKE '%${v}%'`).join(' OR ')})`
}

function buildOrLikeConditions(columns: string[], query: string): string {
  return '(' + columns.map((col) => buildLikeConditions(col, query)).join(' OR ') + ')'
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  let q = searchParams.get('q')?.trim() || ''

  if (!q || q.length < 2) {
    return NextResponse.json({
      success: true,
      data: { diary: [], finance: [], nutrition: [], workout: [], collections: [], feed: [], habits: [], goals: [] },
    })
  }

  if (q.length > 100) {
    q = q.substring(0, 100)
  }

  try {
    // Diary
    const diary = await db.$queryRawUnsafe<{ id: string; title: string | null; content: string; date: Date }[]>(
      `SELECT id, title, content, date FROM "DiaryEntry" WHERE "userId" = '${USER_ID}' AND (${buildOrLikeConditions(['title', 'content'], q)}) ORDER BY date DESC LIMIT ${LIMIT}`,
    )

    // Finance
    const finance = await db.$queryRawUnsafe<{ id: string; description: string | null; amount: number; date: Date; type: string }[]>(
      `SELECT id, description, amount, date, type FROM "Transaction" WHERE "userId" = '${USER_ID}' AND (${buildOrLikeConditions(['description', "COALESCE(note, '')"], q)}) ORDER BY date DESC LIMIT ${LIMIT}`,
    )

    // Nutrition (meals + items)
    const nutrition = await db.$queryRawUnsafe<{ id: string; type: string; note: string | null; date: Date }[]>(
      `SELECT m.id, m.type, m.note, m.date FROM "Meal" m LEFT JOIN "MealItem" mi ON mi."mealId" = m.id WHERE m."userId" = '${USER_ID}' AND (${buildOrLikeConditions(['COALESCE(m.note, \'\')', 'mi.name'], q)}) GROUP BY m.id ORDER BY m.date DESC LIMIT ${LIMIT}`,
    )

    // Workouts
    const workout = await db.$queryRawUnsafe<{ id: string; name: string; durationMin: number | null; date: Date }[]>(
      `SELECT w.id, w.name, w."durationMin", w.date FROM "Workout" w LEFT JOIN "WorkoutExercise" we ON we."workoutId" = w.id WHERE w."userId" = '${USER_ID}' AND (${buildOrLikeConditions(['w.name', 'we.name'], q)}) GROUP BY w.id ORDER BY w.date DESC LIMIT ${LIMIT}`,
    )

    // Collections
    const collections = await db.$queryRawUnsafe<{ id: string; title: string; author: string | null; type: string }[]>(
      `SELECT id, title, author, type FROM "CollectionItem" WHERE "userId" = '${USER_ID}' AND (${buildOrLikeConditions(['title', "COALESCE(author, '')"], q)}) ORDER BY "createdAt" DESC LIMIT ${LIMIT}`,
    )

    // Feed
    const feed = await db.$queryRawUnsafe<{ id: string; caption: string | null; entityType: string; createdAt: Date }[]>(
      `SELECT id, caption, "entityType", "createdAt" FROM "Post" WHERE "userId" = '${USER_ID}' AND ${buildLikeConditions("COALESCE(caption, '')", q)} ORDER BY "createdAt" DESC LIMIT ${LIMIT}`,
    )

    // Habits
    const habits = await db.$queryRawUnsafe<{ id: string; name: string; emoji: string }[]>(
      `SELECT id, name, emoji FROM "Habit" WHERE "userId" = '${USER_ID}' AND ${buildLikeConditions('name', q)} ORDER BY "createdAt" DESC LIMIT ${LIMIT}`,
    )

    // Goals
    const goals = await db.$queryRawUnsafe<{ id: string; title: string; category: string }[]>(
      `SELECT id, title, category FROM "Goal" WHERE "userId" = '${USER_ID}' AND ${buildLikeConditions('title', q)} ORDER BY "createdAt" DESC LIMIT ${LIMIT}`,
    )

    return NextResponse.json({
      success: true,
      data: {
        diary: diary.map((d) => ({ id: d.id, title: d.title || 'Без названия', content: d.content?.substring(0, 120), date: d.date, type: 'diary' as const })),
        finance: finance.map((f) => ({ id: f.id, description: f.description || 'Без описания', amount: f.amount, date: f.date, type: 'finance' as const })),
        nutrition: nutrition.map((n) => ({ id: n.id, mealType: n.type, note: n.note || '', date: n.date, type: 'nutrition' as const })),
        workout: workout.map((w) => ({ id: w.id, name: w.name, durationMin: w.durationMin, date: w.date, type: 'workout' as const })),
        collections: collections.map((c) => ({ id: c.id, title: c.title, author: c.author || '', itemType: c.type, type: 'collections' as const })),
        feed: feed.map((f) => ({ id: f.id, caption: f.caption || '', entityType: f.entityType, createdAt: f.createdAt, type: 'feed' as const })),
        habits: habits.map((h) => ({ id: h.id, name: h.name, emoji: h.emoji, type: 'habits' as const })),
        goals: goals.map((g) => ({ id: g.id, title: g.title, category: g.category, type: 'goals' as const })),
      },
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ success: false, error: 'Ошибка при поиске' }, { status: 500 })
  }
}
