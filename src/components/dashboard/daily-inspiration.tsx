'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, Check, Flame, Quote, RotateCcw, Trophy } from 'lucide-react'
import { getDayOfYear } from '@/lib/format'

// ─── Motivational Quotes (36 curated Russian quotes) ────────────────────────

const QUOTES = [
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
  { text: 'Делай что можешь, с тем что имеешь, там где ты есть.', author: 'Теодор Рузвельт' },
  { text: 'Путь в тысячу ли начинается с одного шага.', author: 'Лао-цзы' },
  { text: 'Величайшая слава в жизни — не в том, чтобы никогда не падать, а в том, чтобы подниматься каждый раз.', author: 'Нельсон Мандела' },
  { text: 'Единственное, что стоит бояться — это самому себе не изменить.', author: 'Лев Толстой' },
  { text: 'Мы — то, что мы постоянно делаем. Мастерство — не действие, а привычка.', author: 'Аристотель' },
  { text: 'Счастье — это не станция, куда мы прибываем, а способ путешествия.', author: 'Маргарет Ли Ранбек' },
  { text: 'Не ждите подходящего момента. Берите момент и делайте его подходящим.', author: 'Неизвестный автор' },
  { text: 'Жизнь на 10% состоит из того, что с нами происходит, и на 90% — из того, как мы на это реагируем.', author: 'Чарльз Свиндолл' },
  { text: 'Учитесь вчера, живите сегодня, надейтесь на завтра.', author: 'Альберт Эйнштейн' },
  { text: 'Кто хочет — ищет возможности. Кто не хочет — ищет причины.', author: 'Неизвестный автор' },
  { text: 'Начни там, где ты есть. Используй то, что имеешь. Делай то, что можешь.', author: 'Артур Эш' },
  { text: 'Через 20 лет вы будете сожалеть о том, что не сделали, больше, чем о том, что сделали.', author: 'Марк Твен' },
  { text: 'Ты не можешь изменить направление ветра, но можешь настроить паруса.', author: 'Джимми Дин' },
  { text: 'Самая большая победа — это победа над самим собой.', author: 'Платон' },
  { text: 'Только те, кто рискуют идти слишком далеко, могут узнать, как далеко можно зайти.', author: 'Томас Элиот' },
  { text: 'Инвестиции в знания приносят наибольший доход.', author: 'Бенджамин Франклин' },
  { text: 'Заботьтесь о своём теле. Это единственное место, где вам придётся жить.', author: 'Джим Рон' },
  { text: 'Секрет успеха — начать действовать.', author: 'Марк Твен' },
  { text: 'Фокус — это умение говорить «нет» сотне хороших идей.', author: 'Стив Джобс' },
  { text: 'Один только сегодняшний день стоит двух завтрашних.', author: 'Бенджамин Франклин' },
  { text: 'Гений — это 1% вдохновения и 99% пота.', author: 'Томас Эдисон' },
  { text: 'Движение — это жизнь. Покой — это медленное умирание.', author: 'Неизвестный автор' },
  { text: 'Лучшая подготовка к завтрашнему дню — это правильное использование сегодняшнего.', author: 'Джон Вуден' },
  { text: 'Успех не является конечной точкой, неудача не фатальна: важна лишь смелость продолжать.', author: 'Уинстон Черчилль' },
]

// ─── Daily Micro-Challenges (25 curated challenges) ─────────────────────────

interface Challenge {
  text: string
  emoji: string
  category: string
}

const CHALLENGES: Challenge[] = [
  { text: 'Выпей 8 стаканов воды', emoji: '💧', category: 'Здоровье' },
  { text: 'Сделай 10 минут растяжки', emoji: '🧘', category: 'Фитнес' },
  { text: 'Напиши 3 вещи, за которые благодарен', emoji: '🙏', category: 'Дневник' },
  { text: 'Прочитай 10 страниц книги', emoji: '📖', category: 'Обучение' },
  { text: 'Сделай перерыв каждый час', emoji: '⏸️', category: 'Продуктивность' },
  { text: 'Прогуляйся 30 минут на свежем воздухе', emoji: '🚶', category: 'Здоровье' },
  { text: 'Сделай 20 приседаний', emoji: '💪', category: 'Фитнес' },
  { text: 'Запиши одну цель на неделю', emoji: '🎯', category: 'Планирование' },
  { text: 'Съешь порцию овощей или фруктов', emoji: '🥗', category: 'Питание' },
  { text: 'Проведи 5 минут медитации', emoji: '🧠', category: 'Здоровье' },
  { text: 'Изучи одно новое слово на иностранном языке', emoji: '🌍', category: 'Обучение' },
  { text: 'Убери рабочее место', emoji: '🧹', category: 'Продуктивность' },
  { text: 'Сделай 10 отжиманий', emoji: '🏋️', category: 'Фитнес' },
  { text: 'Напиши другу или близкому человеку', emoji: '💬', category: 'Отношения' },
  { text: 'Ложись спать до 23:00', emoji: '😴', category: 'Здоровье' },
  { text: 'Не используй телефон 30 минут перед сном', emoji: '📵', category: 'Здоровье' },
  { text: 'Приготовь здоровый завтрак', emoji: '🍳', category: 'Питание' },
  { text: 'Сделай доброе дело для кого-то', emoji: '💝', category: 'Отношения' },
  { text: 'Послушай один подкаст или лекцию', emoji: '🎧', category: 'Обучение' },
  { text: 'Запиши свои мысли в дневник', emoji: '✍️', category: 'Дневник' },
  { text: 'Сделай 15 минут глубокого дыхания', emoji: '🌬️', category: 'Здоровье' },
  { text: 'Спланируй завтрашний день', emoji: '📋', category: 'Планирование' },
  { text: 'Сделай фотографию чего-то красивого', emoji: '📷', category: 'Творчество' },
  { text: 'Попробуй новый рецепт', emoji: '👨‍🍳', category: 'Питание' },
  { text: 'Делай одну задачу за раз без отвлечений', emoji: '🎯', category: 'Продуктивность' },
]

