'use client'

import { useState, useCallback, memo } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Constants ──────────────────────────────────────────────────────────────

const EMOJI_OPTIONS = ['🙏', '❤️', '🌟', '😊', '🙌'] as const

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0]
}

function storageKey(date: string): string {
  return `unilife-gratitude-${date}`
}

interface GratitudeState {
  emoji: string
  text: string
  saved: boolean
}

const DEFAULT_STATE: GratitudeState = {
  emoji: '🙏',
  text: '',
  saved: false,
}

function loadInitialState(): GratitudeState {
  try {
    const raw = localStorage.getItem(storageKey(getTodayKey()))
    if (!raw) return DEFAULT_STATE
    const data = JSON.parse(raw) as GratitudeState
    return { emoji: data.emoji, text: data.text, saved: true }
  } catch {
    return DEFAULT_STATE
  }
}

function persistGratitude(emoji: string, text: string) {
  try {
    localStorage.setItem(storageKey(getTodayKey()), JSON.stringify({ emoji, text }))
  } catch {
    // ignore
  }
}

// ─── Component ──────────────────────────────────────────────────────────────
// Note: loaded with ssr: false, so localStorage is safe to access in initializer.

export default memo(function QuickGratitudeWidget() {
  const [state, setState] = useState<GratitudeState>(loadInitialState)

  const selectedEmoji = state.emoji
  const text = state.text
  const saved = state.saved

  const handleEmojiPick = useCallback((emoji: string) => {
    setState((prev) => ({ ...prev, emoji }))
  }, [])

  const handleTextChange = useCallback((value: string) => {
    setState((prev) => ({ ...prev, text: value }))
  }, [])

  const handleSave = useCallback(() => {
    if (!text.trim()) return
    persistGratitude(selectedEmoji, text.trim())
    setState((prev) => ({ ...prev, saved: true }))
  }, [selectedEmoji, text])

  const handleReset = useCallback(() => {
    setState({ emoji: '🙏', text: '', saved: false })
  }, [])

  return (
    <Card className="animate-slide-up card-hover rounded-xl border overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-500/5 via-rose-500/4 to-orange-500/5 transition-all duration-500" />

      <CardHeader className="relative pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-rose-500 shadow-sm">
            <Heart className="h-3.5 w-3.5 text-white" />
          </div>
          <span>Быстрая благодарность</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="relative space-y-3">
        {saved && text.trim() ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">{selectedEmoji}</span>
              <p className="text-sm text-foreground leading-relaxed line-clamp-3">
                {text}
              </p>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Записать ещё
            </button>
          </div>
        ) : (
          <>
            {/* Emoji picker */}
            <div className="flex gap-1.5">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleEmojiPick(emoji)}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg text-lg transition-all duration-200',
                    selectedEmoji === emoji
                      ? 'scale-110 bg-amber-100 dark:bg-amber-900/30 ring-2 ring-amber-400/50'
                      : 'hover:bg-muted hover:scale-105'
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Textarea */}
            <textarea
              value={text}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="За что вы благодарны сегодня?"
              maxLength={300}
              rows={2}
              className={cn(
                'w-full resize-none rounded-lg border bg-background/50 px-3 py-2 text-sm transition-all duration-200',
                'placeholder:text-muted-foreground/50',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30 focus-visible:border-amber-300 dark:focus-visible:border-amber-700',
                'hover:border-amber-200 dark:hover:border-amber-800'
              )}
            />

            {/* Empty state or save button */}
            {!text.trim() ? (
              <p className="text-[11px] text-muted-foreground/70 text-center">
                Сегодня вы ещё не записали благодарность
              </p>
            ) : (
              <button
                type="button"
                onClick={handleSave}
                className={cn(
                  'w-full rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200',
                  'bg-gradient-to-r from-amber-400 to-rose-400 text-white',
                  'hover:from-amber-500 hover:to-rose-500',
                  'active:scale-[0.98] shadow-sm'
                )}
              >
                {selectedEmoji} Сохранить
              </button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
})
