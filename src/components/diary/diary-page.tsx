'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { safeJson } from '@/lib/safe-fetch'
import {
  BookOpen,
  Plus,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  CalendarDays,
  List,
  Star,
  Tag,
  X,
  Clock,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'

// ─── Constants ────────────────────────────────────────────────────────────────

const RU_DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const RU_MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
]

const MOOD_EMOJI: Record<number, string> = {
  1: '😢',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😄',
}

const MOOD_LABELS: Record<number, string> = {
  1: 'Ужасно',
  2: 'Плохо',
  3: 'Нормально',
  4: 'Хорошо',
  5: 'Отлично',
}

const MOOD_COLORS: Record<number, string> = {
  1: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  2: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  3: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300',
  4: 'bg-lime-100 text-lime-700 dark:bg-lime-950 dark:text-lime-300',
  5: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
}

const MOOD_DOT_COLORS: Record<number, string> = {
  1: 'bg-red-400',
  2: 'bg-orange-400',
  3: 'bg-yellow-400',
  4: 'bg-lime-400',
  5: 'bg-emerald-400',
}

const MOOD_BORDER_CLASS: Record<number, string> = {
  1: 'mood-border-1',
  2: 'mood-border-2',
  3: 'mood-border-3',
  4: 'mood-border-4',
  5: 'mood-border-5',
}

const MOOD_GRADIENT: Record<number, string> = {
  1: 'from-red-50/30 to-transparent dark:from-red-950/20',
  2: 'from-orange-50/30 to-transparent dark:from-orange-950/20',
  3: 'from-yellow-50/30 to-transparent dark:from-yellow-950/20',
  4: 'from-lime-50/30 to-transparent dark:from-lime-950/20',
  5: 'from-emerald-50/30 to-transparent dark:from-emerald-950/20',
}

const TAG_COLORS = [
  'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
  'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
  'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
  'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
  'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300',
  'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300',
]

const QUICK_TEMPLATES = [
  { label: 'Рабочий день', emoji: '💼', content: 'Сегодняшний рабочий день был насыщенным. ' },
  { label: 'Выходной', emoji: '🌴', content: 'Отличный выходной день! ' },
  { label: 'Спорт', emoji: '🏋️', content: 'Сегодня тренировался. ' },
]

// ─── Types ────────────────────────────────────────────────────────────────────

interface DiaryEntry {
  id: string
  userId: string
  date: string
  title: string | null
  content: string
  mood: number | null
  photos: string[]
  tags: string[]
  createdAt: string
  updatedAt: string
}

