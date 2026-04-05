import { Badge } from '@/components/ui/badge'
import { Star, ListChecks } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TYPE_EMOJIS, TYPE_LABELS } from './constants'
import type { CollectionType } from './types'

interface StatsBarProps {
  loading: boolean
  totalCount: number
  averageRating: number
  typeCounts: Record<string, number>
}

function ProgressRing({ progress, size = 36, strokeWidth = 3 }: { progress: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke="currentColor"
        className="text-muted/30"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke="currentColor"
        className="text-emerald-500"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
    </svg>
  )
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            'h-3 w-3',
            star <= Math.round(rating)
              ? 'fill-amber-400 text-amber-400'
              : 'text-muted-foreground/30'
          )}
        />
      ))}
    </div>
  )
}

export function StatsBar({ loading, totalCount, averageRating, typeCounts }: StatsBarProps) {
  if (loading || totalCount === 0) return null

  return (
    <div className="mt-4 p-4 rounded-xl border bg-card space-y-4">
      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 items-center">
        {/* Total count */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ListChecks className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Всего</p>
            <p className="text-lg font-bold tabular-nums">{totalCount}</p>
          </div>
        </div>

        {/* Average rating */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-500">
            <Star className="h-5 w-5 fill-amber-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Средний рейтинг</p>
            <div className="flex items-center gap-1.5">
              <p className="text-lg font-bold tabular-nums">
                {averageRating > 0 ? averageRating.toFixed(1) : '—'}
              </p>
              {averageRating > 0 && <StarDisplay rating={averageRating} />}
            </div>
          </div>
        </div>

        {/* Type diversity ring */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <ProgressRing progress={Math.min(100, Object.keys(typeCounts).length * 11)} />
            <div className="absolute inset-0 flex items-center justify-center">
              <ListChecks className="h-3.5 w-3.5 text-emerald-500" />
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Типов</p>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {Object.keys(typeCounts).length}
            </p>
          </div>
        </div>
      </div>

      {/* Per-type counts */}
      <div className="flex gap-2 flex-wrap">
        {(Object.entries(TYPE_EMOJIS) as [CollectionType, string][]).map(([key, emoji]) => {
          const count = typeCounts[key] || 0
          if (count === 0) return null
          return (
            <Badge key={key} variant="secondary" className="gap-1 font-normal text-xs">
              <span>{emoji}</span>
              {TYPE_LABELS[key]}: <span className="font-semibold tabular-nums">{count}</span>
            </Badge>
          )
        })}
      </div>
    </div>
  )
}
