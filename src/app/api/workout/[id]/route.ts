import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { DEMO_USER_ID, apiSuccess, apiSuccessMessage, apiError, apiServerError } from '@/lib/api'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verify ownership
    const existing = await db.workout.findUnique({
      where: { id },
    })

    if (!existing || existing.userId !== DEMO_USER_ID) {
      return apiError('Тренировка не найдена', 404)
    }

    // Delete the workout (cascade will remove exercises)
    await db.workout.delete({
      where: { id },
    })

    return apiSuccessMessage('Тренировка удалена')
  } catch (error) {
    console.error('Workout DELETE error:', error)
    return apiServerError('Failed to delete workout')
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verify ownership
    const existing = await db.workout.findUnique({
      where: { id },
      include: { exercises: true },
    })

    if (!existing || existing.userId !== DEMO_USER_ID) {
      return apiError('Тренировка не найдена', 404)
    }

    const body = await request.json()
    const { name, date, durationMin, note, exercises } = body

    if (!name || !date) {
      return apiError('name and date are required')
    }

    // Get existing exercise IDs
    const existingExerciseIds = existing.exercises.map((ex) => ex.id)
    const incomingExerciseIds = (exercises ?? [])
      .filter((ex: { id?: string }) => ex.id)
      .map((ex: { id: string }) => ex.id)

    // Delete removed exercises
    const toDelete = existingExerciseIds.filter(
      (eid) => !incomingExerciseIds.includes(eid)
    )
    if (toDelete.length > 0) {
      await db.workoutExercise.deleteMany({
        where: { id: { in: toDelete } },
      })
    }

    // Update workout
    const updated = await db.workout.update({
      where: { id },
      data: {
        name,
        date: new Date(date),
        durationMin: durationMin ?? null,
        note: note ?? null,
      },
      include: {
        exercises: {
          orderBy: { order: 'asc' },
        },
      },
    })

    // Upsert exercises
    for (let i = 0; i < (exercises ?? []).length; i++) {
      const ex = exercises[i] as {
        id?: string
        name: string
        sets?: unknown
        notes?: string
        order?: number
      }

      if (ex.id && existingExerciseIds.includes(ex.id)) {
        // Update existing exercise
        await db.workoutExercise.update({
          where: { id: ex.id },
          data: {
            name: ex.name,
            sets: ex.sets ? JSON.stringify(ex.sets) : '[]',
            notes: ex.notes ?? null,
            order: i,
          },
        })
      } else {
        // Create new exercise
        await db.workoutExercise.create({
          data: {
            workoutId: id,
            name: ex.name,
            sets: ex.sets ? JSON.stringify(ex.sets) : '[]',
            notes: ex.notes ?? null,
            order: i,
          },
        })
      }
    }

    // Fetch final result
    const result = await db.workout.findUnique({
      where: { id },
      include: {
        exercises: {
          orderBy: { order: 'asc' },
        },
      },
    })

    return apiSuccess(result)
  } catch (error) {
    console.error('Workout PUT error:', error)
    return apiServerError('Failed to update workout')
  }
}
