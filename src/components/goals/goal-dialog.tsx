'use client'

import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { CATEGORY_OPTIONS, STATUS_OPTIONS } from './constants'
import { Sparkles, BookOpen, PiggyBank, Dumbbell, GraduationCap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GoalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingGoal: import('./types').GoalData | null
  formTitle: string
  setFormTitle: (v: string) => void
  formDescription: string
  setFormDescription: (v: string) => void
  formCategory: string
  setFormCategory: (v: string) => void
  formTargetValue: string
  setFormTargetValue: (v: string) => void
  formCurrentValue: string
  setFormCurrentValue: (v: string) => void
  formUnit: string
  setFormUnit: (v: string) => void
  formDeadline: string
  setFormDeadline: (v: string) => void
  formStatus: string
  setFormStatus: (v: string) => void
  formProgress: string
  setFormProgress: (v: string) => void
  submitting: boolean
  onSubmit: () => void
}

// ─── Preset Goal Templates ─────────────────────────────────────────────────
const GOAL_TEMPLATES = [
  {
    title: 'Прочитать 12 книг',
    description: 'Цель прочитать 12 книг за год',
    category: 'personal',
    targetValue: '12',
    currentValue: '0',
    unit: 'книг',
    icon: <BookOpen className="h-3.5 w-3.5" />,
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50',
  },
  {
    title: 'Накопить 100 000 ₽',
    description: 'Отложить накопления на финансовую подушку',
    category: 'finance',
    targetValue: '100000',
    currentValue: '0',
    unit: '₽',
    icon: <PiggyBank className="h-3.5 w-3.5" />,
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border-amber-200 dark:border-amber-800/50',
  },
  {
    title: 'Пробежать марафон',
    description: 'Подготовиться и пробежать марафонскую дистанцию',
    category: 'health',
    targetValue: '42.2',
    currentValue: '0',
    unit: 'км',
    icon: <Dumbbell className="h-3.5 w-3.5" />,
    color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400 border-rose-200 dark:border-rose-800/50',
  },
  {
    title: 'Выучить английский',
    description: 'Пройти 100 уроков английского языка',
    category: 'learning',
    targetValue: '100',
    currentValue: '0',
    unit: 'уроков',
    icon: <GraduationCap className="h-3.5 w-3.5" />,
    color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400 border-violet-200 dark:border-violet-800/50',
  },
]

export function GoalDialog({
  open,
  onOpenChange,
  editingGoal,
  formTitle,
  setFormTitle,
  formDescription,
  setFormDescription,
  formCategory,
  setFormCategory,
  formTargetValue,
  setFormTargetValue,
  formCurrentValue,
  setFormCurrentValue,
  formUnit,
  setFormUnit,
  formDeadline,
  setFormDeadline,
  formStatus,
  setFormStatus,
  formProgress,
  setFormProgress,
  submitting,
  onSubmit,
}: GoalDialogProps) {

  const handleTemplateClick = (template: typeof GOAL_TEMPLATES[number]) => {
    setFormTitle(template.title)
    setFormDescription(template.description)
    setFormCategory(template.category)
    setFormTargetValue(template.targetValue)
    setFormCurrentValue(template.currentValue)
    setFormUnit(template.unit)
    setFormProgress('0')
  }

  const isEditing = !!editingGoal

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingGoal ? 'Редактировать цель' : 'Новая цель'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          {/* Preset Goal Templates — only shown when creating new goal */}
          {!isEditing && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Быстрые шаблоны
              </div>
              <div className="flex flex-wrap gap-2">
                {GOAL_TEMPLATES.map((template) => {
                  const isSelected = formTitle === template.title && formCategory === template.category && formTargetValue === template.targetValue
                  return (
                    <button
                      key={template.title}
                      type="button"
                      onClick={() => handleTemplateClick(template)}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 active-press',
                        isSelected
                          ? template.color + ' ring-2 ring-primary/30 shadow-sm'
                          : 'bg-muted/60 text-muted-foreground border-transparent hover:bg-muted hover:text-foreground',
                      )}
                    >
                      {template.icon}
                      <span className="max-w-[140px] truncate">{template.title}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Название *</label>
            <Input
              placeholder="Например: Выучить TypeScript"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Описание</label>
            <Textarea
              placeholder="Подробности о вашей цели..."
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Category + Status row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Категория</label>
              <Select value={formCategory} onValueChange={setFormCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Статус</label>
              <Select value={formStatus} onValueChange={setFormStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Target value row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Целевое</label>
              <Input type="number" placeholder="100" value={formTargetValue} onChange={(e) => setFormTargetValue(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Текущее</label>
              <Input type="number" placeholder="0" value={formCurrentValue} onChange={(e) => setFormCurrentValue(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Единица</label>
              <Input placeholder="кг, ₽, раз" value={formUnit} onChange={(e) => setFormUnit(e.target.value)} />
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Прогресс ({formProgress || 0}%)</label>
            <input
              type="range" min="0" max="100"
              value={formProgress || 0}
              onChange={(e) => setFormProgress(e.target.value)}
              className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
            />
          </div>

          {/* Deadline */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Дедлайн</label>
            <Input type="date" value={formDeadline} onChange={(e) => setFormDeadline(e.target.value)} />
          </div>

          <Button className="w-full" onClick={onSubmit} disabled={!formTitle.trim() || submitting}>
            {submitting ? 'Сохранение...' : editingGoal ? 'Сохранить изменения' : 'Создать цель'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
