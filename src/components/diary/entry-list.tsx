'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Plus, Sparkles, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { MOOD_COLORS, MOOD_BORDER_CLASS, MOOD_GRADIENT, MOOD_EMOJI } from '@/lib/format'
import { DiaryEntry } from './types'
import { TAG_COLORS } from './constants'
import { MoodStars } from './mood-stars'
import { parseEntryDate, countWords } from './helpers'

interface EntryListProps {
  entries: DiaryEntry[]
  selectedEntry: DiaryEntry | null
  expandedEntries: Set<string>
  onEntryClick: (entry: DiaryEntry) => void
  onToggleExpanded: (entryId: string) => void
  onNewEntryClick: () => void
  onQuickMood: (mood: number) => void
}

export function EntryList({
  entries,
  selectedEntry,
  expandedEntries,
  onEntryClick,
  onToggleExpanded,
  onNewEntryClick,
  onQuickMood,
}: EntryListProps) {
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
              onClick={onNewEntryClick}
            >
              <Plus className="h-4 w-4" />
              Новая запись
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl"
              onClick={() => onQuickMood(4)}
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
            onClick={() => onEntryClick(entry)}
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
                        onToggleExpanded(entry.id)
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
                  <MoodStars mood={entry.mood} />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
