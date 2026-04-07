'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Lightbulb, BookOpen, Wallet, Heart, Zap, Brain, Moon, Droplets, Apple, Smile, Dumbbell, Target, Repeat } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type TipColor = 'emerald' | 'amber' | 'rose' | 'blue' | 'violet' | 'sky' | 'orange'

interface Tip {
  text: string
  category: string
  color: TipColor
}

const TIPS: Tip[] = [
  // ─── Дневник (8 tips) ─────────────────────────────────────────
  { text: 'Запишите 3 вещи, за которые вы благодарны сегодня. Это улучшает настроение и снижает стресс.', category: 'Дневник', color: 'emerald' },
  { text: 'Запишите свои мысли в дневник. Это помогает разобраться в эмоциях и найти решения.', category: 'Дневник', color: 'emerald' },
  { text: 'Запишите одну вещь, которой вы гордитесь. Маленькие победы тоже считаются!', category: 'Дневник', color: 'emerald' },
  { text: 'Запишите свои цели на этот месяц в дневнике. Чёткие цели повышают мотивацию.', category: 'Дневник', color: 'emerald' },
  { text: 'Запишите funny-момент или забавную историю дня. Это создаст улыбку при перечитывании.', category: 'Дневник', color: 'emerald' },
  { text: 'Оцените свой день от 1 до 10. Отслеживание настроения помогает понять свои паттерны.', category: 'Дневник', color: 'emerald' },
  { text: 'Напишите письмо себе в будущем через год. Через 12 месяцев будет интересно перечитать.', category: 'Дневник', color: 'emerald' },
  { text: 'Опишите свой идеальный день. Это поможет понять, какие изменения стоит внести в жизнь.', category: 'Дневник', color: 'emerald' },

  // ─── Финансы (8 tips) ─────────────────────────────────────────
  { text: 'Проверьте свой бюджет на этой неделе. Небольшие траты складываются в большие суммы.', category: 'Финансы', color: 'amber' },
  { text: 'Отложите 10% от каждого поступления на сбережения — это золотое правило финансов.', category: 'Финансы', color: 'amber' },
  { text: 'Проведите ревизию подписок — отмените те, которыми не пользовались последний месяц.', category: 'Финансы', color: 'amber' },
  { text: 'Создайте аварийный фонд на 3 месяца расходов. Это даёт уверенность в будущем.', category: 'Финансы', color: 'amber' },
  { text: 'Ограничьте покупки «хочу» — подождите 24 часа перед ненужной тратой.', category: 'Финансы', color: 'amber' },
  { text: 'Сравните цены перед покупкой. Разница может быть значительной.', category: 'Финансы', color: 'amber' },
  { text: 'Установите финансовую цель на месяц и отслеживайте прогресс еженедельно.', category: 'Финансы', color: 'amber' },
  { text: 'Запишите все расходы за день вечером. Трекинг — первый шаг к контролю бюджета.', category: 'Финансы', color: 'amber' },

  // ─── Здоровье (8 tips) ────────────────────────────────────────
  { text: 'Выпейте стакан воды перед каждым приёмом пищи — это поможет контролировать порции.', category: 'Здоровье', color: 'rose' },
  { text: 'Сделайте 5-минутную разминку каждые 2 часа работы за компьютером.', category: 'Здоровье', color: 'rose' },
  { text: 'Ложитесь спать и просыпайтесь в одно и то же время — это улучшает качество сна.', category: 'Здоровье', color: 'rose' },
  { text: 'Пройдитесь 30 минут пешком — это снижает уровень тревоги и улучшает настроение.', category: 'Здоровье', color: 'rose' },
  { text: 'Практикуйте глубокое дыхание: 4 секунды вдох, 7 секунд задержка, 8 секунд выдох.', category: 'Здоровье', color: 'rose' },
  { text: 'Попробуйте медитацию 5 минут в день. Даже короткая практика снижает стресс.', category: 'Здоровье', color: 'rose' },
  { text: 'Проведите 15 минут на свежем воздухе. Солнечный свет улучшает концентрацию.', category: 'Здоровье', color: 'rose' },
  { text: 'Выпейте не менее 8 стаканов воды в течение дня. Обезвоживание снижает концентрацию.', category: 'Здоровье', color: 'rose' },

  // ─── Питание (5 tips) ─────────────────────────────────────────
  { text: 'Съешьте порцию овощей или фруктов при каждом приёме пищи.', category: 'Питание', color: 'orange' },
  { text: 'Сократите потребление сахара — начните с отказа от сладких напитков.', category: 'Питание', color: 'orange' },
  { text: 'Готовьте домашнюю еду хотя бы 3 раза в неделю — это дешевле и полезнее.', category: 'Питание', color: 'orange' },
  { text: 'Не пропускайте завтрак — он запускает метаболизм и даёт энергию на весь день.', category: 'Питание', color: 'orange' },
  { text: 'Добавьте в рацион больше белка — он надолго даёт чувство сытости.', category: 'Питание', color: 'orange' },

  // ─── Продуктивность (5 tips) ──────────────────────────────────
  { text: 'Составьте список задач на завтра вечером — утром вы начнёте день продуктивнее.', category: 'Продуктивность', color: 'blue' },
  { text: 'Используйте технику «Помодоро»: 25 минут работы, 5 минут отдыха.', category: 'Продуктивность', color: 'blue' },
  { text: 'Организуйте рабочее пространство. Чистый стол = ясный ум.', category: 'Продуктивность', color: 'blue' },
  { text: 'Разбейте большую задачу на маленькие шаги. Каждый маленький шаг приближает к цели.', category: 'Продуктивность', color: 'blue' },
  { text: 'Сделайте цифровую детокс-паузу: 30 минут без телефона и компьютера.', category: 'Продуктивность', color: 'blue' },

  // ─── Развитие (4 tips) ────────────────────────────────────────
  { text: 'Попробуйте новое хобби. Разнообразие помогает мозгу оставаться активным.', category: 'Развитие', color: 'violet' },
  { text: 'Прочитайте 10 страниц книги перед сном вместо скроллинга соцсетей.', category: 'Развитие', color: 'violet' },
  { text: 'Изучите новый навык хотя бы 15 минут в день. Регулярность важнее интенсивности.', category: 'Развитие', color: 'violet' },
  { text: 'Смотрите один образовательный ролик в день. Маленькие знания накапливаются.', category: 'Развитие', color: 'violet' },

  // ─── Привычки (4 tips) ────────────────────────────────────────
  { text: 'Привяжите новую привычку к существующей — например, медитация после чистки зубов.', category: 'Привычки', color: 'violet' },
  { text: 'Начните с микро-привычек. 5 минут в день лучше, чем 0 минут.', category: 'Привычки', color: 'violet' },
  { text: 'Отслеживайте прогресс привычек визуально — это сильно мотивирует продолжать.', category: 'Привычки', color: 'violet' },
  { text: 'Не ругайте себя за пропущенный день. Главное — вернуться к привычке завтра.', category: 'Привычки', color: 'violet' },

  // ─── Отношения (3 tips) ───────────────────────────────────────
  { text: 'Напишите другу или близкому человеку. Социальные связи важны для счастья.', category: 'Отношения', color: 'sky' },
  { text: 'Скажите комплимент минимум одному человеку сегодня. Это улучшит настроение обоим.', category: 'Отношения', color: 'sky' },
  { text: 'Проведите время с семьёй или друзьями без гаджетов — полноценное общение бесценно.', category: 'Отношения', color: 'sky' },

  // ─── Тренировки (3 tips) ──────────────────────────────────────
  { text: 'Запланируйте тренировку на эту неделю и добавьте в календарь.', category: 'Тренировки', color: 'blue' },
  { text: 'Сделайте утреннюю растяжку — 5 минут помогут проснуться и подготовить тело к дню.', category: 'Тренировки', color: 'blue' },
  { text: 'Увеличьте нагрузку постепенно — на 10% в неделю. Это предотвратит травмы.', category: 'Тренировки', color: 'blue' },
]

