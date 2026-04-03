'use client'

import { useState, useEffect, useCallback } from 'react'
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
import { Progress } from '@/components/ui/progress'
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
  Coffee,
  Sun,
  Moon,
  Sandwich,
  Apple,
  Trash2,
  X,
} from 'lucide-react'

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
  kcal: { value: 2500, unit: '', label: 'Ккал', color: 'bg-orange-500', bgTrack: 'bg-orange-100' },
  protein: { value: 150, unit: 'г', label: 'Белки', color: 'bg-blue-500', bgTrack: 'bg-blue-100' },
  fat: { value: 80, unit: 'г', label: 'Жиры', color: 'bg-amber-500', bgTrack: 'bg-amber-100' },
  carbs: { value: 300, unit: 'г', label: 'Углеводы', color: 'bg-green-500', bgTrack: 'bg-green-100' },
} as const

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

  // Form state
  const [mealType, setMealType] = useState<string>('')
  const [mealItems, setMealItems] = useState<
    { name: string; kcal: string; protein: string; fat: string; carbs: string }[]
  >([{ name: '', kcal: '', protein: '', fat: '', carbs: '' }])

  // ─── Data fetching ────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      const [mealsRes, statsRes, waterRes] = await Promise.all([
        fetch(`/api/nutrition?date=${today}`),
        fetch(`/api/nutrition/stats?date=${today}`),
        fetch(`/api/nutrition/water?date=${today}`),
      ])

      if (mealsRes.ok) {
        const mealsData = await mealsRes.json()
        if (mealsData.success) setMeals(mealsData.data)
      }
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        if (statsData.success) setStats(statsData.data)
      }
      if (waterRes.ok) {
        const waterData = await waterRes.json()
        if (waterData.success) setWaterStats(waterData.data)
      }
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
        setShowNewMealDialog(false)
        resetForm()
        fetchData()
      }
    } catch (err) {
      console.error('Failed to create meal:', err)
    } finally {
      setIsSubmitting(false)
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
        fetchData()
      }
    } catch (err) {
      console.error('Failed to add water:', err)
    }
  }

  // ─── Helpers ──────────────────────────────────────────────────
  const getMealTotalKcal = (meal: MealWithItems) =>
    meal.items.reduce((sum, item) => sum + item.kcal, 0)

  const sortMealsByType = (mealsList: MealWithItems[]) => {
    return [...mealsList].sort(
      (a, b) => MEAL_TYPE_ORDER.indexOf(a.type) - MEAL_TYPE_ORDER.indexOf(b.type)
    )
  }

  const totalGlasses = 8

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/40 to-white">
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

        {/* ── Macro Summary ────────────────────────────────────── */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {/* Ккал */}
          <Card className="rounded-xl border p-4" style={{ padding: '1rem' }}>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-orange-100">
                <Flame className="size-4 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ккал</p>
                <p className="text-sm font-bold">
                  {formatMacro(stats?.totalKcal ?? 0, '')}{' '}
                  <span className="font-normal text-muted-foreground">/ {MACRO_GOALS.kcal.value}</span>
                </p>
              </div>
            </div>
            <div className={`h-2 w-full overflow-hidden rounded-full ${MACRO_GOALS.kcal.bgTrack}`}>
              <div
                className={`h-full rounded-full transition-all duration-500 ${MACRO_GOALS.kcal.color}`}
                style={{
                  width: `${Math.min(((stats?.totalKcal ?? 0) / MACRO_GOALS.kcal.value) * 100, 100)}%`,
                }}
              />
            </div>
          </Card>

          {/* Белки */}
          <Card className="rounded-xl border p-4" style={{ padding: '1rem' }}>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-blue-100">
                <Beef className="size-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Белки</p>
                <p className="text-sm font-bold">
                  {formatMacro(stats?.totalProtein ?? 0, 'г')}{' '}
                  <span className="font-normal text-muted-foreground">/ {MACRO_GOALS.protein.value}г</span>
                </p>
              </div>
            </div>
            <div className={`h-2 w-full overflow-hidden rounded-full ${MACRO_GOALS.protein.bgTrack}`}>
              <div
                className={`h-full rounded-full transition-all duration-500 ${MACRO_GOALS.protein.color}`}
                style={{
                  width: `${Math.min(((stats?.totalProtein ?? 0) / MACRO_GOALS.protein.value) * 100, 100)}%`,
                }}
              />
            </div>
          </Card>

          {/* Жиры */}
          <Card className="rounded-xl border p-4" style={{ padding: '1rem' }}>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-amber-100">
                <Milk className="size-4 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Жиры</p>
                <p className="text-sm font-bold">
                  {formatMacro(stats?.totalFat ?? 0, 'г')}{' '}
                  <span className="font-normal text-muted-foreground">/ {MACRO_GOALS.fat.value}г</span>
                </p>
              </div>
            </div>
            <div className={`h-2 w-full overflow-hidden rounded-full ${MACRO_GOALS.fat.bgTrack}`}>
              <div
                className={`h-full rounded-full transition-all duration-500 ${MACRO_GOALS.fat.color}`}
                style={{
                  width: `${Math.min(((stats?.totalFat ?? 0) / MACRO_GOALS.fat.value) * 100, 100)}%`,
                }}
              />
            </div>
          </Card>

          {/* Углеводы */}
          <Card className="rounded-xl border p-4" style={{ padding: '1rem' }}>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-green-100">
                <Wheat className="size-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Углеводы</p>
                <p className="text-sm font-bold">
                  {formatMacro(stats?.totalCarbs ?? 0, 'г')}{' '}
                  <span className="font-normal text-muted-foreground">/ {MACRO_GOALS.carbs.value}г</span>
                </p>
              </div>
            </div>
            <div className={`h-2 w-full overflow-hidden rounded-full ${MACRO_GOALS.carbs.bgTrack}`}>
              <div
                className={`h-full rounded-full transition-all duration-500 ${MACRO_GOALS.carbs.color}`}
                style={{
                  width: `${Math.min(((stats?.totalCarbs ?? 0) / MACRO_GOALS.carbs.value) * 100, 100)}%`,
                }}
              />
            </div>
          </Card>
        </div>

        {/* ── Water Tracker ─────────────────────────────────────── */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Droplets className="size-5 text-blue-500" />
              Вода
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {waterStats.totalMl} из {waterStats.goalMl} мл
              </p>
              <Badge
                variant={waterStats.percentage >= 100 ? 'default' : 'secondary'}
                className={waterStats.percentage >= 100 ? 'bg-blue-500' : ''}
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
                      className={`flex size-10 items-center justify-center rounded-xl border-2 transition-colors ${
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
          <div className="space-y-4">
            {sortMealsByType(meals).map((meal) => {
              const config = MEAL_TYPE_CONFIG[meal.type] || MEAL_TYPE_CONFIG.LUNCH
              const totalKcal = getMealTotalKcal(meal)

              return (
                <Card key={meal.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <span>{config.emoji}</span>
                        <span>{config.label}</span>
                      </CardTitle>
                      <Badge variant="secondary" className="font-mono text-xs">
                        <Flame className="mr-1 size-3 text-orange-500" />
                        {Math.round(totalKcal)} ккал
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {meal.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2"
                        >
                          <span className="text-sm font-medium">{item.name}</span>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="text-orange-600 font-medium">{Math.round(item.kcal)}кк</span>
                            <span>Б {Math.round(item.protein)}</span>
                            <span>Ж {Math.round(item.fat)}</span>
                            <span>У {Math.round(item.carbs)}</span>
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
    </div>
  )
}
