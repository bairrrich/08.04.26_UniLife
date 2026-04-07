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
import {
  DEFAULT_SECTIONS,
  loadWidgetConfig,
  saveWidgetConfig,
  resetWidgetConfig,
  type SavedWidgetConfig,
} from './widget-config'

interface WidgetCustomizerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfigChange: (config: SavedWidgetConfig) => void
}

export default function WidgetCustomizer({
  open,
  onOpenChange,
  onConfigChange,
}: WidgetCustomizerProps) {
  const [config, setConfig] = useState<SavedWidgetConfig>(() => loadWidgetConfig())
  const [prevOpen, setPrevOpen] = useState(false)

  // Sync config from localStorage when dialog opens (state update during render pattern)
  if (open && !prevOpen) {
    setPrevOpen(true)
    const loaded = loadWidgetConfig()
    setConfig(loaded)
  }
  if (!open && prevOpen) {
    setPrevOpen(false)
  }

  // Derive sorted sections from config order
  const sections = useMemo(() => {
    return [...DEFAULT_SECTIONS].sort((a, b) => {
      const aIdx = config.order.indexOf(a.id)
      const bIdx = config.order.indexOf(b.id)
      return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx)
    })
  }, [config.order])

  const handleToggle = (sectionId: string) => {
    const newConfig: SavedWidgetConfig = {
      ...config,
      visible: {
        ...config.visible,
        [sectionId]: !config.visible[sectionId],
      },
    }
    setConfig(newConfig)
    saveWidgetConfig(newConfig)
    onConfigChange(newConfig)
  }

  const handleMove = (sectionId: string, direction: 'up' | 'down') => {
    const newOrder = [...config.order]
    const idx = newOrder.indexOf(sectionId)
    if (idx === -1) return

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1
    if (targetIdx < 0 || targetIdx >= newOrder.length) return

    // Swap
    ;[newOrder[idx], newOrder[targetIdx]] = [newOrder[targetIdx], newOrder[idx]]

    const newConfig: SavedWidgetConfig = { ...config, order: newOrder }
    setConfig(newConfig)
    saveWidgetConfig(newConfig)
    onConfigChange(newConfig)
  }

  const handleReset = () => {
    const defaultConfig = resetWidgetConfig()
    setConfig(defaultConfig)
    onConfigChange(defaultConfig)
  }

  const canMoveUp = (sectionId: string) => {
    const idx = config.order.indexOf(sectionId)
    return idx > 0
  }

  const canMoveDown = (sectionId: string) => {
    const idx = config.order.indexOf(sectionId)
    return idx >= 0 && idx < config.order.length - 1
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-xl">🧩</span>
            Настроить виджеты
          </DialogTitle>
          <DialogDescription>
            Включайте, выключайте и меняйте порядок секций на главной странице
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-2">
          {sections.map((section) => {
            const isVisible = config.visible[section.id] ?? true
            return (
              <div
                key={section.id}
                className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors ${
                  isVisible
                    ? 'border-border bg-background'
                    : 'border-border/50 bg-muted/30 opacity-60'
                }`}
              >
                {/* Drag handle (visual only) */}
                <div className="flex flex-col items-center gap-0.5 text-muted-foreground/40">
                  <GripVertical className="h-4 w-4" />
                </div>

                {/* Emoji + Title */}
                <div className="flex min-w-0 flex-1 items-center gap-2.5">
                  <span className="text-lg leading-none">{section.icon}</span>
                  <span className="truncate text-sm font-medium">
                    {section.title}
                  </span>
                </div>

                {/* Reorder buttons */}
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => handleMove(section.id, 'up')}
                    disabled={!canMoveUp(section.id)}
                    className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
                    aria-label="Переместить вверх"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(section.id, 'down')}
                    disabled={!canMoveDown(section.id)}
                    className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
                    aria-label="Переместить вниз"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Toggle */}
                <Switch
                  checked={isVisible}
                  onCheckedChange={() => handleToggle(section.id)}
                />
              </div>
            )
          })}
        </div>

        {/* Reset button */}
        <div className="flex justify-center pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="gap-2 text-muted-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Сбросить настройки
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
