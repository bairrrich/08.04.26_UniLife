// ─── Collections Types ────────────────────────────────────────────────────────

export type CollectionType =
  | 'BOOK'
  | 'MOVIE'
  | 'ANIME'
  | 'SERIES'
  | 'MUSIC'
  | 'RECIPE'
  | 'SUPPLEMENT'
  | 'PRODUCT'
  | 'PLACE'

export interface CollectionItem {
  id: string
  type: CollectionType
  title: string
  author: string | null
  description: string | null
  coverUrl: string | null
  rating: number | null
  details: string
  tags: string
  notes: string | null
  createdAt: string
  updatedAt: string
}

// ─── Type-specific detail interfaces ──────────────────────────────────────────

export interface BookDetails {
  genre?: string
  pages?: number
  year?: number
  language?: string
}

export interface MovieDetails {
  genre?: string
  year?: number
  durationMin?: number
  platform?: string
}

export interface AnimeDetails {
  genre?: string
  episodes?: number
  year?: number
  studio?: string
  status?: string
}

export interface SeriesDetails {
  genre?: string
  episodes?: number
  seasons?: number
  year?: number
  platform?: string
}

export interface MusicDetails {
  genre?: string
  artist?: string
  album?: string
  year?: number
}

export interface RecipeDetails {
  servings?: number
  cookTimeMin?: number
  difficulty?: string
  calories?: number
  ingredients?: string
}

export interface SupplementDetails {
  brand?: string
  dosage?: string
  frequency?: string
  courseDays?: number
  purpose?: string
}

export interface ProductDetails {
  brand?: string
  price?: number
  store?: string
  category?: string
  url?: string
}

export interface PlaceDetails {
  address?: string
  category?: string
  url?: string
  rating?: number
}

export type TypeSpecificDetails =
  | BookDetails
  | MovieDetails
  | AnimeDetails
  | SeriesDetails
  | MusicDetails
  | RecipeDetails
  | SupplementDetails
  | ProductDetails
  | PlaceDetails

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function parseDetails(detailsStr: string): Record<string, unknown> {
  try {
    return JSON.parse(detailsStr)
  } catch {
    return {}
  }
}
