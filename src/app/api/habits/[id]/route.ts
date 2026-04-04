import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const USER_ID = 'user_demo_001'

// PUT /api/habits/[id] — Toggle habit log for today (create or delete)
export async function PUT(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const habit = await db.habit.findUnique({
      where: { id },
    })

    if (!habit || habit.userId !== USER_ID) {
      return NextResponse.json(
        { success: false, error: 'Habit not found' },
        { status: 404 }
      )
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Check if today's log exists
    const existingLog = await db.habitLog.findUnique({
      where: {
        habitId_date: {
          habitId: id,
          date: today,
        },
      },
    })

    if (existingLog) {
      // Delete log (un-complete)
      await db.habitLog.delete({
        where: { id: existingLog.id },
      })

      return NextResponse.json({
        success: true,
        data: { completed: false, message: 'Habit unchecked' },
      })
    } else {
      // Create log (complete)
      const newLog = await db.habitLog.create({
        data: {
          habitId: id,
          date: today,
          count: 1,
        },
      })

      return NextResponse.json({
        success: true,
        data: { completed: true, log: newLog },
      })
    }
  } catch (error) {
    console.error('Habits PUT error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to toggle habit' },
      { status: 500 }
    )
  }
}

// PATCH /api/habits/[id] — Update habit details
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const habit = await db.habit.findUnique({
      where: { id },
    })

    if (!habit || habit.userId !== USER_ID) {
      return NextResponse.json(
        { success: false, error: 'Habit not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { name, emoji, color, frequency, targetCount } = body

    const updated = await db.habit.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(emoji !== undefined && { emoji }),
        ...(color !== undefined && { color }),
        ...(frequency !== undefined && { frequency }),
        ...(targetCount !== undefined && { targetCount }),
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Habits PATCH error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update habit' },
      { status: 500 }
    )
  }
}

// DELETE /api/habits/[id] — Delete habit
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const habit = await db.habit.findUnique({
      where: { id },
    })

    if (!habit || habit.userId !== USER_ID) {
      return NextResponse.json(
        { success: false, error: 'Habit not found' },
        { status: 404 }
      )
    }

    await db.habit.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'Habit deleted' })
  } catch (error) {
    console.error('Habits DELETE error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete habit' },
      { status: 500 }
    )
  }
}
