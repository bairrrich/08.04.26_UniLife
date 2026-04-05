// ─── Goals Constants & Helpers ────────────────────────────────────────────────

import {
  Heart,
  Zap,
  TrendingUp,
  Briefcase,
  GraduationCap,
} from 'lucide-react'

// ─── Category Config ─────────────────────────────────────────────────────────

export const CATEGORY_CONFIG: Record<string, {
  label: string
  icon: React.ReactNode
  badgeClass: string
  bgClass: string
  iconBgClass: string
  borderColor: string
}> = {
  personal: {
    label: 'Личное',
    icon: <Heart className="h-3.5 w-3.5" />,
    badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
    bgClass: 'from-emerald-500/10 to-emerald-600/5',
    iconBgClass: 'bg-emerald-100 dark:bg-emerald-900/30',
    borderColor: '#10b981',
  },
  health: {
    label: 'Здоровье',
    icon: <Zap className="h-3.5 w-3.5" />,
    badgeClass: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400',
    bgClass: 'from-rose-500/10 to-rose-600/5',
    iconBgClass: 'bg-rose-100 dark:bg-rose-900/30',
    borderColor: '#f43f5e',
  },
  finance: {
    label: 'Финансы',
    icon: <TrendingUp className="h-3.5 w-3.5" />,
    badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
    bgClass: 'from-amber-500/10 to-amber-600/5',
    iconBgClass: 'bg-amber-100 dark:bg-amber-900/30',
    borderColor: '#f59e0b',
  },
  career: {
    label: 'Карьера',
    icon: <Briefcase className="h-3.5 w-3.5" />,
    badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
    bgClass: 'from-blue-500/10 to-blue-600/5',
    iconBgClass: 'bg-blue-100 dark:bg-blue-900/30',
    borderColor: '#3b82f6',
  },
  learning: {
    label: 'Обучение',
    icon: <GraduationCap className="h-3.5 w-3.5" />,
    badgeClass: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400',
    bgClass: 'from-violet-500/10 to-violet-600/5',
    iconBgClass: 'bg-violet-100 dark:bg-violet-900/30',
    borderColor: '#8b5cf6',
  },
}

// ─── Status Config ───────────────────────────────────────────────────────────

export const STATUS_CONFIG: Record<string, {
  label: string
  color: string
  dotClass: string
}> = {
  active: {
    label: 'Активна',
    color: 'text-emerald-600 dark:text-emerald-400',
    dotClass: 'bg-emerald-500',
  },
  completed: {
    label: 'Завершена',
    color: 'text-blue-600 dark:text-blue-400',
    dotClass: 'bg-blue-500',
  },
  abandoned: {
    label: 'Заброшена',
    color: 'text-muted-foreground',
    dotClass: 'bg-muted-foreground/40',
  },
}

// ─── Options ─────────────────────────────────────────────────────────────────

export const CATEGORY_OPTIONS = [
  { value: 'personal', label: 'Личное' },
  { value: 'health', label: 'Здоровье' },
  { value: 'finance', label: 'Финансы' },
  { value: 'career', label: 'Карьера' },
  { value: 'learning', label: 'Обучение' },
]

export const STATUS_OPTIONS = [
  { value: 'active', label: 'Активна' },
  { value: 'completed', label: 'Завершена' },
  { value: 'abandoned', label: 'Заброшена' },
]

const MOTIVATIONAL_PHRASES = [
  'Каждая цель — это шаг к лучшей версии себя.',
  'Великие дела начинаются с малого первого шага.',
  'Дисциплина и настойчивость превращают мечты в реальность.',
  'Тот, кто чётко видит цель, уже на полпути к ней.',
  'Сегодняшние усилия — завтрашние достижения.',
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getMotivationalPhrase(): string {
  const idx = new Date().getDate() % MOTIVATIONAL_PHRASES.length
  return MOTIVATIONAL_PHRASES[idx]
}

export function getDeadlineCountdown(deadline: string | null): string | null {
  if (!deadline) return null
  const now = new Date()
  const dl = new Date(deadline)
  const diffMs = dl.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return `${Math.abs(diffDays)} дн. просрочено`
  if (diffDays === 0) return 'Сегодня дедлайн'
  if (diffDays === 1) return '1 день осталось'
  if (diffDays <= 4) return `${diffDays} дня осталось`
  return `${diffDays} дней осталось`
}

export function getProgressColor(progress: number): string {
  if (progress >= 80) return '[&>div]:bg-emerald-500'
  if (progress >= 50) return '[&>div]:bg-blue-500'
  if (progress >= 25) return '[&>div]:bg-amber-500'
  return '[&>div]:bg-rose-500'
}

export function getProgressTrackColor(progress: number): string {
  if (progress >= 80) return 'bg-emerald-100 dark:bg-emerald-900/30'
  if (progress >= 50) return 'bg-blue-100 dark:bg-blue-900/30'
  if (progress >= 25) return 'bg-amber-100 dark:bg-amber-900/30'
  return 'bg-rose-100 dark:bg-rose-900/30'
}

export function getProgressTextColor(progress: number): string {
  if (progress >= 70) return 'text-emerald-600 dark:text-emerald-400'
  if (progress >= 40) return 'text-amber-600 dark:text-amber-400'
  return 'text-rose-600 dark:text-rose-400'
}

export function getProgressRingColor(progress: number): string {
  if (progress >= 70) return '#10b981'
  if (progress >= 40) return '#f59e0b'
  return '#ef4444'
}

export function getDeadlineWarning(deadline: string | null): boolean {
  if (!deadline) return false
  const now = new Date()
  const dl = new Date(deadline)
  const diffMs = dl.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  return diffDays >= 0 && diffDays <= 7
}
