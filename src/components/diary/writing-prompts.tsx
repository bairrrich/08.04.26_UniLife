'use client'

import { useState, useMemo, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, RefreshCw, ArrowRight, PenLine } from 'lucide-react'
import { cn } from '@/lib/utils'

const ALL_PROMPTS = [
  { emoji: '🌅', text: 'Что тебя сегодня порадовало?' },
  { emoji: '🌟', text: 'Опиши свой идеальный день' },
  { emoji: '💡', text: 'Какая мысль не даёт тебе покоя?' },
  { emoji: '🎯', text: 'Что бы ты сделал(а), если бы не боялся(ась)?' },
  { emoji: '🤔', text: 'Какой урок ты извлёк(а) на этой неделе?' },
  { emoji: '🌈', text: 'За что ты благодарен(на) сегодня?' },
  { emoji: '📚', text: 'Какая книга или фильм тебя вдохновили?' },
  { emoji: '💪', text: 'В чём ты чувствуешь прогресс?' },
  { emoji: '🧘', text: 'Что помогает тебе расслабиться?' },
  { emoji: '✨', text: 'Вспомни момент, когда ты гордился(ась) собой' },
  { emoji: '🌍', text: 'Если бы ты мог(ла) изменить одну вещь в мире...' },
  { emoji: '🎭', text: 'Какую роль ты играешь в жизни других людей?' },
  { emoji: '🔔', text: 'Что ты давно хотел(а) попробовать?' },
  { emoji: '🧩', text: 'Какую проблему ты пытался(ась) решить?' },
  { emoji: '🌊', text: 'Что для тебя значит свобода?' },
  { emoji: '🗺️', text: 'Куда бы ты отправился(лась) прямо сейчас?' },
  { emoji: '🎯', text: 'Что бы ты сказал(а) себе год назад?' },
  { emoji: '🌻', text: 'Кто тебя вдохновляет и почему?' },
  { emoji: '🎨', text: 'Если бы у тебя была суперспособность...' },
  { emoji: '📝', text: 'Напиши письмо себе через 5 лет' },
  { emoji: '🏃', text: 'Какая привычка изменила твою жизнь?' },
  { emoji: '🌙', text: 'Что ты думаешь перед сном?' },
  { emoji: '🍀', text: 'Вспомни свой самый счастливый момент' },
  { emoji: '🎪', text: 'Что тебя сейчас удивляет?' },
  { emoji: '🏠', text: 'Что делает твой дом уютным?' },
  { emoji: '🎵', text: 'Какая песня описывает твоё настроение?' },
  { emoji: '🧠', text: 'О чём ты мечтаешь, но никому не рассказываешь?' },
  { emoji: '❤️', text: 'Что для тебя значит настоящая дружба?' },
  { emoji: '🔓', text: 'Какой секрет ты хочешь раскрыть в дневнике?' },
  { emoji: '🪞', text: 'Что ты видишь, когда смотришь в зеркало?' },
]

const PROMPTS_PER_VIEW = 3

/** Get day-of-year as stable seed for daily rotation */
function getDayOfYear(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - start.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

/** Seeded pseudo-random number generator (mulberry32) */
function seededRandom(seed: number) {
  let t = seed + 0x6D2B79F5
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

/** Get daily rotating prompts + shuffled extras */
function getDailyPrompts(count: number): { daily: typeof ALL_PROMPTS; extras: typeof ALL_PROMPTS } {
  const seed = getDayOfYear()

  // Pick first `count` prompts based on daily seed (deterministic)
  const indices = ALL_PROMPTS.map((_, i) => i)
  // Fisher-Yates shuffle with seeded random
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seed + i) * (i + 1))
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }

  const daily = indices.slice(0, count).map((i) => ALL_PROMPTS[i])
  const extraIndices = indices.slice(count)
  const extras = extraIndices.slice(0, 3).map((i) => ALL_PROMPTS[i])

  return { daily, extras }
}

interface WritingPromptsProps {
  className?: string
  onPromptClick?: (prompt: string) => void
}

export function WritingPrompts({ className, onPromptClick }: WritingPromptsProps) {
  const [viewMode, setViewMode] = useState<'daily' | 'more'>('daily')

  const { daily, extras } = useMemo(() => getDailyPrompts(PROMPTS_PER_VIEW), [])
  const currentPrompts = viewMode === 'daily' ? daily : extras

  const refreshPrompts = useCallback(() => {
    setViewMode((prev) => (prev === 'daily' ? 'more' : 'daily'))
  }, [])

  return (
    <Card
      className={cn(
        'rounded-xl border overflow-hidden relative',
        'bg-gradient-to-br from-amber-50/60 via-orange-50/30 to-yellow-50/40',
        'dark:from-amber-950/20 dark:via-orange-950/10 dark:to-yellow-950/15',
        className
      )}
    >
      {/* Decorative gradient accent */}
      <div className="pointer-events-none absolute top-0 right-0 h-24 w-24 rounded-full bg-gradient-to-br from-amber-300/20 to-orange-400/15 blur-2xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-16 w-16 rounded-full bg-gradient-to-br from-yellow-300/15 to-amber-400/10 blur-xl" />

      <CardContent className="relative p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-amber-400 via-orange-400 to-yellow-400 flex items-center justify-center shadow-md shadow-amber-500/25">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-semibold block leading-tight">
                {viewMode === 'daily' ? 'Идеи для записи' : 'Ещё идеи'}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">
                {viewMode === 'daily' ? 'Обновляются каждый день' : 'Дополнительные темы'}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshPrompts}
            className="h-8 px-2.5 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            <span className="text-xs">Другие</span>
          </Button>
        </div>

        <div className="space-y-2">
          {currentPrompts.map((prompt, i) => (
            <button
              key={`${viewMode}-${i}`}
              type="button"
              onClick={() => onPromptClick?.(prompt.text)}
              className={cn(
                'w-full flex items-start gap-3 rounded-xl p-3 text-left transition-all duration-200',
                'bg-white/60 dark:bg-white/5 backdrop-blur-sm',
                'hover:bg-white/90 dark:hover:bg-white/10',
                'hover:shadow-sm hover:shadow-amber-500/5',
                'border border-amber-200/30 dark:border-amber-800/20',
                'hover:border-amber-300/50 dark:hover:border-amber-700/30',
                'active-press group'
              )}
            >
              <span className="text-xl mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                {prompt.emoji}
              </span>
              <span className="text-sm text-foreground/80 group-hover:text-foreground leading-relaxed flex-1 transition-colors">
                {prompt.text}
              </span>
              <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-200 mt-1">
                <PenLine className="h-3 w-3 text-primary/60" />
                <ArrowRight className="h-3.5 w-3.5 text-primary/60 translate-x-[-2px] group-hover:translate-x-0 transition-transform" />
              </div>
            </button>
          ))}
        </div>

        {/* Prompt count indicator */}
        <div className="flex items-center justify-center mt-3 gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                'h-1 rounded-full transition-all duration-300',
                viewMode === 'daily'
                  ? 'w-4 bg-amber-400/60'
                  : 'w-1 bg-amber-400/30'
              )}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
