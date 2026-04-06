'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, RefreshCw, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const ALL_PROMPTS = [
  { emoji: '🌅', text: 'Что сегодня вас обрадовало?' },
  { emoji: '🌟', text: 'Опишите свой идеальный день' },
  { emoji: '💡', text: 'Какая мысль не даёт вам покоя?' },
  { emoji: '🎯', text: 'Что бы вы сделали, если бы не боялись?' },
  { emoji: '🤔', text: 'Какой урок вы извлекли на этой неделе?' },
  { emoji: '🌈', text: 'За что вы благодарны прямо сейчас?' },
  { emoji: '📚', text: 'Какая книга или фильм вас вдохновили?' },
  { emoji: '💪', text: 'В чём вы чувствуете прогресс?' },
  { emoji: '🧘', text: 'Что помогает вам расслабиться?' },
  { emoji: '✨', text: 'Вспомните момент, когда вы гордились собой' },
  { emoji: '🌍', text: 'Если бы вы могли изменить одну вещь в мире...' },
  { emoji: '🎭', text: 'Какую роль вы играете в жизни других людей?' },
  { emoji: '🔔', text: 'Что вы давно хотели попробовать?' },
  { emoji: '🧩', text: 'Какую проблему вы пытались решить?' },
  { emoji: '🌊', text: 'Что для вас значит свобода?' },
]

function getRandomPrompts(count: number, exclude?: number[]): { prompts: typeof ALL_PROMPTS; seedIndex: number } {
  const available = ALL_PROMPTS.filter((_, i) => !exclude?.includes(i))
  const shuffled = [...available].sort(() => Math.random() - 0.5)
  const selected = shuffled.slice(0, count)
  const seedIndex = ALL_PROMPTS.indexOf(selected[0])
  return { prompts: selected, seedIndex }
}

interface WritingPromptsProps {
  className?: string
  onPromptClick?: (prompt: string) => void
}

export function WritingPrompts({ className, onPromptClick }: WritingPromptsProps) {
  const [shuffled, setShuffled] = useState(() => getRandomPrompts(3))

  const refreshPrompts = () => {
    setShuffled(getRandomPrompts(3, [shuffled.seedIndex]))
  }

  return (
    <Card className={cn(
      'rounded-xl border overflow-hidden',
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold">Идеи для записи</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshPrompts}
            className="h-7 px-2 text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            <span className="text-xs">Другие</span>
          </Button>
        </div>

        <div className="space-y-2">
          {shuffled.prompts.map((prompt, i) => (
            <button
              key={`${shuffled.seedIndex}-${i}`}
              type="button"
              onClick={() => onPromptClick?.(prompt.text)}
              className={cn(
                'w-full flex items-start gap-3 rounded-lg p-2.5 text-left transition-all',
                'bg-muted/40 hover:bg-muted/70 hover:shadow-sm',
                'active-press group'
              )}
            >
              <span className="text-lg mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform">
                {prompt.emoji}
              </span>
              <span className="text-sm text-foreground/80 group-hover:text-foreground leading-relaxed flex-1">
                {prompt.text}
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/0 group-hover:text-muted-foreground/60 transition-all mt-1 flex-shrink-0 translate-x-[-4px] group-hover:translate-x-0" />
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
