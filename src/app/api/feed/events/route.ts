import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { DEMO_USER_ID, safeParseJSON } from '@/lib/api'
import { ACTIVITY_VISIBILITY_VALUES } from '@/lib/activity-types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(Math.max(Number(searchParams.get('limit')) || 20, 1), 100)
    const cursor = searchParams.get('cursor')
    const type = searchParams.get('type') || undefined
    const entityType = searchParams.get('entityType') || undefined
    const visibility = searchParams.get('visibility') || undefined

    const where: Record<string, unknown> = { userId: DEMO_USER_ID }

    if (type) where.type = type
    if (entityType) where.entityType = entityType
    if (visibility && ACTIVITY_VISIBILITY_VALUES.includes(visibility as (typeof ACTIVITY_VISIBILITY_VALUES)[number])) {
      where.visibility = visibility
    }
    if (cursor) {
      const cursorDate = new Date(cursor)
      if (!Number.isNaN(cursorDate.getTime())) {
        where.createdAt = { lt: cursorDate }
      }
    }

    const events = await db.activityEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    if (events.length === 0) {
      return NextResponse.json({ success: true, data: [], nextCursor: null })
    }

    const entityPairs = events.map((event) => ({
      entityType: event.entityType,
      entityId: event.entityId,
    }))

    const linkedPosts = await db.post.findMany({
      where: {
        userId: DEMO_USER_ID,
        OR: entityPairs,
      },
      select: {
        id: true,
        entityType: true,
        entityId: true,
        caption: true,
        createdAt: true,
      },
    })

    const postByEntity = new Map<string, (typeof linkedPosts)[number]>()
    for (const post of linkedPosts) {
      const key = `${post.entityType}:${post.entityId}`
      if (!postByEntity.has(key)) {
        postByEntity.set(key, post)
      }
    }

    const data = events.map((event) => {
      const post = postByEntity.get(`${event.entityType}:${event.entityId}`)
      return {
        ...event,
        payload: safeParseJSON<Record<string, unknown>>(event.payload, {}),
        sharedInFeed: Boolean(post),
        post: post ?? null,
      }
    })

    const nextCursor = events.length === limit ? events[events.length - 1].createdAt.toISOString() : null

    return NextResponse.json({ success: true, data, nextCursor })
  } catch (error) {
    console.error('Feed events GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch feed events' },
      { status: 500 },
    )
  }
}
