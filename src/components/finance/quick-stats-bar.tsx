'use client'

import { useMemo } from 'react'
import { TrendingDown, Calendar, AlertTriangle, PiggyBank } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import type { Transaction } from './types'

interface QuickStatsBarProps {
  transactions: Transaction[]
  totalIncome: number
  totalExpense: number
  isLoading: boolean
}

export function QuickStatsBar({ transactions, totalIncome, totalExpense, isLoading }: QuickStatsBarProps) {
  const stats = useMemo(() => {
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]

    // Start of this week (Monday)
    const dayOfWeek = today.getDay()
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    const monday = new Date(today)
    monday.setDate(today.getDate() - mondayOffset)
    monday.setHours(0, 0, 0, 0)
    const mondayStr = monday.toISOString().split('T')[0]

    // Today's spending
    const todayExpenses = transactions
      .filter((t) => t.type === 'EXPENSE' && t.date.startsWith(todayStr))
    const todaySpending = todayExpenses.reduce((sum, t) => sum + t.amount, 0)

    // This week's spending
    const weekExpenses = transactions
      .filter((t) => t.type === 'EXPENSE' && t.date.split('T')[0] >= mondayStr)
    const weekSpending = weekExpenses.reduce((sum, t) => sum + t.amount, 0)

    // Biggest expense this month
    const monthExpenses = transactions.filter((t) => t.type === 'EXPENSE')
    const biggest = monthExpenses.length > 0
      ? monthExpenses.reduce((max, t) => (t.amount > max.amount ? t : max), monthExpenses[0])
      : null

    // Savings rate
    const savingsRate = totalIncome > 0
      ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100)
      : 0

    return { todaySpending, weekSpending, biggest, savingsRate }
  }, [transactions, totalIncome, totalExpense])

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton-shimmer h-[68px] rounded-xl" />
        ))}
      </div>
    )
  }

  const items = [
    {
      icon: TrendingDown,
      label: "Сегодня",
      value: formatCurrency(stats.todaySpending),
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      iconBg: 'bg-rose-100 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400',
      valueColor: 'text-rose-600 dark:text-rose-400',
    },
    {
      icon: Calendar,
      label: "Эта неделя",
      value: formatCurrency(stats.weekSpending),
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      iconBg: 'bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400',
      valueColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      icon: AlertTriangle,
      label: "Самая большая",
      value: stats.biggest
        ? `${formatCurrency(stats.biggest.amount)}`
        : '—',
      subValue: stats.biggest
        ? stats.biggest.description || stats.biggest.category?.name || ''
        : '',
      bg: 'bg-orange-50 dark:bg-orange-950/40',
      iconBg: 'bg-orange-100 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400',
      valueColor: 'text-orange-600 dark:text-orange-400',
    },
    {
      icon: PiggyBank,
      label: "Норма сбережений",
      value: `${stats.savingsRate}%`,
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      iconBg: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
      valueColor: 'text-emerald-600 dark:text-emerald-400',
    },
  ]

  return (
    <div className="overflow-x-auto no-scrollbar -mx-1 px-1">
      <div className="flex gap-3 min-w-[500px] sm:min-w-0">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.label}
              className={`flex-1 rounded-xl ${item.bg} p-3 transition-all hover:scale-[1.02] hover:shadow-sm cursor-default`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`flex h-6 w-6 items-center justify-center rounded-md ${item.iconBg}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <span className="text-[11px] font-medium text-muted-foreground leading-none">
                  {item.label}
                </span>
              </div>
              <div className={`text-sm font-bold tabular-nums ${item.valueColor} truncate`}>
                {item.value}
              </div>
              {item.subValue && (
                <div className="text-[10px] text-muted-foreground truncate mt-0.5">
                  {item.subValue}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
