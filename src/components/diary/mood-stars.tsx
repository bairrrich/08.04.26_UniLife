'use client'

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MoodStarsProps {
  mood: number | null
  interactive?: boolean
  onChange?: (v: number) => void
}

export function MoodStars({ mood, interactive = false, onChange }: MoodStarsProps) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((v) => (
        <button
          key={v}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(v)}
          className={cn(
            'p-0.5 rounded transition-colors',
            interactive && 'hover:scale-110 cursor-pointer',
            !interactive && 'cursor-default'
          )}
        >
          <Star
            className={cn(
              'h-5 w-5 transition-colors',
              v <= (mood || 0)
                ? 'fill-amber-400 text-amber-400'
                : 'fill-none text-muted-foreground/30'
            )}
          />
        </button>
      ))}
    </div>
  )
}
