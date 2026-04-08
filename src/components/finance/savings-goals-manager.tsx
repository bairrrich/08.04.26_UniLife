'use client'

import { useState, useMemo } from 'react'
import { Plus, Trash2, PiggyBank, Target, Pencil, Calendar, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useFinance } from './hooks'
import type { SavingsGoal } from './types'

const PRESET_EMOJIS = [
  '🐷', '🏖️', '💻', '🚗', '🏠', '🎓', '💍', '✈️',
  '🎮', '📱', '🎁', '🎸', '⚽', '📷', '💊', '👶',
]

const PRESET_COLORS = [
  '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6b7280',
]

function getDaysRemaining(deadline: string): number {
  const now = new Date()
  const dl = new Date(deadline)
  const diff = dl.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function SavingsGoalsManager() {
  const {
    savingsGoals,
    createSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    addFundsToSavingsGoal,
  } = useFinance()

  const [showCreate, setShowCreate] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Add funds dialog
  const [fundGoalId, setFundGoalId] = useState<string | null>(null)
  const [fundAmount, setFundAmount] = useState('')

  // Edit dialog
  const [editGoal, setEditGoal] = useState<SavingsGoal | null>(null)
  const [editName, setEditName] = useState('')
  const [editTarget, setEditTarget] = useState('')
  const [editDeadline, setEditDeadline] = useState('')
  const [editDescription, setEditDescription] = useState('')

  // Create form
  const [formName, setFormName] = useState('')
  const [formTarget, setFormTarget] = useState('')
  const [formDeadline, setFormDeadline] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formIcon, setFormIcon] = useState('🐷')
  const [formColor, setFormColor] = useState('#10b981')

  // Computed summaries
  const summaries = useMemo(() => {
    const totalTarget = savingsGoals.reduce((s, g) => s + g.targetAmount, 0)
    const totalSaved = savingsGoals.reduce((s, g) => s + g.currentAmount, 0)
    const progress = totalTarget > 0 ? Math.min(100, (totalSaved / totalTarget) * 100) : 0
    return { totalTarget, totalSaved, progress }
  }, [savingsGoals])

  const handleCreate = async () => {
    if (!formName.trim() || !formTarget) return
    await createSavingsGoal({
      name: formName.trim(),
      targetAmount: parseFloat(formTarget),
      icon: formIcon,
      color: formColor,
      deadline: formDeadline || undefined,
      description: formDescription || undefined,
    })
    setShowCreate(false)
    resetCreateForm()
  }

  const resetCreateForm = () => {
    setFormName('')
    setFormTarget('')
    setFormDeadline('')
    setFormDescription('')
    setFormIcon('🐷')
    setFormColor('#10b981')
  }

  const handleAddFunds = async () => {
    if (!fundGoalId || !fundAmount || parseFloat(fundAmount) <= 0) return
    await addFundsToSavingsGoal(fundGoalId, parseFloat(fundAmount))
    setFundGoalId(null)
    setFundAmount('')
  }

  const openEditDialog = (goal: SavingsGoal) => {
    setEditGoal(goal)
    setEditName(goal.name)
    setEditTarget(goal.targetAmount.toString())
    setEditDeadline(goal.deadline ? goal.deadline.split('T')[0] : '')
    setEditDescription(goal.description || '')
  }

  const handleEdit = async () => {
    if (!editGoal || !editName.trim() || !editTarget) return
    await updateSavingsGoal(editGoal.id, {
      name: editName.trim(),
      targetAmount: parseFloat(editTarget),
      deadline: editDeadline || null,
      description: editDescription || null,
    })
    setEditGoal(null)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await deleteSavingsGoal(deleteId)
    setDeleteId(null)
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {savingsGoals.length > 0 && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 stagger-children">
          <Card className="card-hover">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                  <Target className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Цель всего</p>
                  <p className="font-bold tabular-nums">{formatCurrency(summaries.totalTarget)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                  <PiggyBank className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Накоплено</p>
                  <p className="font-bold tabular-nums">{formatCurrency(summaries.totalSaved)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Общий прогресс</p>
                  <p className="font-bold tabular-nums">{summaries.progress.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Goals Grid */}
      {savingsGoals.length > 0 && (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 stagger-children">
          {savingsGoals.map((goal) => {
            const pct = goal.targetAmount > 0
              ? Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)
              : 0
            const isComplete = pct >= 100
            const daysLeft = goal.deadline ? getDaysRemaining(goal.deadline) : null

            return (
              <Card key={goal.id} className={cn('card-hover animate-slide-up', isComplete && 'border-emerald-200 dark:border-emerald-900')}>
                <CardContent className="p-4 space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{goal.icon}</span>
                      <div>
                        <p className="font-semibold">{goal.name}</p>
                        {isComplete && (
                          <Badge variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                            Достигнуто
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => openEditDialog(goal)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteId(goal.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="tabular-nums font-medium">{pct.toFixed(1)}%</span>
                      <span className="text-muted-foreground tabular-nums">
                        {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                      </span>
                    </div>
                    <Progress
                      value={pct}
                      className="h-2"
                    />
                  </div>

                  {/* Deadline */}
                  {daysLeft !== null && (
                    <div className={cn(
                      'flex items-center gap-1.5 text-xs',
                      daysLeft < 0 ? 'text-destructive' : daysLeft < 7 ? 'text-amber-600' : 'text-muted-foreground'
                    )}>
                      <Calendar className="h-3 w-3" />
                      {daysLeft < 0
                        ? `Просрочено на ${Math.abs(daysLeft)} дн.`
                        : daysLeft === 0
                          ? 'Дедлайн сегодня'
                          : `Осталось ${daysLeft} дн.`
                      }
                    </div>
                  )}

                  {/* Add Funds */}
                  {!isComplete && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-1.5"
                      onClick={() => { setFundGoalId(goal.id); setFundAmount('') }}
                    >
                      <Plus className="h-3.5 w-3.5" />Пополнить
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Empty State */}
      {savingsGoals.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-500/20 mb-3">
              <PiggyBank className="h-7 w-7 text-emerald-500" />
            </div>
            <p className="font-medium">Нет целей накопления</p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">Создайте цель, чтобы отслеживать прогресс накоплений</p>
            <Button size="sm" className="gap-1.5" onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4" />Создать цель
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Savings Goal Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Новая цель накопления</DialogTitle>
            <DialogDescription className="sr-only">Создание новой цели для накопления средств</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Название</Label>
              <Input
                placeholder="Например: Отпуск, Новый ноутбук"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Целевая сумма (₽)</Label>
              <Input
                type="number"
                placeholder="100000"
                value={formTarget}
                onChange={(e) => setFormTarget(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Дедлайн (необязательно)</Label>
              <Input
                type="date"
                value={formDeadline}
                onChange={(e) => setFormDeadline(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Описание (необязательно)</Label>
              <Textarea
                placeholder="Заметки о цели..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Иконка</Label>
              <div className="flex flex-wrap gap-2">
                {PRESET_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className={cn(
                      'h-8 w-8 rounded-lg text-lg flex items-center justify-center transition-all border',
                      formIcon === emoji ? 'border-primary bg-primary/10 scale-110' : 'border-transparent hover:bg-muted'
                    )}
                    onClick={() => setFormIcon(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Цвет</Label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={cn(
                      'h-7 w-7 rounded-full border-2 transition-all',
                      formColor === color ? 'scale-110 border-foreground' : 'border-transparent hover:scale-105'
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormColor(color)}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => { setShowCreate(false); resetCreateForm() }}>
                Отмена
              </Button>
              <Button onClick={handleCreate} disabled={!formName.trim() || !formTarget}>
                Создать
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Funds Dialog */}
      <Dialog open={!!fundGoalId} onOpenChange={(open) => { if (!open) setFundGoalId(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Пополнить цель</DialogTitle>
            <DialogDescription className="sr-only">Добавление средств на счёт цели накопления</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Сумма (₽)</Label>
              <Input
                type="number"
                placeholder="5000"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
                min="0"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setFundGoalId(null)}>
                Отмена
              </Button>
              <Button
                onClick={handleAddFunds}
                disabled={!fundAmount || parseFloat(fundAmount) <= 0}
              >
                Пополнить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editGoal} onOpenChange={(open) => { if (!open) setEditGoal(null) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Редактировать цель</DialogTitle>
            <DialogDescription className="sr-only">Редактирование параметров цели накопления</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Название</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Целевая сумма (₽)</Label>
              <Input
                type="number"
                value={editTarget}
                onChange={(e) => setEditTarget(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Дедлайн</Label>
              <Input
                type="date"
                value={editDeadline}
                onChange={(e) => setEditDeadline(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Описание</Label>
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setEditGoal(null)}>
                Отмена
              </Button>
              <Button onClick={handleEdit} disabled={!editName.trim() || !editTarget}>
                Сохранить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить цель накопления?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Все данные о накоплениях будут потеряны.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
