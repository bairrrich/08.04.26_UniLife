'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Flame, UtensilsCrossed, Trash2, Clock, ChevronDown, ChevronUp, Pencil, Plus, GripVertical } from 'lucide-react'
import { MEAL_TYPE_CONFIG, NUTRITION_PHRASES } from './constants'
import { MealPhotoPlaceholder } from './meal-photo-placeholder'
import type { MealWithItems } from './types'

interface MealTimelineProps {
  meals: MealWithItems[]
  expandedMealId: string | null
  deletingMealId: string | null
  onToggleExpand: (id: string) => void
  onEdit: (meal: MealWithItems) => void
  onDelete: (mealId: string) => void
  onAddNew: () => void
}

function getMealTotalKcal(meal: MealWithItems) {
  return meal.items.reduce((sum, item) => sum + item.kcal, 0)
}

function sortMealsByType(mealsList: MealWithItems[]) {
  const order = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']
  return [...mealsList].sort(
    (a, b) => order.indexOf(a.type) - order.indexOf(b.type)
  )
}

// Colored circle backgrounds for meal type icons
const MEAL_ICON_CIRCLES: Record<string, string> = {
  BREAKFAST: 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400',
  LUNCH: 'bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400',
  DINNER: 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400',
  SNACK: 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400',
}

export function MealTimeline({
  meals,
  expandedMealId,
  deletingMealId,
  onToggleExpand,
  onEdit,
  onDelete,
  onAddNew,
}: MealTimelineProps) {
  const sorted = sortMealsByType(meals)

  if (sorted.length === 0) {
    const phraseIdx = new Date().getDate() % NUTRITION_PHRASES.length

    return (
      <Card className="mb-6 overflow-hidden relative animate-slide-up">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-amber-500/5 pointer-events-none" />
        <CardContent className="relative flex flex-col items-center justify-center py-12 text-center">
          {/* Cooking emoji grid */}
          <div className="mb-5 grid grid-cols-4 gap-3 text-4xl">
            <span className="animate-float-animation" style={{ animationDelay: '0s' }}>🍳</span>
            <span className="animate-float-animation" style={{ animationDelay: '0.3s' }}>🥗</span>
            <span className="animate-float-animation" style={{ animationDelay: '0.6s' }}>🥘</span>
            <span className="animate-float-animation" style={{ animationDelay: '0.9s' }}>🥙</span>
          </div>
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/25">
            <UtensilsCrossed className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold mb-1">Нет записей о питании</h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-1">
            {NUTRITION_PHRASES[phraseIdx]}
          </p>
          <p className="text-xs text-muted-foreground/70 mb-6">
            Начни отслеживать калории уже сегодня
          </p>
          <Button
            size="lg"
            onClick={onAddNew}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all active-press"
          >
            <Plus className="h-5 w-5 mr-2" />
            Добавить приём пищи
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="stagger-children space-y-4">
      {sorted.map((meal) => {
        const config = MEAL_TYPE_CONFIG[meal.type] || MEAL_TYPE_CONFIG.LUNCH
        const totalKcal = getMealTotalKcal(meal)
        const isExpanded = expandedMealId === meal.id
        const iconCircleClass = MEAL_ICON_CIRCLES[meal.type] || MEAL_ICON_CIRCLES.LUNCH
        const formattedTime = meal.date
          ? new Date(meal.date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
          : ''

        return (
          <Card key={meal.id} className={`card-hover border-l-4 ${config.borderColor}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2.5 text-base">
                  {/* Drag-to-reorder grip dots */}
                  <div className="flex flex-col gap-0.5 cursor-grab active:cursor-grabbing opacity-30 hover:opacity-60 transition-opacity">
                    <GripVertical className="size-4 text-muted-foreground" />
                  </div>
                  {/* Meal type icon with colored circle */}
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${iconCircleClass} transition-transform hover:scale-110`}>
                    <span className="text-sm">{config.icon}</span>
                  </div>
                  <span>{config.label}</span>
                  {/* Prominent time badge */}
                  {formattedTime && (
                    <span className="flex items-center gap-1 rounded-full bg-muted/80 px-2.5 py-0.5 text-xs font-medium tabular-nums text-muted-foreground border border-muted">
                      <Clock className="size-3" />
                      {formattedTime}
                    </span>
                  )}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 dark:bg-orange-900/50 dark:text-orange-300 dark:hover:bg-orange-900/50 font-mono text-xs border-0">
                    <Flame className="mr-1 size-3 text-orange-500" />
                    {Math.round(totalKcal)} ккал
                  </Badge>
                  <button
                    onClick={() => onEdit(meal)}
                    className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                    title="Редактировать"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(meal.id)}
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
              <button
                onClick={() => onToggleExpand(meal.id)}
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

              <div
                className={`mt-2 space-y-2 overflow-hidden transition-all duration-300 ${
                  isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                {/* Photo placeholder */}
                <MealPhotoPlaceholder className="w-full h-auto" />
                {meal.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2.5 rounded-lg bg-muted/50 px-3 py-2"
                  >
                    <span className="text-sm font-medium truncate">{item.name}</span>
                    <div className="flex items-center gap-2.5 text-xs">
                      <span className="font-semibold text-orange-600 dark:text-orange-400">{Math.round(item.kcal)} ккал</span>
                      <span className="text-blue-600 dark:text-blue-400">Б {Math.round(item.protein)}г</span>
                      <span className="text-amber-600 dark:text-amber-400">Ж {Math.round(item.fat)}г</span>
                      <span className="text-green-600 dark:text-green-400">У {Math.round(item.carbs)}г</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
