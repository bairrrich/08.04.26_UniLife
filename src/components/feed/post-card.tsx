import { Heart, MessageCircle, ThumbsUp, Clock, Share2, Bookmark, BookmarkCheck, Send, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { FeedPost, FeedComment } from './types'
import { ENTITY_COLORS, ENTITY_ICONS, ENTITY_BORDER, ENTITY_LABELS, formatRelativeTime, MAX_COMMENT_LENGTH } from './constants'

interface PostCardProps {
  post: FeedPost
  isLiked: boolean
  isAnimating: boolean
  isBookmarked: boolean
  showCommentSection: boolean
  expandedComments: boolean
  commentText: string
  sendingComment: boolean
  onDelete?: (postId: string) => void
  onToggleLike: (postId: string) => void
  onToggleBookmark: (postId: string) => void
  onToggleCommentSection: (postId: string) => void
  onToggleExpandComments: (postId: string) => void
  onCommentTextChange: (postId: string, text: string) => void
  onCommentKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, postId: string) => void
  onCommentSubmit: (postId: string) => void
  onShare: (post: FeedPost) => void
}

export function PostCard({
  post, isLiked, isAnimating, isBookmarked,
  showCommentSection, expandedComments, commentText, sendingComment,
  onDelete,
  onToggleLike, onToggleBookmark, onToggleCommentSection,
  onToggleExpandComments, onCommentTextChange, onCommentKeyDown,
  onCommentSubmit, onShare,
}: PostCardProps) {
  const deleteConfirmTimer = useRef<NodeJS.Timeout | null>(null)
  const [deleteConfirming, setDeleteConfirming] = useState(false)

  const handleDeleteClick = () => {
    if (deleteConfirming) {
      // Second click — confirmed
      if (deleteConfirmTimer.current) clearTimeout(deleteConfirmTimer.current)
      setDeleteConfirming(false)
      onDelete?.(post.id)
    } else {
      // First click — start confirmation window
      setDeleteConfirming(true)
      toast.info('Нажмите ещё раз для подтверждения удаления')
      deleteConfirmTimer.current = setTimeout(() => {
        setDeleteConfirming(false)
        deleteConfirmTimer.current = null
      }, 3000)
    }
  }
  const likeCount = isLiked ? Math.max(post._count.likes, 1) : post._count.likes

  return (
    <Card className={`card-hover border-l-4 ${ENTITY_BORDER[post.entityType]} transition hover:bg-muted/50`}>
      <CardContent className="p-4 space-y-3">
        {/* Post header */}
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.user.avatar || undefined} alt={post.user.name || 'User'} />
            <AvatarFallback>{(post.user.name || 'U').charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
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

        {/* Caption */}
        {post.caption && <p className="text-sm leading-relaxed">{post.caption}</p>}

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            className={`flex items-center gap-1.5 text-sm transition-colors ${
              isLiked ? 'text-rose-500' : 'text-muted-foreground hover:text-rose-500'
            }`}
            onClick={() => onToggleLike(post.id)}
          >
            <Heart
              className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`}
              style={{
                transition: 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transform: isAnimating ? 'scale(1.3)' : 'scale(1)',
              }}
            />
            <span>{likeCount > 0 ? likeCount : ''}</span>
          </button>
          <button
            className={`flex items-center gap-1.5 text-sm transition-colors ${
              showCommentSection ? 'text-blue-500' : 'text-muted-foreground hover:text-blue-500'
            }`}
            onClick={() => onToggleCommentSection(post.id)}
          >
            <MessageCircle className="h-4 w-4" />
            <span>{post.comments.length > 0 ? post.comments.length : ''}</span>
            {!showCommentSection && post.comments.length === 0 && (
              <span className="text-xs opacity-70">Показать</span>
            )}
          </button>
          <Button variant="ghost" size="icon" className="h-8 w-8 ml-auto">
            <ThumbsUp className="h-4 w-4" />
          </Button>
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
