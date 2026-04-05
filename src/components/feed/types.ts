// ─── Feed Types ──────────────────────────────────────────────────────────────

export type EntityType = 'diary' | 'transaction' | 'meal' | 'workout' | 'collection'

export interface FeedUser {
  id: string
  name: string | null
  avatar: string | null
}

export interface FeedComment {
  id: string
  content: string
  createdAt: string
  user: FeedUser
}

export interface FeedPost {
  id: string
  userId: string
  entityType: EntityType
  entityId: string
  caption: string | null
  createdAt: string
  updatedAt: string
  user: FeedUser
  likes: { id: string }[]
  comments: FeedComment[]
  _count: { likes: number }
}
