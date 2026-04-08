'use client'

import { useMemo, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Lightbulb, BookOpen, Wallet, Heart, Zap, Brain, Moon, Droplets,
  Apple, Smile, Dumbbell, Target, Repeat, ChevronRight, Sparkles
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type TipColor = 'emerald' | 'amber' | 'rose' | 'blue' | 'violet' | 'sky' | 'orange'

type TipCategory = 'health' | 'productivity' | 'finance' | 'motivation'

interface Tip {
  text: string
  category: string
  color: TipColor
  tipCategory: TipCategory
  emoji: string
}

const TIPS: Tip[] = [
  // ─── Дневник (8 tips) ─────────────────────────────────────────
  { text: 'Запишите 3 вещи, за которые вы благодарны сегодня. Это улучшает настроение и снижает стресс.', category: 'Дневник', color: 'emerald', tipCategory: 'motivation', emoji: '📝' },
  { text: 'Запишите свои мысли в дневник. Это помогает разобраться в эмоциях и найти решения.', category: 'Дневник', color: 'emerald', tipCategory: 'motivation', emoji: '📝' },
  { text: 'Запишите одну вещь, которой вы гордитесь. Маленькие победы тоже считаются!', category: 'Дневник', color: 'emerald', tipCategory: 'motivation', emoji: '📝' },
  { text: 'Запишите свои цели на этот месяц в дневнике. Чёткие цели повышают мотивацию.', category: 'Дневник', color: 'emerald', tipCategory: 'productivity', emoji: '📝' },
  { text: 'Запишите забавный момент или историю дня. Это создаст улыбку при перечитывании.', category: 'Дневник', color: 'emerald', tipCategory: 'motivation', emoji: '📝' },
  { text: 'Оцените свой день от 1 до 10. Отслеживание настроения помогает понять свои паттерны.', category: 'Дневник', color: 'emerald', tipCategory: 'motivation', emoji: '📝' },
  { text: 'Напишите письмо себе в будущем через год. Через 12 месяцев будет интересно перечитать.', category: 'Дневник', color: 'emerald', tipCategory: 'motivation', emoji: '📝' },
  { text: 'Опишите свой идеальный день. Это поможет понять, какие изменения стоит внести в жизнь.', category: 'Дневник', color: 'emerald', tipCategory: 'motivation', emoji: '📝' },

  // ─── Финансы (8 tips) ─────────────────────────────────────────
  { text: 'Проверьте свой бюджет на этой неделе. Небольшие траты складываются в большие суммы.', category: 'Финансы', color: 'amber', tipCategory: 'finance', emoji: '💰' },
  { text: 'Отложите 10% от каждого поступления на сбережения — это золотое правило финансов.', category: 'Финансы', color: 'amber', tipCategory: 'finance', emoji: '💰' },
  { text: 'Проведите ревизию подписок — отмените те, которыми не пользовались последний месяц.', category: 'Финансы', color: 'amber', tipCategory: 'finance', emoji: '💰' },
  { text: 'Создайте аварийный фонд на 3 месяца расходов. Это даёт уверенность в будущем.', category: 'Финансы', color: 'amber', tipCategory: 'finance', emoji: '💰' },
  { text: 'Ограничьте покупки «хочу» — подождите 24 часа перед ненужной тратой.', category: 'Финансы', color: 'amber', tipCategory: 'finance', emoji: '💰' },
  { text: 'Сравните цены перед покупкой. Разница может быть значительной.', category: 'Финансы', color: 'amber', tipCategory: 'finance', emoji: '💰' },
  { text: 'Установите финансовую цель на месяц и отслеживайте прогресс еженедельно.', category: 'Финансы', color: 'amber', tipCategory: 'finance', emoji: '💰' },
  { text: 'Запишите все расходы за день вечером. Трекинг — первый шаг к контролю бюджета.', category: 'Финансы', color: 'amber', tipCategory: 'finance', emoji: '💰' },

  // ─── Здоровье (8 tips) ────────────────────────────────────────
  { text: 'Выпейте стакан воды перед каждым приёмом пищи — это поможет контролировать порции.', category: 'Здоровье', color: 'rose', tipCategory: 'health', emoji: '💧' },
  { text: 'Сделайте 5-минутную разминку каждые 2 часа работы за компьютером.', category: 'Здоровье', color: 'rose', tipCategory: 'health', emoji: '🏃' },
  { text: 'Ложитесь спать и просыпайтесь в одно и то же время — это улучшает качество сна.', category: 'Здоровье', color: 'rose', tipCategory: 'health', emoji: '😴' },
  { text: 'Пройдитесь 30 минут пешком — это снижает уровень тревоги и улучшает настроение.', category: 'Здоровье', color: 'rose', tipCategory: 'health', emoji: '🚶' },
  { text: 'Практикуйте глубокое дыхание: 4 секунды вдох, 7 секунд задержка, 8 секунд выдох.', category: 'Здоровье', color: 'rose', tipCategory: 'health', emoji: '🌬️' },
  { text: 'Попробуйте медитацию 5 минут в день. Даже короткая практика снижает стресс.', category: 'Здоровье', color: 'rose', tipCategory: 'health', emoji: '🧘' },
  { text: 'Проведите 15 минут на свежем воздухе. Солнечный свет улучшает концентрацию.', category: 'Здоровье', color: 'rose', tipCategory: 'health', emoji: '☀️' },
  { text: 'Выпейте не менее 8 стаканов воды в течение дня. Обезвоживание снижает концентрацию.', category: 'Здоровье', color: 'rose', tipCategory: 'health', emoji: '💧' },

  // ─── Питание (5 tips) ─────────────────────────────────────────
  { text: 'Съешьте порцию овощей или фруктов при каждом приёме пищи.', category: 'Питание', color: 'orange', tipCategory: 'health', emoji: '🥗' },
  { text: 'Сократите потребление сахара — начните с отказа от сладких напитков.', category: 'Питание', color: 'orange', tipCategory: 'health', emoji: '🍎' },
  { text: 'Готовьте домашнюю еду хотя бы 3 раза в неделю — это дешевле и полезнее.', category: 'Питание', color: 'orange', tipCategory: 'health', emoji: '🍳' },
  { text: 'Не пропускайте завтрак — он запускает метаболизм и даёт энергию на весь день.', category: 'Питание', color: 'orange', tipCategory: 'health', emoji: '🥣' },
  { text: 'Добавьте в рацион больше белка — он надолго даёт чувство сытости.', category: 'Питание', color: 'orange', tipCategory: 'health', emoji: '🥩' },

  // ─── Продуктивность (5 tips) ──────────────────────────────────
  { text: 'Составьте список задач на завтра вечером — утром вы начнёте день продуктивнее.', category: 'Продуктивность', color: 'blue', tipCategory: 'productivity', emoji: '⚡' },
  { text: 'Используйте технику «Помодоро»: 25 минут работы, 5 минут отдыха.', category: 'Продуктивность', color: 'blue', tipCategory: 'productivity', emoji: '🍅' },
  { text: 'Организуйте рабочее пространство. Чистый стол = ясный ум.', category: 'Продуктивность', color: 'blue', tipCategory: 'productivity', emoji: '🧹' },
  { text: 'Разбейте большую задачу на маленькие шаги. Каждый маленький шаг приближает к цели.', category: 'Продуктивность', color: 'blue', tipCategory: 'productivity', emoji: '🎯' },
  { text: 'Сделайте цифровую детокс-паузу: 30 минут без телефона и компьютера.', category: 'Продуктивность', color: 'blue', tipCategory: 'productivity', emoji: '📵' },

  // ─── Развитие (4 tips) ────────────────────────────────────────
  { text: 'Попробуйте новое хобби. Разнообразие помогает мозгу оставаться активным.', category: 'Развитие', color: 'violet', tipCategory: 'motivation', emoji: '🎨' },
  { text: 'Прочитайте 10 страниц книги перед сном вместо скроллинга соцсетей.', category: 'Развитие', color: 'violet', tipCategory: 'motivation', emoji: '📚' },
  { text: 'Изучите новый навык хотя бы 15 минут в день. Регулярность важнее интенсивности.', category: 'Развитие', color: 'violet', tipCategory: 'productivity', emoji: '🎓' },
  { text: 'Смотрите один образовательный ролик в день. Маленькие знания накапливаются.', category: 'Развитие', color: 'violet', tipCategory: 'productivity', emoji: '🎥' },

  // ─── Привычки (4 tips) ────────────────────────────────────────
  { text: 'Привяжите новую привычку к существующей — например, медитация после чистки зубов.', category: 'Привычки', color: 'violet', tipCategory: 'productivity', emoji: '🔗' },
  { text: 'Начните с микро-привычек. 5 минут в день лучше, чем 0 минут.', category: 'Привычки', color: 'violet', tipCategory: 'motivation', emoji: '🌱' },
  { text: 'Отслеживайте прогресс привычек визуально — это сильно мотивирует продолжать.', category: 'Привычки', color: 'violet', tipCategory: 'productivity', emoji: '📊' },
  { text: 'Не ругайте себя за пропущенный день. Главное — вернуться к привычке завтра.', category: 'Привычки', color: 'violet', tipCategory: 'motivation', emoji: '💪' },

  // ─── Отношения (3 tips) ───────────────────────────────────────
  { text: 'Напишите другу или близкому человеку. Социальные связи важны для счастья.', category: 'Отношения', color: 'sky', tipCategory: 'motivation', emoji: '💌' },
  { text: 'Скажите комплимент минимум одному человеку сегодня. Это улучшит настроение обоим.', category: 'Отношения', color: 'sky', tipCategory: 'motivation', emoji: '😊' },
  { text: 'Проведите время с семьёй или друзьями без гаджетов — полноценное общение бесценно.', category: 'Отношения', color: 'sky', tipCategory: 'health', emoji: '👨‍👩‍👧‍👦' },

  // ─── Тренировки (3 tips) ──────────────────────────────────────
  { text: 'Запланируйте тренировку на эту неделю и добавьте в календарь.', category: 'Тренировки', color: 'blue', tipCategory: 'health', emoji: '🏋️' },
  { text: 'Сделайте утреннюю растяжку — 5 минут помогут проснуться и подготовить тело к дню.', category: 'Тренировки', color: 'blue', tipCategory: 'health', emoji: '🤸' },
  { text: 'Увеличьте нагрузку постепенно — на 10% в неделю. Это предотвратит травмы.', category: 'Тренировки', color: 'blue', tipCategory: 'health', emoji: '📈' },
]

const COLOR_MAP: Record<TipColor, { bg: string; border: string; badge: string; icon: string; gradient: string }> = {
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200/60 dark:border-emerald-800/40', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300', icon: 'text-emerald-500', gradient: 'from-emerald-500 to-teal-500' },
  amber: { bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200/60 dark:border-amber-800/40', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300', icon: 'text-amber-500', gradient: 'from-amber-500 to-orange-500' },
  rose: { bg: 'bg-rose-50 dark:bg-rose-950/30', border: 'border-rose-200/60 dark:border-rose-800/40', badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300', icon: 'text-rose-500', gradient: 'from-rose-500 to-pink-500' },
  blue: { bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200/60 dark:border-blue-800/40', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300', icon: 'text-blue-500', gradient: 'from-blue-500 to-sky-500' },
  violet: { bg: 'bg-violet-50 dark:bg-violet-950/30', border: 'border-violet-200/60 dark:border-violet-800/40', badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300', icon: 'text-violet-500', gradient: 'from-violet-500 to-purple-500' },
  sky: { bg: 'bg-sky-50 dark:bg-sky-950/30', border: 'border-sky-200/60 dark:border-sky-800/40', badge: 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300', icon: 'text-sky-500', gradient: 'from-sky-500 to-cyan-500' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-950/30', border: 'border-orange-200/60 dark:border-orange-800/40', badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300', icon: 'text-orange-500', gradient: 'from-orange-500 to-amber-500' },
}

const TIP_CATEGORY_LABELS: Record<TipCategory, { label: string; emoji: string }> = {
  health: { label: 'Здоровье', emoji: '❤️' },
  productivity: { label: 'Продуктивность', emoji: '⚡' },
  finance: { label: 'Финансы', emoji: '💰' },
  motivation: { label: 'Мотивация', emoji: '🔥' },
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Дневник': <BookOpen className="h-3 w-3" />,
  'Финансы': <Wallet className="h-3 w-3" />,
  'Здоровье': <Heart className="h-3 w-3" />,
  'Продуктивность': <Zap className="h-3 w-3" />,
  'Развитие': <Brain className="h-3 w-3" />,
  'Питание': <Apple className="h-3 w-3" />,
  'Отношения': <Smile className="h-3 w-3" />,
  'Тренировки': <Dumbbell className="h-3 w-3" />,
  'Привычки': <Repeat className="h-3 w-3" />,
}

/**
 * Get the day-of-year index (0–364) from a Date.
 * Uses this index modulo tip count so the tip is deterministic per calendar day.
 */
function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  const oneDay = 86_400_000
  return Math.floor(diff / oneDay)
}

export default function DailyTipsWidget() {
  const [tipIndex, setTipIndex] = useState(0)

  // Pick multiple tips for the day (deterministic)
  const dailyTips = useMemo(() => {
    const now = new Date()
    const dayIndex = getDayOfYear(now)
    // Pick 3 tips for the day, spread across categories
    const tips: Tip[] = []
    for (let i = 0; i < 3; i++) {
      const idx = (dayIndex * 7 + i * 11) % TIPS.length
      tips.push(TIPS[idx])
    }
    return tips
  }, [])

  // The currently displayed tip
  const currentTip = dailyTips[tipIndex % dailyTips.length]
  const colors = COLOR_MAP[currentTip.color]
  const tipCategoryInfo = TIP_CATEGORY_LABELS[currentTip.tipCategory]

  const handleNextTip = useCallback(() => {
    setTipIndex((prev) => (prev + 1) % dailyTips.length)
  }, [dailyTips.length])

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeInOut' as const }}
      className="animate-slide-up"
    >
      <Card className={`card-hover overflow-hidden rounded-xl border ${colors.bg} ${colors.border}`}>
        {/* Gradient accent line at top */}
        <div className={`pointer-events-none h-1 w-full bg-gradient-to-r ${colors.gradient} opacity-80`} />

        {/* Subtle gradient background */}
        <div className={`pointer-events-none absolute inset-0 bg-gradient-to-r ${colors.gradient}`} />

        <CardContent className="relative p-5">
          <div className="flex items-start gap-3.5">
            {/* Icon */}
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${colors.badge} shadow-sm`}>
              <span className="text-lg">{currentTip.emoji}</span>
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">Совет дня</h3>
                <Badge variant="secondary" className={`gap-1 text-[10px] font-medium ${colors.badge} border-0`}>
                  {CATEGORY_ICONS[currentTip.category]}
                  {currentTip.category}
                </Badge>
                <Badge variant="secondary" className="gap-1 text-[10px] font-medium border-0 bg-foreground/5 text-foreground/70 dark:bg-foreground/10 dark:text-foreground/60">
                  {tipCategoryInfo.emoji} {tipCategoryInfo.label}
                </Badge>
              </div>

              <AnimatePresence mode="wait">
                <motion.p
                  key={tipIndex}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' as const }}
                  className="text-sm leading-relaxed text-muted-foreground"
                >
                  {currentTip.text}
                </motion.p>
              </AnimatePresence>

              {/* Navigation dots + next button */}
              <div className="mt-3 flex items-center justify-between">
                <div className="flex gap-1.5">
                  {dailyTips.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setTipIndex(idx)}
                      className={`h-1.5 rounded-full transition-all ${idx === tipIndex % dailyTips.length
                        ? `w-4 bg-gradient-to-r ${colors.gradient}`
                        : 'w-1.5 bg-foreground/15 dark:bg-foreground/20'
                        }`}
                      aria-label={`Совет ${idx + 1}`}
                    />
                  ))}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNextTip}
                  className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  <ChevronRight className="h-3 w-3" />
                  Далее
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
