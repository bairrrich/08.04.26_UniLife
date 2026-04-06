'use client'

import { useMemo } from 'react'
import { Lightbulb, BookOpen, Wallet, Heart, Zap, Brain, Moon, Droplets, Apple, Smile } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

type TipColor = 'emerald' | 'amber' | 'rose' | 'blue' | 'violet' | 'sky' | 'orange'

interface Tip {
  text: string
  category: string
  color: TipColor
}

const TIPS: Tip[] = [
  { text: 'Запишите 3 вещи, за которые вы благодарны сегодня. Это улучшает настроение и снижает стресс.', category: 'Дневник', color: 'emerald' },
  { text: 'Проверьте свой бюджет на этой неделе. Небольшие траты складываются в большие суммы.', category: 'Финансы', color: 'amber' },
  { text: 'Выпейте стакан воды перед каждым приёмом пищи — это поможет контролировать порции.', category: 'Здоровье', color: 'rose' },
  { text: 'Составьте список задач на завтра вечером — утром вы начнёте день продуктивнее.', category: 'Продуктивность', color: 'blue' },
  { text: 'Запишите свои мысли в дневник. Это помогает разобраться в эмоциях и найти решения.', category: 'Дневник', color: 'emerald' },
  { text: 'Отложите 10% от каждого поступления на сбережения — это золотое правило финансов.', category: 'Финансы', color: 'amber' },
  { text: 'Сделайте 5-минутную разминку каждые 2 часа работы за компьютером.', category: 'Здоровье', color: 'rose' },
  { text: 'Используйте технику «Помодоро»: 25 минут работы, 5 минут отдыха.', category: 'Продуктивность', color: 'blue' },
  { text: 'Ложитесь спать и просыпайтесь в одно и то же время — это улучшает качество сна.', category: 'Здоровье', color: 'rose' },
  { text: 'Попробуйте новое хобби. Разнообразие помогает мозгу оставаться активным.', category: 'Развитие', color: 'violet' },
  { text: 'Проведите ревизию подписок — отмените те, которыми не пользовались последний месяц.', category: 'Финансы', color: 'amber' },
  { text: 'Съешьте порцию овощей или фруктов при каждом приёме пищи.', category: 'Питание', color: 'orange' },
  { text: 'Напишите другу или близкому человеку. Социальные связи важны для счастья.', category: 'Отношения', color: 'sky' },
  { text: 'Пройдитесь 30 минут пешком — это снижает уровень тревоги и улучшает настроение.', category: 'Здоровье', color: 'rose' },
  { text: 'Запишите одну вещь, которой вы гордитесь. Маленькие победы тоже считаются!', category: 'Дневник', color: 'emerald' },
  { text: 'Создайте аварийный фонд на 3 месяца расходов. Это даёт уверенность в будущем.', category: 'Финансы', color: 'amber' },
  { text: 'Прочитайте 10 страниц книги перед сном вместо скроллинга соцсетей.', category: 'Развитие', color: 'violet' },
  { text: 'Практикуйте глубокое дыхание: 4 секунды вдох, 7 секунд задержка, 8 секунд выдох.', category: 'Здоровье', color: 'rose' },
  { text: 'Запланируйте тренировку на эту неделю и добавьте в календарь.', category: 'Тренировки', color: 'blue' },
  { text: 'Запишите что-то, чему вы научились за последнее время. У вас больше знаний, чем кажется!', category: 'Дневник', color: 'emerald' },
  { text: 'Ограничьте покупки «хочу» — подождите 24 часа перед ненужной тратой.', category: 'Финансы', color: 'amber' },
  { text: 'Сократите потребление сахара — начните с отказа от сладких напитков.', category: 'Питание', color: 'orange' },
  { text: 'Организуйте рабочее пространство. Чистый стол = ясный ум.', category: 'Продуктивность', color: 'blue' },
  { text: 'Попробуйте медитацию 5 минут в день. Даже короткая практика снижает стресс.', category: 'Здоровье', color: 'rose' },
  { text: 'Установите финансовую цель на месяц и отслеживайте прогресс еженедельно.', category: 'Финансы', color: 'amber' },
  { text: 'Запишите свои цели на этот месяц в дневнике. Чёткие цели повышают мотивацию.', category: 'Дневник', color: 'emerald' },
  { text: 'Готовьте домашнюю еду хотя бы 3 раза в неделю — это дешевле и полезнее.', category: 'Питание', color: 'orange' },
  { text: 'Проведите 15 минут на свежем воздухе. Солнечный свет улучшает концентрацию.', category: 'Здоровье', color: 'rose' },
  { text: 'Разбейте большую задачу на маленькие шаги. Каждый маленький шаг приближает к цели.', category: 'Продуктивность', color: 'blue' },
  { text: 'Запишите funny-момент или забавную историю дня. Это создаст улыбку при перечитывании.', category: 'Дневник', color: 'emerald' },
  { text: 'Сравните цены перед покупкой. Разница может быть значительной.', category: 'Финансы', color: 'amber' },
  { text: 'Сделайте утреннюю растяжку — 5 минут помогут проснуться и подготовить тело к дню.', category: 'Тренировки', color: 'blue' },
  { text: 'Оцените свой день от 1 до 10. Отслеживание настроения помогает понять свои паттерны.', category: 'Дневник', color: 'emerald' },
  { text: 'Выпейте не менее 8 стаканов воды в течение дня. Обезвоживание снижает концентрацию.', category: 'Здоровье', color: 'rose' },
  { text: 'Сделайте цифровую детокс-паузу: 30 минут без телефона и компьютера.', category: 'Продуктивность', color: 'blue' },
  { text: 'Изучите новый навык хотя бы 15 минут в день. Регулярность важнее интенсивности.', category: 'Развитие', color: 'violet' },
]