// ─── LocalStorage helpers ───────────────────────────────────────────────────

const STORAGE_KEY = 'unilife-daily-challenge'

interface CompletionRecord {
  [dateStr: string]: boolean
}

function getCompletionRecord(): CompletionRecord {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveCompletionRecord(record: CompletionRecord) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record))
  } catch {
    // localStorage full or unavailable
  }
}

function getTodayStr(): string {
  return new Date().toISOString().split('T')[0]
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function DailyInspiration() {
  const [completionRecord, setCompletionRecord] = useState<CompletionRecord>(() => getCompletionRecord())

  // Deterministic quote and challenge based on day of year
  const { quote, challenge, todayStr } = useMemo(() => {
    const dayOfYear = getDayOfYear()
    const quoteIdx = dayOfYear % QUOTES.length
    const challengeIdx = (dayOfYear + 7) % CHALLENGES.length // offset so quote and challenge differ
    return {
      quote: QUOTES[quoteIdx],
      challenge: CHALLENGES[challengeIdx],
      todayStr: getTodayStr(),
    }
  }, [])

  // Computed state
  const isCompletedToday = !!completionRecord[todayStr]

  const weeklyCount = useMemo(() => {
    const now = new Date()
    let count = 0
    for (let i = 0; i < 7; i++) {
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      if (completionRecord[dateStr]) count++
    }
    return count
  }, [completionRecord])

  const handleToggleComplete = useCallback(() => {
    setCompletionRecord((prev) => {
      const updated = { ...prev }
      if (isCompletedToday) {
        delete updated[todayStr]
      } else {
        updated[todayStr] = true
      }
      saveCompletionRecord(updated)
      return updated
    })
  }, [todayStr, isCompletedToday])

  // Persist completion record to localStorage on changes
  useEffect(() => {
    saveCompletionRecord(completionRecord)
  }, [completionRecord])

  return (
    <div className="stagger-children space-y-4">
      {/* ── Motivational Quote Card ──────────────────────────────────── */}
      <Card className="card-hover relative overflow-hidden rounded-xl border-0 p-0">
        {/* Gradient border via pseudo-element technique */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 p-[1.5px]">
          <div className="h-full w-full rounded-xl bg-background" />
        </div>

        <CardContent className="relative p-5 sm:p-6">
          {/* Decorative gradient blobs */}
          <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-500/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-gradient-to-br from-rose-400/15 to-pink-500/10 blur-2xl" />
          <div className="pointer-events-none absolute right-1/4 top-0 h-20 w-20 rounded-full bg-gradient-to-br from-violet-400/10 to-purple-500/5 blur-2xl" />

          <div className="relative">
            {/* Header */}
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm">
                <Quote className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Вдохновение дня</h3>
                <p className="text-[11px] text-muted-foreground">Мотивация для продуктивного дня</p>
              </div>
            </div>

            {/* Quote block */}
            <div className="animate-slide-up">
              {/* Large decorative quotation mark */}
              <div className="mb-1">
                <span className="bg-gradient-to-br from-amber-400 to-orange-500 bg-clip-text text-5xl leading-none font-serif font-bold text-transparent select-none sm:text-6xl">
                  &laquo;
                </span>
              </div>

              <blockquote className="mb-3 pl-1">
                <p className="text-base leading-relaxed font-medium text-foreground/90 sm:text-lg">
                  {quote.text}
                </p>
                <footer className="mt-2.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span>{quote.author}</span>
                </footer>
              </blockquote>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Daily Challenge Card ────────────────────────────────────── */}
      <Card className="card-hover relative overflow-hidden rounded-xl border-0 p-0">
        {/* Gradient border */}
        <div className={`absolute inset-0 rounded-xl p-[1.5px] transition-all duration-500 ${
          isCompletedToday
            ? 'bg-gradient-to-br from-emerald-400 via-teal-500 to-green-500'
            : 'bg-gradient-to-br from-violet-400 via-purple-500 to-pink-500'
        }`}>
          <div className="h-full w-full rounded-xl bg-background" />
        </div>

        <CardContent className="relative p-5 sm:p-6">
          {/* Decorative gradient blobs */}
          <div className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl transition-colors duration-500 ${
            isCompletedToday
              ? 'bg-emerald-400/15'
              : 'bg-violet-400/15'
          }`} />
          <div className={`pointer-events-none absolute -bottom-6 -left-6 h-20 w-20 rounded-full blur-xl transition-colors duration-500 ${
            isCompletedToday
              ? 'bg-teal-400/10'
              : 'bg-pink-400/10'
          }`} />

          <div className="animate-slide-up" style={{ animationDelay: '150ms', animationFillMode: 'both' }}>
            {/* Header */}
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg shadow-sm transition-colors duration-500 ${
                  isCompletedToday
                    ? 'bg-gradient-to-br from-emerald-400 to-teal-500'
                    : 'bg-gradient-to-br from-violet-400 to-purple-500'
                }`}>
                  {isCompletedToday ? (
                    <Check className="h-4 w-4 text-white" />
                  ) : (
                    <Flame className="h-4 w-4 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {isCompletedToday ? 'Вызов выполнен!' : 'Вызов дня'}
                  </h3>
                  <p className="text-[11px] text-muted-foreground">Ежедневный микро-вызов</p>
                </div>
              </div>

              {/* Weekly streak badge */}
              <div className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors duration-500 ${
                weeklyCount >= 5
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                  : weeklyCount >= 3
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                    : 'bg-muted text-muted-foreground'
              }`}>
                <Trophy className={`h-3.5 w-3.5 ${weeklyCount >= 5 ? 'text-amber-500' : weeklyCount >= 3 ? 'text-emerald-500' : ''}`} />
                <span className="tabular-nums">{weeklyCount}/7</span>
              </div>
            </div>

            {/* Challenge content */}
            <div className={`flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors duration-500 ${
              isCompletedToday
                ? 'border-emerald-200/60 bg-emerald-50/50 dark:border-emerald-800/40 dark:bg-emerald-950/20'
                : 'border-violet-200/60 bg-violet-50/50 dark:border-violet-800/40 dark:bg-violet-950/20'
            }`}>
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xl shrink-0">{challenge.emoji}</span>
                <div className="min-w-0">
                  <p className={`text-sm font-medium transition-all duration-500 ${
                    isCompletedToday
                      ? 'line-through text-muted-foreground'
                      : 'text-foreground'
                  }`}>
                    {challenge.text}
                  </p>
                  <span className="text-[11px] text-muted-foreground">{challenge.category}</span>
                </div>
              </div>

              {/* Checkmark button */}
              <Button
                size="sm"
                variant={isCompletedToday ? 'outline' : 'default'}
                onClick={handleToggleComplete}
                className={`shrink-0 transition-all duration-300 ${
                  isCompletedToday
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 dark:hover:bg-emerald-950 dark:hover:text-emerald-300'
                    : 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-sm hover:from-violet-600 hover:to-purple-600'
                }`}
              >
                {isCompletedToday ? (
                  <>
                    <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                    <span className="hidden sm:inline">Отменить</span>
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5 mr-1.5" />
                    <span className="hidden sm:inline">Выполнить</span>
                  </>
                )}
              </Button>
            </div>

            {/* Weekly progress indicator */}
            <div className="mt-3 flex items-center gap-2">
              <div className="flex gap-1">
                {Array.from({ length: 7 }).map((_, i) => {
                  const d = new Date()
                  d.setDate(d.getDate() - (6 - i))
                  const dateStr = d.toISOString().split('T')[0]
                  const done = !!completionRecord[dateStr]
                  const isToday = dateStr === todayStr
                  return (
                    <div
                      key={i}
                      className={`h-2 w-2 rounded-full transition-all duration-300 ${
                        done
                          ? 'bg-gradient-to-r from-emerald-400 to-teal-500 shadow-sm shadow-emerald-500/30'
                          : isToday
                            ? 'border border-violet-300 bg-violet-100 dark:border-violet-700 dark:bg-violet-900/50'
                            : 'bg-muted-foreground/15'
                      }`}
                      title={
                        isToday
                          ? 'Сегодня'
                          : d.toLocaleDateString('ru-RU', { weekday: 'short' })
                      }
                    />
                  )
                })}
              </div>
              <span className="text-[11px] text-muted-foreground ml-1">
                {weeklyCount === 0
                  ? 'Начни свою серию!'
                  : weeklyCount < 3
                    ? 'Хорошее начало!'
                    : weeklyCount < 5
                      ? 'Отличный темп!'
                      : weeklyCount < 7
                        ? 'Почти идеальная неделя!'
                        : 'Идеальная неделя! 🎉'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
