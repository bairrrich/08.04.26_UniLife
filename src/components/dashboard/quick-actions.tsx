'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AppModule } from '@/store/use-app-store'
import {
  Plus,
  TrendingDown,
  Utensils,
  Dumbbell,
} from 'lucide-react'

// ─── Props ────────────────────────────────────────────────────────────────────

interface QuickActionsProps {
  onNavigate: (module: AppModule) => void
}

const QUICK_ACTIONS: {
  label: string
  icon: React.ReactNode
  module: AppModule
  iconBg: string
}[] = [
  {
    label: 'Новая запись',
    icon: <Plus className="h-4 w-4" />,
    module: 'diary',
    iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
  },
  {
    label: 'Добавить расход',
    icon: <TrendingDown className="h-4 w-4" />,
    module: 'finance',
    iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
  },
  {
    label: 'Записать приём пищи',
    icon: <Utensils className="h-4 w-4" />,
    module: 'nutrition',
    iconBg: 'bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400',
  },
  {
    label: 'Новая тренировка',
    icon: <Dumbbell className="h-4 w-4" />,
    module: 'workout',
    iconBg: 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export function QuickActions({ onNavigate }: QuickActionsProps) {
  return (
    <Card className="rounded-xl border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Быстрые действия</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="stagger-children flex flex-wrap gap-3">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.module}
              onClick={() => onNavigate(action.module)}
              className="group flex items-center gap-2.5 rounded-xl border bg-accent px-4 py-3 text-sm font-medium transition-all duration-200 hover:scale-[1.03] hover:bg-accent/80 hover:shadow-md active:scale-[0.98] hover-glow"
            >
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110 ${action.iconBg}`}
              >
                {action.icon}
              </div>
              {action.label}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
