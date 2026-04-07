'use client'

import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
import {
  FileEdit, Save, Trash2, Clock, Search, Plus, Check, X, GripVertical,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'unilife-quick-notes'
const MAX_NOTES = 10
const MAX_CHARS = 500

// ─── Types ────────────────────────────────────────────────────────────────────

type NoteColor = 'emerald' | 'amber' | 'rose' | 'blue' | 'violet' | 'teal'

interface QuickNote {
  id: string
  title: string
  text: string
  color: NoteColor
  createdAt: string
  updatedAt: string
}

const NOTE_COLORS: { id: NoteColor; label: string; dot: string; bg: string; border: string; text: string; headerBg: string }[] = [
  { id: 'emerald', label: 'Изумруд', dot: 'bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-800/60', text: 'text-emerald-700 dark:text-emerald-300', headerBg: 'bg-emerald-100 dark:bg-emerald-900/50' },
  { id: 'amber', label: 'Янтарь', dot: 'bg-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-800/60', text: 'text-amber-700 dark:text-amber-300', headerBg: 'bg-amber-100 dark:bg-amber-900/50' },
  { id: 'rose', label: 'Роза', dot: 'bg-rose-500', bg: 'bg-rose-50 dark:bg-rose-950/30', border: 'border-rose-200 dark:border-rose-800/60', text: 'text-rose-700 dark:text-rose-300', headerBg: 'bg-rose-100 dark:bg-rose-900/50' },
  { id: 'blue', label: 'Синий', dot: 'bg-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200 dark:border-blue-800/60', text: 'text-blue-700 dark:text-blue-300', headerBg: 'bg-blue-100 dark:bg-blue-900/50' },
  { id: 'violet', label: 'Фиалка', dot: 'bg-violet-500', bg: 'bg-violet-50 dark:bg-violet-950/30', border: 'border-violet-200 dark:border-violet-800/60', text: 'text-violet-700 dark:text-violet-300', headerBg: 'bg-violet-100 dark:bg-violet-900/50' },
  { id: 'teal', label: 'Бирюза', dot: 'bg-teal-500', bg: 'bg-teal-50 dark:bg-teal-950/30', border: 'border-teal-200 dark:border-teal-800/60', text: 'text-teal-700 dark:text-teal-300', headerBg: 'bg-teal-100 dark:bg-teal-900/50' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadNotesList(): QuickNote[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (n: QuickNote) => n.id && typeof n.text === 'string' && n.color && n.updatedAt
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

function formatTimestamp(iso: string): string {
  if (!iso) return ''
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)

  if (diffMin < 1) return 'Только что'
  if (diffMin < 60) return `${diffMin} мин. назад`

  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  })
}

function formatDate(iso: string): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// ─── Component ────────────────────────────────────────────────────────────────

export default memo(function QuickNotesWidget() {
  const [mounted, setMounted] = useState(false)
  const [notes, setNotes] = useState<QuickNote[]>([])
  const [editingNote, setEditingNote] = useState<QuickNote | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editText, setEditText] = useState('')
  const [editColor, setEditColor] = useState<NoteColor>('emerald')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [saveFlash, setSaveFlash] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const confirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Initialize notes from localStorage ──────────────────────────────────
  const [initializedNotes, setInitializedNotes] = useState(false)
  useEffect(() => {
    if (!initializedNotes) {
      const stored = loadNotesList()
      // Migrate old notes that lack title
      const migrated = stored.map((n) => ({
        ...n,
        title: n.title || '',
        createdAt: n.createdAt || n.updatedAt,
      }))
      const id = setTimeout(() => {
        setNotes(migrated)
        setInitializedNotes(true)
        setMounted(true)
      }, 0)
      // Clean up old storage keys
      try {
        localStorage.removeItem('unilife_quick_notes_list')
        localStorage.removeItem('unilife-quick-notes')
      } catch { /* ignore */ }
      return () => clearTimeout(id)
    }
  }, [initializedNotes])

  // ── Persist notes to localStorage ─────────────────────────────────────
  useEffect(() => {
    if (mounted) {
      saveNotesList(notes)
    }
  }, [notes, mounted])

  // ── Cleanup timers on unmount ──────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current)
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
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

  // ── Focus title input when editing starts ───────────────────────────────
  useEffect(() => {
    if (editingNote && titleInputRef.current) {
      titleInputRef.current.focus()
    }
  }, [editingNote])

  // ── Create new note ────────────────────────────────────────────────────
  const handleNewNote = useCallback(() => {
    const newNote: QuickNote = {
      id: `note-${Date.now()}`,
      title: '',
      text: '',
      color: NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)].id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setNotes((prev) => [newNote, ...prev])
    setEditingNote(newNote)
    setEditTitle('')
    setEditText('')
    setEditColor(newNote.color)
    setShowSearch(false)
    setSearchQuery('')
  }, [])

  // ── Edit existing note ─────────────────────────────────────────────────
  const handleEditNote = useCallback((note: QuickNote) => {
    setEditingNote(note)
    setEditTitle(note.title)
    setEditText(note.text)
    setEditColor(note.color)
    setShowSearch(false)
    setSearchQuery('')
  }, [])

  // ── Save note (on blur or button) ──────────────────────────────────────
  const handleSave = useCallback(() => {
    if (!editingNote) return
    const trimmedText = editText.trim()
    const trimmedTitle = editTitle.trim()

    if (!trimmedText && !trimmedTitle) {
      // Remove empty note
      setNotes((prev) => prev.filter((n) => n.id !== editingNote.id))
      setEditingNote(null)
      toast.info('Пустая заметка удалена')
      return
    }

    const now = new Date().toISOString()
    setNotes((prev) =>
      prev.map((n) =>
        n.id === editingNote.id
          ? { ...n, title: trimmedTitle, text: trimmedText, color: editColor, updatedAt: now }
          : n
      )
    )
    setSaveFlash(true)
    setTimeout(() => setSaveFlash(false), 800)
    setTimeout(() => setEditingNote(null), 200)
  }, [editingNote, editTitle, editText, editColor])

  // ── Delete note ────────────────────────────────────────────────────────
  const handleDelete = useCallback((noteId: string) => {
    if (confirmDeleteId !== noteId) {
      setConfirmDeleteId(noteId)
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current)
      confirmTimerRef.current = setTimeout(() => setConfirmDeleteId(null), 3000)
      return
    }
    if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current)
    setNotes((prev) => prev.filter((n) => n.id !== noteId))
    if (editingNote && editingNote.id === noteId) {
      setEditingNote(null)
      setEditText('')
    }
    setConfirmDeleteId(null)
    toast.success('Заметка удалена')
  }, [confirmDeleteId, editingNote])

  // ── Cancel editing ─────────────────────────────────────────────────────
  const handleCancel = useCallback(() => {
    if (editingNote) {
      const note = notes.find((n) => n.id === editingNote.id)
      if (note && !note.text.trim() && !note.title.trim()) {
        setNotes((prev) => prev.filter((n) => n.id !== editingNote.id))
      }
    }
    setEditingNote(null)
    setEditText('')
  }, [editingNote, notes])

  // ── Debounced auto-save while typing ────────────────────────────────────
  const handleTextChange = useCallback(
    (value: string) => {
      const truncated = value.slice(0, MAX_CHARS)
      setEditText(truncated)
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = setTimeout(() => {
        if (!editingNote) return
        const now = new Date().toISOString()
        setNotes((prev) =>
          prev.map((n) =>
            n.id === editingNote.id
              ? { ...n, text: truncated, updatedAt: now }
              : n
          )
        )
      }, 500)
    },
    [editingNote]
  )

  const handleTitleChange = useCallback(
    (value: string) => {
      const truncated = value.slice(0, 80)
      setEditTitle(truncated)
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = setTimeout(() => {
        if (!editingNote) return
        const now = new Date().toISOString()
        setNotes((prev) =>
          prev.map((n) =>
            n.id === editingNote.id
              ? { ...n, title: truncated, updatedAt: now }
              : n
          )
        )
      }, 500)
    },
    [editingNote]
  )

  // ── Filtered notes ─────────────────────────────────────────────────────
  const filteredNotes = useMemo(() => {
    let result = notes
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) || n.text.toLowerCase().includes(q)
      )
    }
    // Sort by most recently edited
    return [...result].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  }, [notes, searchQuery])

  const colorConfig = NOTE_COLORS.find((c) => c.id === editColor) ?? NOTE_COLORS[0]
  const charCount = editText.length

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
  if (editingNote) {
    return (
      <Card className="animate-slide-up card-hover glass-card rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/40">
              <FileEdit className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </div>
            {editingNote.title || editingNote.text ? 'Редактирование' : 'Новая заметка'}
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

          {/* Title input */}
          <Input
            ref={titleInputRef}
            value={editTitle}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Заголовок..."
            className="h-8 text-sm font-medium border-0 border-b rounded-none px-0 focus-visible:ring-0"
            maxLength={80}
          />

          {/* Textarea */}
          <Textarea
            ref={textareaRef}
            value={editText}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Запишите здесь важную мысль..."
            className="max-h-32 min-h-[72px] resize-none text-sm leading-relaxed border-0 shadow-none focus-visible:ring-0"
            rows={3}
          />

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
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // ── View mode ─────────────────────────────────────────────────────────
  return (
    <Card className="animate-slide-up card-hover glass-card rounded-xl">
      {/* Gradient accent bar at top */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-violet-400 to-purple-500 rounded-t-xl" />
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/40">
            <FileEdit className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          </div>
          Быстрые заметки
          {/* Note count badge */}
          {notes.length > 0 && (
            <Badge variant="secondary" className="tabular-nums text-[10px] font-semibold">
              {notes.length}/{MAX_NOTES}
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
            {notes.length < MAX_NOTES && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleNewNote}
                aria-label="Новая заметка"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* ── Search bar ── */}
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

        {/* ── Notes Grid ── */}
        <div className="max-h-72 overflow-y-auto custom-scrollbar space-y-2 pr-1">
          {filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              {notes.length === 0 ? (
                <>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-400/20 to-purple-400/20">
                    <FileEdit className="h-5 w-5 text-violet-400/60" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Нет заметок
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground/60">
                    Максимум {MAX_NOTES} заметок
                  </p>
                  {notes.length < MAX_NOTES && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 h-7 gap-1 text-[11px]"
                      onClick={handleNewNote}
                    >
                      <Plus className="h-3 w-3" />
                      Создать
                    </Button>
                  )}
                </>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Ничего не найдено
                </p>
              )}
            </div>
          ) : (
            <div className="stagger-children grid grid-cols-2 gap-2">
              {filteredNotes.map((note) => {
                const nc = NOTE_COLORS.find((c) => c.id === note.color) ?? NOTE_COLORS[0]
                const isConfirming = confirmDeleteId === note.id

                return (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      'card-hover group relative rounded-lg border bg-card/60 p-3 cursor-pointer transition-all duration-200 hover:shadow-md',
                      nc.border,
                      nc.bg
                    )}
                    onClick={() => handleEditNote(note)}
                  >
                    {/* Color dot */}
                    <div className={cn('absolute right-2.5 top-2.5 h-2 w-2 rounded-full opacity-40 group-hover:opacity-70 transition-opacity', nc.dot)} />

                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(note.id)
                      }}
                      className={cn(
                        'absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110',
                        isConfirming
                          ? 'bg-destructive text-destructive-foreground opacity-100'
                          : 'text-muted-foreground/50 hover:text-destructive'
                      )}
                      aria-label="Удалить"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>

                    {/* Title */}
                    {note.title && (
                      <h4 className={cn('text-xs font-semibold truncate pr-5 leading-snug', nc.text)}>
                        {note.title}
                      </h4>
                    )}

                    {/* Content preview */}
                    <p className={cn(
                      'mt-1 text-[11px] leading-relaxed text-foreground/70 pr-4 line-clamp-3 break-words',
                      !note.title && 'font-medium'
                    )}>
                      {note.text}
                    </p>

                    {/* Footer */}
                    <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground/50">
                      <Clock className="h-2.5 w-2.5" />
                      <span className="tabular-nums">{formatTimestamp(note.updatedAt)}</span>
                    </div>

                    {/* Confirm delete tooltip */}
                    {isConfirming && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute left-1/2 -translate-x-1/2 -bottom-6 z-10 rounded-md bg-destructive px-2 py-0.5 text-[10px] font-medium text-destructive-foreground whitespace-nowrap shadow-sm"
                      >
                        Нажмите ещё раз
                      </motion.div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Max notes info ── */}
        {notes.length >= MAX_NOTES && (
          <p className="text-center text-[11px] text-muted-foreground/60">
            Достигнут лимит в {MAX_NOTES} заметок
          </p>
        )}
      </CardContent>
    </Card>
  )
})
