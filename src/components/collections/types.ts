// ─── Collections Types ────────────────────────────────────────────────────────

export type CollectionType = 'BOOK' | 'MOVIE' | 'RECIPE' | 'SUPPLEMENT' | 'PRODUCT'
export type CollectionStatus = 'WANT' | 'IN_PROGRESS' | 'COMPLETED'

export interface CollectionItem {
  id: string
  type: CollectionType
  title: string
  author: string | null
  description: string | null
  coverUrl: string | null
  rating: number | null
  status: CollectionStatus
  tags: string
  notes: string | null
  createdAt: string
  updatedAt: string
}
