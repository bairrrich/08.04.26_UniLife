'use client'

import { Camera } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MealPhotoPlaceholderProps {
  className?: string
}

export function MealPhotoPlaceholder({ className }: MealPhotoPlaceholderProps) {
  return (
    <button
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-4 transition-all',
        'border-muted-foreground/20 hover:border-primary/40 hover:bg-primary/5',
        'cursor-pointer active-press group',
        className
      )}
      type="button"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/60 transition-colors group-hover:bg-primary/10">
        <Camera className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary/60" />
      </div>
      <div className="text-center">
        <p className="text-xs font-medium text-muted-foreground group-hover:text-foreground/70 transition-colors">
          Добавить фото
        </p>
        <p className="text-[10px] text-muted-foreground/50">
          Фотография блюда
        </p>
      </div>
    </button>
  )
}
