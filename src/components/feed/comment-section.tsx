'use client'

import { useRef, useState } from 'react'
import { MessageCircle, Send, Reply, ChevronDown, ChevronUp, Clock } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { FeedComment } from './types'
import { formatRelativeTime, MAX_COMMENT_LENGTH } from './constants'

// ─── Comment avatar colors (pastel) ──────────────────────────────────────────
const AVATAR_COLORS = [
  'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300',
  'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300',
  'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
  'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300',
  'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300',
  'bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300',
  'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
]

// Deterministic color from name
function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash = hash & hash
  }
  return Math.abs(hash)
}

// Emoji avatars for comment authors
const COMMENT_EMOJIS = ['😊', '🦊', '🐱', '🐶', '🐼', '🦉', '🐸', '🦁', '🐝', '🐬']

function getAvatarEmoji(name: string): string {
  return COMMENT_EMOJIS[hashCode(name) % COMMENT_EMOJIS.length]
}

// ─── Reply state ──────────────────────────────────────────────────────────────
interface ReplyState {
  parentId: string | null
  text: string
}

// ─── Comment Section Props ────────────────────────────────────────────────────
interface CommentSectionProps {
  comments: FeedComment[]
  expanded: boolean
  commentText: string
  sendingComment: boolean
  postId: string
  onToggleExpand: (postId: string) => void
  onToggleSection: (postId: string) => void
  onCommentTextChange: (postId: string, text: string) => void
  onCommentKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, postId: string) => void
  onCommentSubmit: (postId: string) => void
}

