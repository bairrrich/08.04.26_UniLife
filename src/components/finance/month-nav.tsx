'use client'

import { Filter, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MonthNavProps {
  monthLabel: string
  onNavigate: (direction: number) => void
  onToday?: () => void
  showToday?: boolean
}

export function MonthNav({ monthLabel, onNavigate, onToday, showToday }: MonthNavProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-2">
      <Button variant="ghost" size="sm" onClick={() => onNavigate(-1)} className="h-8 w-8 p-0">&larr;</Button>
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium capitalize">{monthLabel}</span>
        {showToday && onToday && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToday}
            className="ml-1 h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <CalendarDays className="h-3 w-3" />
            Сегодня
          </Button>
        )}
      </div>
      <Button variant="ghost" size="sm" onClick={() => onNavigate(1)} className="h-8 w-8 p-0">&rarr;</Button>
    </div>
  )
}
