'use client'

import React from 'react'
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
import { Calendar } from '@/components/ui/calendar'
import { CalendarDays, Plus, Edit, Sparkles, X, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { MOOD_COLORS, MOOD_EMOJI, MOOD_LABELS, countWords } from '@/lib/format'
import { EntryFormData, DiaryEntry } from './types'
import { TAG_COLORS, QUICK_TEMPLATES, hashTagColor } from './constants'

interface EntryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  form: EntryFormData
  tagInput: string
  isSubmitting: boolean
  isNew: boolean
  onFormChange: React.Dispatch<React.SetStateAction<EntryFormData>>
  onTagInputChange: (value: string) => void
  onAddTag: () => void
  onRemoveTag: (tag: string) => void
  onMoodClick: (value: number) => void
  onSubmit: () => void
  onApplyTemplate: (template: typeof QUICK_TEMPLATES[number]) => void
  entries?: DiaryEntry[]
}

export function EntryDialog({
  open,
  onOpenChange,
  form,
  tagInput,
  isSubmitting,
  isNew,
  onFormChange,
  onTagInputChange,
  onAddTag,
  onRemoveTag,
  onMoodClick,
  onSubmit,
  onApplyTemplate,
  entries = [],
}: EntryDialogProps) {
  // Compute suggested tags from existing entries
  const suggestedTags = React.useMemo(() => {
    const tagCount = new Map<string, number>()
    for (const entry of entries) {
      for (const tag of entry.tags) {
        tagCount.set(tag, (tagCount.get(tag) || 0) + 1)
      }
    }
    return Array.from(tagCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .filter(([tag]) => !form.tags.includes(tag))
      .map(([tag]) => tag)
  }, [entries, form.tags])
  return (
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
                    onClick={() => onApplyTemplate(tmpl)}
                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors active-press"
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
                  onSelect={(d) => d && onFormChange((f) => ({ ...f, date: d }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Заголовок</label>
              <span className="text-xs text-muted-foreground tabular-nums">
                {form.title.length}/100
              </span>
            </div>
            <Input
              placeholder="Как прошел день?"
              value={form.title}
              maxLength={100}
              onChange={(e) => onFormChange((f) => ({ ...f, title: e.target.value }))}
              className={cn(
                form.title.length > 90 && 'border-amber-400 focus-visible:ring-amber-400'
              )}
            />
          </div>

          {/* Mood selector — slider-style with track */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Настроение</label>
            <div className="mood-slider-track px-1 py-2">
              {[1, 2, 3, 4, 5].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => onMoodClick(m)}
                  className={cn(
                    'flex flex-col items-center gap-0.5 rounded-xl p-2 sm:p-2.5 transition-all flex-1 min-w-[52px]',
                    form.mood === m
                      ? cn('scale-110', MOOD_COLORS[m], 'shadow-sm')
                      : 'hover:bg-muted/50'
                  )}
                >
                  <span className={cn(
                    'text-2xl sm:text-3xl transition-transform duration-200',
                    form.mood === m && 'scale-110'
                  )}>
                    {MOOD_EMOJI[m]}
                  </span>
                  <span className={cn(
                    'text-[10px] font-medium transition-colors',
                    form.mood === m ? 'text-foreground' : 'text-muted-foreground'
                  )}>
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
              onChange={(e) => onFormChange((f) => ({ ...f, content: e.target.value }))}
              rows={5}
              maxLength={5000}
              className={cn(
                'resize-none focus-glow',
                form.content.length > 4500 && form.content.length < 4900 && 'border-amber-400 focus-visible:ring-amber-400',
                form.content.length >= 4900 && 'border-red-400 focus-visible:ring-red-400'
              )}
            />
            {/* Character limit warning */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {form.content.length > 4500 && form.content.length < 4900 && (
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-medium tabular-nums">
                    Осталось {5000 - form.content.length} символов
                  </span>
                )}
                {form.content.length >= 4900 && (
                  <span className="text-xs text-red-600 dark:text-red-400 font-medium tabular-nums animate-pulse-soft">
                    Осталось {5000 - form.content.length} символов
                  </span>
                )}
              </div>
              {/* Live word counter */}
              <span className="text-xs text-muted-foreground/60 tabular-nums flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {countWords(form.content)} слов
              </span>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Теги</label>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Теги через запятую..."
                value={tagInput}
                onChange={(e) => {
                  const val = e.target.value
                  // Auto-split on comma
                  if (val.includes(',')) {
                    const parts = val.split(',').map((t) => t.trim()).filter(Boolean)
                    for (const part of parts) {
                      if (part && !form.tags.includes(part)) {
                        onFormChange((f) => ({ ...f, tags: [...f.tags, part] }))
                      }
                    }
                    onTagInputChange('')
                  } else {
                    onTagInputChange(val)
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    onAddTag()
                  }
                }}
              />
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={onAddTag}
                disabled={!tagInput.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className={cn(
                      'text-xs rounded-full px-2.5 py-0 border-0 gap-1 pr-1',
                      TAG_COLORS[hashTagColor(tag)]
                    )}
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => onRemoveTag(tag)}
                      className="ml-0.5 rounded-full hover:bg-foreground/10 p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            {/* Suggested tags */}
            {suggestedTags.length > 0 && (
              <div className="mt-2">
                <span className="text-xs text-muted-foreground mb-1.5 block">Рекомендуемые:</span>
                <div className="flex flex-wrap gap-1.5">
                  {suggestedTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        onFormChange((f) => ({ ...f, tags: [...f.tags, tag] }))
                      }}
                      className={cn(
                        'text-xs rounded-full px-2.5 py-0.5 border border-dashed transition-all hover:border-solid hover:opacity-80 active-press',
                        TAG_COLORS[hashTagColor(tag)]
                      )}
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
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
}
