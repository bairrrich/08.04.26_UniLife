// ─── Achievement Definitions ──────────────────────────────────────────────────

import type { Achievement, AchievementCategory } from './types'

export type AchievementDef = Omit<Achievement, 'earned' | 'earnedAt'>

// ─── Color Schemes ────────────────────────────────────────────────────────────

export const CATEGORY_COLORS: Record<AchievementCategory, { gradient: string; label: string }> = {
  diary: {
    gradient: 'from-emerald-400 to-teal-500',
    label: 'Дневник',
  },
  finance: {
    gradient: 'from-amber-400 to-orange-500',
    label: 'Финансы',
  },
  workout: {
    gradient: 'from-blue-400 to-indigo-500',
    label: 'Тренировки',
  },
  habits: {
    gradient: 'from-violet-400 to-purple-500',
    label: 'Привычки',
  },
  nutrition: {
    gradient: 'from-orange-400 to-rose-500',
    label: 'Питание',
  },
  general: {
    gradient: 'from-emerald-400 to-cyan-500',
    label: 'Общие',
  },
}

// ─── Achievement Definitions ──────────────────────────────────────────────────

export const ACHIEVEMENT_DEFINITIONS: AchievementDef[] = [
  // ── Дневник (Diary) ──
  {
    id: 'diary_first_entry',
    name: 'Первая запись',
    description: 'Создайте первую запись в дневнике',
    icon: '📖',
    gradient: CATEGORY_COLORS.diary.gradient,
    category: 'diary',
    categoryLabel: CATEGORY_COLORS.diary.label,
  },
  {
    id: 'diary_week_streak',
    name: 'Неделя без пропусков',
    description: 'Пишите в дневник 7 дней подряд',
    icon: '🔥',
    gradient: CATEGORY_COLORS.diary.gradient,
    category: 'diary',
    categoryLabel: CATEGORY_COLORS.diary.label,
  },
  {
    id: 'diary_30_entries',
    name: '30 записей',
    description: 'Создайте 30 записей в дневнике',
    icon: '📝',
    gradient: CATEGORY_COLORS.diary.gradient,
    category: 'diary',
    categoryLabel: CATEGORY_COLORS.diary.label,
  },

  // ── Финансы (Finance) ──
  {
    id: 'finance_first_budget',
    name: 'Первый бюджет',
    description: 'Установите бюджет хотя бы на одну категорию',
    icon: '💰',
    gradient: CATEGORY_COLORS.finance.gradient,
    category: 'finance',
    categoryLabel: CATEGORY_COLORS.finance.label,
  },
  {
    id: 'finance_savings_month',
    name: 'Месяц экономии',
    description: 'Норма сбережений больше 20%',
    icon: '📊',
    gradient: CATEGORY_COLORS.finance.gradient,
    category: 'finance',
    categoryLabel: CATEGORY_COLORS.finance.label,
  },
  {
    id: 'finance_100_transactions',
    name: '100 транзакций',
    description: 'Запишите 100 транзакций',
    icon: '💳',
    gradient: CATEGORY_COLORS.finance.gradient,
    category: 'finance',
    categoryLabel: CATEGORY_COLORS.finance.label,
  },

  // ── Тренировки (Workout) ──
  {
    id: 'workout_first',
    name: 'Первая тренировка',
    description: 'Запишите первую тренировку',
    icon: '💪',
    gradient: CATEGORY_COLORS.workout.gradient,
    category: 'workout',
    categoryLabel: CATEGORY_COLORS.workout.label,
  },
  {
    id: 'workout_week_7',
    name: 'Неделя спорта',
    description: 'Выполните 7 тренировок за месяц',
    icon: '🏃',
    gradient: CATEGORY_COLORS.workout.gradient,
    category: 'workout',
    categoryLabel: CATEGORY_COLORS.workout.label,
  },
  {
    id: 'workout_marathon',
    name: 'Марафонец',
    description: 'Накопите 1000 минут тренировок',
    icon: '🏅',
    gradient: CATEGORY_COLORS.workout.gradient,
    category: 'workout',
    categoryLabel: CATEGORY_COLORS.workout.label,
  },

  // ── Привычки (Habits) ──
  {
    id: 'habits_first',
    name: 'Первая привычка',
    description: 'Добавьте хотя бы одну привычку',
    icon: '🎯',
    gradient: CATEGORY_COLORS.habits.gradient,
    category: 'habits',
    categoryLabel: CATEGORY_COLORS.habits.label,
  },
  {
    id: 'habits_all_done',
    name: 'Все выполнены',
    description: 'Выполните все привычки за один день',
    icon: '✅',
    gradient: CATEGORY_COLORS.habits.gradient,
    category: 'habits',
    categoryLabel: CATEGORY_COLORS.habits.label,
  },
  {
    id: 'habits_streak_7',
    name: 'Стрик 7 дней',
    description: 'Поддерживайте стрик привычки 7 дней',
    icon: '⚡',
    gradient: CATEGORY_COLORS.habits.gradient,
    category: 'habits',
    categoryLabel: CATEGORY_COLORS.habits.label,
  },

  // ── Питание (Nutrition) ──
  {
    id: 'nutrition_balanced',
    name: 'Сбалансированный день',
    description: 'Получите все макросы за день',
    icon: '🥗',
    gradient: CATEGORY_COLORS.nutrition.gradient,
    category: 'nutrition',
    categoryLabel: CATEGORY_COLORS.nutrition.label,
  },
  {
    id: 'nutrition_tracking_week',
    name: 'Неделя трекинга',
    description: 'Отслеживайте питание 7 дней подряд',
    icon: '🥤',
    gradient: CATEGORY_COLORS.nutrition.gradient,
    category: 'nutrition',
    categoryLabel: CATEGORY_COLORS.nutrition.label,
  },

  // ── Общие (General) ──
  {
    id: 'general_active_day',
    name: 'Активный день',
    description: 'Выполните все ежедневные задачи за день',
    icon: '🏆',
    gradient: CATEGORY_COLORS.general.gradient,
    category: 'general',
    categoryLabel: CATEGORY_COLORS.general.label,
  },
  {
    id: 'general_early_bird',
    name: 'Ранний пташка',
    description: 'Напишите в дневник до 8 утра',
    icon: '🐦',
    gradient: CATEGORY_COLORS.general.gradient,
    category: 'general',
    categoryLabel: CATEGORY_COLORS.general.label,
  },
]
