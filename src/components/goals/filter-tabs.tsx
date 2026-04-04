'use client'

import type { GoalData, FilterTab } from './types'

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'Все' },
  { key: 'active', label: 'Активные' },
  { key: 'completed', label: 'Завершённые' },
]

function countByStatus(goals: GoalData[], status: string) {
  return goals.filter((g) => g.status === status).length
}

function getCount(goals: GoalData[], tab: FilterTab): number {
  if (tab === 'all') return goals.length
  return countByStatus(goals, tab)
}

interface FilterTabsProps {
  filterTab: FilterTab
  setFilterTab: (tab: FilterTab) => void
  goals: GoalData[]
}

export function FilterTabs({ filterTab, setFilterTab, goals }: FilterTabsProps) {
  return (
    <div className="flex gap-1.5 p-1 bg-muted/60 rounded-xl w-fit">
      {TABS.map((tab) => {
        const count = getCount(goals, tab.key)
        const isActive = filterTab === tab.key
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilterTab(tab.key)}
            className={`relative rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="flex items-center gap-1.5">
              {tab.label}
              <span
                className={`inline-flex items-center justify-center min-w-[20px] h-5 rounded-full text-[10px] font-bold px-1.5 tabular-nums transition-colors duration-200 ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted-foreground/15 text-muted-foreground'
                }`}
              >
                {count}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
