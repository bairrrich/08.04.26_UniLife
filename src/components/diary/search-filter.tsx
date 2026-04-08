'use client'

import { useState, useMemo, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Search, SlidersHorizontal, X, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MOOD_EMOJI, MOOD_LABELS } from '@/lib/format'
import { TAG_COLORS, hashTagColor } from './constants'
import { DiaryEntry } from './types'

interface SearchFilterProps {
  entries: DiaryEntry[]
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedMood: number | null
  onMoodChange: (mood: number | null) => void
  selectedTag: string | null
  onTagChange: (tag: string | null) => void
}

export function SearchFilter({
  entries,
  searchQuery,
  onSearchChange,
  selectedMood,
  onMoodChange,
  selectedTag,
  onTagChange,
}: SearchFilterProps) {
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Compute most-used tags from entries
  const topTags = useMemo(() => {
    const tagCount = new Map<string, number>()
    for (const entry of entries) {
      for (const tag of entry.tags) {
        tagCount.set(tag, (tagCount.get(tag) || 0) + 1)
      }
    }
    return Array.from(tagCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag]) => tag)
  }, [entries])

  // Check if any filter is active
  const hasActiveFilters = selectedMood !== null || selectedTag !== null || searchQuery.length > 0

  const clearAll = useCallback(() => {
    onSearchChange('')
    onMoodChange(null)
    onTagChange(null)
  }, [onSearchChange, onMoodChange, onTagChange])

  const moodOptions = [
    { value: 5, emoji: MOOD_EMOJI[5], label: MOOD_LABELS[5] },
    { value: 4, emoji: MOOD_EMOJI[4], label: MOOD_LABELS[4] },
    { value: 3, emoji: MOOD_EMOJI[3], label: MOOD_LABELS[3] },
    { value: 2, emoji: MOOD_EMOJI[2], label: MOOD_LABELS[2] },
    { value: 1, emoji: MOOD_EMOJI[1], label: MOOD_LABELS[1] },
  ]

  return (
    <div className="space-y-3">
      {/* Search bar row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
          <Input
            placeholder="Поиск по заголовку или содержимому..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-9 text-sm rounded-lg border-dashed focus:border-solid bg-muted/30"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFiltersOpen(!filtersOpen)}
          className={cn(
            'h-9 gap-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors',
            hasActiveFilters
              ? 'border-primary/40 text-primary bg-primary/5 hover:bg-primary/10'
              : 'text-muted-foreground'
          )}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Фильтры</span>
          {hasActiveFilters && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground px-1">
              {(selectedMood !== null ? 1 : 0) + (selectedTag !== null ? 1 : 0)}
            </span>
          )}
        </Button>
      </div>

      {/* Expandable filter panel */}
      <div
        className={cn(
          'grid transition-all duration-300 ease-in-out overflow-hidden',
          filtersOpen
            ? 'grid-rows-[1fr] opacity-100'
            : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="rounded-lg border border-dashed bg-muted/20 p-3 space-y-3">
            {/* Mood filter */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Настроение
                </span>
                {selectedMood !== null && (
                  <button
                    type="button"
                    onClick={() => onMoodChange(null)}
                    className="text-[10px] text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Сбросить
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => onMoodChange(null)}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all',
                    selectedMood === null
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                >
                  Все
                </button>
                {moodOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      onMoodChange(selectedMood === opt.value ? null : opt.value)
                    }
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all',
                      selectedMood === opt.value
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    )}
                    title={opt.label}
                  >
                    <span>{opt.emoji}</span>
                    <span className="hidden sm:inline">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tag filter */}
            {topTags.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Tag className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">
                      Теги
                    </span>
                  </div>
                  {selectedTag !== null && (
                    <button
                      type="button"
                      onClick={() => onTagChange(null)}
                      className="text-[10px] text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                      Сбросить
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {topTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      onClick={() =>
                        onTagChange(selectedTag === tag ? null : tag)
                      }
                      className={cn(
                        'text-xs rounded-full px-2.5 py-0.5 border-0 cursor-pointer transition-all hover:opacity-90',
                        TAG_COLORS[hashTagColor(tag)],
                        selectedTag === tag &&
                          'ring-1 ring-primary/50 ring-offset-1 ring-offset-background'
                      )}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Clear all */}
            {hasActiveFilters && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-[10px] text-muted-foreground hover:text-destructive font-medium transition-colors flex items-center gap-1"
                >
                  <X className="h-3 w-3" />
                  Очистить все фильтры
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
