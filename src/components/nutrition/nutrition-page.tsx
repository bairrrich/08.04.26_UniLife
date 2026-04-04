'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { getTodayStr } from '@/lib/format'

import type { MealWithItems, NutritionStats, WaterStats } from './types'
import type { MealFormItem } from './meal-dialog'
import { useWaterHistory } from './hooks'
import { MacroRings } from './macro-ring'
import { WaterTracker } from './water-tracker'
import { MealTimeline } from './meal-timeline'
import { AddMealDialog, EditMealDialog } from './meal-dialog'
import { TimeIndicator } from './time-indicator'

export default function NutritionPage() {
  const today = getTodayStr()

  // State
  const [meals, setMeals] = useState<MealWithItems[]>([])
  const [stats, setStats] = useState<NutritionStats | null>(null)
  const [waterStats, setWaterStats] = useState<WaterStats>({
    totalMl: 0,
    glasses: 0,
    goalMl: 2000,
    percentage: 0,
  })
  const [showNewMealDialog, setShowNewMealDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditSubmitting, setIsEditSubmitting] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [expandedMealId, setExpandedMealId] = useState<string | null>(null)

  // Edit form state
  const [editingMealId, setEditingMealId] = useState<string | null>(null)
  const [editMealType, setEditMealType] = useState<string>('')
  const [editNote, setEditNote] = useState<string>('')
  const [editMealItems, setEditMealItems] = useState<MealFormItem[]>([{ name: '', kcal: '', protein: '', fat: '', carbs: '' }])

  // Form state
  const [mealType, setMealType] = useState<string>('')
  const [mealItems, setMealItems] = useState<MealFormItem[]>([{ name: '', kcal: '', protein: '', fat: '', carbs: '' }])

  // Water
  const [waterAnimating, setWaterAnimating] = useState(false)
  const [deletingMealId, setDeletingMealId] = useState<string | null>(null)
  const { waterChartDays } = useWaterHistory(waterStats.totalMl)

  // ─── Data fetching ─────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      const mealsRes = await fetch(`/api/nutrition?date=${today}`)
      if (mealsRes.ok) { const d = await mealsRes.json(); if (d.success) setMeals(d.data) }
      await new Promise(r => setTimeout(r, 100))

      const statsRes = await fetch(`/api/nutrition/stats?date=${today}`)
      if (statsRes.ok) { const d = await statsRes.json(); if (d.success) setStats(d.data) }
      await new Promise(r => setTimeout(r, 100))

      const waterRes = await fetch(`/api/nutrition/water?date=${today}`)
      if (waterRes.ok) { const d = await waterRes.json(); if (d.success) setWaterStats(d.data) }
    } catch (err) {
      console.error('Failed to fetch nutrition data:', err)
    }
  }, [today])

  useEffect(() => { fetchData() }, [fetchData])

  // ─── Meal CRUD ─────────────────────────────────────────────────
  const handleSubmitMeal = async () => {
    if (!mealType) return
    const validItems = mealItems.filter((item) => item.name.trim() !== '')
    if (validItems.length === 0) return

    setIsSubmitting(true)
    toast.dismiss()
    try {
      const res = await fetch('/api/nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: mealType,
          date: today,
          items: validItems.map((item) => ({
            name: item.name,
            kcal: parseFloat(item.kcal) || 0,
            protein: parseFloat(item.protein) || 0,
            fat: parseFloat(item.fat) || 0,
            carbs: parseFloat(item.carbs) || 0,
          })),
        }),
      })
      if (res.ok) {
        toast.success('Приём пищи записан')
        setShowNewMealDialog(false)
        setMealType('')
        setMealItems([{ name: '', kcal: '', protein: '', fat: '', carbs: '' }])
        fetchData()
      } else {
        toast.error('Ошибка при записи приёма пищи')
      }
    } catch (err) {
      console.error('Failed to create meal:', err)
      toast.error('Ошибка: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditDialog = (meal: MealWithItems) => {
    setEditingMealId(meal.id)
    setEditMealType(meal.type)
    setEditNote(meal.note || '')
    setEditMealItems(
      meal.items.map((item) => ({
        name: item.name,
        kcal: String(item.kcal),
        protein: String(item.protein),
        fat: String(item.fat),
        carbs: String(item.carbs),
      }))
    )
    setShowEditDialog(true)
  }

  const handleEditMeal = async () => {
    if (!editingMealId || !editMealType) return
    const validItems = editMealItems.filter((item) => item.name.trim() !== '')
    if (validItems.length === 0) return

    setIsEditSubmitting(true)
    toast.dismiss()
    try {
      const res = await fetch(`/api/nutrition/${editingMealId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mealType: editMealType,
          date: today,
          note: editNote,
          items: validItems.map((item) => ({
            name: item.name,
            calories: parseFloat(item.kcal) || 0,
            protein: parseFloat(item.protein) || 0,
            fat: parseFloat(item.fat) || 0,
            carbs: parseFloat(item.carbs) || 0,
          })),
        }),
      })
      if (res.ok) {
        toast.success('Приём пищи обновлён')
        setShowEditDialog(false)
        setEditingMealId(null)
        fetchData()
      } else {
        toast.error('Ошибка при обновлении приёма пищи')
      }
    } catch (err) {
      console.error('Failed to update meal:', err)
      toast.error('Ошибка: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка'))
    } finally {
      setIsEditSubmitting(false)
    }
  }

  const handleDeleteMeal = async (mealId: string) => {
    if (deletingMealId === mealId) {
      toast.dismiss()
      try {
        const res = await fetch(`/api/nutrition?id=${mealId}`, { method: 'DELETE' })
        if (res.ok) {
          toast.success('Приём пищи удалён')
          setMeals((prev) => prev.filter((m) => m.id !== mealId))
          fetchData()
        } else {
          toast.error('Ошибка при удалении')
        }
      } catch (err) {
        toast.error('Ошибка: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка'))
      } finally {
        setDeletingMealId(null)
      }
    } else {
      setDeletingMealId(mealId)
      toast.info('Нажмите ещё раз для подтверждения удаления')
      setTimeout(() => setDeletingMealId(null), 3000)
    }
  }

  // ─── Water ─────────────────────────────────────────────────────
  const handleAddWater = async () => {
    setWaterAnimating(true)
    setTimeout(() => setWaterAnimating(false), 300)
    try {
      const res = await fetch('/api/nutrition/water', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: today, amountMl: 250 }),
      })
      if (res.ok) {
        toast.success('+250 мл воды')
        fetchData()
      } else {
        toast.error('Ошибка при добавлении воды')
      }
    } catch (err) {
      console.error('Failed to add water:', err)
      toast.error('Ошибка: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка'))
    }
  }

  const handleResetWater = async () => {
    toast.dismiss()
    toast.info('Водный баланс сброшен')
    setWaterStats({ totalMl: 0, glasses: 0, goalMl: 2000, percentage: 0 })
  }

  return (
    <div className="animate-slide-up min-h-screen bg-gradient-to-b from-orange-50/40 to-white">
      <div className="mx-auto max-w-2xl px-4 pb-24 pt-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Питание</h1>
            <p className="text-sm text-muted-foreground">Отслеживай своё питание и воду</p>
          </div>
          <Badge variant="secondary" className="text-xs font-normal">
            {new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
          </Badge>
        </div>

        <MacroRings stats={stats} />
        <WaterTracker
          waterStats={waterStats}
          waterAnimating={waterAnimating}
          waterChartDays={waterChartDays}
          onAddWater={handleAddWater}
          onResetWater={handleResetWater}
        />

        {/* Meal Timeline */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Приёмы пищи</h2>
          <Badge variant="secondary">{meals.length} записей</Badge>
        </div>

        <TimeIndicator stats={stats} />
        <MealTimeline
          meals={meals}
          expandedMealId={expandedMealId}
          deletingMealId={deletingMealId}
          onToggleExpand={(id) => setExpandedMealId(expandedMealId === id ? null : id)}
          onEdit={openEditDialog}
          onDelete={handleDeleteMeal}
        />
      </div>

      {/* FAB + Add Meal Dialog */}
      <AddMealDialog
        open={showNewMealDialog}
        onOpenChange={setShowNewMealDialog}
        mealType={mealType}
        mealItems={mealItems}
        isSubmitting={isSubmitting}
        onMealTypeChange={setMealType}
        onMealItemsChange={setMealItems}
        onSubmit={handleSubmitMeal}
      />
      <EditMealDialog
        open={showEditDialog}
        onOpenChange={(open) => { if (!open) setShowEditDialog(false) }}
        mealType={editMealType}
        mealItems={editMealItems}
        isSubmitting={isEditSubmitting}
        note={editNote}
        onMealTypeChange={setEditMealType}
        onMealItemsChange={setEditMealItems}
        onNoteChange={setEditNote}
        onSubmit={handleEditMeal}
      />

      {/* FAB Button */}
      <button
        className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg shadow-orange-500/30 transition-all hover:bg-orange-600 hover:shadow-xl hover:shadow-orange-500/40 active:scale-95"
        onClick={() => setShowNewMealDialog(true)}
      >
        <Plus className="size-6" />
      </button>
    </div>
  )
}
