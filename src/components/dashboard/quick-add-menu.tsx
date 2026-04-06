'use client'

import { useState, useCallback, useEffect } from 'react'
import { useAppStore } from '@/store/use-app-store'
import type { AppModule } from '@/store/use-app-store'
import {
  motion,
  AnimatePresence,
  type Variants,
} from 'framer-motion'
import { cn } from '@/lib/utils'
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
  SmilePlus,
  Rss,
} from 'lucide-react'

// ─── Types ─────────────────────────────────────────────────────────────────

interface QuickAddItem {
  id: string
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
    label: 'Быстрые записи',
    items: [
      {
        id: 'mood',
        label: 'Записать настроение',
        icon: <SmilePlus className="h-4 w-4" />,
        module: 'diary',
        iconBg: 'bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400',
        hoverBg: 'hover:bg-rose-50 dark:hover:bg-rose-950/30',
        shortcut: 'M',
      },
      {
        id: 'diary',
        label: 'Новая запись в дневник',
        icon: <BookOpen className="h-4 w-4" />,
        module: 'diary',
        iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400',
        hoverBg: 'hover:bg-emerald-50 dark:hover:bg-emerald-950/30',
        shortcut: 'J',
      },
      {
        id: 'finance',
        label: 'Добавить расход',
        icon: <TrendingDown className="h-4 w-4" />,
        module: 'finance',
        iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400',
        hoverBg: 'hover:bg-amber-50 dark:hover:bg-amber-950/30',
        shortcut: 'F',
      },
      {
        id: 'nutrition',
        label: 'Записать приём пищи',
        icon: <Utensils className="h-4 w-4" />,
        module: 'nutrition',
        iconBg: 'bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400',
        hoverBg: 'hover:bg-orange-50 dark:hover:bg-orange-950/30',
        shortcut: 'N',
      },
      {
        id: 'workout',
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
    label: 'Развитие',
    items: [
      {
        id: 'habits',
        label: 'Добавить привычку',
        icon: <Sparkles className="h-4 w-4" />,
        module: 'habits',
        iconBg: 'bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-400',
        hoverBg: 'hover:bg-violet-50 dark:hover:bg-violet-950/30',
        shortcut: 'H',
      },
      {
        id: 'goals',
        label: 'Поставить цель',
        icon: <Crosshair className="h-4 w-4" />,
        module: 'goals',
        iconBg: 'bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-400',
        hoverBg: 'hover:bg-sky-50 dark:hover:bg-sky-950/30',
        shortcut: 'G',
      },
      {
        id: 'collections',
        label: 'Новый элемент коллекции',
        icon: <Library className="h-4 w-4" />,
        module: 'collections',
        iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400',
        hoverBg: 'hover:bg-emerald-50 dark:hover:bg-emerald-950/30',
        shortcut: 'C',
      },
      {
        id: 'feed',
        label: 'Новая запись в ленту',
        icon: <Rss className="h-4 w-4" />,
        module: 'feed',
        iconBg: 'bg-pink-100 text-pink-600 dark:bg-pink-900/50 dark:text-pink-400',
        hoverBg: 'hover:bg-pink-50 dark:hover:bg-pink-950/30',
        shortcut: 'L',
      },
    ],
  },
]

// ─── Flat lookup for all items by id ───────────────────────────────────────

const ITEM_BY_ID: Record<string, QuickAddItem> = {}
MENU_SECTIONS.forEach((section) => {
  section.items.forEach((item) => {
    ITEM_BY_ID[item.id] = item
  })
})

// ─── Recently added tracking (localStorage) ───────────────────────────────

const RECENT_STORAGE_KEY = 'unilife-recent-adds'
const MAX_RECENT = 3

interface RecentItem {
  id: string
  label: string
  module: AppModule
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

function writeRecentItem(id: string, module: AppModule, label: string) {
  try {
    const items = readRecentAdds()
    const filtered = items.filter((r) => r.id !== id)
    filtered.unshift({ id, label, module, timestamp: Date.now() })
    localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(filtered.slice(0, MAX_RECENT)))
  } catch {
    // localStorage may be unavailable
  }
}

// ─── Animation variants ───────────────────────────────────────────────────

const menuOverlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

const menuContentVariants: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 28,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.92,
    y: 8,
    transition: {
      duration: 0.15,
    },
  },
}

