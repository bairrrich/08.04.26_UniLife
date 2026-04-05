'use client'

import { useState, useEffect, useCallback } from 'react'
import { Wallet, Plus, Pencil, Trash2, TrendingDown, TrendingUp, AlertTriangle, PiggyBank } from 'lucide-react'
import { toast } from 'sonner'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { formatCurrency } from '@/lib/format'
import type { Category } from './types'

// ─── Types ────────────────────────────────────────────────────────────────────

interface BudgetItem {
  id: string
  categoryId: string
  categoryName: string
  categoryIcon: string
  categoryColor: string
  amount: number
  spent: number
  period: string
  startDate: string
  endDate: string | null
  percentage: number
}

interface BudgetSummary {
  budgets: BudgetItem[]
  totalBudget: number
  totalSpent: number
  totalRemaining: number
  totalPercentage: number
}

interface BudgetManagerProps {
  month: string
  categories: Category[]
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function getProgressColor(pct: number): string {
  if (pct >= 90) return '[&>div]:bg-rose-500'
  if (pct >= 70) return '[&>div]:bg-amber-500'
  return '[&>div]:bg-emerald-500'
}

function getProgressTrack(pct: number): string {
  if (pct >= 90) return 'bg-rose-500/20'
  if (pct >= 70) return 'bg-amber-500/20'
  return 'bg-emerald-500/20'
}

function getBadgeVariant(pct: number): 'default' | 'secondary' | 'destructive' {
  if (pct >= 90) return 'destructive'
  if (pct >= 70) return 'secondary'
  return 'default'
}

function getPercentageLabel(pct: number): string {
  if (pct >= 90) return 'Превышен'
  return `${pct}%`
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BudgetManager({ month, categories }: BudgetManagerProps) {
  const [data, setData] = useState<BudgetSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Dialogs
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Add form
  const [addCategoryId, setAddCategoryId] = useState('')
  const [addAmount, setAddAmount] = useState('')

  // Edit form
  const [editingBudget, setEditingBudget] = useState<BudgetItem | null>(null)
  const [editAmount, setEditAmount] = useState('')

  // Delete
  const [deletingBudget, setDeletingBudget] = useState<BudgetItem | null>(null)

  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE')

  // ─── Fetch ─────────────────────────────────────────────────────────────────

  const fetchBudgets = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/budgets?month=${month}`)
      if (res.ok) {
        const json = await res.json()
        setData(json.data)
      }
    } catch (err) {
      console.error('Failed to fetch budgets:', err)
    } finally {
      setIsLoading(false)
    }
  }, [month])

  useEffect(() => { fetchBudgets() }, [fetchBudgets])

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleAdd = async () => {
    if (!addCategoryId || !addAmount) return
    setIsSubmitting(true)
    toast.dismiss()
    try {
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId: addCategoryId, amount: addAmount, month }),
      })
      if (res.ok) {
        toast.success('Бюджет добавлен')
        setShowAddDialog(false)
        setAddCategoryId('')
        setAddAmount('')
        fetchBudgets()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Ошибка при добавлении бюджета')
      }
    } catch (err) {
      toast.error('Ошибка: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = async () => {
    if (!editingBudget || !editAmount) return
    setIsSubmitting(true)
    toast.dismiss()
    try {
      const res = await fetch(`/api/budgets?id=${editingBudget.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: editAmount }),
      })
      if (res.ok) {
        toast.success('Бюджет обновлён')
        setShowEditDialog(false)
        setEditingBudget(null)
        setEditAmount('')
        fetchBudgets()
      } else {
        toast.error('Ошибка при обновлении бюджета')
      }
    } catch (err) {
      toast.error('Ошибка: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingBudget) return
    toast.dismiss()
    try {
      const res = await fetch(`/api/budgets?id=${deletingBudget.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Бюджет удалён')
        setShowDeleteDialog(false)
        setDeletingBudget(null)
        fetchBudgets()
      } else {
        toast.error('Ошибка при удалении бюджета')
      }
    } catch (err) {
      toast.error('Ошибка: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка'))
    }
  }

  const openEditDialog = (budget: BudgetItem) => {
    setEditingBudget(budget)
    setEditAmount(budget.amount.toString())
    setShowEditDialog(true)
  }

  const openDeleteDialog = (budget: BudgetItem) => {
    setDeletingBudget(budget)
    setShowDeleteDialog(true)
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      {!isLoading && data && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="card-hover">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                  <Wallet className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Бюджет</p>
                  <p className="text-lg font-bold tabular-nums truncate">{formatCurrency(data.totalBudget)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                  <TrendingDown className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Потрачено</p>
                  <p className="text-lg font-bold tabular-nums truncate">{formatCurrency(data.totalSpent)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                  {data.totalRemaining > 0 ? (
                    <PiggyBank className="h-5 w-5" />
                  ) : (
                    <AlertTriangle className="h-5 w-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{data.totalRemaining > 0 ? 'Остаток' : 'Превышение'}</p>
                  <p className={`text-lg font-bold tabular-nums truncate ${data.totalRemaining > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {formatCurrency(data.totalRemaining > 0 ? data.totalRemaining : data.totalSpent - data.totalBudget)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Loading skeletons for summary */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[76px] rounded-xl" />
          ))}
        </div>
      )}

      {/* Budget List */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Категории</h2>
        <Button size="sm" className="gap-1.5" onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4" />Добавить бюджет
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : !data || data.budgets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-500/20">
              <Wallet className="h-8 w-8 text-primary/60" />
            </div>
            <p className="mt-4 text-sm font-medium">Нет бюджетов</p>
            <p className="mt-1 text-xs text-muted-foreground text-center max-w-xs">
              Установите лимиты расходов по категориям, чтобы контролировать свои траты
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 gap-1.5"
              onClick={() => setShowAddDialog(true)}
            >
              <Plus className="h-4 w-4" />Добавить бюджет
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 stagger-children">
          {data.budgets.map((budget) => (
            <Card key={budget.id} className="card-hover group">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm"
                      style={{
                        backgroundColor: `${budget.categoryColor}20`,
                        color: budget.categoryColor,
                      }}
                    >
                      {budget.categoryIcon}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{budget.categoryName}</p>
                      <p className="text-xs text-muted-foreground tabular-nums">
                        {formatCurrency(budget.spent)} из {formatCurrency(budget.amount)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge variant={getBadgeVariant(budget.percentage)} className="tabular-nums text-xs">
                      {getPercentageLabel(budget.percentage)}
                    </Badge>
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => openEditDialog(budget)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => openDeleteDialog(budget)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <Progress
                    value={Math.min(budget.percentage, 100)}
                    className={`h-2 ${getProgressTrack(budget.percentage)} ${getProgressColor(budget.percentage)}`}
                  />
                </div>
                {budget.percentage >= 90 && budget.spent > budget.amount && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400">
                    <AlertTriangle className="h-3 w-3" />
                    Превышение на {formatCurrency(budget.spent - budget.amount)}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ─── Add Budget Dialog ─────────────────────────────────────────────── */}
      <Dialog open={showAddDialog} onOpenChange={(open) => { setShowAddDialog(open); if (!open) { setAddCategoryId(''); setAddAmount('') } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Новый бюджет</DialogTitle>
            <DialogDescription>
              Установите месячный лимит расходов для категории
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Категория</Label>
              <Select value={addCategoryId} onValueChange={setAddCategoryId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <span className="flex items-center gap-2">
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Месячный лимит (₽)</Label>
              <Input
                type="number"
                placeholder="Например, 15000"
                min="1"
                step="100"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Отмена</Button>
            <Button onClick={handleAdd} disabled={!addCategoryId || !addAmount || isSubmitting}>
              {isSubmitting ? 'Сохранение...' : 'Создать'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Edit Budget Dialog ────────────────────────────────────────────── */}
      <Dialog open={showEditDialog} onOpenChange={(open) => { setShowEditDialog(open); if (!open) { setEditingBudget(null); setEditAmount('') } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать бюджет</DialogTitle>
            <DialogDescription>
              {editingBudget && `Измените лимит для «${editingBudget.categoryName}»`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Новый месячный лимит (₽)</Label>
              <Input
                type="number"
                placeholder="Например, 15000"
                min="1"
                step="100"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
              />
              {editingBudget && (
                <p className="text-xs text-muted-foreground">
                  Потрачено: {formatCurrency(editingBudget.spent)} из {formatCurrency(editingBudget.amount)}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Отмена</Button>
            <Button onClick={handleEdit} disabled={!editAmount || isSubmitting}>
              {isSubmitting ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirmation ───────────────────────────────────────────── */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить бюджет?</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingBudget && `Бюджет для «${deletingBudget.categoryName}» будет удалён. Это действие нельзя отменить.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
