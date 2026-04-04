'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Rss,
  Heart,
  MessageCircle,
  Share2,
  Plus,
  ThumbsUp,
  BookOpen,
  Wallet,
  Apple,
  Dumbbell,
  Library,
  Sparkles,
  Clock,
  Camera,
  Bookmark,
  BookmarkCheck,
  Send,
  SmilePlus,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { cn } from '@/lib/utils'
import { safeJson } from '@/lib/safe-fetch'

// ======================== Types ========================

type EntityType = 'diary' | 'transaction' | 'meal' | 'workout' | 'collection'

interface FeedUser {
  id: string
  name: string | null
  avatar: string | null
}

interface FeedComment {
  id: string
  content: string
  createdAt: string
  user: FeedUser
}

interface FeedPost {
  id: string
  userId: string
  entityType: EntityType
  entityId: string
  caption: string | null
  createdAt: string
  updatedAt: string
  user: FeedUser
  likes: { id: string }[]
  comments: FeedComment[]
  _count: { likes: number }
}

// ======================== Constants ========================

const ENTITY_LABELS: Record<EntityType, string> = {
  diary: '📝 Дневник',
  transaction: '💰 Финансы',
  meal: '🍎 Питание',
  workout: '💪 Тренировка',
  collection: '📚 Коллекции',
}

const ENTITY_ICONS: Record<EntityType, React.ReactNode> = {
  diary: <BookOpen className="h-4 w-4" />,
  transaction: <Wallet className="h-4 w-4" />,
  meal: <Apple className="h-4 w-4" />,
  workout: <Dumbbell className="h-4 w-4" />,
  collection: <Library className="h-4 w-4" />,
}

const ENTITY_COLORS: Record<EntityType, string> = {
  diary: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  transaction: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  meal: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  workout: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  collection: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
}

const ENTITY_BORDER: Record<EntityType, string> = {
  diary: 'border-l-blue-500',
  transaction: 'border-l-emerald-500',
  meal: 'border-l-rose-500',
  workout: 'border-l-orange-500',
  collection: 'border-l-purple-500',
}

const QUICK_EMOJIS = ['😊', '🔥', '💪', '🎉', '❤️', '🌟', '📚', '🏃']

const MAX_CAPTION_LENGTH = 500
const MAX_COMMENT_LENGTH = 300

// ======================== Relative Time ========================

function formatRelativeTime(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMin / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMin < 1) return 'только что'
  if (diffMin < 60) {
    const lastDigit = diffMin % 10
    const lastTwo = diffMin % 100
    if (lastTwo >= 11 && lastTwo <= 19) return `${diffMin} минут назад`
    if (lastDigit === 1) return `${diffMin} минуту назад`
    if (lastDigit >= 2 && lastDigit <= 4) return `${diffMin} минуты назад`
    return `${diffMin} минут назад`
  }
  if (diffHours < 24) {
    const lastDigit = diffHours % 10
    const lastTwo = diffHours % 100
    if (lastTwo >= 11 && lastTwo <= 19) return `${diffHours} часов назад`
    if (lastDigit === 1) return `${diffHours} час назад`
    if (lastDigit >= 2 && lastDigit <= 4) return `${diffHours} часа назад`
    return `${diffHours} часов назад`
  }
  if (diffDays === 1) return 'вчера'
  if (diffDays < 7) {
    const lastDigit = diffDays % 10
    const lastTwo = diffDays % 100
    if (lastTwo >= 11 && lastTwo <= 19) return `${diffDays} дней назад`
    if (lastDigit === 1) return `${diffDays} день назад`
    if (lastDigit >= 2 && lastDigit <= 4) return `${diffDays} дня назад`
    return `${diffDays} дней назад`
  }
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    const lastDigit = weeks % 10
    const lastTwo = weeks % 100
    if (lastTwo >= 11 && lastTwo <= 19) return `${weeks} недель назад`
    if (lastDigit === 1) return `${weeks} неделю назад`
    if (lastDigit >= 2 && lastDigit <= 4) return `${weeks} недели назад`
    return `${weeks} недель назад`
  }
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  })
}

// ======================== Helper ========================

function generateRandomId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
}

// ======================== Component ========================

