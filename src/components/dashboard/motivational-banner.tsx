'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { BookOpen, Dumbbell, CheckCircle2 } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface MotivationalBannerProps {
  diaryStreak?: number
  workoutStreak?: number
  habitsStreak?: number
}

type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night'

// ─── Motivational Quotes Pool (15+) ──────────────────────────────────────────

const MOTIVATIONAL_QUOTES = [
  'Каждый день — это чистый холст. Нарисуй на нём шедевр.',
  'Дисциплина — это мост между целями и достижениями.',
  'Маленькие шаги каждый день приводят к большим результатам.',
  'Не бойся идти медленно, бойся стоять на месте.',
  'Повседневные привычки — невидимая архитектура счастливой жизни.',
  'Лучшее время начать было вчера. Следующее лучшее время — сейчас.',
  'Единственный способ сделать отличную работу — любить то, что делаешь.',
  'Сила не в том, чтобы не падать, а в том, чтобы каждый раз вставать.',
  'Трудности — это не препятствия, а указатели на пути.',
  'Ваше будущее создаётся тем, что вы делаете сегодня.',
  'Успех — это сумма маленьких усилий, повторяемых день за днём.',
  'Будь тем изменением, которое хочешь видеть в мире.',
  'Начни там, где ты есть. Используй то, что имеешь.',
  'Путь в тысячу ли начинается с одного шага.',
  'Великие дела не делаются импульсивно, а серией маленьких дел.',
  'Счастье — это не станция, куда мы прибываем, а способ путешествия.',
  'Забота о здоровье — лучшая инвестиция, которую можно сделать.',
  'Знания — это единственное богатство, которое растёт при делении.',
]

// ─── Time-of-day Config ──────────────────────────────────────────────────────

function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours()
  if (hour >= 6 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 22) return 'evening'
  return 'night'
}