const COLOR_MAP: Record<TipColor, { bg: string; border: string; badge: string; icon: string; gradient: string }> = {
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200/60 dark:border-emerald-800/40', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300', icon: 'text-emerald-500', gradient: 'from-emerald-500/10 via-transparent to-teal-500/10' },
  amber: { bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200/60 dark:border-amber-800/40', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300', icon: 'text-amber-500', gradient: 'from-amber-500/10 via-transparent to-orange-500/10' },
  rose: { bg: 'bg-rose-50 dark:bg-rose-950/30', border: 'border-rose-200/60 dark:border-rose-800/40', badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300', icon: 'text-rose-500', gradient: 'from-rose-500/10 via-transparent to-pink-500/10' },
  blue: { bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200/60 dark:border-blue-800/40', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300', icon: 'text-blue-500', gradient: 'from-blue-500/10 via-transparent to-sky-500/10' },
  violet: { bg: 'bg-violet-50 dark:bg-violet-950/30', border: 'border-violet-200/60 dark:border-violet-800/40', badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300', icon: 'text-violet-500', gradient: 'from-violet-500/10 via-transparent to-purple-500/10' },
  sky: { bg: 'bg-sky-50 dark:bg-sky-950/30', border: 'border-sky-200/60 dark:border-sky-800/40', badge: 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300', icon: 'text-sky-500', gradient: 'from-sky-500/10 via-transparent to-cyan-500/10' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-950/30', border: 'border-orange-200/60 dark:border-orange-800/40', badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300', icon: 'text-orange-500', gradient: 'from-orange-500/10 via-transparent to-amber-500/10' },
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
  const tip = useMemo(() => {
    const now = new Date()
    const dayIndex = getDayOfYear(now)
    // Use prime multiplier to avoid predictable cycling
    return TIPS[(dayIndex * 7) % TIPS.length]
  }, [])

  const colors = COLOR_MAP[tip.color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      <Card className={`overflow-hidden rounded-xl border ${colors.bg} ${colors.border}`}>
        {/* Subtle gradient background */}
        <div className={`pointer-events-none absolute inset-0 bg-gradient-to-r ${colors.gradient}`} />

        <CardContent className="relative p-5">
          <div className="flex items-start gap-3.5">
            {/* Icon */}
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${colors.badge} shadow-sm`}>
              <Lightbulb className={`h-5 w-5 ${colors.icon}`} />
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">Совет дня</h3>
                <Badge variant="secondary" className={`gap-1 text-[10px] font-medium ${colors.badge} border-0`}>
                  {CATEGORY_ICONS[tip.category]}
                  {tip.category}
                </Badge>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {tip.text}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
