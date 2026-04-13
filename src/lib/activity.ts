import { db } from '@/lib/db'
import { safeStringify } from '@/lib/api'
import { ActivityEventType, ActivityVisibility } from '@/lib/activity-types'

interface PublishActivityInput {
  userId: string
  type: ActivityEventType | string
  entityType: string
  entityId: string
  payload?: Record<string, unknown>
  visibility?: ActivityVisibility
  shareToFeed?: boolean
  caption?: string
  tags?: string[]
}

export async function publishActivityEvent(input: PublishActivityInput) {
  const event = await db.activityEvent.create({
    data: {
      userId: input.userId,
      type: input.type,
      entityType: input.entityType,
      entityId: input.entityId,
      visibility: input.visibility ?? 'private',
      payload: safeStringify(input.payload ?? {}),
    },
  })

  if (input.shareToFeed) {
    await db.post.create({
      data: {
        userId: input.userId,
        entityType: input.entityType,
        entityId: input.entityId,
        caption: input.caption ?? null,
        tags: safeStringify(input.tags ?? []),
      },
    })
  }

  return event
}
