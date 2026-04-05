// ─── Goals Constants & Helpers ────────────────────────────────────────────────

import {
  Heart,
  Zap,
  TrendingUp,
  Briefcase,
  GraduationCap,
  PiggyBank,
  User,
  Dumbbell,
  Play,
  CheckCircle2,
  Pause,
  XCircle,
  Target,
  Calendar,
} from 'lucide-react'

// ─── Category Config ─────────────────────────────────────────────────────────

export const CATEGORY_CONFIG: Record<string, {
  label: string
  icon: React.ReactNode
  badgeClass: string
  bgClass: string
  iconBgClass: string
  borderColor: string
  hoverGlow: string
}> = {
  personal: {
    label: 'Личное',
    icon: <User className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />,
    badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
    bgClass: 'from-emerald-500/10 to-emerald-600/5',
    iconBgClass: 'bg-emerald-100 dark:bg-emerald-900/30',
    borderColor: '#10b981',
    hoverGlow: 'group-hover:shadow-emerald-500/10',
  },
  health: {
    label: 'Здоровье',
    icon: <Heart className="h-3.5 w-3.5 text-rose-500 dark:text-rose-400" />,
    badgeClass: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400',
    bgClass: 'from-rose-500/10 to-rose-600/5',
    iconBgClass: 'bg-rose-100 dark:bg-rose-900/30',
    borderColor: '#f43f5e',
    hoverGlow: 'group-hover:shadow-rose-500/10',
  },
  finance: {
    label: 'Финансы',
    icon: <PiggyBank className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />,
    badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
    bgClass: 'from-amber-500/10 to-amber-600/5',
    iconBgClass: 'bg-amber-100 dark:bg-amber-900/30',
    borderColor: '#f59e0b',
    hoverGlow: 'group-hover:shadow-amber-500/10',
  },
  career: {
    label: 'Карьера',
    icon: <Briefcase className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />,
    badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
    bgClass: 'from-blue-500/10 to-blue-600/5',
    iconBgClass: 'bg-blue-100 dark:bg-blue-900/30',
    borderColor: '#3b82f6',
    hoverGlow: 'group-hover:shadow-blue-500/10',
  },
  learning: {
    label: 'Обучение',
    icon: <GraduationCap className="h-3.5 w-3.5 text-violet-500 dark:text-violet-400" />,
    badgeClass: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400',
    bgClass: 'from-violet-500/10 to-violet-600/5',
    iconBgClass: 'bg-violet-100 dark:bg-violet-900/30',
    borderColor: '#8b5cf6',
    hoverGlow: 'group-hover:shadow-violet-500/10',
  },
  education: {
    label: 'Образование',
    icon: <GraduationCap className="h-3.5 w-3.5 text-violet-500 dark:text-violet-400" />,
    badgeClass: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400',
    bgClass: 'from-violet-500/10 to-violet-600/5',
    iconBgClass: 'bg-violet-100 dark:bg-violet-900/30',
    borderColor: '#8b5cf6',
    hoverGlow: 'group-hover:shadow-violet-500/10',
  },
  fitness: {
    label: 'Фитнес',
    icon: <Dumbbell className="h-3.5 w-3.5 text-orange-500 dark:text-orange-400" />,
    badgeClass: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
    bgClass: 'from-orange-500/10 to-orange-600/5',
    iconBgClass: 'bg-orange-100 dark:bg-orange-900/30',
    borderColor: '#f97316',
    hoverGlow: 'group-hover:shadow-orange-500/10',
  },
}

// Default fallback for unknown categories
export const DEFAULT_CATEGORY = CATEGORY_CONFIG.personal

// ─── Status Config ───────────────────────────────────────────────────────────