export function FeedPage() {
  const [posts, setPosts] = useState<FeedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())

  // Like animation state: track post IDs that just got liked for the scale pop
  const [likeAnimating, setLikeAnimating] = useState<Set<string>>(new Set())

  // Bookmarked posts
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set())

  // Comment state: text input per post
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({})
  // Expanded comments state: which posts show all comments
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set())
  // Comment section visibility: which posts show the comment area
  const [showCommentSection, setShowCommentSection] = useState<Set<string>>(new Set())
  // Comment sending state per post
  const [sendingComment, setSendingComment] = useState<Set<string>>(new Set())

  // Form state
  const [formEntityType, setFormEntityType] = useState<EntityType>('diary')
  const [formCaption, setFormCaption] = useState('')

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/feed?limit=20&offset=0')
      const data: FeedPost[] | null = await safeJson<{ success: boolean; data: FeedPost[] }>(res)
      if (data) {
        setPosts(data.data)
        // Track which posts are liked (simulate - all likes are "ours" for demo)
        const liked = new Set<string>(
          data.data
            .filter((p: FeedPost) => p._count.likes > 0)
            .map((p: FeedPost) => p.id)
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

  const handleToggleLike = (postId: string) => {
    const willLike = !likedPosts.has(postId)

    // Optimistic update
    setLikedPosts((prev) => {
      const next = new Set(prev)
      if (next.has(postId)) {
        next.delete(postId)
      } else {
        next.add(postId)
      }
      return next
    })

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              _count: {
                likes: likedPosts.has(postId)
                  ? p._count.likes - 1
                  : p._count.likes + 1,
              },
            }
          : p
      )
    )

    // Trigger like animation if we just liked
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

  const handleCommentSubmit = async (postId: string) => {
    const text = (commentTexts[postId] || '').trim()
    if (!text || sendingComment.has(postId)) return

    toast.dismiss()
    setSendingComment((prev) => new Set(prev).add(postId))

    // Build optimistic comment
    const optimisticComment: FeedComment = {
      id: 'opt_' + Date.now(),
      content: text,
      createdAt: new Date().toISOString(),
      user: {
        id: 'user_demo_001',
        name: 'Алексей',
        avatar: null,
      },
    }

    // Optimistically add the comment
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, comments: [...p.comments, optimisticComment] }
          : p
      )
    )

    // Clear input
    setCommentTexts((prev) => ({ ...prev, [postId]: '' }))
    // Auto-expand to show the new comment
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
        // Replace optimistic comment with real one
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  comments: p.comments.map((c) =>
                    c.id === optimisticComment.id ? json.data : c
                  ),
                }
              : p
          )
        )
      } else {
        toast.error('Ошибка при добавлении комментария')
        // Remove optimistic comment on failure
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  comments: p.comments.filter((c) => c.id !== optimisticComment.id),
                }
              : p
          )
        )
      }
    } catch (err) {
      console.error('Failed to post comment:', err)
      toast.error('Ошибка: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка'))
      // Remove optimistic comment on failure
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                comments: p.comments.filter((c) => c.id !== optimisticComment.id),
              }
            : p
        )
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
      if (next.has(postId)) {
        next.delete(postId)
      } else {
        next.add(postId)
      }
      return next
    })
  }

  const toggleCommentSection = (postId: string) => {
    setShowCommentSection((prev) => {
      const next = new Set(prev)
      if (next.has(postId)) {
        next.delete(postId)
      } else {
        next.add(postId)
      }
      return next
    })
  }

  const handleShare = (post: FeedPost) => {
    const url = `${window.location.origin}/feed?post=${post.id}`
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        toast.success('Ссылка скопирована в буфер обмена')
      }).catch(() => {
        toast.error('Не удалось скопировать ссылку')
      })
    } else {
      toast.info('Скопируйте ссылку: ' + url)
    }
  }

  const handleInsertEmoji = (emoji: string) => {
    if (formCaption.length < MAX_CAPTION_LENGTH) {
      setFormCaption((prev) => prev + emoji)
    }
  }

  const resetForm = () => {
    setFormEntityType('diary')
    setFormCaption('')
  }

  const handleSubmit = async () => {
    if (!formCaption.trim()) return

    toast.dismiss()
    try {
      const entityId = generateRandomId()
      const res = await fetch('/api/feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType: formEntityType,
          entityId,
          caption: formCaption.trim(),
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await safeJson<{ success: boolean }>(res)
      if (json && json.success) {
        toast.success('Запись опубликована')
        setDialogOpen(false)
        resetForm()
        fetchPosts()
      } else {
        toast.error('Ошибка при публикации записи')
      }
    } catch (err) {
      console.error('Failed to create post:', err)
      toast.error('Ошибка: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка'))
    }
  }

  // ======================== Render ========================

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Rss className="h-6 w-6" />
            Лента
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Делитесь достижениями и моментами
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Опубликовать
            </Button>
          </DialogTrigger>
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
                    if (e.target.value.length <= MAX_CAPTION_LENGTH) {
                      setFormCaption(e.target.value)
                    }
                  }}
                  rows={4}
                  className="resize-none focus-glow"
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Макс. {MAX_CAPTION_LENGTH} символов
                  </span>
                  <span className={cn(
                    'text-xs tabular-nums',
                    formCaption.length > MAX_CAPTION_LENGTH * 0.9
                      ? 'text-amber-500'
                      : 'text-muted-foreground'
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
                      key={emoji}
                      type="button"
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
                <Select
                  value={formEntityType}
                  onValueChange={(v) => setFormEntityType(v as EntityType)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(
                      Object.entries(ENTITY_LABELS) as [EntityType, string][]
                    ).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={!formCaption.trim()}
              >
                <Send className="h-4 w-4 mr-2" />
                Опубликовать
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Feed */}
      <div className="max-w-2xl mx-auto space-y-4 stagger-children">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted" />
                  <div className="space-y-1.5">
                    <div className="h-4 bg-muted rounded w-24" />
                    <div className="h-3 bg-muted rounded w-16" />
                  </div>
                </div>
                <div className="h-16 bg-muted rounded-lg" />
              </CardContent>
            </Card>
          ))
        ) : posts.length === 0 ? (
          <Card className="overflow-hidden">
            <CardContent className="py-20 text-center">
              <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full float-animation">
                <div className="absolute h-24 w-24 rounded-full bg-gradient-to-br from-emerald-400/30 via-primary/20 to-amber-400/20 animate-pulse-soft" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400/30 to-primary/20">
                  <Rss className="h-8 w-8 text-primary/70" />
                </div>
              </div>
              <p className="text-muted-foreground font-semibold text-xl mb-2">
                Лента пуста
              </p>
              <p className="text-muted-foreground/70 text-sm max-w-sm mx-auto leading-relaxed">
                Начните делиться своими мыслями, достижениями и моментами дня с друзьями
              </p>
              <Button
                size="lg"
                className="mt-6 gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                onClick={() => setDialogOpen(true)}
              >
                <Sparkles className="h-4 w-4" />
                Создать первую запись
              </Button>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => {
            const isLiked = likedPosts.has(post.id)
            const isAnimating = likeAnimating.has(post.id)
            const isBookmarked = bookmarkedPosts.has(post.id)
            const likeCount = isLiked
              ? Math.max(post._count.likes, 1)
              : post._count.likes

            return (
              <Card
                key={post.id}
                className={`card-hover border-l-4 ${ENTITY_BORDER[post.entityType]} transition hover:bg-muted/50`}
              >
                <CardContent className="p-4 space-y-3">
                  {/* Post header */}
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={post.user.avatar || undefined}
                        alt={post.user.name || 'User'}
                      />
                      <AvatarFallback>
                        {(post.user.name || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {post.user.name || 'Пользователь'}
                      </p>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0 text-[10px] font-medium ${ENTITY_COLORS[post.entityType]}`}
                        >
                          {ENTITY_ICONS[post.entityType]}
                          {ENTITY_LABELS[post.entityType]}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatRelativeTime(post.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleShare(post)}
                        title="Поделиться"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          'h-8 w-8 transition-colors',
                          isBookmarked && 'text-amber-500'
                        )}
                        onClick={() => handleToggleBookmark(post.id)}
                        title={isBookmarked ? 'Убрать из сохранённых' : 'Сохранить'}
                      >
                        {isBookmarked ? (
                          <BookmarkCheck className="h-4 w-4" />
                        ) : (
                          <Bookmark className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Caption */}
                  {post.caption && (
                    <p className="text-sm leading-relaxed">{post.caption}</p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-4">
                    <button
                      className={`flex items-center gap-1.5 text-sm transition-colors ${
                        isLiked
                          ? 'text-rose-500'
                          : 'text-muted-foreground hover:text-rose-500'
                      }`}
                      onClick={() => handleToggleLike(post.id)}
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          isLiked ? 'fill-current' : ''
                        }`}
                        style={{
                          transition: 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)',
                          transform: isAnimating ? 'scale(1.3)' : 'scale(1)',
                        }}
                      />
                      <span>{likeCount > 0 ? likeCount : ''}</span>
                    </button>
                    <button
                      className={`flex items-center gap-1.5 text-sm transition-colors ${
                        showCommentSection.has(post.id)
                          ? 'text-blue-500'
                          : 'text-muted-foreground hover:text-blue-500'
                      }`}
                      onClick={() => toggleCommentSection(post.id)}
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>{post.comments.length > 0 ? post.comments.length : ''}</span>
                      {!showCommentSection.has(post.id) && post.comments.length === 0 && (
                        <span className="text-xs opacity-70">Показать</span>
                      )}
                    </button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 ml-auto">
                      <ThumbsUp className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Comments section — toggle visibility */}
                  {showCommentSection.has(post.id) && (
                  <>
                  {post.comments.length === 0 && !expandedComments.has(post.id) ? (
                    <div className="text-center py-3">
                      <p className="text-xs text-muted-foreground/60 italic">
                        Комментарии скоро появятся
                      </p>
                    </div>
                  ) : (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        {/* Show comments — first 2 when collapsed, all when expanded */}
                        {(expandedComments.has(post.id)
                          ? post.comments
                          : post.comments.slice(0, 2)
                        ).map((comment) => (
                          <div key={comment.id} className="flex gap-2.5">
                            <Avatar className="h-7 w-7 shrink-0">
                              <AvatarImage
                                src={comment.user.avatar || undefined}
                                alt={comment.user.name || 'User'}
                              />
                              <AvatarFallback className="text-[10px]">
                                {(comment.user.name || 'U')
                                  .charAt(0)
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="rounded-lg bg-muted/60 px-3 py-2 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-xs font-medium">
                                  {comment.user.name || 'Пользователь'}
                                </p>
                                <span className="text-[10px] text-muted-foreground/60">
                                  {formatRelativeTime(comment.createdAt)}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {comment.content}
                              </p>
                            </div>
                          </div>
                        ))}
                        {/* Show all / collapse button */}
                        {post.comments.length > 2 && (
                          <button
                            type="button"
                            onClick={() => toggleExpandComments(post.id)}
                            className="text-xs text-muted-foreground hover:text-foreground pl-9 transition-colors"
                          >
                            {expandedComments.has(post.id)
                              ? 'Свернуть комментарии'
                              : `Показать все комментарии (${post.comments.length})`}
                          </button>
                        )}
                      </div>
                    </>
                  )}

                  {/* Comment input area */}
                  <div className="flex items-center gap-2 pt-1">
                    <Avatar className="h-7 w-7 shrink-0">
                      <AvatarFallback className="text-[10px]">А</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1.5 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                      <input
                        type="text"
                        placeholder="Написать комментарий..."
                        maxLength={MAX_COMMENT_LENGTH}
                        value={commentTexts[post.id] || ''}
                        onChange={(e) =>
                          setCommentTexts((prev) => ({
                            ...prev,
                            [post.id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => handleCommentKeyDown(e, post.id)}
                        className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50 disabled:opacity-50"
                        disabled={sendingComment.has(post.id)}
                      />
                      {(commentTexts[post.id] || '').length > 0 && (
                        <span className="text-[10px] text-muted-foreground/50 tabular-nums">
                          {(commentTexts[post.id] || '').length}/{MAX_COMMENT_LENGTH}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleCommentSubmit(post.id)}
                        disabled={sendingComment.has(post.id) || !(commentTexts[post.id] || '').trim()}
                        className={cn(
                          'transition-colors shrink-0',
                          (commentTexts[post.id] || '').trim() && !sendingComment.has(post.id)
                            ? 'text-primary hover:text-primary/80'
                            : 'text-muted-foreground/30'
                        )}
                      >
                        <Send className={cn(
                          'h-3.5 w-3.5',
                          sendingComment.has(post.id) && 'animate-spin'
                        )} />
                      </button>
                    </div>
                  </div>
                  </>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
