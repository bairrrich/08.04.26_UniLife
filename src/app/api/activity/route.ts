import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { DEMO_USER_ID, parseBody, safeParseJSON, safeStringify } from '@/lib/api'
import { ACTIVITY_VISIBILITY_VALUES } from '@/lib/activity-types'

const createActivitySchema = z.object({
  type: z.string().min(1, 'Тип события обязателен'),
  entityType: z.string().min(1, 'Тип сущности обязателен'),
  entityId: z.string().min(1, 'ID сущности обязателен'),
  visibility: z.enum(ACTIVITY_VISIBILITY_VALUES).optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(Math.max(Number(searchParams.get('limit')) || 20, 1), 100)
    const type = searchParams.get('type') || undefined
    const entityType = searchParams.get('entityType') || undefined
    const visibility = searchParams.get('visibility') || undefined

    const where: Record<string, unknown> = { userId: DEMO_USER_ID }
    if (type) where.type = type
    if (entityType) where.entityType = entityType
    if (visibility && ACTIVITY_VISIBILITY_VALUES.includes(visibility as (typeof ACTIVITY_VISIBILITY_VALUES)[number])) {
      where.visibility = visibility
    }

    const events = await db.activityEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json({
      success: true,
      data: events.map((event) => ({
        ...event,
        payload: safeParseJSON(event.payload, {}),
      })),
    })
  } catch (error) {
    console.error('Activity GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch activity events' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await parseBody(request, createActivitySchema)
    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      )
    }

    const event = await db.activityEvent.create({
      data: {
        userId: DEMO_USER_ID,
        type: data.type,
        entityType: data.entityType,
        entityId: data.entityId,
        visibility: data.visibility ?? 'private',
        payload: safeStringify(data.payload ?? {}),
      },
    })

    return NextResponse.json({ success: true, data: event }, { status: 201 })
  } catch (error) {
    console.error('Activity POST error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create activity event' },
      { status: 500 }
    )
  }
}
