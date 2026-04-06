'use client'

import { memo } from 'react'
import Image from 'next/image'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Heart, ArrowRight, MessageSquare, Rss } from 'lucide-react'
import type { FeedPost } from './types'
import { getEntityTypeLabel, getEntityBorderColor } from './constants'

// ─── Props ────────────────────────────────────────────────────────────────────

interface ActivityFeedProps {
  loading: boolean
  feedPosts: FeedPost[]
  getTimeAgo: (dateStr: string) => string
  onNavigateToFeed: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export default memo(function ActivityFeed({ loading, feedPosts, getTimeAgo, onNavigateToFeed }: ActivityFeedProps) {
  return (
    <Card className="card-hover rounded-xl border">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-rose-400 to-pink-500">
            <Rss className="h-3.5 w-3.5 text-white" />
          </div>
          Последняя активность
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-muted-foreground hover:text-foreground"
          onClick={onNavigateToFeed}
        >
          Все записи
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="stagger-children space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-5 w-16 shrink-0 rounded-md" />
              </div>
            ))}
          </div>
        ) : feedPosts.length > 0 ? (
          <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
            {feedPosts.map((post, i) => (
              <div
                key={post.id}
                className={`group flex min-h-[52px] items-start gap-3 rounded-xl border-l-4 p-3 transition-all duration-200 hover:bg-muted/50 ${getEntityBorderColor(post.entityType)}`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <Image
                  src="/unilife-logo.png"
                  alt="User avatar"
                  width={36}
                  height={36}
                  className="mt-0.5 h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-background"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{post.user.name}</span>
                    <Badge variant="secondary" className="text-[10px] font-normal">
                      {getEntityTypeLabel(post.entityType)}
                    </Badge>
                    <span className="ml-auto shrink-0 text-[11px] text-muted-foreground tabular-nums">
                      {getTimeAgo(post.createdAt)}
                    </span>
                  </div>
                  {post.caption && (
                    <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {post.caption}
                    </p>
                  )}
                  {/* Interaction counts */}
                  <div className="mt-1.5 flex items-center gap-3 text-[11px] text-muted-foreground/60">
                    {post._count?.likes > 0 && (
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {post._count.likes}
                      </span>
                    )}
                    {post._count?.comments > 0 && (
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {post._count.comments}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-rose-400/15 to-pink-500/10">
              <Heart className="h-7 w-7 text-rose-400/50" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Пока нет записей в ленте</p>
            <p className="mt-1 text-xs text-muted-foreground/60">Поделитесь своими мыслями и достижениями</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
})
