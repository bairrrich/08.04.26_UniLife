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
import { CalendarDays, Plus, Edit, Sparkles, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { MOOD_COLORS, MOOD_EMOJI, MOOD_LABELS, countWords } from '@/lib/format'
import { EntryFormData } from './types'
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
}: EntryDialogProps) {
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
                  onSelect={(d) => d && onFormChange((f) => ({ ...f, date: d }))}
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
              onChange={(e) => onFormChange((f) => ({ ...f, title: e.target.value }))}
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
                  onClick={() => onMoodClick(m)}
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
              onChange={(e) => onFormChange((f) => ({ ...f, content: e.target.value }))}
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
                onChange={(e) => onTagInputChange(e.target.value)}
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
