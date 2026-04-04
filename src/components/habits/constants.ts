// ─── Habits Constants & Helpers ───────────────────────────────────────────────

import { RU_DAYS_SHORT } from '@/lib/format'

// ─── Options ─────────────────────────────────────────────────────────────────

export const EMOJI_OPTIONS = [
  '✅', '🏃‍♂️', '📚', '💧', '🧘‍♂️', '💪', '🍎', '😴', '🧹', '✍️', '🎯',
]

export const COLOR_OPTIONS = [
  '#10b981', '#3b82f6', '#06b6d4', '#8b5cf6', '#f97316',
  '#ef4444', '#ec4899', '#f59e0b', '#14b8a6', '#6366f1',
]

export const DAY_LABELS = RU_DAYS_SHORT

const MOTIVATIONAL_PHRASES = [
  'Маленькие ежедневные действия создают большие результаты.',
  'Дисциплина — это мост между целями и достижениями.',
  'Каждый день — это новый шанс стать лучше, чем вчера.',
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getLast7Days(): string[] {
  const days: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

export function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr)
  const day = d.getDay()
  const idx = day === 0 ? 6 : day - 1
  return DAY_LABELS[idx]
}

export function getTodayDateBadge(): string {
  const now = new Date()
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
  ]
  const dayNames = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота']
  const dayName = dayNames[now.getDay()]
  const day = now.getDate()
  const month = months[now.getMonth()]
  return `${dayName}, ${day} ${month}`
}

export function getMotivationalPhrase(): string {
  const idx = new Date().getDate() % MOTIVATIONAL_PHRASES.length
  return MOTIVATIONAL_PHRASES[idx]
}
