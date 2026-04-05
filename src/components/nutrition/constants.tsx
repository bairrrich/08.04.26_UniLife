import {
  Sun,
  UtensilsCrossed,
  Moon,
  Apple,
} from 'lucide-react'

// ─── Macro Goals ────────────────────────────────────────────────────────────

export const MACRO_GOALS = {
  kcal: { value: 2500, unit: '', label: 'Ккал', color: '#f97316', bgColor: '#fff7ed', darkBgColor: '#431407' },
  protein: { value: 150, unit: 'г', label: 'Белки', color: '#3b82f6', bgColor: '#eff6ff', darkBgColor: '#172554' },
  fat: { value: 80, unit: 'г', label: 'Жиры', color: '#f59e0b', bgColor: '#fffbeb', darkBgColor: '#451a03' },
  carbs: { value: 300, unit: 'г', label: 'Углеводы', color: '#22c55e', bgColor: '#f0fdf4', darkBgColor: '#052e16' },
} as const

export type MacroKey = keyof typeof MACRO_GOALS

// ─── Meal Type Config ───────────────────────────────────────────────────────

export const MEAL_TYPE_CONFIG: Record<
  string,
  { label: string; emoji: string; icon: React.ReactNode }
> = {
  BREAKFAST: { label: 'Завтрак', emoji: '\u2600\uFE0F', icon: <Sun className="size-4" /> },
  LUNCH: { label: 'Обед', emoji: '\uD83C\uDFD7\uFE0F', icon: <UtensilsCrossed className="size-4" /> },
  DINNER: { label: 'Ужин', emoji: '\uD83C\uDF19', icon: <Moon className="size-4" /> },
  SNACK: { label: 'Перекус', emoji: '\uD83C\uDF4E', icon: <Apple className="size-4" /> },
}

export const MEAL_TYPE_ORDER = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']

// ─── Helpers ────────────────────────────────────────────────────────────────

export const formatMacro = (val: number, unit: string) => `${Math.round(val)}${unit}`

// ─── Water Constants ────────────────────────────────────────────────────────

export const WATER_HISTORY_KEY = 'unilife-water-history'
export const WATER_GOAL = 2000
export const TOTAL_GLASSES = 8
export const DEFAULT_GLASS_ML = 250
