// ─── Feed Types ──────────────────────────────────────────────────────────────

export type EntityType = 'diary' | 'transaction' | 'meal' | 'workout' | 'collection'

export type ReactionType = 'like' | 'love' | 'fire' | 'applause' | 'wow'

export interface ReactionCounts {
  like: number
  love: number
  fire: number
  applause: number
  wow: number
}

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
  tags: string
  createdAt: string
  updatedAt: string
  user: FeedUser
  likes: { id: string }[]
  comments: FeedComment[]
  _count: { likes: number }
}

export type ActivityVisibility = 'private' | 'friends' | 'public'

export interface FeedEventPostProjection {
  id: string
  entityType: EntityType
  entityId: string
  caption: string | null
  createdAt: string
}

export interface FeedEvent {
  id: string
  userId: string
  type: string
  entityType: EntityType
  entityId: string
  visibility: ActivityVisibility
  payload: Record<string, unknown>
  createdAt: string
  sharedInFeed: boolean
  post: FeedEventPostProjection | null
}
