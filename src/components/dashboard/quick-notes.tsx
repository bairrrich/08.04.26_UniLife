'use client'

import {
  useState,
  useCallback,
  useEffect,
  useRef,
  type KeyboardEvent,
} from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { StickyNote, Plus, X, Clock } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type NoteColor = 'emerald' | 'amber' | 'blue' | 'rose'

interface QuickNote {
  id: string
  text: string
  createdAt: string
  color: NoteColor
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'unilife-quick-notes'
const MAX_NOTES = 10
const MAX_CHARS = 500
const NOTES_CHANGED_EVENT = 'unilife-notes-changed'

const NOTE_COLORS: NoteColor[] = ['emerald', 'amber', 'blue', 'rose']

const NOTE_COLOR_STYLES: Record<
  NoteColor,
  { bg: string; border: string }
> = {
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-800',
  },
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800',
  },
  rose: {
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    border: 'border-rose-200 dark:border-rose-800',
  },
}

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
    // localStorage might be full or unavailable
  }
}

function loadNotes(): QuickNote[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return parseNotes(raw)
  } catch {
    return []
  }
}

function generateId(): string {
  return `note_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function pickRandomColor(): NoteColor {
  return NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)]
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
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const editRef = useRef<HTMLTextAreaElement>(null)

  // Debounced save ref
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Read from localStorage once after mount ─────────────────────────────
  useEffect(() => {
    const loaded = loadNotes()
    // Ensure all notes have a color (backfill old notes)
    const withColors = loaded.map((n) => ({
      ...n,
      color: n.color || pickRandomColor(),
    }))
    setNotes(withColors) // eslint-disable-line react-hooks/set-state-in-effect -- reading from external storage on mount
    setMounted(true)
  }, [])

  // ── Listen for cross-tab + cross-component sync ────────────────────────
  useEffect(() => {
    const handleSync = () => {
      const loaded = loadNotes()
      const withColors = loaded.map((n) => ({
        ...n,
        color: n.color || pickRandomColor(),
      }))
      setNotes(withColors)
    }
    window.addEventListener('storage', handleSync)
    window.addEventListener(NOTES_CHANGED_EVENT, handleSync)
    return () => {
      window.removeEventListener('storage', handleSync)
      window.removeEventListener(NOTES_CHANGED_EVENT, handleSync)
    }
  }, [])

  // ── Auto-focus edit textarea when editing starts ────────────────────────
  useEffect(() => {
    if (editingId && editRef.current) {
      editRef.current.focus()
      // Place cursor at end
      const len = editRef.current.value.length
      editRef.current.setSelectionRange(len, len)
    }
  }, [editingId])

  const handleAddNote = useCallback(() => {
    const text = inputValue.trim()
    if (!text || notes.length >= MAX_NOTES) return

    const newNote: QuickNote = {
      id: generateId(),
      text: text.slice(0, MAX_CHARS),
      createdAt: new Date().toISOString(),
      color: pickRandomColor(),
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
      if (editingId === id) {
        setEditingId(null)
        setEditValue('')
      }
    },
    [notes, editingId],
  )

  const handleStartEdit = useCallback((note: QuickNote) => {
    setEditingId(note.id)
    setEditValue(note.text)
  }, [])

  const handleSaveEdit = useCallback(() => {
    if (!editingId) return
    const updated = notes.map((n) =>
      n.id === editingId ? { ...n, text: editValue } : n,
    )
    // Delete empty notes on save
    const filtered = updated.filter(
      (n) => !(n.id === editingId && n.text.trim() === ''),
    )
    saveNotes(filtered)
    setNotes(filtered)
    emitNotesChange()
    setEditingId(null)
    setEditValue('')
  }, [editingId, editValue, notes])

  const handleCancelEdit = useCallback(() => {
    setEditingId(null)
    setEditValue('')
  }, [])

  const handleEditChange = useCallback(
    (value: string) => {
      const truncated = value.slice(0, MAX_CHARS)
      setEditValue(truncated)
      // Debounced save while typing
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      debounceTimerRef.current = setTimeout(() => {
        const updated = notes.map((n) =>
          n.id === editingId ? { ...n, text: truncated } : n,
        )
        saveNotes(updated)
      }, 300)
    },
    [editingId, notes],
  )

  const handleEditKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSaveEdit()
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        handleCancelEdit()
      }
    },
    [handleSaveEdit, handleCancelEdit],
  )

  const handleAddKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        handleAddNote()
      }
    },
    [handleAddNote],
  )

  const remaining = MAX_CHARS - inputValue.length
  const editRemaining = MAX_CHARS - editValue.length

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
            <Badge variant="secondary" className="ml-1 tabular-nums text-[10px] px-1.5 py-0">
              {notes.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {notes.length === 0 && !editingId ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
              <StickyNote className="h-5 w-5 text-amber-500/60" />
            </div>
            <p className="text-sm text-muted-foreground">
              Заметок пока нет
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground/70">
              Нажмите кнопку, чтобы создать первую
            </p>
            <Button
              size="sm"
              variant="outline"
              className="mt-3 gap-1.5"
              onClick={handleAddNote}
            >
              <Plus className="h-3.5 w-3.5" />
              Добавить
            </Button>
          </div>
        ) : (
          /* Notes list */
          <div className="stagger-children space-y-2">
            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {notes.map((note) => {
                const isEditing = editingId === note.id
                const colorStyle = NOTE_COLOR_STYLES[note.color || 'amber']

                return (
                  <div
                    key={note.id}
                    className={`group relative rounded-lg border p-2.5 transition-all ${
                      colorStyle.bg
                    } ${
                      colorStyle.border
                    } ${
                      isEditing
                        ? 'ring-1 ring-primary/20 shadow-sm'
                        : 'card-hover cursor-pointer'
                    }`}
                    onClick={() => {
                      if (!isEditing) handleStartEdit(note)
                    }}
                    role={isEditing ? undefined : 'button'}
                    tabIndex={isEditing ? undefined : 0}
                    onKeyDown={(e) => {
                      if (!isEditing && e.key === 'Enter') {
                        e.preventDefault()
                        handleStartEdit(note)
                      }
                    }}
                  >
                    {isEditing ? (
                      /* Editing mode */
                      <div onClick={(e) => e.stopPropagation()}>
                        <Textarea
                          ref={editRef}
                          value={editValue}
                          onChange={(e) => handleEditChange(e.target.value)}
                          onKeyDown={handleEditKeyDown}
                          className="min-h-[60px] resize-none border-0 bg-transparent p-0 text-sm leading-relaxed shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/40"
                          placeholder="Введите текст заметки..."
                          rows={2}
                        />
                        <div className="mt-1 flex items-center justify-between">
                          <span
                            className={`text-[10px] tabular-nums ${
                              editRemaining <= 50 && editRemaining > 0
                                ? 'text-amber-500'
                                : editRemaining <= 0
                                  ? 'text-destructive'
                                  : 'text-muted-foreground/50'
                            }`}
                          >
                            {editRemaining}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCancelEdit()
                              }}
                              className="flex h-5 w-5 items-center justify-center rounded text-[10px] text-muted-foreground/60 hover:bg-muted/50 hover:text-muted-foreground"
                            >
                              Отмена
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleSaveEdit()
                              }}
                              className="flex h-5 w-5 items-center justify-center rounded text-[10px] font-medium text-primary hover:bg-primary/10"
                            >
                              Сохранить
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Display mode */
                      <>
                        <p className="pr-7 text-sm leading-relaxed break-words line-clamp-3">
                          {note.text}
                        </p>
                        <div className="mt-1.5 flex items-center justify-between">
                          <span className="flex items-center gap-1 text-[10px] text-muted-foreground/70">
                            <Clock className="h-2.5 w-2.5" />
                            {formatTimestamp(note.createdAt)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteNote(note.id)
                            }}
                            className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground/50 opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                            aria-label="Удалить заметку"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Add note input */}
        {notes.length < MAX_NOTES && (
          <div className="mt-3 space-y-1.5">
            <Textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value.slice(0, MAX_CHARS))}
              onKeyDown={handleAddKeyDown}
              placeholder="Новая заметка..."
              className="min-h-[48px] resize-none text-sm leading-relaxed"
              rows={1}
              disabled={notes.length >= MAX_NOTES}
            />
            <div className="flex items-center justify-between">
              <span
                className={`text-[10px] tabular-nums ${
                  remaining <= 50 && remaining > 0
                    ? 'text-amber-500'
                    : remaining <= 0
                      ? 'text-destructive'
                      : 'text-muted-foreground/50'
                }`}
              >
                {remaining}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground/50">
                  Ctrl+Enter
                </span>
                <Button
                  size="sm"
                  className="h-7 gap-1 px-2.5 text-xs"
                  onClick={handleAddNote}
                  disabled={!inputValue.trim() || notes.length >= MAX_NOTES}
                >
                  <Plus className="h-3 w-3" />
                  Добавить
                </Button>
              </div>
            </div>
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
