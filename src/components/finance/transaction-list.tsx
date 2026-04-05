'use client'

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Wallet, Plus, Receipt, Pencil, Trash2, Search, X, ChevronDown, ChevronUp, SearchX, Copy } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { getCategoryIcon } from './constants'
import { cn } from '@/lib/utils'
import type { Transaction, Category } from './types'

interface TransactionListProps {
  groupedTransactions: { date: string; label: string; items: Transaction[] }[]
  activeTab: string
  isLoading: boolean
  onTabChange: (tab: string) => void
  onEdit: (tx: Transaction) => void
  onDelete: (txId: string) => void
  onDuplicate: (tx: Transaction) => void
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

function formatDateFull(dateStr: string): string {
  const date = new Date(dateStr)
  const day = date.getDate().toString().padStart(2, '0')
  const month = new Intl.DateTimeFormat('ru-RU', { month: 'long' }).format(date)
  const year = date.getFullYear()
  return `${day} ${month} ${year}`
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

function getTxCountWord(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod100 >= 11 && mod100 <= 14) return 'транзакций'
  if (mod10 === 1) return 'транзакция'
  if (mod10 >= 2 && mod10 <= 4) return 'транзакции'
  return 'транзакций'
}

export function TransactionList({
  groupedTransactions,
  activeTab,
  isLoading,
  onTabChange,
  onEdit,
  onDelete,
  onDuplicate,
  onAddNew,
}: TransactionListProps) {
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounce search query by 300ms
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [searchQuery])

  // Filter transactions based on debounced query
  const filteredGroups = useMemo(() => {
    if (!debouncedQuery.trim()) return groupedTransactions

    const query = debouncedQuery.toLowerCase().trim()
    return groupedTransactions
      .map((group) => ({
        ...group,
        items: group.items.filter((tx) => {
          const descriptionMatch = tx.description?.toLowerCase().includes(query)
          const categoryNameMatch = tx.category?.name?.toLowerCase().includes(query)
          const subCategoryMatch = tx.subCategory?.name?.toLowerCase().includes(query)
          return descriptionMatch || categoryNameMatch || subCategoryMatch
        }),
      }))
      .filter((group) => group.items.length > 0)
  }, [groupedTransactions, debouncedQuery])

  // Total transaction count for badge
  const totalTxCount = useMemo(() => {
    return groupedTransactions.reduce((acc, g) => acc + g.items.length, 0)
  }, [groupedTransactions])

