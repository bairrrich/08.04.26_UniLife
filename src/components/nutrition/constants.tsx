import {
  Sun,
  UtensilsCrossed,
  Moon,
  Apple,
  Coffee,
  Sunset,
  CakeSlice,
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
  { label: string; emoji: string; icon: React.ReactNode; borderColor: string; iconBg: string; iconColor: string }
> = {
  BREAKFAST: { label: 'Завтрак', emoji: '\u2600\uFE0F', icon: <Coffee className="size-4" />, borderColor: 'border-l-amber-400', iconBg: 'bg-amber-100 dark:bg-amber-900/50', iconColor: 'text-amber-600 dark:text-amber-400' },
  LUNCH: { label: 'Обед', emoji: '\uD83C\uDFD7\uFE0F', icon: <UtensilsCrossed className="size-4" />, borderColor: 'border-l-orange-400', iconBg: 'bg-orange-100 dark:bg-orange-900/50', iconColor: 'text-orange-600 dark:text-orange-400' },
  DINNER: { label: 'Ужин', emoji: '\uD83C\uDF19', icon: <Sunset className="size-4" />, borderColor: 'border-l-rose-400', iconBg: 'bg-rose-100 dark:bg-rose-900/50', iconColor: 'text-rose-600 dark:text-rose-400' },
  SNACK: { label: 'Перекус', emoji: '\uD83C\uDF4E', icon: <CakeSlice className="size-4" />, borderColor: 'border-l-purple-400', iconBg: 'bg-purple-100 dark:bg-purple-900/50', iconColor: 'text-purple-600 dark:text-purple-400' },
}

export const MEAL_TYPE_ORDER = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']

// ─── Helpers ────────────────────────────────────────────────────────────────

export const formatMacro = (val: number, unit: string) => `${Math.round(val)}${unit}`

// ─── Water Constants ────────────────────────────────────────────────────────

export const WATER_HISTORY_KEY = 'unilife-water-history'
export const WATER_GOAL = 2000
export const TOTAL_GLASSES = 8
export const DEFAULT_GLASS_ML = 250

// ─── Quick Food Presets ──────────────────────────────────────────────────────

export const FOOD_PRESETS = [
  { name: 'Кофе с молоком', kcal: 45, protein: 2, fat: 2, carbs: 5 },
  { name: 'Яичница', kcal: 220, protein: 14, fat: 17, carbs: 1 },
  { name: 'Салат', kcal: 150, protein: 5, fat: 8, carbs: 15 },
  { name: 'Куриная грудка', kcal: 250, protein: 46, fat: 5, carbs: 0 },
  { name: 'Овсянка', kcal: 180, protein: 6, fat: 3, carbs: 32 },
  { name: 'Банан', kcal: 105, protein: 1, fat: 0, carbs: 27 },
] as const

// ─── Motivational Phrases ────────────────────────────────────────────────────

export const NUTRITION_PHRASES = [
  'Правильное питание — залог энергии на весь день!',
  'Каждый приём пищи — шаг к здоровому образу жизни',
  'Отслеживай питание, чтобы достигать своих целей',
  'Маленькие привычки ведут к большим результатам',
]
