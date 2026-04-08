// ─── Goals Constants & Helpers ────────────────────────────────────────────────

import type { GoalData } from './types'
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
  ArrowUp,
  Minus,
  ArrowDown,
  BookOpen,
  Utensils,
  BedDouble,
  Stethoscope,
  Brain,
  Wallet,
  LineChart,
  Receipt,
  HandCoins,
  Code2,
  Globe,
  BookMarked,
  Award,
  Users,
  FolderGit2,
  Rocket,
  type LucideIcon,
} from 'lucide-react'

// ─── Category Config ─────────────────────────────────────────────────────────

export const CATEGORY_CONFIG: Record<string, {
  label: string
  icon: React.ReactNode
  largeIcon: React.ReactNode
  badgeClass: string
  bgClass: string
  iconBgClass: string
  iconGradientClass: string
  borderColor: string
  hoverGlow: string
}> = {
  personal: {
    label: 'Личное',
    icon: <User className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />,
    largeIcon: <User className="h-5 w-5 text-white" />,
    badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
    bgClass: 'from-emerald-500/10 to-emerald-600/5',
    iconBgClass: 'bg-emerald-100 dark:bg-emerald-900/30',
    iconGradientClass: 'bg-gradient-to-br from-emerald-400 to-teal-500',
    borderColor: '#10b981',
    hoverGlow: 'group-hover:shadow-emerald-500/10',
  },
  health: {
    label: 'Здоровье',
    icon: <Heart className="h-3.5 w-3.5 text-rose-500 dark:text-rose-400" />,
    largeIcon: <Heart className="h-5 w-5 text-white" />,
    badgeClass: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400',
    bgClass: 'from-rose-500/10 to-rose-600/5',
    iconBgClass: 'bg-rose-100 dark:bg-rose-900/30',
    iconGradientClass: 'bg-gradient-to-br from-rose-400 to-pink-500',
    borderColor: '#f43f5e',
    hoverGlow: 'group-hover:shadow-rose-500/10',
  },
  finance: {
    label: 'Финансы',
    icon: <PiggyBank className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />,
    largeIcon: <PiggyBank className="h-5 w-5 text-white" />,
    badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
    bgClass: 'from-amber-500/10 to-amber-600/5',
    iconBgClass: 'bg-amber-100 dark:bg-amber-900/30',
    iconGradientClass: 'bg-gradient-to-br from-amber-400 to-orange-500',
    borderColor: '#f59e0b',
    hoverGlow: 'group-hover:shadow-amber-500/10',
  },
  career: {
    label: 'Карьера',
    icon: <Briefcase className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />,
    largeIcon: <Briefcase className="h-5 w-5 text-white" />,
    badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
    bgClass: 'from-blue-500/10 to-blue-600/5',
    iconBgClass: 'bg-blue-100 dark:bg-blue-900/30',
    iconGradientClass: 'bg-gradient-to-br from-blue-400 to-indigo-500',
    borderColor: '#3b82f6',
    hoverGlow: 'group-hover:shadow-blue-500/10',
  },
  learning: {
    label: 'Обучение',
    icon: <GraduationCap className="h-3.5 w-3.5 text-violet-500 dark:text-violet-400" />,
    largeIcon: <GraduationCap className="h-5 w-5 text-white" />,
    badgeClass: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400',
    bgClass: 'from-violet-500/10 to-violet-600/5',
    iconBgClass: 'bg-violet-100 dark:bg-violet-900/30',
    iconGradientClass: 'bg-gradient-to-br from-violet-400 to-purple-500',
    borderColor: '#8b5cf6',
    hoverGlow: 'group-hover:shadow-violet-500/10',
  },
  education: {
    label: 'Образование',
    icon: <GraduationCap className="h-3.5 w-3.5 text-violet-500 dark:text-violet-400" />,
    largeIcon: <GraduationCap className="h-5 w-5 text-white" />,
    badgeClass: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400',
    bgClass: 'from-violet-500/10 to-violet-600/5',
    iconBgClass: 'bg-violet-100 dark:bg-violet-900/30',
    iconGradientClass: 'bg-gradient-to-br from-violet-400 to-purple-500',
    borderColor: '#8b5cf6',
    hoverGlow: 'group-hover:shadow-violet-500/10',
  },
  fitness: {
    label: 'Фитнес',
    icon: <Dumbbell className="h-3.5 w-3.5 text-orange-500 dark:text-orange-400" />,
    largeIcon: <Dumbbell className="h-5 w-5 text-white" />,
    badgeClass: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
    bgClass: 'from-orange-500/10 to-orange-600/5',
    iconBgClass: 'bg-orange-100 dark:bg-orange-900/30',
    iconGradientClass: 'bg-gradient-to-br from-orange-400 to-red-500',
    borderColor: '#f97316',
    hoverGlow: 'group-hover:shadow-orange-500/10',
  },
}

