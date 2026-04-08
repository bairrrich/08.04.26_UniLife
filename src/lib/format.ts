// ─── Shared Formatting & Date Utilities ─────────────────────────────────────
// Common helpers used across multiple modules to eliminate duplication.

// ─── Currency ────────────────────────────────────────────────────────────────

const RUB_FORMATTER = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function formatCurrency(amount: number): string {
  return RUB_FORMATTER.format(amount)
}

// ─── Date Helpers ────────────────────────────────────────────────────────────

export function toDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function getTodayStr(): string {
  return toDateStr(new Date())
}

export function getCurrentMonthStr(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export function getWeekRange(): { from: string; to: string } {
  const now = new Date()
  const day = now.getDay()
  const diff = day === 0 ? 6 : day - 1
  const monday = new Date(now)
  monday.setDate(now.getDate() - diff)
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)
  return { from: monday.toISOString(), to: sunday.toISOString() }
}

export function getLast7DaysRange(): { from: string; to: string } {
  const now = new Date()
  const sevenDaysAgo = new Date(now)
  sevenDaysAgo.setDate(now.getDate() - 6)
  sevenDaysAgo.setHours(0, 0, 0, 0)
  return { from: sevenDaysAgo.toISOString(), to: now.toISOString() }
}

// ─── Greeting ────────────────────────────────────────────────────────────────

export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'Доброе утро'
  if (hour >= 12 && hour < 17) return 'Добрый день'
  if (hour >= 17 && hour < 22) return 'Добрый вечер'
  return 'Доброй ночи'
}

// ─── Relative Time ───────────────────────────────────────────────────────────

export function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return 'некогда'

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  if (diffMs < 0) return 'только что'

  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffSecs < 60) return 'только что'
  if (diffMins < 5) return 'менее 5 минут назад'
  if (diffMins < 10) return 'менее 10 минут назад'
  if (diffMins < 30) return 'менее 30 минут назад'
  if (diffMins < 60) return `${diffMins} мин назад`
  if (diffHours === 1) return '1 час назад'
  if (diffHours < 5) return `${diffHours} часа назад`
  if (diffHours < 12) return `${diffHours} часов назад`
  if (diffHours < 24) return 'вчера'
  if (diffDays === 1) return 'вчера'
  if (diffDays === 2) return 'позавчера'
  if (diffDays < 7) return `${diffDays} дней назад`
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

// ─── Streak Calculation ──────────────────────────────────────────────────────

export function calculateStreak(dates: string[]): number {
  if (dates.length === 0) return 0

  const uniqueDates = new Set(
    dates.map((d) => toDateStr(new Date(d)))
  )

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = toDateStr(today)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = toDateStr(yesterday)

  if (!uniqueDates.has(todayStr) && !uniqueDates.has(yesterdayStr)) return 0

  let streak = 0
  const checkDate = uniqueDates.has(todayStr) ? new Date(today) : new Date(yesterday)

  const MAX_STREAK_ITERATIONS = 10000

  while (streak < MAX_STREAK_ITERATIONS) {
    const checkStr = toDateStr(checkDate)
    if (uniqueDates.has(checkStr)) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}

// ─── Day of Year ─────────────────────────────────────────────────────────────

export function getDayOfYear(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - start.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

// ─── Russian Locale Constants ────────────────────────────────────────────────

export const RU_DAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

export const RU_MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
]

export const RU_MONTHS_SHORT = [
  'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
  'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек',
]

// ─── Mood Constants ──────────────────────────────────────────────────────────

export const MOOD_EMOJI: Record<number, string> = {
  1: '😢',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😄',
}

export const MOOD_LABELS: Record<number, string> = {
  1: 'Ужасно',
  2: 'Плохо',
  3: 'Нормально',
  4: 'Хорошо',
  5: 'Отлично',
}

export const MOOD_COLORS: Record<number, string> = {
  1: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  2: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  3: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300',
  4: 'bg-lime-100 text-lime-700 dark:bg-lime-950 dark:text-lime-300',
  5: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
}

export const MOOD_DOT_COLORS: Record<number, string> = {
  1: 'bg-red-400',
  2: 'bg-orange-400',
  3: 'bg-yellow-400',
  4: 'bg-lime-400',
  5: 'bg-emerald-400',
}

export const MOOD_BORDER_CLASS: Record<number, string> = {
  1: 'mood-border-1',
  2: 'mood-border-2',
  3: 'mood-border-3',
  4: 'mood-border-4',
  5: 'mood-border-5',
}

export const MOOD_GRADIENT: Record<number, string> = {
  1: 'from-red-50/30 to-transparent dark:from-red-950/20',
  2: 'from-orange-50/30 to-transparent dark:from-orange-950/20',
  3: 'from-yellow-50/30 to-transparent dark:from-yellow-950/20',
  4: 'from-lime-50/30 to-transparent dark:from-lime-950/20',
  5: 'from-emerald-50/30 to-transparent dark:from-emerald-950/20',
}

// ─── Date Range by Period ────────────────────────────────────────────────────

export type Period = 'week' | 'month' | 'year'

export function getDateRange(period: Period): { from: string; to: string } {
  const now = new Date()
  const from = new Date(now)
  const to = new Date(now)

  if (period === 'week') {
    const day = now.getDay()
    const diff = day === 0 ? 6 : day - 1
    from.setDate(now.getDate() - diff)
    from.setHours(0, 0, 0, 0)
    to.setHours(23, 59, 59, 999)
  } else if (period === 'month') {
    from.setDate(1)
    from.setHours(0, 0, 0, 0)
    to.setHours(23, 59, 59, 999)
  } else {
    from.setMonth(0, 1)
    from.setHours(0, 0, 0, 0)
    to.setHours(23, 59, 59, 999)
  }

  return { from: from.toISOString(), to: to.toISOString() }
}

// ─── Word Count & Reading Time ───────────────────────────────────────────────

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export function readingTimeMinutes(wordCount: number): string {
  const mins = Math.max(1, Math.ceil(wordCount / 200))
  const lastDigit = mins % 10
  const lastTwo = mins % 100
  if (lastTwo >= 11 && lastTwo <= 19) return `${mins} минут`
  if (lastDigit === 1) return `${mins} минута`
  if (lastDigit >= 2 && lastDigit <= 4) return `${mins} минуты`
  return `${mins} минут`
}
