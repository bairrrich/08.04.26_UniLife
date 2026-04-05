'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { getCurrentMonthStr } from '@/lib/format'
import { toast } from 'sonner'

import type { Transaction, Category, StatsResponse, ChartDataPoint } from './types'

export interface SpendingInsights {
  avgDaily: number
  biggestExpense: Transaction
  top3: { categoryId: string; categoryName: string; categoryColor: string; categoryIcon: string; total: number }[]
  totalExpense: number
  daysInMonth: number
}

export function useFinance() {
  // ─── State ────────────────────────────────────────────────────
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [previousMonthStats, setPreviousMonthStats] = useState<StatsResponse | null>(null)
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

      // Fetch previous month stats for % change comparison
      const [prevYear, prevMon] = month.split('-').map(Number)
      const prevDate = new Date(prevYear, prevMon - 2, 1)
      const prevMonthStr = `${prevDate.getFullYear()}-${(prevDate.getMonth() + 1).toString().padStart(2, '0')}`
      const prevStatsRes = await fetch(`/api/finance/stats?month=${prevMonthStr}`)
      if (prevStatsRes.ok) { const d = await prevStatsRes.json(); setPreviousMonthStats(d.data || null) } else { setPreviousMonthStats(null) }
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

  const spendingInsights = useMemo((): SpendingInsights | null => {
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

  const handleDelete = async (txId: string) => {
    toast.dismiss()
    try {
      const res = await fetch(`/api/finance/${txId}`, { method: 'DELETE' })
      if (res.ok) { toast.success('Транзакция удалена'); fetchData() }
      else { toast.error('Ошибка при удалении транзакции') }
    } catch (err) { console.error('Failed to delete transaction:', err); toast.error('Ошибка: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка')) }
  }

  return {
    // State
    transactions,
    categories,
    stats,
    previousMonthStats,
    showNewDialog,
    setShowNewDialog,
    month,
    isLoading,
    activeTab,
    setActiveTab,
    // New form
    newType, newAmount, newCategoryId, newDescription, newDate, newNote, isSubmitting,
    setNewType, setNewAmount, setNewCategoryId, setNewDescription, setNewDate, setNewNote,
    // Edit
    showEditDialog, editingTx, editType, editAmount, editCategoryId, editDescription, editDate, editNote, isEditSubmitting,
    setEditType, setEditAmount, setEditCategoryId, setEditDescription, setEditDate, setEditNote,
    setShowEditDialog: (open: boolean) => { setShowEditDialog(open); if (!open) setEditingTx(null) },
    // Computed
    filteredTransactions,
    groupedTransactions,
    chartData,
    filteredCategories,
    editFilteredCategories,
    monthLabel,
    spendingInsights,
    getCategoryForTx,
    // Actions
    fetchData,
    handleSubmit,
    handleQuickExpense,
    navigateMonth,
    openEditDialog,
    handleEditSubmit,
    handleDelete,
    resetForm,
  }
}
