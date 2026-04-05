'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Repeat,
  Plus,
  Pencil,
  Trash2,
  Play,
  Calendar,
  TrendingUp,
  TrendingDown,
  CalendarClock,
  Clock,
} from 'lucide-react'
import { toast } from 'sonner'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
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

import { formatCurrency, getRelativeTime } from '@/lib/format'
import type { RecurringTransaction, Category } from './types'

// ─── Constants ────────────────────────────────────────────────────────────

const FREQUENCY_LABELS: Record<string, string> = {
  DAILY: 'Ежедневно',
  WEEKLY: 'Еженедельно',
  MONTHLY: 'Ежемесячно',
  YEARLY: 'Ежегодно',
}

const FREQUENCY_COLORS: Record<string, string> = {
  DAILY: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  WEEKLY: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  MONTHLY: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  YEARLY: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
}

const FREQUENCY_MONTHLY_MULT: Record<string, number> = {
  DAILY: 30,
  WEEKLY: 4.33,
  MONTHLY: 1,
  YEARLY: 1 / 12,
}

function estimateMonthlyAmount(amount: number, frequency: string): number {
  return amount * (FREQUENCY_MONTHLY_MULT[frequency] || 1)
}

function formatNextDate(dateStr: string): string {
  const date = new Date(dateStr)
  const today = new Date()
  const diffMs = date.getTime() - today.getTime()
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffDays < 0) return `Просрочено на ${Math.abs(diffDays)} д`
  if (diffDays === 0) return 'Сегодня'
  if (diffDays === 1) return 'Завтра'
  if (diffDays <= 7) return `Через ${diffDays} д`
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

// ─── Props ────────────────────────────────────────────────────────────────

interface RecurringManagerProps {
  recurringTransactions: RecurringTransaction[]
  categories: Category[]
  isLoading: boolean
  onCreateRecurring: (data: {
    type: string
    amount: number
    categoryId: string
    description?: string
    note?: string
    frequency: string
    startDate?: string
  }) => Promise<unknown>
  onUpdateRecurring: (id: string, data: Partial<RecurringTransaction>) => Promise<unknown>
  onDeleteRecurring: (id: string) => Promise<void>
  onExecuteRecurring: (id: string) => Promise<unknown>
}

// ─── Component ────────────────────────────────────────────────────────────

