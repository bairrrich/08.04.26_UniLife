'use client'

import { Settings2 } from 'lucide-react'

interface CustomizeButtonProps {
  onClick: () => void
}

export function CustomizeButton({ onClick }: CustomizeButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-background/80 text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
      aria-label="Настроить виджеты"
      title="Настроить виджеты"
    >
      <Settings2 className="h-4 w-4" />
    </button>
  )
}
