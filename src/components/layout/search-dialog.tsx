'use client'

import { useCallback, useEffect, useRef, useState, useMemo } from 'react'
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
  Compass,
  Zap,
  LayoutDashboard,
  Target,
  Crosshair,
  BarChart3,
  Settings,
  Plus,
  PenLine,
  Receipt,
  UtensilsCrossed,
  Flame,
  Award,
  Download,
  Sun,
  Moon,
  Clock,
  Trash2,
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
import { useTheme } from 'next-themes'
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

type PaletteMode = 'search' | 'navigate' | 'actions'

interface RecentModule {
  moduleId: AppModule
  timestamp: number
}

// ─── Module config for search results ────────────────────────────────────────

const SEARCH_MODULE_CONFIG: Array<{
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

// ─── Navigation items (all 11 modules) ──────────────────────────────────────

interface NavItem {
  id: AppModule
  label: string
  description: string
  icon: LucideIcon
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Дашборд', description: 'Обзор и главная страница', icon: LayoutDashboard },
  { id: 'diary', label: 'Дневник', description: 'Личные записи и мысли', icon: BookOpen },
  { id: 'finance', label: 'Финансы', description: 'Доходы, расходы и бюджет', icon: Wallet },
  { id: 'nutrition', label: 'Питание', description: 'Приёмы пищи и калории', icon: Apple },
  { id: 'workout', label: 'Тренировки', description: 'Упражнения и прогресс', icon: Dumbbell },
  { id: 'habits', label: 'Привычки', description: 'Трекер ежедневных привычек', icon: Target },
  { id: 'collections', label: 'Коллекции', description: 'Книги, фильмы и рецепты', icon: Library },
  { id: 'feed', label: 'Лента', description: 'Социальная лента новостей', icon: Rss },
  { id: 'goals', label: 'Цели', description: 'Постановка и отслеживание целей', icon: Crosshair },
  { id: 'analytics', label: 'Аналитика', description: 'Статистика и графики', icon: BarChart3 },
  { id: 'settings', label: 'Настройки', description: 'Профиль и параметры приложения', icon: Settings },
]

// ─── Quick actions ──────────────────────────────────────────────────────────

interface QuickAction {
  id: string
  label: string
  icon: LucideIcon
  module: AppModule
  description?: string
  action?: 'theme-toggle'
}

const QUICK_ACTIONS: QuickAction[] = [
  { id: 'new-diary', label: 'Новая запись в дневник', icon: PenLine, module: 'diary', description: 'Открыть дневник' },
  { id: 'add-transaction', label: 'Добавить транзакцию', icon: Receipt, module: 'finance', description: 'Открыть финансы' },
  { id: 'log-meal', label: 'Записать приём пищи', icon: UtensilsCrossed, module: 'nutrition', description: 'Открыть питание' },
  { id: 'start-workout', label: 'Начать тренировку', icon: Flame, module: 'workout', description: 'Открыть тренировки' },
  { id: 'add-habit', label: 'Добавить привычку', icon: Award, module: 'habits', description: 'Открыть привычки' },
  { id: 'new-goal', label: 'Новая цель', icon: Crosshair, module: 'goals', description: 'Открыть цели' },
  { id: 'export-data', label: 'Экспорт данных', icon: Download, module: 'settings', description: 'Открыть настройки' },
]

// ─── Mode config ────────────────────────────────────────────────────────────

const MODE_TABS: Array<{ mode: PaletteMode; label: string; icon: LucideIcon }> = [
  { mode: 'search', label: 'Поиск', icon: Search },
  { mode: 'navigate', label: 'Навигация', icon: Compass },
  { mode: 'actions', label: 'Действия', icon: Zap },
]

// ─── Search helpers ─────────────────────────────────────────────────────────

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

// ─── localStorage helpers ───────────────────────────────────────────────────

function getRecentModules(): RecentModule[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem('unilife-recent-modules')
    if (!raw) return []
    return JSON.parse(raw) as RecentModule[]
  } catch {
    return []
  }
}

function saveRecentModule(moduleId: AppModule): void {
  if (typeof window === 'undefined') return
  try {
    const existing = getRecentModules().filter((r) => r.moduleId !== moduleId)
    existing.unshift({ moduleId, timestamp: Date.now() })
    localStorage.setItem('unilife-recent-modules', JSON.stringify(existing.slice(0, 5)))
  } catch {
    // ignore
  }
}

