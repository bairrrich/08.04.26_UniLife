'use client'

import { useState, useEffect, useCallback, useMemo, useRef, startTransition } from 'react'
import { motion } from 'framer-motion'
import { Flame, Check, Sparkles, Clock, SkipForward } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

// ─── Types ────────────────────────────────────────────────────────────────────

type Difficulty = 'easy' | 'medium' | 'hard'

interface DailyChallenge {
  emoji: string
  title: string
  category: string
  difficulty: Difficulty
  xp: number
}

interface StoredState {
  date: string
  accepted: boolean
  acceptedAt: string
}

// ─── Challenge Pool (30 challenges) ───────────────────────────────────────────

const CHALLENGES: DailyChallenge[] = [
  // Физическая активность (8)
  { emoji: '🏃‍♂️', title: 'Пробежка 15 минут', category: 'Физическая активность', difficulty: 'medium', xp: 25 },
  { emoji: '🚶', title: '10 000 шагов за день', category: 'Физическая активность', difficulty: 'medium', xp: 25 },
  { emoji: '🧘', title: '10 минут йоги или растяжки', category: 'Физическая активность', difficulty: 'easy', xp: 10 },
  { emoji: '💪', title: '3 подхода отжиманий по 10 раз', category: 'Физическая активность', difficulty: 'medium', xp: 25 },
  { emoji: '🚴', title: '30 минут на велосипеде или эллипсе', category: 'Физическая активность', difficulty: 'medium', xp: 25 },
  { emoji: '🏋️', title: 'Полная тренировка всего тела', category: 'Физическая активность', difficulty: 'hard', xp: 50 },
  { emoji: '🤸', title: '15 минут утренней зарядки', category: 'Физическая активность', difficulty: 'easy', xp: 10 },
  { emoji: '🏊', title: '30 минут плавания', category: 'Физическая активность', difficulty: 'hard', xp: 50 },

  // Дневник и рефлексия (5)
  { emoji: '📝', title: 'Написать 3 страницы дневника', category: 'Дневник', difficulty: 'medium', xp: 25 },
  { emoji: '💭', title: 'Записать 5 мыслей за день', category: 'Дневник', difficulty: 'easy', xp: 10 },
  { emoji: '✍️', title: 'Написать благодарственное письмо', category: 'Дневник', difficulty: 'medium', xp: 25 },
  { emoji: '📖', title: '30 минут чтения книги', category: 'Дневник', difficulty: 'easy', xp: 10 },
  { emoji: '🎯', title: 'Поставить 3 цели на завтра', category: 'Дневник', difficulty: 'easy', xp: 10 },

  // Здоровье (6)
  { emoji: '💧', title: 'Выпить 8 стаканов воды', category: 'Здоровье', difficulty: 'easy', xp: 10 },
  { emoji: '🥗', title: 'Съесть 3 порции овощей и фруктов', category: 'Здоровье', difficulty: 'easy', xp: 10 },
  { emoji: '😴', title: 'Лечь спать до 23:00', category: 'Здоровье', difficulty: 'medium', xp: 25 },
  { emoji: '🧘‍♀️', title: '5 минут дыхательной медитации', category: 'Здоровье', difficulty: 'easy', xp: 10 },
  { emoji: '📵', title: 'Час без экранов перед сном', category: 'Здоровье', difficulty: 'hard', xp: 50 },
  { emoji: '🍎', title: 'Без сладкого весь день', category: 'Здоровье', difficulty: 'hard', xp: 50 },

  // Обучение (5)
  { emoji: '📚', title: 'Прочитать 20 страниц учебника', category: 'Обучение', difficulty: 'medium', xp: 25 },
  { emoji: '🧠', title: 'Выучить 10 новых слов', category: 'Обучение', difficulty: 'easy', xp: 10 },
  { emoji: '🎓', title: 'Посмотреть одну образовательную лекцию', category: 'Обучение', difficulty: 'medium', xp: 25 },
  { emoji: '🗣️', title: '15 минут практики иностранного языка', category: 'Обучение', difficulty: 'easy', xp: 10 },
  { emoji: '🎧', title: 'Послушать обучающий подкаст 30 минут', category: 'Обучение', difficulty: 'easy', xp: 10 },

  // Продуктивность (3)
  { emoji: '🍅', title: '4 цикла Помодоро (25/5)', category: 'Продуктивность', difficulty: 'hard', xp: 50 },
  { emoji: '🧹', title: 'Убрать рабочее место за 15 минут', category: 'Продуктивность', difficulty: 'easy', xp: 10 },
  { emoji: '📋', title: 'Составить план на неделю', category: 'Продуктивность', difficulty: 'medium', xp: 25 },

  // Социальное (3)
  { emoji: '📞', title: 'Позвонить другу или родственнику', category: 'Социальное', difficulty: 'easy', xp: 10 },
  { emoji: '🤝', title: 'Помочь кому-то с задачей', category: 'Социальное', difficulty: 'medium', xp: 25 },
  { emoji: '💬', title: 'Начать разговор с новым человеком', category: 'Социальное', difficulty: 'hard', xp: 50 },
]

