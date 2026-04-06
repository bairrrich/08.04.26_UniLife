'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import type { AppModule } from '@/store/use-app-store'
import {
  BookOpen,
  Wallet,
  Utensils,
  Dumbbell,
  Target,
  Flag,
  Library,
  PenSquare,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuickActionsProps {
  onNavigate: (module: AppModule) => void
}

interface QuickAction {
  label: string
  tooltip: string
  icon: React.ReactNode
  module: AppModule
  gradient: string
  iconBg: string
  iconColor: string
  ringColor: string
}

// ─── Action Definitions ───────────────────────────────────────────────────────

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: 'Новая запись',
    tooltip: 'Создать новую запись в дневнике',
    icon: <BookOpen className="h-5 w-5" />,
    module: 'diary',
    gradient: 'from-emerald-500/15 via-emerald-400/10 to-transparent dark:from-emerald-500/20 dark:via-emerald-400/10',
    iconBg: 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/30',
    iconColor: 'text-white',
    ringColor: 'ring-emerald-500/20 hover:ring-emerald-500/40',
  },
  {
    label: 'Транзакция',
    tooltip: 'Добавить доход или расход',
    icon: <Wallet className="h-5 w-5" />,
    module: 'finance',
    gradient: 'from-amber-500/15 via-amber-400/10 to-transparent dark:from-amber-500/20 dark:via-amber-400/10',
    iconBg: 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-500/30',
    iconColor: 'text-white',
    ringColor: 'ring-amber-500/20 hover:ring-amber-500/40',
  },
  {
    label: 'Приём пищи',
    tooltip: 'Записать приём пищи и калории',
    icon: <Utensils className="h-5 w-5" />,
    module: 'nutrition',
    gradient: 'from-orange-500/15 via-orange-400/10 to-transparent dark:from-orange-500/20 dark:via-orange-400/10',
    iconBg: 'bg-gradient-to-br from-orange-400 to-orange-600 shadow-orange-500/30',
    iconColor: 'text-white',
    ringColor: 'ring-orange-500/20 hover:ring-orange-500/40',
  },
  {
    label: 'Тренировка',
    tooltip: 'Записать новую тренировку',
    icon: <Dumbbell className="h-5 w-5" />,
    module: 'workout',
    gradient: 'from-blue-500/15 via-blue-400/10 to-transparent dark:from-blue-500/20 dark:via-blue-400/10',
    iconBg: 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-500/30',
    iconColor: 'text-white',
    ringColor: 'ring-blue-500/20 hover:ring-blue-500/40',
  },
  {
    label: 'Привычка',
    tooltip: 'Добавить новую привычку для отслеживания',
    icon: <Target className="h-5 w-5" />,
    module: 'habits',
    gradient: 'from-violet-500/15 via-violet-400/10 to-transparent dark:from-violet-500/20 dark:via-violet-400/10',
    iconBg: 'bg-gradient-to-br from-violet-400 to-violet-600 shadow-violet-500/30',
    iconColor: 'text-white',
    ringColor: 'ring-violet-500/20 hover:ring-violet-500/40',
  },
  {
    label: 'Цель',
    tooltip: 'Поставить новую цель на день или неделю',
    icon: <Flag className="h-5 w-5" />,
    module: 'goals',
    gradient: 'from-rose-500/15 via-rose-400/10 to-transparent dark:from-rose-500/20 dark:via-rose-400/10',
    iconBg: 'bg-gradient-to-br from-rose-400 to-rose-600 shadow-rose-500/30',
    iconColor: 'text-white',
    ringColor: 'ring-rose-500/20 hover:ring-rose-500/40',
  },
  {
    label: 'Коллекция',
    tooltip: 'Добавить элемент в коллекцию (книги, фильмы…)',
    icon: <Library className="h-5 w-5" />,
    module: 'collections',
    gradient: 'from-cyan-500/15 via-cyan-400/10 to-transparent dark:from-cyan-500/20 dark:via-cyan-400/10',
    iconBg: 'bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-cyan-500/30',
    iconColor: 'text-white',
    ringColor: 'ring-cyan-500/20 hover:ring-cyan-500/40',
  },
  {
    label: 'Публикация',
    tooltip: 'Опубликовать запись в социальной ленте',
    icon: <PenSquare className="h-5 w-5" />,
    module: 'feed',
    gradient: 'from-pink-500/15 via-pink-400/10 to-transparent dark:from-pink-500/20 dark:via-pink-400/10',
    iconBg: 'bg-gradient-to-br from-pink-400 to-pink-600 shadow-pink-500/30',
    iconColor: 'text-white',
    ringColor: 'ring-pink-500/20 hover:ring-pink-500/40',
  },
]

// ─── Single Action Button ─────────────────────────────────────────────────────

function ActionButton({
  action,
  onNavigate,
}: {
  action: QuickAction
  onNavigate: (module: AppModule) => void
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={() => onNavigate(action.module)}
          className={`active-press group relative flex flex-col items-center gap-2.5 rounded-xl border border-border/50 bg-gradient-to-b ${action.gradient} p-4 transition-all duration-200 hover:scale-[1.03] hover:shadow-md ${action.ringColor} ring-1`}
        >
          {/* Colored icon with shadow */}
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${action.iconBg} shadow-md transition-transform duration-200 group-hover:scale-110 ${action.iconColor}`}
          >
            {action.icon}
          </div>
          {/* Label */}
          <span className="text-xs font-semibold text-foreground/80 group-hover:text-foreground transition-colors">
            {action.label}
          </span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={8}>
        <p>{action.tooltip}</p>
      </TooltipContent>
    </Tooltip>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function QuickActions({ onNavigate }: QuickActionsProps) {
  return (
    <Card className="rounded-xl border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Быстрые действия</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="stagger-children grid grid-cols-2 md:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map((action) => (
            <ActionButton
              key={action.module}
              action={action}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
