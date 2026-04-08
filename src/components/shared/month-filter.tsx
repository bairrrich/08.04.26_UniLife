'use client'

import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface MonthFilterProps {
  label: string
  onNavigate: (direction: number) => void
  onToday?: () => void
  showToday?: boolean
  badge?: string
}

export function MonthFilter({
  label,
  onNavigate,
  onToday,
  showToday,
  badge,
}: MonthFilterProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={() => onNavigate(-1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="flex items-center gap-2">
        <h2 className="text-base font-semibold tabular-nums">{label}</h2>
        {badge && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            {badge}
          </Badge>
        )}
        {showToday && onToday && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToday}
            className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <CalendarDays className="h-3 w-3" />
            Сегодня
          </Button>
        )}
      </div>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={() => onNavigate(1)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
