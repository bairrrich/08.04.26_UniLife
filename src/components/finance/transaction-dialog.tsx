'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ArrowUpRight, ArrowDownRight, ArrowRightLeft, Plus, RefreshCw } from 'lucide-react'
import { QUICK_EXPENSES, getAccountIcon, ACCOUNT_TYPE_LABELS } from './constants'
import { cn } from '@/lib/utils'
import type { Category, Account } from './types'

// ─── Amount Presets ──────────────────────────────────────────────────────────

const AMOUNT_PRESETS = [100, 500, 1000, 3000, 5000, 10000]

// ─── Transaction Dialog Form (shared logic) ─────────────────────────────────

function TransactionForm({
  txType,
  amount,
  categoryId,
  description,
  date,
  note,
  categories,
  accounts,
  isSubmitting,
  submitLabel,
  onTypeChange,
  onAmountChange,
  onCategoryIdChange,
  onDescriptionChange,
  onDateChange,
  onNoteChange,
  onSubmit,
  showQuickExpenses,
  onQuickExpense,
  fromAccountId,
  toAccountId,
  onFromAccountIdChange,
  onToAccountIdChange,
}: {
  txType: 'INCOME' | 'EXPENSE' | 'TRANSFER'
  amount: string
  categoryId: string
  description: string
  date: string
  note: string
  categories: Category[]
  accounts: Account[]
  isSubmitting: boolean
  submitLabel: string
  onTypeChange: (type: 'INCOME' | 'EXPENSE' | 'TRANSFER') => void
  onAmountChange: (val: string) => void
  onCategoryIdChange: (val: string) => void
  onDescriptionChange: (val: string) => void
  onDateChange: (val: string) => void
  onNoteChange: (val: string) => void
  onSubmit: () => void
  showQuickExpenses?: boolean
  onQuickExpense?: (label: string, amount: number) => void
  fromAccountId: string
  toAccountId: string
  onFromAccountIdChange: (val: string) => void
  onToAccountIdChange: (val: string) => void
}) {
  const isTransfer = txType === 'TRANSFER'

  return (
    <div className="space-y-4 pt-2">
      {/* Type Toggle */}
      <div className="space-y-2">
        <Label>Тип</Label>
        <div className="grid grid-cols-3 gap-2">
          <Button
            type="button"
            variant={txType === 'EXPENSE' ? 'default' : 'outline'}
            className={txType === 'EXPENSE' ? 'bg-red-500 hover:bg-red-600 text-white' : ''}
            onClick={() => { onTypeChange('EXPENSE'); onCategoryIdChange('') }}
          >
            <ArrowDownRight className="mr-1 h-4 w-4" />
            <span className="hidden sm:inline">Расход</span>
            <span className="sm:hidden">−</span>
          </Button>
          <Button
            type="button"
            variant={txType === 'INCOME' ? 'default' : 'outline'}
            className={txType === 'INCOME' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : ''}
            onClick={() => { onTypeChange('INCOME'); onCategoryIdChange('') }}
          >
            <ArrowUpRight className="mr-1 h-4 w-4" />
            <span className="hidden sm:inline">Доход</span>
            <span className="sm:hidden">+</span>
          </Button>
          <Button
            type="button"
            variant={txType === 'TRANSFER' ? 'default' : 'outline'}
            className={txType === 'TRANSFER' ? 'bg-violet-500 hover:bg-violet-600 text-white' : ''}
            onClick={() => { onTypeChange('TRANSFER'); onCategoryIdChange('') }}
          >
            <ArrowRightLeft className="mr-1 h-4 w-4" />
            <span className="hidden sm:inline">Перевод</span>
            <span className="sm:hidden">⇄</span>
          </Button>
        </div>
      </div>

      {/* Quick Expense Presets — only for EXPENSE */}
      {showQuickExpenses && txType === 'EXPENSE' && onQuickExpense && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Быстрый расход</Label>
          <div className="grid grid-cols-3 gap-2">
            {QUICK_EXPENSES.map((preset) => (
              <Button
                key={preset.label}
                type="button"
                variant="outline"
                size="sm"
                className="h-auto py-2 flex-col gap-0.5 text-center hover:bg-muted/50"
                onClick={() => onQuickExpense(preset.label, preset.amount)}
              >
                <span className="text-muted-foreground">{preset.icon}</span>
                <span className="text-xs font-medium">{preset.label}</span>
                <span className="text-[11px] font-semibold text-muted-foreground">{preset.amount}₽</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Amount */}
      <div className="space-y-2">
        <Label>Сумма</Label>
        <Input type="number" placeholder="0" min="0" step="0.01" value={amount} onChange={(e) => onAmountChange(e.target.value)} autoFocus />
        {/* Amount Preset Chips */}
        <div className="flex flex-wrap gap-1.5">
          {AMOUNT_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onAmountChange(preset.toString())}
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-medium tabular-nums transition-colors",
                amount === preset.toString()
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {preset.toLocaleString('ru-RU')}₽
            </button>
          ))}
        </div>
      </div>

      {/* Transfer: From/To Account Selectors */}
      {isTransfer && (
        <div className="space-y-3 rounded-lg border border-violet-200 bg-violet-50/50 p-3 dark:border-violet-500/20 dark:bg-violet-500/5">
          <Label className="text-xs font-medium text-violet-700 dark:text-violet-400">Перевод между счетами</Label>
          <div className="space-y-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Откуда</Label>
              <Select value={fromAccountId} onValueChange={onFromAccountIdChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Выберите счёт" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      <span className="flex items-center gap-2">
                        <span style={{ color: acc.color }}>{getAccountIcon(acc.icon)}</span>
                        <span className="truncate">{acc.name}</span>
                        <span className="ml-auto text-[10px] text-muted-foreground tabular-nums">
                          {acc.balance.toLocaleString('ru-RU')}₽
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-center">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-500/20">
                <ArrowRightLeft className="h-3 w-3 text-violet-600 dark:text-violet-400" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Куда</Label>
              <Select value={toAccountId} onValueChange={onToAccountIdChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Выберите счёт" />
                </SelectTrigger>
                <SelectContent>
                  {accounts
                    .filter((a) => a.id !== fromAccountId)
                    .map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      <span className="flex items-center gap-2">
                        <span style={{ color: acc.color }}>{getAccountIcon(acc.icon)}</span>
                        <span className="truncate">{acc.name}</span>
                        <span className="ml-auto text-[10px] text-muted-foreground tabular-nums">
                          {acc.balance.toLocaleString('ru-RU')}₽
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Category — only for INCOME/EXPENSE */}
      {!isTransfer && (
        <div className="space-y-2">
          <Label>Категория</Label>
          <Select value={categoryId} onValueChange={onCategoryIdChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Выберите категорию" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  <span className="flex items-center gap-2">
                    <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    {cat.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Description */}
      <div className="space-y-2">
        <Label>Описание</Label>
        <Input placeholder={isTransfer ? 'Например: перевод на накопления' : 'Например: обед в кафе'} value={description} onChange={(e) => onDescriptionChange(e.target.value)} />
      </div>

      {/* Date */}
      <div className="space-y-2">
        <Label>Дата</Label>
        <Input type="date" value={date} onChange={(e) => onDateChange(e.target.value)} />
      </div>

      {/* Recurring toggle */}
      {!isTransfer && (
        <div className="space-y-3 rounded-lg border border-primary/10 bg-primary/5 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Повторяющаяся</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Создать повторяющуюся транзакцию можно на вкладке «Повторяющиеся»</p>
        </div>
      )}

      {/* Note */}
      <div className="space-y-2">
        <Label>Заметка</Label>
        <Textarea placeholder="Необязательная заметка..." value={note} onChange={(e) => onNoteChange(e.target.value)} rows={2} maxLength={200} />
        <span className={cn(
          'text-[10px] tabular-nums',
          note.length > 180 ? 'text-amber-500' : 'text-muted-foreground/50'
        )}>
          {note.length}/200
        </span>
      </div>

      {/* Submit */}
      <Button
        className="w-full"
        onClick={onSubmit}
        disabled={
          isSubmitting || !amount || !date ||
          (isTransfer ? (!fromAccountId || !toAccountId) : !categoryId)
        }
      >
        {isSubmitting ? 'Сохранение...' : submitLabel}
      </Button>
    </div>
  )
}

// ─── Add Transaction Dialog ─────────────────────────────────────────────────

interface AddTransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  newType: 'INCOME' | 'EXPENSE' | 'TRANSFER'
  newAmount: string
  newCategoryId: string
  newDescription: string
  newDate: string
  newNote: string
  isSubmitting: boolean
  categories: Category[]
  accounts: Account[]
  onNewTypeChange: (type: 'INCOME' | 'EXPENSE' | 'TRANSFER') => void
  onNewAmountChange: (val: string) => void
  onNewCategoryIdChange: (val: string) => void
  onNewDescriptionChange: (val: string) => void
  onNewDateChange: (val: string) => void
  onNewNoteChange: (val: string) => void
  onQuickExpense: (label: string, amount: number) => void
  onSubmit: () => void
  newFromAccountId: string
  newToAccountId: string
  onNewFromAccountIdChange: (val: string) => void
  onNewToAccountIdChange: (val: string) => void
}

export function AddTransactionDialog({
  open,
  onOpenChange,
  newType,
  newAmount,
  newCategoryId,
  newDescription,
  newDate,
  newNote,
  isSubmitting,
  categories,
  accounts,
  onNewTypeChange,
  onNewAmountChange,
  onNewCategoryIdChange,
  onNewDescriptionChange,
  onNewDateChange,
  onNewNoteChange,
  onQuickExpense,
  onSubmit,
  newFromAccountId,
  newToAccountId,
  onNewFromAccountIdChange,
  onNewToAccountIdChange,
}: AddTransactionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Новая транзакция</DialogTitle>
          <DialogDescription>Добавьте доход, расход или перевод</DialogDescription>
        </DialogHeader>
        <TransactionForm
          txType={newType}
          amount={newAmount}
          categoryId={newCategoryId}
          description={newDescription}
          date={newDate}
          note={newNote}
          categories={categories}
          accounts={accounts}
          isSubmitting={isSubmitting}
          submitLabel="Сохранить"
          onTypeChange={onNewTypeChange}
          onAmountChange={onNewAmountChange}
          onCategoryIdChange={onNewCategoryIdChange}
          onDescriptionChange={onNewDescriptionChange}
          onDateChange={onNewDateChange}
          onNoteChange={onNewNoteChange}
          onSubmit={onSubmit}
          showQuickExpenses
          onQuickExpense={onQuickExpense}
          fromAccountId={newFromAccountId}
          toAccountId={newToAccountId}
          onFromAccountIdChange={onNewFromAccountIdChange}
          onToAccountIdChange={onNewToAccountIdChange}
        />
      </DialogContent>
    </Dialog>
  )
}

// ─── Edit Transaction Dialog ────────────────────────────────────────────────

interface EditTransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editType: 'INCOME' | 'EXPENSE' | 'TRANSFER'
  editAmount: string
  editCategoryId: string
  editDescription: string
  editDate: string
  editNote: string
  isSubmitting: boolean
  categories: Category[]
  accounts: Account[]
  onEditTypeChange: (type: 'INCOME' | 'EXPENSE' | 'TRANSFER') => void
  onEditAmountChange: (val: string) => void
  onEditCategoryIdChange: (val: string) => void
  onEditDescriptionChange: (val: string) => void
  onEditDateChange: (val: string) => void
  onEditNoteChange: (val: string) => void
  onSubmit: () => void
  editFromAccountId: string
  editToAccountId: string
  onEditFromAccountIdChange: (val: string) => void
  onEditToAccountIdChange: (val: string) => void
}

export function EditTransactionDialog({
  open,
  onOpenChange,
  editType,
  editAmount,
  editCategoryId,
  editDescription,
  editDate,
  editNote,
  isSubmitting,
  categories,
  accounts,
  onEditTypeChange,
  onEditAmountChange,
  onEditCategoryIdChange,
  onEditDescriptionChange,
  onEditDateChange,
  onEditNoteChange,
  onSubmit,
  editFromAccountId,
  editToAccountId,
  onEditFromAccountIdChange,
  onEditToAccountIdChange,
}: EditTransactionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Редактирование транзакции</DialogTitle>
          <DialogDescription>Измените данные выбранной транзакции</DialogDescription>
        </DialogHeader>
        <TransactionForm
          txType={editType}
          amount={editAmount}
          categoryId={editCategoryId}
          description={editDescription}
          date={editDate}
          note={editNote}
          categories={categories}
          accounts={accounts}
          isSubmitting={isSubmitting}
          submitLabel="Сохранить изменения"
          onTypeChange={onEditTypeChange}
          onAmountChange={onEditAmountChange}
          onCategoryIdChange={onEditCategoryIdChange}
          onDescriptionChange={onEditDescriptionChange}
          onDateChange={onEditDateChange}
          onNoteChange={onEditNoteChange}
          onSubmit={onSubmit}
          fromAccountId={editFromAccountId}
          toAccountId={editToAccountId}
          onFromAccountIdChange={onEditFromAccountIdChange}
          onToAccountIdChange={onEditToAccountIdChange}
        />
      </DialogContent>
    </Dialog>
  )
}