const menuItemVariants: Variants = {
  hidden: { opacity: 0, x: 8 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: 0.06 + i * 0.035,
      duration: 0.2,
      ease: 'easeOut',
    },
  }),
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function QuickAddMenu() {
  const [open, setOpen] = useState(false)
  const [recentItems, setRecentItems] = useState<RecentItem[]>(() => readRecentAdds())
  const activeModule = useAppStore((s) => s.activeModule)
  const setActiveModule = useAppStore((s) => s.setActiveModule)
  const setPendingDialog = useAppStore((s) => s.setPendingDialog)

  // Keyboard: Escape to close
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open])

  const handleSelect = useCallback(
    (item: QuickAddItem) => {
      // Persist to recently added
      writeRecentItem(item.id, item.module, item.label)
      setRecentItems(readRecentAdds())

      setOpen(false)

      // If already on the target module, just trigger dialog signal
      if (activeModule === item.module) {
        setPendingDialog(true)
        return
      }

      // Navigate to module, then signal dialog after a tick
      setActiveModule(item.module)
      setTimeout(() => {
        setPendingDialog(true)
      }, 150)
    },
    [setActiveModule, setPendingDialog, activeModule],
  )

  // Pre-compute flat item index for stagger delay
  const allItems = MENU_SECTIONS.flatMap((s) => s.items)

  return (
    <div className="fixed bottom-20 right-6 z-50 md:bottom-8 md:right-8">
      {/* ─── FAB Button ─────────────────────────────────────── */}
      <motion.button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        whileTap={{ scale: 0.9 }}
        className={cn(
          'group relative flex h-14 w-14 items-center justify-center rounded-full outline-none',
          'bg-gradient-to-br from-emerald-500 to-teal-600 text-white',
          'shadow-lg shadow-emerald-500/25',
          'transition-shadow duration-300',
          'hover:shadow-xl hover:shadow-emerald-500/30',
          'dark:from-emerald-600 dark:to-teal-700',
          'ring-1 ring-white/20',
          open && 'shadow-xl shadow-emerald-500/40 ring-white/30',
        )}
        aria-label="Быстрое добавление"
      >
        {/* Animated Plus → X icon */}
        <motion.div
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          <Plus className="h-6 w-6" />
        </motion.div>

        {/* Pulse ring when open */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ scale: 1, opacity: 0.4 }}
              animate={{ scale: 1.5, opacity: 0 }}
              exit={{ scale: 1, opacity: 0 }}
              transition={{ duration: 1, repeat: Infinity }}
              className="absolute inset-0 rounded-full bg-emerald-400"
            />
          )}
        </AnimatePresence>
      </motion.button>

      {/* ─── Backdrop Overlay ───────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            variants={menuOverlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[-1]"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* ─── Menu Panel ────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="quick-add-menu-panel"
            variants={menuContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              'absolute bottom-[calc(100%+12px)] right-0 z-10',
              'w-72 rounded-2xl border p-2 shadow-2xl',
              'bg-background/95 backdrop-blur-xl',
              'dark:bg-background/85 dark:backdrop-blur-2xl',
              'ring-1 ring-white/10 dark:ring-white/5',
            )}
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
                  const def = ITEM_BY_ID[recent.id]
                  if (!def) return null
                  return (
                    <motion.button
                      key={`recent-${recent.id}`}
                      type="button"
                      custom={idx}
                      variants={menuItemVariants}
                      initial="hidden"
                      animate="visible"
                      onClick={() => handleSelect(def)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left cursor-pointer',
                        'transition-all duration-150',
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
                    </motion.button>
                  )
                })}
                <div className="h-px w-full bg-gradient-to-r from-transparent via-border/50 to-transparent my-2" />
              </div>
            )}

            {/* Main menu sections */}
            {MENU_SECTIONS.map((section, sectionIdx) => {
              const startIdx = allItems.findIndex((i) => i.id === section.items[0].id)

              return (
                <div key={section.label}>
                  {/* Section label */}
                  <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                    {section.label}
                  </p>

                  {/* Section items */}
                  {section.items.map((item, itemIdx) => {
                    const globalIdx = startIdx + itemIdx + (recentItems.length > 0 ? recentItems.length + 1 : 0)
                    return (
                      <motion.button
                        key={item.id}
                        type="button"
                        custom={globalIdx}
                        variants={menuItemVariants}
                        initial="hidden"
                        animate="visible"
                        onClick={() => handleSelect(item)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left cursor-pointer',
                          'transition-all duration-150',
                          item.hoverBg,
                        )}
                      >
                        <div
                          className={cn(
                            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 hover:scale-110',
                            item.iconBg,
                          )}
                        >
                          {item.icon}
                        </div>
                        <span className="text-sm font-medium flex-1">{item.label}</span>
                        {/* Keyboard shortcut hint — desktop only */}
                        <kbd className="hidden md:inline-flex h-5 min-w-5 items-center justify-center rounded border bg-muted/50 px-1.5 text-[10px] font-mono text-muted-foreground">
                          {item.shortcut}
                        </kbd>
                      </motion.button>
                    )
                  })}

                  {/* Divider between sections */}
                  {sectionIdx < MENU_SECTIONS.length - 1 && (
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-border/50 to-transparent my-2" />
                  )}
                </div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
