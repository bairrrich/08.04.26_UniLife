import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Camera, SmilePlus, Tag, ImageIcon, Eye, Globe, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { EntityType } from './types'
import { ENTITY_LABELS, QUICK_EMOJIS, MAX_CAPTION_LENGTH } from './constants'

// Mood options
const MOOD_OPTIONS = [
  { key: '', label: 'Без настроения', emoji: '' },
  { key: 'happy', label: 'Радостное', emoji: '😄' },
  { key: 'calm', label: 'Спокойное', emoji: '😊' },
  { key: 'motivated', label: 'Мотивированное', emoji: '💪' },
  { key: 'grateful', label: 'Благодарное', emoji: '🙏' },
  { key: 'tired', label: 'Уставшее', emoji: '😴' },
  { key: 'sad', label: 'Грустное', emoji: '😢' },
]

// Visibility options
const VISIBILITY_OPTIONS = [
  { key: 'public', label: 'Публичная', icon: Globe },
  { key: 'friends', label: 'Для друзей', icon: Eye },
  { key: 'private', label: 'Приватная', icon: Lock },
]

interface PostDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  formEntityType: EntityType
  setFormEntityType: (v: EntityType) => void
  formCaption: string
  setFormCaption: (v: string) => void
  formTags: string
  setFormTags: (v: string) => void
  onSubmit: (data: { entityType: EntityType; entityId?: string; caption: string; tags: string; imageUrl?: string; mood?: string; visibility?: string }) => void
}

export function PostDialog({
  open, onOpenChange,
  formEntityType, setFormEntityType,
  formCaption, setFormCaption,
  formTags, setFormTags,
  onSubmit,
}: PostDialogProps) {
  const [imageUrl, setImageUrl] = useState('')
  const [selectedMood, setSelectedMood] = useState('')
  const [visibility, setVisibility] = useState('public')
  const [showPreview, setShowPreview] = useState(false)

  const handleInsertEmoji = (emoji: string) => {
    if (formCaption.length < MAX_CAPTION_LENGTH) {
      setFormCaption(formCaption + emoji)
    }
  }

  const handleClose = (val: boolean) => {
    if (!val) {
      setImageUrl('')
      setSelectedMood('')
      setVisibility('public')
      setShowPreview(false)
    }
    onOpenChange(val)
  }

  const isSubmitDisabled = !formCaption.trim() || showPreview

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Новая запись</span>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  'h-7 px-2 text-xs gap-1',
                  !showPreview && 'text-muted-foreground'
                )}
                onClick={() => setShowPreview(false)}
              >
                ✏️ Написать
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  'h-7 px-2 text-xs gap-1',
                  showPreview && 'text-muted-foreground'
                )}
                onClick={() => setShowPreview(true)}
                disabled={!formCaption.trim()}
              >
                <Eye className="h-3 w-3" />
                Предпросмотр
              </Button>
            </div>
          </DialogTitle>
          <DialogDescription className="sr-only">Создание новой записи в ленте</DialogDescription>
        </DialogHeader>

        {showPreview ? (
          /* Preview mode */
          <div className="space-y-4 pt-2">
            <div className="rounded-xl border bg-card p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-sm font-bold text-primary">
                  А
                </div>
                <div>
                  <p className="text-sm font-medium">Алексей</p>
                  <p className="text-xs text-muted-foreground">только что</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{formCaption}</p>
              {imageUrl && (
                <div className="rounded-lg overflow-hidden border bg-muted/20">
                  <img
                    src={imageUrl}
                    alt="Предпросмотр"
                    className="w-full h-40 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                </div>
              )}
              {selectedMood && (
                <Badge variant="secondary" className="text-xs">
                  {MOOD_OPTIONS.find((m) => m.key === selectedMood)?.emoji}{' '}
                  {MOOD_OPTIONS.find((m) => m.key === selectedMood)?.label}
                </Badge>
              )}
              {formTags && (
                <div className="flex gap-1.5 flex-wrap">
                  {formTags.split(',').map((t, i) => t.trim()).filter(Boolean).map((tag, i) => (
                    <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0 h-5 font-normal">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <Button className="w-full" onClick={() => { setShowPreview(false) }}>
              ✏️ Редактировать
            </Button>
          </div>
        ) : (
          /* Edit mode */
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

            {/* Image URL with preview */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5" />
                Ссылка на изображение
              </Label>
              <Input
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="text-sm"
              />
              {imageUrl && (
                <div className="relative rounded-lg overflow-hidden border h-32 bg-muted/20 flex items-center justify-center">
                  <img
                    src={imageUrl}
                    alt="Предпросмотр"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                      ;(e.target as HTMLImageElement).parentElement!.innerHTML =
                        '<span class=\"text-xs text-muted-foreground\">Не удалось загрузить изображение</span>'
                    }}
                  />
                </div>
              )}
              {!imageUrl && (
                <button
                  type="button"
                  className="w-full h-20 rounded-xl border-2 border-dashed border-muted-foreground/20 hover:border-primary/40 flex flex-col items-center justify-center gap-1.5 text-muted-foreground/50 hover:text-muted-foreground transition-colors cursor-pointer"
                >
                  <Camera className="h-5 w-5" />
                  <span className="text-xs font-medium">Добавить изображение по ссылке</span>
                </button>
              )}
            </div>

            {/* Mood selector */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <SmilePlus className="h-3.5 w-3.5" />
                Настроение
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {MOOD_OPTIONS.map((mood) => (
                  <button
                    key={mood.key}
                    type="button"
                    onClick={() => setSelectedMood(mood.key === selectedMood ? '' : mood.key)}
                    className={cn(
                      'h-9 px-3 rounded-lg flex items-center gap-1.5 text-xs font-medium transition-all active-press',
                      selectedMood === mood.key
                        ? 'bg-primary/10 ring-1 ring-primary/30 text-foreground'
                        : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                    )}
                  >
                    {mood.emoji && <span>{mood.emoji}</span>}
                    <span>{mood.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Visibility toggle */}
            <div className="space-y-2">
              <Label>Видимость</Label>
              <div className="flex gap-2">
                {VISIBILITY_OPTIONS.map((opt) => {
                  const Icon = opt.icon
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setVisibility(opt.key)}
                      className={cn(
                        'flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all border active-press',
                        visibility === opt.key
                          ? 'border-primary bg-primary/5 text-foreground'
                          : 'border-transparent bg-muted hover:bg-muted/80 text-muted-foreground'
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" />
                Теги (через запятую)
              </Label>
              <Input
                placeholder="достижение, тренировка, мысли"
                value={formTags}
                onChange={(e) => setFormTags(e.target.value)}
                className="text-sm"
              />
              <span className="text-xs text-muted-foreground/60">Необязательно</span>
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
          </div>
        )}

        <div className="flex gap-2">
          <Button
            className="flex-1"
            onClick={() => onSubmit({
              entityType: formEntityType,
              caption: formCaption,
              tags: formTags,
              imageUrl: imageUrl || undefined,
              mood: selectedMood || undefined,
              visibility,
            })}
            disabled={!formCaption.trim()}
          >
            Опубликовать
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
