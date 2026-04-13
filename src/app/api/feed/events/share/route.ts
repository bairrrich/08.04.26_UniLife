import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { DEMO_USER_ID, parseBody, safeStringify } from '@/lib/api'

const shareEventSchema = z.object({
  eventId: z.string().min(1, 'eventId is required'),
  caption: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

const unshareEventSchema = z.object({
  eventId: z.string().min(1, 'eventId is required'),
})

export async function POST(request: NextRequest) {
  try {
    const data = await parseBody(request, shareEventSchema)
    if (!data) {
      return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 })
    }

    const event = await db.activityEvent.findFirst({
      where: { id: data.eventId, userId: DEMO_USER_ID },
    })

    if (!event) {
      return NextResponse.json({ success: false, error: 'Activity event not found' }, { status: 404 })
    }

    const existingPost = await db.post.findFirst({
      where: {
        userId: DEMO_USER_ID,
        entityType: event.entityType,
        entityId: event.entityId,
      },
    })

    if (existingPost) {
      return NextResponse.json({ success: true, data: existingPost })
    }

    const post = await db.post.create({
      data: {
        userId: DEMO_USER_ID,
        entityType: event.entityType,
        entityId: event.entityId,
        caption: data.caption ?? null,
        tags: safeStringify(data.tags ?? []),
      },
    })

    return NextResponse.json({ success: true, data: post }, { status: 201 })
  } catch (error) {
    console.error('Feed share POST error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to share activity event' },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const data = await parseBody(request, unshareEventSchema)
    if (!data) {
      return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 })
    }

    const event = await db.activityEvent.findFirst({
      where: { id: data.eventId, userId: DEMO_USER_ID },
    })

    if (!event) {
      return NextResponse.json({ success: false, error: 'Activity event not found' }, { status: 404 })
    }

    const existingPost = await db.post.findFirst({
      where: {
        userId: DEMO_USER_ID,
        entityType: event.entityType,
        entityId: event.entityId,
      },
      select: { id: true },
    })

    if (!existingPost) {
      return NextResponse.json({ success: true, message: 'Already unshared' })
    }

    await db.post.delete({ where: { id: existingPost.id } })

    return NextResponse.json({ success: true, message: 'Unshared successfully' })
  } catch (error) {
    console.error('Feed share DELETE error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to unshare activity event' },
      { status: 500 },
    )
  }
}
