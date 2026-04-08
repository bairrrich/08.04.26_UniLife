import { Heart, MessageCircle, ThumbsUp, Clock, Share2, Bookmark, BookmarkCheck, Send, Trash2, MoreHorizontal, EyeOff, Copy, Pin, PinOff, Image as ImageIcon, Reply } from 'lucide-react'
import { useRef, useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { FeedPost, FeedComment, ReactionType, ReactionCounts } from './types'
import { CommentSection, CommentPreview } from './comment-section'
import { ENTITY_COLORS, ENTITY_ICONS, ENTITY_BORDER, ENTITY_LABELS, ENTITY_ICON_BG, REACTION_EMOJI, REACTION_OPTIONS, formatRelativeTime, MAX_COMMENT_LENGTH, parsePostTags } from './constants'

// ─── Comment avatar colors (pastel) ──────────────────────────────────────────
const COMMENT_AVATAR_COLORS = [
  'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300',
  'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300',
  'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
  'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300',
  'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300',
  'bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300',
  'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
]

// ─── Simple hash for deterministic color ─────────────────────────────────────
function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

// ─── useLocalStorage helper ──────────────────────────────────────────────────
function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : defaultValue
    } catch {
      return defaultValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch { /* ignore */ }
  }, [key, value])

  return [value, setValue]
}

// ─── Image URL extractor ─────────────────────────────────────────────────────
function extractImageUrl(text: string): string | null {
  if (!text) return null
  const urlMatch = text.match(/https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|webp)(?:\?[^\s]*)?/i)
  return urlMatch ? urlMatch[0] : null
}

// ─── Reply threading state interface ─────────────────────────────────────────
interface ReplyState {
  parentId: string | null
  text: string
  sending: boolean
}

// ─── Particle burst component ────────────────────────────────────────────────
const PARTICLE_EMOJIS = ['❤️', '✨', '💖', '💫', '🌟', '💗']

// ─── Inline reaction bar config ─────────────────────────────────────────────
const INLINE_REACTIONS = [
  { emoji: '❤️', label: 'Любовь' },
  { emoji: '❤️‍🔥', label: 'Страсть' },
  { emoji: '👏', label: 'Аплодисменты' },
  { emoji: '😢', label: 'Сочувствие' },
]

function LikeParticleBurst() {
  const particles = useMemo(() =>
    PARTICLE_EMOJIS.map((emoji, i) => ({ emoji, id: i }))
  , [])

  return (
    <span className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-visible">
      {particles.map((p) => (
        <span key={p.id} className="like-particle">{p.emoji}</span>
      ))}
    </span>
  )
}

interface PostCardProps {
  post: FeedPost
  isLiked: boolean
  isAnimating: boolean
  isBookmarked: boolean
  showCommentSection: boolean
  expandedComments: boolean
  commentText: string
  sendingComment: boolean
  userReaction?: ReactionType
  reactions?: ReactionCounts
  reactionAnimating?: boolean
  onDelete?: (postId: string) => void
  onToggleLike: (postId: string) => void
  onToggleBookmark: (postId: string) => void
  onToggleCommentSection: (postId: string) => void
  onToggleExpandComments: (postId: string) => void
  onCommentTextChange: (postId: string, text: string) => void
  onCommentKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, postId: string) => void
  onCommentSubmit: (postId: string) => void
  onShare: (post: FeedPost) => void
  onToggleReaction?: (postId: string, type: ReactionType) => void
}

