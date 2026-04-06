'use client'

import { memo } from 'react'
import { useAppStore } from '@/store/use-app-store'
import { useModuleCounts } from '@/lib/module-counts'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { Plus, Dumbbell, Receipt, Sparkles, BookOpen, Activity, Target } from 'lucide-react'

// ─── Footer constants ─────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { label: 'Добавить запись', module: 'diary' as const, icon: Plus, color: 'text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20' },
  { label: 'Новая тренировка', module: 'workout' as const, icon: Dumbbell, color: 'text-blue-500 bg-blue-500/10 hover:bg-blue-500/20' },
  { label: 'Записать расход', module: 'finance' as const, icon: Receipt, color: 'text-amber-500 bg-amber-500/10 hover:bg-amber-500/20' },
  { label: 'Новая привычка', module: 'habits' as const, icon: Sparkles, color: 'text-violet-500 bg-violet-500/10 hover:bg-violet-500/20' },
]

const FOOTER_LINKS = [
  { label: 'Дневник', module: 'diary' as const },
  { label: 'Финансы', module: 'finance' as const },
  { label: 'Питание', module: 'nutrition' as const },
  { label: 'Тренировки', module: 'workout' as const },
  { label: 'Привычки', module: 'habits' as const },
  { label: 'Коллекции', module: 'collections' as const },
]

const STATS_ITEMS = [
  { key: 'diary' as const, label: 'записей в дневнике', icon: BookOpen, iconColor: 'text-emerald-500' },
  { key: 'workout' as const, label: 'тренировок', icon: Activity, iconColor: 'text-blue-500' },
  { key: 'habits' as const, label: 'привычек', icon: Target, iconColor: 'text-violet-500' },
  { key: 'finance' as const, label: 'транзакций', icon: Receipt, iconColor: 'text-amber-500' },
]

// ─── Footer component ─────────────────────────────────────────────────
const Footer = memo(function Footer() {
  const setActiveModule = useAppStore((s) => s.setActiveModule)
  const counts = useModuleCounts()
  const isLoading = Object.keys(counts).length === 0

  return (
    <footer className="mt-auto border-t bg-muted/30">
      {/* Gradient accent bar */}
      <div className="h-0.5 w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500" />
      <div className="hidden md:grid md:grid-cols-4 divide-x divide-border">
        {/* Brand column */}
        <div className="px-6 py-5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-primary-foreground shadow-sm">
              <span className="text-sm font-bold">U</span>
            </div>
            <div>
              <span className="font-bold text-sm">UniLife</span>
              <p className="text-[10px] text-muted-foreground font-medium -mt-0.5">Отслеживайте жизнь</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
            Вся жизнь в одном месте. Дневник, финансы, питание и тренировки.
          </p>
        </div>

        {/* Quick actions column */}
        <div className="px-6 py-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
            Быстрые действия
          </h3>
          <ul className="space-y-1">
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
        <div className="px-6 py-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
            Модули
          </h3>
          <ul className="space-y-1">
            {FOOTER_LINKS.map((link) => (
              <li key={link.label}>
                <button
                  onClick={() => setActiveModule(link.module)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer hover:translate-x-1 inline-block"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Stats column */}
        <div className="px-6 py-5">
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
      <div className="md:hidden border-t px-4 py-3 flex items-center justify-between">
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
      {/* Desktop footer - full */}
      <div className="hidden md:block border-t px-6 py-2.5 flex items-center justify-center gap-1.5">
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
