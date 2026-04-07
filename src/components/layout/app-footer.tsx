'use client'

import { memo } from 'react'
import { useAppStore } from '@/store/use-app-store'
import { useModuleCounts } from '@/lib/module-counts'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import {
  Plus,
  Dumbbell,
  Receipt,
  Sparkles,
  BookOpen,
  Activity,
  Target,
  Utensils,
  Library,
  Flag,
  BarChart3,
  Settings,
  type LucideIcon,
} from 'lucide-react'

// ─── Footer constants ─────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { label: 'Добавить запись', module: 'diary' as const, icon: Plus, color: 'text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20' },
  { label: 'Новая тренировка', module: 'workout' as const, icon: Dumbbell, color: 'text-sky-500 bg-sky-500/10 hover:bg-sky-500/20' },
  { label: 'Записать расход', module: 'finance' as const, icon: Receipt, color: 'text-amber-500 bg-amber-500/10 hover:bg-amber-500/20' },
  { label: 'Новая привычка', module: 'habits' as const, icon: Sparkles, color: 'text-violet-500 bg-violet-500/10 hover:bg-violet-500/20' },
]

const FOOTER_LINKS = [
  { label: 'Дневник', module: 'diary' as const, icon: BookOpen },
  { label: 'Финансы', module: 'finance' as const, icon: Receipt },
  { label: 'Питание', module: 'nutrition' as const, icon: Utensils },
  { label: 'Тренировки', module: 'workout' as const, icon: Dumbbell },
  { label: 'Привычки', module: 'habits' as const, icon: Target },
  { label: 'Коллекции', module: 'collections' as const, icon: Library },
  { label: 'Цели', module: 'goals' as const, icon: Flag },
  { label: 'Аналитика', module: 'analytics' as const, icon: BarChart3 },
]

const MODULE_SHORTCUTS: { module: 'diary' | 'finance' | 'nutrition' | 'workout' | 'habits' | 'collections'; icon: LucideIcon; gradient: string }[] = [
  { module: 'diary', icon: BookOpen, gradient: 'bg-gradient-to-br from-emerald-400 to-teal-500' },
  { module: 'finance', icon: Receipt, gradient: 'bg-gradient-to-br from-amber-400 to-orange-500' },
  { module: 'nutrition', icon: Utensils, gradient: 'bg-gradient-to-br from-orange-400 to-red-500' },
  { module: 'workout', icon: Dumbbell, gradient: 'bg-gradient-to-br from-sky-400 to-cyan-500' },
  { module: 'habits', icon: Target, gradient: 'bg-gradient-to-br from-violet-400 to-purple-500' },
  { module: 'collections', icon: Library, gradient: 'bg-gradient-to-br from-cyan-400 to-teal-500' },
]

const KEYBOARD_SHORTCUTS = [
  { keys: ['⌘', 'K'], description: 'Поиск' },
  { keys: ['⌘', '1–5'], description: 'Навигация' },
  { keys: ['⌘', 'D'], description: 'Новая запись' },
]

const STATS_ITEMS = [
  { key: 'diary' as const, label: 'записей', icon: BookOpen, iconColor: 'text-emerald-500' },
  { key: 'workout' as const, label: 'тренировок', icon: Activity, iconColor: 'text-sky-500' },
  { key: 'habits' as const, label: 'привычек', icon: Target, iconColor: 'text-violet-500' },
  { key: 'finance' as const, label: 'транзакций', icon: Receipt, iconColor: 'text-amber-500' },
]

