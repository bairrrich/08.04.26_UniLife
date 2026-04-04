'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { safeJson } from '@/lib/safe-fetch'
import type { EntityType, FeedPost, FeedComment } from './types'
import { generateRandomId } from './constants'

// ─── useFeed Hook ─────────────────────────────────────────────────────────────

export function useFeed() {
  // ─── Data state ──────────────────────────────────────────────────────────
  const [posts, setPosts] = useState<FeedPost[]>([])
  const [loading, setLoading] = useState(true)

  // ─── Dialog state ────────────────────────────────────────────────────────
  const [dialogOpen, setDialogOpen] = useState(false)

  // ─── Like / Bookmark state ───────────────────────────────────────────────
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())
  const [likeAnimating, setLikeAnimating] = useState<Set<string>>(new Set())
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set())

  // ─── Comment state ───────────────────────────────────────────────────────
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({})
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set())
  const [showCommentSection, setShowCommentSection] = useState<Set<string>>(new Set())
  const [sendingComment, setSendingComment] = useState<Set<string>>(new Set())

  // ─── Form state ──────────────────────────────────────────────────────────
  const [formEntityType, setFormEntityType] = useState<EntityType>('diary')
  const [formCaption, setFormCaption] = useState('')

  // ─── Fetch Posts ─────────────────────────────────────────────────────────

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/feed?limit=20&offset=0')
      const data: FeedPost[] | null = await safeJson<{ success: boolean; data: FeedPost[] }>(res)
      if (data) {
        setPosts(data.data)
        const liked = new Set<string>(
          data.data.filter((p: FeedPost) => p._count.likes > 0).map((p: FeedPost) => p.id),
        )
        setLikedPosts(liked)
      }
    } catch (err) {
      console.error('Failed to fetch feed:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  // ─── Like / Bookmark / Share ─────────────────────────────────────────────

  const handleToggleLike = (postId: string) => {
    const willLike = !likedPosts.has(postId)
    setLikedPosts((prev) => {
      const next = new Set(prev)
      if (next.has(postId)) next.delete(postId)
      else next.add(postId)
      return next
    })
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              _count: {
                likes: likedPosts.has(postId) ? p._count.likes - 1 : p._count.likes + 1,
              },
            }
          : p,
      ),
    )
    if (willLike) {
      setLikeAnimating((prev) => new Set(prev).add(postId))
      setTimeout(() => {
        setLikeAnimating((prev) => {
          const next = new Set(prev)
          next.delete(postId)
          return next
        })
      }, 300)
    }
  }

  const handleToggleBookmark = (postId: string) => {
    setBookmarkedPosts((prev) => {
      const next = new Set(prev)
      if (next.has(postId)) {
        next.delete(postId)
        toast.info('Запись удалена из сохранённых')
      } else {
        next.add(postId)
        toast.success('Запись сохранена')
      }
      return next
    })
  }

  const handleShare = (post: FeedPost) => {
    const url = `${window.location.origin}/feed?post=${post.id}`
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(url)
        .then(() => toast.success('Ссылка скопирована в буфер обмена'))
        .catch(() => toast.error('Не удалось скопировать ссылку'))
    } else {
      toast.info('Скопируйте ссылку: ' + url)
    }
  }

  // ─── Comments ────────────────────────────────────────────────────────────

  const handleCommentSubmit = async (postId: string) => {
    const text = (commentTexts[postId] || '').trim()
    if (!text || sendingComment.has(postId)) return

    toast.dismiss()
    setSendingComment((prev) => new Set(prev).add(postId))

    const optimisticComment: FeedComment = {
      id: 'opt_' + Date.now(),
      content: text,
      createdAt: new Date().toISOString(),
      user: { id: 'user_demo_001', name: 'Алексей', avatar: null },
    }

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, comments: [...p.comments, optimisticComment] } : p,
      ),
    )
    setCommentTexts((prev) => ({ ...prev, [postId]: '' }))
    setExpandedComments((prev) => new Set(prev).add(postId))
    setShowCommentSection((prev) => new Set(prev).add(postId))

    try {
      const res = await fetch('/api/feed/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, content: text }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const json = await safeJson<{ success: boolean; data: FeedComment }>(res)
      if (json && json.success) {
        toast.success('Комментарий добавлен')
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  comments: p.comments.map((c) => (c.id === optimisticComment.id ? json.data : c)),
                }
              : p,
          ),
        )
      } else {
        toast.error('Ошибка при добавлении комментария')
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, comments: p.comments.filter((c) => c.id !== optimisticComment.id) }
              : p,
          ),
        )
      }
    } catch (err) {
      console.error('Failed to post comment:', err)
      toast.error('Ошибка: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка'))
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, comments: p.comments.filter((c) => c.id !== optimisticComment.id) }
            : p,
        ),
      )
    } finally {
      setSendingComment((prev) => {
        const next = new Set(prev)
        next.delete(postId)
        return next
      })
    }
  }

  const handleCommentKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, postId: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleCommentSubmit(postId)
    }
  }

  const toggleExpandComments = (postId: string) => {
    setExpandedComments((prev) => {
      const next = new Set(prev)
      if (next.has(postId)) next.delete(postId)
      else next.add(postId)
      return next
    })
  }

  const toggleCommentSection = (postId: string) => {
    setShowCommentSection((prev) => {
      const next = new Set(prev)
      if (next.has(postId)) next.delete(postId)
      else next.add(postId)
      return next
    })
  }

  const updateCommentText = (postId: string, text: string) => {
    setCommentTexts((prev) => ({ ...prev, [postId]: text }))
  }

  // ─── Submit Post ─────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!formCaption.trim()) return
    toast.dismiss()
    try {
      const entityId = generateRandomId()
      const res = await fetch('/api/feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityType: formEntityType, entityId, caption: formCaption.trim() }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const json = await safeJson<{ success: boolean }>(res)
      if (json && json.success) {
        toast.success('Запись опубликована')
        setDialogOpen(false)
        setFormEntityType('diary')
        setFormCaption('')
        fetchPosts()
      } else {
        toast.error('Ошибка при публикации записи')
      }
    } catch (err) {
      console.error('Failed to create post:', err)
      toast.error('Ошибка: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка'))
    }
  }

  // ─── Return everything needed by the page ────────────────────────────────

  return {
    // State
    posts,
    loading,
    dialogOpen,
    likedPosts,
    likeAnimating,
    bookmarkedPosts,
    commentTexts,
    expandedComments,
    showCommentSection,
    sendingComment,
    formEntityType,
    formCaption,

    // Setters
    setDialogOpen,
    setFormEntityType,
    setFormCaption,

    // Handlers
    fetchPosts,
    handleToggleLike,
    handleToggleBookmark,
    handleShare,
    handleCommentSubmit,
    handleCommentKeyDown,
    toggleExpandComments,
    toggleCommentSection,
    updateCommentText,
    handleSubmit,
  }
}
