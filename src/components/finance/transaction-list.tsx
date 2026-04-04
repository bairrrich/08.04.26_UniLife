'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Wallet, Plus, Receipt, Pencil } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { getCategoryIcon } from './constants'
import type { Transaction, Category } from './types'

interface TransactionListProps {
  groupedTransactions: { date: string; label: string; items: Transaction[] }[]
  activeTab: string
  isLoading: boolean
  onTabChange: (tab: string) => void
  onEdit: (tx: Transaction) => void
  onAddNew: () => void
}

function formatDateRu(dateStr: string): string {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function formatRelativeTime(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'только что'
  if (diffMin < 60) return `${diffMin} мин назад`
  if (diffHours < 24) return `${diffHours}ч назад`
  if (diffDays === 1) return 'вчера'
  if (diffDays < 7) return `${diffDays} дн. назад`
  return formatDateRu(dateStr)
}

export function TransactionList({
  groupedTransactions,
  activeTab,
  isLoading,
  onTabChange,
  onEdit,
  onAddNew,
}: TransactionListProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Receipt className="h-4 w-4 text-muted-foreground" />
            Транзакции
          </CardTitle>
          <Tabs value={activeTab} onValueChange={onTabChange}>
            <TabsList className="h-8 transition-all duration-200">
              <TabsTrigger value="all" className="text-xs px-2.5 h-7 transition-all duration-200">Все</TabsTrigger>
              <TabsTrigger value="income" className="text-xs px-2.5 h-7 transition-all duration-200">Доходы</TabsTrigger>
              <TabsTrigger value="expense" className="text-xs px-2.5 h-7 transition-all duration-200">Расходы</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton-shimmer h-14 rounded-lg" />
            ))}
          </div>
        ) : groupedTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
            <Wallet className="h-8 w-8" />
            <p className="text-sm">Нет транзакций за этот период</p>
            <Button variant="outline" size="sm" onClick={onAddNew}>
              <Plus className="mr-1 h-3.5 w-3.5" />
              Добавить транзакцию
            </Button>
          </div>
        ) : (
          <ScrollArea className="max-h-[500px]">
            <div className="space-y-1">
              {groupedTransactions.map((group) => (
                <div key={group.date}>
                  <div className="sticky top-0 z-10 bg-background py-1.5">
                    <span className="text-xs font-medium text-muted-foreground capitalize">{group.label}</span>
                    <Separator className="mt-1" />
                  </div>
                  {group.items.map((tx) => {
                    const isIncome = tx.type === 'INCOME'
                    const cat = tx.category || { id: '', name: 'Другое', type: 'EXPENSE', icon: 'circle', color: '#6b7280' } as Category
                    return (
                      <div
                        key={tx.id}
                        className="flex items-center gap-3 py-3 px-2 -mx-2 border-l-2 rounded-lg hover:bg-muted/30 transition-colors cursor-default"
                        style={{ borderColor: cat.color }}
                      >
                        <div
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                          style={{ backgroundColor: `${cat.color}18`, color: cat.color }}
                        >
                          {getCategoryIcon(cat.icon)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{tx.description || cat.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-muted-foreground truncate">
                              {tx.subCategory?.name || cat.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground/70">
                              {formatRelativeTime(tx.date)}
                            </span>
                          </div>
                        </div>
                        <div className="shrink-0 flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={(e) => { e.stopPropagation(); onEdit(tx) }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <div className="text-right">
                            <p className={`text-sm font-semibold tabular-nums ${isIncome ? 'text-emerald-600' : 'text-red-500'}`}>
                              {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
