'use client'

import { useState, useEffect, useCallback, useMemo, startTransition } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, Trophy, Flame, Target, Brain, Heart, BookOpen, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'

// ─── Types ────────────────────────────────────────────────────────────────────

type ChallengeCategory = 'здоровье' | 'продуктивность' | 'обучение' | 'осознанность'
type Difficulty = 'easy' | 'medium' | 'hard'

interface Challenge {
  title: string
  description: string
  category: ChallengeCategory
  difficulty: Difficulty
  emoji: string
}

interface CategoryConfig {
  label: string
  color: string
  borderColor: string
  bgColor: string
  badgeClass: string
  iconClass: string
  gradient: string
  icon: React.ReactNode
}

// ─── Category Config ─────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<ChallengeCategory, CategoryConfig> = {
  здоровье: {
    label: 'Здоровье',
    color: 'emerald',
    borderColor: 'border-l-emerald-500 dark:border-l-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
    badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
    iconClass: 'text-emerald-500',
    gradient: 'from-emerald-500 to-teal-500',
    icon: <Heart className="h-3.5 w-3.5" />,
  },
  продуктивность: {
    label: 'Продуктивность',
    color: 'amber',
    borderColor: 'border-l-amber-500 dark:border-l-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/20',
    badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
    iconClass: 'text-amber-500',
    gradient: 'from-amber-500 to-orange-500',
    icon: <Target className="h-3.5 w-3.5" />,
  },
  обучение: {
    label: 'Обучение',
    color: 'violet',
    borderColor: 'border-l-violet-500 dark:border-l-violet-400',
    bgColor: 'bg-violet-50 dark:bg-violet-950/20',
    badgeClass: 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300',
    iconClass: 'text-violet-500',
    gradient: 'from-violet-500 to-purple-500',
    icon: <BookOpen className="h-3.5 w-3.5" />,
  },
  осознанность: {
    label: 'Осознанность',
    color: 'sky',
    borderColor: 'border-l-sky-500 dark:border-l-sky-400',
    bgColor: 'bg-sky-50 dark:bg-sky-950/20',
    badgeClass: 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300',
    iconClass: 'text-sky-500',
    gradient: 'from-sky-500 to-cyan-500',
    icon: <Brain className="h-3.5 w-3.5" />,
  },
}

const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; badgeClass: string }> = {
  easy: {
    label: 'Легко',
    badgeClass: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 border-0',
  },
  medium: {
    label: 'Средне',
    badgeClass: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300 border-0',
  },
  hard: {
    label: 'Сложно',
    badgeClass: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 border-0',
  },
}

// ─── Challenge Pool (24 challenges) ──────────────────────────────────────────

