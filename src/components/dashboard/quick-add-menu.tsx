'use client'

import { useState, useCallback } from 'react'
import { useAppStore } from '@/store/use-app-store'
import type { AppModule } from '@/store/use-app-store'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Plus,
  BookOpen,
  TrendingDown,
  Utensils,
  Dumbbell,
  Sparkles,
  Crosshair,
  Library,
  Clock,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

// ─── Types ─────────────────────────────────────────────────────────────────

interface QuickAddItem {
  label: string
  icon: React.ReactNode
  module: AppModule
  iconBg: string
  hoverBg: string
  shortcut: string
}

interface MenuSection {
  label: string
  items: QuickAddItem[]
}

// ─── Menu sections ─────────────────────────────────────────────────────────

const MENU_SECTIONS: MenuSection[] = [
  {
    label: 'Записи',
    items: [
      {
        label: 'Новая запись в дневник',
        icon: <BookOpen className="h-4 w-4" />,
        module: 'diary',
        iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400',
        hoverBg: 'hover:bg-emerald-50 dark:hover:bg-emerald-950/30',
        shortcut: 'J',
      },
      {
        label: 'Добавить расход',
        icon: <TrendingDown className="h-4 w-4" />,
        module: 'finance',
        iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400',
        hoverBg: 'hover:bg-amber-50 dark:hover:bg-amber-950/30',
        shortcut: 'F',
      },
      {
        label: 'Записать приём пищи',
        icon: <Utensils className="h-4 w-4" />,
        module: 'nutrition',
        iconBg: 'bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400',
        hoverBg: 'hover:bg-orange-50 dark:hover:bg-orange-950/30',
        shortcut: 'N',
      },
      {
        label: 'Добавить тренировку',
        icon: <Dumbbell className="h-4 w-4" />,
        module: 'workout',
        iconBg: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400',
        hoverBg: 'hover:bg-blue-50 dark:hover:bg-blue-950/30',
        shortcut: 'W',
      },
    ],
  },
  {
    label: 'Цели',
    items: [
      {
        label: 'Новая привычка',
        icon: <Sparkles className="h-4 w-4" />,
        module: 'habits',
        iconBg: 'bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-400',
        hoverBg: 'hover:bg-violet-50 dark:hover:bg-violet-950/30',
        shortcut: 'H',
      },
      {
        label: 'Новая цель',
        icon: <Crosshair className="h-4 w-4" />,
        module: 'goals',
        iconBg: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400',
        hoverBg: 'hover:bg-blue-50 dark:hover:bg-blue-950/30',
        shortcut: 'G',
      },
      {
        label: 'Новый элемент коллекции',
        icon: <Library className="h-4 w-4" />,
        module: 'collections',
        iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400',
        hoverBg: 'hover:bg-emerald-50 dark:hover:bg-emerald-950/30',
        shortcut: 'C',
      },
    ],
  },
]

// ─── Flat lookup for all items by module ───────────────────────────────────

const ITEM_BY_MODULE: Record<string, QuickAddItem> = {}
MENU_SECTIONS.forEach((section) => {
  section.items.forEach((item) => {
    ITEM_BY_MODULE[item.module] = item
  })
})

// ─── Recently added tracking (localStorage) ───────────────────────────────

const RECENT_STORAGE_KEY = 'unilife-recent-adds'
const MAX_RECENT = 3

interface RecentItem {
  module: AppModule
  label: string
  timestamp: number
}

