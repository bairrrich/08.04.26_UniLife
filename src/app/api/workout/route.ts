import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { parseBody, DEMO_USER_ID } from '@/lib/api'
import { publishActivityEvent } from '@/lib/activity'
import { ACTIVITY_EVENT_TYPES, ACTIVITY_VISIBILITY_VALUES } from '@/lib/activity-types'

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

const exerciseSchema = z.object({
  name: z.string(),
  sets: z.unknown().optional(),
  notes: z.string().optional(),
  order: z.number().optional(),
})

const createWorkoutSchema = z.object({
  name: z.string().min(1, 'Название тренировки обязательно'),
  date: z.string().min(1, 'Дата обязательна'),
  durationMin: z.number().optional(),
  note: z.string().optional(),
  shareToFeed: z.boolean().optional(),
  visibility: z.enum(ACTIVITY_VISIBILITY_VALUES).optional(),
  caption: z.string().optional(),
  exercises: z.array(exerciseSchema).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') // format: YYYY-MM

    const where: Record<string, unknown> = { userId: DEMO_USER_ID }

    if (month) {
      const [year, mon] = month.split('-').map(Number)
      const startDate = new Date(year, mon - 1, 1)
      const endDate = new Date(year, mon, 0, 23, 59, 59, 999)
      where.date = {
        gte: startDate,
        lte: endDate,
      }
    }

    const workouts = await db.workout.findMany({
      where,
      include: {
        exercises: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json({ success: true, data: workouts })
  } catch (error) {
    console.error('Workout GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch workouts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await parseBody(request, createWorkoutSchema)
    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      )
    }

    const { name, date, durationMin, note, exercises, shareToFeed, visibility, caption } = data

    const workout = await db.workout.create({
      data: {
        userId: DEMO_USER_ID,
        name,
        date: new Date(date),
        durationMin: durationMin ?? null,
        note: note ?? null,
        exercises: {
          create: (exercises ?? []).map(
            (ex, index) => ({
              name: ex.name,
              sets: ex.sets ? JSON.stringify(ex.sets) : '[]',
              notes: ex.notes ?? null,
              order: ex.order ?? index,
            })
          ),
        },
      },
      include: {
        exercises: {
          orderBy: { order: 'asc' },
        },
      },
    })

    await publishActivityEvent({
      userId: DEMO_USER_ID,
      type: ACTIVITY_EVENT_TYPES.WORKOUT_COMPLETED,
      entityType: 'workout',
      entityId: workout.id,
      visibility: visibility ?? 'private',
      shareToFeed: shareToFeed ?? false,
      caption,
      payload: {
        name: workout.name,
        date: workout.date.toISOString(),
        durationMin: workout.durationMin,
        exercisesCount: workout.exercises.length,
      },
    })

    return NextResponse.json({ success: true, data: workout }, { status: 201 })
  } catch (error) {
    console.error('Workout POST error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create workout' },
      { status: 500 }
    )
  }
}
