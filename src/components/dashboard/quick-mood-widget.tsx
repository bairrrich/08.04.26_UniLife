'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MOOD_EMOJI, MOOD_LABELS, getTodayStr } from '@/lib/format'
import { safeJson } from '@/lib/safe-fetch'
import { toast } from 'sonner'
import { SmilePlus, Loader2 } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────

interface DiaryEntryResponse {
  success: boolean
  data: {
    id: string
    date: string
    content: string
    mood: number | null
    title: string | null
  }
}

// ─── Mood Button Config ──────────────────────────────────────────────────

interface MoodOption {
  value: number
  emoji: string
  label: string
  activeRing: string
  activeBg: string
}

const MOODS: MoodOption[] = [
  {
    value: 1,
    emoji: '😢',
    label: 'Ужасно',
    activeRing: 'ring-2 ring-rose-400 dark:ring-rose-500',
    activeBg: 'bg-rose-50 dark:bg-rose-950/40',
  },
  {
    value: 2,
    emoji: '😕',
    label: 'Плохо',
    activeRing: 'ring-2 ring-rose-400 dark:ring-rose-500',
    activeBg: 'bg-rose-50 dark:bg-rose-950/40',
  },
  {
    value: 3,
    emoji: '😐',
    label: 'Нормально',
    activeRing: 'ring-2 ring-amber-400 dark:ring-amber-500',
    activeBg: 'bg-amber-50 dark:bg-amber-950/40',
  },
  {
    value: 4,
    emoji: '🙂',
    label: 'Хорошо',
    activeRing: 'ring-2 ring-emerald-400 dark:ring-emerald-500',
    activeBg: 'bg-emerald-50 dark:bg-emerald-950/40',
  },
  {
    value: 5,
    emoji: '😄',
    label: 'Отлично',
    activeRing: 'ring-2 ring-emerald-400 dark:ring-emerald-500',
    activeBg: 'bg-emerald-50 dark:bg-emerald-950/40',
  },
]

// ─── Component ─────────────────────────────────────────────────────────────

export default function QuickMoodWidget() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [todayEntryId, setTodayEntryId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // ── Check for existing today entry on mount ─────────────────────────────
  useEffect(() => {
    const checkToday = async () => {
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
          if (todayEntry) {
            setTodayEntryId(todayEntry.id)
            if (todayEntry.mood) {
              setSelectedMood(todayEntry.mood)
            }
          }
        }
      } catch {
        // Silently fail on check
      }
    }
    checkToday()
  }, [])

  // ── Save mood ──────────────────────────────────────────────────────────
  const handleMoodSelect = useCallback(
    async (mood: number) => {
      if (saving) return
      setSaving(true)
      setSelectedMood(mood)

      try {
        if (todayEntryId) {
          // UPDATE existing entry
          const res = await fetch(`/api/diary/${todayEntryId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mood }),
          })
          if (res.ok) {
            toast.success(`Настроение обновлено: ${MOOD_EMOJI[mood]} ${MOOD_LABELS[mood]}`)
          } else {
            toast.error('Не удалось обновить настроение')
          }
        } else {
          // CREATE new entry
          const today = new Date().toISOString()
          const res = await fetch('/api/diary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              content: 'Быстрое настроение',
              mood,
              date: today,
            }),
          })
          const json = await safeJson<DiaryEntryResponse>(res)
          if (json?.data?.id) {
            setTodayEntryId(json.data.id)
            toast.success(`Настроение обновлено: ${MOOD_EMOJI[mood]} ${MOOD_LABELS[mood]}`)
          } else {
            toast.error('Не удалось сохранить настроение')
          }
        }
      } catch {
        toast.error('Ошибка соединения')
      } finally {
        setSaving(false)
      }
    },
    [saving, todayEntryId]
  )

  // ── Label for selected mood ────────────────────────────────────────────
  const moodLabel = selectedMood
    ? `${MOOD_LABELS[selectedMood]} настроение ${MOOD_EMOJI[selectedMood]}`
    : 'Выберите настроение'

  return (
    <Card className="animate-slide-up card-hover rounded-xl border overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40">
            <SmilePlus className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <span>Настроение сегодня</span>
          {saving && (
            <Loader2 className="ml-auto h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Mood buttons */}
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          {MOODS.map((m) => (
            <button
              key={m.value}
              onClick={() => handleMoodSelect(m.value)}
              disabled={saving}
              className={`
                flex h-12 w-12 items-center justify-center rounded-lg text-xl
                transition-all duration-200 select-none
                sm:h-14 sm:w-14 sm:text-2xl
                hover:scale-110 active:scale-95
                ${
                  selectedMood === m.value
                    ? `${m.activeRing} ${m.activeBg}`
                    : 'bg-muted/50 hover:bg-muted'
                }
                disabled:opacity-50 disabled:pointer-events-none
              `}
              aria-label={m.label}
            >
              {m.emoji}
            </button>
          ))}
        </div>

        {/* Subtitle label */}
        <p className="text-center text-sm text-muted-foreground">
          {moodLabel}
        </p>
      </CardContent>
    </Card>
  )
}
