'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Library,
  BookOpen,
  Film,
  ChefHat,
  Pill,
  Plus,
  Star,
  Heart,
  CheckCircle,
  Clock,
  Package,
  ListChecks,
  Loader2,
  CalendarDays,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

// ======================== Types ========================

type CollectionType = 'BOOK' | 'MOVIE' | 'RECIPE' | 'SUPPLEMENT' | 'PRODUCT'
type CollectionStatus = 'WANT' | 'IN_PROGRESS' | 'COMPLETED'

interface CollectionItem {
  id: string
  type: CollectionType
  title: string
  author: string | null
  description: string | null
  coverUrl: string | null
  rating: number | null
  status: CollectionStatus
  tags: string
  notes: string | null
  createdAt: string
  updatedAt: string
}

// ======================== Constants ========================

const TYPE_LABELS: Record<CollectionType, string> = {
  BOOK: 'Книги',
  MOVIE: 'Фильмы',
  RECIPE: 'Рецепты',
  SUPPLEMENT: 'БАДы',
  PRODUCT: 'Продукты',
}

const STATUS_LABELS: Record<CollectionStatus, string> = {
  WANT: 'Хочу',
  IN_PROGRESS: 'В процессе',
  COMPLETED: 'Завершено',
}

const STATUS_COLORS: Record<CollectionStatus, string> = {
  WANT: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  IN_PROGRESS: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  COMPLETED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
}

const STATUS_BUTTON_STYLES: Record<CollectionStatus, string> = {
  WANT: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800 dark:hover:bg-blue-900/50',
  IN_PROGRESS: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800 dark:hover:bg-amber-900/50',
  COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800 dark:hover:bg-emerald-900/50',
}

const TYPE_ICONS: Record<CollectionType, React.ReactNode> = {
  BOOK: <BookOpen className="h-5 w-5" />,
  MOVIE: <Film className="h-5 w-5" />,
  RECIPE: <ChefHat className="h-5 w-5" />,
  SUPPLEMENT: <Pill className="h-5 w-5" />,
  PRODUCT: <Package className="h-5 w-5" />,
}

const TYPE_ICONS_LARGE: Record<CollectionType, React.ReactNode> = {
  BOOK: <BookOpen className="h-8 w-8" />,
  MOVIE: <Film className="h-8 w-8" />,
  RECIPE: <ChefHat className="h-8 w-8" />,
  SUPPLEMENT: <Pill className="h-8 w-8" />,
  PRODUCT: <Package className="h-8 w-8" />,
}

const TYPE_COLORS: Record<CollectionType, string> = {
  BOOK: 'bg-amber-50 text-amber-600',
  MOVIE: 'bg-purple-50 text-purple-600',
  RECIPE: 'bg-rose-50 text-rose-600',
  SUPPLEMENT: 'bg-cyan-50 text-cyan-600',
  PRODUCT: 'bg-emerald-50 text-emerald-600',
}

const COVER_COLORS: string[] = [
  'from-rose-400 to-pink-500',
  'from-blue-400 to-indigo-500',
  'from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-500',
  'from-purple-400 to-violet-500',
  'from-cyan-400 to-sky-500',
  'from-fuchsia-400 to-pink-500',
  'from-lime-400 to-green-500',
]

function getCoverGradient(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  return COVER_COLORS[Math.abs(hash) % COVER_COLORS.length]
}

function parseTags(tagsStr: string): string[] {
  try {
    return JSON.parse(tagsStr)
  } catch {
    return []
  }
}

function formatDateRussian(dateStr: string): string {
  const date = new Date(dateStr)
  const day = date.getDate()
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
  ]
  const month = months[date.getMonth()]
  const year = date.getFullYear()
  return `${day} ${month} ${year}`
}

// ======================== Component ========================

