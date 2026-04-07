'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { getCurrentMonthStr } from '@/lib/format'
import { toast } from 'sonner'

import type { Transaction, Category, Account, StatsResponse, ChartDataPoint, Investment, InvestmentsResponse, SavingsGoal, RecurringTransaction } from './types'

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
  const [accounts, setAccounts] = useState<Account[]>([])
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [previousMonthStats, setPreviousMonthStats] = useState<StatsResponse | null>(null)
  const [investmentsData, setInvestmentsData] = useState<InvestmentsResponse | null>(null)
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([])
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([])
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [month, setMonth] = useState(getCurrentMonthStr())
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  // New transaction form
  const [newType, setNewType] = useState<'INCOME' | 'EXPENSE' | 'TRANSFER'>('EXPENSE')
  const [newAmount, setNewAmount] = useState('')
  const [newCategoryId, setNewCategoryId] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0])
  const [newNote, setNewNote] = useState('')
  const [newFromAccountId, setNewFromAccountId] = useState('')
  const [newToAccountId, setNewToAccountId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Edit transaction
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingTx, setEditingTx] = useState<Transaction | null>(null)
  const [editType, setEditType] = useState<'INCOME' | 'EXPENSE' | 'TRANSFER'>('EXPENSE')
  const [editAmount, setEditAmount] = useState('')
  const [editCategoryId, setEditCategoryId] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editDate, setEditDate] = useState('')
  const [editNote, setEditNote] = useState('')
  const [editFromAccountId, setEditFromAccountId] = useState('')
  const [editToAccountId, setEditToAccountId] = useState('')
  const [isEditSubmitting, setIsEditSubmitting] = useState(false)

  // Refs for stable callback access to frequently-changing form state
  const newFormRef = useRef({ type: newType, amount: newAmount, categoryId: newCategoryId, description: newDescription, date: newDate, note: newNote, fromAccountId: newFromAccountId, toAccountId: newToAccountId, categories })
  newFormRef.current = { type: newType, amount: newAmount, categoryId: newCategoryId, description: newDescription, date: newDate, note: newNote, fromAccountId: newFromAccountId, toAccountId: newToAccountId, categories }

  const editFormRef = useRef({ tx: editingTx, type: editType, amount: editAmount, categoryId: editCategoryId, description: editDescription, date: editDate, note: editNote, fromAccountId: editFromAccountId, toAccountId: editToAccountId })
  editFormRef.current = { tx: editingTx, type: editType, amount: editAmount, categoryId: editCategoryId, description: editDescription, date: editDate, note: editNote, fromAccountId: editFromAccountId, toAccountId: editToAccountId }

  // ─── Stable data fetchers (minimal deps) ──────────────────────
  const fetchSavingsGoals = useCallback(async () => {
    try {
      const res = await fetch('/api/finance/savings-goals')
      if (res.ok) { const d = await res.json(); setSavingsGoals(d.data || []) }
    } catch (err) { console.error('Failed to fetch savings goals:', err) }
  }, [])

  const fetchRecurringTransactions = useCallback(async () => {
    try {
      const res = await fetch('/api/finance/recurring')
      if (res.ok) { const d = await res.json(); setRecurringTransactions(d.data || []) }
    } catch (err) { console.error('Failed to fetch recurring transactions:', err) }
  }, [])

  // ─── Data Fetching ─────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [prevYear, prevMon] = month.split('-').map(Number)
      const prevDate = new Date(prevYear, prevMon - 2, 1)
      const prevMonthStr = `${prevDate.getFullYear()}-${(prevDate.getMonth() + 1).toString().padStart(2, '0')}`

      await Promise.allSettled([
        fetch(`/api/finance?month=${month}`).then(r => r.ok ? r.json() : null).then(d => { if (d) setTransactions(d.data || []) }),
        fetch('/api/finance/categories').then(r => r.ok ? r.json() : null).then(d => { if (d) setCategories(d.data || []) }),
        fetch(`/api/finance/stats?month=${month}`).then(r => r.ok ? r.json() : null).then(d => { if (d) setStats(d.data || null) }),
        fetch('/api/finance/accounts').then(r => r.ok ? r.json() : null).then(d => { if (d) setAccounts(d.data || []) }),
        fetch('/api/finance/investments').then(r => r.ok ? r.json() : null).then(d => { if (d) setInvestmentsData(d.data || null) }),
        fetchSavingsGoals(),
        fetchRecurringTransactions(),
        fetch(`/api/finance/stats?month=${prevMonthStr}`).then(r => r.ok ? r.json() : null).then(d => { if (d) setPreviousMonthStats(d.data || null); else setPreviousMonthStats(null) }),
      ])
    } catch (err) {
      console.error('Failed to fetch finance data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [month, fetchSavingsGoals, fetchRecurringTransactions])

  useEffect(() => { fetchData() }, [fetchData])

  // ─── Computed ──────────────────────────────────────────────────
  const filteredTransactions = useMemo(() => {
    let filtered = transactions
    if (activeTab === 'income') filtered = filtered.filter((t) => t.type === 'INCOME')
    else if (activeTab === 'expense') filtered = filtered.filter((t) => t.type === 'EXPENSE')
    else if (activeTab === 'transfer') filtered = filtered.filter((t) => t.type === 'TRANSFER')
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [transactions, activeTab])

  const groupedTransactions = useMemo(() => {
    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]
    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    const dayOfWeek = now.getDay()
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    const monday = new Date(now)
    monday.setDate(now.getDate() - mondayOffset)
    monday.setHours(0, 0, 0, 0)
    const mondayStr = monday.toISOString().split('T')[0]

    const map = new Map<string, Transaction[]>()
    filteredTransactions.forEach((tx) => {
      const dateKey = tx.date.split('T')[0]
      if (!map.has(dateKey)) map.set(dateKey, [])
      map.get(dateKey)!.push(tx)
    })

    const sortedKeys = Array.from(map.keys()).sort((a, b) => b.localeCompare(a))

    interface DateGroup {
      date: string
      label: string
      items: Transaction[]
      bucketSort: number
    }
    const dateGroups: DateGroup[] = []

    sortedKeys.forEach((dateKey) => {
      let label: string
      let bucketSort: number
      if (dateKey === todayStr) {
        label = 'Сегодня'
        bucketSort = 0
      } else if (dateKey === yesterdayStr) {
        label = 'Вчера'
        bucketSort = 1
      } else if (dateKey >= mondayStr) {
        label = 'Эта неделя'
        bucketSort = 2
      } else {
        label = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(dateKey))
        bucketSort = 3
      }
      dateGroups.push({
        date: dateKey,
        label,
        items: map.get(dateKey)!.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        bucketSort,
      })
    })

    const merged: { date: string; label: string; items: Transaction[] }[] = []
    let i = 0
    while (i < dateGroups.length) {
      const current = dateGroups[i]
      if (current.bucketSort < 3) {
        const allItems = [...current.items]
        let j = i + 1
        while (j < dateGroups.length && dateGroups[j].bucketSort === current.bucketSort) {
          allItems.push(...dateGroups[j].items)
          j++
        }
        merged.push({ date: current.date, label: current.label, items: allItems })
        i = j
      } else {
        merged.push({ date: current.date, label: current.label, items: current.items })
        i++
      }
    }

    return merged
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
        transfer: dayTx.filter((t) => t.type === 'TRANSFER').reduce((sum, t) => sum + t.amount, 0),
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

  const totalTransfers = useMemo(() => {
    return transactions.filter((t) => t.type === 'TRANSFER').reduce((s, t) => s + t.amount, 0)
  }, [transactions])

  const spendingInsights = useMemo((): SpendingInsights | null => {
    const expenses = transactions.filter((t) => t.type === 'EXPENSE')
    if (expenses.length === 0) return null
    const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0)
    const [selYear, selMon] = month.split('-').map(Number)
    const daysInSelectedMonth = new Date(selYear, selMon, 0).getDate()
    const now = new Date()
    const isCurrentMonth = selYear === now.getFullYear() && selMon === now.getMonth() + 1
    const daysElapsed = isCurrentMonth ? now.getDate() : daysInSelectedMonth
    const avgDaily = totalExpense / Math.max(daysElapsed, 1)
    const biggestExpense = expenses.reduce((max, t) => (t.amount > max.amount ? t : max), expenses[0])
    const top3 = (stats?.byCategory || []).slice().sort((a, b) => b.total - a.total).slice(0, 3)
    return { avgDaily, biggestExpense, top3, totalExpense, daysInMonth: daysElapsed }
  }, [transactions, stats, month])

  // ─── Stable helper callbacks ───────────────────────────────────
  const getCategoryForTx = useCallback((tx: Transaction): Category => {
    return tx.category || categories.find((c) => c.id === tx.categoryId) || { id: '', name: 'Другое', type: 'EXPENSE', icon: 'circle', color: '#6b7280' }
  }, [categories])

  const getAccountName = useCallback((id: string): string => {
    return accounts.find((a) => a.id === id)?.name || 'Неизвестный счёт'
  }, [accounts])

  // ─── Stable action callbacks (use refs for form state) ────────
  const resetForm = useCallback(() => {
    setNewType('EXPENSE'); setNewAmount(''); setNewCategoryId(''); setNewDescription('')
    setNewDate(new Date().toISOString().split('T')[0]); setNewNote('')
    setNewFromAccountId(''); setNewToAccountId('')
  }, [])

  const handleSubmit = useCallback(async () => {
    const f = newFormRef.current
    const amount = parseFloat(f.amount)
    if (!amount || amount <= 0) { toast.error('Сумма должна быть больше нуля'); return }
    if (!f.date) return
    if (f.type === 'TRANSFER' && (!f.fromAccountId || !f.toAccountId)) return
    if (f.type !== 'TRANSFER' && !f.categoryId) return
    setIsSubmitting(true); toast.dismiss()
    try {
      const payload: Record<string, unknown> = {
        type: f.type,
        amount,
        date: f.date,
        description: f.description || undefined,
        note: f.note || undefined,
      }
      if (f.type === 'TRANSFER') {
        payload.fromAccountId = f.fromAccountId
        payload.toAccountId = f.toAccountId
        const transferCat = f.categories.find((c) => c.type === 'TRANSFER')
        payload.categoryId = transferCat?.id || ''
      } else {
        payload.categoryId = f.categoryId
      }
      const res = await fetch('/api/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) { toast.success('Транзакция добавлена'); setShowNewDialog(false); resetForm(); fetchData() }
      else { toast.error('Ошибка при добавлении транзакции') }
    } catch (err) { console.error('Failed to create transaction:', err); toast.error('Ошибка: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка')) }
    finally { setIsSubmitting(false) }
  }, [fetchData, resetForm])

  const handleEditSubmit = useCallback(async () => {
    const f = editFormRef.current
    if (!f.tx || !f.amount || !f.date) return
    setIsEditSubmitting(true); toast.dismiss()
    try {
      const payload: Record<string, unknown> = {
        type: f.type,
        amount: parseFloat(f.amount),
        date: f.date,
        description: f.description || undefined,
        note: f.note || undefined,
      }
      if (f.type === 'TRANSFER') {
        payload.fromAccountId = f.fromAccountId
        payload.toAccountId = f.toAccountId
      } else {
        payload.categoryId = f.categoryId
      }
      const res = await fetch(`/api/finance/${f.tx.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) { toast.success('Транзакция обновлена'); setShowEditDialog(false); setEditingTx(null); fetchData() }
      else { toast.error('Ошибка при обновлении транзакции') }
    } catch (err) { console.error('Failed to update transaction:', err); toast.error('Ошибка: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка')) }
    finally { setIsEditSubmitting(false) }
  }, [fetchData])

  const handleQuickExpense = useCallback((label: string, amount: number) => {
    setNewType('EXPENSE'); setNewAmount(amount.toString()); setNewDescription(label)
  }, [])

  const navigateMonth = useCallback((direction: number) => {
    setMonth(prev => {
      const [year, mon] = prev.split('-').map(Number)
      const d = new Date(year, mon - 1 + direction, 1)
      return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`
    })
  }, [])

  const goToToday = useCallback(() => {
    setMonth(getCurrentMonthStr())
  }, [])

  const openEditDialog = useCallback((tx: Transaction) => {
    setEditingTx(tx)
    setEditType(tx.type as 'INCOME' | 'EXPENSE' | 'TRANSFER')
    setEditAmount(tx.amount.toString())
    setEditCategoryId(tx.categoryId)
    setEditDescription(tx.description ?? '')
    setEditDate(tx.date.split('T')[0])
    setEditNote(tx.note ?? '')
    setEditFromAccountId(tx.fromAccountId ?? '')
    setEditToAccountId(tx.toAccountId ?? '')
    setShowEditDialog(true)
  }, [])

  const handleDuplicate = useCallback((tx: Transaction) => {
    setNewType(tx.type as 'INCOME' | 'EXPENSE' | 'TRANSFER')
    setNewAmount(tx.amount.toString())
    setNewCategoryId(tx.categoryId)
    setNewDescription(tx.description ? `${tx.description} (копия)` : 'Копия')
    setNewDate(new Date().toISOString().split('T')[0])
    setNewNote(tx.note ?? '')
    setNewFromAccountId(tx.fromAccountId ?? '')
    setNewToAccountId(tx.toAccountId ?? '')
    setShowNewDialog(true)
  }, [])

  const handleDelete = useCallback(async (txId: string) => {
    toast.dismiss()
    try {
      const res = await fetch(`/api/finance/${txId}`, { method: 'DELETE' })
      if (res.ok) { toast.success('Транзакция удалена'); fetchData() }
      else { toast.error('Ошибка при удалении транзакции') }
    } catch (err) { console.error('Failed to delete transaction:', err); toast.error('Ошибка: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка')) }
  }, [fetchData])

  // ─── Stable account callbacks ─────────────────────────────────
  const createAccount = useCallback(async (data: { name: string; type: string; icon?: string; color?: string; balance?: number }) => {
    try {
      const res = await fetch('/api/finance/accounts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
      })
      if (res.ok) { toast.success('Счёт создан'); fetchData(); return await res.json() }
      else { toast.error('Ошибка создания счёта'); return null }
    } catch { toast.error('Ошибка'); return null }
  }, [fetchData])

  const deleteAccount = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/finance/accounts/${id}`, { method: 'DELETE' })
      if (res.ok) { toast.success('Счёт удалён'); fetchData() }
      else { toast.error('Ошибка удаления счёта') }
    } catch { toast.error('Ошибка') }
  }, [fetchData])

  // ─── Stable investment callbacks ───────────────────────────────
  const createInvestment = useCallback(async (data: { name: string; type: string; icon?: string; color?: string; targetAmount?: number; description?: string }) => {
    try {
      const res = await fetch('/api/finance/investments', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
      })
      if (res.ok) { toast.success('Инвестиция добавлена'); fetchData(); return await res.json() }
      else { toast.error('Ошибка'); return null }
    } catch { toast.error('Ошибка'); return null }
  }, [fetchData])

  const deleteInvestment = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/finance/investments/${id}`, { method: 'DELETE' })
      if (res.ok) { toast.success('Инвестиция удалена'); fetchData() }
      else { toast.error('Ошибка') }
    } catch { toast.error('Ошибка') }
  }, [fetchData])

  const addInvestmentTx = useCallback(async (investmentId: string, data: { type: string; amount: number; units?: number; pricePerUnit?: number; date: string; note?: string }) => {
    try {
      const res = await fetch(`/api/finance/investments/${investmentId}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
      })
      if (res.ok) { toast.success('Операция добавлена'); fetchData(); return await res.json() }
      else { toast.error('Ошибка'); return null }
    } catch { toast.error('Ошибка'); return null }
  }, [fetchData])

  const deleteInvestmentTx = useCallback(async (investmentId: string, txId: string) => {
    toast.dismiss()
    try {
      const res = await fetch(`/api/finance/investments/${investmentId}/tx/${txId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      if (!json.success) { toast.error('Ошибка удаления'); return }
      toast.success('Транзакция удалена')
      fetchData()
    } catch {
      toast.error('Ошибка удаления транзакции')
    }
  }, [fetchData])

  // ─── Stable savings goal callbacks ─────────────────────────────
  const createSavingsGoal = useCallback(async (data: { name: string; targetAmount: number; icon?: string; color?: string; deadline?: string; description?: string }) => {
    try {
      const res = await fetch('/api/finance/savings-goals', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
      })
      if (res.ok) { toast.success('Цель накопления создана'); fetchSavingsGoals(); return await res.json() }
      else { toast.error('Ошибка создания цели'); return null }
    } catch { toast.error('Ошибка'); return null }
  }, [fetchSavingsGoals])

  const updateSavingsGoal = useCallback(async (id: string, data: Partial<SavingsGoal>) => {
    try {
      const res = await fetch(`/api/finance/savings-goals/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
      })
      if (res.ok) { toast.success('Цель обновлена'); fetchSavingsGoals(); return await res.json() }
      else { toast.error('Ошибка обновления цели'); return null }
    } catch { toast.error('Ошибка'); return null }
  }, [fetchSavingsGoals])

  const deleteSavingsGoal = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/finance/savings-goals/${id}`, { method: 'DELETE' })
      if (res.ok) { toast.success('Цель удалена'); fetchSavingsGoals() }
      else { toast.error('Ошибка удаления цели') }
    } catch { toast.error('Ошибка') }
  }, [fetchSavingsGoals])

  const addFundsToSavingsGoal = useCallback(async (id: string, amount: number) => {
    try {
      const res = await fetch(`/api/finance/savings-goals`)
      if (!res.ok) { toast.error('Ошибка'); return }
      const goals = await res.json() as { data: SavingsGoal[] }
      const goal = goals.data?.find(g => g.id === id)
      if (!goal) return
      const updateRes = await fetch(`/api/finance/savings-goals/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentAmount: goal.currentAmount + amount }),
      })
      if (updateRes.ok) { toast.success(`+${amount.toLocaleString('ru-RU')} ₽ добавлено`); fetchSavingsGoals() }
      else { toast.error('Ошибка пополнения') }
    } catch { toast.error('Ошибка') }
  }, [fetchSavingsGoals])

  // ─── Stable recurring transaction callbacks ────────────────────
  const createRecurring = useCallback(async (data: { type: string; amount: number; categoryId: string; description?: string; note?: string; frequency: string; startDate?: string }) => {
    try {
      const res = await fetch('/api/finance/recurring', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
      })
      if (res.ok) { toast.success('Повторяющаяся транзакция создана'); fetchRecurringTransactions(); return await res.json() }
      else { toast.error('Ошибка создания'); return null }
    } catch { toast.error('Ошибка'); return null }
  }, [fetchRecurringTransactions])

  const updateRecurring = useCallback(async (id: string, data: Partial<RecurringTransaction>) => {
    try {
      const res = await fetch(`/api/finance/recurring/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
      })
      if (res.ok) { toast.success('Обновлено'); fetchRecurringTransactions(); return await res.json() }
      else { toast.error('Ошибка обновления'); return null }
    } catch { toast.error('Ошибка'); return null }
  }, [fetchRecurringTransactions])

  const deleteRecurring = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/finance/recurring/${id}`, { method: 'DELETE' })
      if (res.ok) { toast.success('Удалено'); fetchRecurringTransactions() }
      else { toast.error('Ошибка удаления') }
    } catch { toast.error('Ошибка') }
  }, [fetchRecurringTransactions])

  const executeRecurring = useCallback(async (id: string) => {
    try {
      const res = await fetch('/api/finance/recurring/execute', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recurringId: id }),
      })
      if (res.ok) { toast.success('Транзакция выполнена'); fetchData(); fetchRecurringTransactions(); return await res.json() }
      else { const err = await res.json(); toast.error(err.error || 'Ошибка выполнения'); return null }
    } catch { toast.error('Ошибка'); return null }
  }, [fetchData, fetchRecurringTransactions])

  return {
    // State
    transactions,
    categories,
    accounts,
    stats,
    previousMonthStats,
    investmentsData,
    showNewDialog,
    setShowNewDialog,
    month,
    isLoading,
    activeTab,
    setActiveTab,
    totalTransfers,
    // New form
    newType, newAmount, newCategoryId, newDescription, newDate, newNote, isSubmitting,
    newFromAccountId, newToAccountId,
    setNewType, setNewAmount, setNewCategoryId, setNewDescription, setNewDate, setNewNote,
    setNewFromAccountId, setNewToAccountId,
    // Edit
    showEditDialog, editingTx, editType, editAmount, editCategoryId, editDescription, editDate, editNote, isEditSubmitting,
    editFromAccountId, editToAccountId,
    setEditType, setEditAmount, setEditCategoryId, setEditDescription, setEditDate, setEditNote,
    setEditFromAccountId, setEditToAccountId,
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
    getAccountName,
    // Actions
    fetchData,
    handleSubmit,
    handleQuickExpense,
    navigateMonth,
    goToToday,
    openEditDialog,
    handleEditSubmit,
    handleDelete,
    handleDuplicate,
    resetForm,
    // Account actions
    createAccount,
    deleteAccount,
    // Investment actions
    createInvestment,
    deleteInvestment,
    addInvestmentTx,
    deleteInvestmentTx,
    // Savings goal actions
    savingsGoals,
    fetchSavingsGoals,
    createSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    addFundsToSavingsGoal,
    // Recurring transactions
    recurringTransactions,
    fetchRecurringTransactions,
    createRecurring,
    updateRecurring,
    deleteRecurring,
    executeRecurring,
  }
}
