import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Star } from 'lucide-react'
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
import type { CollectionType, CollectionStatus } from './types'
import { TYPE_LABELS, STATUS_LABELS } from './constants'

interface AddItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  formType: CollectionType
  setFormType: (v: CollectionType) => void
  formTitle: string
  setFormTitle: (v: string) => void
  formAuthor: string
  setFormAuthor: (v: string) => void
  formDescription: string
  setFormDescription: (v: string) => void
  formRating: number
  setFormRating: (v: number) => void
  formStatus: CollectionStatus
  setFormStatus: (v: CollectionStatus) => void
  formTags: string
  setFormTags: (v: string) => void
  onSubmit: () => void
}

export function AddItemDialog({
  open,
  onOpenChange,
  formType,
  setFormType,
  formTitle,
  setFormTitle,
  formAuthor,
  setFormAuthor,
  formDescription,
  setFormDescription,
  formRating,
  setFormRating,
  formStatus,
  setFormStatus,
  formTags,
  setFormTags,
  onSubmit,
}: AddItemDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Новый элемент</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Тип</Label>
            <Select value={formType} onValueChange={(v) => setFormType(v as CollectionType)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(TYPE_LABELS) as [CollectionType, string][]).map(
                  ([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Название *</Label>
            <Input
              placeholder="Название"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Автор / Создатель</Label>
            <Input
              placeholder="Автор"
              value={formAuthor}
              onChange={(e) => setFormAuthor(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Описание</Label>
            <Textarea
              placeholder="Краткое описание..."
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Статус</Label>
              <Select value={formStatus} onValueChange={(v) => setFormStatus(v as CollectionStatus)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(STATUS_LABELS) as [CollectionStatus, string][]).map(
                    ([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Рейтинг</Label>
              <div className="flex gap-1 h-9 items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormRating(formRating === star ? 0 : star)}
                    className="p-0.5"
                  >
                    <Star
                      className={`h-5 w-5 transition ${
                        star <= formRating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Теги (через запятую)</Label>
            <Input
              placeholder="фантастика, фаворит"
              value={formTags}
              onChange={(e) => setFormTags(e.target.value)}
            />
          </div>
          <Button
            className="w-full"
            onClick={onSubmit}
            disabled={!formTitle.trim()}
          >
            Добавить в коллекцию
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
