import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Star, ImageIcon } from 'lucide-react'
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
import { TYPE_LABELS, STATUS_LABELS, TYPE_EMOJIS } from './constants'

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
  formNotes: string
  setFormNotes: (v: string) => void
  formCoverUrl: string
  setFormCoverUrl: (v: string) => void
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
  formNotes,
  setFormNotes,
  formCoverUrl,
  setFormCoverUrl,
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
          <div className="grid grid-cols-5 gap-2">
            {(Object.entries(TYPE_EMOJIS) as [CollectionType, string][]).map(([key, emoji]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFormType(key)}
                className={`flex flex-col items-center gap-1 rounded-lg p-2.5 text-center transition-all border ${
                  formType === key
                    ? 'border-primary bg-primary/10 shadow-sm'
                    : 'border-transparent bg-muted/50 hover:bg-muted'
                }`}
              >
                <span className="text-xl">{emoji}</span>
                <span className="text-[10px] font-medium leading-tight">{TYPE_LABELS[key]}</span>
              </button>
            ))}
          </div>
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
              <div className="flex gap-1.5 h-10 items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormRating(formRating === star ? 0 : star)}
                    className="p-1 -m-1"
                  >
                    <Star
                      className={`h-6 w-6 sm:h-5 sm:w-5 transition ${
                        star <= formRating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-muted-foreground/30'
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
          <div className="space-y-2">
            <Label>Заметки</Label>
            <Textarea
              placeholder="Ваши заметки..."
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5" />
              URL обложки (необязательно)
            </Label>
            <Input
              placeholder="https://example.com/cover.jpg"
              value={formCoverUrl}
              onChange={(e) => setFormCoverUrl(e.target.value)}
            />
            {formCoverUrl && (
              <div className="relative h-32 rounded-lg overflow-hidden border">
                <img
                  src={formCoverUrl}
                  alt="Предпросмотр обложки"
                  className="h-full w-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <span className="absolute bottom-2 left-2 text-[10px] text-white/80 bg-black/30 rounded px-1.5 py-0.5">Предпросмотр</span>
              </div>
            )}
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
