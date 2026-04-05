'use client'

import Image from 'next/image'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Heart, ArrowRight } from 'lucide-react'
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

export default function ActivityFeed({ loading, feedPosts, getTimeAgo, onNavigateToFeed }: ActivityFeedProps) {
  return (
    <Card className="rounded-xl border">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">Последняя активность</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-muted-foreground"
          onClick={onNavigateToFeed}
        >
          Все записи
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : feedPosts.length > 0 ? (
          <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
            {feedPosts.map((post) => (
              <div
                key={post.id}
                className={`flex min-h-[44px] items-start gap-3 rounded-xl border-l-4 p-3 transition-colors hover:bg-muted/50 ${getEntityBorderColor(post.entityType)}`}
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
                    <Badge variant="secondary" className="text-[10px]">
                      {getEntityTypeLabel(post.entityType)}
                    </Badge>
                    <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                      {getTimeAgo(post.createdAt)}
                    </span>
                  </div>
                  {post.caption && (
                    <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {post.caption}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Heart className="mb-2 h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Пока нет записей в ленте</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
