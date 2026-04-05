// ─── Achievement Definitions ──────────────────────────────────────────────────

import type { Achievement, AchievementCategory } from './types'

export type AchievementDef = Omit<Achievement, 'earned' | 'earnedAt' | 'newlyEarned'>

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
  collections: {
    gradient: 'from-pink-400 to-fuchsia-500',
    label: 'Коллекции',
  },
  goals: {
    gradient: 'from-cyan-400 to-blue-500',
    label: 'Цели',
  },
  feed: {
    gradient: 'from-lime-400 to-green-500',
    label: 'Лента',
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
    id: 'first_diary_entry',
    name: 'Первая запись',
    description: 'Создайте первую запись в дневнике',
    icon: '📖',
    gradient: CATEGORY_COLORS.diary.gradient,
    category: 'diary',
    categoryLabel: CATEGORY_COLORS.diary.label,
  },
  {
    id: 'diary_streak_3',
    name: 'Три дня подряд',
    description: 'Пишите в дневник 3 дня подряд',
    icon: '📝',
    gradient: CATEGORY_COLORS.diary.gradient,
    category: 'diary',
    categoryLabel: CATEGORY_COLORS.diary.label,
  },
  {
    id: 'diary_streak_7',
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
    icon: '📚',
    gradient: CATEGORY_COLORS.diary.gradient,
    category: 'diary',
    categoryLabel: CATEGORY_COLORS.diary.label,
  },

  // ── Финансы (Finance) ──
  {
    id: 'first_transaction',
    name: 'Первая транзакция',
    description: 'Запишите первую транзакцию',
    icon: '💳',
    gradient: CATEGORY_COLORS.finance.gradient,
    category: 'finance',
    categoryLabel: CATEGORY_COLORS.finance.label,
  },
  {
    id: 'savings_rate_positive',
    name: 'Положительный баланс',
    description: 'Доходы превышают расходы',
    icon: '📈',
    gradient: CATEGORY_COLORS.finance.gradient,
    category: 'finance',
    categoryLabel: CATEGORY_COLORS.finance.label,
  },
  {
    id: 'finance_100_transactions',
    name: '100 транзакций',
    description: 'Запишите 100 транзакций',
    icon: '💰',
    gradient: CATEGORY_COLORS.finance.gradient,
    category: 'finance',
    categoryLabel: CATEGORY_COLORS.finance.label,
  },

  // ── Тренировки (Workout) ──
  {
    id: 'first_workout',
    name: 'Первая тренировка',
    description: 'Запишите первую тренировку',
    icon: '💪',
    gradient: CATEGORY_COLORS.workout.gradient,
    category: 'workout',
    categoryLabel: CATEGORY_COLORS.workout.label,
  },
  {
    id: 'workout_streak_3',
    name: '3 тренировки за неделю',
    description: 'Выполните 3+ тренировки за неделю',
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
    id: 'first_habit_complete',
    name: 'Привычка выполнена',
    description: 'Завершите хотя бы одну привычку сегодня',
    icon: '🎯',
    gradient: CATEGORY_COLORS.habits.gradient,
    category: 'habits',
    categoryLabel: CATEGORY_COLORS.habits.label,
  },
  {
    id: 'all_habits_complete',
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
    description: 'Все привычки 7 дней подряд',
    icon: '⚡',
    gradient: CATEGORY_COLORS.habits.gradient,
    category: 'habits',
    categoryLabel: CATEGORY_COLORS.habits.label,
  },

  // ── Питание (Nutrition) ──
  {
    id: 'first_meal',
    name: 'Первый приём пищи',
    description: 'Запишите первый приём пищи',
    icon: '🍽️',
    gradient: CATEGORY_COLORS.nutrition.gradient,
    category: 'nutrition',
    categoryLabel: CATEGORY_COLORS.nutrition.label,
  },
  {
    id: 'water_goal',
    name: 'Водный баланс',
    description: 'Выпейте 8+ стаканов воды за день',
    icon: '💧',
    gradient: CATEGORY_COLORS.nutrition.gradient,
    category: 'nutrition',
    categoryLabel: CATEGORY_COLORS.nutrition.label,
  },

  // ── Коллекции (Collections) ──
  {
    id: 'first_collection',
    name: 'Первая коллекция',
    description: 'Добавьте первый элемент в коллекцию',
    icon: '📚',
    gradient: CATEGORY_COLORS.collections.gradient,
    category: 'collections',
    categoryLabel: CATEGORY_COLORS.collections.label,
  },
  {
    id: 'collections_10',
    name: 'Коллекционер',
    description: 'Соберите 10+ элементов',
    icon: '🏆',
    gradient: CATEGORY_COLORS.collections.gradient,
    category: 'collections',
    categoryLabel: CATEGORY_COLORS.collections.label,
  },

  // ── Цели (Goals) ──
  {
    id: 'first_goal_set',
    name: 'Первая цель',
    description: 'Создайте первую цель',
    icon: '🎯',
    gradient: CATEGORY_COLORS.goals.gradient,
    category: 'goals',
    categoryLabel: CATEGORY_COLORS.goals.label,
  },
  {
    id: 'first_goal_completed',
    name: 'Цель достигнута',
    description: 'Завершите первую цель',
    icon: '🎉',
    gradient: CATEGORY_COLORS.goals.gradient,
    category: 'goals',
    categoryLabel: CATEGORY_COLORS.goals.label,
  },

  // ── Лента (Feed) ──
  {
    id: 'first_post',
    name: 'Первый пост',
    description: 'Опубликуйте первую запись',
    icon: '📢',
    gradient: CATEGORY_COLORS.feed.gradient,
    category: 'feed',
    categoryLabel: CATEGORY_COLORS.feed.label,
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
