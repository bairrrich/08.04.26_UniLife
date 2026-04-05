'use client'

import { Coffee, Bus, UtensilsCrossed, ShoppingBag, Zap, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'

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

interface QuickExpenseBarProps {
  onQuickExpense: (label: string, amount: number) => void
}

export function QuickExpenseBar({ onQuickExpense }: QuickExpenseBarProps) {
  return (
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
  )
}
