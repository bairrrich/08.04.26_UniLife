// ─── Feed Constants ───────────────────────────────────────────────────────────

import {
  BookOpen,
  Wallet,
  UtensilsCrossed,
  Dumbbell,
  Layers,
} from 'lucide-react'
import type { EntityType, ReactionType } from './types'

// ─── Entity Config ───────────────────────────────────────────────────────────

export const ENTITY_LABELS: Record<EntityType, string> = {
  diary: 'Дневник',
  transaction: 'Финансы',
  meal: 'Питание',
  workout: 'Тренировка',
  collection: 'Коллекции',
}

export const ENTITY_ICONS: Record<EntityType, React.ReactNode> = {
  diary: <BookOpen className="h-4 w-4" />,
  transaction: <Wallet className="h-4 w-4" />,
  meal: <UtensilsCrossed className="h-4 w-4" />,
  workout: <Dumbbell className="h-4 w-4" />,
  collection: <Layers className="h-4 w-4" />,
}

export const ENTITY_ICONS_LARGE: Record<EntityType, React.ReactNode> = {
  diary: <BookOpen className="h-5 w-5" />,
  transaction: <Wallet className="h-5 w-5" />,
  meal: <UtensilsCrossed className="h-5 w-5" />,
  workout: <Dumbbell className="h-5 w-5" />,
  collection: <Layers className="h-5 w-5" />,
}

export const ENTITY_COLORS: Record<EntityType, string> = {
  diary: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  transaction: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  meal: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  workout: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  collection: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
}

export const ENTITY_BORDER: Record<EntityType, string> = {
  diary: 'border-l-emerald-500',
  transaction: 'border-l-amber-500',
  meal: 'border-l-rose-500',
  workout: 'border-l-blue-500',
  collection: 'border-l-violet-500',
}

export const ENTITY_ICON_BG: Record<EntityType, string> = {
  diary: 'bg-emerald-500',
  transaction: 'bg-amber-500',
  meal: 'bg-rose-500',
  workout: 'bg-blue-500',
  collection: 'bg-violet-500',
}

// ─── Reactions ───────────────────────────────────────────────────────────────

export const REACTION_OPTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: 'like', emoji: '👍', label: 'Нравится' },
  { type: 'love', emoji: '❤️', label: 'Любовь' },
  { type: 'fire', emoji: '🔥', label: 'Огонь' },
  { type: 'applause', emoji: '👏', label: 'Аплодисменты' },
  { type: 'wow', emoji: '😮', label: 'Вау' },
]

export const REACTION_EMOJI: Record<ReactionType, string> = {
  like: '👍',
  love: '❤️',
  fire: '🔥',
  applause: '👏',
  wow: '😮',
}

// ─── Misc ────────────────────────────────────────────────────────────────────

export const QUICK_EMOJIS = ['😊', '🔥', '💪', '🎉', '❤️', '🌟', '📚', '🏃']

export const MAX_CAPTION_LENGTH = 500
export const MAX_COMMENT_LENGTH = 300

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function formatRelativeTime(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMin / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMin < 1) return 'только что'
  if (diffMin < 60) {
    const lastDigit = diffMin % 10
    const lastTwo = diffMin % 100
    if (lastTwo >= 11 && lastTwo <= 19) return `${diffMin} минут назад`
    if (lastDigit === 1) return `${diffMin} минуту назад`
    if (lastDigit >= 2 && lastDigit <= 4) return `${diffMin} минуты назад`
    return `${diffMin} минут назад`
  }
  if (diffHours < 24) {
    const lastDigit = diffHours % 10
    const lastTwo = diffHours % 100
    if (lastTwo >= 11 && lastTwo <= 19) return `${diffHours} часов назад`
    if (lastDigit === 1) return `${diffHours} час назад`
    if (lastDigit >= 2 && lastDigit <= 4) return `${diffHours} часа назад`
    return `${diffHours} часов назад`
  }

  // For posts older than 24 hours, show formatted date: "5 апр. в 14:30"
  const day = date.getDate()
  const months = ['янв.', 'фев.', 'мар.', 'апр.', 'мая', 'июн.', 'июл.', 'авг.', 'сен.', 'окт.', 'ноя.', 'дек.']
  const month = months[date.getMonth()]
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  // Check if same year
  if (date.getFullYear() === now.getFullYear()) {
    return `${day} ${month} в ${hours}:${minutes}`
  }
  // Different year
  return `${day} ${month} ${date.getFullYear()} в ${hours}:${minutes}`
}

export function getTimeGroup(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  const weekAgo = new Date(today.getTime() - 7 * 86400000)
  const postDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  if (postDate.getTime() === today.getTime()) return 'Сегодня'
  if (postDate.getTime() === yesterday.getTime()) return 'Вчера'
  if (postDate >= weekAgo) return 'На этой неделе'
  return 'Ранее'
}

export function parsePostTags(tagsStr: string): string[] {
  try {
    return JSON.parse(tagsStr)
  } catch {
    return []
  }
}

export function generateRandomId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
}
