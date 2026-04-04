// ─── Nutrition Module Types ─────────────────────────────────────────────────

export interface MealItem {
  name: string
  kcal: number
  protein: number
  fat: number
  carbs: number
}

export interface MealWithItems {
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

export interface NutritionStats {
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

export interface WaterStats {
  totalMl: number
  glasses: number
  goalMl: number
  percentage: number
}
