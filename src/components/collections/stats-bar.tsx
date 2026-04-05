import { Badge } from '@/components/ui/badge'
import { Star, ListChecks, CheckCircle, Loader2, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TYPE_EMOJIS, TYPE_LABELS, STATUS_LABELS } from './constants'
import type { CollectionType } from './types'

interface StatsBarProps {
  loading: boolean
  totalCount: number
  wantCount: number
  completedCount: number
  inProgressCount: number
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

export function StatsBar({ loading, totalCount, wantCount, completedCount, inProgressCount, averageRating, typeCounts }: StatsBarProps) {
  if (loading || totalCount === 0) return null

  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div className="mt-4 p-4 rounded-xl border bg-card space-y-4">
      {/* Status Pipeline - Visual flow */}
      <div className="flex items-center gap-2 sm:gap-3">
        <StatusPill
          icon={<Heart className="h-3.5 w-3.5" />}
          label="Хочу"
          count={wantCount}
          color="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
          active
        />
        {/* Arrow connector */}
        <div className="flex items-center text-muted-foreground/40 shrink-0">
          <div className="h-px w-4 sm:w-8 bg-gradient-to-r from-blue-300 to-amber-300 dark:from-blue-700 dark:to-amber-700" />
          <span className="text-[10px] mx-0.5">→</span>
        </div>
        <StatusPill
          icon={<Loader2 className="h-3.5 w-3.5" />}
          label="В процессе"
          count={inProgressCount}
          color="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
          active={inProgressCount > 0}
        />
        {/* Arrow connector */}
        <div className="flex items-center text-muted-foreground/40 shrink-0">
          <div className="h-px w-4 sm:w-8 bg-gradient-to-r from-amber-300 to-emerald-300 dark:from-amber-700 dark:to-emerald-700" />
          <span className="text-[10px] mx-0.5">→</span>
        </div>
        <StatusPill
          icon={<CheckCircle className="h-3.5 w-3.5" />}
          label="Завершено"
          count={completedCount}
          color="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
          active={completedCount > 0}
        />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
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

        {/* Completed with progress ring */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <ProgressRing progress={progressPercent} />
            <div className="absolute inset-0 flex items-center justify-center">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Завершено</p>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {completedCount}
              <span className="text-xs font-normal text-muted-foreground ml-1">({progressPercent}%)</span>
            </p>
          </div>
        </div>

        {/* In progress */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
            <Loader2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">В процессе</p>
            <p className="text-lg font-bold text-amber-600 dark:text-amber-400 tabular-nums">{inProgressCount}</p>
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

// ─── Status Pipeline Pill ──────────────────────────────────────────────────────

function StatusPill({ icon, label, count, color, active }: {
  icon: React.ReactNode
  label: string
  count: number
  color: string
  active: boolean
}) {
  return (
    <div className={cn(
      'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all shrink-0',
      active ? color : 'bg-muted/50 text-muted-foreground',
    )}>
      {icon}
      <span className="hidden sm:inline">{label}</span>
      <span className="font-bold tabular-nums">{count}</span>
    </div>
  )
}
