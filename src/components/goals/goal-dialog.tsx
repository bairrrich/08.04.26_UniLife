'use client'

import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { CATEGORY_OPTIONS, STATUS_OPTIONS, PRIORITY_OPTIONS } from './constants'
import { Sparkles, BookOpen, PiggyBank, Dumbbell, GraduationCap, Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MilestoneItem {
  id: string
  title: string
  completed: boolean
}

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
  formStartDate?: string
  setFormStartDate?: (v: string) => void
  formPriority?: string
  setFormPriority?: (v: string) => void
  formStatus: string
  setFormStatus: (v: string) => void
  formProgress: string
  setFormProgress: (v: string) => void
  formMilestones?: string
  setFormMilestones?: (v: string) => void
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
  formStartDate = '',
  setFormStartDate,
  formPriority = 'medium',
  setFormPriority,
  formStatus,
  setFormStatus,
  formProgress,
  setFormProgress,
  formMilestones = '[]',
  setFormMilestones,
  submitting,
  onSubmit,
}: GoalDialogProps) {

  const isEditing = !!editingGoal

  // Milestone management
  const milestones: MilestoneItem[] = (() => {
    try { return JSON.parse(formMilestones || '[]') } catch { return [] }
  })()

  const addMilestone = () => {
    const newMs: MilestoneItem = {
      id: Date.now().toString(36),
      title: '',
      completed: false,
    }
    setFormMilestones?.(JSON.stringify([...milestones, newMs]))
  }

  const updateMilestone = (index: number, title: string) => {
    const updated = [...milestones]
    updated[index] = { ...updated[index], title }
    setFormMilestones?.(JSON.stringify(updated))
  }

  const removeMilestone = (index: number) => {
    const updated = milestones.filter((_, i) => i !== index)
    setFormMilestones?.(JSON.stringify(updated))
  }

  const toggleMilestone = (index: number) => {
    const updated = [...milestones]
    updated[index] = { ...updated[index], completed: !updated[index].completed }
    setFormMilestones?.(JSON.stringify(updated))
  }

  const handleTemplateClick = (template: typeof GOAL_TEMPLATES[number]) => {
    setFormTitle(template.title)
    setFormDescription(template.description)
    setFormCategory(template.category)
    setFormTargetValue(template.targetValue)
    setFormCurrentValue(template.currentValue)
    setFormUnit(template.unit)
    setFormProgress('0')
    setFormPriority('medium')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

          {/* Priority */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Приоритет</label>
            <div className="grid grid-cols-3 gap-2">
              {PRIORITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFormPriority?.(opt.value)}
                  className={cn(
                    'rounded-lg px-3 py-2 text-sm font-medium transition-all border',
                    (formPriority || 'medium') === opt.value
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                      : 'border-transparent bg-muted hover:bg-muted/80',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Target value row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

          {/* Dates row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Дата начала</label>
              <Input type="date" value={formStartDate} onChange={(e) => setFormStartDate?.(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Дедлайн</label>
              <Input type="date" value={formDeadline} onChange={(e) => setFormDeadline(e.target.value)} />
            </div>
          </div>

          {/* Milestones */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Этапы</label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 gap-1 text-xs"
                onClick={addMilestone}
              >
                <Plus className="h-3 w-3" />
                Добавить этап
              </Button>
            </div>
            {milestones.length > 0 && (
              <div className="space-y-2 rounded-lg border border-muted/50 bg-muted/20 p-3">
                {milestones.map((ms, idx) => (
                  <div key={ms.id || idx} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={ms.completed}
                      onChange={() => toggleMilestone(idx)}
                      className="h-4 w-4 rounded border-muted-foreground/30 accent-primary"
                    />
                    <Input
                      value={ms.title}
                      onChange={(e) => updateMilestone(idx, e.target.value)}
                      placeholder="Название этапа..."
                      className="h-8 text-sm flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => removeMilestone(idx)}
                      className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive transition-colors shrink-0"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-[10px] text-muted-foreground/60">Этапы помогают разбить цель на управляемые части</p>
          </div>

          <Button className="w-full" onClick={onSubmit} disabled={!formTitle.trim() || submitting}>
            {submitting ? 'Сохранение...' : editingGoal ? 'Сохранить изменения' : 'Создать цель'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
