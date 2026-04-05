'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { safeJson } from '@/lib/safe-fetch'
import { toast } from 'sonner'
import type { CollectionType, CollectionStatus, CollectionItem } from './types'
import type { SortOption } from './constants'
import { parseTags } from './constants'

// ─── useCollections ────────────────────────────────────────────────────────────

export function useCollections() {
  // ── List state ──────────────────────────────────────────────────────────────
  const [items, setItems] = useState<CollectionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeType, setActiveType] = useState<string>('all')
  const [activeStatus, setActiveStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<SortOption>('date')

  // ── Dialog state ────────────────────────────────────────────────────────────
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailItem, setDetailItem] = useState<CollectionItem | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editSaving, setEditSaving] = useState(false)

  // ── Add-item form state ─────────────────────────────────────────────────────
  const [formType, setFormType] = useState<CollectionType>('BOOK')
  const [formTitle, setFormTitle] = useState('')
  const [formAuthor, setFormAuthor] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formRating, setFormRating] = useState(0)
  const [formStatus, setFormStatus] = useState<CollectionStatus>('WANT')
  const [formTags, setFormTags] = useState('')

  // ── Edit form state ─────────────────────────────────────────────────────────
  const [editTitle, setEditTitle] = useState('')
  const [editAuthor, setEditAuthor] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editType, setEditType] = useState<CollectionType>('BOOK')
  const [editStatus, setEditStatus] = useState<CollectionStatus>('WANT')
  const [editTags, setEditTags] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [editRating, setEditRating] = useState(0)

  // ── Data fetching ───────────────────────────────────────────────────────────
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

  // ── Sorted & filtered items ────────────────────────────────────────────────
  const sortedItems = useMemo(() => {
    const sorted = [...items]
    switch (sortBy) {
      case 'rating':
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case 'name':
        sorted.sort((a, b) => a.title.localeCompare(b.title, 'ru'))
        break
      case 'date':
      default:
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
    }
    return sorted
  }, [items, sortBy])

  // ── Computed stats ──────────────────────────────────────────────────────────
  const totalCount = items.length
  const completedCount = items.filter((i) => i.status === 'COMPLETED').length
  const inProgressCount = items.filter((i) => i.status === 'IN_PROGRESS').length
  const averageRating = useMemo(() => {
    const rated = items.filter((i) => i.rating && i.rating > 0)
    if (rated.length === 0) return 0
    return rated.reduce((sum, i) => sum + (i.rating || 0), 0) / rated.length
  }, [items])

  // ── Quick add from template ─────────────────────────────────────────────────
  const openQuickAdd = (type: CollectionType) => {
    resetForm()
    setFormType(type)
    setDialogOpen(true)
  }

  // ── Handlers ────────────────────────────────────────────────────────────────
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

  const closeDetail = (open: boolean) => {
    if (!open) setIsEditing(false)
    setDetailOpen(open)
  }

  const cancelEdit = () => setIsEditing(false)

  return {
    // state
    items: sortedItems,
    loading, activeType, activeStatus, sortBy,
    dialogOpen, detailItem, detailOpen,
    isEditing, editSaving,

    // setters
    setActiveType, setActiveStatus, setDialogOpen, setSortBy,

    // add form
    formType, setFormType, formTitle, setFormTitle,
    formAuthor, setFormAuthor, formDescription, setFormDescription,
    formRating, setFormRating, formStatus, setFormStatus,
    formTags, setFormTags,

    // edit form
    editTitle, setEditTitle, editAuthor, setEditAuthor,
    editDescription, setEditDescription, editType, setEditType,
    editStatus, setEditStatus, editTags, setEditTags,
    editNotes, setEditNotes, editRating, setEditRating,

    // handlers
    handleSubmit, handleStatusUpdate, handleDelete,
    handleRatingUpdate, openDetail, startEditing,
    handleEditSave, closeDetail, cancelEdit, openQuickAdd,

    // computed
    totalCount, completedCount, inProgressCount, averageRating,
  }
}
