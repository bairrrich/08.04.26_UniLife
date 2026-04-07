'use client'

import { useState, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { GripVertical, ChevronUp, ChevronDown, RotateCcw } from 'lucide-react'
import type { SectionDef, SectionConfig } from './use-section-config'

interface SectionCustomizerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sections: SectionDef[]
  config: SectionConfig
  onToggle: (sectionId: string) => void
  onMove: (sectionId: string, direction: 'up' | 'down') => void
  onReset: () => void
  moduleTitle: string
}

export function SectionCustomizer({
  open,
  onOpenChange,
  sections,
  config,
  onToggle,
  onMove,
  onReset,
  moduleTitle,
}: SectionCustomizerProps) {
  const [prevOpen, setPrevOpen] = useState(false)

  const sorted = useMemo(() => {
    return [...sections].sort((a, b) => {
      const aIdx = config.order.indexOf(a.id)
      const bIdx = config.order.indexOf(b.id)
      return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx)
    })
  }, [sections, config.order])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-xl">🧩</span>
            Настроить виджеты
          </DialogTitle>
          <DialogDescription>
            Включайте, выключайте и меняйте порядок секций — {moduleTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {sorted.map((section) => {
            const isVisible = config.visible[section.id] ?? true
            const idx = config.order.indexOf(section.id)
            return (
              <div
                key={section.id}
                className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors ${
                  isVisible
                    ? 'border-border bg-background'
                    : 'border-border/50 bg-muted/30 opacity-60'
                }`}
              >
                <div className="flex flex-col items-center gap-0.5 text-muted-foreground/40">
                  <GripVertical className="h-4 w-4" />
                </div>

                <div className="flex min-w-0 flex-1 items-center gap-2.5">
                  <span className="text-lg leading-none">{section.icon}</span>
                  <span className="truncate text-sm font-medium">{section.title}</span>
                </div>

                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => onMove(section.id, 'up')}
                    disabled={idx <= 0}
                    className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
                    aria-label="Переместить вверх"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMove(section.id, 'down')}
                    disabled={idx === -1 || idx >= config.order.length - 1}
                    className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
                    aria-label="Переместить вниз"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>

                <Switch checked={isVisible} onCheckedChange={() => onToggle(section.id)} />
              </div>
            )
          })}
        </div>

        <div className="flex justify-center pt-2">
          <Button variant="ghost" size="sm" onClick={onReset} className="gap-2 text-muted-foreground">
            <RotateCcw className="h-3.5 w-3.5" />
            Сбросить настройки
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
