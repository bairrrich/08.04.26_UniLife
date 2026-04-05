import { Star, Heart, Clock, CheckCircle, CalendarDays, Pencil, Save, X, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
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
import type { CollectionItem, CollectionType, CollectionStatus } from './types'
import {
  TYPE_LABELS,
  STATUS_LABELS,
  STATUS_COLORS,
  STATUS_BUTTON_STYLES,
  STATUS_TRANSITIONS,
  TYPE_ICONS_LARGE,
  TYPE_ICON_BG,
  TYPE_ICON_BG_LIGHT,
  getCoverGradient,
  parseTags,
  formatDaysAgo,
} from './constants'

// ─── Props ────────────────────────────────────────────────────────────────────

interface ItemDialogProps {
  item: CollectionItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  isEditing: boolean
  // Edit form values
  editTitle: string
  editAuthor: string
  editDescription: string
  editType: CollectionType
  editStatus: CollectionStatus
  editTags: string
  editNotes: string
  editRating: number
  editSaving: boolean
  // Edit form setters
  setEditTitle: (v: string) => void
  setEditAuthor: (v: string) => void
  setEditDescription: (v: string) => void
  setEditType: (v: CollectionType) => void
  setEditStatus: (v: CollectionStatus) => void
  setEditTags: (v: string) => void
  setEditNotes: (v: string) => void
  setEditRating: (v: number) => void
  // Actions
  onStartEdit: () => void
  onCancelEdit: () => void
  onSaveEdit: () => void
  onStatusUpdate: (item: CollectionItem, status: CollectionStatus) => void
  onDelete: (item: CollectionItem) => void
  onRatingUpdate: (item: CollectionItem, rating: number) => void
  isFavorite?: boolean
  onToggleFavorite?: (itemId: string) => void
  relatedItems?: CollectionItem[]
  onOpenRelated?: (item: CollectionItem) => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StatusIcon({ status }: { status: CollectionStatus }) {
  if (status === 'WANT') return <Heart className="h-2.5 w-2.5" />
  if (status === 'IN_PROGRESS') return <Clock className="h-2.5 w-2.5" />
  return <CheckCircle className="h-2.5 w-2.5" />
}

function StatusActionIcon({ status }: { status: CollectionStatus }) {
  if (status === 'WANT') return <Clock className="h-4 w-4 mr-2" />
  if (status === 'IN_PROGRESS') return <CheckCircle className="h-4 w-4 mr-2" />
  return <Heart className="h-4 w-4 mr-2" />
}

function StarRating({ rating, onRate }: { rating: number; onRate?: (r: number) => void }) {
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={onRate ? () => onRate(rating === star ? 0 : star) : undefined}
          className={onRate ? 'p-1 -m-1' : 'p-1 -m-1 cursor-default'}
        >
          <Star
            className={`h-6 w-6 sm:h-5 sm:w-5 transition ${
              star <= rating
                ? 'fill-amber-400 text-amber-400'
                : 'text-muted-foreground/30'
            }`}
          />
        </button>
      ))}
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ItemDialog({
  item,
  open,
  onOpenChange,
  isEditing,
  editTitle,
  editAuthor,
  editDescription,
  editType,
  editStatus,
  editTags,
  editNotes,
  editRating,
  editSaving,
  setEditTitle,
  setEditAuthor,
  setEditDescription,
  setEditType,
  setEditStatus,
  setEditTags,
  setEditNotes,
  setEditRating,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onStatusUpdate,
  onDelete,
  onRatingUpdate,
  isFavorite,
  onToggleFavorite,
  relatedItems,
  onOpenRelated,
}: ItemDialogProps) {
  if (!item) return null

  const currentType = isEditing ? editType : (item.type as CollectionType)
  const currentStatus = isEditing ? editStatus : item.status

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {/* Large cover gradient area */}
        <div
          className={`-mx-6 -mt-6 h-24 bg-gradient-to-br ${getCoverGradient(item.id)} flex items-center justify-center relative`}
        >
          <div className="text-white/90">
            {TYPE_ICONS_LARGE[currentType]}
          </div>
          {/* Status badge on cover */}
          <div className="absolute top-3 right-4">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-medium ${STATUS_COLORS[currentStatus]}`}
            >
              <StatusIcon status={currentStatus} />
              {STATUS_LABELS[currentStatus]}
            </span>
          </div>
          {/* Type icon badge */}
          <div className={`absolute top-3 left-4 flex h-7 w-7 items-center justify-center rounded-lg text-white ${TYPE_ICON_BG[currentType]}`}>
            <span className="h-4 w-4 flex items-center justify-center">
              {TYPE_ICONS_LARGE[currentType] && (
                <span className="[&>svg]:h-4 [&>svg]:w-4">
                  {TYPE_ICONS_LARGE[currentType]}
                </span>
              )}
            </span>
          </div>
          {/* Favorite toggle */}
          {onToggleFavorite && (
            <button
              type="button"
              onClick={() => onToggleFavorite(item.id)}
              className="absolute bottom-3 right-4 h-8 w-8 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/40 transition-colors"
            >
              <Star className={`h-4 w-4 transition-all ${isFavorite ? 'fill-amber-400 text-amber-400 scale-110' : 'text-white/80'}`} />
            </button>
          )}
        </div>

        <DialogHeader>
          <div className="min-w-0">
            <DialogTitle className="text-lg leading-snug">
              {isEditing ? 'Редактирование' : item.title}
            </DialogTitle>
            {!isEditing && item.author && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {item.author}
              </p>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {isEditing ? (
            /* ========== EDIT MODE ========== */
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Название *</Label>
                <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Название" />
              </div>
              <div className="space-y-2">
                <Label>Автор / Создатель</Label>
                <Input value={editAuthor} onChange={(e) => setEditAuthor(e.target.value)} placeholder="Автор" />
              </div>
              <div className="space-y-2">
                <Label>Описание</Label>
                <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="Краткое описание..." rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Тип</Label>
                  <Select value={editType} onValueChange={(v) => setEditType(v as CollectionType)}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(Object.entries(TYPE_LABELS) as [CollectionType, string][]).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Статус</Label>
                  <Select value={editStatus} onValueChange={(v) => setEditStatus(v as CollectionStatus)}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(Object.entries(STATUS_LABELS) as [CollectionStatus, string][]).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Рейтинг</Label>
                <StarRating rating={editRating} onRate={setEditRating} />
              </div>
              <div className="space-y-2">
                <Label>Теги (через запятую)</Label>
                <Input value={editTags} onChange={(e) => setEditTags(e.target.value)} placeholder="фантастика, фаворит" />
              </div>
              <div className="space-y-2">
                <Label>Заметки</Label>
                <Textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} placeholder="Ваши заметки..." rows={3} />
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button className="flex-1" onClick={onSaveEdit} disabled={!editTitle.trim() || editSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {editSaving ? 'Сохранение...' : 'Сохранить'}
                </Button>
                <Button variant="outline" onClick={onCancelEdit} disabled={editSaving}>
                  <X className="h-4 w-4 mr-2" />
                  Отмена
                </Button>
              </div>
            </div>
          ) : (
            /* ========== VIEW MODE ========== */
            <>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline">
                  {TYPE_LABELS[item.type as CollectionType]}
                </Badge>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[item.status]}`}>
                  {STATUS_LABELS[item.status]}
                </span>
                <Badge variant="secondary" className="gap-1 font-normal text-[11px]">
                  <CalendarDays className="h-3 w-3" />
                  {formatDaysAgo(item.createdAt)}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Label className="text-sm">Рейтинг:</Label>
                <StarRating rating={item.rating || 0} onRate={(r) => onRatingUpdate(item, r)} />
              </div>

              {item.description && (
                <div>
                  <Label className="text-sm text-muted-foreground">Описание</Label>
                  <p className="text-sm mt-1">{item.description}</p>
                </div>
              )}

              {parseTags(item.tags).length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {parseTags(item.tags).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              )}

              {item.notes && (
                <div>
                  <Label className="text-sm text-muted-foreground">Заметки</Label>
                  <p className="text-sm mt-1">{item.notes}</p>
                </div>
              )}

              <Separator />

              <div className="flex gap-2 flex-wrap">
                {/* Open button placeholder */}
                <Button variant="outline" className="flex-1 min-w-[120px]">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Открыть
                </Button>
                <Button
                  variant="outline"
                  className={`flex-1 min-w-[120px] border ${STATUS_BUTTON_STYLES[item.status]}`}
                  onClick={() => onStatusUpdate(item, STATUS_TRANSITIONS[item.status])}
                >
                  <StatusActionIcon status={item.status} />
                  {STATUS_LABELS[STATUS_TRANSITIONS[item.status]]}
                </Button>
                <Button variant="outline" onClick={onStartEdit} className="flex-1 min-w-[120px]">
                  <Pencil className="h-4 w-4 mr-2" />
                  Редактировать
                </Button>
                <Button
                  variant="outline"
                  className="text-destructive hover:text-destructive flex-1 min-w-[120px]"
                  onClick={() => onDelete(item)}
                >
                  Удалить
                </Button>
              </div>

              {/* Related items suggestions */}
              {relatedItems && relatedItems.length > 0 && (
                <div className="space-y-2 pt-2">
                  <Label className="text-sm text-muted-foreground">Похожие элементы</Label>
                  <div className="space-y-2">
                    {relatedItems.map((related) => (
                      <button
                        key={related.id}
                        type="button"
                        onClick={() => onOpenRelated?.(related)}
                        className="w-full flex items-center gap-2.5 rounded-lg border p-2.5 text-left hover:bg-muted/50 transition-colors"
                      >
                        <span className={`h-8 w-8 rounded-md flex items-center justify-center shrink-0 ${TYPE_ICON_BG_LIGHT[related.type as CollectionType]}`}>
                          {TYPE_ICONS_LARGE[related.type as CollectionType] && (
                            <span className="[&>svg]:h-4 [&>svg]:w-4">{TYPE_ICONS_LARGE[related.type as CollectionType]}</span>
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{related.title}</p>
                          {related.author && (
                            <p className="text-[11px] text-muted-foreground truncate">{related.author}</p>
                          )}
                        </div>
                        <Badge variant="secondary" className="text-[10px] shrink-0">
                          {STATUS_LABELS[related.status]}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
