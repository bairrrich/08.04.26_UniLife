'use client'

import {
  Dialog,
  DialogContent,
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
import { ArrowUpRight, ArrowDownRight, Plus, UtensilsCrossed, Car, TrainFront, Coffee } from 'lucide-react'
import { QUICK_EXPENSES } from './constants'
import type { Category } from './types'

// ─── Transaction Dialog Form (shared logic) ─────────────────────────────────

function TransactionForm({
  txType,
  amount,
  categoryId,
  description,
  date,
  note,
  categories,
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
}: {
  txType: 'INCOME' | 'EXPENSE'
  amount: string
  categoryId: string
  description: string
  date: string
  note: string
  categories: Category[]
  isSubmitting: boolean
  submitLabel: string
  onTypeChange: (type: 'INCOME' | 'EXPENSE') => void
  onAmountChange: (val: string) => void
  onCategoryIdChange: (val: string) => void
  onDescriptionChange: (val: string) => void
  onDateChange: (val: string) => void
  onNoteChange: (val: string) => void
  onSubmit: () => void
  showQuickExpenses?: boolean
  onQuickExpense?: (label: string, amount: number) => void
}) {
  return (
    <div className="space-y-4 pt-2">
      {/* Type Toggle */}
      <div className="space-y-2">
        <Label>Тип</Label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant={txType === 'EXPENSE' ? 'default' : 'outline'}
            className={txType === 'EXPENSE' ? 'bg-red-500 hover:bg-red-600 text-white' : ''}
            onClick={() => { onTypeChange('EXPENSE'); onCategoryIdChange('') }}
          >
            <ArrowDownRight className="mr-1 h-4 w-4" />
            Расход
          </Button>
          <Button
            type="button"
            variant={txType === 'INCOME' ? 'default' : 'outline'}
            className={txType === 'INCOME' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : ''}
            onClick={() => { onTypeChange('INCOME'); onCategoryIdChange('') }}
          >
            <ArrowUpRight className="mr-1 h-4 w-4" />
            Доход
          </Button>
        </div>
      </div>

      {/* Quick Expense Presets */}
      {showQuickExpenses && txType === 'EXPENSE' && onQuickExpense && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Быстрый расход</Label>
          <div className="grid grid-cols-2 gap-2">
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
        <Input type="number" placeholder="0" min="0" step="0.01" value={amount} onChange={(e) => onAmountChange(e.target.value)} />
      </div>

      {/* Category */}
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

      {/* Description */}
      <div className="space-y-2">
        <Label>Описание</Label>
        <Input placeholder="Например: обед в кафе" value={description} onChange={(e) => onDescriptionChange(e.target.value)} />
      </div>

      {/* Date */}
      <div className="space-y-2">
        <Label>Дата</Label>
        <Input type="date" value={date} onChange={(e) => onDateChange(e.target.value)} />
      </div>

      {/* Note */}
      <div className="space-y-2">
        <Label>Заметка</Label>
        <Textarea placeholder="Необязательная заметка..." value={note} onChange={(e) => onNoteChange(e.target.value)} rows={2} />
      </div>

      {/* Submit */}
      <Button className="w-full" onClick={onSubmit} disabled={isSubmitting || !amount || !categoryId || !date}>
        {isSubmitting ? 'Сохранение...' : submitLabel}
      </Button>
    </div>
  )
}

// ─── Add Transaction Dialog ─────────────────────────────────────────────────

interface AddTransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  newType: 'INCOME' | 'EXPENSE'
  newAmount: string
  newCategoryId: string
  newDescription: string
  newDate: string
  newNote: string
  isSubmitting: boolean
  categories: Category[]
  onNewTypeChange: (type: 'INCOME' | 'EXPENSE') => void
  onNewAmountChange: (val: string) => void
  onNewCategoryIdChange: (val: string) => void
  onNewDescriptionChange: (val: string) => void
  onNewDateChange: (val: string) => void
  onNewNoteChange: (val: string) => void
  onQuickExpense: (label: string, amount: number) => void
  onSubmit: () => void
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
  onNewTypeChange,
  onNewAmountChange,
  onNewCategoryIdChange,
  onNewDescriptionChange,
  onNewDateChange,
  onNewNoteChange,
  onQuickExpense,
  onSubmit,
}: AddTransactionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Новая транзакция</DialogTitle>
        </DialogHeader>
        <TransactionForm
          txType={newType}
          amount={newAmount}
          categoryId={newCategoryId}
          description={newDescription}
          date={newDate}
          note={newNote}
          categories={categories}
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
        />
      </DialogContent>
    </Dialog>
  )
}

// ─── Edit Transaction Dialog ────────────────────────────────────────────────

interface EditTransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editType: 'INCOME' | 'EXPENSE'
  editAmount: string
  editCategoryId: string
  editDescription: string
  editDate: string
  editNote: string
  isSubmitting: boolean
  categories: Category[]
  onEditTypeChange: (type: 'INCOME' | 'EXPENSE') => void
  onEditAmountChange: (val: string) => void
  onEditCategoryIdChange: (val: string) => void
  onEditDescriptionChange: (val: string) => void
  onEditDateChange: (val: string) => void
  onEditNoteChange: (val: string) => void
  onSubmit: () => void
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
  onEditTypeChange,
  onEditAmountChange,
  onEditCategoryIdChange,
  onEditDescriptionChange,
  onEditDateChange,
  onEditNoteChange,
  onSubmit,
}: EditTransactionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Редактирование транзакции</DialogTitle>
        </DialogHeader>
        <TransactionForm
          txType={editType}
          amount={editAmount}
          categoryId={editCategoryId}
          description={editDescription}
          date={editDate}
          note={editNote}
          categories={categories}
          isSubmitting={isSubmitting}
          submitLabel="Сохранить изменения"
          onTypeChange={onEditTypeChange}
          onAmountChange={onEditAmountChange}
          onCategoryIdChange={onEditCategoryIdChange}
          onDescriptionChange={onEditDescriptionChange}
          onDateChange={onEditDateChange}
          onNoteChange={onEditNoteChange}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  )
}
