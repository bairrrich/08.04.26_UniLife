'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StickyNote, Plus, X, Clock } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuickNote {
  id: string
  text: string
  createdAt: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'unilife-quick-notes'
const MAX_NOTES = 10
const MAX_CHARS = 200
const NOTES_CHANGED_EVENT = 'unilife-notes-changed'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseNotes(raw: string | null): QuickNote[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (n: QuickNote) =>
        typeof n.id === 'string' &&
        typeof n.text === 'string' &&
        typeof n.createdAt === 'string'
    )
  } catch {
    return []
  }
}

function saveNotes(notes: QuickNote[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
  } catch {
    // localStorage might be full
  }
}

function generateId(): string {
  return `note_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHrs = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'только что'
  if (diffMin < 60) return `${diffMin} мин. назад`
  if (diffHrs < 24) return `${diffHrs} ч. назад`
  if (diffDays < 7) return `${diffDays} дн. назад`

  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  })
}

/** Dispatch a custom event so all QuickNotes instances stay in sync */
function emitNotesChange() {
  window.dispatchEvent(new CustomEvent(NOTES_CHANGED_EVENT))
}

// ─── Component ────────────────────────────────────────────────────────────────

export function QuickNotes() {
  const [mounted, setMounted] = useState(false)
  const [notes, setNotes] = useState<QuickNote[]>([])
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // ── Read from localStorage once after mount ─────────────────────────────
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    setNotes(parseNotes(raw)) // eslint-disable-line react-hooks/set-state-in-effect -- reading from external storage on mount
    setMounted(true)
  }, [])

  // ── Listen for cross-tab + cross-component sync ────────────────────────
  useEffect(() => {
    const handleSync = () => {
      const raw = localStorage.getItem(STORAGE_KEY)
      setNotes(parseNotes(raw))
    }
    window.addEventListener('storage', handleSync)
    window.addEventListener(NOTES_CHANGED_EVENT, handleSync)
    return () => {
      window.removeEventListener('storage', handleSync)
      window.removeEventListener(NOTES_CHANGED_EVENT, handleSync)
    }
  }, [])

  const handleAddNote = useCallback(() => {
    const text = inputValue.trim()
    if (!text || notes.length >= MAX_NOTES) return

    const newNote: QuickNote = {
      id: generateId(),
      text: text.slice(0, MAX_CHARS),
      createdAt: new Date().toISOString(),
    }

    const updated = [newNote, ...notes].slice(0, MAX_NOTES)
    saveNotes(updated)
    setNotes(updated)
    emitNotesChange()
    setInputValue('')
    inputRef.current?.focus()
  }, [inputValue, notes])

  const handleDeleteNote = useCallback(
    (id: string) => {
      const updated = notes.filter((n) => n.id !== id)
      saveNotes(updated)
      setNotes(updated)
      emitNotesChange()
    },
    [notes]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleAddNote()
      }
    },
    [handleAddNote]
  )

  const remaining = MAX_CHARS - inputValue.length

  // Server / pre-mount: render skeleton
  if (!mounted) {
    return (
      <Card className="rounded-xl border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40">
              <StickyNote className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            Быстрые заметки
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={`skel-${i}`}
                className="skeleton-shimmer h-12 rounded-lg"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="animate-slide-up card-hover rounded-xl border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40">
            <StickyNote className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          Быстрые заметки
          {notes.length > 0 && (
            <span className="ml-auto text-xs font-normal text-muted-foreground tabular-nums">
              {notes.length}/{MAX_NOTES}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {notes.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
              <StickyNote className="h-5 w-5 text-amber-500/60" />
            </div>
            <p className="text-sm text-muted-foreground">Нет заметок</p>
            <p className="mt-0.5 text-xs text-muted-foreground/70">
              Добавьте первую заметку ниже
            </p>
          </div>
        ) : (
          /* Notes list */
          <div className="stagger-children space-y-2">
            <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="group relative rounded-lg border bg-muted/30 p-3 transition-colors hover:bg-muted/50"
                >
                  <p className="pr-8 text-sm leading-relaxed break-words">
                    {note.text}
                  </p>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground/70">
                      <Clock className="h-2.5 w-2.5" />
                      {formatTimestamp(note.createdAt)}
                    </span>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground/50 opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                      aria-label="Удалить заметку"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add note input */}
        {notes.length < MAX_NOTES && (
          <div className="mt-3 flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value.slice(0, MAX_CHARS))}
                onKeyDown={handleKeyDown}
                placeholder="Новая заметка..."
                className="h-9 pr-10 text-sm"
                disabled={notes.length >= MAX_NOTES}
              />
              <span
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] tabular-nums ${
                  remaining <= 20 && remaining > 0
                    ? 'text-amber-500'
                    : remaining <= 0
                      ? 'text-destructive'
                      : 'text-muted-foreground/50'
                }`}
              >
                {remaining}
              </span>
            </div>
            <Button
              size="sm"
              className="h-9 px-3"
              onClick={handleAddNote}
              disabled={!inputValue.trim() || notes.length >= MAX_NOTES}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}

        {notes.length >= MAX_NOTES && (
          <p className="mt-2 text-center text-xs text-muted-foreground/60">
            Достигнут лимит в {MAX_NOTES} заметок
          </p>
        )}
      </CardContent>
    </Card>
  )
}
