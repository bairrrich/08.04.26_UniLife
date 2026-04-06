'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sun,
  CloudSun,
  Moon,
  Flame,
  Quote,
  Target,
  RefreshCw,
  CheckCircle2,
  Circle,
  BookOpen,
  UtensilsCrossed,
  Dumbbell,
  Sparkles,
  Clock,
  SmilePlus,
} from 'lucide-react'
import { getDayOfYear, getGreeting, MOOD_EMOJI } from '@/lib/format'

// ─── Types ────────────────────────────────────────────────────────────────────

type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night'

interface WelcomeWidgetProps {
  loading?: boolean
  diaryStreak: number
  dailyProgress: number
  todayMood: number | null
  hasMealsToday: boolean
  todayWorkoutDone: boolean
  habitsCompletedToday: number
  habitsTotal: number
}

// ─── 18 Motivational Quotes ──────────────────────────────────────────────────

const WELCOME_QUOTES = [
  { text: 'Каждый день — это новая возможность стать лучше.', author: 'Неизвестный автор' },
  { text: 'Маленькие шаги каждый день приводят к большим результатам.', author: 'Неизвестный автор' },
  { text: 'Дисциплина — это мост между целями и достижениями.', author: 'Джим Рон' },
  { text: 'Успех — это сумма маленьких усилий, повторяемых день за днём.', author: 'Роберт Кольер' },
  { text: 'Не бойся идти медленно, бойся стоять на месте.', author: 'Китайская пословица' },
  { text: 'Лучшее время посадить дерево было 20 лет назад. Следующее лучшее время — сейчас.', author: 'Китайская пословица' },
  { text: 'Единственный способ сделать отличную работу — любить то, что делаешь.', author: 'Стив Джобс' },
  { text: 'Трудности — это не препятствия, а указатели на пути.', author: 'Ральф Уолдо Эмерсон' },
  { text: 'Будь тем изменением, которое хочешь видеть в мире.', author: 'Махатма Ганди' },
  { text: 'Сила не в том, чтобы не падать, а в том, чтобы каждый раз вставать.', author: 'Конфуций' },
  { text: 'Ваше будущее создаётся тем, что вы делаете сегодня, а не завтра.', author: 'Роберт Кийосаки' },
  { text: 'Повседневные привычки — невидимая архитектура счастливой жизни.', author: 'Джеймс Клир' },
  { text: 'Начни там, где ты есть. Используй то, что имеешь. Делай то, что можешь.', author: 'Артур Эш' },
  { text: 'Счастье — это не станция, куда мы прибываем, а способ путешествия.', author: 'Маргарет Ли Ранбек' },
  { text: 'Тот, кто достаточно упрям, чтобы продолжать, когда все отступили, может изменить мир.', author: 'Неизвестный автор' },
  { text: 'Делай что можешь, с тем что имеешь, там где ты есть.', author: 'Теодор Рузвельт' },
  { text: 'Великие дела не делаются импульсивно, а серией маленьких дел, собранных вместе.', author: 'Винсент Ван Гог' },
  { text: 'Путь в тысячу ли начинается с одного шага.', author: 'Лао-цзы' },
]

// ─── 30+ Daily Challenges ───────────────────────────────────────────────────

