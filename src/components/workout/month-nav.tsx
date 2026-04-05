'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// ─── Month Navigation ───────────────────────────────────────────────────────

function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split('-').map(Number)
  const months = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
  ]
  return `${months[month - 1]} ${year}`
}

interface MonthNavProps {
  month: string
  onChange: (direction: number) => void
}

export function MonthNav({ month, onChange }: MonthNavProps) {
  return (
    <div className="flex items-center gap-3">
      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onChange(-1)}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm font-medium min-w-[160px] text-center">
        {formatMonth(month)}
      </span>
      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onChange(1)}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

export { formatMonth }
