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

function getProgressPct(achievement: Achievement): number | null {
  if (achievement.earned) return null
  const { threshold, current } = achievement
  if (threshold === undefined || current === undefined || threshold <= 0) return null
  return Math.min(Math.round((current / threshold) * 100), 100)
}

// ─── Component ────────────────────────────────────────────────────────────────

export const AchievementBadge = memo(function AchievementBadge({
  achievement,
  compact = false,
}: AchievementBadgeProps) {
  const { icon, name, description, gradient, category, categoryLabel, earned, earnedAt, newlyEarned, threshold, current } = achievement
  const categoryColor = CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]
  const progressPct = getProgressPct(achievement)

  const content = (
    <div
      className={cn(
        'group relative flex flex-col items-center gap-1.5 rounded-xl p-2.5 transition-all duration-200',
        earned
          ? 'cursor-default bg-background shadow-sm hover:shadow-md hover-lift'
          : 'cursor-default bg-muted/40 opacity-60 hover:opacity-80 transition-all duration-300'
      )}
    >
      {/* Icon Circle */}
      <div
        className={cn(
          'relative flex h-10 w-10 items-center justify-center rounded-full text-lg transition-all duration-200',
          earned
            ? cn(
                'bg-gradient-to-br shadow-lg',
                gradient,
                'ring-2 ring-background',
                'group-hover:scale-110',
              )
            : 'achievement-shimmer bg-muted text-muted-foreground'
        )}
      >
        {earned ? (
          icon
        ) : (
          <Lock className="h-4 w-4 text-muted-foreground" />
        )}

        {/* Subtle glow effect for unlocked achievements */}
        {earned && (
          <div className="absolute -inset-1 rounded-full bg-gradient-to-br opacity-0 group-hover:opacity-40 blur-md transition-opacity duration-300" style={{ backgroundImage: 'inherit' }} />
        )}

        {/* Newly earned glow */}
        {newlyEarned && (
          <div className="absolute inset-0 animate-ping rounded-full bg-gradient-to-br opacity-30" style={{ backgroundImage: 'inherit' }} />
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

      {/* Progress indicator for unearned achievements with thresholds */}
      {!earned && progressPct !== null && progressPct > 0 && (
        <div className="mt-0.5 w-full px-0.5">
          <div className="h-1.5 w-full rounded-full bg-muted/60 overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full bg-gradient-to-r transition-all duration-500',
                gradient,
              )}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="mt-0.5 text-[8px] text-muted-foreground tabular-nums">
            {current ?? 0}/{threshold}
          </p>
        </div>
      )}

      {/* Progress bar for unearned with no progress (show 0/threshold) */}
      {!earned && progressPct !== null && progressPct === 0 && threshold !== undefined && (
        <div className="mt-0.5 w-full px-0.5">
          <div className="h-1 w-full rounded-full bg-muted/40 overflow-hidden" />
          <p className="mt-0.5 text-[8px] text-muted-foreground tabular-nums">
            0/{threshold}
          </p>
        </div>
      )}

      {/* Earned badge */}
      {earned && !compact && (
        <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-[8px] shadow-sm shadow-amber-500/30">
          ✓
        </div>
      )}
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

  // Tooltip for unearned achievements with progress
  if (!earned && progressPct !== null) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[200px]">
          <p className="font-medium">{name}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
              <div
                className={cn('h-full rounded-full bg-gradient-to-r', gradient)}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-[10px] tabular-nums text-muted-foreground font-medium">
              {current ?? 0}/{threshold}
            </span>
          </div>
        </TooltipContent>
      </Tooltip>
    )
  }

  return content
})
