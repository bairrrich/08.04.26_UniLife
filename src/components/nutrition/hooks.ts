'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { getTodayStr } from '@/lib/format'
import { WATER_HISTORY_KEY } from './constants'

import type { MealWithItems, NutritionStats, WaterStats } from './types'
import type { MealFormItem } from './meal-dialog'

// ─── Empty form item helper ─────────────────────────────────────────────────

const EMPTY_ITEM: MealFormItem = { name: '', kcal: '', protein: '', fat: '', carbs: '' }

// ─── Water history sub-hook (localStorage persistence) ─────────────────────

function useWaterHistory(waterTotalMl: number) {
  const getWaterHistory = useCallback((): { date: string; ml: number }[] => {
    if (typeof window === 'undefined') return []
    try {
      const raw = localStorage.getItem(WATER_HISTORY_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }, [])

  const saveWaterHistory = useCallback((history: { date: string; ml: number }[]) => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(WATER_HISTORY_KEY, JSON.stringify(history))
    } catch {
      // ignore quota errors
    }
  }, [])

  const waterHistory = useMemo(() => {
    const history = getWaterHistory()
    const todayStr = getTodayStr()
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
    const sevenDaysAgoStr = `${sevenDaysAgo.getFullYear()}-${String(sevenDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(sevenDaysAgo.getDate()).padStart(2, '0')}`
    return history.filter((h) => h.date >= sevenDaysAgoStr && h.date <= todayStr)
  }, [getWaterHistory])

  useEffect(() => {
    const history = getWaterHistory()
    const todayStr = getTodayStr()
    const existingIdx = history.findIndex((h) => h.date === todayStr)
    if (existingIdx >= 0) {
      history[existingIdx].ml = waterTotalMl
    } else {
      history.push({ date: todayStr, ml: waterTotalMl })
    }
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const cutoff = `${thirtyDaysAgo.getFullYear()}-${String(thirtyDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(thirtyDaysAgo.getDate()).padStart(2, '0')}`
    const filtered = history.filter((h) => h.date >= cutoff)
    saveWaterHistory(filtered)
  }, [waterTotalMl, getWaterHistory, saveWaterHistory])

  const waterChartDays = useMemo(() => {
    const days: { date: string; dayLabel: string; ml: number; isToday: boolean }[] = []
    const todayStr = getTodayStr()
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      const dayOfWeek = d.getDay()
      const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
      const entry = waterHistory.find((h) => h.date === dateStr)
      days.push({
        date: dateStr,
        dayLabel: dayNames[dayOfWeek],
        ml: entry?.ml || 0,
        isToday: dateStr === todayStr,
      })
    }
    return days
  }, [waterHistory])

  return { waterHistory, waterChartDays }
}

// ─── Main nutrition hook — all state & handlers ────────────────────────────

export function useNutrition() {
  const today = getTodayStr()

  // Data state
  const [meals, setMeals] = useState<MealWithItems[]>([])
  const [stats, setStats] = useState<NutritionStats | null>(null)
  const [waterStats, setWaterStats] = useState<WaterStats>({
    totalMl: 0,
    glasses: 0,
    goalMl: 2000,
    percentage: 0,
  })

  // Dialog state
  const [showNewMealDialog, setShowNewMealDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditSubmitting, setIsEditSubmitting] = useState(false)

  // New meal form state
  const [mealType, setMealType] = useState<string>('')
  const [mealItems, setMealItems] = useState<MealFormItem[]>([{ ...EMPTY_ITEM }])

  // Edit form state
  const [editingMealId, setEditingMealId] = useState<string | null>(null)
  const [editMealType, setEditMealType] = useState<string>('')
  const [editNote, setEditNote] = useState<string>('')
  const [editMealItems, setEditMealItems] = useState<MealFormItem[]>([{ ...EMPTY_ITEM }])

  // UI state
  const [expandedMealId, setExpandedMealId] = useState<string | null>(null)
  const [waterAnimating, setWaterAnimating] = useState(false)
  const [deletingMealId, setDeletingMealId] = useState<string | null>(null)

  // Water history (localStorage)
  const { waterChartDays } = useWaterHistory(waterStats.totalMl)

  // ─── Data fetching ───────────────────────────────────────────────────────

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

  // ─── Meal CRUD ───────────────────────────────────────────────────────────

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
        setMealItems([{ ...EMPTY_ITEM }])
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

  const openEditDialog = useCallback((meal: MealWithItems) => {
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
  }, [])

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

  const handleDeleteMeal = useCallback(async (mealId: string) => {
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
  }, [deletingMealId, fetchData])

  const toggleExpandMeal = useCallback((id: string) => {
    setExpandedMealId((prev) => (prev === id ? null : id))
  }, [])

  // ─── Water ───────────────────────────────────────────────────────────────

  const handleAddWater = useCallback(async () => {
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
  }, [today, fetchData])

  const handleResetWater = useCallback(() => {
    toast.dismiss()
    toast.info('Водный баланс сброшен')
    setWaterStats({ totalMl: 0, glasses: 0, goalMl: 2000, percentage: 0 })
  }, [])

  return {
    // Data
    meals,
    stats,
    waterStats,
    waterAnimating,
    waterChartDays,
    expandedMealId,
    deletingMealId,

    // New meal dialog
    showNewMealDialog,
    setShowNewMealDialog,
    mealType,
    setMealType,
    mealItems,
    setMealItems,
    isSubmitting,
    handleSubmitMeal,

    // Edit meal dialog
    showEditDialog,
    setShowEditDialog,
    editMealType,
    setEditMealType,
    editMealItems,
    setEditMealItems,
    editNote,
    setEditNote,
    isEditSubmitting,
    handleEditMeal,
    openEditDialog,

    // Meal actions
    handleDeleteMeal,
    toggleExpandMeal,

    // Water actions
    handleAddWater,
    handleResetWater,
  }
}
