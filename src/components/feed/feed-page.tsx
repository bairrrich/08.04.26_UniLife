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
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
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
  diary: 'bg-amber-100 text-amber-700',
  transaction: 'bg-emerald-100 text-emerald-700',
  meal: 'bg-rose-100 text-rose-700',
  workout: 'bg-blue-100 text-blue-700',
  collection: 'bg-purple-100 text-purple-700',
}

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

// ======================== Component ========================

export function FeedPage() {
  const [posts, setPosts] = useState<FeedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())

  // Form state
  const [formEntityType, setFormEntityType] = useState<EntityType>('diary')
  const [formEntityId, setFormEntityId] = useState('')
  const [formCaption, setFormCaption] = useState('')

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/feed?limit=20&offset=0')
      const json = await res.json()
      if (json.success) {
        setPosts(json.data)
        // Track which posts are liked (simulate - all likes are "ours" for demo)
        const liked = new Set<string>(
          json.data
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
  }

  const resetForm = () => {
    setFormEntityType('diary')
    setFormEntityId('')
    setFormCaption('')
  }

  const handleSubmit = async () => {
    if (!formEntityId.trim()) return

    try {
      const res = await fetch('/api/feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType: formEntityType,
          entityId: formEntityId.trim(),
          caption: formCaption.trim() || null,
        }),
      })
      const json = await res.json()
      if (json.success) {
        setDialogOpen(false)
        resetForm()
        fetchPosts()
      }
    } catch (err) {
      console.error('Failed to create post:', err)
    }
  }

  // ======================== Render ========================

  return (
    <div className="space-y-6">
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
                <Label>Тип записи</Label>
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
              <div className="space-y-2">
                <Label>ID записи</Label>
                <Input
                  placeholder="Введите ID связанной записи"
                  value={formEntityId}
                  onChange={(e) => setFormEntityId(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  ID записи из соответствующего модуля
                </p>
              </div>
              <div className="space-y-2">
                <Label>Подпись</Label>
                <Textarea
                  placeholder="Чем хотите поделиться?"
                  value={formCaption}
                  onChange={(e) => setFormCaption(e.target.value)}
                  rows={3}
                />
              </div>
              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={!formEntityId.trim()}
              >
                Опубликовать
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Feed */}
      <div className="max-w-2xl mx-auto space-y-4">
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
          <Card>
            <CardContent className="py-16 text-center">
              <Rss className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-muted-foreground font-medium">Лента пуста</p>
              <p className="text-muted-foreground text-sm mt-1">
                Опубликуйте первую запись
              </p>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => {
            const isLiked = likedPosts.has(post.id)
            const likeCount = isLiked
              ? Math.max(post._count.likes, 1)
              : post._count.likes

            return (
              <Card key={post.id} className="hover:shadow-sm transition">
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
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(post.createdAt)}
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                      <Share2 className="h-4 w-4" />
                    </Button>
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
                      />
                      <span>{likeCount > 0 ? likeCount : ''}</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-blue-500 transition-colors">
                      <MessageCircle className="h-4 w-4" />
                      <span>{post.comments.length > 0 ? post.comments.length : ''}</span>
                    </button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 ml-auto">
                      <ThumbsUp className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* First comment preview */}
                  {post.comments.length > 0 && (
                    <>
                      <Separator />
                      <div className="flex gap-2.5">
                        <Avatar className="h-7 w-7 shrink-0">
                          <AvatarFallback className="text-[10px]">
                            {(post.comments[0].user.name || 'U')
                              .charAt(0)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="rounded-lg bg-muted/60 px-3 py-2 flex-1">
                          <p className="text-xs font-medium">
                            {post.comments[0].user.name || 'Пользователь'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {post.comments[0].content}
                          </p>
                        </div>
                      </div>
                      {post.comments.length > 1 && (
                        <p className="text-xs text-muted-foreground pl-9 -mt-1">
                          Ещё {post.comments.length - 1}{' '}
                          {post.comments.length - 1 === 1
                            ? 'комментарий'
                            : post.comments.length - 1 < 5
                            ? 'комментария'
                            : 'комментариев'}
                        </p>
                      )}
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
