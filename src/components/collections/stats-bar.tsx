import { Badge } from '@/components/ui/badge'
import { ListChecks, CheckCircle, Loader2 } from 'lucide-react'

interface StatsBarProps {
  loading: boolean
  totalCount: number
  completedCount: number
  inProgressCount: number
}

export function StatsBar({ loading, totalCount, completedCount, inProgressCount }: StatsBarProps) {
  if (loading || totalCount === 0) return null

  return (
    <div className="flex items-center gap-3 mt-4 flex-wrap">
      <Badge variant="outline" className="gap-1.5 font-normal text-xs">
        <ListChecks className="h-3 w-3" />
        Всего: {totalCount}
      </Badge>
      <Badge variant="secondary" className="gap-1.5 font-normal text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
        <CheckCircle className="h-3 w-3" />
        Завершено: {completedCount}
      </Badge>
      <Badge variant="secondary" className="gap-1.5 font-normal text-xs bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
        <Loader2 className="h-3 w-3" />
        В процессе: {inProgressCount}
      </Badge>
    </div>
  )
}