interface EntryFormData {
  title: string
  content: string
  mood: number
  date: Date
  tags: string[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay()
  // Convert Sunday=0 to Monday-based: Mon=0, Tue=1, ..., Sun=6
  return day === 0 ? 6 : day - 1
}

function formatDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

function parseEntryDate(dateStr: string): Date {
  return parseISO(dateStr)
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function readingTimeMinutes(wordCount: number): string {
  const mins = Math.max(1, Math.ceil(wordCount / 200))
  const lastDigit = mins % 10
  const lastTwo = mins % 100
  if (lastTwo >= 11 && lastTwo <= 19) return `${mins} минут`
  if (lastDigit === 1) return `${mins} минута`
  if (lastDigit >= 2 && lastDigit <= 4) return `${mins} минуты`
  return `${mins} минут`
}

const emptyForm: EntryFormData = {
  title: '',
  content: '',
  mood: 3,
  date: new Date(),
  tags: [],
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DiaryPage() {
  // State
  const today = useMemo(() => new Date(), [])
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null)
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState<EntryFormData>(emptyForm)
  const [tagInput, setTagInput] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set())
  const [weekFilterDate, setWeekFilterDate] = useState<Date | null>(null)

  const toggleExpanded = (entryId: string) => {
    setExpandedEntries((prev) => {
      const next = new Set(prev)
      if (next.has(entryId)) {
        next.delete(entryId)
      } else {
        next.add(entryId)
      }
      return next
    })
  }

  // ─── Data Fetching ───────────────────────────────────────────────────────

  const fetchEntries = useCallback(async () => {
    setIsLoading(true)
    try {
      const monthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`
      const res = await fetch(`/api/diary?month=${monthStr}`)
      const json = await safeJson(res)
      if (json && json.data) {
        setEntries(json.data)
      }
    } catch (err) {
      console.error('Failed to fetch diary entries:', err)
    } finally {
      setIsLoading(false)
    }
  }, [currentYear, currentMonth])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  // ─── Derived State ───────────────────────────────────────────────────────

  // Today's mood from existing entries
  const todayMood = useMemo(() => {
    const todayKey = formatDateKey(today)
    const todayEntries = entries.filter((e) => formatDateKey(parseEntryDate(e.date)) === todayKey)
    if (todayEntries.length === 0) return null
    return todayEntries[0].mood
  }, [entries, today])

  // Map of date key -> array of entries
  const entriesByDate = useMemo(() => {
    const map = new Map<string, DiaryEntry[]>()
    for (const entry of entries) {
      const key = formatDateKey(parseEntryDate(entry.date))
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(entry)
    }
    return map
  }, [entries])

  // Calendar grid data
  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth)
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth)
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth)

    const cells: { day: number; month: 'prev' | 'current' | 'next'; date: Date }[] = []

    // Previous month trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i
      cells.push({
        day,
        month: 'prev',
        date: new Date(prevYear, prevMonth, day),
      })
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({
        day: d,
        month: 'current',
        date: new Date(currentYear, currentMonth, d),
      })
    }

    // Next month leading days (fill to 42 = 6 rows)
    const remaining = 42 - cells.length
    for (let d = 1; d <= remaining; d++) {
      cells.push({
        day: d,
        month: 'next',
        date: new Date(currentYear, currentMonth + 1, d),
      })
    }

    return cells
  }, [currentYear, currentMonth])

  // Entries for the selected date
  const entriesForSelectedDate = useMemo(() => {
    if (!selectedDate) return []
    const key = formatDateKey(selectedDate)
    return entriesByDate.get(key) || []
  }, [selectedDate, entriesByDate])

  // ─── Handlers ───────────────────────────────────────────────────────────

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear((y) => y - 1)
    } else {
      setCurrentMonth((m) => m - 1)
    }
    setSelectedDate(null)
    setSelectedEntry(null)
  }

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear((y) => y + 1)
    } else {
      setCurrentMonth((m) => m + 1)
    }
    setSelectedDate(null)
    setSelectedEntry(null)
  }

  const handleDayClick = (cell: { day: number; month: string; date: Date }) => {
    setSelectedDate(cell.date)
    const key = formatDateKey(cell.date)
    const dayEntries = entriesByDate.get(key)
    if (dayEntries && dayEntries.length > 0) {
      setSelectedEntry(dayEntries[0])
    } else {
      setSelectedEntry(null)
    }
  }

  const openNewEntryDialog = () => {
    setForm({
      ...emptyForm,
      date: selectedDate || today,
    })
    setTagInput('')
    setShowNewDialog(true)
  }

  const openEditDialog = () => {
    if (!selectedEntry) return
    setForm({
      title: selectedEntry.title || '',
      content: selectedEntry.content,
      mood: selectedEntry.mood || 3,
      date: parseEntryDate(selectedEntry.date),
      tags: [...selectedEntry.tags],
    })
    setTagInput('')
    setShowEditDialog(true)
  }

  const addTag = () => {
    const tag = tagInput.trim()
    if (tag && !form.tags.includes(tag)) {
      setForm((f) => ({ ...f, tags: [...f.tags, tag] }))
    }
    setTagInput('')
  }

  const removeTag = (tag: string) => {
    setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }))
  }

  const applyTemplate = (template: typeof QUICK_TEMPLATES[number]) => {
    setForm((f) => ({
      ...f,
      content: f.content ? f.content + template.content : template.content,
      title: f.title || template.label,
    }))
  }

  const handleSubmitNew = async () => {
    if (!form.content.trim()) return
    setIsSubmitting(true)
    toast.dismiss()
    try {
      const res = await fetch('/api/diary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title || undefined,
          content: form.content,
          mood: form.mood,
          date: form.date.toISOString(),
          tags: form.tags.length > 0 ? form.tags : undefined,
        }),
      })
      if (res.ok) {
        toast.success('Запись добавлена в дневник')
        setShowNewDialog(false)
        fetchEntries()
      } else {
        toast.error('Ошибка при создании записи')
      }
    } catch (err) {
      console.error('Failed to create entry:', err)
      toast.error('Ошибка: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitEdit = async () => {
    if (!selectedEntry || !form.content.trim()) return
    setIsSubmitting(true)
    toast.dismiss()
    try {
      const res = await fetch(`/api/diary/${selectedEntry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title || undefined,
          content: form.content,
          mood: form.mood,
          date: form.date.toISOString(),
          tags: form.tags.length > 0 ? form.tags : undefined,
        }),
      })
      if (res.ok) {
        const json = await safeJson(res)
        const updated = json?.data
        if (updated) {
          setSelectedEntry(updated)
        }
        toast.success('Запись обновлена')
        setShowEditDialog(false)
        fetchEntries()
      } else {
        toast.error('Ошибка при обновлении записи')
      }
    } catch (err) {
      console.error('Failed to update entry:', err)
      toast.error('Ошибка: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedEntry) return
    setIsSubmitting(true)
    toast.dismiss()
    try {
      const res = await fetch(`/api/diary/${selectedEntry.id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast.success('Запись удалена')
        setShowDeleteDialog(false)
        setSelectedEntry(null)
        fetchEntries()
      } else {
        toast.error('Ошибка при удалении записи')
      }
    } catch (err) {
      console.error('Failed to delete entry:', err)
      toast.error('Ошибка: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleMoodClick = (value: number) => {
    setForm((f) => ({ ...f, mood: value }))
  }

  // Quick mood check: create/update today's entry with mood only
  const handleQuickMood = useCallback(async (mood: number) => {
    const todayKey = formatDateKey(today)
    const todayEntries = entries.filter((e) => formatDateKey(parseEntryDate(e.date)) === todayKey)
    toast.dismiss()
    try {
      if (todayEntries.length > 0) {
        // Update existing entry's mood
        const entry = todayEntries[0]
        const res = await fetch(`/api/diary/${entry.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: entry.title || undefined,
            content: entry.content,
            mood,
            date: entry.date,
            tags: entry.tags.length > 0 ? entry.tags : undefined,
          }),
        })
        if (res.ok) {
          toast.success(`Настроение обновлено: ${MOOD_EMOJI[mood]} ${MOOD_LABELS[mood]}`)
          fetchEntries()
        }
      } else {
        // Create new entry with mood
        const res = await fetch('/api/diary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: 'Быстрое настроение',
            mood,
            date: today.toISOString(),
          }),
        })
        if (res.ok) {
          toast.success(`Настроение: ${MOOD_EMOJI[mood]} ${MOOD_LABELS[mood]}`)
          fetchEntries()
        }
      }
    } catch {
      toast.error('Ошибка при сохранении настроения')
    }
  }, [entries, today, fetchEntries])

  // ─── Render Helpers ─────────────────────────────────────────────────────

  const renderMoodStars = (mood: number | null, interactive: boolean = false, onChange?: (v: number) => void) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((v) => (
          <button
            key={v}
            type="button"
            disabled={!interactive}
            onClick={() => onChange?.(v)}
            className={cn(
              'p-0.5 rounded transition-colors',
              interactive && 'hover:scale-110 cursor-pointer',
              !interactive && 'cursor-default'
            )}
          >
            <Star
              className={cn(
                'h-5 w-5 transition-colors',
                v <= (mood || 0)
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-none text-muted-foreground/30'
              )}
            />
          </button>
        ))}
      </div>
    )
  }

  // ─── Calendar View ──────────────────────────────────────────────────────

  const renderCalendarView = () => (
    <Card className="w-full">
      <CardContent className="p-4">
        {/* Day names header */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {RU_DAYS.map((day) => (
            <div
              key={day}
              className="h-8 flex items-center justify-center text-xs font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((cell, idx) => {
            const dateKey = formatDateKey(cell.date)
            const dayEntries = entriesByDate.get(dateKey)
            const hasEntries = dayEntries && dayEntries.length > 0
            const isToday =
              cell.date.getFullYear() === today.getFullYear() &&
              cell.date.getMonth() === today.getMonth() &&
              cell.date.getDate() === today.getDate()
            const isSelected =
              selectedDate &&
              cell.date.getFullYear() === selectedDate.getFullYear() &&
              cell.date.getMonth() === selectedDate.getMonth() &&
              cell.date.getDate() === selectedDate.getDate()
            const isCurrentMonth = cell.month === 'current'
            const primaryMood = hasEntries ? dayEntries![0].mood : null

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleDayClick(cell)}
                className={cn(
                  'h-12 w-full flex flex-col items-center justify-center rounded-lg text-sm relative transition-all',
                  !isCurrentMonth && 'text-muted-foreground/40',
                  isCurrentMonth && !isSelected && 'hover:bg-accent',
                  isSelected && 'bg-primary text-primary-foreground hover:bg-primary/90',
                  isToday && !isSelected && 'ring-2 ring-primary font-semibold',
                  hasEntries && !isSelected && 'bg-accent/50 hover:bg-primary/10'
                )}
              >
                <span className="text-sm">{cell.day}</span>
                {primaryMood && (
                  <div className="flex items-center gap-0.5 mt-0.5">
                    <div className={cn('h-1.5 w-1.5 rounded-full', MOOD_DOT_COLORS[primaryMood])} />
                  </div>
                )}
                {hasEntries && dayEntries!.length > 1 && (
                  <span className={cn(
                    'absolute -top-1 -right-1 text-[9px] font-bold rounded-full h-3.5 w-3.5 flex items-center justify-center',
                    isSelected
                      ? 'bg-primary-foreground text-primary'
                      : 'bg-primary text-primary-foreground'
                  )}>
                    {dayEntries!.length}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-3 mt-3 pt-3 border-t">
          {[1, 2, 3, 4, 5].map((m) => (
            <div key={m} className="flex items-center gap-1">
              <div className={cn('h-2 w-2 rounded-full', MOOD_DOT_COLORS[m])} />
              <span className="text-xs text-muted-foreground">{MOOD_EMOJI[m]}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  // ─── Entry List View ────────────────────────────────────────────────────

  const renderListView = () => {
    if (entries.length === 0) {
      return (
        <Card className="card-hover overflow-hidden animate-slide-up">
          <CardContent className="py-16 px-6 text-center">
            {/* Gradient icon background */}
            <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full">
              <div className="absolute h-24 w-24 rounded-full bg-gradient-to-br from-emerald-400/25 via-teal-400/15 to-primary/20" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400/30 to-teal-500/20 shadow-lg shadow-emerald-500/10 dark:shadow-emerald-500/5">
                <BookOpen className="h-8 w-8 text-emerald-500 dark:text-emerald-400" />
              </div>
            </div>
            <p className="text-foreground font-semibold text-lg mb-1.5">
              Начните записывать свои мысли
            </p>
            <p className="text-muted-foreground/70 text-sm max-w-xs mx-auto leading-relaxed">
              Дневник поможет вам отслеживать настроение, запоминать важные моменты и лучше понимать себя
            </p>
            <div className="flex items-center justify-center gap-3 mt-5">
              <Button
                size="sm"
                className="gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 shadow-sm shadow-emerald-500/20 hover:shadow-emerald-500/30"
                onClick={openNewEntryDialog}
              >
                <Plus className="h-4 w-4" />
                Новая запись
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="rounded-xl"
                onClick={() => handleQuickMood(4)}
              >
                <Sparkles className="h-4 w-4 mr-1" />
                Записать настроение
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="space-y-3">
        {entries.map((entry) => {
          const entryDate = parseEntryDate(entry.date)
          const moodClass = entry.mood ? MOOD_COLORS[entry.mood] : ''
          const moodBorder = entry.mood ? MOOD_BORDER_CLASS[entry.mood] : ''
          const moodGrad = entry.mood ? MOOD_GRADIENT[entry.mood] : ''
          const wordCount = countWords(entry.content)
          const isExpanded = expandedEntries.has(entry.id)
          const isLongContent = entry.content.length > 150

          return (
            <Card
              key={entry.id}
              className={cn(
                'card-hover rounded-xl border bg-card hover:shadow-sm transition cursor-pointer overflow-hidden',
                moodBorder,
                selectedEntry?.id === entry.id && 'ring-2 ring-primary/40'
              )}
              onClick={() => {
                setSelectedDate(entryDate)
                setSelectedEntry(entry)
              }}
            >
              {/* Subtle mood gradient background */}
              {entry.mood && (
                <div className={cn('absolute inset-0 bg-gradient-to-r pointer-events-none rounded-xl', moodGrad)} />
              )}
              <CardContent className="p-4 relative">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Date & mood */}
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-medium text-muted-foreground tabular-nums">
                        {format(entryDate, 'd MMMM, EEEE', { locale: ru })}
                      </span>
                      {entry.mood && (
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                            moodClass
                          )}
                        >
                          {MOOD_EMOJI[entry.mood]} {entry.mood}/5
                        </span>
                      )}
                      {/* Word count */}
                      <span className="text-xs text-muted-foreground/60 ml-auto tabular-nums">
                        {wordCount} слов
                      </span>
                    </div>

                    {/* Title */}
                    {entry.title && (
                      <h3 className="font-semibold text-sm mb-1 truncate">
                        {entry.title}
                      </h3>
                    )}

                    {/* Content preview */}
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {isLongContent && !isExpanded
                        ? entry.content.slice(0, 150) + '...'
                        : entry.content
                      }
                    </p>

                    {/* Show/hide toggle */}
                    {isLongContent && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleExpanded(entry.id)
                        }}
                        className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 mt-1.5 font-medium transition-colors"
                      >
                        {isExpanded ? (
                          <>
                            <EyeOff className="h-3 w-3" />
                            Свернуть
                          </>
                        ) : (
                          <>
                            <Eye className="h-3 w-3" />
                            Показать полностью
                          </>
                        )}
                      </button>
                    )}

                    {/* Tags */}
                    {entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {entry.tags.map((tag, tagIdx) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className={cn(
                              'text-xs rounded-full px-2.5 py-0 border-0',
                              TAG_COLORS[tagIdx % TAG_COLORS.length]
                            )}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Mood stars */}
                  <div className="flex-shrink-0">
                    {renderMoodStars(entry.mood)}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  // ─── Entry Detail Panel ─────────────────────────────────────────────────

  const renderEntryDetail = () => {
    if (!selectedDate) {
      return (
        <Card>
          <CardContent className="py-12 text-center">
            <CalendarDays className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground text-sm">
              Выберите день для просмотра записей
            </p>
          </CardContent>
        </Card>
      )
    }

    if (entriesForSelectedDate.length === 0) {
      return (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground text-sm mb-1">
              Нет записей за{' '}
              <span className="font-medium">
                {format(selectedDate, 'd MMMM yyyy', { locale: ru })}
              </span>
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={openNewEntryDialog}
              className="mt-3"
            >
              <Plus className="h-4 w-4 mr-1" />
              Добавить запись
            </Button>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="space-y-3">
        {entriesForSelectedDate.map((entry) => {
          const isSelected = selectedEntry?.id === entry.id
          const moodClass = entry.mood ? MOOD_COLORS[entry.mood] : ''
          const moodBorder = entry.mood ? MOOD_BORDER_CLASS[entry.mood] : ''
          const moodGrad = entry.mood ? MOOD_GRADIENT[entry.mood] : ''
          const wordCount = countWords(entry.content)

          return (
            <Card
              key={entry.id}
              className={cn(
                'card-hover rounded-xl border bg-card transition overflow-hidden',
                moodBorder,
                isSelected && 'ring-2 ring-primary/40'
              )}
              onClick={() => setSelectedEntry(entry)}
            >
              {entry.mood && (
                <div className={cn('absolute inset-0 bg-gradient-to-r pointer-events-none rounded-xl', moodGrad)} />
              )}
              <CardHeader className="pb-3 relative">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-xl font-bold">
                      {entry.title || 'Без заголовка'}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-muted-foreground tabular-nums">
                        {format(parseEntryDate(entry.date), 'd MMMM yyyy, HH:mm', { locale: ru })}
                      </p>
                      <span className="text-xs text-muted-foreground/50">•</span>
                      <span className="text-xs text-muted-foreground/60 tabular-nums flex items-center gap-0.5">
                        <Clock className="h-3 w-3" />
                        {readingTimeMinutes(wordCount)} чтения
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {entry.mood && (
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-medium',
                          moodClass
                        )}
                      >
                        {MOOD_EMOJI[entry.mood]}
                      </span>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedEntry(entry)
                        openEditDialog()
                      }}
                      className="h-7 px-2"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3 relative">
                {/* Mood stars */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Настроение:</span>
                  {renderMoodStars(entry.mood)}
                  {entry.mood && (
                    <span className="text-xs text-muted-foreground ml-1">
                      {MOOD_LABELS[entry.mood]}
                    </span>
                  )}
                </div>

                <Separator />

                {/* Content */}
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {entry.content}
                </div>

                {/* Word count */}
                <p className="text-xs text-muted-foreground/50 tabular-nums">
                  {wordCount} слов
                </p>

                {/* Tags */}
                {entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {entry.tags.map((tag, tagIdx) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className={cn(
                          'text-xs rounded-full px-2.5 py-0 border-0 cursor-pointer hover:opacity-80 transition-opacity',
                          TAG_COLORS[tagIdx % TAG_COLORS.length]
                        )}
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <Separator />
                <div className="flex items-center justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedEntry(entry)
                      openEditDialog()
                    }}
                  >
                    <Edit className="h-3.5 w-3.5 mr-1.5" />
                    Редактировать
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedEntry(entry)
                      setShowDeleteDialog(true)
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                    Удалить
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  // ─── New/Edit Dialog ────────────────────────────────────────────────────

  const renderEntryDialog = (
    open: boolean,
    onOpenChange: (open: boolean) => void,
    title: string,
    onSubmit: () => void,
    isNew: boolean
  ) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isNew ? (
              <>
                <Plus className="h-5 w-5" />
                Новая запись
              </>
            ) : (
              <>
                <Edit className="h-5 w-5" />
                Редактирование записи
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Quick templates (new entry only) */}
          {isNew && (
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Быстрая запись
              </label>
              <div className="flex flex-wrap gap-2">
                {QUICK_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.label}
                    type="button"
                    onClick={() => applyTemplate(tmpl)}
                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors"
                  >
                    <span>{tmpl.emoji}</span>
                    {tmpl.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Date picker */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Дата</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {format(form.date, 'd MMMM yyyy', { locale: ru })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={form.date}
                  onSelect={(d) => d && setForm((f) => ({ ...f, date: d }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Заголовок</label>
            <Input
              placeholder="Как прошел день?"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>

          {/* Mood selector — bigger, more visual */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Настроение</label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleMoodClick(m)}
                  className={cn(
                    'flex flex-col items-center gap-0.5 rounded-xl p-2.5 transition-all border-2 flex-1',
                    form.mood === m
                      ? cn('border-primary bg-primary/5 scale-105', MOOD_COLORS[m])
                      : 'border-transparent hover:bg-muted/50'
                  )}
                >
                  <span className={cn(
                    'text-2xl transition-transform',
                    form.mood === m && 'scale-110'
                  )}>
                    {MOOD_EMOJI[m]}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {MOOD_LABELS[m]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Содержание *</label>
              <span className="text-xs text-muted-foreground tabular-nums">
                {countWords(form.content)} слов · {form.content.length} символов
              </span>
            </div>
            <Textarea
              placeholder="Что хотите записать..."
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              rows={5}
              className="resize-none focus-glow"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Теги</label>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Добавить тег..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTag()
                  }
                }}
              />
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={addTag}
                disabled={!tagInput.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.tags.map((tag, tagIdx) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className={cn(
                      'text-xs rounded-full px-2.5 py-0 border-0 gap-1 pr-1',
                      TAG_COLORS[tagIdx % TAG_COLORS.length]
                    )}
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-0.5 rounded-full hover:bg-foreground/10 p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Отмена
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isSubmitting || !form.content.trim()}
          >
            {isSubmitting ? 'Сохранение...' : isNew ? 'Создать' : 'Сохранить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  // ─── Delete Confirmation Dialog ─────────────────────────────────────────

  const renderDeleteDialog = () => (
    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Удалить запись?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Это действие нельзя отменить. Запись будет удалена навсегда.
        </p>
        {selectedEntry && (
          <Card className="bg-muted/50">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">
                {format(parseEntryDate(selectedEntry.date), 'd MMMM yyyy', { locale: ru })}
              </p>
              <p className="text-sm font-medium truncate">
                {selectedEntry.title || selectedEntry.content.slice(0, 60)}
              </p>
            </CardContent>
          </Card>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setShowDeleteDialog(false)}
            disabled={isSubmitting}
          >
            Отмена
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Удаление...' : 'Удалить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  // ─── Main Render ────────────────────────────────────────────────────────

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div className="relative overflow-hidden">
        {/* Decorative gradient blobs */}
        <div className="pointer-events-none absolute -top-10 -left-10 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -top-4 right-20 h-24 w-24 rounded-full bg-gradient-to-br from-amber-400/15 to-orange-500/15 blur-3xl" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <BookOpen className="h-6 w-6" />
                Дневник
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-muted-foreground">
                  Записывайте мысли, отслеживайте настроение
                </p>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  <CalendarDays className="h-3 w-3" />
                  {format(today, 'd MMMM, EEEE', { locale: ru })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex items-center border rounded-lg overflow-hidden">
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('calendar')}
                className="rounded-none px-3"
              >
                <CalendarDays className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-none px-3"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {/* New entry button */}
            <Button onClick={openNewEntryDialog} size="sm">
              <Plus className="h-4 w-4 mr-1.5" />
              Запись
            </Button>
          </div>
        </div>
      </div>

      {/* ── Weekly Calendar Strip ────────────────────────────────────── */}
      <Card className="rounded-xl border overflow-hidden">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Эта неделя</span>
            {weekFilterDate && (
              <button
                type="button"
                onClick={() => setWeekFilterDate(null)}
                className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Все дни
              </button>
            )}
          </div>
          <div className="flex items-center justify-between gap-1">
            {/* Get Monday of this week */}
            {(() => {
              const todayDate = today
              const dayOfWeek = todayDate.getDay()
              const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
              const monday = new Date(todayDate)
              monday.setDate(todayDate.getDate() + mondayOffset)

              return Array.from({ length: 7 }).map((_, i) => {
                const d = new Date(monday)
                d.setDate(monday.getDate() + i)
                const dateKey = formatDateKey(d)
                const dayEntries = entriesByDate.get(dateKey)
                const hasEntries = dayEntries && dayEntries.length > 0
                const primaryMood = hasEntries ? dayEntries![0].mood : null
                const isToday =
                  d.getFullYear() === todayDate.getFullYear() &&
                  d.getMonth() === todayDate.getMonth() &&
                  d.getDate() === todayDate.getDate()
                const isSelected =
                  weekFilterDate &&
                  d.getFullYear() === weekFilterDate.getFullYear() &&
                  d.getMonth() === weekFilterDate.getMonth() &&
                  d.getDate() === weekFilterDate.getDate()

                return (
                  <button
                    key={dateKey}
                    type="button"
                    onClick={() => {
                      if (weekFilterDate && isSelected) {
                        setWeekFilterDate(null)
                      } else {
                        setWeekFilterDate(d)
                        setSelectedDate(d)
                        const dayEn = entriesByDate.get(dateKey)
                        if (dayEn && dayEn.length > 0) {
                          setSelectedEntry(dayEn[0])
                        } else {
                          setSelectedEntry(null)
                        }
                      }
                    }}
                    className={cn(
                      'flex flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 transition-all min-w-[42px]',
                      isToday && !isSelected && 'bg-primary/10 ring-1 ring-primary/30',
                      isSelected && 'bg-primary text-primary-foreground',
                      !isToday && !isSelected && 'hover:bg-accent'
                    )}
                  >
                    <span className={cn(
                      'text-[10px] font-medium',
                      isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    )}>
                      {RU_DAYS[i]}
                    </span>
                    <span className={cn(
                      'text-sm font-semibold tabular-nums',
                      isSelected ? 'text-primary-foreground' : ''
                    )}>
                      {d.getDate()}
                    </span>
                    {primaryMood && (
                      <span className="text-[10px] leading-none">{MOOD_EMOJI[primaryMood]}</span>
                    )}
                    {hasEntries && !primaryMood && (
                      <div className={cn(
                        'h-1.5 w-1.5 rounded-full',
                        isSelected ? 'bg-primary-foreground' : 'bg-primary'
                      )} />
                    )}
                  </button>
                )
              })
            })()}
          </div>
        </CardContent>
      </Card>

      {/* Quick Mood Check */}
      <Card className="card-hover rounded-xl border overflow-hidden">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className={cn(
                'flex h-12 w-12 items-center justify-center rounded-xl text-2xl',
                todayMood ? MOOD_COLORS[todayMood] : 'bg-muted'
              )}>
                {todayMood ? MOOD_EMOJI[todayMood] : '😶'}
              </div>
              <div>
                <p className="text-sm font-semibold">
                  {todayMood ? `Настроение: ${MOOD_LABELS[todayMood]}` : 'Как настроение сегодня?'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {todayMood ? 'Нажмите, чтобы изменить' : 'Выберите эмодзи ниже'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleQuickMood(m)}
                  className={cn(
                    'h-10 w-10 rounded-xl flex items-center justify-center text-xl transition-all duration-200',
                    'hover:scale-110 active-press',
                    todayMood === m
                      ? cn('ring-2 ring-offset-2 ring-primary scale-105', MOOD_COLORS[m])
                      : 'bg-muted/50 hover:bg-muted'
                  )}
                  title={MOOD_LABELS[m]}
                >
                  {MOOD_EMOJI[m]}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Month Navigation */}
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPrevMonth}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <h2 className="text-lg font-semibold">
              {RU_MONTHS[currentMonth]} {currentYear}
            </h2>

            <Button
              variant="ghost"
              size="icon"
              onClick={goToNextMonth}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-6 bg-muted rounded w-1/3" />
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 35 }).map((_, i) => (
                    <div key={i} className="h-10 bg-muted rounded-md" />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main content */}
      {!isLoading && (
        <div className="grid gap-6 lg:grid-cols-[1fr,1fr] stagger-children">
          {/* Left: Calendar or List */}
          <div className="space-y-4">
            {viewMode === 'calendar' ? renderCalendarView() : renderListView()}
          </div>

          {/* Right: Entry Detail */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                {selectedDate
                  ? format(selectedDate, 'd MMMM', { locale: ru })
                  : 'Детали'}
              </h3>
              {selectedDate && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={openNewEntryDialog}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Новая
                </Button>
              )}
            </div>
            {renderEntryDetail()}
          </div>
        </div>
      )}

      {/* Dialogs */}
      {renderEntryDialog(
        showNewDialog,
        setShowNewDialog,
        'Новая запись',
        handleSubmitNew,
        true
      )}
      {renderEntryDialog(
        showEditDialog,
        setShowEditDialog,
        'Редактирование записи',
        handleSubmitEdit,
        false
      )}
      {renderDeleteDialog()}
    </div>
  )
}
