'use client'

import { Rss, Plus, TrendingUp, RefreshCw, Flame, User, BarChart3, PenLine, CalendarDays } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PostCard } from './post-card'
import { PostDialog } from './post-dialog'
import { FeedEmptyState } from './empty-state'
import { useFeed } from './hooks'
import { getTimeGroup, ENTITY_LABELS } from './constants'
import { useState, useMemo } from 'react'
import { ModuleHeader } from '@/components/layout/module-header'
import { useSectionConfig, SectionCustomizer, type SectionDef } from '@/components/shared'
import DashboardSection from '@/components/dashboard/dashboard-section'
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

type FeedFilter = 'all' | 'mine' | 'popular'

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
  const [activeFilter, setActiveFilter] = useState<FeedFilter>('all')

  // Section config for hideable/collapsible widgets
  const sectionDefs: SectionDef[] = useMemo(() => [
    { id: 'trending', title: 'Популярные темы', icon: '📈', defaultVisible: true, defaultOrder: 0 },
  ], [])
  const { loaded, config, visibleOrder, toggleVisible, moveSection, resetConfig } = useSectionConfig('feed', sectionDefs)
  const [customizerOpen, setCustomizerOpen] = useState(false)

  // Apply hashtag + filter together
  const filteredPosts = useMemo(() => {
    let result = posts

    // Hashtag filter
    if (selectedHashtag) {
      result = result.filter((p) => {
        try {
          const tags = JSON.parse(p.tags || '[]')
          return tags.some((t: string) => t.toLowerCase().includes(selectedHashtag.toLowerCase()))
        } catch {
          return false
        }
      })
    }

    // Tab filter
    if (activeFilter === 'mine') {
      result = result.filter((p) => p.userId === 'user_demo_001')
    } else if (activeFilter === 'popular') {
      result = [...result].sort((a, b) => b._count.likes - a._count.likes)
    }

    return result
  }, [posts, selectedHashtag, activeFilter])

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

  // Stats
  const totalPosts = posts.length
  const todayPosts = posts.filter((p) => getTimeGroup(p.createdAt) === 'Сегодня').length
  const totalComments = posts.reduce((sum, p) => sum + p.comments.length, 0)

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <ModuleHeader
        icon={Rss}
        title="Лента"
        description={
          todayPosts > 0
            ? `${todayPosts} ${todayPosts === 1 ? 'новая запись' : 'новых записей'} сегодня · ${totalComments} ${totalComments === 1 ? 'комментарий' : 'комментариев'}`
            : 'Делитесь достижениями и моментами'
        }
        accent="pink"
        badge={
          <Badge variant="secondary" className="hidden gap-1 text-[10px] font-normal sm:inline-flex">
            <CalendarDays className="h-3 w-3" />
            {totalPosts} {totalPosts === 1 ? 'пост' : totalPosts < 5 ? 'поста' : 'постов'}
          </Badge>
        }
        onCustomize={() => setCustomizerOpen(true)}
        primaryAction={{
          label: 'Написать пост',
          icon: <PenLine className="h-4 w-4" />,
          onClick: () => setDialogOpen(true),
        }}
      />

      {/* Trending Topics Sidebar — desktop only */}
      <div className="hidden lg:block">
        <div className="glass-card rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">Тренды по типам</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(() => {
              const entityCounts = new Map<string, number>()
              for (const post of posts) {
                entityCounts.set(post.entityType, (entityCounts.get(post.entityType) || 0) + 1)
              }
              if (entityCounts.size === 0) {
                return [
                  { type: 'diary', count: 0 },
                  { type: 'transaction', count: 0 },
                  { type: 'meal', count: 0 },
                  { type: 'workout', count: 0 },
                  { type: 'collection', count: 0 },
                ].map((item) => (
                  <span
                    key={item.type}
                    className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium bg-muted/50 text-muted-foreground"
                  >
                    #{ENTITY_LABELS[item.type as keyof typeof ENTITY_LABELS]}
                    <span className="text-[10px] text-muted-foreground/50">0</span>
                  </span>
                ))
              }
              const sorted = Array.from(entityCounts.entries())
                .sort((a, b) => b[1] - a[1])
              return sorted.map(([entityType, count]) => (
                <span
                  key={entityType}
                  className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium bg-primary/10 text-primary hover:bg-primary/15 transition-colors cursor-default"
                >
                  #{ENTITY_LABELS[entityType as keyof typeof ENTITY_LABELS]}
                  <span className="text-[10px] font-semibold tabular-nums">{count}</span>
                </span>
              ))
            })()}
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      {!loading && posts.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <Tabs
            value={activeFilter}
            onValueChange={(v) => setActiveFilter(v as FeedFilter)}
          >
            <TabsList className="h-9 rounded-lg">
              <TabsTrigger value="all" className="gap-1.5 text-xs px-3">
                <Rss className="h-3.5 w-3.5" />
                Все
              </TabsTrigger>
              <TabsTrigger value="mine" className="gap-1.5 text-xs px-3">
                <User className="h-3.5 w-3.5" />
                Мои
              </TabsTrigger>
              <TabsTrigger value="popular" className="gap-1.5 text-xs px-3">
                <Flame className="h-3.5 w-3.5" />
                Популярное
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {activeFilter !== 'all' && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs text-muted-foreground"
              onClick={() => setActiveFilter('all')}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Сбросить
            </Button>
          )}

          {activeFilter === 'popular' && (
            <span className="text-xs text-muted-foreground/60">
              Сортировка по лайкам
            </span>
          )}
        </div>
      )}

      {/* Configurable Widget Sections */}
      {loaded && visibleOrder.map(sectionId => {
        switch (sectionId) {
          case 'trending':
            return (
              <DashboardSection key={sectionId} id={sectionId} title="Популярные темы" icon={<span>📈</span>}>
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
              </DashboardSection>
            )
          default: return null
        }
      })}

      <PostDialog
        open={dialogOpen} onOpenChange={setDialogOpen}
        formEntityType={formEntityType} setFormEntityType={setFormEntityType}
        formCaption={formCaption} setFormCaption={setFormCaption}
        formTags={formTags} setFormTags={setFormTags}
        onSubmit={handleSubmit}
      />

      {/* Feed */}
      <div className="space-y-4 stagger-children">
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
        ) : filteredPosts.length === 0 && !selectedHashtag && activeFilter === 'all' ? (
          <FeedEmptyState onOpenDialog={() => setDialogOpen(true)} />
        ) : filteredPosts.length === 0 && (selectedHashtag || activeFilter !== 'all') ? (
          <div className="text-center py-12">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center">
              {activeFilter === 'popular' ? (
                <Flame className="h-7 w-7 text-muted-foreground/40" />
              ) : (
                <Badge variant="outline" className="text-2xl font-normal border-0 bg-transparent">
                  #{selectedHashtag}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {activeFilter === 'popular'
                ? 'Пока нет постов с лайками'
                : activeFilter === 'mine'
                  ? 'У вас пока нет записей'
                  : (
                    <>
                      Пока нет записей с тегом <span className="font-medium text-foreground">#{selectedHashtag}</span>
                    </>
                  )}
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              {activeFilter === 'popular'
                ? 'Лайкайте посты, чтобы они появились здесь'
                : activeFilter === 'mine'
                  ? 'Опубликуйте первый пост!'
                  : 'Станьте первым, кто напишет об этом!'}
            </p>
            <Button
              size="sm"
              className="mt-4 gap-1.5"
              onClick={() => {
                if (activeFilter !== 'all') setActiveFilter('all')
                if (selectedHashtag) {
                  setSelectedHashtag(null)
                  setFormTags(selectedHashtag)
                }
                setDialogOpen(true)
              }}
            >
              <Plus className="h-4 w-4" />
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

      <SectionCustomizer open={customizerOpen} onOpenChange={setCustomizerOpen} sections={sectionDefs} config={config} onToggle={toggleVisible} onMove={moveSection} onReset={resetConfig} moduleTitle="Лента" />
    </div>
  )
}
