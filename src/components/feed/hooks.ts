'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { safeJson } from '@/lib/safe-fetch'
import type { EntityType, FeedPost, FeedComment, ReactionType, ReactionCounts } from './types'
import { generateRandomId, getTimeGroup } from './constants'

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

  // ─── Reaction state ─────────────────────────────────────────────────────
  const [userReactions, setUserReactions] = useState<Record<string, ReactionType>>({})
  const [reactionCounts, setReactionCounts] = useState<Record<string, ReactionCounts>>({})
  const [reactionAnimating, setReactionAnimating] = useState<Set<string>>(new Set())

  // ─── Comment state ───────────────────────────────────────────────────────
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({})
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set())
  const [showCommentSection, setShowCommentSection] = useState<Set<string>>(new Set())
  const [sendingComment, setSendingComment] = useState<Set<string>>(new Set())

  // ─── Form state ──────────────────────────────────────────────────────────
  const [formEntityType, setFormEntityType] = useState<EntityType>('diary')
  const [formCaption, setFormCaption] = useState('')
  const [formTags, setFormTags] = useState('')

  // ─── Fetch Posts ─────────────────────────────────────────────────────────

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/feed?limit=50&offset=0')
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

  // ─── Time-grouped posts ──────────────────────────────────────────────────

  const groupedPosts = useMemo(() => {
    const groups: Record<string, FeedPost[]> = {}
    const order: string[] = []

    for (const post of posts) {
      const group = getTimeGroup(post.createdAt)
      if (!groups[group]) {
        groups[group] = []
        order.push(group)
      }
      groups[group].push(post)
    }

    // Order: Сегодня → Вчера → На этой неделе → Ранее
    const canonicalOrder = ['Сегодня', 'Вчера', 'На этой неделе', 'Ранее']
    return canonicalOrder
      .filter((g) => groups[g]?.length)
      .map((g) => ({ label: g, posts: groups[g] }))
  }, [posts])

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

  // ─── Reactions ──────────────────────────────────────────────────────────

  const handleToggleReaction = (postId: string, reactionType: ReactionType) => {
    const currentReaction = userReactions[postId]
    const willReact = currentReaction !== reactionType

    // Update user reaction
    setUserReactions((prev) => {
      const next = { ...prev }
      if (willReact) {
        next[postId] = reactionType
      } else {
        delete next[postId]
      }
      return next
    })

    // Update reaction counts
    setReactionCounts((prev) => {
      const current = prev[postId] || { like: 0, love: 0, fire: 0, applause: 0, wow: 0 }
      const next = { ...current }

      if (currentReaction && currentReaction !== reactionType) {
        // Remove previous reaction, add new one
        next[currentReaction] = Math.max(0, next[currentReaction] - 1)
        next[reactionType] = next[reactionType] + 1
      } else if (willReact) {
        next[reactionType] = next[reactionType] + 1
      } else {
        next[reactionType] = Math.max(0, next[reactionType] - 1)
      }

      return { ...prev, [postId]: next }
    })

    // Animate
    if (willReact) {
      setReactionAnimating((prev) => new Set(prev).add(postId))
      setTimeout(() => {
        setReactionAnimating((prev) => {
          const next = new Set(prev)
          next.delete(postId)
          return next
        })
      }, 400)
    }

    // Also toggle like state for backward compatibility
    if (willReact && !likedPosts.has(postId)) {
      setLikedPosts((prev) => new Set(prev).add(postId))
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, _count: { likes: p._count.likes + 1 } } : p,
        ),
      )
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
      const tags = formTags.split(',').map((t) => t.trim()).filter(Boolean)
      const res = await fetch('/api/feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType: formEntityType,
          entityId,
          caption: formCaption.trim(),
          tags: tags.length > 0 ? tags : [],
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const json = await safeJson<{ success: boolean }>(res)
      if (json && json.success) {
        toast.success('Запись опубликована')
        setDialogOpen(false)
        setFormEntityType('diary')
        setFormCaption('')
        setFormTags('')
        fetchPosts()
      } else {
        toast.error('Ошибка при публикации записи')
      }
    } catch (err) {
      console.error('Failed to create post:', err)
      toast.error('Ошибка: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка'))
    }
  }

  // ─── Delete Post ─────────────────────────────────────────────────────────

  const handleDeletePost = useCallback(async (postId: string) => {
    toast.dismiss()

    // Optimistic removal
    const previousPosts = posts
    setPosts((prev) => prev.filter((p) => p.id !== postId))

    try {
      const res = await fetch(`/api/feed?id=${postId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const json = await safeJson<{ success: boolean }>(res)
      if (json && json.success) {
        toast.success('Запись удалена')
      } else {
        // Re-fetch on failure
        setPosts(previousPosts)
        await fetchPosts()
        toast.error('Ошибка при удалении записи')
      }
    } catch (err) {
      console.error('Failed to delete post:', err)
      setPosts(previousPosts)
      await fetchPosts()
      toast.error('Ошибка: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка'))
    }
  }, [posts, fetchPosts])

  // ─── Return everything needed by the page ────────────────────────────────

  return {
    // State
    posts,
    loading,
    groupedPosts,
    dialogOpen,
    likedPosts,
    likeAnimating,
    bookmarkedPosts,
    userReactions,
    reactionCounts,
    reactionAnimating,
    commentTexts,
    expandedComments,
    showCommentSection,
    sendingComment,
    formEntityType,
    formCaption,
    formTags,

    // Setters
    setDialogOpen,
    setFormEntityType,
    setFormCaption,
    setFormTags,

    // Handlers
    fetchPosts,
    handleToggleLike,
    handleToggleBookmark,
    handleShare,
    handleToggleReaction,
    handleCommentSubmit,
    handleCommentKeyDown,
    toggleExpandComments,
    toggleCommentSection,
    updateCommentText,
    handleSubmit,
    handleDeletePost,
  }
}