export function RecurringManager({
  recurringTransactions,
  categories,
  isLoading,
  onCreateRecurring,
  onUpdateRecurring,
  onDeleteRecurring,
  onExecuteRecurring,
}: RecurringManagerProps) {
  // ─── State ──────────────────────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Add dialog
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [addType, setAddType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE')
  const [addAmount, setAddAmount] = useState('')
  const [addCategoryId, setAddCategoryId] = useState('')
  const [addDescription, setAddDescription] = useState('')
  const [addNote, setAddNote] = useState('')
  const [addFrequency, setAddFrequency] = useState('MONTHLY')
  const [addStartDate, setAddStartDate] = useState(new Date().toISOString().split('T')[0])

  // Edit dialog
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<RecurringTransaction | null>(null)
  const [editAmount, setEditAmount] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editNote, setEditNote] = useState('')
  const [editFrequency, setEditFrequency] = useState('')

  // Delete dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletingItem, setDeletingItem] = useState<RecurringTransaction | null>(null)

  // Execute loading
  const [executingId, setExecutingId] = useState<string | null>(null)

  // ─── Computed ────────────────────────────────────────────────────────────
  const filteredCategories = useMemo(() => {
    return categories.filter((c) => c.type === addType)
  }, [categories, addType])

  const activeCount = useMemo(() => {
    return recurringTransactions.filter((r) => r.isActive).length
  }, [recurringTransactions])

  const estimatedMonthlyTotal = useMemo(() => {
    return recurringTransactions
      .filter((r) => r.isActive)
      .reduce((sum, r) => {
        const monthly = estimateMonthlyAmount(r.amount, r.frequency)
        return sum + (r.type === 'EXPENSE' ? -monthly : monthly)
      }, 0)
  }, [recurringTransactions])

  const getCategoryName = (item: RecurringTransaction): string => {
    return item.category?.name || categories.find((c) => c.id === item.categoryId)?.name || 'Другое'
  }

  const getCategoryColor = (item: RecurringTransaction): string => {
    return item.category?.color || categories.find((c) => c.id === item.categoryId)?.color || '#6b7280'
  }

  const getCategoryIcon = (item: RecurringTransaction): string => {
    return item.category?.icon || categories.find((c) => c.id === item.categoryId)?.icon || 'circle'
  }

  // ─── Handlers ────────────────────────────────────────────────────────────
  const handleAdd = async () => {
    if (!addAmount || !addCategoryId) return
    setIsSubmitting(true)
    toast.dismiss()
    try {
      const ok = await onCreateRecurring({
        type: addType,
        amount: parseFloat(addAmount),
        categoryId: addCategoryId,
        description: addDescription || undefined,
        note: addNote || undefined,
        frequency: addFrequency,
        startDate: addStartDate,
      })
      if (ok) {
        setShowAddDialog(false)
        resetAddForm()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetAddForm = () => {
    setAddType('EXPENSE')
    setAddAmount('')
    setAddCategoryId('')
    setAddDescription('')
    setAddNote('')
    setAddFrequency('MONTHLY')
    setAddStartDate(new Date().toISOString().split('T')[0])
  }

  const openEditDialog = (item: RecurringTransaction) => {
    setEditingItem(item)
    setEditAmount(item.amount.toString())
    setEditDescription(item.description ?? '')
    setEditNote(item.note ?? '')
    setEditFrequency(item.frequency)
    setShowEditDialog(true)
  }

  const handleEdit = async () => {
    if (!editingItem || !editAmount) return
    setIsSubmitting(true)
    toast.dismiss()
    try {
      await onUpdateRecurring(editingItem.id, {
        amount: parseFloat(editAmount),
        description: editDescription || null,
        note: editNote || null,
        frequency: editFrequency,
      })
      setShowEditDialog(false)
      setEditingItem(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  const openDeleteDialog = (item: RecurringTransaction) => {
    setDeletingItem(item)
    setShowDeleteDialog(true)
  }

  const handleDelete = async () => {
    if (!deletingItem) return
    toast.dismiss()
    try {
      await onDeleteRecurring(deletingItem.id)
      setShowDeleteDialog(false)
      setDeletingItem(null)
    } catch (err) {
      toast.error('Ошибка: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка'))
    }
  }

  const handleToggleActive = async (item: RecurringTransaction) => {
    toast.dismiss()
    try {
      await onUpdateRecurring(item.id, { isActive: !item.isActive })
    } catch (err) {
      toast.error('Ошибка: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка'))
    }
  }

  const handleExecute = async (id: string) => {
    setExecutingId(id)
    toast.dismiss()
    try {
      await onExecuteRecurring(id)
    } finally {
      setExecutingId(null)
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[76px] rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="card-hover">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                  <Repeat className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Активных</p>
                  <p className="text-lg font-bold tabular-nums">{activeCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${estimatedMonthlyTotal < 0 ? 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'}`}>
                  {estimatedMonthlyTotal < 0 ? <TrendingDown className="h-5 w-5" /> : <TrendingUp className="h-5 w-5" />}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Оценка / месяц</p>
                  <p className={`text-lg font-bold tabular-nums ${estimatedMonthlyTotal < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {formatCurrency(Math.abs(estimatedMonthlyTotal))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                  <CalendarClock className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Всего</p>
                  <p className="text-lg font-bold tabular-nums">{recurringTransactions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Повторяющиеся транзакции</h2>
        <Button size="sm" className="gap-1.5" onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4" />Добавить
        </Button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : recurringTransactions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-400/20 to-blue-500/20">
              <Repeat className="h-8 w-8 text-primary/60" />
            </div>
            <p className="mt-4 text-sm font-medium">Нет повторяющихся транзакций</p>
            <p className="mt-1 text-xs text-muted-foreground text-center max-w-xs">
              Создайте автоматические транзакции для регулярных платежей, подписок и доходов
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 gap-1.5"
              onClick={() => setShowAddDialog(true)}
            >
              <Plus className="h-4 w-4" />Создать
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 stagger-children">
          {recurringTransactions.map((item) => {
            const isOverdue = new Date(item.nextDate) < new Date() && item.isActive
            const catName = getCategoryName(item)
            const catColor = getCategoryColor(item)

            return (
              <Card key={item.id} className={`card-hover group ${!item.isActive ? 'opacity-60' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                        style={{
                          backgroundColor: `${catColor}20`,
                          color: catColor,
                        }}
                      >
                        {item.type === 'INCOME' ? '↑' : '↓'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm truncate">{item.description || catName}</p>
                          {!item.isActive && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Пауза</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{catName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <p className={`font-semibold text-sm tabular-nums ${item.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {item.type === 'INCOME' ? '+' : '-'}{formatCurrency(item.amount)}
                      </p>
                      <Badge className={`text-[10px] px-1.5 py-0 border-0 ${FREQUENCY_COLORS[item.frequency] || ''}`}>
                        {FREQUENCY_LABELS[item.frequency] || item.frequency}
                      </Badge>
                    </div>
                  </div>

                  {/* Bottom row: next date, estimated monthly, actions */}
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      {/* Next date */}
                      <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-rose-600 dark:text-rose-400 font-medium' : 'text-muted-foreground'}`}>
                        <Calendar className="h-3 w-3" />
                        <span>{formatNextDate(item.nextDate)}</span>
                      </div>

                      {/* Estimated monthly */}
                      <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>~{formatCurrency(estimateMonthlyAmount(item.amount, item.frequency))}/мес</span>
                      </div>

                      {/* Last executed */}
                      {item.lastExecuted && (
                        <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground">
                          <span>{getRelativeTime(item.lastExecuted)}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Active toggle */}
                      <Switch
                        checked={item.isActive}
                        onCheckedChange={() => handleToggleActive(item)}
                        className="scale-75"
                      />

                      {/* Execute button */}
                      {item.isActive && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-emerald-600"
                          onClick={() => handleExecute(item.id)}
                          disabled={executingId === item.id}
                          title="Выполнить сейчас"
                        >
                          <Play className={`h-3.5 w-3.5 ${executingId === item.id ? 'animate-pulse' : ''}`} />
                        </Button>
                      )}

                      {/* Edit & Delete */}
                      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => openEditDialog(item)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => openDeleteDialog(item)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* ─── Add Dialog ─────────────────────────────────────────────────── */}
      <Dialog open={showAddDialog} onOpenChange={(open) => { setShowAddDialog(open); if (!open) resetAddForm() }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Новая повторяющаяся транзакция</DialogTitle>
            <DialogDescription>
              Создайте автоматическую транзакцию, которая будет повторяться с заданной частотой
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Type toggle */}
            <div className="space-y-2">
              <Label>Тип</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={addType === 'EXPENSE' ? 'default' : 'outline'}
                  className={addType === 'EXPENSE' ? 'bg-rose-500 hover:bg-rose-600 text-white' : ''}
                  onClick={() => { setAddType('EXPENSE'); setAddCategoryId('') }}
                >
                  <TrendingDown className="h-4 w-4 mr-1.5" />Расход
                </Button>
                <Button
                  type="button"
                  variant={addType === 'INCOME' ? 'default' : 'outline'}
                  className={addType === 'INCOME' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : ''}
                  onClick={() => { setAddType('INCOME'); setAddCategoryId('') }}
                >
                  <TrendingUp className="h-4 w-4 mr-1.5" />Доход
                </Button>
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label>Сумма (₽)</Label>
              <Input
                type="number"
                placeholder="Например, 500"
                min="1"
                step="100"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Категория</Label>
              <Select value={addCategoryId} onValueChange={setAddCategoryId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Описание</Label>
              <Input
                placeholder="Например, Подписка Netflix"
                value={addDescription}
                onChange={(e) => setAddDescription(e.target.value)}
              />
            </div>

            {/* Frequency */}
            <div className="space-y-2">
              <Label>Частота</Label>
              <Select value={addFrequency} onValueChange={setAddFrequency}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(FREQUENCY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-2">
                        <Badge className={`text-[10px] px-1.5 py-0 border-0 ${FREQUENCY_COLORS[key]}`}>
                          {label}
                        </Badge>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Start date */}
            <div className="space-y-2">
              <Label>Дата начала</Label>
              <Input
                type="date"
                value={addStartDate}
                onChange={(e) => setAddStartDate(e.target.value)}
              />
            </div>

            {/* Note */}
            <div className="space-y-2">
              <Label>Заметка</Label>
              <Textarea
                placeholder="Необязательная заметка"
                value={addNote}
                onChange={(e) => setAddNote(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddDialog(false); resetAddForm() }}>Отмена</Button>
            <Button onClick={handleAdd} disabled={!addAmount || !addCategoryId || isSubmitting}>
              {isSubmitting ? 'Сохранение...' : 'Создать'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Edit Dialog ────────────────────────────────────────────────── */}
      <Dialog open={showEditDialog} onOpenChange={(open) => { setShowEditDialog(open); if (!open) setEditingItem(null) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Редактировать</DialogTitle>
            <DialogDescription>
              {editingItem ? `Измените параметры для «${editingItem.description || getCategoryName(editingItem)}»` : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Сумма (₽)</Label>
              <Input
                type="number"
                placeholder="Например, 500"
                min="1"
                step="100"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Описание</Label>
              <Input
                placeholder="Описание"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Частота</Label>
              <Select value={editFrequency} onValueChange={setEditFrequency}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(FREQUENCY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-2">
                        <Badge className={`text-[10px] px-1.5 py-0 border-0 ${FREQUENCY_COLORS[key]}`}>
                          {label}
                        </Badge>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Заметка</Label>
              <Textarea
                placeholder="Необязательная заметка"
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                rows={2}
              />
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

      {/* ─── Delete Dialog ──────────────────────────────────────────────── */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить повторяющуюся транзакцию?</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingItem
                ? `«${deletingItem.description || getCategoryName(deletingItem)}» будет удалено. Ранее созданные транзакции сохранятся.`
                : ''}
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
