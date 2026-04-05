'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CalendarDays, BookOpen, Plus, Edit, Trash2, Tag, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { MOOD_COLORS, MOOD_BORDER_CLASS, MOOD_GRADIENT, MOOD_EMOJI, MOOD_LABELS } from '@/lib/format'
import { DiaryEntry } from './types'
import { TAG_COLORS, hashTagColor } from './constants'
import { MoodStars } from './mood-stars'
import { parseEntryDate, countWords, readingTimeMinutes } from './helpers'

interface EntryDetailProps {
  selectedDate: Date | null
  entriesForSelectedDate: DiaryEntry[]
  selectedEntry: DiaryEntry | null
  onEntrySelect: (entry: DiaryEntry) => void
  onEditClick: (entry: DiaryEntry) => void
  onDeleteClick: (entry: DiaryEntry) => void
  onNewEntryClick: () => void
}

export function EntryDetail({
  selectedDate,
  entriesForSelectedDate,
  selectedEntry,
  onEntrySelect,
  onEditClick,
  onDeleteClick,
  onNewEntryClick,
}: EntryDetailProps) {
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
            onClick={() => onEntrySelect(entry)}
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
                      onEntrySelect(entry)
                      onEditClick(entry)
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
                <MoodStars mood={entry.mood} />
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

              {/* Word count & reading time */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground/50 tabular-nums">
                <span>{wordCount} слов</span>
                <span>≈ {readingTimeMinutes(wordCount)} чтения</span>
              </div>

              {/* Tags */}
              {entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {entry.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className={cn(
                        'text-xs rounded-full px-2.5 py-0 border-0 cursor-pointer hover:opacity-80 transition-opacity',
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
              <div className="flex items-center justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
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
                  className="text-destructive hover:text-destructive"
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
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