export function CollectionsPage() {
  const [items, setItems] = useState<CollectionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeType, setActiveType] = useState<string>('all')
  const [activeStatus, setActiveStatus] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailItem, setDetailItem] = useState<CollectionItem | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  // Form state
  const [formType, setFormType] = useState<CollectionType>('BOOK')
  const [formTitle, setFormTitle] = useState('')
  const [formAuthor, setFormAuthor] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formRating, setFormRating] = useState(0)
  const [formStatus, setFormStatus] = useState<CollectionStatus>('WANT')
  const [formTags, setFormTags] = useState('')

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (activeType !== 'all') params.set('type', activeType)
      if (activeStatus !== 'all') params.set('status', activeStatus)
      const res = await fetch(`/api/collections?${params.toString()}`)
      const json = await res.json()
      if (json.success) setItems(json.data)
    } catch (err) {
      console.error('Failed to fetch collections:', err)
    } finally {
      setLoading(false)
    }
  }, [activeType, activeStatus])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const resetForm = () => {
    setFormType('BOOK')
    setFormTitle('')
    setFormAuthor('')
    setFormDescription('')
    setFormRating(0)
    setFormStatus('WANT')
    setFormTags('')
  }

  const handleSubmit = async () => {
    if (!formTitle.trim()) return

    const tags = formTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    toast.dismiss()
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: formType,
          title: formTitle.trim(),
          author: formAuthor.trim() || null,
          description: formDescription.trim() || null,
          rating: formRating > 0 ? formRating : null,
          status: formStatus,
          tags: tags.length > 0 ? tags : [],
        }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success('Элемент добавлен в коллекцию')
        setDialogOpen(false)
        resetForm()
        fetchItems()
      } else {
        toast.error('Ошибка при добавлении элемента')
      }
    } catch (err) {
      console.error('Failed to create collection item:', err)
      toast.error('Ошибка: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка'))
    }
  }

  const handleStatusUpdate = async (item: CollectionItem, newStatus: CollectionStatus) => {
    toast.dismiss()
    try {
      const res = await fetch(`/api/collections/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success('Статус обновлён')
        fetchItems()
        if (detailItem && detailItem.id === item.id) {
          setDetailItem({ ...item, status: newStatus })
        }
      } else {
        toast.error('Ошибка при обновлении статуса')
      }
    } catch (err) {
      console.error('Failed to update status:', err)
      toast.error('Ошибка: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка'))
    }
  }

  const handleDelete = async (item: CollectionItem) => {
    toast.dismiss()
    try {
      const res = await fetch(`/api/collections/${item.id}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) {
        toast.success('Элемент удалён')
        setDetailOpen(false)
        setDetailItem(null)
        fetchItems()
      } else {
        toast.error('Ошибка при удалении элемента')
      }
    } catch (err) {
      console.error('Failed to delete item:', err)
      toast.error('Ошибка: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка'))
    }
  }

  const handleRatingUpdate = async (item: CollectionItem, rating: number) => {
    try {
      const res = await fetch(`/api/collections/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating }),
      })
      const json = await res.json()
      if (json.success) {
        fetchItems()
        if (detailItem && detailItem.id === item.id) {
          setDetailItem({ ...item, rating })
        }
      }
    } catch (err) {
      console.error('Failed to update rating:', err)
    }
  }

  const openDetail = (item: CollectionItem) => {
    setDetailItem(item)
    setDetailOpen(true)
  }

  const statusTransitions: Record<CollectionStatus, CollectionStatus> = {
    WANT: 'IN_PROGRESS',
    IN_PROGRESS: 'COMPLETED',
    COMPLETED: 'WANT',
  }

  // Stats
  const totalCount = items.length
  const completedCount = items.filter((i) => i.status === 'COMPLETED').length
  const inProgressCount = items.filter((i) => i.status === 'IN_PROGRESS').length

  // ======================== Render ========================

  return (
    <div className="animate-slide-up space-y-6">
      {/* Header with decorative gradient blob */}
      <div className="relative">
        {/* Decorative gradient blob */}
        <div className="absolute -top-16 -right-8 w-56 h-56 rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-400/15 blur-3xl pointer-events-none" />
        <div className="absolute -top-8 -left-4 w-40 h-40 rounded-full bg-gradient-to-br from-amber-400/15 to-orange-400/10 blur-3xl pointer-events-none" />

        <div className="relative flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Library className="h-6 w-6" />
              Коллекции
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Книги, фильмы, рецепты и полезные находки
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Добавить
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Новый элемент</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Тип</Label>
                  <Select
                    value={formType}
                    onValueChange={(v) => setFormType(v as CollectionType)}
                  >
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
                    <Select
                      value={formStatus}
                      onValueChange={(v) => setFormStatus(v as CollectionStatus)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(
                          Object.entries(STATUS_LABELS) as [CollectionStatus, string][]
                        ).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
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
                <Button
                  className="w-full"
                  onClick={handleSubmit}
                  disabled={!formTitle.trim()}
                >
                  Добавить в коллекцию
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Type Tabs */}
      <Tabs value={activeType} onValueChange={setActiveType}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="all">Все</TabsTrigger>
          {(
            Object.entries(TYPE_LABELS) as [CollectionType, string][]
          ).map(([key, label]) => (
            <TabsTrigger key={key} value={key}>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Stats Summary Bar */}
        {!loading && totalCount > 0 && (
          <div className="flex items-center gap-3 mt-4 flex-wrap">
            <Badge variant="outline" className="gap-1.5 font-normal text-xs">
              <ListChecks className="h-3 w-3" />
              Всего: {totalCount}
            </Badge>
            <Badge variant="secondary" className="gap-1.5 font-normal text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
              <CheckCircle className="h-3 w-3" />
              Завершено: {completedCount}
            </Badge>
            <Badge variant="secondary" className="gap-1.5 font-normal text-xs bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
              <Loader2 className="h-3 w-3" />
              В процессе: {inProgressCount}
            </Badge>
          </div>
        )}

        {/* Status filter */}
        <div className="flex gap-2 mt-4 flex-wrap">
          <Button
            variant={activeStatus === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveStatus('all')}
          >
            Все статусы
          </Button>
          {(Object.entries(STATUS_LABELS) as [CollectionStatus, string][]).map(
            ([key, label]) => (
              <Button
                key={key}
                variant={activeStatus === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveStatus(key)}
              >
                {label}
              </Button>
            )
          )}
        </div>

        {/* Grid of items (shared across all tabs) */}
        <TabsContent value={activeType} className="mt-4">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-0">
                    <div className="h-32 bg-muted rounded-t-xl" />
                    <div className="p-3 space-y-2">
                      <div className="h-4 bg-muted rounded" />
                      <div className="h-3 bg-muted rounded w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : items.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Library className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
                <p className="text-muted-foreground font-medium">Пусто</p>
                <p className="text-muted-foreground text-sm mt-1">
                  Добавьте первый элемент в коллекцию
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 stagger-children">
              {items.map((item) => (
                <Card
                  key={item.id}
                  className="overflow-hidden hover-lift active-press transition cursor-pointer group"
                  onClick={() => openDetail(item)}
                >
                  {/* Cover placeholder */}
                  <div
                    className={`h-32 bg-gradient-to-br ${getCoverGradient(
                      item.id
                    )} flex items-center justify-center relative overflow-hidden transition-transform duration-300 group-hover:scale-[1.03]`}
                  >
                    <div className="text-white/80 transition-transform duration-300 group-hover:scale-110">
                      {TYPE_ICONS[item.type as CollectionType]}
                    </div>
                    {/* Status badge */}
                    <div className="absolute top-2 right-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[item.status]}`}
                      >
                        {item.status === 'WANT' && (
                          <Heart className="h-2.5 w-2.5" />
                        )}
                        {item.status === 'IN_PROGRESS' && (
                          <Clock className="h-2.5 w-2.5" />
                        )}
                        {item.status === 'COMPLETED' && (
                          <CheckCircle className="h-2.5 w-2.5" />
                        )}
                        {STATUS_LABELS[item.status]}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 space-y-1.5">
                    <h3 className="text-sm font-medium line-clamp-2 leading-snug">
                      {item.title}
                    </h3>
                    {item.author && (
                      <p className="text-xs text-muted-foreground truncate">
                        {item.author}
                      </p>
                    )}
                    {item.rating && (
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < item.rating!
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-muted-foreground/20'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                    <div className="flex gap-1 flex-wrap">
                      {parseTags(item.tags).slice(0, 2).map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-md">
          {detailItem && (
            <>
              {/* Large cover gradient area */}
              <div
                className={`-mx-6 -mt-6 h-24 bg-gradient-to-br ${getCoverGradient(
                  detailItem.id
                )} flex items-center justify-center relative`}
              >
                <div className="text-white/90">
                  {TYPE_ICONS_LARGE[detailItem.type as CollectionType]}
                </div>
                {/* Status badge on cover */}
                <div className="absolute top-3 right-4">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-medium ${STATUS_COLORS[detailItem.status]}`}
                  >
                    {detailItem.status === 'WANT' && (
                      <Heart className="h-2.5 w-2.5" />
                    )}
                    {detailItem.status === 'IN_PROGRESS' && (
                      <Clock className="h-2.5 w-2.5" />
                    )}
                    {detailItem.status === 'COMPLETED' && (
                      <CheckCircle className="h-2.5 w-2.5" />
                    )}
                    {STATUS_LABELS[detailItem.status]}
                  </span>
                </div>
              </div>

              <DialogHeader>
                <div className="min-w-0">
                  <DialogTitle className="text-lg leading-snug">
                    {detailItem.title}
                  </DialogTitle>
                  {detailItem.author && (
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {detailItem.author}
                    </p>
                  )}
                </div>
              </DialogHeader>

              <div className="space-y-4">
                {/* Type, Status, and Created Date */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline">
                    {TYPE_LABELS[detailItem.type as CollectionType]}
                  </Badge>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[detailItem.status]}`}
                  >
                    {STATUS_LABELS[detailItem.status]}
                  </span>
                  <Badge variant="secondary" className="gap-1 font-normal text-[11px]">
                    <CalendarDays className="h-3 w-3" />
                    Создано {formatDateRussian(detailItem.createdAt)}
                  </Badge>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Рейтинг:</Label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() =>
                          handleRatingUpdate(
                            detailItem,
                            detailItem.rating === star ? 0 : star
                          )
                        }
                        className="p-0.5"
                      >
                        <Star
                          className={`h-5 w-5 transition ${
                            star <= (detailItem.rating || 0)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-muted-foreground/30'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                {detailItem.description && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Описание</Label>
                    <p className="text-sm mt-1">{detailItem.description}</p>
                  </div>
                )}

                {/* Tags */}
                {parseTags(detailItem.tags).length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {parseTags(detailItem.tags).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Notes */}
                {detailItem.notes && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Заметки</Label>
                    <p className="text-sm mt-1">{detailItem.notes}</p>
                  </div>
                )}

                <Separator />

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className={`flex-1 border ${STATUS_BUTTON_STYLES[detailItem.status]}`}
                    onClick={() =>
                      handleStatusUpdate(detailItem, statusTransitions[detailItem.status])
                    }
                  >
                    {detailItem.status === 'WANT' && <Clock className="h-4 w-4 mr-2" />}
                    {detailItem.status === 'IN_PROGRESS' && (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    {detailItem.status === 'COMPLETED' && <Heart className="h-4 w-4 mr-2" />}
                    {STATUS_LABELS[statusTransitions[detailItem.status]]}
                  </Button>
                  <Button
                    variant="outline"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(detailItem)}
                  >
                    Удалить
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