// ─── Main CommentSection ─────────────────────────────────────────────────────
export function CommentSection({
  comments,
  expanded,
  commentText,
  sendingComment,
  postId,
  onToggleExpand,
  onToggleSection,
  onCommentTextChange,
  onCommentKeyDown,
  onCommentSubmit,
}: CommentSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const visibleComments = expanded ? comments : comments.slice(0, 3)
  const hiddenCount = comments.length - 3
  const isOptimistic = (id: string) => id.startsWith('opt_')

  return (
    <div className="space-y-2.5">
      {/* Header with toggle */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => onToggleSection(postId)}
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          <span className="tabular-nums">
            {comments.length}{' '}
            {comments.length === 1
              ? 'комментарий'
              : comments.length < 5
                ? 'комментария'
                : 'комментариев'}
          </span>
        </button>
        {comments.length > 3 && (
          <button
            type="button"
            onClick={() => onToggleExpand(postId)}
            className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 font-medium transition-colors"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3 w-3" />
                Свернуть
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" />
                Показать все ({comments.length})
              </>
            )}
          </button>
        )}
      </div>

      {/* Comment list with thread lines */}
      {comments.length > 0 ? (
        <div className="relative space-y-0">
          {/* Thread connecting line */}
          {visibleComments.length > 1 && (
            <div className="absolute left-[15px] top-3 bottom-3 w-px bg-border/60 rounded-full" />
          )}

          {visibleComments.map((comment, index) => (
            <div
              key={comment.id}
              className="relative group"
            >
              {/* Individual thread connector dot */}
              {visibleComments.length > 1 && index < visibleComments.length - 1 && (
                <div className="absolute left-[13px] top-[18px] h-2 w-2 rounded-full border border-border bg-background z-10" />
              )}

              <SingleComment
                comment={comment}
                isFirst={index === 0}
                isLast={index === visibleComments.length - 1}
                isOptimistic={isOptimistic(comment.id)}
                onReply={() => {
                  inputRef.current?.focus()
                }}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-xs text-muted-foreground/50 italic">
            Пока нет комментариев. Будьте первым!
          </p>
        </div>
      )}

      {/* Inline comment input */}
      <div className="flex items-center gap-2 pt-1">
        <div className="relative shrink-0">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="text-[10px] bg-gradient-to-br from-primary/20 to-primary/5">
              А
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-1 flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1.5 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/30 transition-all">
          <input
            ref={inputRef}
            type="text"
            placeholder="Написать комментарий..."
            maxLength={MAX_COMMENT_LENGTH}
            value={commentText}
            onChange={(e) => onCommentTextChange(postId, e.target.value)}
            onKeyDown={(e) => onCommentKeyDown(e, postId)}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50 disabled:opacity-50"
            disabled={sendingComment}
          />
          {commentText.length > 0 && (
            <span className="text-[10px] text-muted-foreground/50 tabular-nums shrink-0">
              {commentText.length}/{MAX_COMMENT_LENGTH}
            </span>
          )}
          <button
            type="button"
            onClick={() => onCommentSubmit(postId)}
            disabled={sendingComment || !commentText.trim()}
            className={cn(
              'transition-all shrink-0 rounded-full p-0.5',
              commentText.trim() && !sendingComment
                ? 'text-primary hover:text-primary/80 hover:bg-primary/10'
                : 'text-muted-foreground/30'
            )}
          >
            <Send className={cn('h-3.5 w-3.5', sendingComment && 'animate-spin')} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Collapsed preview (shown before section is opened) ──────────────────────
interface CommentPreviewProps {
  comments: FeedComment[]
  onToggleSection: (postId: string) => void
  postId: string
}

export function CommentPreview({
  comments,
  onToggleSection,
  postId,
}: CommentPreviewProps) {
  if (comments.length === 0) return null

  return (
    <div className="rounded-lg bg-muted/40 p-3 space-y-2">
      <div className="relative space-y-2">
        {/* Short thread line for preview */}
        {comments.length > 1 && (
          <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border/40 rounded-full" />
        )}

        {comments.slice(0, 2).map((comment) => (
          <div key={comment.id} className="relative flex gap-2">
            <div
              className={cn(
                'h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0 z-10',
                AVATAR_COLORS[hashCode(comment.user.name || 'U') % AVATAR_COLORS.length]
              )}
            >
              {getAvatarEmoji(comment.user.name || 'U')}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium">
                  {comment.user.name || 'Пользователь'}
                </span>
                <span className="text-[10px] text-muted-foreground/50 tabular-nums flex items-center gap-0.5">
                  <Clock className="h-2.5 w-2.5" />
                  {formatRelativeTime(comment.createdAt)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                {comment.content}
              </p>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onToggleSection(postId)}
        className="text-xs text-primary hover:text-primary/80 font-medium transition-colors w-full text-center"
      >
        {comments.length > 2
          ? `Показать все ${comments.length} комментариев`
          : 'Написать комментарий'}
      </button>
    </div>
  )
}

// ─── Single comment item (thread-style) ──────────────────────────────────────
function SingleComment({
  comment,
  isFirst,
  isLast,
  isOptimistic,
  onReply,
}: {
  comment: FeedComment
  isFirst: boolean
  isLast: boolean
  isOptimistic: boolean
  onReply: () => void
}) {
  const [isReplying, setIsReplying] = useState(false)
  const [replyText, setReplyText] = useState('')

  const colorClass = AVATAR_COLORS[hashCode(comment.user.name || 'U') % AVATAR_COLORS.length]

  return (
    <div className={cn(
      'flex gap-2.5 transition-all duration-200',
      isOptimistic && 'animate-pulse-soft opacity-90'
    )}>
      {/* Emoji avatar */}
      <div className="relative shrink-0 z-10">
        <div
          className={cn(
            'h-7 w-7 rounded-full flex items-center justify-center text-sm shadow-sm border border-background',
            colorClass
          )}
        >
          {getAvatarEmoji(comment.user.name || 'U')}
        </div>
      </div>

      {/* Comment bubble with connecting line */}
      <div className="flex-1 min-w-0">
        <div className={cn(
          'rounded-xl bg-muted/60 px-3 py-2 transition-colors hover:bg-muted/80',
          !isLast && 'pb-1.5',
        )}>
          {/* Author + time */}
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold">{comment.user.name || 'Пользователь'}</p>
            <span className="text-[10px] text-muted-foreground/50 flex items-center gap-0.5 tabular-nums shrink-0">
              <Clock className="h-2.5 w-2.5" />
              {formatRelativeTime(comment.createdAt)}
            </span>
          </div>
          {/* Text */}
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            {comment.content}
          </p>
          {/* Reply button */}
          <button
            type="button"
            onClick={() => {
              setIsReplying(!isReplying)
              if (!isReplying) onReply()
            }}
            className={cn(
              'flex items-center gap-1 text-[10px] mt-1.5 transition-colors',
              isReplying
                ? 'text-primary font-medium'
                : 'text-muted-foreground/40 hover:text-muted-foreground/70'
            )}
          >
            <Reply className="h-2.5 w-2.5" />
            Ответить
          </button>
        </div>

        {/* Inline reply input */}
        {isReplying && (
          <div className="flex items-center gap-2 mt-1.5 ml-1">
            <div className="flex-1 flex items-center gap-1.5 rounded-full border bg-muted/30 px-2.5 py-1 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
              <input
                type="text"
                placeholder={`Ответить ${comment.user.name || ''}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    if (replyText.trim()) {
                      setReplyText('')
                      setIsReplying(false)
                    }
                  }
                  if (e.key === 'Escape') {
                    setIsReplying(false)
                    setReplyText('')
                  }
                }}
                className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground/50"
                autoFocus
              />
              <button
                type="button"
                onClick={() => {
                  if (replyText.trim()) {
                    setReplyText('')
                    setIsReplying(false)
                  }
                }}
                disabled={!replyText.trim()}
                className={cn(
                  'transition-colors shrink-0 rounded-full p-0.5',
                  replyText.trim() ? 'text-primary' : 'text-muted-foreground/30'
                )}
              >
                <Send className="h-2.5 w-2.5" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsReplying(false)
                setReplyText('')
              }}
              className="text-[10px] text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              Отмена
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
