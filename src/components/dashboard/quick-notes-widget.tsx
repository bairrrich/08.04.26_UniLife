'use client'

import { useState, useEffect, useRef, useCallback, useSyncExternalStore } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { FileEdit, Save, Trash2, Clock } from 'lucide-react'
import { toast } from 'sonner'

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'unilife_quick_notes'
const MAX_CHARS = 500

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadNotes(): { text: string; savedAt: string | null } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { text: '', savedAt: null }
    const parsed = JSON.parse(raw)
    return {
      text: typeof parsed.text === 'string' ? parsed.text : '',
      savedAt: typeof parsed.savedAt === 'string' ? parsed.savedAt : null,
    }
  } catch {
    return { text: '', savedAt: null }
  }
}

function saveNotes(text: string) {
  try {
    const payload = JSON.stringify({ text, savedAt: new Date().toISOString() })
    localStorage.setItem(STORAGE_KEY, payload)
  } catch {
    // localStorage might be unavailable
  }
}

function clearNotes() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // localStorage might be unavailable
  }
}

function formatSavedAt(iso: string | null): string {
  if (!iso) return ''
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)

  if (diffMin < 1) return 'Сохранено только что'
  if (diffMin < 60) return `Сохранено ${diffMin} мин. назад`

  return `Сохранено ${date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })}`
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function QuickNotesWidget() {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
  const [text, setText] = useState(() => loadNotes().text)
  const [savedAt, setSavedAt] = useState<string | null>(() => loadNotes().savedAt)
  const [confirmClear, setConfirmClear] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const confirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Cleanup timers on unmount ──────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current)
    }
  }, [])

  // ── Auto-resize textarea ───────────────────────────────────────────────
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 128) + 'px'
  }, [text])

  const handleSave = useCallback(() => {
    const trimmed = text.trim()
    if (trimmed.length === 0) {
      toast.info('Заметка пуста')
      return
    }
    saveNotes(trimmed)
    const now = new Date().toISOString()
    setSavedAt(now)
    toast.success('Заметка сохранена')
  }, [text])

  const handleBlur = useCallback(() => {
    // Debounced auto-save on blur
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (text.trim().length > 0) {
        saveNotes(text.trim())
        const now = new Date().toISOString()
        setSavedAt(now)
      }
    }, 500)
  }, [text])

  const handleClear = useCallback(() => {
    if (!confirmClear) {
      setConfirmClear(true)
      confirmTimerRef.current = setTimeout(() => setConfirmClear(false), 3000)
      return
    }
    // Second click — actually clear
    if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current)
    setText('')
    setSavedAt(null)
    setConfirmClear(false)
    clearNotes()
    toast.success('Заметка удалена')
  }, [confirmClear])

  const handleChange = useCallback((value: string) => {
    setText(value.slice(0, MAX_CHARS))
  }, [])

  const charCount = text.length
  const remaining = MAX_CHARS - charCount

  // ── Pre-mount skeleton ─────────────────────────────────────────────────
  if (!mounted) {
    return (
      <Card className="glass-card rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/40">
              <FileEdit className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </div>
            Быстрая заметка
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="skeleton-shimmer h-32 rounded-lg" />
            <div className="flex justify-between">
              <div className="skeleton-shimmer h-4 w-24 rounded-md" />
              <div className="skeleton-shimmer h-4 w-32 rounded-md" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="animate-slide-up card-hover glass-card rounded-xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/40">
            <FileEdit className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          </div>
          Быстрая заметка
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* ── Textarea ──────────────────────────────────────────────────── */}
        <Textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          placeholder="Запишите здесь важную мысль..."
          className="max-h-32 min-h-[80px] resize-none text-sm leading-relaxed"
          rows={3}
        />

        {/* ── Bottom row: char count + buttons ──────────────────────────── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] tabular-nums ${
                remaining <= 50 && remaining > 0
                  ? 'text-amber-500'
                  : remaining <= 0
                    ? 'text-destructive'
                    : 'text-muted-foreground/60'
              }`}
            >
              {charCount}/{MAX_CHARS}
            </span>
            {savedAt && (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground/50">
                <Clock className="h-2.5 w-2.5" />
                {formatSavedAt(savedAt)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {text.trim().length > 0 && (
              <Button
                size="sm"
                variant={confirmClear ? 'destructive' : 'ghost'}
                className="h-7 gap-1 px-2 text-xs"
                onClick={handleClear}
              >
                <Trash2 className="h-3 w-3" />
                {confirmClear ? 'Точно?' : ''}
              </Button>
            )}
            <Button
              size="sm"
              className="h-7 gap-1 px-2.5 text-xs"
              onClick={handleSave}
              disabled={text.trim().length === 0}
            >
              <Save className="h-3 w-3" />
              Сохранить
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
