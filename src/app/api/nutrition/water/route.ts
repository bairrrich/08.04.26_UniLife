import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const USER_ID = 'user_demo_001'
const DAILY_GOAL_ML = 2000
const DEFAULT_GLASS_ML = 250

// GET /api/nutrition/water?date=YYYY-MM-DD or ?month=YYYY-MM
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateStr = searchParams.get('date')
    const monthStr = searchParams.get('month')

    let where: any = { userId: USER_ID }

    if (dateStr) {
      // Specific day: return summary
      const startOfDay = new Date(dateStr + 'T00:00:00.000Z')
      const endOfDay = new Date(dateStr + 'T23:59:59.999Z')

      if (isNaN(startOfDay.getTime())) {
        return NextResponse.json(
          { success: false, error: 'Invalid date format. Use YYYY-MM-DD' },
          { status: 400 }
        )
      }

      where.date = {
        gte: startOfDay,
        lte: endOfDay,
      }

      const logs = await db.waterLog.findMany({
        where,
        orderBy: { createdAt: 'asc' },
      })

      const totalMl = logs.reduce((sum, log) => sum + log.amountMl, 0)
      const glasses = Math.round(totalMl / DEFAULT_GLASS_ML)

      return NextResponse.json({
        success: true,
        data: {
          totalMl,
          glasses,
          goalMl: DAILY_GOAL_ML,
          percentage: Math.min(Math.round((totalMl / DAILY_GOAL_ML) * 100), 100),
          logs,
        },
      })
    } else if (monthStr) {
      // Month range: return all logs
      const [year, month] = monthStr.split('-').map(Number)
      const startOfMonth = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0))
      const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999))

      where.date = {
        gte: startOfMonth,
        lte: endOfMonth,
      }

      const logs = await db.waterLog.findMany({
        where,
        orderBy: [{ date: 'asc' }, { createdAt: 'asc' }],
      })

      return NextResponse.json({ success: true, data: logs })
    } else {
      // No params: return today's summary
      const today = new Date()
      const startOfDay = new Date(
        Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0)
      )
      const endOfDay = new Date(
        Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999)
      )

      where.date = {
        gte: startOfDay,
        lte: endOfDay,
      }

      const logs = await db.waterLog.findMany({
        where,
        orderBy: { createdAt: 'asc' },
      })

      const totalMl = logs.reduce((sum, log) => sum + log.amountMl, 0)
      const glasses = Math.round(totalMl / DEFAULT_GLASS_ML)

      return NextResponse.json({
        success: true,
        data: {
          totalMl,
          glasses,
          goalMl: DAILY_GOAL_ML,
          percentage: Math.min(Math.round((totalMl / DAILY_GOAL_ML) * 100), 100),
          logs,
        },
      })
    }
  } catch (error) {
    console.error('GET /api/nutrition/water error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch water logs' },
      { status: 500 }
    )
  }
}

// POST /api/nutrition/water
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { date, amountMl } = body

    if (!date) {
      return NextResponse.json(
        { success: false, error: 'Date is required' },
        { status: 400 }
      )
    }

    const parsedDate = new Date(date + 'T00:00:00.000Z')
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { success: false, error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      )
    }

    const waterLog = await db.waterLog.create({
      data: {
        userId: USER_ID,
        date: parsedDate,
        amountMl: amountMl ?? DEFAULT_GLASS_ML,
      },
    })

    return NextResponse.json({ success: true, data: waterLog }, { status: 201 })
  } catch (error) {
    console.error('POST /api/nutrition/water error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add water log' },
      { status: 500 }
    )
  }
}

// DELETE /api/nutrition/water?date=YYYY-MM-DD — deletes all water logs for a given date
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateStr = searchParams.get('date')

    // Default to today if no date provided
    let startOfDay: Date
    let endOfDay: Date

    if (dateStr) {
      startOfDay = new Date(dateStr + 'T00:00:00.000Z')
      endOfDay = new Date(dateStr + 'T23:59:59.999Z')
      if (isNaN(startOfDay.getTime())) {
        return NextResponse.json(
          { success: false, error: 'Invalid date format. Use YYYY-MM-DD' },
          { status: 400 }
        )
      }
    } else {
      const today = new Date()
      startOfDay = new Date(
        Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0)
      )
      endOfDay = new Date(
        Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999)
      )
    }

    const result = await db.waterLog.deleteMany({
      where: {
        userId: USER_ID,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: { deleted: result.count },
    })
  } catch (error) {
    console.error('DELETE /api/nutrition/water error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete water logs' },
      { status: 500 }
    )
  }
}
