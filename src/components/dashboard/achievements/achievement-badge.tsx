'use client'

import { memo } from 'react'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Achievement } from './types'
import { CATEGORY_COLORS } from './constants'

// ─── Props ────────────────────────────────────────────────────────────────────

interface AchievementBadgeProps {
  achievement: Achievement
  compact?: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatEarnedDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// ─── Component ────────────────────────────────────────────────────────────────

export const AchievementBadge = memo(function AchievementBadge({
  achievement,
  compact = false,
}: AchievementBadgeProps) {
  const { icon, name, description, gradient, category, categoryLabel, earned, earnedAt } = achievement
  const categoryColor = CATEGORY_COLORS[category]

  const content = (
    <div
      className={cn(
        'group relative flex flex-col items-center gap-2 rounded-xl p-4 transition-all duration-200',
        earned
          ? 'cursor-default bg-background shadow-sm hover:shadow-md'
          : 'cursor-default bg-muted/40 opacity-60'
      )}
    >
      {/* Icon Circle */}
      <div
        className={cn(
          'relative flex h-12 w-12 items-center justify-center rounded-full text-xl transition-transform duration-200',
          earned
            ? cn(
                'bg-gradient-to-br shadow-lg',
                gradient,
                'ring-2 ring-background',
                'group-hover:scale-110',
                // Subtle glow for earned badges
                'after:absolute after:inset-0 after:rounded-full after:bg-gradient-to-br after:opacity-0 after:blur-md after:transition-opacity group-hover:after:opacity-40',
                `after:${gradient}`
              )
            : 'bg-muted text-muted-foreground'
        )}
      >
        {earned ? (
          icon
        ) : (
          <Lock className="h-5 w-5 text-muted-foreground" />
        )}
      </div>

      {/* Text */}
      <div className="flex flex-col items-center gap-1 text-center">
        <span
          className={cn(
            'text-xs font-semibold leading-tight',
            earned ? 'text-foreground' : 'text-muted-foreground'
          )}
        >
          {name}
        </span>
        {!compact && (
          <span className="text-[10px] leading-tight text-muted-foreground line-clamp-2">
            {description}
          </span>
        )}
      </div>

      {/* Category Badge */}
      <Badge
        variant="secondary"
        className={cn(
          'text-[10px] px-1.5 py-0',
          earned ? '' : 'opacity-50'
        )}
      >
        {categoryLabel}
      </Badge>
    </div>
  )

  if (earned && earnedAt) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="font-medium">Получено: {formatEarnedDate(earnedAt)}</p>
        </TooltipContent>
      </Tooltip>
    )
  }

  return content
})
