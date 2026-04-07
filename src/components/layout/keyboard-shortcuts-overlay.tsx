'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Keyboard,
  Navigation,
  Zap,
  Settings2,
  Monitor,
  Sun,
  Moon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Types ───────────────────────────────────────────────────────────

interface ShortcutItem {
  keys: string[]
  description: string
  subtitle?: string
}

interface ShortcutGroup {
  id: string
  title: string
  icon: React.ElementType
  colorClass: string
  bgColorClass: string
  shortcuts: ShortcutItem[]
}

// ── Shortcuts Data ──────────────────────────────────────────────────

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    id: 'navigation',
    title: 'Навигация',
    icon: Navigation,
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    bgColorClass: 'bg-emerald-100 dark:bg-emerald-500/15',
    shortcuts: [
      { keys: ['D'], description: 'Дашборд', subtitle: 'Главная страница' },
      { keys: ['J'], description: 'Дневник', subtitle: 'Личные записи' },
      { keys: ['F'], description: 'Финансы', subtitle: 'Транзакции и бюджеты' },
      { keys: ['N'], description: 'Питание', subtitle: 'Приёмы пищи и макросы' },
      { keys: ['W'], description: 'Тренировки', subtitle: 'Упражнения и планы' },
      { keys: ['H'], description: 'Привычки', subtitle: 'Трекер привычек' },
      { keys: ['G'], description: 'Цели', subtitle: 'Постановка целей' },
      { keys: ['C'], description: 'Коллекции', subtitle: 'Сохранённые материалы' },
      { keys: ['A'], description: 'Аналитика', subtitle: 'Статистика и графики' },
    ],
  },
  {
    id: 'actions',
    title: 'Действия',
    icon: Zap,
    colorClass: 'text-amber-600 dark:text-amber-400',
    bgColorClass: 'bg-amber-100 dark:bg-amber-500/15',
    shortcuts: [
      { keys: ['N'], description: 'Новая запись', subtitle: 'Создать в текущем модуле' },
      { keys: ['S'], description: 'Поиск', subtitle: 'Быстрый поиск по данным' },
    ],
  },
  {
    id: 'general',
    title: 'Общие',
    icon: Settings2,
    colorClass: 'text-violet-600 dark:text-violet-400',
    bgColorClass: 'bg-violet-100 dark:bg-violet-500/15',
    shortcuts: [
      { keys: ['⌘', 'K'], description: 'Глобальный поиск', subtitle: 'Умный поиск по всему' },
      { keys: ['⌘', ','], description: 'Следующий модуль', subtitle: 'Переключить модуль' },
      { keys: ['Esc'], description: 'Закрыть диалог', subtitle: 'Закрыть любое окно' },
      { keys: ['?'], description: 'Показать справку', subtitle: 'Это окно' },
    ],
  },
]

// ── Key Badge ───────────────────────────────────────────────────────

function KeyBadge({ children, isMeta }: { children: React.ReactNode; isMeta?: boolean }) {
  return (
    <kbd
      className={cn(
        'inline-flex items-center justify-center min-w-[26px] h-7 px-2 rounded-md',
        'border border-border/60 bg-gradient-to-b from-muted to-muted/70',
        'text-[11px] font-mono font-semibold text-foreground shadow-[0_1px_0_1px_hsl(var(--border))]',
        'select-none',
        isMeta && 'px-2.5',
      )}
    >
      {children}
    </kbd>
  )
}

// ── Shortcut Row ────────────────────────────────────────────────────

function ShortcutRow({ shortcut, index }: { shortcut: ShortcutItem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25, ease: 'easeOut' }}
      className="flex items-center justify-between gap-4 py-2 px-3 rounded-lg hover:bg-muted/40 transition-colors group"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground truncate">{shortcut.description}</p>
        {shortcut.subtitle && (
          <p className="text-[11px] text-muted-foreground truncate">{shortcut.subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {shortcut.keys.map((key, i) => {
          const isMeta = key === '⌘' || key === 'Shift' || key === 'Alt'
          return (
            <span key={`${key}-${i}`} className="flex items-center gap-1">
              <KeyBadge isMeta={isMeta}>{key}</KeyBadge>
              {i < shortcut.keys.length - 1 && (
                <span className="text-[10px] text-muted-foreground mx-0.5">+</span>
              )}
            </span>
          )
        })}
      </div>
    </motion.div>
  )
}

// ── Shortcut Group Block ────────────────────────────────────────────

function ShortcutGroupBlock({
  group,
  index,
}: {
  group: ShortcutGroup
  index: number
}) {
  const Icon = group.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 + index * 0.1, duration: 0.35, ease: 'easeOut' }}
    >
      <div className="flex items-center gap-2.5 mb-3">
        <div
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-lg',
            group.bgColorClass,
            group.colorClass,
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {group.title}
        </h3>
        <span className="text-[10px] tabular-nums text-muted-foreground/60 bg-muted/50 rounded-full px-2 py-0.5">
          {group.shortcuts.length}
        </span>
      </div>
      <div className="space-y-0.5">
        {group.shortcuts.map((shortcut, si) => (
          <ShortcutRow key={shortcut.description} shortcut={shortcut} index={si} />
        ))}
      </div>
    </motion.div>
  )
}

// ── Overlay Component ───────────────────────────────────────────────

interface KeyboardShortcutsOverlayProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function KeyboardShortcutsOverlay({
  open,
  onOpenChange,
}: KeyboardShortcutsOverlayProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onOpenChange(false)
      }
    },
    [onOpenChange],
  )

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, handleKeyDown])

  const totalShortcuts = SHORTCUT_GROUPS.reduce(
    (sum, g) => sum + g.shortcuts.length,
    0,
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] p-0 overflow-hidden gap-0 [&>button]:hidden">
        {/* Header with gradient */}
        <div className="relative px-6 pt-6 pb-4">
          <div className="absolute inset-0 bg-gradient-to-b from-muted/60 to-transparent pointer-events-none" />
          <DialogHeader className="relative">
            <DialogTitle className="flex items-center gap-3 text-lg">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md shadow-violet-500/20">
                <Keyboard className="h-4.5 w-4.5" />
              </div>
              <div>
                <span className="font-semibold">Горячие клавиши</span>
                <p className="text-xs font-normal text-muted-foreground mt-0.5">
                  Быстрая навигация и управление UniLife
                </p>
              </div>
            </DialogTitle>
            <DialogDescription className="sr-only">
              Список доступных клавиатурных сокращений для навигации и действий в UniLife
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Groups */}
        <div className="px-6 pb-2 max-h-[400px] overflow-y-auto scrollbar-thin">
          <AnimatePresence>
            <div className="space-y-5">
              {SHORTCUT_GROUPS.map((group, i) => (
                <ShortcutGroupBlock key={group.id} group={group} index={i} />
              ))}
            </div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="px-6 py-4 border-t bg-muted/20"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Sun className="h-3 w-3" />
                <span>macOS</span>
              </div>
              <span className="text-muted-foreground/40">|</span>
              <div className="flex items-center gap-1">
                <Monitor className="h-3 w-3" />
                <span>Windows: Ctrl вместо ⌘</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] tabular-nums text-muted-foreground">
                {totalShortcuts} сокращений
              </span>
              <div className="flex items-center gap-1">
                <KeyBadge>Esc</KeyBadge>
                <span className="text-[10px] text-muted-foreground">закрыть</span>
              </div>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
