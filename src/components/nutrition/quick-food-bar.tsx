'use client'

import { Coffee, Apple, Sandwich, Cookie, Milk, Wheat, IceCream, Salad } from 'lucide-react'
import type { MealFormItem } from './meal-dialog'
import { cn } from '@/lib/utils'

interface QuickFoodBarProps {
  onAddFood: (item: MealFormItem) => void
}

interface FoodPreset {
  name: string
  kcal: number
  protein: number
  fat: number
  carbs: number
  icon: React.ReactNode
  color: string
}

const FOODS: FoodPreset[] = [
  { name: 'Кофе', kcal: 5, protein: 0, fat: 0, carbs: 1, icon: <Coffee className="h-3 w-3" />, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  { name: 'Яблоко', kcal: 95, protein: 0, fat: 0, carbs: 25, icon: <Apple className="h-3 w-3" />, color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
  { name: 'Банан', kcal: 105, protein: 1, fat: 0, carbs: 27, icon: <Sandwich className="h-3 w-3" />, color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300' },
  { name: 'Овсянка', kcal: 180, protein: 6, fat: 3, carbs: 32, icon: <Wheat className="h-3 w-3" />, color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' },
  { name: 'Яйцо', kcal: 155, protein: 13, fat: 11, carbs: 1, icon: <Milk className="h-3 w-3" />, color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300' },
  { name: 'Салат', kcal: 45, protein: 2, fat: 0, carbs: 8, icon: <Salad className="h-3 w-3" />, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
  { name: 'Печенье', kcal: 120, protein: 1, fat: 5, carbs: 17, icon: <Cookie className="h-3 w-3" />, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  { name: 'Мороженое', kcal: 207, protein: 4, fat: 11, carbs: 24, icon: <IceCream className="h-3 w-3" />, color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300' },
]

export function QuickFoodBar({ onAddFood }: QuickFoodBarProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">Быстрое добавление</p>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {FOODS.map((food) => (
          <button
            key={food.name}
            onClick={() => onAddFood({
              name: food.name,
              kcal: String(food.kcal),
              protein: String(food.protein),
              fat: String(food.fat),
              carbs: String(food.carbs),
            })}
            className={cn(
              'flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium border border-transparent',
              'transition-all duration-150 active-press hover:scale-[1.03] hover:shadow-sm',
              'hover:border-muted-foreground/20 shrink-0',
              food.color
            )}
          >
            {food.icon}
            <div className="flex flex-col items-start">
              <span className="leading-tight">{food.name}</span>
              <span className="text-[10px] opacity-60 font-semibold tabular-nums">{food.kcal} ккал</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
