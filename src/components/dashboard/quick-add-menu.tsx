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
  Wallet,
  UtensilsCrossed,
  Dumbbell,
  Target,
} from 'lucide-react'

// ─── Types ─────────────────────────────────────────────────────────────────

interface QuickAddItem {
  id: string
  label: string
  icon: React.ReactNode
  module: AppModule
  iconBg: string
  iconColor: string
  ringColor: string
}

// ─── Menu items (5 items) ──────────────────────────────────────────────────

const MENU_ITEMS: QuickAddItem[] = [
  {
    id: 'diary',
    label: 'Запись в дневник',
    icon: <BookOpen className="h-5 w-5" />,
    module: 'diary',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/50',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    ringColor: 'ring-emerald-500/30 hover:ring-emerald-500/50',
  },
  {
    id: 'finance',
    label: 'Транзакция',
    icon: <Wallet className="h-5 w-5" />,
    module: 'finance',
    iconBg: 'bg-amber-100 dark:bg-amber-900/50',
    iconColor: 'text-amber-600 dark:text-amber-400',
    ringColor: 'ring-amber-500/30 hover:ring-amber-500/50',
  },
  {
    id: 'nutrition',
    label: 'Приём пищи',
    icon: <UtensilsCrossed className="h-5 w-5" />,
    module: 'nutrition',
    iconBg: 'bg-orange-100 dark:bg-orange-900/50',
    iconColor: 'text-orange-600 dark:text-orange-400',
    ringColor: 'ring-orange-500/30 hover:ring-orange-500/50',
  },
  {
    id: 'workout',
    label: 'Тренировка',
    icon: <Dumbbell className="h-5 w-5" />,
    module: 'workout',
    iconBg: 'bg-blue-100 dark:bg-blue-900/50',
    iconColor: 'text-blue-600 dark:text-blue-400',
    ringColor: 'ring-blue-500/30 hover:ring-blue-500/50',
  },
  {
    id: 'habits',
    label: 'Привычка',
    icon: <Target className="h-5 w-5" />,
    module: 'habits',
    iconBg: 'bg-violet-100 dark:bg-violet-900/50',
    iconColor: 'text-violet-600 dark:text-violet-400',
    ringColor: 'ring-violet-500/30 hover:ring-violet-500/50',
  },
]

// ─── Animation variants ───────────────────────────────────────────────────

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

const menuItemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.5, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      delay: 0.05 + i * 0.06,
      type: 'spring',
      stiffness: 450,
      damping: 25,
    },
  }),
  exit: (i: number) => ({
    opacity: 0,
    scale: 0.5,
    y: 10,
    transition: {
      delay: i * 0.03,
      duration: 0.15,
    },
  }),
}

const tooltipVariants: Variants = {
  hidden: { opacity: 0, x: 4, scale: 0.9 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { delay: 0.2, duration: 0.15 },
  },
  exit: {
    opacity: 0,
    x: 4,
    scale: 0.9,
    transition: { duration: 0.1 },
  },
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function QuickAddMenu() {
  const [open, setOpen] = useState(false)
  const activeModule = useAppStore((s) => s.activeModule)
  const setActiveModule = useAppStore((s) => s.setActiveModule)
  const setPendingDialog = useAppStore((s) => s.setPendingDialog)

  // Keyboard: Escape to close
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open])

  const handleSelect = useCallback(
    (item: QuickAddItem) => {
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

  return (
    <div className="fixed bottom-24 right-6 z-50 md:bottom-6 md:right-6 hidden md:flex items-end justify-end">
      {/* ─── Backdrop Overlay ──────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[-1]"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* ─── Vertical Menu Items ───────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="quick-add-items"
            className="absolute bottom-[calc(100%+12px)] right-0 flex flex-col items-end gap-2.5"
          >
            {MENU_ITEMS.map((item, idx) => (
              <motion.div
                key={item.id}
                custom={idx}
                variants={menuItemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="relative flex items-center gap-2"
              >
                {/* Tooltip label — to the left */}
                <AnimatePresence>
                  {open && (
                    <motion.span
                      variants={tooltipVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className={cn(
                        'whitespace-nowrap rounded-lg px-2.5 py-1.5',
                        'text-xs font-medium shadow-lg',
                        'bg-popover text-popover-foreground border',
                        'pointer-events-none select-none',
                      )}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Circle button */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleSelect(item)}
                  aria-label={item.label}
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-full',
                    'ring-2 transition-all duration-200 cursor-pointer',
                    'shadow-md hover:shadow-lg',
                    item.iconBg,
                    item.iconColor,
                    item.ringColor,
                    'card-hover',
                  )}
                >
                  {item.icon}
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── FAB Button ────────────────────────────────────── */}
      <motion.button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        className={cn(
          'group relative flex h-14 w-14 items-center justify-center rounded-full outline-none',
          'bg-gradient-to-br from-emerald-500 to-teal-500 text-white',
          'shadow-lg shadow-emerald-500/25',
          'transition-shadow duration-300',
          'hover:shadow-xl hover:shadow-emerald-500/35',
          'dark:from-emerald-600 dark:to-teal-600',
          'ring-1 ring-white/20',
          open && 'shadow-xl shadow-emerald-500/40 ring-white/30',
        )}
        aria-label="Быстрое добавление"
      >
        {/* Animated Plus → X icon (rotates 45°) */}
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
              animate={{ scale: 1.6, opacity: 0 }}
              exit={{ scale: 1, opacity: 0 }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="absolute inset-0 rounded-full bg-emerald-400"
            />
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  )
}