const COLOR_MAP: Record<TipColor, { bg: string; border: string; badge: string; icon: string; gradient: string }> = {
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200/60 dark:border-emerald-800/40', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300', icon: 'text-emerald-500', gradient: 'from-emerald-500/5 via-transparent to-teal-500/5' },
  amber: { bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200/60 dark:border-amber-800/40', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300', icon: 'text-amber-500', gradient: 'from-amber-500/5 via-transparent to-orange-500/5' },
  rose: { bg: 'bg-rose-50 dark:bg-rose-950/30', border: 'border-rose-200/60 dark:border-rose-800/40', badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300', icon: 'text-rose-500', gradient: 'from-rose-500/5 via-transparent to-pink-500/5' },
  blue: { bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200/60 dark:border-blue-800/40', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300', icon: 'text-blue-500', gradient: 'from-blue-500/5 via-transparent to-sky-500/5' },
  violet: { bg: 'bg-violet-50 dark:bg-violet-950/30', border: 'border-violet-200/60 dark:border-violet-800/40', badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300', icon: 'text-violet-500', gradient: 'from-violet-500/5 via-transparent to-purple-500/5' },
  sky: { bg: 'bg-sky-50 dark:bg-sky-950/30', border: 'border-sky-200/60 dark:border-sky-800/40', badge: 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300', icon: 'text-sky-500', gradient: 'from-sky-500/5 via-transparent to-cyan-500/5' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-950/30', border: 'border-orange-200/60 dark:border-orange-800/40', badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300', icon: 'text-orange-500', gradient: 'from-orange-500/5 via-transparent to-amber-500/5' },
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Дневник': <BookOpen className="h-3.5 w-3.5" />,
  'Финансы': <Wallet className="h-3.5 w-3.5" />,
  'Здоровье': <Heart className="h-3.5 w-3.5" />,
  'Продуктивность': <Zap className="h-3.5 w-3.5" />,
  'Развитие': <Brain className="h-3.5 w-3.5" />,
  'Питание': <Apple className="h-3.5 w-3.5" />,
  'Отношения': <Smile className="h-3.5 w-3.5" />,
  'Тренировки': <Droplets className="h-3.5 w-3.5" />,
}

export default function DailyTip() {
  const tip = useMemo(() => {
    const now = new Date()
    const dayIndex = now.getDate() + now.getMonth() * 31
    return TIPS[dayIndex % TIPS.length]
  }, [])

  const colors = COLOR_MAP[tip.color]

  return (
    <div className={`glass-card card-hover overflow-hidden rounded-xl border p-5 ${colors.bg} ${colors.border}`}>
      {/* Subtle gradient background */}
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-r ${colors.gradient}`} />

      <div className="relative flex items-start gap-3.5">
        {/* Icon */}
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${colors.badge} shadow-sm`}>
          <Lightbulb className={`h-5 w-5 ${colors.icon}`} />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">Совет дня</h3>
            <Badge variant="secondary" className={`gap-1 text-[11px] font-medium ${colors.badge} border-0`}>
              {CATEGORY_ICONS[tip.category]}
              {tip.category}
            </Badge>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {tip.text}
          </p>
        </div>
      </div>
    </div>
  )
}
