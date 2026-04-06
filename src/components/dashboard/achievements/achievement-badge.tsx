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
  const { icon, name, description, gradient, category, categoryLabel, earned, earnedAt, newlyEarned } = achievement
  const categoryColor = CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]

  const content = (
    <div
      className={cn(
        'group relative flex flex-col items-center gap-1.5 rounded-xl p-2.5 transition-all duration-200',
        earned
          ? 'cursor-default bg-background shadow-sm hover:shadow-md'
          : 'cursor-default bg-muted/40 opacity-50'
      )}
    >
      {/* Icon Circle */}
      <div
        className={cn(
          'relative flex h-10 w-10 items-center justify-center rounded-full text-lg transition-transform duration-200',
          earned
            ? cn(
                'bg-gradient-to-br shadow-lg',
                gradient,
                'ring-2 ring-background',
                'group-hover:scale-110',
              )
            : 'bg-muted text-muted-foreground'
        )}
      >
        {earned ? (
          icon
        ) : (
          <Lock className="h-4 w-4 text-muted-foreground" />
        )}
      </div>

      {/* Text */}
      <div className="flex flex-col items-center gap-0.5 text-center">
        <span
          className={cn(
            'text-[11px] font-semibold leading-tight',
            earned ? 'text-foreground' : 'text-muted-foreground'
          )}
        >
          {name}
        </span>
        {!compact && (
          <span className="text-[9px] leading-tight text-muted-foreground line-clamp-2">
            {description}
          </span>
        )}
      </div>
    </div>
  )

  if (earned && earnedAt) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[200px]">
          <p className="font-medium">{name}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
          <p className="mt-1 text-[10px] text-muted-foreground">
            📅 Получено: {formatEarnedDate(earnedAt)}
          </p>
        </TooltipContent>
      </Tooltip>
    )
  }

  return content
})
