'use client'

import { Rss, Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PostCard } from './post-card'
import { PostDialog } from './post-dialog'
import { FeedEmptyState } from './empty-state'
import { useFeed } from './hooks'

export default function FeedPage() {
  const {
    posts, loading,
    dialogOpen, setDialogOpen,
    formEntityType, setFormEntityType,
    formCaption, setFormCaption,
    likedPosts, likeAnimating, bookmarkedPosts,
    commentTexts, expandedComments, showCommentSection, sendingComment,
    handleToggleLike, handleToggleBookmark, handleShare,
    handleCommentSubmit, handleCommentKeyDown,
    toggleExpandComments, toggleCommentSection, updateCommentText,
    handleSubmit, handleDeletePost,
  } = useFeed()

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Rss className="h-6 w-6" />Лента
          </h2>
          <p className="text-muted-foreground text-sm mt-1">Делитесь достижениями и моментами</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />Опубликовать
        </Button>
      </div>

      <PostDialog
        open={dialogOpen} onOpenChange={setDialogOpen}
        formEntityType={formEntityType} setFormEntityType={setFormEntityType}
        formCaption={formCaption} setFormCaption={setFormCaption}
        onSubmit={handleSubmit}
      />

      {/* Feed */}
      <div className="max-w-2xl mx-auto space-y-4 stagger-children">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-l-4 border-l-blue-200 dark:border-l-blue-800">
              <CardContent className="p-4 space-y-3">
                {/* Header: avatar + name + badge + time */}
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
                {/* Caption area */}
                <div className="space-y-1.5">
                  <div className="skeleton-shimmer h-4 rounded w-full" />
                  <div className="skeleton-shimmer h-4 rounded w-4/5" />
                  <div className="skeleton-shimmer h-4 rounded w-2/3" />
                </div>
                {/* Action buttons */}
                <div className="flex items-center gap-4">
                  <div className="skeleton-shimmer h-5 rounded w-12" />
                  <div className="skeleton-shimmer h-5 rounded w-12" />
                  <div className="skeleton-shimmer h-8 w-8 rounded-md ml-auto" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : posts.length === 0 ? (
          <FeedEmptyState onOpenDialog={() => setDialogOpen(true)} />
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id} post={post}
              isLiked={likedPosts.has(post.id)}
              isAnimating={likeAnimating.has(post.id)}
              isBookmarked={bookmarkedPosts.has(post.id)}
              showCommentSection={showCommentSection.has(post.id)}
              expandedComments={expandedComments.has(post.id)}
              commentText={commentTexts[post.id] || ''}
              sendingComment={sendingComment.has(post.id)}
              onToggleLike={handleToggleLike}
              onToggleBookmark={handleToggleBookmark}
              onToggleCommentSection={toggleCommentSection}
              onToggleExpandComments={toggleExpandComments}
              onCommentTextChange={updateCommentText}
              onCommentKeyDown={handleCommentKeyDown}
              onCommentSubmit={handleCommentSubmit}
              onShare={handleShare}
              onDelete={handleDeletePost}
            />
          ))
        )}
      </div>
    </div>
  )
}