const TIME_CONFIG: Record<TimeOfDay, {
  greeting: string
  emoji: string
  gradient: string
  gradientDark: string
  textMuted: string
  blob1: string
  blob2: string
  badgeBg: string
  badgeBorder: string
  badgeText: string
}> = {
  morning: {
    greeting: 'Доброе утро',
    emoji: '☀️',
    gradient: 'from-emerald-500 to-teal-500',
    gradientDark: 'dark:from-emerald-700 dark:to-teal-700',
    textMuted: 'text-emerald-100/80 dark:text-emerald-200/70',
    blob1: 'bg-emerald-300/30',
    blob2: 'bg-teal-300/20',
    badgeBg: 'bg-white/15 dark:bg-white/10',
    badgeBorder: 'border-white/20 dark:border-white/10',
    badgeText: 'text-white',
  },
  afternoon: {
    greeting: 'Добрый день',
    emoji: '🌤️',
    gradient: 'from-amber-500 to-orange-500',
    gradientDark: 'dark:from-amber-700 dark:to-orange-700',
    textMuted: 'text-amber-100/80 dark:text-amber-200/70',
    blob1: 'bg-amber-300/30',
    blob2: 'bg-orange-300/20',
    badgeBg: 'bg-white/15 dark:bg-white/10',
    badgeBorder: 'border-white/20 dark:border-white/10',
    badgeText: 'text-white',
  },
  evening: {
    greeting: 'Добрый вечер',
    emoji: '🌅',
    gradient: 'from-violet-500 to-purple-500',
    gradientDark: 'dark:from-violet-700 dark:to-purple-700',
    textMuted: 'text-violet-100/80 dark:text-violet-200/70',
    blob1: 'bg-violet-300/30',
    blob2: 'bg-purple-300/20',
    badgeBg: 'bg-white/15 dark:bg-white/10',
    badgeBorder: 'border-white/20 dark:border-white/10',
    badgeText: 'text-white',
  },
  night: {
    greeting: 'Доброй ночи',
    emoji: '🌙',
    gradient: 'from-slate-500 to-indigo-500',
    gradientDark: 'dark:from-slate-700 dark:to-indigo-700',
    textMuted: 'text-slate-100/80 dark:text-slate-200/70',
    blob1: 'bg-slate-300/30',
    blob2: 'bg-indigo-300/20',
    badgeBg: 'bg-white/15 dark:bg-white/10',
    badgeBorder: 'border-white/20 dark:border-white/10',
    badgeText: 'text-white',
  },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTodayKey(): string {
  const now = new Date()
  return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`
}

function getStoredQuote(): string {
  if (typeof window === 'undefined') return MOTIVATIONAL_QUOTES[0]
  const todayKey = getTodayKey()
  const storedKey = 'unilife_motivational_quote_day'
  const storedQuote = 'unilife_motivational_quote'
  try {
    const savedDay = localStorage.getItem(storedKey)
    if (savedDay === todayKey) {
      const saved = localStorage.getItem(storedQuote)
      if (saved) return saved
    }
    // New day — pick a new random quote
    const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)
    const quote = MOTIVATIONAL_QUOTES[randomIndex]
    localStorage.setItem(storedKey, todayKey)
    localStorage.setItem(storedQuote, quote)
    return quote
  } catch {
    return MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MotivationalBanner({
  diaryStreak = 0,
  workoutStreak = 0,
  habitsStreak = 0,
}: MotivationalBannerProps) {
  const [mounted] = useState(() => typeof window !== 'undefined')

  const timeOfDay = useMemo(() => getTimeOfDay(), [])
  const config = TIME_CONFIG[timeOfDay]

  const dailyQuote = useMemo(() => {
    if (!mounted) return MOTIVATIONAL_QUOTES[0]
    return getStoredQuote()
  }, [mounted])

  // ── Streak data for badges
  const streaks = useMemo(() => {
    const items: Array<{
      label: string
      value: number
      icon: typeof BookOpen
    }> = []

    if (diaryStreak > 0) {
      items.push({ label: 'Дневник', value: diaryStreak, icon: BookOpen })
    }
    if (workoutStreak > 0) {
      items.push({ label: 'Тренировки', value: workoutStreak, icon: Dumbbell })
    }
    if (habitsStreak > 0) {
      items.push({ label: 'Привычки', value: habitsStreak, icon: CheckCircle2 })
    }

    return items
  }, [diaryStreak, workoutStreak, habitsStreak])

  // ── Skeleton state while hydrating
  if (!mounted) {
    return (
      <Card className="animate-slide-up overflow-hidden rounded-xl border-0">
        <CardContent className="p-0">
          <div className="skeleton-shimmer h-[120px] rounded-xl" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="card-hover animate-slide-up overflow-hidden rounded-xl border-0 p-0 shadow-lg">
      {/* Gradient background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${config.gradient} ${config.gradientDark}`}
      />

      {/* Subtle floating gradient blobs */}
      <div
        className={`pointer-events-none absolute -right-10 -top-6 h-44 w-44 rounded-full ${config.blob1} blur-3xl`}
      />
      <div
        className={`pointer-events-none absolute -left-8 bottom-0 h-36 w-36 rounded-full ${config.blob2} blur-3xl`}
      />
      <div
        className="pointer-events-none absolute bottom-4 right-1/3 h-28 w-28 rounded-full bg-white/5 blur-3xl"
      />

      <CardContent className="relative p-5 sm:p-6">
        {/* ── Greeting ──────────────────────────────────────────────────── */}
        <div className="mb-2">
          <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            {config.emoji} {config.greeting}!
          </h2>
        </div>

        {/* ── Motivational Quote ─────────────────────────────────────────── */}
        <blockquote className="mb-4 text-sm italic leading-relaxed text-white/80 sm:text-base">
          &laquo;{dailyQuote}&raquo;
        </blockquote>

        {/* ── Streak Counters ────────────────────────────────────────────── */}
        {streaks.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {streaks.map((streak) => {
              const Icon = streak.icon
              return (
                <div
                  key={streak.label}
                  className={`inline-flex items-center gap-1.5 rounded-full border ${config.badgeBg} ${config.badgeBorder} px-3 py-1 text-xs font-semibold backdrop-blur-sm ${config.badgeText}`}
                >
                  <Icon className="h-3 w-3" />
                  <span>{streak.label}</span>
                  <span className="tabular-nums">{streak.value}</span>
                  {streak.value > 3 && (
                    <span>🔥</span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
