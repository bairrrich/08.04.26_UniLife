'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import {
  Flame,
  Beef,
  Milk,
  Wheat,
  Droplets,
  Plus,
  UtensilsCrossed,
  Sun,
  Moon,
  Apple,
  Trash2,
  Clock,
  X,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Pencil,
} from 'lucide-react'
import { toast } from 'sonner'

// ─── Types ──────────────────────────────────────────────────────
interface MealItem {
  name: string
  kcal: number
  protein: number
  fat: number
  carbs: number
}

interface MealWithItems {
  id: string
  type: string
  date: string
  note?: string | null
  items: {
    id: string
    name: string
    kcal: number
    protein: number
    fat: number
    carbs: number
  }[]
}

interface NutritionStats {
  date: string
  totalKcal: number
  totalProtein: number
  totalFat: number
  totalCarbs: number
  byMealType: Record<
    string,
    { kcal: number; protein: number; fat: number; carbs: number; mealCount: number }
  >
}

interface WaterStats {
  totalMl: number
  glasses: number
  goalMl: number
  percentage: number
}

// ─── Constants ──────────────────────────────────────────────────
const MACRO_GOALS = {
  kcal: { value: 2500, unit: '', label: 'Ккал', color: '#f97316', bgColor: '#fff7ed', darkBgColor: '#431407' },
  protein: { value: 150, unit: 'г', label: 'Белки', color: '#3b82f6', bgColor: '#eff6ff', darkBgColor: '#172554' },
  fat: { value: 80, unit: 'г', label: 'Жиры', color: '#f59e0b', bgColor: '#fffbeb', darkBgColor: '#451a03' },
  carbs: { value: 300, unit: 'г', label: 'Углеводы', color: '#22c55e', bgColor: '#f0fdf4', darkBgColor: '#052e16' },
} as const

type MacroKey = keyof typeof MACRO_GOALS

const MEAL_TYPE_CONFIG: Record<
  string,
  { label: string; emoji: string; icon: React.ReactNode }
> = {
  BREAKFAST: { label: 'Завтрак', emoji: '\u2600\uFE0F', icon: <Sun className="size-4" /> },
  LUNCH: { label: 'Обед', emoji: '\uD83C\uDFD7\uFE0F', icon: <UtensilsCrossed className="size-4" /> },
  DINNER: { label: 'Ужин', emoji: '\uD83C\uDF19', icon: <Moon className="size-4" /> },
  SNACK: { label: 'Перекус', emoji: '\uD83C\uDF4E', icon: <Apple className="size-4" /> },
}

const MEAL_TYPE_ORDER = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']

const formatMacro = (val: number, unit: string) => `${Math.round(val)}${unit}`

function getTodayStr() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

// ─── Macro Ring Component ───────────────────────────────────────
function MacroRing({
  value,
  goal,
  color,
  label,
  unit,
  bgColor,
  darkBgColor,
  icon,
}: {
  value: number
  goal: number
  color: string
  label: string
  unit: string
  bgColor: string
  darkBgColor: string
  icon: React.ReactNode
}) {
  const pct = Math.min((value / goal) * 100, 100)
  const radius = 18
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (pct / 100) * circumference
  const size = 48

  return (
    <Card className="rounded-xl border p-4" style={{ padding: '1rem' }}>
      <div className="flex items-center gap-3">
        {/* Ring */}
        <div className="relative shrink-0" style={{ width: size, height: size }}>
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="-rotate-90"
          >
            {/* Background ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-muted/40"
            />
            {/* Progress ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{
                transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          </svg>
          {/* Icon in center */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ color }}
          >
            {icon}
          </div>
        </div>

        {/* Label + Value */}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-sm font-bold leading-tight">
            {formatMacro(value, unit)}
            <span className="ml-1 text-xs font-normal text-muted-foreground">
              / {goal}{unit}
            </span>
          </p>
          <p className="text-xs font-semibold mt-0.5 tabular-nums" style={{ color }}>
            {Math.round(pct)}%
          </p>
        </div>
      </div>
    </Card>
  )
}

