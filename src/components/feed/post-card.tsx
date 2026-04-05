import { Heart, MessageCircle, ThumbsUp, Clock, Share2, Bookmark, BookmarkCheck, Send, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { FeedPost, FeedComment, ReactionType, ReactionCounts } from './types'
import { ENTITY_COLORS, ENTITY_ICONS, ENTITY_BORDER, ENTITY_LABELS, ENTITY_ICON_BG, REACTION_EMOJI, REACTION_OPTIONS, formatRelativeTime, MAX_COMMENT_LENGTH, parsePostTags } from './constants'

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

  return (
    <Card className={`card-hover border-l-4 ${ENTITY_BORDER[post.entityType]} transition hover:bg-muted/50`}>
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
            <p className="text-sm font-medium">{post.user.name || 'Пользователь'}</p>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0 text-[10px] font-medium ${ENTITY_COLORS[post.entityType]}`}>
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
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onShare(post)} title="Поделиться">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost" size="icon"
              className={cn('h-8 w-8 transition-colors', isBookmarked && 'text-amber-500')}
              onClick={() => onToggleBookmark(post.id)}
              title={isBookmarked ? 'Убрать из сохранённых' : 'Сохранить'}
            >
              {isBookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
            </Button>
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

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Reaction picker */}
          <div className="relative">
            <button
              className={`flex items-center gap-1.5 text-sm transition-colors rounded-full px-3 py-1 ${
                userReaction
                  ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400'
                  : 'text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20'
              }`}
              onClick={() => onToggleReaction?.(post.id, userReaction || 'like')}
              onMouseEnter={() => setShowReactionPicker(true)}
              onMouseLeave={() => setTimeout(() => setShowReactionPicker(false), 200)}
            >
              <span className={cn(
                'transition-transform duration-200',
                reactionAnimating && 'scale-125'
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

          <button
            className={`flex items-center gap-1.5 text-sm transition-colors rounded-full px-3 py-1 ${
              showCommentSection ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'text-muted-foreground hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
            }`}
            onClick={() => onToggleCommentSection(post.id)}
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs font-medium">{post.comments.length > 0 ? post.comments.length : ''}</span>
          </button>

          <div className="ml-auto">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
              <ThumbsUp className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Comments section */}
        {showCommentSection && (
          <>
            {post.comments.length === 0 && !expandedComments ? (
              <div className="text-center py-3">
                <p className="text-xs text-muted-foreground/60 italic">Комментарии скоро появятся</p>
              </div>
            ) : (
              <>
                <Separator />
                <div className="space-y-2">
                  {(expandedComments ? post.comments : post.comments.slice(0, 2)).map((comment) => (
                    <CommentItem key={comment.id} comment={comment} />
                  ))}
                  {post.comments.length > 2 && (
                    <button
                      type="button"
                      onClick={() => onToggleExpandComments(post.id)}
                      className="text-xs text-muted-foreground hover:text-foreground pl-9 transition-colors"
                    >
                      {expandedComments
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
                  value={commentText}
                  onChange={(e) => onCommentTextChange(post.id, e.target.value)}
                  onKeyDown={(e) => onCommentKeyDown(e, post.id)}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50 disabled:opacity-50"
                  disabled={sendingComment}
                />
                {commentText.length > 0 && (
                  <span className="text-[10px] text-muted-foreground/50 tabular-nums">
                    {commentText.length}/{MAX_COMMENT_LENGTH}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => onCommentSubmit(post.id)}
                  disabled={sendingComment || !commentText.trim()}
                  className={cn(
                    'transition-colors shrink-0',
                    commentText.trim() && !sendingComment
                      ? 'text-primary hover:text-primary/80'
                      : 'text-muted-foreground/30'
                  )}
                >
                  <Send className={cn('h-3.5 w-3.5', sendingComment && 'animate-spin')} />
                </button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

function CommentItem({ comment }: { comment: FeedComment }) {
  return (
    <div className="flex gap-2.5">
      <Avatar className="h-7 w-7 shrink-0">
        <AvatarImage src={comment.user.avatar || undefined} alt={comment.user.name || 'User'} />
        <AvatarFallback className="text-[10px]">
          {(comment.user.name || 'U').charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="rounded-lg bg-muted/60 px-3 py-2 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium">{comment.user.name || 'Пользователь'}</p>
          <span className="text-[10px] text-muted-foreground/60">
            {formatRelativeTime(comment.createdAt)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{comment.content}</p>
      </div>
    </div>
  )
}
