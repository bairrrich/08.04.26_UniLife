'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Plus, UtensilsCrossed, Pencil, X, Zap } from 'lucide-react'
import { MEAL_TYPE_ORDER, MEAL_TYPE_CONFIG, FOOD_PRESETS } from './constants'

// ─── Shared meal form item type ─────────────────────────────────────────────

export type MealFormItem = {
  name: string
  kcal: string
  protein: string
  fat: string
  carbs: string
}

const EMPTY_ITEM: MealFormItem = { name: '', kcal: '', protein: '', fat: '', carbs: '' }

// ─── Meal Items Form (shared between add and edit) ──────────────────────────

function MealItemsForm({
  mealType,
  mealItems,
  onMealTypeChange,
  onMealItemsChange,
  itemsLabel,
  note,
  onNoteChange,
  showPresets = false,
}: {
  mealType: string
  mealItems: MealFormItem[]
  onMealTypeChange: (val: string) => void
  onMealItemsChange: (items: MealFormItem[]) => void
  itemsLabel?: string
  note?: string
  onNoteChange?: (val: string) => void
  showPresets?: boolean
}) {
  const addItem = () => onMealItemsChange([...mealItems, { ...EMPTY_ITEM }])
  const removeItem = (index: number) => {
    if (mealItems.length <= 1) return
    onMealItemsChange(mealItems.filter((_, i) => i !== index))
  }
  const updateItem = (index: number, field: keyof MealFormItem, value: string) => {
    const updated = [...mealItems]
    updated[index] = { ...updated[index], [field]: value }
    onMealItemsChange(updated)
  }

  const applyPreset = (preset: typeof FOOD_PRESETS[number]) => {
    onMealItemsChange([{
      name: preset.name,
      kcal: String(preset.kcal),
      protein: String(preset.protein),
      fat: String(preset.fat),
      carbs: String(preset.carbs),
    }])
  }

  return (
    <div className="space-y-4 pt-2">
      {/* Meal type selector */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">Тип приёма</label>
        <Select value={mealType} onValueChange={onMealTypeChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Выбери тип приёма пищи" />
          </SelectTrigger>
          <SelectContent>
            {MEAL_TYPE_ORDER.map((type) => (
              <SelectItem key={type} value={type}>
                <span className="flex items-center gap-2">
                  <span>{MEAL_TYPE_CONFIG[type].emoji}</span>
                  <span>{MEAL_TYPE_CONFIG[type].label}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Quick food presets (only for add dialog) */}
      {showPresets && (
        <div>
          <div className="mb-2 flex items-center gap-1.5">
            <Zap className="size-3.5 text-amber-500" />
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Быстрый выбор</label>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {FOOD_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => applyPreset(preset)}
                className="inline-flex items-center gap-1 rounded-full border bg-muted/30 px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted/60 hover:border-muted-foreground/30 active-press"
              >
                <span>{preset.name}</span>
                <span className="text-muted-foreground">{preset.kcal} ккал</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Note (edit only) */}
      {onNoteChange !== undefined && (
        <div>
          <label className="mb-1.5 block text-sm font-medium">Заметка</label>
          <Textarea
            placeholder="Необязательная заметка..."
            value={note ?? ''}
            onChange={(e) => onNoteChange(e.target.value)}
            className="min-h-[60px] resize-none"
            rows={2}
          />
        </div>
      )}

      {/* Meal items */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium">{itemsLabel || 'Блюда / Продукты'}</label>
        </div>
        <div className="space-y-3">
          {mealItems.map((item, index) => (
            <div
              key={index}
              className="relative rounded-xl border bg-muted/30 p-3"
            >
              {mealItems.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="size-3.5" />
                </button>
              )}

              <div className="mb-2">
                <Input
                  placeholder="Название блюда"
                  value={item.name}
                  onChange={(e) => updateItem(index, 'name', e.target.value)}
                  className="h-9 border-0 bg-transparent shadow-none focus-visible:ring-0"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="mb-0.5 block text-[10px] font-medium text-orange-600 dark:text-orange-400 uppercase tracking-wider">Ккал</label>
                  <Input type="number" placeholder="0" value={item.kcal} onChange={(e) => updateItem(index, 'kcal', e.target.value)} className="h-8 text-center" />
                </div>
                <div>
                  <label className="mb-0.5 block text-[10px] font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">Белки</label>
                  <Input type="number" placeholder="0" value={item.protein} onChange={(e) => updateItem(index, 'protein', e.target.value)} className="h-8 text-center" />
                </div>
                <div>
                  <label className="mb-0.5 block text-[10px] font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider">Жиры</label>
                  <Input type="number" placeholder="0" value={item.fat} onChange={(e) => updateItem(index, 'fat', e.target.value)} className="h-8 text-center" />
                </div>
                <div>
                  <label className="mb-0.5 block text-[10px] font-medium text-green-600 dark:text-green-400 uppercase tracking-wider">Углев.</label>
                  <Input type="number" placeholder="0" value={item.carbs} onChange={(e) => updateItem(index, 'carbs', e.target.value)} className="h-8 text-center" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={addItem}
          className="mt-2 w-full gap-2 text-muted-foreground hover:text-foreground"
        >
          <Plus className="size-4" />
          Добавить блюдо
        </Button>
      </div>
    </div>
  )
}

// ─── Add Meal Dialog ───────────────────────────────────────────────────────

interface AddMealDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mealType: string
  mealItems: MealFormItem[]
  isSubmitting: boolean
  onMealTypeChange: (val: string) => void
  onMealItemsChange: (items: MealFormItem[]) => void
  onSubmit: () => void
}

export function AddMealDialog({
  open,
  onOpenChange,
  mealType,
  mealItems,
  isSubmitting,
  onMealTypeChange,
  onMealItemsChange,
  onSubmit,
}: AddMealDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UtensilsCrossed className="size-5 text-orange-500" />
            Добавить приём пищи
          </DialogTitle>
        </DialogHeader>

        <MealItemsForm
          mealType={mealType}
          mealItems={mealItems}
          onMealTypeChange={onMealTypeChange}
          onMealItemsChange={onMealItemsChange}
          showPresets
        />

        <Button
          onClick={onSubmit}
          disabled={!mealType || isSubmitting}
          className="w-full gap-2 bg-orange-500 text-white hover:bg-orange-600"
        >
          {isSubmitting ? (
            <>
              <span className="inline-block size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Сохранение...
            </>
          ) : (
            <>
              <Plus className="size-4" />
              Добавить приём пищи
            </>
          )}
        </Button>
      </DialogContent>
    </Dialog>
  )
}

// ─── Edit Meal Dialog ───────────────────────────────────────────────────────

interface EditMealDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mealType: string
  mealItems: MealFormItem[]
  isSubmitting: boolean
  note: string
  onMealTypeChange: (val: string) => void
  onMealItemsChange: (items: MealFormItem[]) => void
  onNoteChange: (val: string) => void
  onSubmit: () => void
}

export function EditMealDialog({
  open,
  onOpenChange,
  mealType,
  mealItems,
  isSubmitting,
  note,
  onMealTypeChange,
  onMealItemsChange,
  onNoteChange,
  onSubmit,
}: EditMealDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="size-5 text-orange-500" />
            Редактировать приём пищи
          </DialogTitle>
        </DialogHeader>

        <MealItemsForm
          mealType={mealType}
          mealItems={mealItems}
          onMealTypeChange={onMealTypeChange}
          onMealItemsChange={onMealItemsChange}
          note={note}
          onNoteChange={onNoteChange}
        />

        <Button
          onClick={onSubmit}
          disabled={!mealType || isSubmitting}
          className="w-full gap-2 bg-orange-500 text-white hover:bg-orange-600"
        >
          {isSubmitting ? (
            <>
              <span className="inline-block size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Сохранение...
            </>
          ) : (
            <>
              <Pencil className="size-4" />
              Сохранить
            </>
          )}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
