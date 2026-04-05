// ─── Feed Constants ───────────────────────────────────────────────────────────

import {
  BookOpen,
  Wallet,
  Apple,
  Dumbbell,
  Library,
} from 'lucide-react'
import type { EntityType } from './types'

// ─── Entity Config ───────────────────────────────────────────────────────────

export const ENTITY_LABELS: Record<EntityType, string> = {
  diary: '📝 Дневник',
  transaction: '💰 Финансы',
  meal: '🍎 Питание',
  workout: '💪 Тренировка',
  collection: '📚 Коллекции',
}

export const ENTITY_ICONS: Record<EntityType, React.ReactNode> = {
  diary: <BookOpen className="h-4 w-4" />,
  transaction: <Wallet className="h-4 w-4" />,
  meal: <Apple className="h-4 w-4" />,
  workout: <Dumbbell className="h-4 w-4" />,
  collection: <Library className="h-4 w-4" />,
}

export const ENTITY_COLORS: Record<EntityType, string> = {
  diary: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  transaction: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  meal: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  workout: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  collection: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
}

export const ENTITY_BORDER: Record<EntityType, string> = {
  diary: 'border-l-blue-500',
  transaction: 'border-l-emerald-500',
  meal: 'border-l-rose-500',
  workout: 'border-l-orange-500',
  collection: 'border-l-purple-500',
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
  if (diffDays === 1) return 'вчера'
  if (diffDays < 7) {
    const lastDigit = diffDays % 10
    const lastTwo = diffDays % 100
    if (lastTwo >= 11 && lastTwo <= 19) return `${diffDays} дней назад`
    if (lastDigit === 1) return `${diffDays} день назад`
    if (lastDigit >= 2 && lastDigit <= 4) return `${diffDays} дня назад`
    return `${diffDays} дней назад`
  }
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    const lastDigit = weeks % 10
    const lastTwo = weeks % 100
    if (lastTwo >= 11 && lastTwo <= 19) return `${weeks} недель назад`
    if (lastDigit === 1) return `${weeks} неделю назад`
    if (lastDigit >= 2 && lastDigit <= 4) return `${weeks} недели назад`
    return `${weeks} недель назад`
  }
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

export function generateRandomId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
}