export const STATUS_CONFIG: Record<string, {
  label: string
  color: string
  dotClass: string
  icon: React.ReactNode
  iconBg: string
  borderClass: string | null
}> = {
  active: {
    label: 'В процессе',
    color: 'text-emerald-600 dark:text-emerald-400',
    dotClass: 'bg-emerald-500 animate-pulse-soft',
    icon: <Play className="h-3 w-3 text-emerald-500" />,
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    borderClass: null,
  },
  completed: {
    label: 'Завершено',
    color: 'text-emerald-600 dark:text-emerald-400',
    dotClass: 'bg-emerald-500',
    icon: <CheckCircle2 className="h-3 w-3 text-emerald-500" />,
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    borderClass: 'border-emerald-500/30',
  },
  paused: {
    label: 'На паузе',
    color: 'text-amber-600 dark:text-amber-400',
    dotClass: 'bg-amber-500',
    icon: <Pause className="h-3 w-3 text-amber-500" />,
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    borderClass: null,
  },
  cancelled: {
    label: 'Отменено',
    color: 'text-muted-foreground',
    dotClass: 'bg-muted-foreground/40',
    icon: <XCircle className="h-3 w-3 text-muted-foreground" />,
    iconBg: 'bg-muted',
    borderClass: null,
  },
  abandoned: {
    label: 'Заброшена',
    color: 'text-muted-foreground',
    dotClass: 'bg-muted-foreground/40',
    icon: <XCircle className="h-3 w-3 text-muted-foreground" />,
    iconBg: 'bg-muted',
    borderClass: null,
  },
}

export const DEFAULT_STATUS = STATUS_CONFIG.active

// ─── Options ─────────────────────────────────────────────────────────────────

export const CATEGORY_OPTIONS = [
  { value: 'personal', label: 'Личное', icon: <User className="h-4 w-4" /> },
  { value: 'health', label: 'Здоровье', icon: <Heart className="h-4 w-4" /> },
  { value: 'finance', label: 'Финансы', icon: <PiggyBank className="h-4 w-4" /> },
  { value: 'career', label: 'Карьера', icon: <Briefcase className="h-4 w-4" /> },
  { value: 'education', label: 'Образование', icon: <GraduationCap className="h-4 w-4" /> },
  { value: 'fitness', label: 'Фитнес', icon: <Dumbbell className="h-4 w-4" /> },
]

export const STATUS_OPTIONS = [
  { value: 'active', label: 'В процессе' },
  { value: 'completed', label: 'Завершено' },
  { value: 'paused', label: 'На паузе' },
  { value: 'cancelled', label: 'Отменено' },
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
  if (diffDays < 0) return `Просрочено на ${Math.abs(diffDays)} дн.`
  if (diffDays === 0) return 'Сегодня дедлайн'
  if (diffDays === 1) return '1 день осталось'
  if (diffDays <= 4) return `${diffDays} дня осталось`
  return `${diffDays} дней осталось`
}

export function getDeadlineDaysLeft(deadline: string | null): number | null {
  if (!deadline) return null
  const now = new Date()
  const dl = new Date(deadline)
  return Math.ceil((dl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

export function getDeadlineBadgeClass(daysLeft: number | null): string {
  if (daysLeft === null) return ''
  if (daysLeft < 0) return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/40 dark:text-rose-400 dark:border-rose-800/50'
  if (daysLeft <= 3) return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/40 dark:text-rose-400 dark:border-rose-800/50'
  if (daysLeft <= 7) return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-400 dark:border-amber-800/50'
  return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-800/50'
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

export function getDeadlineUrgencyColor(daysLeft: number | null): string {
  if (daysLeft === null) return ''
  if (daysLeft < 0) return 'text-rose-500 dark:text-rose-400'
  if (daysLeft <= 3) return 'text-rose-500 dark:text-rose-400'
  if (daysLeft <= 7) return 'text-amber-500 dark:text-amber-400'
  return 'text-emerald-500 dark:text-emerald-400'
}

export function getDeadlineIconColor(daysLeft: number | null): string {
  if (daysLeft === null) return 'text-muted-foreground'
  if (daysLeft < 0) return 'text-rose-500'
  if (daysLeft <= 3) return 'text-rose-500'
  if (daysLeft <= 7) return 'text-amber-500'
  return 'text-emerald-500'
}

export function getProgressSpeed(
  progress: number,
  createdAt: string
): { value: number; unit: string } | null {
  const created = new Date(createdAt)
  const now = new Date()
  const daysElapsed = Math.max(1, Math.ceil((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)))
  if (daysElapsed <= 0) return null
  const dailyProgress = progress / daysElapsed
  return { value: Math.round(dailyProgress * 10) / 10, unit: '% в день' }
}
