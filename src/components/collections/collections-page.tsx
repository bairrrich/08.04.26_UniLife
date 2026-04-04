'use client'

import { useState, useEffect, useCallback } from 'react'
import { safeJson } from '@/lib/safe-fetch'
import { Library, Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { toast } from 'sonner'
import type { CollectionType, CollectionStatus, CollectionItem } from './types'
import { TYPE_LABELS, STATUS_LABELS, parseTags } from './constants'
import { StatsBar } from './stats-bar'
import { ItemCard } from './item-card'
import { AddItemDialog } from './add-item-dialog'
import { ItemDialog } from './item-dialog'

export default function CollectionsPage() {
  const [items, setItems] = useState<CollectionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeType, setActiveType] = useState<string>('all')
  const [activeStatus, setActiveStatus] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailItem, setDetailItem] = useState<CollectionItem | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editSaving, setEditSaving] = useState(false)

  // Edit form state
  const [editTitle, setEditTitle] = useState('')
  const [editAuthor, setEditAuthor] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editType, setEditType] = useState<CollectionType>('BOOK')
  const [editStatus, setEditStatus] = useState<CollectionStatus>('WANT')
  const [editTags, setEditTags] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [editRating, setEditRating] = useState(0)

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
      const json = await safeJson(res)
      if (json.success) setItems(json.data)
    } catch (err) {
      console.error('Failed to fetch collections:', err)
    } finally {
      setLoading(false)
    }
  }, [activeType, activeStatus])

  useEffect(() => { fetchItems() }, [fetchItems])

  const resetForm = () => {
    setFormType('BOOK'); setFormTitle(''); setFormAuthor('')
    setFormDescription(''); setFormRating(0); setFormStatus('WANT'); setFormTags('')
  }

  const handleSubmit = async () => {
    if (!formTitle.trim()) return
    const tags = formTags.split(',').map((t) => t.trim()).filter(Boolean)
    toast.dismiss()
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: formType, title: formTitle.trim(),
          author: formAuthor.trim() || null, description: formDescription.trim() || null,
          rating: formRating > 0 ? formRating : null, status: formStatus,
          tags: tags.length > 0 ? tags : [],
        }),
      })
      const json = await safeJson(res)
      if (json && json.success) {
        toast.success('Элемент добавлен в коллекцию')
        setDialogOpen(false); resetForm(); fetchItems()
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
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const json = await safeJson(res)
      if (json && json.success) {
        toast.success('Статус обновлён'); fetchItems()
        if (detailItem && detailItem.id === item.id) setDetailItem({ ...item, status: newStatus })
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
      const json = await safeJson(res)
      if (json && json.success) {
        toast.success('Элемент удалён'); setDetailOpen(false); setDetailItem(null); fetchItems()
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
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating }),
      })
      const json = await safeJson(res)
      if (json && json.success) {
        fetchItems()
        if (detailItem && detailItem.id === item.id) setDetailItem({ ...item, rating })
      }
    } catch (err) {
      console.error('Failed to update rating:', err)
    }
  }

  const openDetail = (item: CollectionItem) => {
    setDetailItem(item); setDetailOpen(true); setIsEditing(false)
  }

  const startEditing = () => {
    if (!detailItem) return
    setEditTitle(detailItem.title); setEditAuthor(detailItem.author || '')
    setEditDescription(detailItem.description || '')
    setEditType(detailItem.type as CollectionType); setEditStatus(detailItem.status as CollectionStatus)
    setEditTags(parseTags(detailItem.tags).join(', ')); setEditNotes(detailItem.notes || '')
    setEditRating(detailItem.rating || 0); setIsEditing(true)
  }

  const handleEditSave = async () => {
    if (!detailItem || !editTitle.trim()) return
    toast.dismiss(); setEditSaving(true)
    const tags = editTags.split(',').map((t) => t.trim()).filter(Boolean)
    try {
      const res = await fetch(`/api/collections/${detailItem.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: editType, title: editTitle.trim(),
          author: editAuthor.trim() || null, description: editDescription.trim() || null,
          rating: editRating > 0 ? editRating : null, status: editStatus,
          tags: tags.length > 0 ? tags : [], notes: editNotes.trim() || null,
        }),
      })
      const json = await safeJson(res)
      if (json && json.success) {
        toast.success('Элемент обновлён')
        setDetailItem({
          ...detailItem, type: editType, title: editTitle.trim(),
          author: editAuthor.trim() || null, description: editDescription.trim() || null,
          rating: editRating > 0 ? editRating : null, status: editStatus,
          tags: tags.length > 0 ? JSON.stringify(tags) : '[]',
          notes: editNotes.trim() || null, updatedAt: new Date().toISOString(),
        })
        setIsEditing(false); fetchItems()
      } else {
        toast.error('Ошибка при обновлении элемента')
      }
    } catch (err) {
      console.error('Failed to update item:', err)
      toast.error('Ошибка: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка'))
    } finally {
      setEditSaving(false)
    }
  }

  // Stats
  const totalCount = items.length
  const completedCount = items.filter((i) => i.status === 'COMPLETED').length
  const inProgressCount = items.filter((i) => i.status === 'IN_PROGRESS').length

  return (
    <div className="animate-slide-up space-y-6">
      {/* Header with decorative gradient blob */}
      <div className="relative">
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
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />Добавить
          </Button>
          <AddItemDialog
            open={dialogOpen} onOpenChange={setDialogOpen}
            formType={formType} setFormType={setFormType}
            formTitle={formTitle} setFormTitle={setFormTitle}
            formAuthor={formAuthor} setFormAuthor={setFormAuthor}
            formDescription={formDescription} setFormDescription={setFormDescription}
            formRating={formRating} setFormRating={setFormRating}
            formStatus={formStatus} setFormStatus={setFormStatus}
            formTags={formTags} setFormTags={setFormTags}
            onSubmit={handleSubmit}
          />
        </div>
      </div>

      {/* Type Tabs */}
      <Tabs value={activeType} onValueChange={setActiveType}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="all">Все</TabsTrigger>
          {(Object.entries(TYPE_LABELS) as [CollectionType, string][]).map(([key, label]) => (
            <TabsTrigger key={key} value={key}>{label}</TabsTrigger>
          ))}
        </TabsList>

        <StatsBar loading={loading} totalCount={totalCount} completedCount={completedCount} inProgressCount={inProgressCount} />

        {/* Status filter */}
        <div className="flex gap-2 mt-4 flex-wrap">
          <Button variant={activeStatus === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setActiveStatus('all')}>
            Все статусы
          </Button>
          {(Object.entries(STATUS_LABELS) as [CollectionStatus, string][]).map(([key, label]) => (
            <Button key={key} variant={activeStatus === key ? 'default' : 'outline'} size="sm" onClick={() => setActiveStatus(key)}>
              {label}
            </Button>
          ))}
        </div>

        {/* Grid of items */}
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
                <p className="text-muted-foreground text-sm mt-1">Добавьте первый элемент в коллекцию</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 stagger-children">
              {items.map((item) => (
                <ItemCard key={item.id} item={item} onClick={openDetail} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <ItemDialog
        item={detailItem} open={detailOpen}
        onOpenChange={(open) => { if (!open) setIsEditing(false); setDetailOpen(open) }}
        isEditing={isEditing}
        editTitle={editTitle} editAuthor={editAuthor} editDescription={editDescription}
        editType={editType} editStatus={editStatus} editTags={editTags}
        editNotes={editNotes} editRating={editRating} editSaving={editSaving}
        setEditTitle={setEditTitle} setEditAuthor={setEditAuthor}
        setEditDescription={setEditDescription} setEditType={setEditType}
        setEditStatus={setEditStatus} setEditTags={setEditTags}
        setEditNotes={setEditNotes} setEditRating={setEditRating}
        onStartEdit={startEditing} onCancelEdit={() => setIsEditing(false)}
        onSaveEdit={handleEditSave}
        onStatusUpdate={handleStatusUpdate} onDelete={handleDelete}
        onRatingUpdate={handleRatingUpdate}
      />
    </div>
  )
}
