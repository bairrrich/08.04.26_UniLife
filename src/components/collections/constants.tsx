// ─── Collections Constants ────────────────────────────────────────────────────

import type { CollectionType, CollectionStatus } from './types'
import {
  BookOpen,
  Film,
  ChefHat,
  Pill,
  Package,
} from 'lucide-react'

// ─── Labels ──────────────────────────────────────────────────────────────────

export const TYPE_LABELS: Record<CollectionType, string> = {
  BOOK: 'Книги',
  MOVIE: 'Фильмы',
  RECIPE: 'Рецепты',
  SUPPLEMENT: 'БАДы',
  PRODUCT: 'Продукты',
}

export const STATUS_LABELS: Record<CollectionStatus, string> = {
  WANT: 'Хочу',
  IN_PROGRESS: 'В процессе',
  COMPLETED: 'Завершено',
}

// ─── Status Colors ────────────────────────────────────────────────────────────

export const STATUS_COLORS: Record<CollectionStatus, string> = {
  WANT: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  IN_PROGRESS: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  COMPLETED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
}

export const STATUS_BUTTON_STYLES: Record<CollectionStatus, string> = {
  WANT: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800 dark:hover:bg-blue-900/50',
  IN_PROGRESS: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800 dark:hover:bg-amber-900/50',
  COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800 dark:hover:bg-emerald-900/50',
}

export const STATUS_TRANSITIONS: Record<CollectionStatus, CollectionStatus> = {
  WANT: 'IN_PROGRESS',
  IN_PROGRESS: 'COMPLETED',
  COMPLETED: 'WANT',
}

// ─── Type Icons ───────────────────────────────────────────────────────────────

export const TYPE_ICONS: Record<CollectionType, React.ReactNode> = {
  BOOK: <BookOpen className="h-4 w-4" />,
  MOVIE: <Film className="h-4 w-4" />,
  RECIPE: <ChefHat className="h-4 w-4" />,
  SUPPLEMENT: <Pill className="h-4 w-4" />,
  PRODUCT: <Package className="h-4 w-4" />,
}

export const TYPE_ICONS_LARGE: Record<CollectionType, React.ReactNode> = {
  BOOK: <BookOpen className="h-8 w-8" />,
  MOVIE: <Film className="h-8 w-8" />,
  RECIPE: <ChefHat className="h-8 w-8" />,
  SUPPLEMENT: <Pill className="h-8 w-8" />,
  PRODUCT: <Package className="h-8 w-8" />,
}

// ─── Type Colors ──────────────────────────────────────────────────────────────

export const TYPE_COLORS: Record<CollectionType, string> = {
  BOOK: 'bg-amber-50 text-amber-600',
  MOVIE: 'bg-purple-50 text-purple-600',
  RECIPE: 'bg-rose-50 text-rose-600',
  SUPPLEMENT: 'bg-cyan-50 text-cyan-600',
  PRODUCT: 'bg-emerald-50 text-emerald-600',
}

// ─── Cover Gradients ──────────────────────────────────────────────────────────

const COVER_COLORS: string[] = [
  'from-rose-400 to-pink-500',
  'from-blue-400 to-indigo-500',
  'from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-500',
  'from-purple-400 to-violet-500',
  'from-cyan-400 to-sky-500',
  'from-fuchsia-400 to-pink-500',
  'from-lime-400 to-green-500',
]

export function getCoverGradient(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  return COVER_COLORS[Math.abs(hash) % COVER_COLORS.length]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function parseTags(tagsStr: string): string[] {
  try {
    return JSON.parse(tagsStr)
  } catch {
    return []
  }
}

const GENITIVE_MONTHS = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
]

export function formatDateRussian(dateStr: string): string {
  const date = new Date(dateStr)
  const day = date.getDate()
  const month = GENITIVE_MONTHS[date.getMonth()]
  const year = date.getFullYear()
  return `${day} ${month} ${year}`
}
