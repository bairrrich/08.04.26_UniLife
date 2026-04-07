'use client'

import { useState, useEffect, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, RefreshCw, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { MOOD_EMOJI, MOOD_LABELS, getTodayStr } from '@/lib/format'
import { safeJson } from '@/lib/safe-fetch'

// ─── Types ────────────────────────────────────────────────────────────────

interface Recommendation {
  emoji: string
  title: string
  description: string
}

// ─── Mood-based Recommendations Map ──────────────────────────────────────

const MOOD_RECOMMENDATIONS: Record<number, Recommendation[]> = {
  1: [
    { emoji: '🚶', title: 'Попробуйте прогуляться', description: 'Лёгкая прогулка помогает освободить мысли и поднять настроение' },
    { emoji: '✍️', title: 'Напишите в дневник', description: 'Выразите свои чувства на бумаге — это облегчит душу' },
    { emoji: '📞', title: 'Позвоните другу', description: 'Разговор с близким человеком может изменить перспективу' },
    { emoji: '🎵', title: 'Послушайте любимую музыку', description: 'Музыка имеет силу менять наше эмоциональное состояние' },
  ],
  2: [
    { emoji: '💧', title: 'Выпейте стакан воды', description: 'Обезвоживание может влиять на настроение и энергию' },
    { emoji: '🌬️', title: 'Подышите свежим воздухом', description: 'Несколько глубоких вдохов на улице помогут отдохнуть' },
    { emoji: '🎶', title: 'Послушайте музыку', description: 'Поднимите настроение любимыми мелодиями' },
    { emoji: '🌿', title: 'Заварите травяной чай', description: 'Тёплый напиток и момент спокойствия — отличная комбинация' },
  ],
  3: [
    { emoji: '📋', title: 'Запланируйте день', description: 'Чёткий план помогает чувствовать себя увереннее и продуктивнее' },
    { emoji: '💰', title: 'Проверьте финансы', description: 'Контроль расходов — шаг к финансовому спокойствию' },
    { emoji: '🔄', title: 'Обновите привычки', description: 'Проверьте прогресс и скорректируйте свои цели на день' },
    { emoji: '📖', title: 'Прочитайте пару страниц', description: 'Чтение расширяет кругозор и даёт пищу для размышлений' },
  ],
  4: [
    { emoji: '💪', title: 'Добавьте тренировку', description: 'Физическая активность закрепит хорошее настроение' },
    { emoji: '🍳', title: 'Запишите рецепт', description: 'Сохраните вкусное блюдо, чтобы приготовить его снова' },
    { emoji: '🎯', title: 'Поставьте новую цель', description: 'Используйте энергию для достижения чего-то важного' },
    { emoji: '📸', title: 'Сделайте селфи', description: 'Запомните этот хороший момент на память' },
  ],
  5: [
    { emoji: '🎉', title: 'Отпразднуйте успех!', description: 'Вы заслужили этот момент радости — наслаждайтесь!' },
    { emoji: '🤝', title: 'Поделитесь моментом', description: 'Расскажите близким о чём-то хорошем, что произошло' },
    { emoji: '🫂', title: 'Помогите кому-то', description: 'Помощь другим усиливает собственное чувство счастья' },
    { emoji: '🌟', title: 'Запишите, что пошло хорошо', description: 'Сохраните воспоминания о прекрасном дне в дневнике' },
  ],
}

// Default recommendations when no mood is set
const DEFAULT_RECOMMENDATIONS: Recommendation[] = [
  { emoji: '🤔', title: 'Определите настроение', description: 'Начните с отслеживания — это первый шаг к осознанности' },
  { emoji: '📝', title: 'Сделайте запись в дневник', description: 'Запишите свои мысли и чувства за сегодня' },
  { emoji: '✅', title: 'Проверьте привычки', description: 'Посмотрите, какие привычки можно выполнить сегодня' },
]

// ─── Mood color theming ─────────────────────────────────────────────────

function getMoodAccentColor(mood: number | null): string {
  if (mood === null) return 'from-slate-400 to-slate-500'
  const colors: Record<number, string> = {
    1: 'from-rose-400 to-red-500',
    2: 'from-orange-400 to-amber-500',
    3: 'from-yellow-400 to-amber-400',
    4: 'from-lime-400 to-emerald-500',
    5: 'from-emerald-400 to-teal-500',
  }
  return colors[mood] || 'from-slate-400 to-slate-500'
}

function getMoodTintBg(mood: number | null): string {
  if (mood === null) return 'bg-gradient-to-br from-slate-50/80 to-slate-100/40 dark:from-slate-950/30 dark:to-slate-900/20'
  const bgs: Record<number, string> = {
    1: 'bg-gradient-to-br from-rose-50/60 to-red-50/30 dark:from-rose-950/20 dark:to-red-950/10',
    2: 'bg-gradient-to-br from-orange-50/60 to-amber-50/30 dark:from-orange-950/20 dark:to-amber-950/10',
    3: 'bg-gradient-to-br from-yellow-50/60 to-amber-50/30 dark:from-yellow-950/20 dark:to-amber-950/10',
    4: 'bg-gradient-to-br from-lime-50/60 to-emerald-50/30 dark:from-lime-950/20 dark:to-emerald-950/10',
    5: 'bg-gradient-to-br from-emerald-50/60 to-teal-50/30 dark:from-emerald-950/20 dark:to-teal-950/10',
  }
  return bgs[mood] || bgs[3]
}

function getMoodCardBorder(mood: number | null): string {
  if (mood === null) return 'border-slate-200/60 dark:border-slate-800/40'
  const borders: Record<number, string> = {
    1: 'border-rose-200/60 dark:border-rose-900/30',
    2: 'border-orange-200/60 dark:border-orange-900/30',
    3: 'border-yellow-200/60 dark:border-yellow-900/30',
    4: 'border-lime-200/60 dark:border-lime-900/30',
    5: 'border-emerald-200/60 dark:border-emerald-900/30',
  }
  return borders[mood] || borders[3]
}

// ─── Animation Variants ─────────────────────────────────────────────────

const cardVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.96 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.08,
      duration: 0.35,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
  exit: { opacity: 0, y: -8, scale: 0.95, transition: { duration: 0.2 } },
}