// ─── Component ──────────────────────────────────────────────────
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
  const [editMealItems, setEditMealItems] = useState<
    { name: string; kcal: string; protein: string; fat: string; carbs: string }[]
  >([{ name: '', kcal: '', protein: '', fat: '', carbs: '' }])

  // Form state
  const [mealType, setMealType] = useState<string>('')
  const [mealItems, setMealItems] = useState<
    { name: string; kcal: string; protein: string; fat: string; carbs: string }[]
  >([{ name: '', kcal: '', protein: '', fat: '', carbs: '' }])

  // ─── Data fetching (sequential to avoid Turbopack crash) ─────
  const fetchData = useCallback(async () => {
    try {
      // Sequential fetch to avoid overloading Turbopack
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

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // ─── Meal form handlers ───────────────────────────────────────
  const addMealItem = () => {
    setMealItems([...mealItems, { name: '', kcal: '', protein: '', fat: '', carbs: '' }])
  }

  const removeMealItem = (index: number) => {
    if (mealItems.length <= 1) return
    setMealItems(mealItems.filter((_, i) => i !== index))
  }

  const updateMealItem = (
    index: number,
    field: keyof (typeof mealItems)[number],
    value: string
  ) => {
    const updated = [...mealItems]
    updated[index] = { ...updated[index], [field]: value }
    setMealItems(updated)
  }

  const resetForm = () => {
    setMealType('')
    setMealItems([{ name: '', kcal: '', protein: '', fat: '', carbs: '' }])
  }

  const handleSubmitMeal = async () => {
    if (!mealType) return
    const validItems = mealItems.filter((item) => item.name.trim() !== '')
    if (validItems.length === 0) return

    setIsSubmitting(true)
    toast.dismiss()
    try {
      const body = {
        type: mealType,
        date: today,
        items: validItems.map((item) => ({
          name: item.name,
          kcal: parseFloat(item.kcal) || 0,
          protein: parseFloat(item.protein) || 0,
          fat: parseFloat(item.fat) || 0,
          carbs: parseFloat(item.carbs) || 0,
        })),
      }

      const res = await fetch('/api/nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        toast.success('Приём пищи записан')
        setShowNewMealDialog(false)
        resetForm()
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

  // ─── Edit meal handler ────────────────────────────────────────
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

  const updateEditMealItem = (
    index: number,
    field: keyof (typeof editMealItems)[number],
    value: string
  ) => {
    const updated = [...editMealItems]
    updated[index] = { ...updated[index], [field]: value }
    setEditMealItems(updated)
  }

  const addEditMealItem = () => {
    setEditMealItems([...editMealItems, { name: '', kcal: '', protein: '', fat: '', carbs: '' }])
  }

  const removeEditMealItem = (index: number) => {
    if (editMealItems.length <= 1) return
    setEditMealItems(editMealItems.filter((_, i) => i !== index))
  }

  const handleEditMeal = async () => {
    if (!editingMealId || !editMealType) return
    const validItems = editMealItems.filter((item) => item.name.trim() !== '')
    if (validItems.length === 0) return

    setIsEditSubmitting(true)
    toast.dismiss()
    try {
      const body = {
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
      }

      const res = await fetch(`/api/nutrition/${editingMealId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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

  // ─── Water handler ────────────────────────────────────────────
  const handleAddWater = async () => {
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
    setWaterStats({
      totalMl: 0,
      glasses: 0,
      goalMl: 2000,
      percentage: 0,
    })
  }

  // ─── Water history (localStorage) ─────────────────────────────
  const WATER_HISTORY_KEY = 'unilife-water-history'
  const WATER_GOAL = 2000

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
    // Keep last 7 days
    const todayStr = getTodayStr()
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
    const sevenDaysAgoStr = `${sevenDaysAgo.getFullYear()}-${String(sevenDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(sevenDaysAgo.getDate()).padStart(2, '0')}`
    return history.filter((h) => h.date >= sevenDaysAgoStr && h.date <= todayStr)
  }, [getWaterHistory])

  // Update localStorage when water changes
  useEffect(() => {
    const history = getWaterHistory()
    const todayStr = getTodayStr()
    const existingIdx = history.findIndex((h) => h.date === todayStr)
    if (existingIdx >= 0) {
      history[existingIdx].ml = waterStats.totalMl
    } else {
      history.push({ date: todayStr, ml: waterStats.totalMl })
    }
    // Keep only last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const cutoff = `${thirtyDaysAgo.getFullYear()}-${String(thirtyDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(thirtyDaysAgo.getDate()).padStart(2, '0')}`
    const filtered = history.filter((h) => h.date >= cutoff)
    saveWaterHistory(filtered)
  }, [waterStats.totalMl, getWaterHistory, saveWaterHistory])

  // Build last 7 days array for chart
  const waterChartDays = useMemo(() => {
    const days: { date: string; dayLabel: string; ml: number; isToday: boolean }[] = []
    const todayStr = getTodayStr()
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      const dayOfWeek = d.getDay()
      // Russian day abbreviations: Пн, Вт, Ср, Чт, Пт, Сб, Вс
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

  // ─── Helpers ──────────────────────────────────────────────────
  const getMealTotalKcal = (meal: MealWithItems) =>
    meal.items.reduce((sum, item) => sum + item.kcal, 0)

  const sortMealsByType = (mealsList: MealWithItems[]) => {
    return [...mealsList].sort(
      (a, b) => MEAL_TYPE_ORDER.indexOf(a.type) - MEAL_TYPE_ORDER.indexOf(b.type)
    )
  }

  // ─── Delete meal handler ────────────────────────────────────────
  const [deletingMealId, setDeletingMealId] = useState<string | null>(null)

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

  const toggleMealExpand = (id: string) => {
    setExpandedMealId(expandedMealId === id ? null : id)
  }

  const totalGlasses = 8

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
            {new Date().toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'long',
            })}
          </Badge>
        </div>

        {/* ── Macro Summary with Ring Indicators ────────────────── */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4 stagger-children">
          <MacroRing
            value={stats?.totalKcal ?? 0}
            goal={MACRO_GOALS.kcal.value}
            color={MACRO_GOALS.kcal.color}
            label={MACRO_GOALS.kcal.label}
            unit={MACRO_GOALS.kcal.unit}
            bgColor={MACRO_GOALS.kcal.bgColor}
            darkBgColor={MACRO_GOALS.kcal.darkBgColor}
            icon={<Flame className="size-4" />}
          />
          <MacroRing
            value={stats?.totalProtein ?? 0}
            goal={MACRO_GOALS.protein.value}
            color={MACRO_GOALS.protein.color}
            label={MACRO_GOALS.protein.label}
            unit={MACRO_GOALS.protein.unit}
            bgColor={MACRO_GOALS.protein.bgColor}
            darkBgColor={MACRO_GOALS.protein.darkBgColor}
            icon={<Beef className="size-4" />}
          />
          <MacroRing
            value={stats?.totalFat ?? 0}
            goal={MACRO_GOALS.fat.value}
            color={MACRO_GOALS.fat.color}
            label={MACRO_GOALS.fat.label}
            unit={MACRO_GOALS.fat.unit}
            bgColor={MACRO_GOALS.fat.bgColor}
            darkBgColor={MACRO_GOALS.fat.darkBgColor}
            icon={<Milk className="size-4" />}
          />
          <MacroRing
            value={stats?.totalCarbs ?? 0}
            goal={MACRO_GOALS.carbs.value}
            color={MACRO_GOALS.carbs.color}
            label={MACRO_GOALS.carbs.label}
            unit={MACRO_GOALS.carbs.unit}
            bgColor={MACRO_GOALS.carbs.bgColor}
            darkBgColor={MACRO_GOALS.carbs.darkBgColor}
            icon={<Wheat className="size-4" />}
          />
        </div>

        {/* ── Water Tracker ─────────────────────────────────────── */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Droplets className="size-5 text-blue-500" />
                Вода
              </CardTitle>
              {waterStats.totalMl > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
                  onClick={handleResetWater}
                >
                  <RotateCcw className="size-3 mr-1" />
                  Сбросить
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {/* Prominent total ml display */}
            <div className="mb-3 flex items-center justify-between">
              <p className="text-lg font-bold tabular-nums">
                <span className={waterStats.percentage >= 100 ? 'text-blue-600' : 'text-foreground'}>
                  {waterStats.totalMl}
                </span>
                <span className="text-sm font-normal text-muted-foreground">
                  {' '} / {waterStats.goalMl} мл
                </span>
              </p>
              <Badge
                variant={waterStats.percentage >= 100 ? 'default' : 'secondary'}
                className={waterStats.percentage >= 100 ? 'bg-blue-500 tabular-nums' : 'tabular-nums'}
              >
                {waterStats.percentage}%
              </Badge>
            </div>

            {/* Glass grid */}
            <div className="mb-3 grid grid-cols-4 gap-3 sm:grid-cols-8">
              {Array.from({ length: totalGlasses }).map((_, i) => {
                const isFilled = i < waterStats.glasses
                return (
                  <button
                    key={i}
                    onClick={handleAddWater}
                    className="group flex flex-col items-center gap-1 transition-transform hover:scale-110 active:scale-95"
                  >
                    <div
                      className={`relative flex size-10 items-center justify-center overflow-hidden rounded-xl border-2 transition-colors ${
                        isFilled
                          ? 'border-blue-400 bg-blue-50 text-blue-500'
                          : 'border-gray-200 bg-gray-50 text-gray-300 group-hover:border-blue-200 group-hover:text-blue-300'
                      }`}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M8 2h8l4 10H4L8 2z" />
                        <path
                          d="M4 12v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6"
                          fill={isFilled ? 'currentColor' : 'none'}
                        />
                      </svg>
                      {isFilled && (
                        <div className="water-wave absolute bottom-0 left-0 right-0 h-3 bg-blue-400/30 rounded-b-lg" />
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {(i + 1) * 250}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Water progress bar */}
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-blue-100">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-500"
                style={{ width: `${Math.min(waterStats.percentage, 100)}%` }}
              />
            </div>

            {/* Quick add button */}
            <div className="mt-3 flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddWater}
                className="gap-2 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
              >
                <Droplets className="size-4" />
                +250 мл
              </Button>
            </div>

            {/* Water history mini chart — last 7 days */}
            {waterChartDays.length > 0 && (
              <div className="mt-5">
                <p className="mb-2.5 text-xs font-medium text-muted-foreground">
                  За последние 7 дней
                </p>
                <div className="flex items-end justify-between gap-1.5">
                  {waterChartDays.map((day) => {
                    const heightPct = Math.min((day.ml / WATER_GOAL) * 100, 100)
                    const reachedGoal = day.ml >= WATER_GOAL
                    return (
                      <div key={day.date} className="flex flex-1 flex-col items-center gap-1.5">
                        {/* ml label */}
                        <span className={`text-[9px] font-medium tabular-nums ${day.ml > 0 ? 'text-foreground' : 'text-muted-foreground/50'}`}>
                          {day.ml > 0 ? `${Math.round(day.ml / 100) * 100}` : ''}
                        </span>
                        {/* Bar */}
                        <div
                          className="relative w-full max-w-[32px] rounded-t-md transition-all duration-500"
                          style={{ height: '64px' }}
                        >
                          <div
                            className={`absolute bottom-0 left-1/2 w-[70%] -translate-x-1/2 rounded-t-md transition-all duration-700 ${
                              day.isToday
                                ? reachedGoal
                                  ? 'bg-emerald-500'
                                  : 'bg-blue-400'
                                : reachedGoal
                                  ? 'bg-emerald-400/80'
                                  : 'bg-muted-foreground/25'
                            }`}
                            style={{
                              height: `${Math.max(heightPct, day.ml > 0 ? 8 : 0)}%`,
                            }}
                          />
                        </div>
                        {/* Day label */}
                        <span
                          className={`text-[10px] font-medium ${
                            day.isToday ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'
                          }`}
                        >
                          {day.dayLabel}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Meal Timeline ─────────────────────────────────────── */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Приёмы пищи</h2>
          <Badge variant="secondary">{meals.length} записей</Badge>
        </div>

        {sortMealsByType(meals).length === 0 ? (
          <Card className="mb-6">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 flex size-14 items-center justify-center rounded-full bg-orange-100">
                <UtensilsCrossed className="size-7 text-orange-400" />
              </div>
              <p className="mb-1 font-medium">Пока нет записей</p>
              <p className="text-sm text-muted-foreground">
                Добавь первый приём пищи, чтобы начать отслеживание
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="stagger-children space-y-4">
            {sortMealsByType(meals).map((meal) => {
              const config = MEAL_TYPE_CONFIG[meal.type] || MEAL_TYPE_CONFIG.LUNCH
              const totalKcal = getMealTotalKcal(meal)
              const isExpanded = expandedMealId === meal.id

              return (
                <Card key={meal.id} className="card-hover">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <span>{config.emoji}</span>
                        <span>{config.label}</span>
                        {/* Prominent time display */}
                        <span className="flex items-center gap-1 rounded-md bg-muted/60 px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                          <Clock className="size-3" />
                          {meal.date ? new Date(meal.date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {/* Calorie badge */}
                        <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 font-mono text-xs border-0">
                          <Flame className="mr-1 size-3 text-orange-500" />
                          {Math.round(totalKcal)} ккал
                        </Badge>
                        <button
                          onClick={() => openEditDialog(meal)}
                          className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                          title="Редактировать"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteMeal(meal.id)}
                          className={`flex size-7 items-center justify-center rounded-md transition-colors ${
                            deletingMealId === meal.id
                              ? 'bg-destructive text-destructive-foreground'
                              : 'text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
                          }`}
                          title={deletingMealId === meal.id ? 'Нажмите для подтверждения' : 'Удалить'}
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Expand/Collapse toggle for meal items */}
                    <button
                      onClick={() => toggleMealExpand(meal.id)}
                      className="flex w-full items-center justify-between rounded-lg bg-muted/30 px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50 transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <UtensilsCrossed className="size-3.5" />
                        {meal.items.length} {meal.items.length === 1 ? 'блюдо' : meal.items.length < 5 ? 'блюда' : 'блюд'}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="size-4" />
                      ) : (
                        <ChevronDown className="size-4" />
                      )}
                    </button>

                    {/* Meal items (always visible, but expandable) */}
                    <div
                      className={`mt-2 space-y-2 overflow-hidden transition-all duration-300 ${
                        isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      {meal.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2"
                        >
                          <span className="text-sm font-medium">{item.name}</span>
                          <div className="flex items-center gap-2.5 text-xs">
                            <span className="font-semibold text-orange-600">{Math.round(item.kcal)} ккал</span>
                            <span className="text-blue-600">Б {Math.round(item.protein)}г</span>
                            <span className="text-amber-600">Ж {Math.round(item.fat)}г</span>
                            <span className="text-green-600">У {Math.round(item.carbs)}г</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* ── FAB: Add Meal ──────────────────────────────────────── */}
      <Dialog open={showNewMealDialog} onOpenChange={setShowNewMealDialog}>
        <DialogTrigger asChild>
          <button
            className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg shadow-orange-500/30 transition-all hover:bg-orange-600 hover:shadow-xl hover:shadow-orange-500/40 active:scale-95"
          >
            <Plus className="size-6" />
          </button>
        </DialogTrigger>

        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UtensilsCrossed className="size-5 text-orange-500" />
              Добавить приём пищи
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Meal type selector */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">Тип приёма</label>
              <Select value={mealType} onValueChange={setMealType}>
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

            {/* Meal items */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium">Блюда / Продукты</label>
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
                        onClick={() => removeMealItem(index)}
                        className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="size-3.5" />
                      </button>
                    )}

                    <div className="mb-2">
                      <Input
                        placeholder="Название блюда"
                        value={item.name}
                        onChange={(e) => updateMealItem(index, 'name', e.target.value)}
                        className="h-9 border-0 bg-transparent shadow-none focus-visible:ring-0"
                      />
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <label className="mb-0.5 block text-[10px] font-medium text-orange-600 uppercase tracking-wider">
                          Ккал
                        </label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={item.kcal}
                          onChange={(e) => updateMealItem(index, 'kcal', e.target.value)}
                          className="h-8 text-center"
                        />
                      </div>
                      <div>
                        <label className="mb-0.5 block text-[10px] font-medium text-blue-600 uppercase tracking-wider">
                          Белки
                        </label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={item.protein}
                          onChange={(e) => updateMealItem(index, 'protein', e.target.value)}
                          className="h-8 text-center"
                        />
                      </div>
                      <div>
                        <label className="mb-0.5 block text-[10px] font-medium text-amber-600 uppercase tracking-wider">
                          Жиры
                        </label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={item.fat}
                          onChange={(e) => updateMealItem(index, 'fat', e.target.value)}
                          className="h-8 text-center"
                        />
                      </div>
                      <div>
                        <label className="mb-0.5 block text-[10px] font-medium text-green-600 uppercase tracking-wider">
                          Углев.
                        </label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={item.carbs}
                          onChange={(e) => updateMealItem(index, 'carbs', e.target.value)}
                          className="h-8 text-center"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={addMealItem}
                className="mt-2 w-full gap-2 text-muted-foreground hover:text-foreground"
              >
                <Plus className="size-4" />
                Добавить блюдо
              </Button>
            </div>

            {/* Submit */}
            <Button
              onClick={handleSubmitMeal}
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
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Edit Meal Dialog ─────────────────────────────────────── */}
      <Dialog open={showEditDialog} onOpenChange={(open) => { if (!open) setShowEditDialog(false) }}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="size-5 text-orange-500" />
              Редактировать приём пищи
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Meal type selector */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">Тип приёма</label>
              <Select value={editMealType} onValueChange={setEditMealType}>
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

            {/* Note */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">Заметка</label>
              <Textarea
                placeholder="Необязательная заметка..."
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                className="min-h-[60px] resize-none"
                rows={2}
              />
            </div>

            {/* Meal items */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium">Блюда / Продукты</label>
              </div>
              <div className="space-y-3">
                {editMealItems.map((item, index) => (
                  <div
                    key={index}
                    className="relative rounded-xl border bg-muted/30 p-3"
                  >
                    {editMealItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeEditMealItem(index)}
                        className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="size-3.5" />
                      </button>
                    )}

                    <div className="mb-2">
                      <Input
                        placeholder="Название блюда"
                        value={item.name}
                        onChange={(e) => updateEditMealItem(index, 'name', e.target.value)}
                        className="h-9 border-0 bg-transparent shadow-none focus-visible:ring-0"
                      />
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <label className="mb-0.5 block text-[10px] font-medium text-orange-600 uppercase tracking-wider">
                          Ккал
                        </label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={item.kcal}
                          onChange={(e) => updateEditMealItem(index, 'kcal', e.target.value)}
                          className="h-8 text-center"
                        />
                      </div>
                      <div>
                        <label className="mb-0.5 block text-[10px] font-medium text-blue-600 uppercase tracking-wider">
                          Белки
                        </label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={item.protein}
                          onChange={(e) => updateEditMealItem(index, 'protein', e.target.value)}
                          className="h-8 text-center"
                        />
                      </div>
                      <div>
                        <label className="mb-0.5 block text-[10px] font-medium text-amber-600 uppercase tracking-wider">
                          Жиры
                        </label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={item.fat}
                          onChange={(e) => updateEditMealItem(index, 'fat', e.target.value)}
                          className="h-8 text-center"
                        />
                      </div>
                      <div>
                        <label className="mb-0.5 block text-[10px] font-medium text-green-600 uppercase tracking-wider">
                          Углев.
                        </label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={item.carbs}
                          onChange={(e) => updateEditMealItem(index, 'carbs', e.target.value)}
                          className="h-8 text-center"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={addEditMealItem}
                className="mt-2 w-full gap-2 text-muted-foreground hover:text-foreground"
              >
                <Plus className="size-4" />
                Добавить блюдо
              </Button>
            </div>

            {/* Submit */}
            <Button
              onClick={handleEditMeal}
              disabled={!editMealType || isEditSubmitting}
              className="w-full gap-2 bg-orange-500 text-white hover:bg-orange-600"
            >
              {isEditSubmitting ? (
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
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
