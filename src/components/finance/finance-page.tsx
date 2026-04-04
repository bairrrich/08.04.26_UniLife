'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Wallet,
  Plus,
  Filter,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getCurrentMonthStr } from '@/lib/format'
import { toast } from 'sonner'

import type { Transaction, Category, StatsResponse, ChartDataPoint } from './types'
import { SummaryCards } from './summary-cards'
import { ExpenseChart } from './expense-chart'
import { CategoryBreakdown } from './category-breakdown'
import { TransactionList } from './transaction-list'
import { AddTransactionDialog, EditTransactionDialog } from './transaction-dialog'
import { AnalyticsSection } from './analytics-section'

export default function FinancePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [month, setMonth] = useState(getCurrentMonthStr())
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  // New transaction form
  const [newType, setNewType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE')
  const [newAmount, setNewAmount] = useState('')
  const [newCategoryId, setNewCategoryId] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0])
  const [newNote, setNewNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Edit transaction
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingTx, setEditingTx] = useState<Transaction | null>(null)
  const [editType, setEditType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE')
  const [editAmount, setEditAmount] = useState('')
  const [editCategoryId, setEditCategoryId] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editDate, setEditDate] = useState('')
  const [editNote, setEditNote] = useState('')
  const [isEditSubmitting, setIsEditSubmitting] = useState(false)

  // ─── Data Fetching ─────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const txRes = await fetch(`/api/finance?month=${month}`)
      if (txRes.ok) { const d = await txRes.json(); setTransactions(d.data || []) }
      await new Promise(r => setTimeout(r, 100))

      const catRes = await fetch('/api/finance/categories')
      if (catRes.ok) { const d = await catRes.json(); setCategories(d.data || []) }
      await new Promise(r => setTimeout(r, 100))

      const statsRes = await fetch(`/api/finance/stats?month=${month}`)
      if (statsRes.ok) { const d = await statsRes.json(); setStats(d.data || null) }
    } catch (err) {
      console.error('Failed to fetch finance data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [month])

  useEffect(() => { fetchData() }, [fetchData])

  // ─── Computed ──────────────────────────────────────────────────
  const filteredTransactions = useMemo(() => {
    let filtered = transactions
    if (activeTab === 'income') filtered = filtered.filter((t) => t.type === 'INCOME')
    else if (activeTab === 'expense') filtered = filtered.filter((t) => t.type === 'EXPENSE')
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [transactions, activeTab])

  const groupedTransactions = useMemo(() => {
    const groups: { date: string; label: string; items: Transaction[] }[] = []
    const map = new Map<string, Transaction[]>()
    filteredTransactions.forEach((tx) => {
      const dateKey = tx.date.split('T')[0]
      if (!map.has(dateKey)) map.set(dateKey, [])
      map.get(dateKey)!.push(tx)
    })
    map.forEach((items, dateKey) => {
      groups.push({
        date: dateKey,
        label: new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(dateKey)),
        items: items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      })
    })
    return groups
  }, [filteredTransactions])

  const chartData = useMemo((): ChartDataPoint[] => {
    const data: ChartDataPoint[] = []
    const daysInMonth = new Date(parseInt(month.split('-')[0]), parseInt(month.split('-')[1]), 0).getDate()
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${month}-${d.toString().padStart(2, '0')}`
      const dayTx = transactions.filter((t) => t.date.startsWith(dateStr))
      data.push({
        day: d.toString(),
        expense: dayTx.filter((t) => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0),
        income: dayTx.filter((t) => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0),
      })
    }
    return data
  }, [transactions, month])

  const filteredCategories = useMemo(() => categories.filter((c) => c.type === newType), [categories, newType])
  const editFilteredCategories = useMemo(() => categories.filter((c) => c.type === editType), [categories, editType])

  const monthLabel = useMemo(() => {
    const [year, mon] = month.split('-').map(Number)
    return new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' }).format(new Date(year, mon - 1, 1))
  }, [month])

  const spendingInsights = useMemo(() => {
    const expenses = transactions.filter((t) => t.type === 'EXPENSE')
    if (expenses.length === 0) return null
    const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0)
    const uniqueDays = new Set(expenses.map((t) => t.date.split('T')[0]))
    const daysInMonth = uniqueDays.size || 1
    const avgDaily = totalExpense / daysInMonth
    const biggestExpense = expenses.reduce((max, t) => (t.amount > max.amount ? t : max), expenses[0])
    const top3 = (stats?.byCategory || []).slice().sort((a, b) => b.total - a.total).slice(0, 3)
    return { avgDaily, biggestExpense, top3, totalExpense, daysInMonth }
  }, [transactions, stats])

  const getCategoryForTx = (tx: Transaction): Category => {
    return tx.category || categories.find((c) => c.id === tx.categoryId) || { id: '', name: 'Другое', type: 'EXPENSE', icon: 'circle', color: '#6b7280' }
  }

  // ─── Actions ───────────────────────────────────────────────────
  const resetForm = () => {
    setNewType('EXPENSE'); setNewAmount(''); setNewCategoryId(''); setNewDescription('')
    setNewDate(new Date().toISOString().split('T')[0]); setNewNote('')
  }

  const handleSubmit = async () => {
    if (!newAmount || !newCategoryId || !newDate) return
    setIsSubmitting(true); toast.dismiss()
    try {
      const res = await fetch('/api/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: newType, amount: parseFloat(newAmount), categoryId: newCategoryId, description: newDescription || undefined, date: newDate, note: newNote || undefined }),
      })
      if (res.ok) { toast.success('Транзакция добавлена'); setShowNewDialog(false); resetForm(); fetchData() }
      else { toast.error('Ошибка при добавлении транзакции') }
    } catch (err) { console.error('Failed to create transaction:', err); toast.error('Ошибка: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка')) }
    finally { setIsSubmitting(false) }
  }

  const handleQuickExpense = (label: string, amount: number) => {
    setNewType('EXPENSE'); setNewAmount(amount.toString()); setNewDescription(label)
  }

  const navigateMonth = (direction: number) => {
    const [year, mon] = month.split('-').map(Number)
    const d = new Date(year, mon - 1 + direction, 1)
    setMonth(`${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`)
  }

  const openEditDialog = (tx: Transaction) => {
    setEditingTx(tx); setEditType(tx.type as 'INCOME' | 'EXPENSE'); setEditAmount(tx.amount.toString())
    setEditCategoryId(tx.categoryId); setEditDescription(tx.description ?? '')
    setEditDate(tx.date.split('T')[0]); setEditNote(tx.note ?? ''); setShowEditDialog(true)
  }

  const handleEditSubmit = async () => {
    if (!editingTx || !editAmount || !editCategoryId || !editDate) return
    setIsEditSubmitting(true); toast.dismiss()
    try {
      const res = await fetch(`/api/finance/${editingTx.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: editType, amount: parseFloat(editAmount), categoryId: editCategoryId, description: editDescription || undefined, date: editDate, note: editNote || undefined }),
      })
      if (res.ok) { toast.success('Транзакция обновлена'); setShowEditDialog(false); setEditingTx(null); fetchData() }
      else { toast.error('Ошибка при обновлении транзакции') }
    } catch (err) { console.error('Failed to update transaction:', err); toast.error('Ошибка: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка')) }
    finally { setIsEditSubmitting(false) }
  }

  // ─── Render ────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-10 -left-10 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -top-4 right-20 h-24 w-24 rounded-full bg-gradient-to-br from-amber-400/15 to-orange-500/15 blur-3xl" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">Финансы</h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  <Filter className="h-3 w-3" />{monthLabel}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Учёт доходов и расходов</p>
            </div>
          </div>
          <Button size="sm" className="gap-1.5" onClick={() => setShowNewDialog(true)}>
            <Plus className="h-4 w-4" />Добавить
          </Button>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-2">
        <Button variant="ghost" size="sm" onClick={() => navigateMonth(-1)} className="h-8 w-8 p-0">&larr;</Button>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium capitalize">{monthLabel}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigateMonth(1)} className="h-8 w-8 p-0">&rarr;</Button>
      </div>

      <SummaryCards stats={stats} isLoading={isLoading} />

      {/* Chart + Category Breakdown */}
      <div className="grid gap-4 lg:grid-cols-3">
        <ExpenseChart chartData={chartData} isLoading={isLoading} />
        <CategoryBreakdown stats={stats} isLoading={isLoading} />
      </div>

      {!isLoading && spendingInsights && (
        <AnalyticsSection spendingInsights={spendingInsights} getCategoryForTx={getCategoryForTx} />
      )}

      <TransactionList
        groupedTransactions={groupedTransactions}
        activeTab={activeTab}
        isLoading={isLoading}
        onTabChange={setActiveTab}
        onEdit={openEditDialog}
        onAddNew={() => setShowNewDialog(true)}
      />

      {/* Dialogs */}
      <AddTransactionDialog
        open={showNewDialog}
        onOpenChange={setShowNewDialog}
        newType={newType}
        newAmount={newAmount}
        newCategoryId={newCategoryId}
        newDescription={newDescription}
        newDate={newDate}
        newNote={newNote}
        isSubmitting={isSubmitting}
        categories={filteredCategories}
        onNewTypeChange={setNewType}
        onNewAmountChange={setNewAmount}
        onNewCategoryIdChange={setNewCategoryId}
        onNewDescriptionChange={setNewDescription}
        onNewDateChange={setNewDate}
        onNewNoteChange={setNewNote}
        onQuickExpense={handleQuickExpense}
        onSubmit={handleSubmit}
      />
      <EditTransactionDialog
        open={showEditDialog}
        onOpenChange={(open) => { setShowEditDialog(open); if (!open) setEditingTx(null) }}
        editType={editType}
        editAmount={editAmount}
        editCategoryId={editCategoryId}
        editDescription={editDescription}
        editDate={editDate}
        editNote={editNote}
        isSubmitting={isEditSubmitting}
        categories={editFilteredCategories}
        onEditTypeChange={setEditType}
        onEditAmountChange={setEditAmount}
        onEditCategoryIdChange={setEditCategoryId}
        onEditDescriptionChange={setEditDescription}
        onEditDateChange={setEditDate}
        onEditNoteChange={setEditNote}
        onSubmit={handleEditSubmit}
      />
    </div>
  )
}