// ─── Component ─────────────────────────────────────────────────────────────

export default memo(function MoodRecommendations() {
  const [mood, setMood] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [animKey, setAnimKey] = useState(0)

  // ── Fetch today's mood ────────────────────────────────────────────────
  const fetchTodayMood = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)

    try {
      const today = getTodayStr()
      const res = await fetch(`/api/diary?month=${today.slice(0, 7)}`)
      const json = await safeJson<{ data: Array<{ id: string; date: string; mood: number | null }> }>(res)
      if (json?.data) {
        const todayEntry = json.data.find((e) => {
          const d = new Date(e.date)
          const entryDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
          return entryDate === today
        })
        setMood(todayEntry?.mood ?? null)
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false)
      setRefreshing(false)
      if (isRefresh) {
        setAnimKey((k) => k + 1)
      }
    }
  }, [])

  useEffect(() => {
    fetchTodayMood()
  }, [fetchTodayMood])

  // ── Derive recommendations ───────────────────────────────────────────
  const recommendations = mood
    ? MOOD_RECOMMENDATIONS[mood] || DEFAULT_RECOMMENDATIONS
    : DEFAULT_RECOMMENDATIONS

  // ── Mood summary text ────────────────────────────────────────────────
  const moodSummary = mood
    ? `Ваше настроение: ${MOOD_EMOJI[mood]} ${MOOD_LABELS[mood]}`
    : 'Настроение ещё не указано'

  return (
    <Card className={cn('rounded-xl border overflow-hidden card-hover', getMoodTintBg(mood))}>
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              'h-7 w-7 rounded-lg bg-gradient-to-br flex items-center justify-center shadow-sm',
              getMoodAccentColor(mood)
            )}>
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold">Как улучшить ваш день</span>
          </div>
          <button
            type="button"
            onClick={() => fetchTodayMood(true)}
            disabled={refreshing || loading}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/50 bg-background/80 text-muted-foreground shadow-sm transition-all hover:bg-muted hover:text-foreground disabled:opacity-50 disabled:pointer-events-none"
            aria-label="Обновить рекомендации"
            title="Обновить"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', refreshing && 'animate-spin')} />
          </button>
        </div>

        {/* Current mood badge */}
        <div className={cn(
          'flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium border',
          getMoodCardBorder(mood),
          mood
            ? 'bg-background/60 dark:bg-background/30'
            : 'bg-muted/40 dark:bg-muted/20'
        )}>
          <span className="text-base leading-none">
            {mood ? MOOD_EMOJI[mood] : '🤷'}
          </span>
          <span className="text-muted-foreground">
            {moodSummary}
          </span>
        </div>

        {/* Recommendation Cards */}
        {loading ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="skeleton-shimmer h-[72px] rounded-lg"
              />
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={animKey}
              className="grid gap-2 sm:grid-cols-2"
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {recommendations.map((rec, i) => (
                <motion.div
                  key={`${animKey}-${i}`}
                  custom={i}
                  variants={cardVariants}
                  className={cn(
                    'group rounded-lg border p-3 transition-all cursor-default',
                    'hover:bg-background/80 dark:hover:bg-background/40',
                    'active:scale-[0.98]',
                    getMoodCardBorder(mood)
                  )}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-xl leading-none mt-0.5 shrink-0 transition-transform duration-200 group-hover:scale-110">
                      {rec.emoji}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold leading-tight mb-0.5 truncate">
                        {rec.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                        {rec.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  )
})
