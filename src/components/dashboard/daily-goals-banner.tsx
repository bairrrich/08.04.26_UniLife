'use client'

import { BookOpen, Wallet, Dumbbell, Apple } from 'lucide-react'
import { useUserPrefs } from '@/lib/use-user-prefs'
import { useAppStore, AppModule } from '@/store/use-app-store'

interface GoalConfig {
  id: string
  label: string
  module: AppModule
  icon: React.ReactNode
  gradient: string
  border: string
  iconBg: string
  iconColor: string
}

const GOALS_CONFIG: GoalConfig[] = [
  {
    id: 'diary',
    label: 'Дневник',
    module: 'diary',
    icon: <BookOpen className="h-4 w-4" />,
    gradient: 'from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40',
    border: 'border-emerald-200/60 dark:border-emerald-800/40 hover:border-emerald-300 dark:hover:border-emerald-700',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/60',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'finance',
    label: 'Финансы',
    module: 'finance',
    icon: <Wallet className="h-4 w-4" />,
    gradient: 'from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40',
    border: 'border-amber-200/60 dark:border-amber-800/40 hover:border-amber-300 dark:hover:border-amber-700',
    iconBg: 'bg-amber-100 dark:bg-amber-900/60',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    id: 'workout',
    label: 'Тренировки',
    module: 'workout',
    icon: <Dumbbell className="h-4 w-4" />,
    gradient: 'from-blue-50 to-sky-50 dark:from-blue-950/40 dark:to-sky-950/40',
    border: 'border-blue-200/60 dark:border-blue-800/40 hover:border-blue-300 dark:hover:border-blue-700',
    iconBg: 'bg-blue-100 dark:bg-blue-900/60',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'nutrition',
    label: 'Питание',
    module: 'nutrition',
    icon: <Apple className="h-4 w-4" />,
    gradient: 'from-rose-50 to-pink-50 dark:from-rose-950/40 dark:to-pink-950/40',
    border: 'border-rose-200/60 dark:border-rose-800/40 hover:border-rose-300 dark:hover:border-rose-700',
    iconBg: 'bg-rose-100 dark:bg-rose-900/60',
    iconColor: 'text-rose-600 dark:text-rose-400',
  },
]

export default function DailyGoalsBanner() {
  const { userGoals } = useUserPrefs()
  const setActiveModule = useAppStore((s) => s.setActiveModule)

  if (!userGoals || userGoals.length === 0) return null

  const activeGoals = GOALS_CONFIG.filter((g) => userGoals.includes(g.id))

  if (activeGoals.length === 0) return null

  return (
    <div className="glass-card overflow-hidden rounded-xl border p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 text-[10px] font-bold text-white shadow-sm">
          ✓
        </span>
        Ваши цели дня
      </h3>

      <div className="flex flex-wrap gap-2.5">
        {activeGoals.map((goal) => (
          <button
            key={goal.id}
            onClick={() => setActiveModule(goal.module)}
            className={`group flex min-h-[44px] items-center gap-2.5 rounded-lg border bg-gradient-to-r px-3.5 py-2.5 transition-all duration-200 hover:scale-[1.03] hover:shadow-md active:scale-[0.98] ${goal.gradient} ${goal.border}`}
          >
            <span className={`flex h-7 w-7 items-center justify-center rounded-md ${goal.iconBg} ${goal.iconColor} transition-transform group-hover:scale-110`}>
              {goal.icon}
            </span>
            <span className="text-sm font-medium text-foreground">
              {goal.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