function readRecentAdds(): RecentItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(RECENT_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeRecentItem(module: AppModule, label: string) {
  try {
    const items = readRecentAdds()
    const filtered = items.filter((r) => r.module !== module)
    filtered.unshift({ module, label, timestamp: Date.now() })
    localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(filtered.slice(0, MAX_RECENT)))
  } catch {
    // localStorage may be unavailable
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function QuickAddMenu() {
  const [open, setOpen] = useState(false)
  const [recentItems, setRecentItems] = useState<RecentItem[]>(() => readRecentAdds())
  const setActiveModule = useAppStore((s) => s.setActiveModule)
  const setPendingDialog = useAppStore((s) => s.setPendingDialog)

  const handleSelect = useCallback(
    (item: QuickAddItem) => {
      // Persist to recently added
      writeRecentItem(item.module, item.label)
      setRecentItems(readRecentAdds())

      setOpen(false)
      setActiveModule(item.module)
      // Signal to module to open its dialog after navigation
      setTimeout(() => {
        setPendingDialog(true)
      }, 100)
    },
    [setActiveModule, setPendingDialog],
  )

  // Pre-compute flat item index for stagger delay
  const allItems = MENU_SECTIONS.flatMap((s) => s.items)

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              'group flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/30 active:scale-95 dark:from-emerald-600 dark:to-teal-700',
              open && 'scale-110 shadow-xl shadow-emerald-500/40',
            )}
            aria-label="Быстрое добавление"
          >
            <Plus
              className={cn(
                'h-6 w-6 transition-transform duration-300',
                open && 'rotate-45',
              )}
            />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          sideOffset={12}
          className="w-64 rounded-xl border bg-background/95 backdrop-blur-md p-2 shadow-xl"
        >
          {/* Header */}
          <div className="mb-1.5 px-2 py-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Быстрое добавление
            </p>
          </div>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent mb-2" />

          {/* Recently added section */}
          {recentItems.length > 0 && (
            <div className="mb-1">
              <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                Недавно добавленные
              </p>
              {recentItems.map((recent, idx) => {
                const def = ITEM_BY_MODULE[recent.module]
                if (!def) return null
                return (
                  <motion.div
                    key={`recent-${recent.module}`}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15, delay: idx * 0.04 }}
                  >
                    <DropdownMenuItem
                      onClick={() => handleSelect(def)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-2.5 py-2 cursor-pointer transition-colors duration-150',
                        def.hoverBg,
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                          def.iconBg,
                        )}
                      >
                        {def.icon}
                      </div>
                      <span className="text-sm font-medium flex-1">{recent.label}</span>
                    </DropdownMenuItem>
                  </motion.div>
                )
              })}
              <div className="h-px w-full bg-gradient-to-r from-transparent via-border/50 to-transparent my-2" />
            </div>
          )}

          {/* Main menu sections with staggered animation */}
          {MENU_SECTIONS.map((section, sectionIdx) => {
            // Find starting index for this section's items in the flat list
            const startIdx = allItems.findIndex((i) => i.module === section.items[0].module)

            return (
              <div key={section.label}>
                {/* Section label */}
                <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                  {section.label}
                </p>

                {/* Section items */}
                {section.items.map((item, itemIdx) => (
                  <motion.div
                    key={item.module}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.15,
                      delay: (startIdx + itemIdx) * 0.05 + (recentItems.length > 0 ? recentItems.length * 0.04 + 0.1 : 0),
                    }}
                  >
                    <DropdownMenuItem
                      onClick={() => handleSelect(item)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-2.5 py-2.5 cursor-pointer transition-colors duration-150',
                        item.hoverBg,
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                          item.iconBg,
                        )}
                      >
                        {item.icon}
                      </div>
                      <span className="text-sm font-medium flex-1">{item.label}</span>
                      {/* Keyboard shortcut hint — desktop only */}
                      <kbd className="hidden md:inline-flex h-5 min-w-5 items-center justify-center rounded border bg-muted px-1.5 text-[10px] font-mono text-muted-foreground">
                        {item.shortcut}
                      </kbd>
                    </DropdownMenuItem>
                  </motion.div>
                ))}

                {/* Divider between sections */}
                {sectionIdx < MENU_SECTIONS.length - 1 && (
                  <div className="h-px w-full bg-gradient-to-r from-transparent via-border/50 to-transparent my-2" />
                )}
              </div>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