const DAILY_CHALLENGES = [
  { emoji: '📝', text: 'Напишите 3 вещи, за которые благодарны сегодня' },
  { emoji: '🚶', text: 'Сделайте 10-минутную прогулку на свежем воздухе' },
  { emoji: '🍳', text: 'Попробуйте новый рецепт или новое блюдо' },
  { emoji: '💧', text: 'Выпейте 8 стаканов воды за день' },
  { emoji: '📖', text: 'Прочитайте 10 страниц любой книги' },
  { emoji: '🧘', text: 'Сделайте 5 минут медитации или глубокого дыхания' },
  { emoji: '💪', text: 'Выполните 15 минут любой физической активности' },
  { emoji: '🎨', text: 'Сделайте что-то творческое: рисунок, фото, стих' },
  { emoji: '😴', text: 'Ложитесь спать на 30 минут раньше обычного' },
  { emoji: '🧹', text: 'Уберите одно место, которое давно откладывали' },
  { emoji: '📞', text: 'Напишите или позвоните близкому человеку' },
  { emoji: '🎵', text: 'Послушайте новый музыкальный жанр или исполнителя' },
  { emoji: '📱', text: 'Проведите 1 час без социальных сетей' },
  { emoji: '✍️', text: 'Запишите свои цели на эту неделю в дневник' },
  { emoji: '🌱', text: 'Подумайте о новой привычке и начните её сегодня' },
  { emoji: '🌿', text: 'Проведите 15 минут на природе, обратите внимание на детали' },
  { emoji: '📝', text: 'Составьте список из 5 вещей, которые вас радуют' },
  { emoji: '🧩', text: 'Решите головоломку, кроссворд или судоку' },
  { emoji: '💤', text: 'Сделайте перерыв: 20 минут отдыха без экранов' },
  { emoji: '🥗', text: 'Съешьте порцию овощей или фруктов к каждому приёму пищи' },
  { emoji: '🏃', text: 'Поднимитесь по лестнице вместо лифта минимум 3 раза' },
  { emoji: '🗓️', text: 'Запланируйте завтрашний день вечером сегодня' },
  { emoji: '🗣️', text: 'Скажите комплимент трём разным людям' },
  { emoji: '📚', text: 'Изучите одно новое слово или понятие на любом языке' },
  { emoji: '🎭', text: 'Попробуйте занятие, которым никогда раньше не занимались' },
  { emoji: '🌻', text: 'Заведите растение или ухаживайте за уже существующим' },
  { emoji: '🎯', text: 'Выберите одну задачу и завершите её до обеда' },
  { emoji: '☕', text: 'Выпейте утренний чай или кофе в тишине, без телефона' },
  { emoji: '🌈', text: 'Найдите что-то красивое вокруг и сфотографируйте' },
  { emoji: '🤝', text: 'Помогите кому-то с небольшой задачей' },
  { emoji: '📝', text: 'Напишите отзыв или благодарность человеку, который вам помог' },
]

// ─── Time-of-day Config ──────────────────────────────────────────────────────

function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 22) return 'evening'
  return 'night'
}