  const filteredTxCount = useMemo(() => {
    return filteredGroups.reduce((acc, g) => acc + g.items.length, 0)
  }, [filteredGroups])

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      onDelete(deleteTarget.id)
      setDeleteTarget(null)
    }
  }

  const toggleExpanded = useCallback((txId: string) => {
    setExpandedTxId((prev) => (prev === txId ? null : txId))
  }, [])

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Receipt className="h-4 w-4 text-muted-foreground" />
              Транзакции
              {totalTxCount > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs font-normal">
                  {totalTxCount} {getTxCountWord(totalTxCount)}
                </Badge>
              )}
            </CardTitle>
            <Tabs value={activeTab} onValueChange={onTabChange}>
              <TabsList className="h-8 transition-all duration-200">
                <TabsTrigger value="all" className="text-xs px-2.5 h-7 transition-all duration-200">Все</TabsTrigger>
                <TabsTrigger value="income" className="text-xs px-2.5 h-7 transition-all duration-200">Доходы</TabsTrigger>
                <TabsTrigger value="expense" className="text-xs px-2.5 h-7 transition-all duration-200">Расходы</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          {/* Search bar */}
          <div className="relative mt-3">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Поиск транзакций..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9 h-9 text-sm"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0.5 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
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
            /* No transactions at all */
            <div className="relative flex flex-col items-center justify-center py-12 text-center">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-amber-500/25">
                <Wallet className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Нет транзакций</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Добавьте первую транзакцию, чтобы начать отслеживать финансы
              </p>
              <Button
                size="lg"
                onClick={onAddNew}
                className="mt-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all active-press"
              >
                <Plus className="h-5 w-5 mr-2" />
                Добавить транзакцию
              </Button>
            </div>
          ) : filteredGroups.length === 0 ? (
            /* Search filtered with no results */
            <div className="relative flex flex-col items-center justify-center py-12 text-center">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-red-400/20 to-orange-400/20 flex items-center justify-center mx-auto mb-4">
                <SearchX className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-base font-semibold mb-1">Ничего не найдено</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Попробуйте изменить поисковый запрос
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="mt-4"
              >
                <X className="h-3.5 w-3.5 mr-1.5" />
                Очистить поиск
              </Button>
            </div>
          ) : (
            <ScrollArea className="max-h-[500px]">
              <div className="space-y-1">
                {filteredGroups.map((group) => {
                  // Calculate daily totals
                  const dayIncome = group.items
                    .filter((tx) => tx.type === 'INCOME')
                    .reduce((acc, tx) => acc + tx.amount, 0)
                  const dayExpense = group.items
                    .filter((tx) => tx.type === 'EXPENSE')
                    .reduce((acc, tx) => acc + tx.amount, 0)

                  return (
                    <div key={group.date}>
                      <div className="sticky top-0 z-10 bg-background py-1.5">
                        <span className="text-xs font-medium text-muted-foreground capitalize">{group.label}</span>
                        {/* Daily totals */}
                        {(dayIncome > 0 || dayExpense > 0) && (
                          <div className="flex items-center gap-3 mt-0.5">
                            {dayIncome > 0 && (
                              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium tabular-nums">
                                Доходы: +{formatCurrency(dayIncome)}
                              </span>
                            )}
                            {dayExpense > 0 && (
                              <span className="text-[11px] text-red-500 dark:text-red-400 font-medium tabular-nums">
                                Расходы: -{formatCurrency(dayExpense)}
                              </span>
                            )}
                          </div>
                        )}
                        <Separator className="mt-1" />
                      </div>
                      {group.items.map((tx) => {
                        const isIncome = tx.type === 'INCOME'
                        const cat = tx.category || { id: '', name: 'Другое', type: 'EXPENSE', icon: 'circle', color: '#6b7280' } as Category
                        const isExpanded = expandedTxId === tx.id
                        return (
                          <div key={tx.id}>
                            <div
                              className={cn(
                                'flex items-center gap-3 py-3 px-2 -mx-2 border-l-2 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer',
                                isExpanded && 'bg-muted/40'
                              )}
                              style={{ borderColor: cat.color }}
                              onClick={() => toggleExpanded(tx.id)}
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
                                {/* Mobile: always visible small buttons */}
                                <div className="flex items-center gap-0.5 md:hidden">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                    onClick={(e) => { e.stopPropagation(); onDuplicate(tx) }}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                    onClick={(e) => { e.stopPropagation(); onEdit(tx) }}
                                  >
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-red-500"
                                    onClick={(e) => { e.stopPropagation(); setDeleteTarget(tx) }}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                                {/* Desktop: hover-reveal buttons */}
                                <div className="hidden md:flex items-center gap-0.5 group-hover:opacity-100 opacity-0 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                    onClick={(e) => { e.stopPropagation(); onDuplicate(tx) }}
                                  >
                                    <Copy className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                    onClick={(e) => { e.stopPropagation(); onEdit(tx) }}
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-red-500"
                                    onClick={(e) => { e.stopPropagation(); setDeleteTarget(tx) }}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                                <div className="text-right">
                                  <p className={cn(
                                    'text-sm font-semibold tabular-nums',
                                    isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
                                  )}>
                                    {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                                  </p>
                                </div>
                                {/* Expand/collapse chevron */}
                                <button
                                  onClick={(e) => { e.stopPropagation(); toggleExpanded(tx.id) }}
                                  className="ml-0.5 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                                >
                                  {isExpanded ? (
                                    <ChevronUp className="h-3.5 w-3.5" />
                                  ) : (
                                    <ChevronDown className="h-3.5 w-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>
                            {/* Expandable details */}
                            <div className={cn(
                              'overflow-hidden transition-all duration-200',
                              isExpanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                            )}>
                              <div className="pl-14 pr-4 pb-3 space-y-1.5 text-xs text-muted-foreground">
                                {/* Full date */}
                                <div className="flex items-center gap-1.5">
                                  <span className="font-medium text-foreground/70">Дата:</span>
                                  <span>{formatDateFull(tx.date)}</span>
                                </div>
                                {/* Category with colored dot */}
                                <div className="flex items-center gap-1.5">
                                  <span className="font-medium text-foreground/70">Категория:</span>
                                  <span className="inline-flex items-center gap-1">
                                    <span
                                      className="h-2 w-2 rounded-full shrink-0"
                                      style={{ backgroundColor: cat.color }}
                                    />
                                    {cat.name}
                                  </span>
                                </div>
                                {/* Note */}
                                {tx.note && (
                                  <div className="italic text-muted-foreground/80 pt-0.5">
                                    {tx.note}
                                  </div>
                                )}
                                {/* Transaction ID */}
                                <div className="flex items-center gap-1.5">
                                  <span className="font-medium text-foreground/70">ID:</span>
                                  <span className="font-mono text-[10px] text-muted-foreground/60">
                                    {tx.id.length > 12 ? `${tx.id.slice(0, 12)}…` : tx.id}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить транзакцию?</AlertDialogTitle>
            <AlertDialogDescription>
              Транзакция «{deleteTarget?.description || deleteTarget?.category?.name || '—'}» на сумму{' '}
              <span className="font-semibold">{deleteTarget && formatCurrency(deleteTarget.amount)}</span> будет удалена без возможности восстановления.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
