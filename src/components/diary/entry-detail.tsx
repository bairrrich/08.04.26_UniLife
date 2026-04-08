'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CalendarDays, BookOpen, Plus, Edit, Trash2, Tag, Clock, Copy, FileText, ChevronLeft, ChevronRight } from 'lucide-react'
import { AnimatedNumber } from '@/components/ui/animated-number'
import { toast } from 'sonner'
import { getRelativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { MOOD_COLORS, MOOD_BORDER_CLASS, MOOD_GRADIENT, MOOD_EMOJI, MOOD_LABELS } from '@/lib/format'
import { useMemo } from 'react'
import { DiaryEntry } from './types'
import { TAG_COLORS, hashTagColor } from './constants'
import { MoodStars } from './mood-stars'
import { parseEntryDate, countWords, readingTimeMinutes } from './helpers'

interface EntryDetailProps {
  selectedDate: Date | null
  entriesForSelectedDate: DiaryEntry[]
  selectedEntry: DiaryEntry | null
  allEntries: DiaryEntry[]
  onEntrySelect: (entry: DiaryEntry) => void
  onEditClick: (entry: DiaryEntry) => void
  onDeleteClick: (entry: DiaryEntry) => void
  onNewEntryClick: () => void
  onNavigateEntry: (entry: DiaryEntry) => void
}

export function EntryDetail({
  selectedDate,
  entriesForSelectedDate,
  selectedEntry,
  allEntries,
  onEntrySelect,
  onEditClick,
  onDeleteClick,
  onNewEntryClick,
  onNavigateEntry,
}: EntryDetailProps) {

  // Compute prev/next entries from sorted list
  const sortedEntries = useMemo(() => {
    return [...allEntries].sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      if (dateA !== dateB) return dateA - dateB
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    })
  }, [allEntries])

  const currentIndex = useMemo(() => {
    if (!selectedEntry) return -1
    return sortedEntries.findIndex((e) => e.id === selectedEntry.id)
  }, [sortedEntries, selectedEntry])

  const prevEntry = currentIndex > 0 ? sortedEntries[currentIndex - 1] : null
  const nextEntry = currentIndex < sortedEntries.length - 1 ? sortedEntries[currentIndex + 1] : null
  if (!selectedDate) {
    return (
      <Card className="rounded-xl">
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
      <Card className="rounded-xl">
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
            onClick={onNewEntryClick}
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
    <div className="space-y-3 stagger-children">
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
              'card-hover rounded-xl border bg-card transition overflow-hidden relative',
              moodBorder,
              isSelected && 'ring-2 ring-primary/40'
            )}
            onClick={() => onEntrySelect(entry)}
          >
            {entry.mood && (
              <div className={cn('absolute inset-0 bg-gradient-to-r pointer-events-none rounded-xl', moodGrad)} />
            )}
            {/* Subtle gradient header accent */}
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/5 via-primary/3 to-transparent pointer-events-none rounded-t-xl" />
            <CardHeader className="pb-3 relative">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-xl font-bold leading-tight">
                    {entry.title || 'Без заголовка'}
                  </CardTitle>
                  <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-1.5">
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {format(parseEntryDate(entry.date), 'd MMMM yyyy', { locale: ru })}
                    </span>
                    <span className="text-xs text-muted-foreground/50">•</span>
                    <span className="text-xs text-primary/70 font-medium">
                      {getRelativeTime(entry.createdAt)}
                    </span>
                    <span className="text-xs text-muted-foreground/50">•</span>
                    <span className="text-xs text-muted-foreground/60 tabular-nums flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {readingTimeMinutes(wordCount)}
                    </span>
                    <span className="text-xs text-muted-foreground/50">•</span>
                    <span className="text-xs text-muted-foreground/60 tabular-nums flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      <AnimatedNumber value={wordCount} duration={400} className="text-xs" />
                      {' слов'}
                    </span>
                  </div>
                </div>

                {/* Large prominent mood emoji */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {entry.mood && (
                    <div
                      className={cn(
                        'h-16 w-16 rounded-2xl flex items-center justify-center text-5xl shadow-lg transition-transform hover:scale-110',
                        moodClass,
                        isSelected && 'scale-105'
                      )}
                    >
                      {MOOD_EMOJI[entry.mood]}
                    </div>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEntrySelect(entry)
                      onEditClick(entry)
                    }}
                    className="h-8 px-2 rounded-lg"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0 space-y-3 relative">
              {/* Mood label + stars */}
              <div className="flex items-center gap-2">
                {entry.mood && (
                  <Badge
                    variant="secondary"
                    className={cn('text-xs rounded-full px-2.5 py-0.5 border-0 font-medium', moodClass)}
                  >
                    {MOOD_EMOJI[entry.mood]} {MOOD_LABELS[entry.mood]}
                  </Badge>
                )}
                <MoodStars mood={entry.mood} />
              </div>

              <Separator />

              {/* Content */}
              <div className="text-sm leading-[1.8] tracking-wide whitespace-pre-wrap text-foreground/90">
                {entry.content}
              </div>

              {/* Tags */}
              {entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {entry.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className={cn(
                        'text-xs rounded-full px-2.5 py-0.5 border-0 cursor-pointer hover:opacity-80 transition-opacity shadow-sm',
                        TAG_COLORS[hashTagColor(tag)]
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
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs rounded-lg"
                  onClick={(e) => {
                    e.stopPropagation()
                    const text = entry.content
                    navigator.clipboard.writeText(text).then(() => {
                      toast.success('Текст скопирован в буфер обмена')
                    }).catch(() => {
                      toast.error('Не удалось скопировать текст')
                    })
                  }}
                >
                  <Copy className="h-3.5 w-3.5 mr-1.5" />
                  Копировать текст
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-lg"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEntrySelect(entry)
                      onEditClick(entry)
                    }}
                  >
                    <Edit className="h-3.5 w-3.5 mr-1.5" />
                    Редактировать
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:text-destructive rounded-lg"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEntrySelect(entry)
                      onDeleteClick(entry)
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                    Удалить
                  </Button>
                </div>
              </div>

              {/* Entry navigation */}
              {(prevEntry || nextEntry) && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-1.5 text-xs text-muted-foreground hover:text-foreground rounded-lg"
                      disabled={!prevEntry}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (prevEntry) onNavigateEntry(prevEntry)
                      }}
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      Предыдущая
                    </Button>
                    <span className="text-[10px] text-muted-foreground/50 tabular-nums">
                      {currentIndex >= 0 ? `${currentIndex + 1} / ${sortedEntries.length}` : ''}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-1.5 text-xs text-muted-foreground hover:text-foreground rounded-lg"
                      disabled={!nextEntry}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (nextEntry) onNavigateEntry(nextEntry)
                      }}
                    >
                      Следующая
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
