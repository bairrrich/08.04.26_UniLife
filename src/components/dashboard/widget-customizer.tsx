'use client'

import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { GripVertical, ChevronUp, ChevronDown, RotateCcw, Search } from 'lucide-react'
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
  const [search, setSearch] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Sync config from localStorage when dialog opens (state update during render pattern)
  if (open && !prevOpen) {
    setPrevOpen(true)
    const loaded = loadWidgetConfig()
    setConfig(loaded)
    setSearch('')
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

  // Filter sections by search
  const filteredSections = useMemo(() => {
    if (!search.trim()) return sections
    const query = search.toLowerCase().trim()
    return sections.filter(
      (s) =>
        s.title.toLowerCase().includes(query) ||
        s.icon.includes(query)
    )
  }, [sections, search])

  // Count enabled (visible) widgets
  const enabledCount = useMemo(() => {
    return DEFAULT_SECTIONS.filter((s) => config.visible[s.id] ?? true).length
  }, [config.visible])

  // Keyboard shortcut: Escape clears search or closes dialog
  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        if (search) {
          setSearch('')
          // Keep focus on the input after clearing
          requestAnimationFrame(() => {
            searchInputRef.current?.focus()
          })
        } else {
          onOpenChange(false)
        }
      }
    },
    [search, onOpenChange]
  )

  // Auto-focus search input when dialog opens
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [open])

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

        {/* Search + count indicator */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Поиск виджетов..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="pl-8"
            />
          </div>
          <Badge variant="secondary" className="shrink-0 text-xs tabular-nums">
            {enabledCount} из {DEFAULT_SECTIONS.length} включено
          </Badge>
        </div>

        {/* Widget list */}
        <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
          {filteredSections.length > 0 ? (
            filteredSections.map((section) => {
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
            })
          ) : (
            /* Empty state */
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <span className="text-3xl">🔍</span>
              <p className="text-sm text-muted-foreground">
                Ничего не найдено по запросу «{search}»
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch('')
                  searchInputRef.current?.focus()
                }}
                className="mt-1 text-xs text-muted-foreground"
              >
                Очистить поиск
              </Button>
            </div>
          )}
        </div>

        {/* Reset button */}
        <div className="sticky bottom-0 flex justify-center border-t bg-background/90 pb-1 pt-2">
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
