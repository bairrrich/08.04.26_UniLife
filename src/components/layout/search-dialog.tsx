'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { safeJson } from '@/lib/safe-fetch'
import {
  Search,
  BookOpen,
  Wallet,
  Apple,
  Dumbbell,
  Library,
  Rss,
  X,
  CornerDownLeft,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAppStore, type AppModule } from '@/store/use-app-store'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ───────────────────────────────────────────────────────────────────

interface SearchResultItem {
  id: string
  type: string
  [key: string]: unknown
}

interface SearchGroup {
  key: string
  label: string
  icon: LucideIcon
  module: AppModule
  items: SearchResultItem[]
}

interface SearchResponse {
  success: boolean
  data: {
    diary: SearchResultItem[]
    finance: SearchResultItem[]
    nutrition: SearchResultItem[]
    workout: SearchResultItem[]
    collections: SearchResultItem[]
    feed: SearchResultItem[]
  }
}

// ─── Module config ───────────────────────────────────────────────────────────

const MODULE_CONFIG: Array<{
  key: string
  label: string
  icon: LucideIcon
  module: AppModule
}> = [
  { key: 'diary', label: 'Дневник', icon: BookOpen, module: 'diary' },
  { key: 'finance', label: 'Финансы', icon: Wallet, module: 'finance' },
  { key: 'nutrition', label: 'Питание', icon: Apple, module: 'nutrition' },
  { key: 'workout', label: 'Тренировки', icon: Dumbbell, module: 'workout' },
  { key: 'collections', label: 'Коллекции', icon: Library, module: 'collections' },
  { key: 'feed', label: 'Лента', icon: Rss, module: 'feed' },
]

const MEAL_TYPE_LABELS: Record<string, string> = {
  BREAKFAST: 'Завтрак',
  LUNCH: 'Обед',
  DINNER: 'Ужин',
  SNACK: 'Перекус',
}

const ENTITY_TYPE_LABELS: Record<string, string> = {
  diary: 'Дневник',
  transaction: 'Транзакция',
  meal: 'Приём пищи',
  workout: 'Тренировка',
  collection: 'Коллекция',
}

const ITEM_TYPE_LABELS: Record<string, string> = {
  BOOK: 'Книга',
  MOVIE: 'Фильм',
  RECIPE: 'Рецепт',
  SUPPLEMENT: 'Добавка',
  PRODUCT: 'Продукт',
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
  }).format(date)
}

function getResultSubtitle(item: SearchResultItem): string {
  switch (item.type) {
    case 'diary':
      return String(item.content || '').substring(0, 60)
    case 'finance':
      return `${item.description} · ${formatCurrency(Number(item.amount))}`
    case 'nutrition':
      return MEAL_TYPE_LABELS[String(item.type)] || String(item.type)
    case 'workout':
      return `${item.durationMin ? item.durationMin + ' мин' : ''} · ${formatDate(String(item.date))}`
    case 'collections':
      return item.author
        ? `${item.author} · ${ITEM_TYPE_LABELS[String(item.itemType)] || item.itemType}`
        : ITEM_TYPE_LABELS[String(item.itemType)] || String(item.itemType)
    case 'feed':
      return ENTITY_TYPE_LABELS[String(item.entityType)] || String(item.entityType)
    default:
      return ''
  }
}

function getResultTitle(item: SearchResultItem): string {
  switch (item.type) {
    case 'diary':
      return String(item.title || 'Без названия')
    case 'finance':
      return String(item.description || 'Без описания')
    case 'nutrition':
      return `${MEAL_TYPE_LABELS[String(item.type)] || item.type} — ${formatDate(String(item.date))}`
    case 'workout':
      return String(item.name || 'Тренировка')
    case 'collections':
      return String(item.title)
    case 'feed':
      return String(item.caption || '').substring(0, 50) || 'Публикация'
    default:
      return ''
  }
}

// ─── Search Dialog ───────────────────────────────────────────────────────────

