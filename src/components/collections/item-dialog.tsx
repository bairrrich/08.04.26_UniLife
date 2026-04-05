import { Star, CalendarDays, Pencil, Save, X, ExternalLink } from 'lucide-react'
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
import type { CollectionItem, CollectionType } from './types'
import { parseDetails } from './types'
import {
  TYPE_LABELS,
  TYPE_AUTHOR_LABEL,
  TYPE_FIELD_DEFINITIONS,
  TYPE_ICONS_LARGE,
  TYPE_ICON_BG,
  getCoverGradient,
  parseTags,
  formatDaysAgo,
  getDetailDisplayLabel,
  formatDetailValue,
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
  editTags: string
  editNotes: string
  editRating: number
  editSaving: boolean
  editDetails: Record<string, string>
  // Edit form setters
  setEditTitle: (v: string) => void
  setEditAuthor: (v: string) => void
  setEditDescription: (v: string) => void
  setEditType: (v: CollectionType) => void
  setEditTags: (v: string) => void
  setEditNotes: (v: string) => void
  setEditRating: (v: number) => void
  setEditDetails: (v: Record<string, string>) => void
  // Actions
  onStartEdit: () => void
  onCancelEdit: () => void
  onSaveEdit: () => void
  onDelete: (item: CollectionItem) => void
  onRatingUpdate: (item: CollectionItem, rating: number) => void
  isFavorite?: boolean
  onToggleFavorite?: (itemId: string) => void
  relatedItems?: CollectionItem[]
  onOpenRelated?: (item: CollectionItem) => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
  editTags,
  editNotes,
  editRating,
  editSaving,
  editDetails,
  setEditTitle,
  setEditAuthor,
  setEditDescription,
  setEditType,
  setEditTags,
  setEditNotes,
  setEditRating,
  setEditDetails,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onRatingUpdate,
  isFavorite,
  onToggleFavorite,
  relatedItems,
  onOpenRelated,
}: ItemDialogProps) {
  if (!item) return null

  const currentType = isEditing ? editType : (item.type as CollectionType)
  const authorLabel = TYPE_AUTHOR_LABEL[currentType]
  const fields = TYPE_FIELD_DEFINITIONS[currentType]

  // Parse item details for view mode
  const details = parseDetails(item.details)
  const detailEntries = Object.entries(details).filter(
    ([, v]) => v !== null && v !== undefined && v !== ''
  )

  const handleEditDetailChange = (key: string, value: string) => {
    setEditDetails({ ...editDetails, [key]: value })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        {/* Large cover gradient area */}
        <div
          className={`-mx-6 -mt-6 h-24 bg-gradient-to-br ${getCoverGradient(item.id)} flex items-center justify-center relative`}
        >
          <div className="text-white/90">
            {TYPE_ICONS_LARGE[currentType]}
          </div>
          {/* Type badge on cover */}
          <div className="absolute top-3 right-4">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-medium bg-white/20 backdrop-blur-sm text-white border border-white/30`}
            >
              {TYPE_LABELS[currentType]}
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
          {onToggleFavorite && !isEditing && (
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
              {authorLabel && (
                <div className="space-y-2">
                  <Label>{authorLabel}</Label>
                  <Input value={editAuthor} onChange={(e) => setEditAuthor(e.target.value)} placeholder={authorLabel} />
                </div>
              )}
              <div className="space-y-2">
                <Label>Описание</Label>
                <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="Краткое описание..." rows={3} />
              </div>
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
              {/* Type-specific fields in edit mode */}
              {fields.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm text-muted-foreground">Дополнительно</Label>
                  {fields.map((field) => (
                    <div key={field.key} className="space-y-1.5">
                      <Label className="text-xs">{field.label}</Label>
                      {field.type === 'select' && field.options ? (
                        <Select
                          value={editDetails[field.key] || ''}
                          onValueChange={(v) => handleEditDetailChange(field.key, v)}
                        >
                          <SelectTrigger className="w-full h-9 text-sm">
                            <SelectValue placeholder={field.placeholder || field.label} />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options.map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          type={field.type === 'number' ? 'number' : 'text'}
                          placeholder={field.placeholder}
                          value={editDetails[field.key] || ''}
                          onChange={(e) => handleEditDetailChange(field.key, e.target.value)}
                          className="h-9 text-sm"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
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
                <Badge variant="secondary" className="gap-1 font-normal text-[11px]">
                  <CalendarDays className="h-3 w-3" />
                  {formatDaysAgo(item.createdAt)}
                </Badge>
              </div>

              {/* Type-specific details */}
              {detailEntries.length > 0 && (
                <div className="rounded-lg border p-3 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Подробности</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {detailEntries.map(([key, value]) => (
                      <div key={key} className="min-w-0">
                        <p className="text-[11px] text-muted-foreground">{getDetailDisplayLabel(key)}</p>
                        <p className="text-sm font-medium truncate">{formatDetailValue(key, value)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                <Button variant="outline" className="flex-1 min-w-[120px]">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Открыть
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
                        <span className={`h-8 w-8 rounded-md flex items-center justify-center shrink-0 bg-muted/50`}>
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
                          {TYPE_LABELS[related.type as CollectionType]}
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
