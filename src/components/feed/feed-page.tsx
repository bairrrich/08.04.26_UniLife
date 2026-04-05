'use client'

import { Rss, Plus, TrendingUp, RefreshCw } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PostCard } from './post-card'
import { PostDialog } from './post-dialog'
import { FeedEmptyState } from './empty-state'
import { useFeed } from './hooks'
import { getTimeGroup } from './constants'
import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'

// Suggested hashtags for the feed header
const SUGGESTED_HASHTAGS = [
  { tag: 'достижения', emoji: '🏆' },
  { tag: 'тренировка', emoji: '💪' },
  { tag: 'мысли', emoji: '💭' },
  { tag: 'рецепт', emoji: '🍳' },
  { tag: 'книги', emoji: '📚' },
  { tag: 'мотивация', emoji: '🔥' },
  { tag: 'учёба', emoji: '✏️' },
  { tag: 'отдых', emoji: '🌅' },
]

export default function FeedPage() {
  const {
    posts, loading, groupedPosts,
    dialogOpen, setDialogOpen,
    formEntityType, setFormEntityType,
    formCaption, setFormCaption,
    formTags, setFormTags,
    likedPosts, likeAnimating, bookmarkedPosts,
    userReactions, reactionCounts, reactionAnimating,
    commentTexts, expandedComments, showCommentSection, sendingComment,
    handleToggleLike, handleToggleBookmark, handleShare,
    handleToggleReaction,
    handleCommentSubmit, handleCommentKeyDown,
    toggleExpandComments, toggleCommentSection, updateCommentText,
    handleSubmit, handleDeletePost,
  } = useFeed()

  const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null)

  // Filter posts by selected hashtag
  const filteredPosts = useMemo(() => {
    if (!selectedHashtag) return posts
    return posts.filter((p) => {
      try {
        const tags = JSON.parse(p.tags || '[]')
        return tags.some((t: string) => t.toLowerCase().includes(selectedHashtag.toLowerCase()))
      } catch {
        return false
      }
    })
  }, [posts, selectedHashtag])

  // Regenerate grouped posts from filtered
  const displayGroups = useMemo(() => {
    const groups: Record<string, typeof filteredPosts> = {}
    const order: string[] = []

    for (const post of filteredPosts) {
      const group = getTimeGroup(post.createdAt)
      if (!groups[group]) {
        groups[group] = []
        order.push(group)
      }
      groups[group].push(post)
    }

    const canonicalOrder = ['Сегодня', 'Вчера', 'На этой неделе', 'Ранее']
    return canonicalOrder
      .filter((g) => groups[g]?.length)
      .map((g) => ({ label: g, posts: groups[g] }))
  }, [filteredPosts])

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header — standard pattern with gradient blobs and icon */}
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-10 -left-10 h-32 w-32 rounded-full bg-gradient-to-br from-rose-400/20 to-pink-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -top-4 right-20 h-24 w-24 rounded-full bg-gradient-to-br from-amber-400/15 to-orange-500/15 blur-3xl" />
        <div className="relative flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
              <Rss className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Лента</h1>
              <p className="text-sm text-muted-foreground">Делитесь достижениями и моментами</p>
            </div>
          </div>
          <Button onClick={() => setDialogOpen(true)} size="sm" className="gap-1.5 shrink-0">
            <Plus className="h-4 w-4" /><span className="hidden sm:inline">Опубликовать</span>
          </Button>
        </div>
      </div>

      {/* Trending Topics */}
      <Card className="rounded-xl border overflow-hidden">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">Популярные темы</span>
            </div>
            {selectedHashtag && (
              <button
                type="button"
                onClick={() => setSelectedHashtag(null)}
                className="flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 font-medium transition-colors"
              >
                <RefreshCw className="h-3 w-3" />
                Показать все
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_HASHTAGS.map((item) => {
              const isActive = selectedHashtag === item.tag
              return (
                <button
                  key={item.tag}
                  type="button"
                  onClick={() => setSelectedHashtag(isActive ? null : item.tag)}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all active-press',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <span className="text-xs">{item.emoji}</span>
                  #{item.tag}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <PostDialog
        open={dialogOpen} onOpenChange={setDialogOpen}
        formEntityType={formEntityType} setFormEntityType={setFormEntityType}
        formCaption={formCaption} setFormCaption={setFormCaption}
        formTags={formTags} setFormTags={setFormTags}
        onSubmit={handleSubmit}
      />

      {/* Feed */}
      <div className="max-w-2xl mx-auto space-y-4 stagger-children">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="rounded-xl border-l-4 border-l-blue-200 dark:border-l-blue-800">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="skeleton-shimmer h-10 w-10 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="skeleton-shimmer h-4 rounded w-28" />
                    <div className="flex items-center gap-2">
                      <div className="skeleton-shimmer h-4 rounded-full w-16" />
                      <div className="skeleton-shimmer h-3 rounded w-12" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <div className="skeleton-shimmer h-8 w-8 rounded-md" />
                    <div className="skeleton-shimmer h-8 w-8 rounded-md" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="skeleton-shimmer h-4 rounded w-full" />
                  <div className="skeleton-shimmer h-4 rounded w-4/5" />
                  <div className="skeleton-shimmer h-4 rounded w-2/3" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="skeleton-shimmer h-5 rounded w-12" />
                  <div className="skeleton-shimmer h-5 rounded w-12" />
                  <div className="skeleton-shimmer h-8 w-8 rounded-md ml-auto" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredPosts.length === 0 && !selectedHashtag ? (
          <FeedEmptyState onOpenDialog={() => setDialogOpen(true)} />
        ) : filteredPosts.length === 0 && selectedHashtag ? (
          <div className="text-center py-12">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center">
              <Badge variant="outline" className="text-2xl font-normal border-0 bg-transparent">
                #{selectedHashtag}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Пока нет записей с тегом <span className="font-medium text-foreground">#{selectedHashtag}</span>
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Станьте первым, кто напишет об этом!
            </p>
            <Button
              size="sm"
              className="mt-4"
              onClick={() => {
                setSelectedHashtag(null)
                setFormTags(selectedHashtag)
                setDialogOpen(true)
              }}
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Написать
            </Button>
          </div>
        ) : (
          displayGroups.map((group) => (
            <div key={group.label} className="space-y-3">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-semibold text-muted-foreground whitespace-nowrap">
                  {group.label}
                </h3>
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground/60 tabular-nums">
                  {group.posts.length} {group.posts.length === 1 ? 'запись' : 'записи'}
                </span>
              </div>

              <div className="space-y-3">
                {group.posts.map((post) => (
                  <PostCard
                    key={post.id} post={post}
                    isLiked={likedPosts.has(post.id)}
                    isAnimating={likeAnimating.has(post.id)}
                    isBookmarked={bookmarkedPosts.has(post.id)}
                    showCommentSection={showCommentSection.has(post.id)}
                    expandedComments={expandedComments.has(post.id)}
                    commentText={commentTexts[post.id] || ''}
                    sendingComment={sendingComment.has(post.id)}
                    userReaction={userReactions[post.id]}
                    reactions={reactionCounts[post.id]}
                    reactionAnimating={reactionAnimating.has(post.id)}
                    onToggleLike={handleToggleLike}
                    onToggleBookmark={handleToggleBookmark}
                    onToggleCommentSection={toggleCommentSection}
                    onToggleExpandComments={toggleExpandComments}
                    onCommentTextChange={updateCommentText}
                    onCommentKeyDown={handleCommentKeyDown}
                    onCommentSubmit={handleCommentSubmit}
                    onShare={handleShare}
                    onDelete={handleDeletePost}
                    onToggleReaction={handleToggleReaction}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
