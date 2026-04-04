import type { GoalData, FilterTab } from './types'

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'Все' },
  { key: 'active', label: 'Активные' },
  { key: 'completed', label: 'Завершённые' },
]

function countByStatus(goals: GoalData[], status: string) {
  return goals.filter((g) => g.status === status).length
}

interface FilterTabsProps {
  filterTab: FilterTab
  setFilterTab: (tab: FilterTab) => void
  goals: GoalData[]
}

export function FilterTabs({ filterTab, setFilterTab, goals }: FilterTabsProps) {
  return (
    <div className="flex gap-2">
      {TABS.map((tab) => (
        <button
          key={tab.key} type="button"
          onClick={() => setFilterTab(tab.key)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            filterTab === tab.key
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-muted hover:bg-muted/80 text-muted-foreground'
          }`}
        >
          {tab.label}
          <span className="ml-1.5 text-xs opacity-70">
            {tab.key === 'all'
              ? goals.length
              : countByStatus(goals, tab.key)
            }
          </span>
        </button>
      ))}
    </div>
  )
}
