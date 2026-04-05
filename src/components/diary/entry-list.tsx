'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Plus, Sparkles, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { MOOD_COLORS, MOOD_BORDER_CLASS, MOOD_GRADIENT, MOOD_EMOJI } from '@/lib/format'
import { DiaryEntry } from './types'
import { TAG_COLORS, hashTagColor } from './constants'
import { MoodStars } from './mood-stars'
import { parseEntryDate } from './helpers'
import { SearchFilter } from './search-filter'
import { WordCount } from './word-count'
import { ExportEntry } from './export-entry'

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
  // Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  // Filtered entries
  const filteredEntries = useMemo(() => {
    let result = entries

    // Search filter (by title or content)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (e) =>
          (e.title && e.title.toLowerCase().includes(q)) ||
          e.content.toLowerCase().includes(q)
      )
    }

    // Mood filter
    if (selectedMood !== null) {
      result = result.filter((e) => e.mood === selectedMood)
    }

    // Tag filter
    if (selectedTag !== null) {
      result = result.filter((e) => e.tags.includes(selectedTag))
    }

    return result
  }, [entries, searchQuery, selectedMood, selectedTag])

  // Empty state: no entries at all
  if (entries.length === 0) {
    return (
      <Card className="card-hover rounded-xl overflow-hidden animate-slide-up relative">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5 pointer-events-none" />
        <CardContent className="relative flex flex-col items-center justify-center py-12 text-center">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/25">
            <BookOpen className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-lg font-semibold mb-1">Дневник пуст</h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Начните записывать свои мысли и настроение каждый день
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <Button
              size="lg"
              onClick={onNewEntryClick}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all active-press"
            >
              <Plus className="h-5 w-5 mr-2" />
              Написать первую запись
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl"
              onClick={() => onQuickMood(4)}
            >
              <Sparkles className="h-4 w-4 mr-1" />
              Настроение
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {/* Search & Filter bar */}
      <SearchFilter
        entries={entries}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedMood={selectedMood}
        onMoodChange={setSelectedMood}
        selectedTag={selectedTag}
        onTagChange={setSelectedTag}
      />

      {/* No results after filtering */}
      {filteredEntries.length === 0 && entries.length > 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            Ничего не найдено по выбранным фильтрам
          </p>
        </div>
      )}

      {/* Entry cards */}
      <div className="space-y-3 stagger-children">
        {filteredEntries.map((entry) => {
          const entryDate = parseEntryDate(entry.date)
          const moodClass = entry.mood ? MOOD_COLORS[entry.mood] : ''
          const moodBorder = entry.mood ? MOOD_BORDER_CLASS[entry.mood] : ''
          const moodGrad = entry.mood ? MOOD_GRADIENT[entry.mood] : ''
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
                        {entry.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className={cn(
                              'text-xs rounded-full px-2.5 py-0 border-0',
                              TAG_COLORS[hashTagColor(tag)]
                            )}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Word count & reading time */}
                    <div className="mt-2">
                      <WordCount content={entry.content} />
                    </div>
                  </div>

                  {/* Right side: mood stars + export */}
                  <div className="flex flex-col items-center gap-2 flex-shrink-0">
                    <MoodStars mood={entry.mood} />
                    <ExportEntry entry={entry} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
