import { Button } from '@/components/ui/button'
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
import { Camera, SmilePlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { EntityType } from './types'
import { ENTITY_LABELS, QUICK_EMOJIS, MAX_CAPTION_LENGTH } from './constants'

interface PostDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  formEntityType: EntityType
  setFormEntityType: (v: EntityType) => void
  formCaption: string
  setFormCaption: (v: string) => void
  onSubmit: () => void
}

export function PostDialog({
  open, onOpenChange,
  formEntityType, setFormEntityType,
  formCaption, setFormCaption,
  onSubmit,
}: PostDialogProps) {
  const handleInsertEmoji = (emoji: string) => {
    if (formCaption.length < MAX_CAPTION_LENGTH) {
      setFormCaption(formCaption + emoji)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Новая запись</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="post-caption">Что у вас нового?</Label>
            <Textarea
              id="post-caption"
              placeholder="Поделитесь своими мыслями, достижениями или моментами дня..."
              value={formCaption}
              onChange={(e) => {
                if (e.target.value.length <= MAX_CAPTION_LENGTH) setFormCaption(e.target.value)
              }}
              rows={4}
              className="resize-none focus-glow"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Макс. {MAX_CAPTION_LENGTH} символов</span>
              <span className={cn(
                'text-xs tabular-nums',
                formCaption.length > MAX_CAPTION_LENGTH * 0.9 ? 'text-amber-500' : 'text-muted-foreground'
              )}>
                {formCaption.length}/{MAX_CAPTION_LENGTH}
              </span>
            </div>
          </div>

          {/* Emoji quick insert */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              <SmilePlus className="h-3.5 w-3.5" />
              Быстрые эмодзи
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_EMOJIS.map((emoji) => (
                <button
                  key={emoji} type="button"
                  onClick={() => handleInsertEmoji(emoji)}
                  className="h-9 w-9 rounded-lg flex items-center justify-center text-lg hover:bg-accent transition-colors active-press"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Image placeholder (non-functional UI) */}
          <div className="space-y-1.5">
            <Label>Фото</Label>
            <button
              type="button"
              className="w-full h-24 rounded-xl border-2 border-dashed border-muted-foreground/20 hover:border-primary/40 flex flex-col items-center justify-center gap-1.5 text-muted-foreground/50 hover:text-muted-foreground transition-colors cursor-pointer"
            >
              <Camera className="h-6 w-6" />
              <span className="text-xs font-medium">Добавить фото</span>
            </button>
          </div>

          <div className="space-y-2">
            <Label>Категория</Label>
            <Select value={formEntityType} onValueChange={(v) => setFormEntityType(v as EntityType)}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.entries(ENTITY_LABELS) as [EntityType, string][]).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button className="w-full" onClick={onSubmit} disabled={!formCaption.trim()}>
            Опубликовать
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