// ─── Footer component ─────────────────────────────────────────────────
const Footer = memo(function Footer() {
  const setActiveModule = useAppStore((s) => s.setActiveModule)
  const counts = useModuleCounts()
  const isLoading = Object.keys(counts).length === 0

  return (
    <footer className="mt-auto border-t bg-muted/30 pb-20 md:pb-0">
      {/* Gradient accent bar — multi-color */}
      <div className="h-px w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />

      <div className="hidden md:grid md:grid-cols-12 divide-x divide-border">
        {/* Brand column */}
        <div className="col-span-3 px-6 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-primary-foreground shadow-sm shadow-emerald-500/20">
              <span className="text-sm font-bold">U</span>
            </div>
            <div>
              <span className="font-bold text-sm">UniLife</span>
              <p className="text-[10px] text-muted-foreground font-medium -mt-0.5">Отслеживайте жизнь</p>
            </div>
          </div>
          <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed">
            Вся жизнь в одном месте. Дневник, финансы, питание и тренировки.
          </p>

          {/* Module navigation shortcuts */}
          <div className="mt-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Быстрые ссылки
            </p>
            <div className="flex flex-wrap gap-1.5">
              {MODULE_SHORTCUTS.map((shortcut) => {
                const Icon = shortcut.icon
                return (
                  <button
                    key={shortcut.module}
                    onClick={() => setActiveModule(shortcut.module)}
                    className={`active-press flex h-8 w-8 items-center justify-center rounded-lg text-white shadow-sm transition-transform duration-200 hover:scale-110 ${shortcut.gradient}`}
                    title={FOOTER_LINKS.find(l => l.module === shortcut.module)?.label}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Quick actions column */}
        <div className="col-span-3 px-6 py-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
            Быстрые действия
          </h3>
          <ul className="space-y-1.5">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon
              return (
                <li key={action.label}>
                  <button
                    onClick={() => setActiveModule(action.module)}
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-all duration-200 group cursor-pointer w-full"
                  >
                    <Icon className={cn('h-3.5 w-3.5 shrink-0 rounded transition-colors', action.color)} />
                    <span className="group-hover:translate-x-1 transition-transform duration-200">{action.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Modules column */}
        <div className="col-span-2 px-6 py-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
            Модули
          </h3>
          <ul className="space-y-1.5">
            {FOOTER_LINKS.map((link) => {
              const Icon = link.icon
              return (
                <li key={link.label}>
                  <button
                    onClick={() => setActiveModule(link.module)}
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer hover:translate-x-1 w-full"
                  >
                    <Icon className="h-3 w-3 text-muted-foreground/60" />
                    {link.label}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Keyboard shortcuts column */}
        <div className="col-span-2 px-6 py-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
            Горячие клавиши
          </h3>
          <ul className="space-y-2">
            {KEYBOARD_SHORTCUTS.map((shortcut) => (
              <li key={shortcut.description} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-0.5">
                  {shortcut.keys.map((key, i) => (
                    <kbd
                      key={`${key}-${i}`}
                      className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-muted px-1 font-mono text-[10px] font-medium leading-none text-foreground/80"
                    >
                      {key}
                    </kbd>
                  ))}
                </span>
                <span>{shortcut.description}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Stats column */}
        <div className="col-span-2 px-6 py-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
            Статистика
          </h3>
          {isLoading ? (
            <ul className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Skeleton className="h-3 w-3 rounded-sm shrink-0" />
                  <Skeleton className="h-3 w-24" />
                </li>
              ))}
            </ul>
          ) : (
            <ul className="space-y-1.5">
              {STATS_ITEMS.map((stat) => {
                const Icon = stat.icon
                return (
                  <li key={stat.key} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Icon className={cn('h-3 w-3 shrink-0', stat.iconColor)} />
                    <span className="tabular-nums">{counts[stat.key] ?? 0} {stat.label}</span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Mobile footer - compact */}
      <div className="md:hidden border-t px-4 py-3">
        {/* Quick module shortcuts */}
        <div className="flex items-center justify-center gap-2 mb-2.5">
          {MODULE_SHORTCUTS.slice(0, 6).map((shortcut) => {
            const Icon = shortcut.icon
            return (
              <button
                key={shortcut.module}
                onClick={() => setActiveModule(shortcut.module)}
                className={`active-press flex h-7 w-7 items-center justify-center rounded-lg text-white shadow-sm transition-transform duration-200 hover:scale-110 ${shortcut.gradient}`}
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            )
          })}
        </div>
        {/* Keyboard shortcut hint — mobile compact badge */}
        <div className="flex items-center justify-center mb-2">
          <button className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-[10px] text-muted-foreground">
            <kbd className="inline-flex h-4 min-w-4 items-center justify-center rounded border border-border bg-background px-0.5 font-mono text-[9px] font-medium text-foreground/70">⌘</kbd>
            <kbd className="inline-flex h-4 min-w-4 items-center justify-center rounded border border-border bg-background px-0.5 font-mono text-[9px] font-medium text-foreground/70">K</kbd>
            <span className="ml-0.5">Поиск</span>
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-emerald-500 to-teal-500 text-primary-foreground">
              <span className="text-[8px] font-bold leading-none">U</span>
            </div>
            <span className="text-xs font-bold">UniLife</span>
          </div>
          <div className="flex items-center gap-3">
            {STATS_ITEMS.slice(0, 3).map((stat) => {
              const Icon = stat.icon
              return (
                <span key={stat.key} className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Icon className={cn('h-3 w-3', stat.iconColor)} />
                  <span className="tabular-nums font-medium">{counts[stat.key] ?? 0}</span>
                </span>
              )
            })}
          </div>
          <p className="text-[10px] text-muted-foreground/50">© 2026</p>
        </div>
      </div>

      {/* Desktop footer - full */}
      <div className="hidden md:flex border-t px-6 py-2.5 items-center justify-center gap-2">
        <div className="flex h-4 w-4 items-center justify-center rounded bg-gradient-to-br from-emerald-500 to-teal-500 text-primary-foreground">
          <span className="text-[9px] font-bold leading-none">U</span>
        </div>
        <p className="text-[11px] text-muted-foreground/70">
          © 2026 UniLife · Все права защищены
        </p>
      </div>
    </footer>
  )
})

export { Footer }
export default Footer
