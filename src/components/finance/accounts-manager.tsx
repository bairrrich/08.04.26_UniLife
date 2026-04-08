'use client'

import { useState } from 'react'
import { Plus, Trash2, Wallet, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useFinance } from './hooks'
import { getAccountIcon, ACCOUNT_TYPE_LABELS } from './constants'

const PRESET_COLORS = [
  '#10b981', '#6b7280', '#3b82f6', '#8b5cf6', '#f59e0b',
  '#ef4444', '#ec4899', '#06b6d4', '#84cc16', '#f97316',
]

export function AccountsManager() {
  const { accounts, createAccount, deleteAccount } = useFinance()
  const [showCreate, setShowCreate] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Form state
  const [formName, setFormName] = useState('')
  const [formType, setFormType] = useState('CASH')
  const [formIcon, setFormIcon] = useState('wallet')
  const [formColor, setFormColor] = useState('#10b981')
  const [formBalance, setFormBalance] = useState('0')

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0)

  const handleCreate = async () => {
    if (!formName.trim()) return
    await createAccount({
      name: formName.trim(),
      type: formType,
      icon: formIcon,
      color: formColor,
      balance: parseFloat(formBalance) || 0,
    })
    setShowCreate(false)
    setFormName('')
    setFormType('CASH')
    setFormIcon('wallet')
    setFormColor('#10b981')
    setFormBalance('0')
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await deleteAccount(deleteId)
    setDeleteId(null)
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card className="border-dashed">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Общий баланс</p>
              <p className="text-xl font-bold tabular-nums">{formatCurrency(totalBalance)}</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            {accounts.length} {accounts.length === 1 ? 'счёт' : accounts.length < 5 ? 'счёта' : 'счетов'}
          </Badge>
        </CardContent>
      </Card>

      {/* Accounts Grid */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 stagger-children">
        {accounts.map((account) => (
          <Card key={account.id} className="card-hover relative">
            <CardContent className="p-4">
              {account.isDefault && (
                <div className="absolute top-2 right-2">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                </div>
              )}
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${account.color}20`, color: account.color }}
                >
                  {getAccountIcon(account.icon)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold truncate">{account.name}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {ACCOUNT_TYPE_LABELS[account.type] || account.type}
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <p className="font-bold tabular-nums">{formatCurrency(account.balance)}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{account.currency}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                  onClick={() => setDeleteId(account.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {accounts.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-500/20 mb-3">
              <Wallet className="h-7 w-7 text-emerald-500" />
            </div>
            <p className="font-medium">Нет счетов</p>
            <p className="text-sm text-muted-foreground mt-1">Создайте первый счёт для отслеживания баланса</p>
          </CardContent>
        </Card>
      )}

      {/* Create Account Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogTrigger asChild>
          <Button className="gap-1.5">
            <Plus className="h-4 w-4" />Новый счёт
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Новый счёт</DialogTitle>
            <DialogDescription className="sr-only">Создание нового финансового счёта</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Название</Label>
              <Input
                placeholder="Например: Тинькофф"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Тип</Label>
              <Select value={formType} onValueChange={setFormType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ACCOUNT_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Иконка</Label>
              <Select value={formIcon} onValueChange={setFormIcon}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['wallet', 'bank', 'piggy', 'trending', 'bitcoin', 'cash', 'chart', 'gem', 'card'].map((icon) => (
                    <SelectItem key={icon} value={icon} className="flex items-center gap-2">
                      <span className="flex items-center">{getAccountIcon(icon)}</span>
                      <span className="ml-2">{icon}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <div className="space-y-2">
              <Label>Начальный баланс</Label>
              <Input
                type="number"
                placeholder="0"
                value={formBalance}
                onChange={(e) => setFormBalance(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowCreate(false)}>
                Отмена
              </Button>
              <Button onClick={handleCreate} disabled={!formName.trim()}>
                Создать
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить счёт?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Все связанные данные будут потеряны.
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
