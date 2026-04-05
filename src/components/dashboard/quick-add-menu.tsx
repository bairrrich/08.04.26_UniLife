'use client'

import { useState } from 'react'
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
} from 'lucide-react'

// ─── Menu Items ──────────────────────────────────────────────────────────────

interface QuickAddItem {
  label: string
  icon: React.ReactNode
  module: AppModule
  iconBg: string
  hoverBg: string
}

const QUICK_ADD_ITEMS: QuickAddItem[] = [
  {
    label: 'Новая запись в дневник',
    icon: <BookOpen className="h-4 w-4" />,
    module: 'diary',
    iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400',
    hoverBg: 'hover:bg-emerald-50 dark:hover:bg-emerald-950/30',
  },
  {
    label: 'Добавить расход',
    icon: <TrendingDown className="h-4 w-4" />,
    module: 'finance',
    iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400',
    hoverBg: 'hover:bg-amber-50 dark:hover:bg-amber-950/30',
  },
  {
    label: 'Записать приём пищи',
    icon: <Utensils className="h-4 w-4" />,
    module: 'nutrition',
    iconBg: 'bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400',
    hoverBg: 'hover:bg-orange-50 dark:hover:bg-orange-950/30',
  },
  {
    label: 'Добавить тренировку',
    icon: <Dumbbell className="h-4 w-4" />,
    module: 'workout',
    iconBg: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400',
    hoverBg: 'hover:bg-blue-50 dark:hover:bg-blue-950/30',
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export function QuickAddMenu() {
  const [open, setOpen] = useState(false)
  const setActiveModule = useAppStore((s) => s.setActiveModule)
  const setPendingDialog = useAppStore((s) => s.setPendingDialog)

  const handleSelect = (module: AppModule) => {
    setOpen(false)
    setActiveModule(module)
    // Signal to module to open its dialog after navigation
    setTimeout(() => {
      setPendingDialog(true)
    }, 100)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <button
            className="group flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-emerald-500/30 active:scale-95 dark:from-emerald-600 dark:to-teal-700"
            aria-label="Быстрое добавление"
          >
            <Plus className="h-6 w-6 transition-transform duration-300 group-data-[state=open]:rotate-45" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          sideOffset={12}
          className="w-56 rounded-xl border p-2 shadow-xl"
        >
          <div className="mb-1.5 px-2 py-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Быстрое добавление
            </p>
          </div>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent mb-1" />
          {QUICK_ADD_ITEMS.map((item) => (
            <DropdownMenuItem
              key={item.module}
              onClick={() => handleSelect(item.module)}
              className={`flex items-center gap-3 rounded-lg px-2.5 py-2.5 cursor-pointer transition-colors duration-150 ${item.hoverBg}`}
            >
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${item.iconBg}`}>
                {item.icon}
              </div>
              <span className="text-sm font-medium">{item.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
