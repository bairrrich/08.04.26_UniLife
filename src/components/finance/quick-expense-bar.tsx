'use client'

import { useState, useMemo } from 'react'
import { Coffee, Bus, UtensilsCrossed, ShoppingBag, Zap, MoreHorizontal, PiggyBank, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'
import { getCategoryIcon } from './constants'
import type { Transaction } from './types'

interface QuickExpensePreset {
  label: string
  amount: number
  icon: React.ReactNode
  color: string
}

const QUICK_EXPENSES: QuickExpensePreset[] = [
  { label: 'Кофе', amount: 200, icon: <Coffee className="h-3.5 w-3.5" />, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  { label: 'Транспорт', amount: 60, icon: <Bus className="h-3.5 w-3.5" />, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  { label: 'Обед', amount: 400, icon: <UtensilsCrossed className="h-3.5 w-3.5" />, color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' },
  { label: 'Снэк', amount: 150, icon: <Zap className="h-3.5 w-3.5" />, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
  { label: 'Магазин', amount: 500, icon: <ShoppingBag className="h-3.5 w-3.5" />, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
  { label: 'Вода', amount: 80, icon: <MoreHorizontal className="h-3.5 w-3.5" />, color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300' },
]

interface CategoryBreakdownItem {
  categoryId: string
  categoryName: string
  categoryColor: string
  categoryIcon: string
  total: number
  count: number
}

interface QuickExpenseBarProps {
  onQuickExpense: (label: string, amount: number) => void
  transactions: Transaction[]
  totalIncome: number
  isLoading?: boolean
}

export function QuickExpenseBar({ onQuickExpense, transactions, totalIncome, isLoading }: QuickExpenseBarProps) {
  const [showBreakdown, setShowBreakdown] = useState(false)
  const [animWidth, setAnimWidth] = useState(0)

  const todayStr = new Date().toISOString().split('T')[0]

  const dailyData = useMemo(() => {
    const now = new Date()
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const dailyBudget = totalIncome > 0 ? totalIncome / daysInMonth : 0

    const todayExpenses = transactions.filter(
      (t) => t.type === 'EXPENSE' && t.date.startsWith(todayStr)
    )
    const todaySpent = todayExpenses.reduce((sum, t) => sum + t.amount, 0)
    const remaining = Math.max(0, dailyBudget - todaySpent)
    const percentage = dailyBudget > 0 ? (todaySpent / dailyBudget) * 100 : 0

    // Category breakdown
    const catMap = new Map<string, CategoryBreakdownItem>()
    todayExpenses.forEach((tx) => {
      const catId = tx.categoryId
      const existing = catMap.get(catId)
      if (existing) {
        existing.total += tx.amount
        existing.count += 1
      } else {
        catMap.set(catId, {
          categoryId: catId,
          categoryName: tx.category?.name || 'Другое',
          categoryColor: tx.category?.color || '#6b7280',
          categoryIcon: tx.category?.icon || 'circle',
          total: tx.amount,
          count: 1,
        })
      }
    })
    const categories = Array.from(catMap.values()).sort((a, b) => b.total - a.total)

    return { daysInMonth, dailyBudget, todaySpent, remaining, percentage, categories }
  }, [transactions, totalIncome, todayStr])

  // Animate progress bar on mount and data change
  useMemo(() => {
    const timer = setTimeout(() => {
      setAnimWidth(Math.min(dailyData.percentage, 100))
    }, 100)
    return () => clearTimeout(timer)
  }, [dailyData.percentage])

  const getStatusColor = () => {
    if (dailyData.percentage <= 70) return { bar: 'from-emerald-400 to-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-950/40' }
    if (dailyData.percentage <= 100) return { bar: 'from-amber-400 to-amber-500', text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-950/40' }
    return { bar: 'from-red-400 to-red-500', text: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-950/40' }
  }

  const getStatusLabel = () => {
    if (dailyData.percentage <= 70) return 'В норме'
    if (dailyData.percentage <= 100) return 'Осторожно'
    return 'Превышен!'
  }

  if (isLoading) {
    return <div className="skeleton-shimmer h-[100px] rounded-xl" />
  }

  const statusColor = getStatusColor()

  return (
    <div className="space-y-3">
      {/* Daily Budget Progress Bar (Piggy Bank) */}
      <div className="rounded-xl border bg-card p-4 card-hover overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-100 text-pink-600 dark:bg-pink-950 dark:text-pink-400">
              <PiggyBank className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">Дневной бюджет</p>
              <p className="text-[11px] text-muted-foreground">
                Лимит: <span className="font-medium tabular-nums">{formatCurrency(dailyData.dailyBudget)}</span>
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1.5">
              {dailyData.percentage > 100 && (
                <AlertTriangle className={cn('h-3.5 w-3.5', statusColor.text)} />
              )}
              <span className={cn('text-lg font-bold tabular-nums', statusColor.text)}>
                {Math.round(dailyData.percentage)}%
              </span>
            </div>
            <span className={cn('text-[10px] font-medium', statusColor.text)}>
              {getStatusLabel()}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
          {/* Background segments */}
          <div className="absolute inset-0 flex">
            <div className="w-[70%] bg-emerald-100 dark:bg-emerald-900/30 border-r border-emerald-200/50 dark:border-emerald-800/30" />
            <div className="w-[30%] bg-amber-100 dark:bg-amber-900/30" />
          </div>
          {/* Animated fill */}
          <div
            className={cn(
              'absolute inset-y-0 left-0 rounded-full bg-gradient-to-r transition-all duration-1000 ease-out',
              statusColor.bar
            )}
            style={{ width: `${animWidth}%` }}
          />
        </div>

        {/* Spent / Remaining */}
        <div className="mt-2.5 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Потрачено: <span className="font-semibold tabular-nums text-foreground">{formatCurrency(dailyData.todaySpent)}</span>
          </span>
          <span className={cn(
            'text-xs font-semibold tabular-nums',
            dailyData.remaining > 0
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-red-600 dark:text-red-400'
          )}>
            {dailyData.remaining > 0
              ? `Осталось ${formatCurrency(dailyData.remaining)}`
              : `Перерасход ${formatCurrency(Math.abs(dailyData.remaining))}`
            }
          </span>
        </div>

        {/* Click to breakdown */}
        {dailyData.categories.length > 0 && (
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <span>{showBreakdown ? 'Скрыть детали' : 'Подробнее по категориям'}</span>
            {showBreakdown ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        )}

        {/* Category Breakdown (expandable) */}
        {showBreakdown && dailyData.categories.length > 0 && (
          <div className="mt-2 space-y-2 rounded-lg bg-muted/50 p-3 animate-slide-up">
            {dailyData.categories.map((cat) => {
              const pct = dailyData.todaySpent > 0 ? Math.round((cat.total / dailyData.todaySpent) * 100) : 0
              return (
                <div key={cat.categoryId} className="flex items-center gap-2">
                  <div
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
                    style={{ backgroundColor: `${cat.categoryColor}18`, color: cat.categoryColor }}
                  >
                    {getCategoryIcon(cat.categoryIcon)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium truncate">{cat.categoryName}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-semibold tabular-nums">{formatCurrency(cat.total)}</span>
                        <span className="text-[10px] text-muted-foreground tabular-nums">{pct}%</span>
                      </div>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: cat.categoryColor }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Legend */}
        <div className="mt-2 flex items-center gap-4 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-3 rounded-full bg-emerald-400" />
            <span>Норма (≤70%)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-3 rounded-full bg-amber-400" />
            <span>Внимание (70–100%)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-3 rounded-full bg-red-400" />
            <span>Превышен</span>
          </div>
        </div>
      </div>

      {/* Quick Expense Buttons */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">Быстрый расход</p>
          <p className="text-[10px] text-muted-foreground/60">Одно нажатие = транзакция</p>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {QUICK_EXPENSES.map((expense) => (
            <button
              key={expense.label}
              onClick={() => onQuickExpense(expense.label, expense.amount)}
              className={cn(
                'flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium border border-transparent',
                'transition-all duration-150 active-press hover:scale-[1.03] hover:shadow-sm',
                'hover:border-muted-foreground/20 shrink-0',
                expense.color,
                'bg-opacity-80 hover:bg-opacity-100'
              )}
            >
              {expense.icon}
              <div className="flex flex-col items-start">
                <span>{expense.label}</span>
                <span className="text-[10px] opacity-70 font-semibold tabular-nums">{formatCurrency(expense.amount)}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