function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem('unilife-recent-searches')
    if (!raw) return []
    return JSON.parse(raw) as string[]
  } catch {
    return []
  }
}

function saveRecentSearch(query: string): void {
  if (typeof window === 'undefined') return
  try {
    const existing = getRecentSearches().filter((s) => s !== query)
    existing.unshift(query)
    localStorage.setItem('unilife-recent-searches', JSON.stringify(existing.slice(0, 5)))
  } catch {
    // ignore
  }
}

function clearRecentSearches(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem('unilife-recent-searches')
  } catch {
    // ignore
  }
}

// ─── Search Dialog (Command Palette) ────────────────────────────────────────

export function SearchDialog() {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<PaletteMode>('search')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { resolvedTheme, setTheme } = useTheme()
  const setActiveModule = useAppStore((s) => s.setActiveModule)

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

  // Focus input and reset state when dialog opens
  useEffect(() => {
    if (open) {
      setQuery('')
      setResults(null)
      setLoading(false)
      setSelectedIndex(-1)
      setRecentSearches(getRecentSearches())
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [open])

  // Debounced search (search mode only)
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
      saveRecentSearch(searchQuery.trim())
      setRecentSearches(getRecentSearches())
    } catch {
      setResults(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleInputChange = useCallback(
    (value: string) => {
      setQuery(value)

      if (mode === 'search') {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current)
        }

        debounceRef.current = setTimeout(() => {
          performSearch(value)
        }, 300)
      }
    },
    [mode, performSearch]
  )

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  // Build grouped search results
  const groupedResults: SearchGroup[] = results
    ? SEARCH_MODULE_CONFIG.filter((cfg) => {
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

  // Build filtered navigation items
  const filteredNavItems = useMemo(() => {
    if (!query.trim()) return NAV_ITEMS
    const q = query.toLowerCase()
    return NAV_ITEMS.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
    )
  }, [query])

  // Build recent modules list
  const recentModules = useMemo(() => {
    const recents = getRecentModules()
    return recents
      .filter((r) => NAV_ITEMS.some((n) => n.id === r.moduleId))
      .slice(0, 5)
  }, [open])

  // Build filtered actions
  const themeAction = useMemo((): QuickAction => {
    const isDark = resolvedTheme === 'dark'
    return {
      id: 'toggle-theme',
      label: isDark ? 'Светлая тема' : 'Тёмная тема',
      icon: isDark ? Sun : Moon,
      module: 'settings',
      action: 'theme-toggle',
      description: isDark ? 'Переключить на светлую тему' : 'Переключить на тёмную тему',
    }
  }, [resolvedTheme])

  const allActions = useMemo(() => [...QUICK_ACTIONS, themeAction], [themeAction])

  const filteredActions = useMemo(() => {
    if (!query.trim()) return allActions
    const q = query.toLowerCase()
    return allActions.filter(
      (action) =>
        action.label.toLowerCase().includes(q) ||
        (action.description && action.description.toLowerCase().includes(q))
    )
  }, [query, allActions])

  // Build flat list of items for keyboard navigation based on mode
  const flatItems = useMemo(() => {
    const items: Array<{ module?: AppModule; action?: QuickAction; navItem?: NavItem; index: number }> = []

    if (mode === 'search') {
      // Recent searches (when no query)
      if (!query.trim() && recentSearches.length > 0) {
        for (const rs of recentSearches) {
          items.push({ index: items.length, _recentSearch: rs })
        }
      }
      // Search results
      for (const group of groupedResults) {
        for (const _item of group.items) {
          items.push({ module: group.module, index: items.length })
        }
      }
    } else if (mode === 'navigate') {
      // Recent modules
      if (!query.trim() && recentModules.length > 0) {
        for (const _rm of recentModules) {
          items.push({ index: items.length, _recentModule: true })
        }
      }
      // All nav items
      for (const _ni of filteredNavItems) {
        items.push({ index: items.length, _navItem: true })
      }
    } else if (mode === 'actions') {
      for (const _fa of filteredActions) {
        items.push({ index: items.length, _action: true })
      }
    }

    return items
  }, [mode, groupedResults, recentSearches, recentModules, filteredNavItems, filteredActions, query])

  // Reset selected index when list changes
  useEffect(() => {
    setSelectedIndex(-1)
  }, [mode, results, totalResults, query])

  const handleNavigate = useCallback((direction: 'up' | 'down') => {
    setSelectedIndex((prev) => {
      if (flatItems.length === 0) return -1
      if (prev === -1) return direction === 'down' ? 0 : flatItems.length - 1
      const next = direction === 'down' ? prev + 1 : prev - 1
      if (next < 0) return flatItems.length - 1
      if (next >= flatItems.length) return 0
      return next
    })
  }, [flatItems.length])

  const handleCycleMode = useCallback((direction: 1 | -1) => {
    const modes: PaletteMode[] = ['search', 'navigate', 'actions']
    const currentIdx = modes.indexOf(mode)
    const nextIdx = (currentIdx + direction + modes.length) % modes.length
    setMode(modes[nextIdx])
    setQuery('')
    setResults(null)
  }, [mode])

  const handleSelectCurrent = useCallback(() => {
    if (selectedIndex < 0 || selectedIndex >= flatItems.length) return

    if (mode === 'search') {
      // Check if clicking a recent search
      const recentCount = (!query.trim() && recentSearches.length > 0) ? recentSearches.length : 0
      if (selectedIndex < recentCount) {
        const rs = recentSearches[selectedIndex]
        if (rs) {
          setQuery(rs)
          performSearch(rs)
        }
        return
      }
      // Click a search result
      const adjustedIdx = selectedIndex - recentCount
      let counter = 0
      for (const group of groupedResults) {
        if (adjustedIdx < counter + group.items.length) {
          setActiveModule(group.module)
          setOpen(false)
          return
        }
        counter += group.items.length
      }
    } else if (mode === 'navigate') {
      // Check if clicking a recent module
      const recentCount = (!query.trim() && recentModules.length > 0) ? recentModules.length : 0
      if (selectedIndex < recentCount) {
        const rm = recentModules[selectedIndex]
        if (rm) {
          setActiveModule(rm.moduleId)
          saveRecentModule(rm.moduleId)
          setOpen(false)
        }
        return
      }
      // Click a nav item
      const adjustedIdx = selectedIndex - recentCount
      const navItem = filteredNavItems[adjustedIdx]
      if (navItem) {
        setActiveModule(navItem.id)
        saveRecentModule(navItem.id)
        setOpen(false)
      }
    } else if (mode === 'actions') {
      const action = filteredActions[selectedIndex]
      if (action) {
        if (action.action === 'theme-toggle') {
          setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
          setOpen(false)
        } else {
          setActiveModule(action.module)
          setOpen(false)
        }
      }
    }
  }, [selectedIndex, flatItems.length, mode, recentSearches, groupedResults, recentModules, filteredNavItems, filteredActions, setActiveModule, setTheme, resolvedTheme, performSearch, query])

  // Handle global keyboard events
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        handleNavigate('down')
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        handleNavigate('up')
      } else if (e.key === 'Enter') {
        e.preventDefault()
        handleSelectCurrent()
      } else if (e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault()
        handleCycleMode(1)
      } else if (e.key === '1') {
        setMode('search')
        setQuery('')
        setResults(null)
      } else if (e.key === '2') {
        setMode('navigate')
        setQuery('')
        setResults(null)
      } else if (e.key === '3') {
        setMode('actions')
        setQuery('')
        setResults(null)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, handleNavigate, handleSelectCurrent, handleCycleMode])

  const getPlaceholder = (): string => {
    switch (mode) {
      case 'search':
        return 'Поиск по дневнику, финансам, тренировкам...'
      case 'navigate':
        return 'Перейти к модулю...'
      case 'actions':
        return 'Быстрое действие...'
      default:
        return ''
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-lg p-0 gap-0 overflow-hidden top-[15%]"
      >
        <DialogTitle className="sr-only">
          {mode === 'search' ? 'Поиск' : mode === 'navigate' ? 'Навигация' : 'Действия'}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Палитра команд UniLife
        </DialogDescription>

        {/* Gradient header area */}
        <div className="relative bg-gradient-to-r from-emerald-500/10 via-primary/5 to-amber-500/10 dark:from-emerald-500/5 dark:via-primary/3 dark:to-amber-500/5">
          {/* Mode tabs */}
          <div className="flex items-center gap-1 px-3 pt-3 pb-1">
            {MODE_TABS.map((tab, idx) => {
              const TabIcon = tab.icon
              const isActive = mode === tab.mode
              return (
                <button
                  key={tab.mode}
                  onClick={() => {
                    setMode(tab.mode)
                    setQuery('')
                    setResults(null)
                    setSelectedIndex(-1)
                  }}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                  )}
                >
                  <TabIcon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                  {!isActive && (
                    <kbd className="ml-1 h-4 min-w-4 inline-flex items-center justify-center rounded text-[9px] font-mono text-muted-foreground/60 bg-muted/60 px-0.5">
                      {idx + 1}
                    </kbd>
                  )}
                </button>
              )
            })}
          </div>

          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-2.5">
            {mode === 'search' && <Search className="h-4.5 w-4.5 shrink-0 text-muted-foreground" />}
            {mode === 'navigate' && <Compass className="h-4.5 w-4.5 shrink-0 text-muted-foreground" />}
            {mode === 'actions' && <Zap className="h-4.5 w-4.5 shrink-0 text-muted-foreground" />}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={getPlaceholder()}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleSelectCurrent()
                } else if (e.key === 'ArrowDown') {
                  e.preventDefault()
                  handleNavigate('down')
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault()
                  handleNavigate('up')
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
            <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-background/80 px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <CornerDownLeft className="h-3 w-3" />
            </kbd>
          </div>
        </div>

        {/* Content area */}
        <div className="max-h-[70vh] overflow-hidden">
          {/* ── SEARCH MODE ── */}
          {mode === 'search' && (
            <>
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
                <ScrollArea className="h-[50vh]">
                  <div className="py-2">
                    {groupedResults.map((group) => (
                      <div key={group.key} className="mb-1">
                        <div className="flex items-center gap-2 px-4 py-1.5">
                          <group.icon className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            {group.label}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {group.items.length}
                          </span>
                        </div>
                        {group.items.map((item) => {
                          const Icon = group.icon
                          // Calculate index for keyboard highlight
                          const recentCount = 0 // no recents when results shown
                          const itemIndex = (() => {
                            let idx = recentCount
                            for (const g of groupedResults) {
                              for (const i of g.items) {
                                if (i.id === item.id && g.key === group.key) return idx
                                idx++
                              }
                            }
                            return -1
                          })()
                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                setActiveModule(group.module)
                                setOpen(false)
                              }}
                              className={cn(
                                'flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors',
                                selectedIndex === itemIndex
                                  ? 'bg-accent text-accent-foreground'
                                  : 'hover:bg-accent/50'
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
                <ScrollArea className="h-[50vh]">
                  <div className="py-2">
                    {/* Recent searches */}
                    {recentSearches.length > 0 && (
                      <div className="mb-1">
                        <div className="flex items-center justify-between px-4 py-1.5">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Недавние
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              clearRecentSearches()
                              setRecentSearches([])
                            }}
                            className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
                          >
                            <Trash2 className="h-3 w-3" />
                            Очистить
                          </button>
                        </div>
                        {recentSearches.map((rs, idx) => (
                          <button
                            key={rs}
                            onClick={() => {
                              setQuery(rs)
                              performSearch(rs)
                            }}
                            className={cn(
                              'flex w-full items-center gap-3 px-4 py-2 text-left transition-colors',
                              selectedIndex === idx
                                ? 'bg-accent text-accent-foreground'
                                : 'hover:bg-accent/50'
                            )}
                          >
                            <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <span className="text-sm">{rs}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Empty prompt */}
                    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
                        <Search className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium">
                        Введите запрос для поиска
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Минимум 2 символа · Ищется по всем модулям
                      </p>
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
                  </div>
                </ScrollArea>
              )}
            </>
          )}

          {/* ── NAVIGATE MODE ── */}
          {mode === 'navigate' && (
            <ScrollArea className="h-[50vh]">
              <div className="py-2">
                {/* Recent modules */}
                {!query.trim() && recentModules.length > 0 && (
                  <div className="mb-2">
                    <div className="flex items-center gap-2 px-4 py-1.5">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Недавние
                      </span>
                    </div>
                    {recentModules.map((rm, idx) => {
                      const navItem = NAV_ITEMS.find((n) => n.id === rm.moduleId)
                      if (!navItem) return null
                      const Icon = navItem.icon
                      return (
                        <button
                          key={`recent-${rm.moduleId}`}
                          onClick={() => {
                            setActiveModule(rm.moduleId)
                            saveRecentModule(rm.moduleId)
                            setOpen(false)
                          }}
                          className={cn(
                            'flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors',
                            selectedIndex === idx
                              ? 'bg-accent text-accent-foreground'
                              : 'hover:bg-accent/50'
                          )}
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 mt-0.5">
                            <Icon className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{navItem.label}</p>
                            <p className="text-xs text-muted-foreground">{navItem.description}</p>
                          </div>
                          <Badge variant="outline" className="shrink-0 text-[10px] h-5 mt-0.5 text-muted-foreground">
                            ↻
                          </Badge>
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* All modules */}
                <div>
                  {!query.trim() && recentModules.length > 0 && (
                    <div className="flex items-center gap-2 px-4 py-1.5">
                      <Compass className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Все модули
                      </span>
                    </div>
                  )}
                  {filteredNavItems.map((navItem) => {
                    const Icon = navItem.icon
                    // Calculate index
                    const recentCount = (!query.trim() && recentModules.length > 0) ? recentModules.length : 0
                    const globalIdx = (() => {
                      if (!query.trim() && recentModules.length > 0) {
                        return recentCount + filteredNavItems.indexOf(navItem)
                      }
                      return filteredNavItems.indexOf(navItem)
                    })()
                    // Check if this is already in recent (for dedup indicator)
                    const isRecent = recentModules.some((r) => r.moduleId === navItem.id)
                    return (
                      <button
                        key={navItem.id}
                        onClick={() => {
                          setActiveModule(navItem.id)
                          saveRecentModule(navItem.id)
                          setOpen(false)
                        }}
                        className={cn(
                          'flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors',
                          selectedIndex === globalIdx
                            ? 'bg-accent text-accent-foreground'
                            : 'hover:bg-accent/50'
                        )}
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted mt-0.5">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{navItem.label}</p>
                          <p className="text-xs text-muted-foreground">{navItem.description}</p>
                        </div>
                        {isRecent && (
                          <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                        )}
                      </button>
                    )
                  })}

                  {filteredNavItems.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
                        <Compass className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium">Модуль не найден</p>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          )}

          {/* ── ACTIONS MODE ── */}
          {mode === 'actions' && (
            <ScrollArea className="h-[50vh]">
              <div className="py-2">
                {filteredActions.map((action, idx) => {
                  const Icon = action.icon
                  return (
                    <button
                      key={action.id}
                      onClick={() => {
                        if (action.action === 'theme-toggle') {
                          setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
                          setOpen(false)
                        } else {
                          setActiveModule(action.module)
                          setOpen(false)
                        }
                      }}
                      className={cn(
                        'flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors',
                        selectedIndex === idx
                          ? 'bg-accent text-accent-foreground'
                          : 'hover:bg-accent/50'
                      )}
                    >
                      <div className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-md mt-0.5',
                        action.action === 'theme-toggle'
                          ? 'bg-amber-500/10'
                          : 'bg-primary/10'
                      )}>
                        <Icon className={cn(
                          'h-4 w-4',
                          action.action === 'theme-toggle' ? 'text-amber-500' : 'text-primary'
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{action.label}</p>
                        {action.description && (
                          <p className="text-xs text-muted-foreground">{action.description}</p>
                        )}
                      </div>
                      {action.action === 'theme-toggle' ? (
                        <Badge variant="outline" className="shrink-0 text-[10px] h-5 mt-0.5">
                          ⌘
                        </Badge>
                      ) : (
                        <Plus className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                      )}
                    </button>
                  )
                })}

                {filteredActions.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
                      <Zap className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium">Действие не найдено</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Footer hints */}
        <div className="border-t px-4 py-2 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>
            <kbd className="font-mono rounded border bg-muted px-1 py-0.5 text-[10px]">
              Tab
            </kbd>{' '}
            сменить режим
          </span>
          <span>
            <kbd className="font-mono rounded border bg-muted px-1 py-0.5 text-[10px]">
              ↑↓
            </kbd>{' '}
            навигация ·{' '}
            <kbd className="font-mono rounded border bg-muted px-1 py-0.5 text-[10px]">
              ↵
            </kbd>{' '}
            выбрать
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
