'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Flame, UtensilsCrossed, Trash2, Clock, ChevronDown, ChevronUp, Pencil, Plus } from 'lucide-react'
import { MEAL_TYPE_CONFIG, NUTRITION_PHRASES } from './constants'
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
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-orange-500/25">
            <UtensilsCrossed className="h-10 w-10 text-white" />
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

        return (
          <Card key={meal.id} className={`card-hover border-l-4 ${config.borderColor}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2.5 text-base">
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${config.iconBg}`}>
                    <span className={config.iconColor}>{config.icon}</span>
                  </div>
                  <span>{config.label}</span>
                  <span className="flex items-center gap-1 rounded-md bg-muted/60 px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                    <Clock className="size-3" />
                    {meal.date ? new Date(meal.date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 font-mono text-xs border-0">
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
  )
}
