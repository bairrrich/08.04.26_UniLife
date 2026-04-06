'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Plus, Sparkles, Eye, EyeOff, FileText, Clock, CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { MOOD_COLORS, MOOD_BORDER_CLASS, MOOD_GRADIENT, MOOD_EMOJI, MOOD_LABELS, MOOD_DOT_COLORS, getRelativeTime, countWords, readingTimeMinutes } from '@/lib/format'
import { DiaryEntry } from './types'
import { TAG_COLORS, hashTagColor } from './constants'
import { MoodStars } from './mood-stars'
import { parseEntryDate } from './helpers'
import { SearchFilter } from './search-filter'
import { ExportEntry } from './export-entry'

// ─── Mood top border colors ──────────────────────────────────────────────────

const MOOD_TOP_BORDER_COLORS: Record<number, string> = {
  1: '#f43f5e', // rose-500
  2: '#f59e0b', // amber-500
  3: '#94a3b8', // slate-400
  4: '#84cc16', // lime-500
  5: '#10b981', // emerald-500
}

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
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all active-press rounded-xl"
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
        <Card className="card-hover rounded-xl overflow-hidden animate-fade-in">
          <CardContent className="relative flex flex-col items-center justify-center py-10 text-center">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-slate-300/60 to-slate-400/60 dark:from-slate-700/60 dark:to-slate-600/60 flex items-center justify-center mx-auto mb-4">
              <CalendarDays className="h-8 w-8 text-muted-foreground/60" />
            </div>
            <h3 className="text-sm font-semibold mb-1 text-muted-foreground">Нет записей за этот период</h3>
            <p className="text-xs text-muted-foreground/60 max-w-[200px] mx-auto">
              Попробуйте изменить фильтры или выбрать другой период
            </p>
          </CardContent>
        </Card>
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
          const wordCount = countWords(entry.content)
          const readTime = readingTimeMinutes(wordCount)

          return (
            <Card
              key={entry.id}
              className={cn(
                'card-hover rounded-xl border bg-card hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden relative',
                moodBorder,
                selectedEntry?.id === entry.id && 'ring-2 ring-primary/40'
              )}
              onClick={() => onEntryClick(entry)}
              style={{ borderTopWidth: '4px', borderTopColor: entry.mood ? MOOD_TOP_BORDER_COLORS[entry.mood] : 'transparent' }}
            >
              {/* Subtle mood gradient background */}
              {entry.mood && (
                <div className={cn('absolute inset-0 bg-gradient-to-r pointer-events-none rounded-xl', moodGrad)} />
              )}
              <CardContent className="p-4 relative">
                <div className="flex items-start gap-3">
                  {/* Left: Large mood emoji */}
                  <div className="flex-shrink-0 mt-0.5">
                    {entry.mood ? (
                      <div
                        className={cn(
                          'h-12 w-12 rounded-xl flex items-center justify-center text-3xl shadow-md transition-transform duration-200',
                          'group-hover:scale-110',
                          moodClass
                        )}
                      >
                        {MOOD_EMOJI[entry.mood]}
                      </div>
                    ) : (
                      <div className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground/40">
                        <BookOpen className="h-5 w-5" />
                      </div>
                    )}
                  </div>

                  {/* Middle: content */}
                  <div className="flex-1 min-w-0">
                    {/* Date & mood badge */}
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-medium text-muted-foreground tabular-nums">
                        {format(entryDate, 'd MMMM, EEEE', { locale: ru })}
                      </span>
                      {entry.mood && (
                        <Badge
                          variant="secondary"
                          className={cn(
                            'text-[10px] rounded-full px-1.5 py-0 font-medium border-0 shadow-sm',
                            moodClass
                          )}
                        >
                          {MOOD_LABELS[entry.mood]}
                        </Badge>
                      )}
                    </div>

                    {/* Time: relative + creation time */}
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground/50" />
                        <span className="text-[11px] text-muted-foreground/60">
                          {getRelativeTime(entry.createdAt)}
                        </span>
                      </div>
                      {entry.createdAt && (
                        <span className="text-[11px] text-muted-foreground/40 tabular-nums">
                          {format(new Date(entry.createdAt), 'HH:mm')}
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
                        ? entry.content.slice(0, 150).replace(/\s+\S*$/, '') + '...'
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
                    {entry.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {entry.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className={cn(
                              'text-xs rounded-full px-2.5 py-0.5 border-0 font-medium shadow-sm',
                              TAG_COLORS[hashTagColor(tag)]
                            )}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground/40 italic mt-2 block">Нет тегов</span>
                    )}

                    {/* Word count + reading time badge */}
                    <div className="flex items-center gap-2 mt-2.5">
                      <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground/60 border-dashed h-5 px-1.5 gap-1 tabular-nums rounded-full">
                        <FileText className="h-2.5 w-2.5" />
                        ~{wordCount} слов
                      </Badge>
                      <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground/60 border-dashed h-5 px-1.5 gap-1 tabular-nums rounded-full">
                        <BookOpen className="h-2.5 w-2.5" />
                        {readTime}
                      </Badge>
                    </div>
                  </div>

                  {/* Right side: mood stars + export */}
                  <div className="flex flex-col items-center gap-2 flex-shrink-0 pt-1">
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
