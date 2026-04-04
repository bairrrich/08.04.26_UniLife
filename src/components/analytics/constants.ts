import type { ChartConfig } from '@/components/ui/chart'

// ─── Constants ────────────────────────────────────────────────────────────────

export const PIE_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--chart-1) / 0.6)',
  'hsl(var(--chart-2) / 0.6)',
  'hsl(var(--chart-3) / 0.6)',
]

export const WORKOUT_TYPE_MAP: Record<string, string> = {
  'жим': 'Сила',
  'присед': 'Сила',
  'рука': 'Сила',
  'нога': 'Сила',
  'грудь': 'Сила',
  'спина': 'Сила',
  'плеч': 'Сила',
  'пресс': 'Сила',
  'bench': 'Сила',
  'squat': 'Сила',
  'deadlift': 'Сила',
  'pull': 'Сила',
  'бег': 'Кардио',
  'run': 'Кардио',
  'кардио': 'Кардио',
  'вело': 'Кардио',
  'плавание': 'Кардио',
  'прыжки': 'Кардио',
  'йога': 'Гибкость',
  'растяжк': 'Гибкость',
  'stretch': 'Гибкость',
  'HIIT': 'HIIT',
  'hiit': 'HIIT',
  'кроссфит': 'HIIT',
  'интервал': 'HIIT',
}

export const WORKOUT_TYPE_COLORS: Record<string, string> = {
  'Сила': 'hsl(var(--chart-1))',
  'Кардио': 'hsl(var(--chart-4))',
  'Гибкость': 'hsl(var(--chart-2))',
  'HIIT': 'hsl(var(--chart-5))',
  'Другое': 'hsl(var(--chart-3))',
}

// ─── Chart Configs ────────────────────────────────────────────────────────────

export const moodChartConfig: ChartConfig = {
  mood: { label: 'Настроение', color: 'hsl(var(--chart-1))' },
}

export const spendingChartConfig: ChartConfig = {
  spending: { label: 'Расходы', color: 'hsl(var(--chart-1))' },
  income: { label: 'Доходы', color: 'hsl(var(--chart-2))' },
}

export const nutritionChartConfig: ChartConfig = {
  calories: { label: 'Калории', color: 'hsl(var(--chart-4))' },
  protein: { label: 'Белки', color: 'hsl(var(--chart-1))' },
  fat: { label: 'Жиры', color: 'hsl(var(--chart-3))' },
  carbs: { label: 'Углеводы', color: 'hsl(var(--chart-2))' },
}

export const workoutPieConfig: ChartConfig = {
  value: { label: 'Тренировки', color: 'hsl(var(--chart-1))' },
  'Сила': { label: 'Сила', color: 'hsl(var(--chart-1))' },
  'Кардио': { label: 'Кардио', color: 'hsl(var(--chart-4))' },
  'Гибкость': { label: 'Гибкость', color: 'hsl(var(--chart-2))' },
  'HIIT': { label: 'HIIT', color: 'hsl(var(--chart-5))' },
  'Другое': { label: 'Другое', color: 'hsl(var(--chart-3))' },
}

export const categoryBarConfig: ChartConfig = {
  amount: { label: 'Сумма', color: 'hsl(var(--chart-1))' },
}