// ─── Subcategory definitions per category ─────────────────────────────────

export interface SubcategoryDef {
  label: string
  icon: LucideIcon
}

export const SUBCATEGORIES: Record<string, SubcategoryDef[]> = {
  personal: [
    { label: 'здоровье', icon: Heart },
    { label: 'саморазвитие', icon: TrendingUp },
    { label: 'хобби', icon: BookOpen },
    { label: 'отношения', icon: Users },
    { label: 'путешествия', icon: Globe },
  ],
  health: [
    { label: 'спорт', icon: Dumbbell },
    { label: 'питание', icon: Utensils },
    { label: 'сон', icon: BedDouble },
    { label: 'медицина', icon: Stethoscope },
    { label: 'ментальное', icon: Brain },
  ],
  finance: [
    { label: 'накопления', icon: PiggyBank },
    { label: 'инвестиции', icon: LineChart },
    { label: 'экономия', icon: Receipt },
    { label: 'доход', icon: HandCoins },
    { label: 'бюджет', icon: Wallet },
  ],
  career: [
    { label: 'навыки', icon: Code2 },
    { label: 'нетворкинг', icon: Users },
    { label: 'проекты', icon: FolderGit2 },
    { label: 'повышение', icon: Rocket },
    { label: 'портфолио', icon: Briefcase },
  ],
  learning: [
    { label: 'языки', icon: Globe },
    { label: 'программирование', icon: Code2 },
    { label: 'чтение', icon: BookMarked },
    { label: 'курсы', icon: GraduationCap },
    { label: 'сертификация', icon: Award },
  ],
  education: [
    { label: 'экзамены', icon: GraduationCap },
    { label: 'курсы', icon: BookMarked },
    { label: 'наука', icon: Brain },
    { label: 'диплом', icon: Award },
  ],
  fitness: [
    { label: 'сила', icon: Dumbbell },
    { label: 'кардио', icon: Heart },
    { label: 'гибкость', icon: User },
    { label: 'выносливость', icon: Zap },
  ],
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

// ─── Priority Config ─────────────────────────────────────────────────────────

export const PRIORITY_CONFIG: Record<string, {
  label: string
  color: string
  bgClass: string
  borderClass: string
  icon: React.ReactNode
  pulseClass: string
  dotColor: string
}> = {
  high: {
    label: 'Высокий',
    color: 'text-rose-600 dark:text-rose-400',
    bgClass: 'bg-rose-100 dark:bg-rose-900/30',
    borderClass: 'border-rose-200 dark:border-rose-800/50',
    icon: <ArrowUp className="h-3 w-3" />,
    pulseClass: 'priority-pulse-high',
    dotColor: 'bg-rose-500',
  },
  medium: {
    label: 'Средний',
    color: 'text-amber-600 dark:text-amber-400',
    bgClass: 'bg-amber-100 dark:bg-amber-900/30',
    borderClass: 'border-amber-200 dark:border-amber-800/50',
    icon: <Minus className="h-3 w-3" />,
    pulseClass: 'priority-pulse-medium',
    dotColor: 'bg-amber-500',
  },
  low: {
    label: 'Низкий',
    color: 'text-sky-600 dark:text-sky-400',
    bgClass: 'bg-sky-100 dark:bg-sky-900/30',
    borderClass: 'border-sky-200 dark:border-sky-800/50',
    icon: <ArrowDown className="h-3 w-3" />,
    pulseClass: '',
    dotColor: 'bg-sky-400',
  },
}

// ─── Options ─────────────────────────────────────────────────────────────────

export const CATEGORY_OPTIONS = [
  { value: 'personal', label: 'Личное', icon: <User className="h-4 w-4" /> },
  { value: 'health', label: 'Здоровье', icon: <Heart className="h-4 w-4" /> },
  { value: 'finance', label: 'Финансы', icon: <PiggyBank className="h-4 w-4" /> },
  { value: 'career', label: 'Карьера', icon: <Briefcase className="h-4 w-4" /> },
  { value: 'learning', label: 'Обучение', icon: <GraduationCap className="h-4 w-4" /> },
  { value: 'education', label: 'Образование', icon: <GraduationCap className="h-4 w-4" /> },
  { value: 'fitness', label: 'Фитнес', icon: <Dumbbell className="h-4 w-4" /> },
]

export const STATUS_OPTIONS = [
  { value: 'active', label: 'В процессе' },
  { value: 'completed', label: 'Завершено' },
  { value: 'paused', label: 'На паузе' },
  { value: 'cancelled', label: 'Отменено' },
]

export const PRIORITY_OPTIONS = [
  { value: 'high', label: '🔴 Высокий' },
  { value: 'medium', label: '🟡 Средний' },
  { value: 'low', label: '🔵 Низкий' },
]

const MOTIVATIONAL_PHRASES = [
  'Каждая цель — это шаг к лучшей версии себя.',
  'Великие дела начинаются с малого первого шага.',
  'Дисциплина и настойчивость превращают мечты в реальность.',
  'Тот, кто чётко видит цель, уже на полпути к ней.',
  'Сегодняшние усилия — завтрашние достижения.',
  'Не бойтесь медленного прогресса, бойтесь стоять на месте.',
  'Самый лучший момент начать — сейчас.',
  'Успех — это сумма маленьких усилий, повторяемых день за днём.',
]

const MOTIVATIONAL_QUOTES = [
  { text: 'Будущее принадлежит тем, кто верит в красоту своей мечты.', author: 'Элеонора Рузвельт' },
  { text: 'Путь в тысячу миль начинается с одного шага.', author: 'Лао-цзы' },
  { text: 'Единственный способ делать великие дела — любить то, что делаешь.', author: 'Стив Джобс' },
  { text: 'Не жди. Время никогда не будет идеальным.', author: 'Наполеон Хилл' },
  { text: 'Успех — это не конец, неудача — не фатальна. Значение имеет лишь мужество продолжать.', author: 'Уинстон Черчилль' },
  { text: 'Начни там, где ты есть. Используй то, что имеешь. Делай то, что можешь.', author: 'Артур Эш' },
  { text: 'Дисциплина — это мост между целями и достижениями.', author: 'Джим Рон' },
  { text: 'Чем усерднее ты работаешь, тем удачливее ты становишься.', author: 'Неизвестный автор' },
  { text: 'Ваши ограничения — это лишь ограничения вашего воображения.', author: 'Неизвестный автор' },
  { text: 'Всё, что ты можешь вообразить — реально.', author: 'Пабло Пикассо' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getMotivationalPhrase(): string {
  const idx = new Date().getDate() % MOTIVATIONAL_PHRASES.length
  return MOTIVATIONAL_PHRASES[idx]
}

export function getMotivationalQuote(): { text: string; author: string } {
  const idx = Math.floor((Date.now() / (1000 * 60 * 60 * 6)) % MOTIVATIONAL_QUOTES.length)
  return MOTIVATIONAL_QUOTES[idx]
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

// ─── Progress Trend (On Track / Behind / Ahead) ─────────────────────────────

export type ProgressTrend = 'ahead' | 'on_track' | 'behind' | 'at_risk' | 'no_data'

export interface ProgressTrendInfo {
  trend: ProgressTrend
  label: string
  emoji: string
  colorClass: string
  bgClass: string
  borderClass: string
  dotColor: string
}

const TREND_CONFIG: Record<ProgressTrend, ProgressTrendInfo> = {
  ahead: {
    trend: 'ahead',
    label: 'Опережает',
    emoji: '🚀',
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    bgClass: 'bg-emerald-100 dark:bg-emerald-900/30',
    borderClass: 'border-emerald-200 dark:border-emerald-800/50',
    dotColor: 'bg-emerald-500',
  },
  on_track: {
    trend: 'on_track',
    label: 'В ритме',
    emoji: '✅',
    colorClass: 'text-sky-600 dark:text-sky-400',
    bgClass: 'bg-sky-100 dark:bg-sky-900/30',
    borderClass: 'border-sky-200 dark:border-sky-800/50',
    dotColor: 'bg-sky-500',
  },
  behind: {
    trend: 'behind',
    label: 'Отстаёт',
    emoji: '⚠️',
    colorClass: 'text-amber-600 dark:text-amber-400',
    bgClass: 'bg-amber-100 dark:bg-amber-900/30',
    borderClass: 'border-amber-200 dark:border-amber-800/50',
    dotColor: 'bg-amber-500',
  },
  at_risk: {
    trend: 'at_risk',
    label: 'Под угрозой',
    emoji: '🔴',
    colorClass: 'text-rose-600 dark:text-rose-400',
    bgClass: 'bg-rose-100 dark:bg-rose-900/30',
    borderClass: 'border-rose-200 dark:border-rose-800/50',
    dotColor: 'bg-rose-500',
  },
  no_data: {
    trend: 'no_data',
    label: 'Нет данных',
    emoji: '—',
    colorClass: 'text-muted-foreground',
    bgClass: 'bg-muted',
    borderClass: 'border-muted',
    dotColor: 'bg-muted-foreground/40',
  },
}

export function getProgressTrend(goal: GoalData): ProgressTrendInfo {
  // No meaningful calculation for completed/paused/cancelled
  if (goal.status !== 'active') return TREND_CONFIG.no_data
  if (goal.progress === 0) return TREND_CONFIG.no_data

  const now = new Date()
  const created = goal.startDate ? new Date(goal.startDate) : new Date(goal.createdAt)
  const deadline = goal.deadline ? new Date(goal.deadline) : null

  // If no deadline, use progress speed as heuristic
  if (!deadline) {
    const daysElapsed = Math.max(1, Math.ceil((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)))
    const dailyProgress = goal.progress / daysElapsed
    if (dailyProgress >= 2) return TREND_CONFIG.ahead
    if (dailyProgress >= 0.5) return TREND_CONFIG.on_track
    return TREND_CONFIG.behind
  }

  const totalDays = Math.max(1, Math.ceil((deadline.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)))
  const elapsedDays = Math.max(1, Math.ceil((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)))
  const daysLeft = Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))

  // Expected progress at this point based on linear interpolation
  const expectedProgress = Math.min(100, (elapsedDays / totalDays) * 100)
  const remainingProgress = 100 - goal.progress

  // Required pace to finish on time
  const requiredPace = daysLeft > 0 ? remainingProgress / daysLeft : 999

  // Compare actual vs expected progress
  const diff = goal.progress - expectedProgress

  // Already past deadline
  if (now > deadline) {
    if (goal.progress >= 90) return TREND_CONFIG.on_track
    return TREND_CONFIG.at_risk
  }

  // Check required pace
  if (requiredPace > 5) return TREND_CONFIG.at_risk
  if (requiredPace > 3) return TREND_CONFIG.behind
  if (diff > 15) return TREND_CONFIG.ahead
  if (diff > -10) return TREND_CONFIG.on_track
  return TREND_CONFIG.behind
}

// ─── Required pace calculation ───────────────────────────────────────────────

export function getRequiredPace(goal: GoalData): { value: number; unit: string; label: string } | null {
  if (goal.status !== 'active' || goal.progress >= 100) return null

  const now = new Date()
  const created = goal.startDate ? new Date(goal.startDate) : new Date(goal.createdAt)
  const deadline = goal.deadline ? new Date(goal.deadline) : null

  if (!deadline) return null
  if (now >= deadline) return { value: 0, unit: '% в день', label: 'Дедлайн прошёл' }

  const daysLeft = Math.max(1, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
  const remainingProgress = 100 - goal.progress
  const pace = Math.round((remainingProgress / daysLeft) * 10) / 10

  if (pace <= 0) return { value: 0, unit: '% в день', label: 'Цель достигнута! 🎉' }

  // Russian pluralization
  const lastDigit = daysLeft % 10
  const lastTwo = daysLeft % 100
  let dayWord = 'дней'
  if (lastTwo >= 11 && lastTwo <= 19) {
    dayWord = 'дней'
  } else if (lastDigit === 1) {
    dayWord = 'день'
  } else if (lastDigit >= 2 && lastDigit <= 4) {
    dayWord = 'дня'
  }

  return {
    value: pace,
    unit: '% в день',
    label: `Нужно ${pace}% в день (${daysLeft} ${dayWord} осталось)`,
  }
}

// ─── Days remaining helper ───────────────────────────────────────────────────

export function getDaysRemaining(goal: GoalData): number | null {
  if (!goal.deadline || goal.status === 'completed') return null
  const now = new Date()
  const dl = new Date(goal.deadline)
  return Math.ceil((dl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

// ─── Check if goal is "at risk" or "on track" for stats ────────────────────

export function isGoalAtRisk(goal: GoalData): boolean {
  const trend = getProgressTrend(goal)
  return trend.trend === 'at_risk' || trend.trend === 'behind'
}

export function isGoalOnTrack(goal: GoalData): boolean {
  const trend = getProgressTrend(goal)
  return trend.trend === 'on_track' || trend.trend === 'ahead'
}
