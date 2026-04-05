'use client'

import { useMemo } from 'react'
import type { GoalData, FilterTab, CategoryFilter } from './types'
import { cn } from '@/lib/utils'

// ─── Status Tabs ────────────────────────────────────────────────────────────
const STATUS_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'Все' },
  { key: 'active', label: 'Активные' },
  { key: 'completed', label: 'Завершённые' },
]

// ─── Category Filter Chips ──────────────────────────────────────────────────
const CATEGORY_CHIPS: { key: CategoryFilter; label: string; color: string; activeColor: string }[] = [
  { key: 'all', label: 'Все категории', color: 'text-muted-foreground bg-muted-foreground/10', activeColor: 'bg-foreground text-background' },
  { key: 'personal', label: 'Личное', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30', activeColor: 'bg-emerald-600 dark:bg-emerald-500 text-white' },
  { key: 'health', label: 'Здоровье', color: 'text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/30', activeColor: 'bg-rose-600 dark:bg-rose-500 text-white' },
  { key: 'finance', label: 'Финансы', color: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30', activeColor: 'bg-amber-600 dark:bg-amber-500 text-white' },
  { key: 'career', label: 'Карьера', color: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30', activeColor: 'bg-blue-600 dark:bg-blue-500 text-white' },
  { key: 'learning', label: 'Обучение', color: 'text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/30', activeColor: 'bg-violet-600 dark:bg-violet-500 text-white' },
]

function countByStatus(goals: GoalData[], status: string) {
  return goals.filter((g) => g.status === status).length
}

function getStatusCount(goals: GoalData[], tab: FilterTab): number {
  if (tab === 'all') return goals.length
  return countByStatus(goals, tab)
}

function getCategoryCount(goals: GoalData[], category: CategoryFilter): number {
  if (category === 'all') return goals.length
  if (category === 'learning') return goals.filter((g) => g.category === 'learning' || g.category === 'education').length
  return goals.filter((g) => g.category === category).length
}

interface FilterTabsProps {
  filterTab: FilterTab
  setFilterTab: (tab: FilterTab) => void
  categoryFilter: CategoryFilter
  setCategoryFilter: (cat: CategoryFilter) => void
  goals: GoalData[]
}

export function FilterTabs({ filterTab, setFilterTab, categoryFilter, setCategoryFilter, goals }: FilterTabsProps) {
  return (
    <div className="space-y-3">
      {/* Status Tabs — scrollable on mobile */}
      <div className="overflow-x-auto scrollbar-none -mx-1 px-1">
        <div className="flex gap-1.5 p-1 bg-muted/60 rounded-xl w-fit min-w-full sm:min-w-0">
          {STATUS_TABS.map((tab) => {
            const count = getStatusCount(goals, tab.key)
            const isActive = filterTab === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilterTab(tab.key)}
                className={cn(
                  'relative rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap flex-1 sm:flex-none justify-center',
                  isActive
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <span className="flex items-center gap-1.5">
                  {tab.label}
                  <span
                    className={cn(
                      'inline-flex items-center justify-center min-w-[20px] h-5 rounded-full text-[10px] font-bold px-1.5 tabular-nums transition-colors duration-200',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted-foreground/15 text-muted-foreground',
                    )}
                  >
                    {count}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Category Filter Chips — scrollable on mobile */}
      <div className="overflow-x-auto scrollbar-none -mx-1 px-1">
        <div className="flex gap-2 w-fit min-w-full sm:min-w-0">
          {CATEGORY_CHIPS.map((chip) => {
            const count = getCategoryCount(goals, chip.key)
            const isActive = categoryFilter === chip.key
            return (
              <button
                key={chip.key}
                type="button"
                onClick={() => setCategoryFilter(chip.key)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-all duration-200 whitespace-nowrap active-press',
                  isActive
                    ? chip.activeColor + ' border-transparent shadow-sm'
                    : chip.color + ' border-transparent hover:opacity-80',
                  count === 0 && !isActive && 'opacity-40',
                )}
              >
                {chip.label}
                <span className={cn(
                  'inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-[10px] font-bold px-1 tabular-nums',
                  isActive ? 'bg-white/20 text-white' : 'bg-black/10 dark:bg-white/10',
                )}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
