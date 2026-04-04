import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const USER_ID = 'user_demo_001'

// GET /api/habits — Fetch all habits with today's logs and streaks
export async function GET() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Fetch habits with today's logs (single query)
    const habits = await db.habit.findMany({
      where: { userId: USER_ID },
      include: {
        logs: {
          where: {
            date: {
              gte: today,
              lt: tomorrow,
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    // Fetch ALL logs for all habits in a single query (for streaks & last7Days)
    const habitIds = habits.map((h) => h.id)
    const allLogs = habitIds.length > 0
      ? await db.habitLog.findMany({
          where: { habitId: { in: habitIds } },
          orderBy: { date: 'desc' },
        })
      : []

    // Group logs by habit ID
    const logsByHabit = new Map<string, typeof allLogs>()
    for (const log of allLogs) {
      const existing = logsByHabit.get(log.habitId) || []
      existing.push(log)
      logsByHabit.set(log.habitId, existing)
    }

    // Calculate streaks and last7Days for each habit (in-memory, no extra queries)
    const habitsWithStreaks = habits.map((habit) => {
      const habitLogs = logsByHabit.get(habit.id) || []

      let streak = 0
      const checkDate = new Date()
      checkDate.setHours(0, 0, 0, 0)

      // If today is not completed, start from yesterday
      const todayLog = habitLogs.find((log) => {
        const logDate = new Date(log.date)
        logDate.setHours(0, 0, 0, 0)
        return logDate.getTime() === checkDate.getTime()
      })

      if (!todayLog) {
        checkDate.setDate(checkDate.getDate() - 1)
      }

      for (let i = 0; i < 365; i++) {
        const targetDate = new Date(checkDate)
        targetDate.setDate(targetDate.getDate() - i)
        targetDate.setHours(0, 0, 0, 0)

        const found = habitLogs.find((log) => {
          const logDate = new Date(log.date)
          logDate.setHours(0, 0, 0, 0)
          return logDate.getTime() === targetDate.getTime()
        })

        if (found) {
          streak++
        } else {
          break
        }
      }

      // Get last 7 days logs for mini-grid
      const last7DaysLogs: Record<string, boolean> = {}
      for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        d.setHours(0, 0, 0, 0)
        const key = d.toISOString().split('T')[0]
        const found = habitLogs.find((log) => {
          const logDate = new Date(log.date)
          logDate.setHours(0, 0, 0, 0)
          return logDate.getTime() === d.getTime()
        })
        last7DaysLogs[key] = !!found
      }

      return {
        ...habit,
        streak,
        todayCompleted: habit.logs.length > 0,
        last7Days: last7DaysLogs,
      }
    })

    // Calculate global stats
    const totalActive = habits.length
    const completedToday = habitsWithStreaks.filter((h) => h.todayCompleted).length
    const bestStreak = habitsWithStreaks.reduce(
      (max, h) => Math.max(max, h.streak),
      0
    )

    return NextResponse.json({
      success: true,
      data: habitsWithStreaks,
      stats: {
        totalActive,
        completedToday,
        bestStreak,
      },
    })
  } catch (error) {
    console.error('Habits GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch habits' },
      { status: 500 }
    )
  }
}

// POST /api/habits — Create new habit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, emoji, color, frequency, targetCount } = body

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'name is required' },
        { status: 400 }
      )
    }

    const habit = await db.habit.create({
      data: {
        userId: USER_ID,
        name: name.trim(),
        emoji: emoji || '✅',
        color: color || '#10b981',
        frequency: frequency || 'daily',
        targetCount: targetCount || 1,
      },
    })

    return NextResponse.json({ success: true, data: habit }, { status: 201 })
  } catch (error) {
    console.error('Habits POST error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create habit' },
      { status: 500 }
    )
  }
}
