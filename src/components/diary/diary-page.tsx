'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { safeJson } from '@/lib/safe-fetch'
import {
  BookOpen,
  Plus,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  List,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { RU_DAYS_SHORT, RU_MONTHS, MOOD_EMOJI, MOOD_LABELS } from '@/lib/format'
import { DiaryEntry, EntryFormData, CalendarCell } from './types'
import { QUICK_TEMPLATES } from './constants'
import { formatDateKey, parseEntryDate } from './helpers'
import { CalendarView } from './calendar-view'
import { EntryList } from './entry-list'
import { EntryDetail } from './entry-detail'
import { EntryDialog } from './entry-dialog'
import { WeekMoodBar } from './week-mood-bar'
import { MoodTrend } from './mood-trend'

const emptyForm: EntryFormData = {
  title: '',
  content: '',
  mood: 3,
  date: new Date(),
  tags: [],
}

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

  // ─── Data Fetching ─────────────────────────────────────────────────────

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

  // ─── Derived State ─────────────────────────────────────────────────────

  const todayMood = useMemo(() => {
    const todayKey = formatDateKey(today)
    const todayEntries = entries.filter((e) => formatDateKey(parseEntryDate(e.date)) === todayKey)
    if (todayEntries.length === 0) return null
    return todayEntries[0].mood
  }, [entries, today])

  const entriesByDate = useMemo(() => {
    const map = new Map<string, DiaryEntry[]>()
    for (const entry of entries) {
      const key = formatDateKey(parseEntryDate(entry.date))
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(entry)
    }
    return map
  }, [entries])

  const entriesForSelectedDate = useMemo(() => {
    if (!selectedDate) return []
    const key = formatDateKey(selectedDate)
    return entriesByDate.get(key) || []
  }, [selectedDate, entriesByDate])

  // ─── Handlers ─────────────────────────────────────────────────────────

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

  const handleDayClick = (cell: CalendarCell) => {
    setSelectedDate(cell.date)
    const key = formatDateKey(cell.date)
    const dayEntries = entriesByDate.get(key)
    if (dayEntries && dayEntries.length > 0) {
      setSelectedEntry(dayEntries[0])
    } else {
      setSelectedEntry(null)
    }
  }

  const handleEntryClick = (entry: DiaryEntry) => {
    setSelectedDate(parseEntryDate(entry.date))
    setSelectedEntry(entry)
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
      content: f.content ? f.content + '\n\n' + template.content : template.content,
      title: f.title || ('title' in template && template.title ? template.title : template.label),
    }))
  }

  const handleMoodClick = (value: number) => {
    setForm((f) => ({ ...f, mood: value }))
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

  // Quick mood check: create/update today's entry with mood only
  const handleQuickMood = useCallback(async (mood: number) => {
    const todayKey = formatDateKey(today)
    const todayEntries = entries.filter((e) => formatDateKey(parseEntryDate(e.date)) === todayKey)
    toast.dismiss()
    try {
      if (todayEntries.length > 0) {
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

  // ─── Main Render ───────────────────────────────────────────────────────

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div className="relative overflow-hidden">
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
              {/* Mood Trend Mini Chart */}
              {!isLoading && entries.length > 0 && (
                <MoodTrend entries={entries} today={today} className="mt-2" />
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
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
            <Button onClick={openNewEntryDialog} size="sm">
              <Plus className="h-4 w-4 mr-1.5" />
              Запись
            </Button>
          </div>
        </div>
      </div>

      {/* Weekly Calendar Strip */}
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
                      {RU_DAYS_SHORT[i]}
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
      <WeekMoodBar todayMood={todayMood} onQuickMood={handleQuickMood} />

      {/* Month Navigation */}
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={goToPrevMonth} className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold">
              {RU_MONTHS[currentMonth]} {currentYear}
            </h2>
            <Button variant="ghost" size="icon" onClick={goToNextMonth} className="h-8 w-8">
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
          <div className="space-y-4">
            {viewMode === 'calendar' ? (
              <CalendarView
                currentYear={currentYear}
                currentMonth={currentMonth}
                today={today}
                selectedDate={selectedDate}
                entriesByDate={entriesByDate}
                onDayClick={handleDayClick}
              />
            ) : (
              <EntryList
                entries={entries}
                selectedEntry={selectedEntry}
                expandedEntries={expandedEntries}
                onEntryClick={handleEntryClick}
                onToggleExpanded={toggleExpanded}
                onNewEntryClick={openNewEntryDialog}
                onQuickMood={handleQuickMood}
              />
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                {selectedDate
                  ? format(selectedDate, 'd MMMM', { locale: ru })
                  : 'Детали'}
              </h3>
              {selectedDate && (
                <Button size="sm" variant="ghost" onClick={openNewEntryDialog}>
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Новая
                </Button>
              )}
            </div>
            <EntryDetail
              selectedDate={selectedDate}
              entriesForSelectedDate={entriesForSelectedDate}
              selectedEntry={selectedEntry}
              onEntrySelect={setSelectedEntry}
              onEditClick={(entry) => {
                setSelectedEntry(entry)
                openEditDialog()
              }}
              onDeleteClick={(entry) => {
                setSelectedEntry(entry)
                setShowDeleteDialog(true)
              }}
              onNewEntryClick={openNewEntryDialog}
            />
          </div>
        </div>
      )}

      {/* Dialogs */}
      <EntryDialog
        open={showNewDialog}
        onOpenChange={setShowNewDialog}
        form={form}
        tagInput={tagInput}
        isSubmitting={isSubmitting}
        isNew={true}
        onFormChange={setForm}
        onTagInputChange={setTagInput}
        onAddTag={addTag}
        onRemoveTag={removeTag}
        onMoodClick={handleMoodClick}
        onSubmit={handleSubmitNew}
        onApplyTemplate={applyTemplate}
      />
      <EntryDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        form={form}
        tagInput={tagInput}
        isSubmitting={isSubmitting}
        isNew={false}
        onFormChange={setForm}
        onTagInputChange={setTagInput}
        onAddTag={addTag}
        onRemoveTag={removeTag}
        onMoodClick={handleMoodClick}
        onSubmit={handleSubmitEdit}
        onApplyTemplate={applyTemplate}
      />

      {/* Delete Confirmation Dialog */}
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
    </div>
  )
}