const TIME_CONFIG: Record<TimeOfDay, {
  gradient: string
  gradientDark: string
  borderAccent: string
  iconBg: string
  icon: typeof Sun
  iconColor: string
  greeting: string
  challengeBg: string
  challengeBorder: string
  badgeBg: string
  badgeText: string
  streakColor: string
  streakBg: string
}> = {
  morning: {
    gradient: 'from-amber-500/10 via-orange-400/5 to-yellow-500/10',
    gradientDark: 'dark:from-amber-950/30 dark:via-orange-950/20 dark:to-yellow-950/30',
    borderAccent: 'border-l-amber-400',
    iconBg: 'bg-amber-100 dark:bg-amber-900/50',
    icon: Sun,
    iconColor: 'text-amber-500 dark:text-amber-400',
    greeting: 'Доброе утро',
    challengeBg: 'bg-amber-50/80 dark:bg-amber-950/20',
    challengeBorder: 'border-amber-200/50 dark:border-amber-800/30',
    badgeBg: 'bg-amber-100 dark:bg-amber-900/40',
    badgeText: 'text-amber-700 dark:text-amber-300',
    streakColor: 'text-amber-600 dark:text-amber-400',
    streakBg: 'bg-amber-50 dark:bg-amber-950/30',
  },
  afternoon: {
    gradient: 'from-blue-500/10 via-sky-400/5 to-cyan-500/10',
    gradientDark: 'dark:from-blue-950/30 dark:via-sky-950/20 dark:to-cyan-950/30',
    borderAccent: 'border-l-blue-400',
    iconBg: 'bg-blue-100 dark:bg-blue-900/50',
    icon: CloudSun,
    iconColor: 'text-blue-500 dark:text-blue-400',
    greeting: 'Добрый день',
    challengeBg: 'bg-blue-50/80 dark:bg-blue-950/20',
    challengeBorder: 'border-blue-200/50 dark:border-blue-800/30',
    badgeBg: 'bg-blue-100 dark:bg-blue-900/40',
    badgeText: 'text-blue-700 dark:text-blue-300',
    streakColor: 'text-blue-600 dark:text-blue-400',
    streakBg: 'bg-blue-50 dark:bg-blue-950/30',
  },
  evening: {
    gradient: 'from-purple-500/10 via-violet-400/5 to-indigo-500/10',
    gradientDark: 'dark:from-purple-950/30 dark:via-violet-950/20 dark:to-indigo-950/30',
    borderAccent: 'border-l-purple-400',
    iconBg: 'bg-purple-100 dark:bg-purple-900/50',
    icon: Moon,
    iconColor: 'text-purple-500 dark:text-purple-400',
    greeting: 'Добрый вечер',
    challengeBg: 'bg-purple-50/80 dark:bg-purple-950/20',
    challengeBorder: 'border-purple-200/50 dark:border-purple-800/30',
    badgeBg: 'bg-purple-100 dark:bg-purple-900/40',
    badgeText: 'text-purple-700 dark:text-purple-300',
    streakColor: 'text-purple-600 dark:text-purple-400',
    streakBg: 'bg-purple-50 dark:bg-purple-950/30',
  },
  night: {
    gradient: 'from-indigo-500/10 via-blue-900/5 to-slate-500/10',
    gradientDark: 'dark:from-indigo-950/30 dark:via-blue-950/20 dark:to-slate-900/30',
    borderAccent: 'border-l-indigo-400',
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/50',
    icon: Moon,
    iconColor: 'text-indigo-400 dark:text-indigo-400',
    greeting: 'Доброй ночи',
    challengeBg: 'bg-indigo-50/80 dark:bg-indigo-950/20',
    challengeBorder: 'border-indigo-200/50 dark:border-indigo-800/30',
    badgeBg: 'bg-indigo-100 dark:bg-indigo-900/40',
    badgeText: 'text-indigo-700 dark:text-indigo-300',
    streakColor: 'text-indigo-400 dark:text-indigo-400',
    streakBg: 'bg-indigo-50 dark:bg-indigo-950/30',
  },
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function WelcomeWidget({
  loading = false,
  diaryStreak,
  dailyProgress,
  todayMood,
  hasMealsToday,
  todayWorkoutDone,
  habitsCompletedToday,
  habitsTotal,
}: WelcomeWidgetProps) {
  const [mounted, setMounted] = useState(false)
  const [quoteRefreshing, setQuoteRefreshing] = useState(false)
  const [quoteOffset, setQuoteOffset] = useState(0)
  const [currentTime, setCurrentTime] = useState('')

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard client-only hydration guard
    setMounted(true)
  }, [])

  // ── Current time (updates every 30s) ──────────────────────────────
  useEffect(() => {
    const updateTime = () => {
      const n = new Date()
      setCurrentTime(
        `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`
      )
    }
    updateTime()
    const interval = setInterval(updateTime, 30000)
    return () => clearInterval(interval)
  }, [])

  // ── User name from localStorage ──────────────────────────────────────
  const userName = useMemo(() => {
    if (typeof window === 'undefined') return 'Пользователь'
    try {
      return (
        localStorage.getItem('unilife_username') ||
        localStorage.getItem('unilife-user-name') ||
        'Пользователь'
      )
    } catch {
      return 'Пользователь'
    }
  }, [mounted])

  // ── Time of day ──────────────────────────────────────────────────────
  const timeOfDay = useMemo(() => getTimeOfDay(), [])
  const config = TIME_CONFIG[timeOfDay]
  const TimeIcon = config.icon

  // ── Date formatting (Russian) ────────────────────────────────────────
  const formattedDate = useMemo(() => {
    const now = new Date()
    return now.toLocaleDateString('ru-RU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }, [])

  // ── Daily quote (based on day of year + offset for refresh) ─────────
  const currentQuote = useMemo(() => {
    const dayIdx = getDayOfYear()
    return WELCOME_QUOTES[(dayIdx + quoteOffset) % WELCOME_QUOTES.length]
  }, [quoteOffset])

  // ── Daily challenge (based on day of year) ──────────────────────────
  const dailyChallenge = useMemo(() => {
    const dayIdx = getDayOfYear()
    return DAILY_CHALLENGES[dayIdx % DAILY_CHALLENGES.length]
  }, [])

  // ── Quote refresh handler ───────────────────────────────────────────
  const handleRefreshQuote = () => {
    setQuoteRefreshing(true)
    setQuoteOffset((prev) => prev + 1)
    setTimeout(() => setQuoteRefreshing(false), 400)
  }

  // ── Quick stats calculation ─────────────────────────────────────────
  const quickStats = useMemo(() => [
    {
      icon: <Flame className="h-3.5 w-3.5" />,
      label: 'Серия',
      value: `${diaryStreak} дн.`,
      done: diaryStreak > 0,
      color: diaryStreak >= 7 ? 'text-amber-500' : diaryStreak >= 3 ? 'text-orange-500' : 'text-muted-foreground',
    },
    {
      icon: <BookOpen className="h-3.5 w-3.5" />,
      label: 'Дневник',
      value: todayMood ? '✅' : '—',
      done: !!todayMood,
      color: todayMood ? 'text-emerald-500' : 'text-muted-foreground',
    },
    {
      icon: <UtensilsCrossed className="h-3.5 w-3.5" />,
      label: 'Питание',
      value: hasMealsToday ? '✅' : '—',
      done: hasMealsToday,
      color: hasMealsToday ? 'text-emerald-500' : 'text-muted-foreground',
    },
    {
      icon: <Dumbbell className="h-3.5 w-3.5" />,
      label: 'Тренировка',
      value: todayWorkoutDone ? '✅' : '—',
      done: todayWorkoutDone,
      color: todayWorkoutDone ? 'text-emerald-500' : 'text-muted-foreground',
    },
    {
      icon: <Target className="h-3.5 w-3.5" />,
      label: 'Привычки',
      value: habitsTotal > 0 ? `${habitsCompletedToday}/${habitsTotal}` : '—',
      done: habitsTotal > 0 && habitsCompletedToday === habitsTotal,
      color: habitsTotal > 0 && habitsCompletedToday === habitsTotal ? 'text-emerald-500' : 'text-muted-foreground',
    },
  ], [diaryStreak, todayMood, hasMealsToday, todayWorkoutDone, habitsCompletedToday, habitsTotal])

  const completedCount = quickStats.filter((s) => s.done).length
  const allDone = completedCount === quickStats.length

  // ── Don't render until mounted to avoid hydration mismatch ──────────
  if (!mounted) {
    return (
      <Card className="animate-slide-up overflow-hidden rounded-xl border-0">
        <CardContent className="p-5">
          <div className="skeleton-shimmer h-[200px] rounded-xl" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={`animate-slide-up glass-card card-hover overflow-hidden rounded-xl border-l-4 ${config.borderAccent} border-t-0 border-r-0 border-b-0 p-0`}
    >
      {/* Gradient background overlay */}
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${config.gradient} ${config.gradientDark}`} />

      {/* Gradient mesh — two overlapping blurred circles */}
      <div className="pointer-events-none absolute -right-12 -top-8 h-48 w-48 rounded-full bg-gradient-to-br from-emerald-400/15 to-teal-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-8 bottom-0 h-36 w-36 rounded-full bg-gradient-to-br from-amber-400/10 to-orange-500/8 blur-3xl" />

      <CardContent className="relative p-5 sm:p-6">
        {/* ── Header: Greeting + Time Icon ──────────────────────────── */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5">
              {/* Time-of-day icon */}
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${config.iconBg}`}>
                <TimeIcon className={`h-5 w-5 ${config.iconColor}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold tracking-tight sm:text-xl">
                    {config.greeting}, <span className="text-gradient-emerald">{userName}</span>!
                  </h2>
                  {/* Current time display */}
                  <span className="hidden items-center gap-1 rounded-full border border-border/50 bg-muted/50 px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground sm:inline-flex">
                    <Clock className="h-3 w-3" />
                    {currentTime}
                  </span>
                </div>
                <div className="mt-0.5 flex items-center gap-2">
                  <p className="text-sm capitalize text-muted-foreground">
                    {formattedDate}
                  </p>
                  {/* Mood indicator from today's diary entry */}
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${
                    todayMood
                      ? 'border-emerald-200/50 bg-emerald-50/80 text-emerald-700 dark:border-emerald-800/30 dark:bg-emerald-950/30 dark:text-emerald-400'
                      : 'border-border/50 bg-muted/50 text-muted-foreground'
                  }`}>
                    <SmilePlus className="h-3 w-3" />
                    {todayMood ? MOOD_EMOJI[todayMood] : '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Streak badge */}
          {diaryStreak > 0 && (
            <Badge
              variant="secondary"
              className={`shrink-0 gap-1 border-0 px-2.5 py-1 text-xs font-semibold ${config.badgeBg} ${config.badgeText}`}
            >
              <Flame className="h-3.5 w-3.5" />
              {diaryStreak} дн.
            </Badge>
          )}
        </div>

        {/* ── Two-Column Layout: Quote + Challenge ──────────────────── */}
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Daily Quote */}
          <div className={`relative rounded-lg border ${config.challengeBorder} bg-card/60 p-4 backdrop-blur-sm`}>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Quote className={`h-3.5 w-3.5 ${config.iconColor}`} />
                <span className="text-xs font-semibold text-muted-foreground">Цитата дня</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefreshQuote}
                disabled={quoteRefreshing}
                className="h-6 w-6 rounded-md p-0 text-muted-foreground hover:text-foreground"
              >
                <RefreshCw
                  className={`h-3 w-3 transition-transform duration-300 ${quoteRefreshing ? 'rotate-180' : ''}`}
                />
              </Button>
            </div>
            <blockquote className="mb-2 border-l-2 border-primary/30 pl-3 text-sm leading-relaxed text-foreground/90 italic">
              &laquo;{currentQuote.text}&raquo;
            </blockquote>
            <p className="text-[11px] text-muted-foreground">
              — {currentQuote.author}
            </p>
          </div>

          {/* Daily Challenge */}
          <div className={`relative rounded-lg border ${config.challengeBorder} ${config.challengeBg} p-4`}>
            <div className="mb-2 flex items-center gap-1.5">
              <Sparkles className={`h-3.5 w-3.5 ${config.iconColor}`} />
              <span className="text-xs font-semibold text-muted-foreground">Задание дня</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 text-xl leading-none">{dailyChallenge.emoji}</span>
              <p className="text-sm leading-relaxed text-foreground/90">
                {dailyChallenge.text}
              </p>
            </div>
          </div>
        </div>

        {/* ── Quick Stats Row ───────────────────────────────────────── */}
        <div className="space-y-2.5">
          {/* Progress bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 rounded-full bg-muted/60 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  allDone
                    ? 'bg-gradient-to-r from-emerald-400 to-teal-400'
                    : dailyProgress > 50
                      ? 'bg-gradient-to-r from-amber-400 to-orange-400'
                      : 'bg-gradient-to-r from-blue-400 to-sky-400'
                }`}
                style={{ width: `${dailyProgress}%` }}
              />
            </div>
            <span className={`text-xs font-semibold tabular-nums shrink-0 ${
              allDone
                ? 'text-emerald-500'
                : dailyProgress > 50
                  ? 'text-amber-500'
                  : 'text-muted-foreground'
            }`}>
              {dailyProgress}%
            </span>
          </div>

          {/* Stats items */}
          <div className="flex flex-wrap items-center gap-1.5">
            {quickStats.map((stat) => (
              <div
                key={stat.label}
                className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  stat.done
                    ? `${config.streakBg} border-primary/20 ${stat.color}`
                    : 'bg-muted/40 border-border text-muted-foreground'
                }`}
              >
                {stat.done ? (
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                ) : (
                  <Circle className="h-3 w-3 text-muted-foreground/40" />
                )}
                <span className="capitalize">{stat.label}</span>
                <span className={`tabular-nums font-semibold ${stat.color}`}>
                  {stat.value}
                </span>
              </div>
            ))}
          </div>

          {/* Celebration message */}
          {allDone && (
            <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 px-3 py-2">
              <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                Все задачи дня выполнены! Отличная работа!
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
