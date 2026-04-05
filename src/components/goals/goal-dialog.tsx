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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingGoal ? 'Редактировать цель' : 'Новая цель'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
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