export function SearchDialog() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { setActiveModule } = useAppStore()

  // Keyboard shortcut Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Focus input when dialog opens
  useEffect(() => {
    if (open) {
      // Reset state when opening
      setQuery('')
      setResults(null)
      setLoading(false)
      // Small delay to allow dialog animation
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [open])

  // Debounced search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults(null)
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}`)
      const data = await safeJson(res)
      setResults(data)
    } catch {
      setResults(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleInputChange = useCallback(
    (value: string) => {
      setQuery(value)

      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }

      debounceRef.current = setTimeout(() => {
        performSearch(value)
      }, 300)
    },
    [performSearch]
  )

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  const handleResultClick = (module: AppModule) => {
    setActiveModule(module)
    setOpen(false)
  }

  // Build grouped results
  const groupedResults: SearchGroup[] = results
    ? MODULE_CONFIG.filter((cfg) => {
        const items = results.data[cfg.key as keyof typeof results.data]
        return items && items.length > 0
      }).map((cfg) => ({
        ...cfg,
        items: results.data[cfg.key as keyof typeof results.data] || [],
      }))
    : []

  const totalResults = groupedResults.reduce(
    (sum, group) => sum + group.items.length,
    0
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-xl p-0 gap-0 overflow-hidden top-[20%]"
      >
        <DialogTitle className="sr-only">Поиск</DialogTitle>
        <DialogDescription className="sr-only">
          Глобальный поиск по всем модулям
        </DialogDescription>

        {/* Search Input */}
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <Search className="h-4.5 w-4.5 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Поиск по дневнику, финансам, тренировкам..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setOpen(false)
              }
            }}
          />
          {query && (
            <button
              onClick={() => {
                setQuery('')
                setResults(null)
                inputRef.current?.focus()
              }}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <CornerDownLeft className="h-3 w-3" />
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[420px] overflow-hidden">
          {loading && <SearchSkeleton />}

          {!loading && query.trim().length >= 2 && totalResults === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">Ничего не найдено</p>
              <p className="text-xs text-muted-foreground mt-1">
                Попробуйте другой запрос
              </p>
            </div>
          )}

          {!loading && results && totalResults > 0 && (
            <ScrollArea className="h-[420px]">
              <div className="py-2">
                {groupedResults.map((group) => (
                  <div key={group.key} className="mb-1">
                    {/* Group header */}
                    <div className="flex items-center gap-2 px-4 py-1.5">
                      <group.icon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {group.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {group.items.length}
                      </span>
                    </div>

                    {/* Group items */}
                    {group.items.map((item) => {
                      const Icon = group.icon
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleResultClick(group.module)}
                          className={cn(
                            'flex w-full items-start gap-3 px-4 py-2.5 text-left',
                            'hover:bg-accent/50 transition-colors'
                          )}
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted mt-0.5">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {getResultTitle(item)}
                            </p>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {getResultSubtitle(item)}
                            </p>
                          </div>
                          <Badge
                            variant="secondary"
                            className="shrink-0 text-[10px] h-5 mt-0.5"
                          >
                            {group.label}
                          </Badge>
                        </button>
                      )
                    })}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          {!loading && query.trim().length < 2 && (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">
                Введите запрос для поиска
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Минимум 2 символа · Ищется по всем модулям
              </p>

              {/* Quick tips */}
              <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                {['Дневник', 'Тренировка', 'Финансы'].map((tip) => (
                  <button
                    key={tip}
                    onClick={() => handleInputChange(tip)}
                    className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  >
                    {tip}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="border-t px-4 py-2 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>
            <kbd className="font-mono rounded border bg-muted px-1 py-0.5 text-[10px]">
              ↑↓
            </kbd>{' '}
            навигация
          </span>
          <span>
            <kbd className="font-mono rounded border bg-muted px-1 py-0.5 text-[10px]">
              ↵
            </kbd>{' '}
            открыть ·{' '}
            <kbd className="font-mono rounded border bg-muted px-1 py-0.5 text-[10px]">
              esc
            </kbd>{' '}
            закрыть
          </span>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Search Trigger ──────────────────────────────────────────────────────────

interface SearchTriggerProps {
  className?: string
}

export function SearchTrigger({ className }: SearchTriggerProps) {
  return (
    <button
      onClick={() => {
        // Dispatch Cmd+K event to open the dialog
        document.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'k',
            metaKey: true,
            ctrlKey: true,
            bubbles: true,
          })
        )
      }}
      className={cn(
        'flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground',
        'hover:bg-accent hover:text-accent-foreground transition-colors',
        'cursor-pointer',
        className
      )}
    >
      <Search className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">Поиск...</span>
      <kbd className="hidden sm:inline-flex ml-3 h-5 items-center gap-0.5 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground shadow-sm">
        ⌘K
      </kbd>
    </button>
  )
}

// ─── Skeleton Loader ─────────────────────────────────────────────────────────

function SearchSkeleton() {
  return (
    <div className="px-4 py-3 space-y-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-start gap-3">
          <Skeleton className="h-8 w-8 rounded-md" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      ))}
    </div>
  )
}
