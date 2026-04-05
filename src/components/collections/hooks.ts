'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { safeJson } from '@/lib/safe-fetch'
import { toast } from 'sonner'
import type { CollectionType, CollectionItem } from './types'
import type { SortOption } from './constants'
import { parseTags } from './constants'

export function useCollections() {
  // ── List state ──────────────────────────────────────────────────────────────
  const [items, setItems] = useState<CollectionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeType, setActiveType] = useState<string>('all')
  const [sortBy, setSortBy] = useState<SortOption>('date')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('unilife-collection-favorites')
        return saved ? new Set(JSON.parse(saved) as string[]) : new Set<string>()
      } catch { return new Set<string>() }
    }
    return new Set<string>()
  })

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
  const [formTags, setFormTags] = useState('')
  const [formCoverUrl, setFormCoverUrl] = useState('')
  const [formNotes, setFormNotes] = useState('')
  const [formDetails, setFormDetails] = useState<Record<string, string>>({})

  // ── Edit form state ─────────────────────────────────────────────────────────
  const [editTitle, setEditTitle] = useState('')
  const [editAuthor, setEditAuthor] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editType, setEditType] = useState<CollectionType>('BOOK')
  const [editTags, setEditTags] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [editRating, setEditRating] = useState(0)
  const [editDetails, setEditDetails] = useState<Record<string, string>>({})

  // ── Data fetching ───────────────────────────────────────────────────────────
  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (activeType !== 'all') params.set('type', activeType)
      const res = await fetch(`/api/collections?${params.toString()}`)
      const json = await safeJson<{ success: boolean; data: CollectionItem[] }>(res)
      if (json?.success) setItems(json.data)
    } catch (err) {
      console.error('Failed to fetch collections:', err)
    } finally {
      setLoading(false)
    }
  }, [activeType])

  useEffect(() => { fetchItems() }, [fetchItems])

  // ── Sorted, filtered & searched items ────────────────────────────────────
  const TYPE_ORDER: Record<string, number> = {
    BOOK: 0, MOVIE: 1, ANIME: 2, SERIES: 3, MUSIC: 4,
    RECIPE: 5, SUPPLEMENT: 6, PRODUCT: 7, PLACE: 8,
  }
  const sortedItems = useMemo(() => {
    let filtered = [...items]
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          (i.author && i.author.toLowerCase().includes(q))
      )
    }
    // Sort
    switch (sortBy) {
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case 'name':
        filtered.sort((a, b) => a.title.localeCompare(b.title, 'ru'))
        break
      case 'type':
        filtered.sort((a, b) => (TYPE_ORDER[a.type] ?? 0) - (TYPE_ORDER[b.type] ?? 0))
        break
      case 'date':
      default:
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
    }
    return filtered
  }, [items, sortBy, searchQuery])

  // ── Computed stats ──────────────────────────────────────────────────────────
  const totalCount = items.length
  const averageRating = useMemo(() => {
    const rated = items.filter((i) => i.rating && i.rating > 0)
    if (rated.length === 0) return 0
    return rated.reduce((sum, i) => sum + (i.rating || 0), 0) / rated.length
  }, [items])

  // ── Type counts breakdown ──────────────────────────────────────────────────
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    items.forEach((i) => {
      counts[i.type] = (counts[i.type] || 0) + 1
    })
    return counts
  }, [items])

  // ── Related items (same type, different items) ────────────────────────────
  const getRelatedItems = useCallback((item: CollectionItem) => {
    return items.filter((i) => i.type === item.type && i.id !== item.id).slice(0, 3)
  }, [items])

  // ── Favorites ──────────────────────────────────────────────────────────────
  const toggleFavorite = useCallback((itemId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(itemId)) {
        next.delete(itemId)
        toast.success('Удалено из избранного')
      } else {
        next.add(itemId)
        toast.success('Добавлено в избранное')
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('unilife-collection-favorites', JSON.stringify([...next]))
      }
      return next
    })
  }, [])

  // ── Quick add from template ─────────────────────────────────────────────────
  const openQuickAdd = (type: CollectionType) => {
    resetForm()
    setFormType(type)
    setDialogOpen(true)
  }

  // ── Handlers ────────────────────────────────────────────────────────────────
  const resetForm = () => {
    setFormType('BOOK'); setFormTitle(''); setFormAuthor('')
    setFormDescription(''); setFormRating(0); setFormTags('')
    setFormCoverUrl(''); setFormNotes(''); setFormDetails({})
  }

  const handleSubmit = async () => {
    if (!formTitle.trim()) return
    const tags = formTags.split(',').map((t) => t.trim()).filter(Boolean)
    // Clean empty values from details
    const cleanDetails: Record<string, string> = {}
    for (const [k, v] of Object.entries(formDetails)) {
      if (v !== '' && v !== undefined) cleanDetails[k] = v
    }
    toast.dismiss()
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: formType, title: formTitle.trim(),
          author: formAuthor.trim() || null, description: formDescription.trim() || null,
          rating: formRating > 0 ? formRating : null,
          tags: tags.length > 0 ? tags : [],
          notes: formNotes.trim() || null,
          coverUrl: formCoverUrl.trim() || null,
          details: cleanDetails,
        }),
      })
      const json = await safeJson<{ success: boolean }>(res)
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

  const handleDelete = async (item: CollectionItem) => {
    toast.dismiss()
    try {
      const res = await fetch(`/api/collections/${item.id}`, { method: 'DELETE' })
      const json = await safeJson<{ success: boolean }>(res)
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
      const json = await safeJson<{ success: boolean }>(res)
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
    setEditType(detailItem.type as CollectionType)
    setEditTags(parseTags(detailItem.tags).join(', ')); setEditNotes(detailItem.notes || '')
    setEditRating(detailItem.rating || 0); setIsEditing(true)
    // Parse details JSON into editDetails
    try {
      const parsed = JSON.parse(detailItem.details || '{}')
      const stringDetails: Record<string, string> = {}
      for (const [k, v] of Object.entries(parsed)) {
        if (v !== null && v !== undefined) stringDetails[k] = String(v)
      }
      setEditDetails(stringDetails)
    } catch {
      setEditDetails({})
    }
  }

  const handleEditSave = async () => {
    if (!detailItem || !editTitle.trim()) return
    toast.dismiss(); setEditSaving(true)
    const tags = editTags.split(',').map((t) => t.trim()).filter(Boolean)
    // Clean empty values from details
    const cleanDetails: Record<string, string> = {}
    for (const [k, v] of Object.entries(editDetails)) {
      if (v !== '' && v !== undefined) cleanDetails[k] = v
    }
    try {
      const res = await fetch(`/api/collections/${detailItem.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: editType, title: editTitle.trim(),
          author: editAuthor.trim() || null, description: editDescription.trim() || null,
          rating: editRating > 0 ? editRating : null,
          tags: tags.length > 0 ? tags : [], notes: editNotes.trim() || null,
          details: cleanDetails,
        }),
      })
      const json = await safeJson<{ success: boolean }>(res)
      if (json && json.success) {
        toast.success('Элемент обновлён')
        setDetailItem({
          ...detailItem, type: editType, title: editTitle.trim(),
          author: editAuthor.trim() || null, description: editDescription.trim() || null,
          rating: editRating > 0 ? editRating : null,
          tags: tags.length > 0 ? JSON.stringify(tags) : '[]',
          notes: editNotes.trim() || null, updatedAt: new Date().toISOString(),
          details: JSON.stringify(cleanDetails),
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
    loading, activeType, sortBy,
    searchQuery, viewMode, favorites,
    dialogOpen, detailItem, detailOpen,
    isEditing, editSaving,

    // setters
    setActiveType, setDialogOpen, setSortBy,
    setSearchQuery, setViewMode, toggleFavorite,

    // add form
    formType, setFormType, formTitle, setFormTitle,
    formAuthor, setFormAuthor, formDescription, setFormDescription,
    formRating, setFormRating,
    formTags, setFormTags,
    formCoverUrl, setFormCoverUrl,
    formNotes, setFormNotes,
    formDetails, setFormDetails,

    // edit form
    editTitle, setEditTitle, editAuthor, setEditAuthor,
    editDescription, setEditDescription, editType, setEditType,
    editTags, setEditTags,
    editNotes, setEditNotes, editRating, setEditRating,
    editDetails, setEditDetails,

    // handlers
    handleSubmit, handleDelete,
    handleRatingUpdate, openDetail, startEditing,
    handleEditSave, closeDetail, cancelEdit, openQuickAdd,

    // computed
    totalCount, averageRating,
    typeCounts, getRelatedItems,
  }
}
