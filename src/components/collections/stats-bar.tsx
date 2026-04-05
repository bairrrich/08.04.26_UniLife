import { Badge } from '@/components/ui/badge'
import { Star, ListChecks, CheckCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsBarProps {
  loading: boolean
  totalCount: number
  completedCount: number
  inProgressCount: number
  averageRating: number
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
              : 'text-gray-300 dark:text-gray-600'
          )}
        />
      ))}
    </div>
  )
}

export function StatsBar({ loading, totalCount, completedCount, inProgressCount, averageRating }: StatsBarProps) {
  if (loading || totalCount === 0) return null

  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div className="mt-4 p-4 rounded-xl border bg-card">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
        {/* Total count */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ListChecks className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Всего</p>
            <p className="text-lg font-bold">{totalCount}</p>
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
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
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
            <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{inProgressCount}</p>
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
              <p className="text-lg font-bold">
                {averageRating > 0 ? averageRating.toFixed(1) : '—'}
              </p>
              {averageRating > 0 && <StarDisplay rating={averageRating} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