export function PostCard({
  post, isLiked, isAnimating, isBookmarked,
  showCommentSection, expandedComments, commentText, sendingComment,
  userReaction, reactions, reactionAnimating,
  onDelete,
  onToggleLike, onToggleBookmark, onToggleCommentSection,
  onToggleExpandComments, onCommentTextChange, onCommentKeyDown,
  onCommentSubmit, onShare, onToggleReaction,
}: PostCardProps) {
  const deleteConfirmTimer = useRef<NodeJS.Timeout | null>(null)
  const [deleteConfirming, setDeleteConfirming] = useState(false)
  const [captionExpanded, setCaptionExpanded] = useState(false)
  const [showReactionPicker, setShowReactionPicker] = useState(false)
  const [showParticles, setShowParticles] = useState(false)

  // ─── Inline reactions (localStorage) ─────────────────────────────────────
  const [inlineReaction, setInlineReaction] = useState<string | null>(() => {
    try {
      return localStorage.getItem(`unilife-post-reactions-${post.id}`) || null
    } catch {
      return null
    }
  })
  const [inlineReactionCounts, setInlineReactionCounts] = useState<Record<string, number>>(() => {
    try {
      return JSON.parse(localStorage.getItem(`unilife-post-reactions-counts-${post.id}`) || '{}')
    } catch {
      return {}
    }
  })

  const handleInlineReaction = (emoji: string) => {
    const storageKey = `unilife-post-reactions-${post.id}`
    const countsKey = `unilife-post-reactions-counts-${post.id}`

    if (inlineReaction === emoji) {
      // Deselect
      setInlineReaction(null)
      try { localStorage.removeItem(storageKey) } catch { /* ignore */ }
      setInlineReactionCounts((prev) => {
        const next = { ...prev, [emoji]: Math.max(0, (prev[emoji] || 0) - 1) }
        try { localStorage.setItem(countsKey, JSON.stringify(next)) } catch { /* ignore */ }
        return next
      })
    } else {
      // Select new reaction
      let prevEmoji = inlineReaction
      setInlineReaction(emoji)
      try { localStorage.setItem(storageKey, emoji) } catch { /* ignore */ }
      setInlineReactionCounts((prev) => {
        const next = { ...prev }
        if (prevEmoji && prevEmoji !== emoji) {
          next[prevEmoji] = Math.max(0, (next[prevEmoji] || 0) - 1)
        }
        next[emoji] = (next[emoji] || 0) + 1
        try { localStorage.setItem(countsKey, JSON.stringify(next)) } catch { /* ignore */ }
        return next
      })
    }
  }

  // Cleanup delete confirm timer on unmount
  useEffect(() => {
    return () => {
      if (deleteConfirmTimer.current) clearTimeout(deleteConfirmTimer.current)
    }
  }, [])

  // ─── Pinned posts (localStorage) ────────────────────────────────────────
  const [pinnedPosts, setPinnedPosts] = useLocalStorage<string[]>('unilife-pinned-posts', [])
  const isPinned = pinnedPosts.includes(post.id)

  const togglePin = () => {
    setPinnedPosts((prev) =>
      prev.includes(post.id)
        ? prev.filter((id) => id !== post.id)
        : [post.id, ...prev]
    )
    toast.success(isPinned ? 'Запись откреплена' : 'Запись закреплена 📌')
  }

  // ─── Reply threading state ───────────────────────────────────────────────
  const [replyState, setReplyState] = useState<ReplyState>({
    parentId: null,
    text: '',
    sending: false,
  })

  const handleReplyTo = (commentId: string, userName?: string) => {
    setReplyState({ parentId: commentId, text: '', sending: false })
    if (!showCommentSection) onToggleCommentSection(post.id)
  }

  const handleReplySubmit = () => {
    if (!replyState.text.trim() || replyState.sending) return
    onCommentTextChange(post.id, replyState.text)
    onCommentSubmit(post.id)
    setReplyState({ parentId: null, text: '', sending: false })
  }

  const handleDeleteClick = () => {
    if (deleteConfirming) {
      if (deleteConfirmTimer.current) clearTimeout(deleteConfirmTimer.current)
      setDeleteConfirming(false)
      onDelete?.(post.id)
    } else {
      setDeleteConfirming(true)
      toast.info('Нажмите ещё раз для подтверждения удаления')
      deleteConfirmTimer.current = setTimeout(() => {
        setDeleteConfirming(false)
        deleteConfirmTimer.current = null
      }, 3000)
    }
  }

  // Like with particle burst
  const handleLikeClick = () => {
    if (!isLiked) {
      setShowParticles(true)
      setTimeout(() => setShowParticles(false), 700)
    }
    onToggleLike(post.id)
  }

  // Enhanced share: copy post text to clipboard
  const handleShareClick = () => {
    const text = post.caption || ''
    if (!text) {
      onShare(post)
      return
    }
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(text)
        .then(() => toast.success('Текст скопирован в буфер обмена'))
        .catch(() => toast.error('Не удалось скопировать'))
    } else {
      toast.info('Не удалось скопировать автоматически')
    }
  }

  // Bookmark with localStorage
  const handleBookmarkClick = () => {
    onToggleBookmark(post.id)
  }

  const likeCount = isLiked ? Math.max(post._count.likes, 1) : post._count.likes
  const tags = parsePostTags(post.tags || '[]')
  const isCaptionLong = (post.caption || '').length > 180

  // Total reaction count
  const totalReactions = reactions
    ? Object.values(reactions).reduce((a, b) => a + b, 0)
    : post._count.likes

  // Get top reactions for display
  const topReactions = reactions
    ? (REACTION_OPTIONS.filter((r) => (reactions[r.type] || 0) > 0).sort((a, b) => reactions[b.type] - reactions[a.type]).slice(0, 3))
    : []

  // Image preview from caption URLs
  const imageUrl = useMemo(() => extractImageUrl(post.caption || ''), [post.caption])

  return (
    <Card className={cn(
      'card-hover rounded-xl border-l-4 transition hover:bg-muted/50 relative',
      ENTITY_BORDER[post.entityType],
      isPinned && 'ring-1 ring-amber-300/50 dark:ring-amber-700/30',
      userReaction && 'post-active-border',
    )}>
      <CardContent className="p-4 space-y-3">
        {/* Post header */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.user.avatar || undefined} alt={post.user.name || 'User'} />
              <AvatarFallback>{(post.user.name || 'U').charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className={cn(
              'absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full flex items-center justify-center text-white',
              ENTITY_ICON_BG[post.entityType]
            )}>
              <span className="text-[9px]">
                {REACTION_EMOJI.like === '👍' ? ENTITY_ICONS[post.entityType] : null}
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">{post.user.name || 'Пользователь'}</p>
              {isPinned && (
                <Badge className="text-[9px] h-4 px-1.5 bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-400 dark:border-amber-800/50 gap-0.5">
                  <Pin className="h-2.5 w-2.5" />
                  Закреплено
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0 text-[10px] font-medium ${ENTITY_COLORS[post.entityType]}`}>
                {ENTITY_ICONS[post.entityType]}
                {ENTITY_LABELS[post.entityType]}
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1 tabular-nums">
                {(() => {
                  const now = new Date()
                  const created = new Date(post.createdAt)
                  const diffMs = now.getTime() - created.getTime()
                  const isRecent = diffMs >= 0 && diffMs < 3600000
                  return (
                    <>
                      {isRecent && (
                        <span
                          className="pulse-ring relative inline-block h-2 w-2 rounded-full bg-emerald-500 shrink-0"
                          title="Новый пост"
                        />
                      )}
                      <Clock className="h-3 w-3" />
                      {formatRelativeTime(post.createdAt)}
                    </>
                  )
                })()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {/* Pin button */}
            <Button
              variant="ghost" size="icon"
              className={cn('h-8 w-8 transition-colors', isPinned && 'text-amber-500')}
              onClick={togglePin}
              title={isPinned ? 'Открепить' : 'Закрепить'}
            >
              {isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
            </Button>
            {onDelete && (
              <Button
                variant="ghost" size="icon"
                className={cn(
                  'h-8 w-8 transition-colors',
                  deleteConfirming && 'text-destructive hover:text-destructive bg-destructive/10'
                )}
                onClick={handleDeleteClick}
                title={deleteConfirming ? 'Нажмите ещё раз для удаления' : 'Удалить'}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            {/* More options dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => onShare(post)}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Поделиться ссылкой
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  navigator.clipboard?.writeText(post.caption || '')
                  toast.success('Текст скопирован')
                }}>
                  <Copy className="h-4 w-4 mr-2" />
                  Скопировать текст
                </DropdownMenuItem>
                <DropdownMenuItem onClick={togglePin}>
                  {isPinned ? <PinOff className="h-4 w-4 mr-2" /> : <Pin className="h-4 w-4 mr-2" />}
                  {isPinned ? 'Открепить' : 'Закрепить запись'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleBookmarkClick}>
                  {isBookmarked ? <BookmarkCheck className="h-4 w-4 mr-2" /> : <Bookmark className="h-4 w-4 mr-2" />}
                  {isBookmarked ? 'Убрать из сохранённых' : 'Сохранить'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-muted-foreground">
                  <EyeOff className="h-4 w-4 mr-2" />
                  Скрыть
                </DropdownMenuItem>
                {onDelete && (
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={handleDeleteClick}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Удалить
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Caption with rich text preview */}
        {post.caption && (
          <div className="relative">
            <p className={cn(
              'text-sm leading-relaxed whitespace-pre-wrap',
              !captionExpanded && isCaptionLong && 'line-clamp-3'
            )}>
              {post.caption}
            </p>
            {isCaptionLong && (
              <button
                type="button"
                onClick={() => setCaptionExpanded(!captionExpanded)}
                className="text-xs text-muted-foreground hover:text-foreground mt-1 transition-colors font-medium"
              >
                {captionExpanded ? 'Свернуть' : 'Показать больше'}
              </button>
            )}
          </div>
        )}

        {/* Image preview from URL */}
        {imageUrl && (
          <div className="relative rounded-lg overflow-hidden border bg-muted/20">
            <img
              src={imageUrl}
              alt="Превью изображения"
              className="w-full max-h-[400px] object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                const parent = target.parentElement
                if (parent) parent.style.display = 'none'
              }}
            />
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="text-[9px] h-5 gap-1 bg-black/50 text-white border-0">
                <ImageIcon className="h-2.5 w-2.5" />
                Фото
              </Badge>
            </div>
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-[10px] px-1.5 py-0 h-5 font-normal"
              >
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Visible inline reaction buttons row */}
        <div className="flex items-center gap-1 py-0.5">
          {INLINE_REACTIONS.map((r) => {
            const isSelected = inlineReaction === r.emoji
            const count = inlineReactionCounts[r.emoji] || 0
            return (
              <button
                key={r.emoji}
                type="button"
                title={r.label}
                onClick={() => handleInlineReaction(r.emoji)}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-1 text-sm transition-all border active-press',
                  isSelected
                    ? 'border-rose-300 bg-rose-50 dark:border-rose-700 dark:bg-rose-900/30 scale-105'
                    : 'border-transparent bg-muted/40 hover:bg-muted/70 hover:border-muted-foreground/20'
                )}
              >
                <span className={cn('transition-transform', isSelected && 'scale-110')}>{r.emoji}</span>
                {count > 0 && (
                  <span className="text-[10px] font-medium text-muted-foreground tabular-nums">{count}</span>
                )}
              </button>
            )
          })}
        </div>

        {/* Actions row with visible share + bookmark */}
        <div className="flex items-center gap-1">
          {/* Reaction picker with particle burst */}
          <div className="relative">
            <button
              className={cn(
                'flex items-center gap-1.5 text-sm transition-colors rounded-full px-3 py-1.5 relative',
                userReaction
                  ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400'
                  : 'text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20'
              )}
              onClick={() => onToggleReaction?.(post.id, userReaction || 'like')}
              onMouseEnter={() => setShowReactionPicker(true)}
              onMouseLeave={() => setTimeout(() => setShowReactionPicker(false), 200)}
            >
              {showParticles && <LikeParticleBurst />}
              <span className={cn(
                'transition-transform duration-200',
                (reactionAnimating || isAnimating) && 'scale-125'
              )}>
                {userReaction ? REACTION_EMOJI[userReaction] : '👍'}
              </span>
              <span className="text-xs font-medium">{totalReactions > 0 ? totalReactions : ''}</span>
            </button>

            {/* Reaction picker on hover */}
            {showReactionPicker && onToggleReaction && (
              <div
                className="absolute top-full left-0 mt-1 flex items-center gap-0.5 bg-popover border rounded-full px-2 py-1 shadow-lg z-10"
                onMouseEnter={() => setShowReactionPicker(true)}
                onMouseLeave={() => setShowReactionPicker(false)}
              >
                {REACTION_OPTIONS.map((r) => (
                  <button
                    key={r.type}
                    type="button"
                    title={r.label}
                    className={cn(
                      'h-7 w-7 rounded-full flex items-center justify-center text-base transition-transform hover:scale-125 active-press',
                      userReaction === r.type && 'bg-accent scale-110'
                    )}
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleReaction(post.id, r.type)
                      setShowReactionPicker(false)
                    }}
                  >
                    {r.emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Show top reactions */}
          {topReactions.length > 0 && !userReaction && (
            <div className="flex items-center -ml-1">
              {topReactions.map((r) => (
                <span
                  key={r.type}
                  className={cn(
                    'text-sm transition-transform',
                    reactionAnimating && 'scale-125'
                  )}
                  title={`${r.label}: ${reactions![r.type]}`}
                >
                  {r.emoji}
                </span>
              ))}
            </div>
          )}

          {/* Comment toggle button */}
          <button
            className={cn(
              'flex items-center gap-1.5 text-sm transition-colors rounded-full px-3 py-1.5',
              showCommentSection ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'text-muted-foreground hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
            )}
            onClick={() => onToggleCommentSection(post.id)}
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs font-medium">{post.comments.length > 0 ? post.comments.length : ''}</span>
          </button>

          {/* Share button — visible in actions row */}
          <button
            className="flex items-center gap-1.5 text-sm transition-colors rounded-full px-2.5 py-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/20"
            onClick={handleShareClick}
            title="Скопировать текст"
          >
            <Share2 className="h-4 w-4" />
          </button>

          {/* Bookmark button — visible in actions row */}
          <button
            className={cn(
              'flex items-center gap-1 text-sm transition-all rounded-full px-2.5 py-1.5',
              isBookmarked
                ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                : 'text-muted-foreground hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'
            )}
            onClick={handleBookmarkClick}
            title={isBookmarked ? 'Убрать из сохранённых' : 'Сохранить'}
          >
            {isBookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          </button>
        </div>

        {/* Collapsed comment preview — shown when section is closed */}
        {!showCommentSection && post.comments.length > 0 && (
          <CommentPreview
            comments={post.comments}
            postId={post.id}
            onToggleSection={onToggleCommentSection}
          />
        )}

        {/* Expandable comment section */}
        {showCommentSection && (
          <>
            <Separator />
            <CommentSection
              comments={post.comments}
              expanded={expandedComments}
              commentText={commentText}
              sendingComment={sendingComment}
              postId={post.id}
              onToggleExpand={onToggleExpandComments}
              onToggleSection={onToggleCommentSection}
              onCommentTextChange={onCommentTextChange}
              onCommentKeyDown={onCommentKeyDown}
              onCommentSubmit={onCommentSubmit}
            />
          </>
        )}
      </CardContent>
    </Card>
  )
}
