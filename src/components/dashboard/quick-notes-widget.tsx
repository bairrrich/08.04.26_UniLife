'use client'

import { useState, useEffect, useRef, useCallback, useSyncExternalStore, useMemo } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { FileEdit, Save, Trash2, Clock, Search, Plus, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'unilife_quick_notes_list'
const MAX_CHARS = 500

// ─── Types ────────────────────────────────────────────────────────────────────

type NoteColor = 'emerald' | 'amber' | 'rose' | 'blue' | 'violet'

interface QuickNote {
  id: string
  text: string
  color: NoteColor
  savedAt: string
  createdAt: string
}

const NOTE_COLORS: { id: NoteColor; label: string; dot: string; badge: string; text: string; border: string }[] = [
  { id: 'emerald', label: 'Изумруд', dot: 'bg-emerald-500', badge: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-l-emerald-400' },
  { id: 'amber', label: 'Янтарь', dot: 'bg-amber-500', badge: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300', text: 'text-amber-600 dark:text-amber-400', border: 'border-l-amber-400' },
  { id: 'rose', label: 'Роза', dot: 'bg-rose-500', badge: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300', text: 'text-rose-600 dark:text-rose-400', border: 'border-l-rose-400' },
  { id: 'blue', label: 'Синий', dot: 'bg-blue-500', badge: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300', text: 'text-blue-600 dark:text-blue-400', border: 'border-l-blue-400' },
  { id: 'violet', label: 'Фиалка', dot: 'bg-violet-500', badge: 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300', text: 'text-violet-600 dark:text-violet-400', border: 'border-l-violet-400' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadNotesList(): QuickNote[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (n: QuickNote) => n.id && typeof n.text === 'string' && n.color && n.savedAt
    )
  } catch {
    return []
  }
}

function saveNotesList(notes: QuickNote[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
  } catch {
    // localStorage might be unavailable
  }
}

function formatSavedAt(iso: string): string {
  if (!iso) return ''
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)

  if (diffMin < 1) return 'Только что'
  if (diffMin < 60) return `${diffMin} мин. назад`

  return date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ─── Simple Markdown Renderer ─────────────────────────────────────────────────

function renderMarkdown(text: string): string {
  let html = text
  // Bold: **text** or __text__
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>')
  // Italic: *text* or _text_
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')
  html = html.replace(/(?<!\*)_(.*?)_(?!\*)/g, '<em>$1</em>')
  // Links: [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="underline text-primary hover:text-primary/80">$1</a>')
  // Line breaks
  html = html.replace(/\n/g, '<br />')
  return html
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function QuickNotesWidget() {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [editColor, setEditColor] = useState<NoteColor>('emerald')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [saveFlash, setSaveFlash] = useState(false)
  const confirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // ── Initialize notes from localStorage ──────────────────────────────────
  const [notes, setNotes] = useState<QuickNote[]>(() => {
    if (typeof window === 'undefined') return []
    const stored = loadNotesList()
    // Migrate old single-note format
    try {
      const oldRaw = localStorage.getItem('unilife_quick_notes')
      if (oldRaw && stored.length === 0) {
        const parsed = JSON.parse(oldRaw)
        if (parsed.text && parsed.text.trim()) {
          const migrated: QuickNote = {
            id: `migrated-${Date.now()}`,
            text: parsed.text,
            color: 'emerald',
            savedAt: parsed.savedAt || new Date().toISOString(),
            createdAt: new Date().toISOString(),
          }
          return [migrated]
        }
      }
    } catch { /* ignore migration error */ }
    return stored
  })

  // ── Persist notes to localStorage ────────────────────────────────────
  useEffect(() => {
    if (mounted) {
      saveNotesList(notes)
      // Clean up old single-note format after migration
      if (notes.length > 0) {
        try { localStorage.removeItem('unilife_quick_notes') } catch { /* ignore */ }
      }
    }
  }, [notes, mounted])

  // ── Cleanup timers on unmount ──────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current)
    }
  }, [])

  // ── Auto-resize textarea ───────────────────────────────────────────────
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 128) + 'px'
  }, [editText])

  // ── Focus search input when toggled ────────────────────────────────────
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [showSearch])

  // ── Create new note ────────────────────────────────────────────────────
  const handleNewNote = useCallback(() => {
    const newNote: QuickNote = {
      id: `note-${Date.now()}`,
      text: '',
      color: 'emerald',
      savedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }
    setNotes((prev) => [newNote, ...prev])
    setActiveNoteId(newNote.id)
    setEditText('')
    setEditColor('emerald')
    setShowSearch(false)
    setSearchQuery('')
  }, [])

  // ── Edit existing note ─────────────────────────────────────────────────
  const handleEditNote = useCallback((note: QuickNote) => {
    setActiveNoteId(note.id)
    setEditText(note.text)
    setEditColor(note.color)
    setShowSearch(false)
    setSearchQuery('')
  }, [])

  // ── Save note ──────────────────────────────────────────────────────────
  const handleSave = useCallback(() => {
    if (!activeNoteId) return
    const trimmed = editText.trim()
    if (trimmed.length === 0) {
      toast.info('Заметка пуста')
      return
    }
    const now = new Date().toISOString()
    setNotes((prev) =>
      prev.map((n) =>
        n.id === activeNoteId
          ? { ...n, text: trimmed, color: editColor, savedAt: now }
          : n
      )
    )
    setSaveFlash(true)
    setTimeout(() => setSaveFlash(false), 800)
    toast.success('Заметка сохранена')
  }, [activeNoteId, editText, editColor])

  // ── Delete note ────────────────────────────────────────────────────────
  const handleDelete = useCallback((noteId: string) => {
    if (confirmDeleteId !== noteId) {
      setConfirmDeleteId(noteId)
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current)
      confirmTimerRef.current = setTimeout(() => setConfirmDeleteId(null), 3000)
      return
    }
    // Second click — actually delete
    if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current)
    setNotes((prev) => prev.filter((n) => n.id !== noteId))
    if (activeNoteId === noteId) {
      setActiveNoteId(null)
      setEditText('')
    }
    setConfirmDeleteId(null)
    toast.success('Заметка удалена')
  }, [confirmDeleteId, activeNoteId])

  // ── Cancel editing ─────────────────────────────────────────────────────
  const handleCancel = useCallback(() => {
    // If the note has no text and is newly created, remove it
    if (activeNoteId) {
      const note = notes.find((n) => n.id === activeNoteId)
      if (note && !note.text.trim()) {
        setNotes((prev) => prev.filter((n) => n.id !== activeNoteId))
      }
    }
    setActiveNoteId(null)
    setEditText('')
  }, [activeNoteId, notes])

  // ── Filtered notes ─────────────────────────────────────────────────────
  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes
    const q = searchQuery.toLowerCase()
    return notes.filter((n) => n.text.toLowerCase().includes(q))
  }, [notes, searchQuery])

  const activeNote = notes.find((n) => n.id === activeNoteId)
  const charCount = editText.length
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
            Быстрые заметки
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

  // ── Editing mode ──────────────────────────────────────────────────────
  if (activeNoteId !== null) {
    const colorConfig = NOTE_COLORS.find((c) => c.id === editColor) ?? NOTE_COLORS[0]

    return (
      <Card className="animate-slide-up card-hover glass-card rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/40">
              <FileEdit className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </div>
            Редактирование
            <Badge variant="secondary" className="ml-auto text-[10px] tabular-nums">
              {charCount}/{MAX_CHARS}
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Color picker */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-muted-foreground">Цвет:</span>
            {NOTE_COLORS.map((color) => (
              <button
                key={color.id}
                type="button"
                onClick={() => setEditColor(color.id)}
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full transition-all duration-200 hover:scale-110',
                  color.dot,
                  editColor === color.id ? 'ring-2 ring-offset-2 ring-offset-background ring-foreground/30 scale-110' : 'opacity-50 hover:opacity-100'
                )}
                aria-label={color.label}
              />
            ))}
          </div>

          {/* Textarea */}
          <Textarea
            ref={textareaRef}
            value={editText}
            onChange={(e) => setEditText(e.target.value.slice(0, MAX_CHARS))}
            placeholder="Запишите здесь важную мысль..."
            className="max-h-32 min-h-[80px] resize-none text-sm leading-relaxed"
            rows={3}
            autoFocus
          />

          {/* Markdown hint */}
          <p className="text-[10px] text-muted-foreground/50">
            Поддерживается: **жирный**, *курсив*, [ссылка](url)
          </p>

          {/* Buttons */}
          <div className="flex items-center justify-between">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 gap-1 px-2 text-xs"
              onClick={handleCancel}
            >
              <X className="h-3 w-3" />
              Отмена
            </Button>

            <div className="relative">
              <Button
                size="sm"
                className={cn(
                  'h-7 gap-1.5 px-3 text-xs transition-all duration-300',
                  saveFlash && 'bg-emerald-500 hover:bg-emerald-500'
                )}
                onClick={handleSave}
                disabled={editText.trim().length === 0}
              >
                <AnimatePresence mode="wait">
                  {saveFlash ? (
                    <motion.span
                      key="saved"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      className="flex items-center gap-1"
                    >
                      <Check className="h-3 w-3" />
                      Сохранено!
                    </motion.span>
                  ) : (
                    <motion.span
                      key="save"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-1"
                    >
                      <Save className="h-3 w-3" />
                      Сохранить
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
              {/* Checkmark flash overlay */}
              <AnimatePresence>
                {saveFlash && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="pointer-events-none absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white"
                  >
                    <Check className="h-3 w-3" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // ── View mode ─────────────────────────────────────────────────────────
  return (
    <Card className="animate-slide-up card-hover glass-card rounded-xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/40">
            <FileEdit className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          </div>
          Быстрые заметки
          {/* Note count badge */}
          {notes.length > 0 && (
            <Badge variant="secondary" className="tabular-nums text-[10px] font-semibold">
              {notes.length}
            </Badge>
          )}
          {/* Actions */}
          <div className="ml-auto flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setShowSearch((prev) => !prev)}
              aria-label="Поиск"
            >
              <Search className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleNewNote}
              aria-label="Новая заметка"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* ── Search bar ──────────────────────────────────────────────────── */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск заметок..."
                  className="h-8 pl-8 pr-8 text-xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Notes List ──────────────────────────────────────────────────── */}
        <div className="max-h-64 overflow-y-auto space-y-2 custom-scrollbar">
          {filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              {notes.length === 0 ? (
                <>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-muted/50">
                    <FileEdit className="h-5 w-5 text-muted-foreground/40" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Нет заметок
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-1.5 h-6 gap-1 text-[11px]"
                    onClick={handleNewNote}
                  >
                    <Plus className="h-3 w-3" />
                    Создать
                  </Button>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Ничего не найдено
                </p>
              )}
            </div>
          ) : (
            filteredNotes.map((note) => {
              const colorConfig = NOTE_COLORS.find((c) => c.id === note.color) ?? NOTE_COLORS[0]
              return (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'group relative rounded-lg border border-l-4 bg-card/60 p-3 cursor-pointer transition-all duration-200 hover:bg-muted/30',
                    colorConfig.border
                  )}
                  onClick={() => handleEditNote(note)}
                >
                  {/* Color dot */}
                  <div className={cn('absolute right-2.5 top-2.5 h-2 w-2 rounded-full opacity-40 group-hover:opacity-70 transition-opacity', colorConfig.dot)} />

                  {/* Text content with markdown rendering */}
                  <div
                    className="text-sm leading-relaxed text-foreground/90 pr-4 line-clamp-3 [&_a]:text-primary [&_a]:underline"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(note.text) }}
                  />

                  {/* Footer */}
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
                      <Clock className="h-2.5 w-2.5" />
                      {formatSavedAt(note.savedAt)}
                    </span>

                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(note.id)
                      }}
                      className={cn(
                        'flex h-5 w-5 items-center justify-center rounded opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110',
                        confirmDeleteId === note.id
                          ? 'bg-destructive text-destructive-foreground opacity-100'
                          : 'text-muted-foreground/50 hover:text-destructive'
                      )}
                      aria-label="Удалить"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Confirm delete tooltip */}
                  {confirmDeleteId === note.id && (
                    <div className="absolute left-1/2 -translate-x-1/2 -bottom-6 z-10 rounded-md bg-destructive px-2 py-0.5 text-[10px] font-medium text-destructive-foreground whitespace-nowrap shadow-sm">
                      Нажмите ещё раз
                    </div>
                  )}
                </motion.div>
              )
            })
          )}
        </div>

        {/* ── Quick add button ──────────────────────────────────────────── */}
        {notes.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            onClick={handleNewNote}
          >
            <Plus className="h-3 w-3" />
            Новая заметка
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