// ─── Difficulty Config ────────────────────────────────────────────────────────

const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; dots: number; color: string }> = {
  easy: { label: 'Легко', dots: 1, color: 'text-emerald-500 dark:text-emerald-400' },
  medium: { label: 'Средне', dots: 2, color: 'text-amber-500 dark:text-amber-400' },
  hard: { label: 'Сложно', dots: 3, color: 'text-red-500 dark:text-red-400' },
}

// ─── Category Config ──────────────────────────────────────────────────────────

const CATEGORY_BADGE: Record<string, string> = {
  'Физическая активность': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 border-0',
  'Дневник': 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300 border-0',
  'Здоровье': 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300 border-0',
  'Обучение': 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 border-0',
  'Продуктивность': 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300 border-0',
  'Социальное': 'bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300 border-0',
}

// ─── Storage ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'unilife-daily-challenge'

function getStoredState(): StoredState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as StoredState
  } catch {
    return null
  }
}

function saveStoredState(state: StoredState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTodayStr(): string {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function seededRandom(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  const x = Math.sin(hash) * 10000
  return x - Math.floor(x)
}

function getChallengeForDate(dateStr: string): DailyChallenge {
  const index = Math.floor(seededRandom(dateStr) * CHALLENGES.length)
  return CHALLENGES[index]
}

function getTimeUntilMidnight(): { hours: number; minutes: number } {
  const now = new Date()
  const midnight = new Date(now)
  midnight.setHours(24, 0, 0, 0)
  const diff = midnight.getTime() - now.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return { hours, minutes }
}

// ─── Difficulty Dots Component ────────────────────────────────────────────────

function DifficultyDots({ difficulty }: { difficulty: Difficulty }) {
  const config = DIFFICULTY_CONFIG[difficulty]
  return (
    <div className="flex items-center gap-1" aria-label={`Сложность: ${config.label}`}>
      {[1, 2, 3].map((dot) => (
        <span
          key={dot}
          className={`inline-block h-2 w-2 rounded-full transition-colors ${dot <= config.dots
            ? config.color
            : 'bg-muted-foreground/20'
            }`}
        />
      ))}
      <span className="ml-1 text-[10px] font-medium text-muted-foreground">
        {config.label}
      </span>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DailyChallengeWidget() {
  const [mounted, setMounted] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0 })
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Get today's challenge based on date seed
  const todayStr = useMemo(() => getTodayStr(), [])
  const challenge = useMemo(() => getChallengeForDate(todayStr), [todayStr])

  // Load stored state on mount
  useEffect(() => {
    const stored = getStoredState()
    startTransition(() => {
      if (stored && stored.date === todayStr && stored.accepted) {
        setAccepted(true)
        setShowSuccess(true)
      }
      setMounted(true)
    })
  }, [todayStr])

  // Countdown timer
  useEffect(() => {
    const updateCountdown = () => {
      setCountdown(getTimeUntilMidnight())
    }
    updateCountdown()
    timerRef.current = setInterval(updateCountdown, 60000) // Update every minute
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  // Accept handler
  const handleAccept = useCallback(() => {
    setAccepted(true)
    setShowSuccess(true)
    saveStoredState({
      date: todayStr,
      accepted: true,
      acceptedAt: new Date().toISOString(),
    })
    toast.success('Вызов принят! 🎉', {
      description: `+${challenge.xp} XP за выполнение: ${challenge.title}`,
    })
  }, [todayStr, challenge])

  // Skip handler
  const handleSkip = useCallback(() => {
    toast('Вызов пропущен', {
      description: 'Новый вызов появится завтра.',
    })
  }, [])

  // ── Skeleton (loading) ────────────────────────────────────────────────
  if (!mounted) {
    return (
      <Card className="card-hover overflow-hidden rounded-xl border">
        <div className="pointer-events-none h-1 bg-gradient-to-r from-emerald-400 to-amber-400" />
        <CardContent className="p-5">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-5 w-40" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-9 rounded-xl" />
              <div className="space-y-1.5">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <div className="flex gap-3">
              <Skeleton className="h-9 w-36 rounded-lg" />
              <Skeleton className="h-9 w-24 rounded-lg" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const categoryBadgeClass = CATEGORY_BADGE[challenge.category] ?? 'bg-secondary text-secondary-foreground border-0'

  return (
    <Card className="card-hover overflow-hidden rounded-xl border">
      {/* Gradient top accent bar */}
      <div className="pointer-events-none h-1 bg-gradient-to-r from-emerald-400 to-amber-400" />

      <CardContent className="p-5">
        {/* Header */}
        <div className="mb-4 flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          <h3 className="text-sm font-semibold text-foreground">
            Ежедневный вызов
          </h3>
        </div>

        {/* Challenge info */}
        <div className="mb-3 flex items-start gap-3">
          {/* Emoji */}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-amber-50 text-xl shadow-sm dark:from-emerald-950/30 dark:to-amber-950/30">
            {challenge.emoji}
          </div>

          {/* Title + badges */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-lg font-bold leading-tight text-foreground">
                {challenge.title}
              </h4>
              <Badge variant="secondary" className={`text-[10px] font-medium ${categoryBadgeClass}`}>
                {challenge.category}
              </Badge>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <DifficultyDots difficulty={challenge.difficulty} />
              <span className="inline-flex items-center gap-1 text-xs font-semibold tabular-nums text-amber-600 dark:text-amber-400">
                <Sparkles className="h-3.5 w-3.5" />
                +{challenge.xp} XP
              </span>
            </div>
          </div>
        </div>

        {/* Accepted state */}
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: 'easeInOut' as const }}
            className="mb-4"
          >
            <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-3 dark:from-emerald-950/30 dark:to-teal-950/30">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.15 }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md">
                  <Check className="h-4 w-4" />
                </div>
              </motion.div>
              <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                Вызов принят! ✨
              </span>
            </div>
          </motion.div>
        )}

        {/* Actions (hidden when accepted) */}
        {!accepted && (
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleAccept}
              size="default"
              className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md hover:from-emerald-600 hover:to-teal-600"
            >
              <Flame className="h-4 w-4" />
              Принять вызов
            </Button>
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground"
            >
              <SkipForward className="h-4 w-4" />
              Пропустить
            </Button>
          </div>
        )}

        {/* Countdown to next challenge */}
        <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>
            Следующий вызов через{' '}
            <span className="font-medium tabular-nums text-foreground">
              {countdown.hours}ч {countdown.minutes}м
            </span>
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
