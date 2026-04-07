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
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { MoodInsights } from './mood-insights'
import { WritingStatsWidget } from './writing-stats-widget'
import { WritingPrompts } from './writing-prompts'
import { WritingStreakBadge } from './writing-streak-badge'
import { WritingStreakCard } from './writing-streak-card'
import { useSectionConfig, SectionCustomizer, CustomizeButton, type SectionDef } from '@/components/shared'
import DashboardSection from '@/components/dashboard/dashboard-section'

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

  // ─── Section Config ───────────────────────────────────────────────────
  const diarySections: SectionDef[] = useMemo(() => [
    { id: 'streak-stats', title: 'Статистика и серия', icon: '🔥', defaultVisible: true, defaultOrder: 0 },
    { id: 'mood-insights', title: 'Аналитика настроения', icon: '😊', defaultVisible: true, defaultOrder: 1 },
    { id: 'prompts', title: 'Идеи для записи', icon: '💡', defaultVisible: true, defaultOrder: 2 },
    { id: 'week-strip', title: 'Неделя', icon: '📅', defaultVisible: true, defaultOrder: 3 },
    { id: 'quick-mood', title: 'Быстрое настроение', icon: '🎨', defaultVisible: true, defaultOrder: 4 },
  ], [])

  const { config, loaded, visibleOrder, toggleVisible, moveSection, resetConfig } = useSectionConfig('diary', diarySections)
  const [customizerOpen, setCustomizerOpen] = useState(false)

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
      const json = await safeJson<{ success?: boolean; data?: DiaryEntry[] }>(res)
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
        const json = await safeJson<{ success?: boolean; data?: DiaryEntry }>(res)
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
    <div className="space-y-6 animate-slide-up">
      <PageHeader
        icon={BookOpen}
        title="Дневник"
        description="Записывайте мысли, отслеживайте настроение"
        accent="amber"
        badge={
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            <CalendarDays className="h-3 w-3" />
            {format(today, 'd MMMM, EEEE', { locale: ru })}
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <CustomizeButton onClick={() => setCustomizerOpen(true)} />
            <div className="flex items-center border rounded-xl overflow-hidden">
              <Button variant={viewMode === 'calendar' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('calendar')} className="rounded-none px-3">
                <CalendarDays className="h-4 w-4" />
              </Button>
              <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('list')} className="rounded-none px-3">
                <List className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={openNewEntryDialog} size="sm" className="gap-1.5 shrink-0">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Запись</span>
            </Button>
          </div>
        }
        extra={
          !isLoading && entries.length > 0 && (
            <div className="mt-2 flex items-center gap-3">
              <MoodTrend entries={entries} today={today} className="flex-1" />
              <WritingStreakBadge entries={entries} today={today} />
            </div>
          )
        }
      />

      {/* Configurable Sections */}
      {loaded && visibleOrder.map(sectionId => {
        switch (sectionId) {
          case 'streak-stats':
            return (
              <DashboardSection key={sectionId} id={sectionId} title="Статистика и серия" icon={<span>🔥</span>}>
                <WritingStreakCard entries={entries} today={today} isLoading={isLoading} className="card-hover" />
                <WritingStatsWidget className="stagger-children" />
              </DashboardSection>
            )
          case 'mood-insights':
            return !isLoading && entries.length > 0 ? (
              <DashboardSection key={sectionId} id={sectionId} title="Аналитика настроения" icon={<span>😊</span>}>
                <MoodInsights entries={entries} today={today} className="card-hover" />
              </DashboardSection>
            ) : null
          case 'prompts':
            return (
              <DashboardSection key={sectionId} id={sectionId} title="Идеи для записи" icon={<span>💡</span>}>
                <WritingPrompts
                  className="card-hover"
                  onPromptClick={(prompt) => {
                    setForm({ ...emptyForm, date: selectedDate || today, content: prompt })
                    setTagInput('')
                    setShowNewDialog(true)
                  }}
                />
              </DashboardSection>
            )
          case 'week-strip':
            return (
              <DashboardSection key={sectionId} id={sectionId} title="Неделя" icon={<span>📅</span>}>
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
                          const isWeekend = i >= 5

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
                                'flex flex-col items-center gap-0.5 rounded-xl px-2 py-2 transition-all min-w-[42px] border border-transparent',
                                isToday && !isSelected && 'bg-primary/10 ring-2 ring-primary/30 border-primary/20',
                                isSelected && 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20',
                                !isToday && !isSelected && 'hover:bg-accent hover:border-accent',
                                isWeekend && !isToday && !isSelected && 'text-muted-foreground/80'
                              )}
                            >
                              <span className={cn(
                                'text-[10px] font-semibold uppercase tracking-wider',
                                isSelected ? 'text-primary-foreground/70' : isWeekend ? 'text-orange-500/70 dark:text-orange-400/50' : 'text-muted-foreground'
                              )}>
                                {RU_DAYS_SHORT[i]}
                              </span>
                              <span className={cn(
                                'text-sm font-bold tabular-nums',
                                isSelected ? 'text-primary-foreground' : isToday ? 'text-primary' : ''
                              )}>
                                {d.getDate()}
                              </span>
                              {primaryMood && (
                                <span className={cn(
                                  'text-xs leading-none transition-transform',
                                  isSelected && 'scale-110'
                                )}>{MOOD_EMOJI[primaryMood]}</span>
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
              </DashboardSection>
            )
          case 'quick-mood':
            return (
              <DashboardSection key={sectionId} id={sectionId} title="Быстрое настроение" icon={<span>🎨</span>}>
                <WeekMoodBar todayMood={todayMood} onQuickMood={handleQuickMood} />
              </DashboardSection>
            )
          default:
            return null
        }
      })}

      {/* Month Navigation */}
      <Card className="w-full rounded-xl">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={goToPrevMonth} className="h-8 w-8 rounded-lg">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-bold tracking-tight tabular-nums">
              {RU_MONTHS[currentMonth]} {currentYear}
            </h2>
            <Button variant="ghost" size="icon" onClick={goToNextMonth} className="h-8 w-8 rounded-lg">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid gap-6">
          <Card className="rounded-xl">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="skeleton-shimmer h-6 rounded w-1/3" />
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 35 }).map((_, i) => (
                    <div key={i} className="skeleton-shimmer h-10 rounded-md" />
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
                <Button size="sm" variant="ghost" onClick={openNewEntryDialog} className="rounded-lg">
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Новая
                </Button>
              )}
            </div>
            <EntryDetail
              selectedDate={selectedDate}
              entriesForSelectedDate={entriesForSelectedDate}
              selectedEntry={selectedEntry}
              allEntries={entries}
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
              onNavigateEntry={(entry) => {
                setSelectedDate(parseEntryDate(entry.date))
                setSelectedEntry(entry)
              }}
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
        entries={entries}
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
        entries={entries}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle>Удалить запись?</DialogTitle>
            <DialogDescription className="sr-only">Подтверждение удаления записи из дневника</DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Это действие нельзя отменить. Запись будет удалена навсегда.
          </p>
          {selectedEntry && (
            <Card className="bg-muted/50 rounded-xl">
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
              className="rounded-xl"
            >
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting}
              className="rounded-xl"
            >
              {isSubmitting ? 'Удаление...' : 'Удалить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Section Customizer Dialog */}
      <SectionCustomizer
        open={customizerOpen}
        onOpenChange={setCustomizerOpen}
        sections={diarySections}
        config={config}
        onToggle={toggleVisible}
        onMove={moveSection}
        onReset={resetConfig}
        moduleTitle="Дневник"
      />
    </div>
  )
}
