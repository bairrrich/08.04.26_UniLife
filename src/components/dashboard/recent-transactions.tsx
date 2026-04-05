'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Wallet, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import type { Transaction } from './types'

// ─── Props ────────────────────────────────────────────────────────────────────

interface RecentTransactionsProps {
  loading: boolean
  transactions: Transaction[]
  getRelativeTime: (dateStr: string) => string
  onNavigateToFinance: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function RecentTransactions({
  loading,
  transactions,
  getRelativeTime,
  onNavigateToFinance,
}: RecentTransactionsProps) {
  return (
    <Card className="rounded-xl border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Wallet className="h-4 w-4 text-amber-500" />
            Последние операции
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={onNavigateToFinance}
          >
            Все транзакции
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3.5 w-3/4" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Нет транзакций</p>
        ) : (
          <div className="space-y-2">
            {transactions.map((txn) => {
              const isIncome = txn.type === 'INCOME'
              return (
                <div key={txn.id} className="flex min-h-[44px] items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/50">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    isIncome
                      ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                      : 'bg-red-100 text-red-500 dark:bg-red-950/50 dark:text-red-400'
                  }`}>
                    {isIncome ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      {isIncome ? 'Доход' : 'Расход'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {getRelativeTime(txn.date)}
                    </p>
                  </div>
                  <span className={`text-sm font-semibold tabular-nums shrink-0 ${
                    isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {isIncome ? '+' : '-'}{formatCurrency(txn.amount)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