const CHALLENGES: Challenge[] = [
  // Здоровье (6)
  { title: '8 стаканов воды', description: 'Пейте минимум 8 стаканов воды каждый день на протяжении недели', category: 'здоровье', difficulty: 'easy', emoji: '💧' },
  { title: '30 минут ходьбы', description: 'Гуляйте минимум 30 минут ежедневно — это укрепит сердце и улучшит настроение', category: 'здоровье', difficulty: 'medium', emoji: '🚶' },
  { title: 'Сон до 23:00', description: 'Ложитесь спать до 23:00 каждый вечер и просыпайтесь в одно время', category: 'здоровье', difficulty: 'hard', emoji: '😴' },
  { title: 'Зарядка по утрам', description: 'Делайте 10-минутную утреннюю зарядку каждый день этой недели', category: 'здоровье', difficulty: 'medium', emoji: '🏃' },
  { title: 'Без сладкого', description: 'Откажитесь от сладкого на всю неделю — замените фруктами', category: 'здоровье', difficulty: 'hard', emoji: '🍎' },
  { title: '5 минут растяжки', description: 'Делайте растяжку каждый вечер перед сном для гибкости тела', category: 'здоровье', difficulty: 'easy', emoji: '🧘' },

  // Продуктивность (6)
  { title: 'Правило 2 минут', description: 'Если задача занимает меньше 2 минут — делайте её сразу, не откладывайте', category: 'продуктивность', difficulty: 'easy', emoji: '⏱️' },
  { title: 'Планирование вечера', description: 'Каждый вечер составляйте план на следующий день с приоритетами', category: 'продуктивность', difficulty: 'medium', emoji: '📝' },
  { title: 'Помодоро-неделя', description: 'Используйте технику Помодоро (25/5) минимум 4 раза в день', category: 'продуктивность', difficulty: 'medium', emoji: '🍅' },
  { title: 'Цифровой детокс', description: 'Проводите первый час после пробуждения и последний перед сном без телефона', category: 'продуктивность', difficulty: 'hard', emoji: '📵' },
  { title: 'Чистое рабочее место', description: 'Убирайте рабочее место каждый вечер — чистый стол = ясный ум', category: 'продуктивность', difficulty: 'easy', emoji: '🧹' },
  { title: '3 главные задачи', description: 'Выбирайте только 3 самые важные задачи на каждый день и выполняйте их', category: 'продуктивность', difficulty: 'medium', emoji: '🎯' },

  // Обучение (6)
  { title: '15 минут чтения', description: 'Читайте книгу минимум 15 минут каждый день вместо соцсетей', category: 'обучение', difficulty: 'easy', emoji: '📚' },
  { title: 'Новый навык', description: 'Уделяйте изучению нового навыка по 20 минут ежедневно всю неделю', category: 'обучение', difficulty: 'medium', emoji: '🎓' },
  { title: 'Смотреть 1 лекцию', description: 'Смотрите минимум одну образовательную лекцию или ролик каждый день', category: 'обучение', difficulty: 'easy', emoji: '🎥' },
  { title: 'Учить 10 слов', description: 'Выучите по 10 новых слов на иностранном языке каждый день', category: 'обучение', difficulty: 'medium', emoji: '🗣️' },
  { title: 'Писать конспекты', description: 'Делайте краткие конспекты всего, что учите — это улучшает запоминание', category: 'обучение', difficulty: 'medium', emoji: '✍️' },
  { title: 'Подкаст вместо музыки', description: 'Слушайте образовательный подкаст вместо музыки хотя бы 30 минут в день', category: 'обучение', difficulty: 'easy', emoji: '🎧' },

  // Осознанность (6)
  { title: 'Дневник благодарности', description: 'Записывайте 3 вещи, за которые благодарны, каждый вечер этой недели', category: 'осознанность', difficulty: 'easy', emoji: '🙏' },
  { title: '5 минут медитации', description: 'Медитируйте минимум 5 минут каждый день — используйте таймер или приложение', category: 'осознанность', difficulty: 'easy', emoji: '🧠' },
  { title: 'Осознанное питание', description: 'Ешьте без телефона и телевизора — наслаждайтесь каждым приёмом пищи', category: 'осознанность', difficulty: 'medium', emoji: '🍽️' },
  { title: 'Дыхание 4-7-8', description: 'Практикуйте дыхательную технику 4-7-8 трижды в день для снижения стресса', category: 'осознанность', difficulty: 'easy', emoji: '🌬️' },
  { title: 'Письмо себе', description: 'Напишите письмо себе через год — опишите мечты, цели и текущее состояние', category: 'осознанность', difficulty: 'medium', emoji: '✉️' },
  { title: 'Цифровая тишина', description: 'Проводите 1 час в день в полной тишине без гаджетов и развлечений', category: 'осознанность', difficulty: 'hard', emoji: '🤫' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

function getStorageKey(year: number, week: number): string {
  return `unilife-weekly-challenge-${year}-${week}`
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

function getChallengeForWeek(year: number, week: number): Challenge {
  const seed = year * 100 + week * 7 + 13
  const index = Math.floor(seededRandom(seed) * CHALLENGES.length)
  return CHALLENGES[index]
}

function getStorageData(key: string): boolean[] {
  if (typeof window === 'undefined') return Array(7).fill(false)
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return Array(7).fill(false)
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length === 7) return parsed
    return Array(7).fill(false)
  } catch {
    return Array(7).fill(false)
  }
}

function setStorageData(key: string, data: boolean[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch {
    // ignore
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function WeeklyChallengeWidget() {
  // Hydration-safe: initialize days from localStorage lazily
  const [days, setDays] = useState<boolean[]>(Array(7).fill(false) as boolean[])
  const [mounted, setMounted] = useState(false)
  const [skippedChallenge, setSkippedChallenge] = useState<Challenge | null>(null)
  const [skipCount, setSkipCount] = useState(0)

  // Current week info
  const { year, week, storageKey, challenge } = useMemo(() => {
    const now = new Date()
    const yr = now.getFullYear()
    const wk = getISOWeek(now)
    const key = getStorageKey(yr, wk)
    const ch = getChallengeForWeek(yr, wk)
    return { year: yr, week: wk, storageKey: key, challenge: ch }
  }, [])

  // Load persisted days from localStorage on mount
  useEffect(() => {
    const data = getStorageData(storageKey)
    startTransition(() => {
      setDays(data)
      setMounted(true)
    })
  }, [storageKey])

  // Determine which challenge to show
  const activeChallenge = skippedChallenge ?? challenge

  // Day toggle handler
  const toggleDay = useCallback((index: number) => {
    setDays((prev) => {
      const next = [...prev]
      next[index] = !next[index]
      setStorageData(storageKey, next)
      return next
    })
  }, [storageKey])

  // Skip challenge handler
  const handleSkip = useCallback(() => {
    const newSeed = Date.now() + skipCount * 17
    const index = Math.floor(seededRandom(newSeed) * CHALLENGES.length)
    setSkippedChallenge(CHALLENGES[index])
    setSkipCount((prev) => prev + 1)
    // Reset progress when skipping
    const empty = Array(7).fill(false)
    setDays(empty)
    setStorageData(storageKey, empty)
  }, [storageKey, skipCount])

  // Computed values
  const completedDays = days.filter(Boolean).length
  const completionPercent = Math.round((completedDays / 7) * 100)
  const isComplete = completedDays === 7

  const catConfig = CATEGORY_CONFIG[activeChallenge.category]
  const diffConfig = DIFFICULTY_CONFIG[activeChallenge.difficulty]

  const dayLabels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

  // Get current day of week (0=Mon, 6=Sun in ISO)
  const todayIndex = useMemo(() => {
    const d = new Date().getDay()
    return d === 0 ? 6 : d - 1
  }, [])

  // ── Skeleton (loading) ────────────────────────────────────────────────
  if (!mounted) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-5 w-32" />
        <Card className="rounded-xl border">
          <CardContent className="p-5">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-9 w-9 rounded-xl" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-2 w-full rounded-full" />
              <div className="flex gap-2">
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-10 rounded" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeInOut' as const }}
      className="space-y-3"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <Flame className="h-4 w-4 text-orange-500" />
        <h3 className="text-sm font-semibold text-foreground">
          Неделя {week}
        </h3>
        {isComplete && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            <Trophy className="h-4 w-4 text-amber-500" />
          </motion.span>
        )}
      </div>

      {/* Card */}
      <Card
        className={`card-hover overflow-hidden rounded-xl border border-l-4 ${catConfig.borderColor}`}
      >
        <CardContent className="p-5">
          {/* Top gradient accent line */}
          <div className={`pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${catConfig.gradient} opacity-70`} />

          {/* Challenge header */}
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Emoji */}
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${catConfig.badgeClass} text-lg shadow-sm`}>
                {activeChallenge.emoji}
              </div>

              {/* Title + badges */}
              <div>
                <h4 className="text-sm font-semibold text-foreground leading-tight">
                  {activeChallenge.title}
                </h4>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <Badge variant="secondary" className={`gap-1 text-[10px] font-medium ${catConfig.badgeClass} border-0`}>
                    {catConfig.icon}
                    {catConfig.label}
                  </Badge>
                  <Badge variant="secondary" className={`text-[10px] font-medium ${diffConfig.badgeClass}`}>
                    {diffConfig.label}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Skip button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
              onClick={handleSkip}
              title="Новый вызов"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {/* Description */}
          <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
            {activeChallenge.description}
          </p>

          {/* Progress bar */}
          <div className="mb-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Прогресс</span>
              <span className={`font-medium ${isComplete ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>
                {completedDays}/7 дней
                {isComplete && (
                  <Sparkles className="ml-1 inline h-3 w-3" />
                )}
              </span>
            </div>
            <Progress value={completionPercent} className="h-2" />
            <div className="text-right text-[10px] text-muted-foreground">
              {completionPercent}%
            </div>
          </div>

          {/* Day checkboxes */}
          <div className="stagger-children grid grid-cols-7 gap-2">
            {dayLabels.map((label, index) => {
              const isPast = index < todayIndex
              const isToday = index === todayIndex
              const isChecked = days[index]

              return (
                <label
                  key={label}
                  className={`
                    flex cursor-pointer flex-col items-center gap-1 rounded-lg border p-1.5 transition-all
                    ${isChecked
                      ? `${catConfig.bgColor} border-current/20 ${catConfig.borderColor.replace('border-l-', 'border-')}`
                      : isToday
                        ? 'border-primary/30 bg-primary/5'
                        : 'border-border/50 bg-background/50 hover:border-border'
                    }
                    ${isPast && !isChecked ? 'opacity-40' : ''}
                  `}
                >
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {label}
                  </span>
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => toggleDay(index)}
                    className={`h-4 w-4 rounded ${isChecked ? catConfig.iconClass : ''}`}
                  />
                </label>
              )
            })}
          </div>

          {/* Completion celebration */}
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2 dark:from-amber-950/30 dark:to-orange-950/30"
            >
              <Trophy className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                Вызов выполнен! Отличная работа! 🎉
              </span>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
