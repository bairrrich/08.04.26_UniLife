import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const USER_ID = 'user_demo_001'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') // format: YYYY-MM

    const where: Record<string, unknown> = { userId: USER_ID }

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
    const body = await request.json()
    const { name, date, durationMin, note, exercises } = body

    if (!name || !date) {
      return NextResponse.json(
        { success: false, error: 'name and date are required' },
        { status: 400 }
      )
    }

    const workout = await db.workout.create({
      data: {
        userId: USER_ID,
        name,
        date: new Date(date),
        durationMin: durationMin ?? null,
        note: note ?? null,
        exercises: {
          create: (exercises ?? []).map(
            (ex: {
              name: string
              sets?: unknown
              notes?: string
              order?: number
            }, index: number) => ({
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

    return NextResponse.json({ success: true, data: workout }, { status: 201 })
  } catch (error) {
    console.error('Workout POST error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create workout' },
      { status: 500 }
    )
  }
}
