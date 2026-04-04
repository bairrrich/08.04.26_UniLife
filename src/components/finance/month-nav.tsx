'use client'

import { Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MonthNavProps {
  monthLabel: string
  onNavigate: (direction: number) => void
}

export function MonthNav({ monthLabel, onNavigate }: MonthNavProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-2">
      <Button variant="ghost" size="sm" onClick={() => onNavigate(-1)} className="h-8 w-8 p-0">&larr;</Button>
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium capitalize">{monthLabel}</span>
      </div>
      <Button variant="ghost" size="sm" onClick={() => onNavigate(1)} className="h-8 w-8 p-0">&rarr;</Button>
    </div>
  )
}
