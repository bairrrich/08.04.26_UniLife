// ─── Achievement Definitions ──────────────────────────────────────────────────

import type { Achievement, AchievementCategory } from './types'

export type AchievementDef = Omit<Achievement, 'earned' | 'earnedAt' | 'newlyEarned' | 'current'>

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
    threshold: 1,
  },
  {
    id: 'diary_streak_3',
    name: 'Три дня подряд',
    description: 'Пишите в дневник 3 дня подряд',
    icon: '📝',
    gradient: CATEGORY_COLORS.diary.gradient,
    category: 'diary',
    categoryLabel: CATEGORY_COLORS.diary.label,
    threshold: 3,
  },
  {
    id: 'diary_streak_7',
    name: 'Неделя без пропусков',
    description: 'Пишите в дневник 7 дней подряд',
    icon: '🔥',
    gradient: CATEGORY_COLORS.diary.gradient,
    category: 'diary',
    categoryLabel: CATEGORY_COLORS.diary.label,
    threshold: 7,
  },
  {
    id: 'diary_30_entries',
    name: '30 записей',
    description: 'Создайте 30 записей в дневнике',
    icon: '📚',
    gradient: CATEGORY_COLORS.diary.gradient,
    category: 'diary',
    categoryLabel: CATEGORY_COLORS.diary.label,
    threshold: 30,
  },
  // NEW: "Писатель" — write 10 diary entries
  {
    id: 'diary_writer_10',
    name: 'Писатель',
    description: 'Напишите 10 записей в дневнике',
    icon: '✍️',
    gradient: CATEGORY_COLORS.diary.gradient,
    category: 'diary',
    categoryLabel: CATEGORY_COLORS.diary.label,
    threshold: 10,
  },
  // NEW: "Марафонец" — 7 day diary streak (same as diary_streak_7, use 14 days instead)
  {
    id: 'diary_streak_14',
    name: 'Двухнедельный марафон',
    description: 'Пишите в дневник 14 дней подряд',
    icon: '🏅',
    gradient: CATEGORY_COLORS.diary.gradient,
    category: 'diary',
    categoryLabel: CATEGORY_COLORS.diary.label,
    threshold: 14,
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
    threshold: 1,
  },
  {
    id: 'savings_rate_positive',
    name: 'Положительный баланс',
    description: 'Доходы превышают расходы',
    icon: '📈',
    gradient: CATEGORY_COLORS.finance.gradient,
    category: 'finance',
    categoryLabel: CATEGORY_COLORS.finance.label,
    threshold: 1,
  },
  {
    id: 'finance_100_transactions',
    name: '100 транзакций',
    description: 'Запишите 100 транзакций',
    icon: '💰',
    gradient: CATEGORY_COLORS.finance.gradient,
    category: 'finance',
    categoryLabel: CATEGORY_COLORS.finance.label,
    threshold: 100,
  },
  // NEW: "Финансовый гуру" — track expenses for 30 days
  {
    id: 'finance_guru_30_days',
    name: 'Финансовый гуру',
    description: 'Отслеживайте расходы 30 дней подряд',
    icon: '🧮',
    gradient: CATEGORY_COLORS.finance.gradient,
    category: 'finance',
    categoryLabel: CATEGORY_COLORS.finance.label,
    threshold: 30,
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
    threshold: 1,
  },
  {
    id: 'workout_streak_3',
    name: '3 тренировки за неделю',
    description: 'Выполните 3+ тренировки за неделю',
    icon: '🏃',
    gradient: CATEGORY_COLORS.workout.gradient,
    category: 'workout',
    categoryLabel: CATEGORY_COLORS.workout.label,
    threshold: 3,
  },
  {
    id: 'workout_marathon',
    name: 'Марафонец',
    description: 'Накопите 1000 минут тренировок',
    icon: '🏅',
    gradient: CATEGORY_COLORS.workout.gradient,
    category: 'workout',
    categoryLabel: CATEGORY_COLORS.workout.label,
    threshold: 1000,
  },
  // NEW: "Здоровый образ жизни" — log 20 workouts
  {
    id: 'workout_20_logged',
    name: 'Здоровый образ жизни',
    description: 'Запишите 20 тренировок',
    icon: '🫀',
    gradient: CATEGORY_COLORS.workout.gradient,
    category: 'workout',
    categoryLabel: CATEGORY_COLORS.workout.label,
    threshold: 20,
  },
  // NEW: "Железная воля" — 7 day workout streak
  {
    id: 'workout_streak_7',
    name: 'Железная воля',
    description: 'Тренируйтесь 7 дней подряд',
    icon: '⚡',
    gradient: CATEGORY_COLORS.workout.gradient,
    category: 'workout',
    categoryLabel: CATEGORY_COLORS.workout.label,
    threshold: 7,
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
    threshold: 1,
  },
  {
    id: 'all_habits_complete',
    name: 'Все выполнены',
    description: 'Выполните все привычки за один день',
    icon: '✅',
    gradient: CATEGORY_COLORS.habits.gradient,
    category: 'habits',
    categoryLabel: CATEGORY_COLORS.habits.label,
    threshold: 1,
  },
  {
    id: 'habits_streak_7',
    name: 'Стрик 7 дней',
    description: 'Все привычки 7 дней подряд',
    icon: '⚡',
    gradient: CATEGORY_COLORS.habits.gradient,
    category: 'habits',
    categoryLabel: CATEGORY_COLORS.habits.label,
    threshold: 7,
  },
  // NEW: "Привычка на всю жизнь" — 30 day habits streak
  {
    id: 'habits_streak_30',
    name: 'Привычка на всю жизнь',
    description: 'Все привычки 30 дней подряд',
    icon: '🌟',
    gradient: CATEGORY_COLORS.habits.gradient,
    category: 'habits',
    categoryLabel: CATEGORY_COLORS.habits.label,
    threshold: 30,
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
    threshold: 1,
  },
  {
    id: 'water_goal',
    name: 'Водный баланс',
    description: 'Выпейте 8+ стаканов воды за день',
    icon: '💧',
    gradient: CATEGORY_COLORS.nutrition.gradient,
    category: 'nutrition',
    categoryLabel: CATEGORY_COLORS.nutrition.label,
    threshold: 2000,
  },
  // NEW: "Мастер питания" — track meals for 14 days
  {
    id: 'nutrition_master_14',
    name: 'Мастер питания',
    description: 'Отслеживайте питание 14 дней подряд',
    icon: '🥗',
    gradient: CATEGORY_COLORS.nutrition.gradient,
    category: 'nutrition',
    categoryLabel: CATEGORY_COLORS.nutrition.label,
    threshold: 14,
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
    threshold: 1,
  },
  {
    id: 'collections_10',
    name: 'Коллекционер',
    description: 'Соберите 10+ элементов',
    icon: '🏆',
    gradient: CATEGORY_COLORS.collections.gradient,
    category: 'collections',
    categoryLabel: CATEGORY_COLORS.collections.label,
    threshold: 10,
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
    threshold: 1,
  },
  {
    id: 'first_goal_completed',
    name: 'Цель достигнута',
    description: 'Завершите первую цель',
    icon: '🎉',
    gradient: CATEGORY_COLORS.goals.gradient,
    category: 'goals',
    categoryLabel: CATEGORY_COLORS.goals.label,
    threshold: 1,
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
    threshold: 1,
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
    threshold: 1,
  },
  {
    id: 'general_early_bird',
    name: 'Ранняя пташка',
    description: 'Вход в приложение до 8 утра',
    icon: '🌅',
    gradient: CATEGORY_COLORS.general.gradient,
    category: 'general',
    categoryLabel: CATEGORY_COLORS.general.label,
    threshold: 1,
  },
  // NEW: "Неделя огня" — 7 days of activity in a row
  {
    id: 'week_streak',
    name: 'Неделя огня',
    description: '7 дней активности подряд',
    icon: '🔥',
    gradient: CATEGORY_COLORS.general.gradient,
    category: 'general',
    categoryLabel: CATEGORY_COLORS.general.label,
    threshold: 7,
  },
  // NEW: "Книжный червь" — 10 diary entries
  {
    id: 'bookworm_10',
    name: 'Книжный червь',
    description: '10 записей в дневнике',
    icon: '📚',
    gradient: CATEGORY_COLORS.diary.gradient,
    category: 'diary',
    categoryLabel: CATEGORY_COLORS.diary.label,
    threshold: 10,
  },
  // NEW: "Финансовый гуру" — 50 transactions
  {
    id: 'finance_guru',
    name: 'Финансовый гуру',
    description: 'Добавлено 50 транзакций',
    icon: '💰',
    gradient: CATEGORY_COLORS.finance.gradient,
    category: 'finance',
    categoryLabel: CATEGORY_COLORS.finance.label,
    threshold: 50,
  },
  // NEW: "Железная воля" — 10 workouts in a month
  {
    id: 'iron_will',
    name: 'Железная воля',
    description: '10 тренировок за месяц',
    icon: '🏋️',
    gradient: CATEGORY_COLORS.workout.gradient,
    category: 'workout',
    categoryLabel: CATEGORY_COLORS.workout.label,
    threshold: 10,
  },
  // NEW: "Водный баланс" — 8 glasses of water in a day
  {
    id: 'water_balance',
    name: 'Водный баланс',
    description: '8 стаканов воды за день',
    icon: '💧',
    gradient: CATEGORY_COLORS.nutrition.gradient,
    category: 'nutrition',
    categoryLabel: CATEGORY_COLORS.nutrition.label,
    threshold: 2000,
  },
  // NEW: "Целеустремлённый" — complete 5 goals
  {
    id: 'goal_achiever',
    name: 'Целеустремлённый',
    description: 'Завершить 5 целей',
    icon: '🎯',
    gradient: CATEGORY_COLORS.goals.gradient,
    category: 'goals',
    categoryLabel: CATEGORY_COLORS.goals.label,
    threshold: 5,
  },
  // NEW: "На все 100%" — all habits completed in a day
  {
    id: 'perfect_day',
    name: 'На все 100%',
    description: 'Все привычки выполнены за день',
    icon: '⭐',
    gradient: CATEGORY_COLORS.habits.gradient,
    category: 'habits',
    categoryLabel: CATEGORY_COLORS.habits.label,
    threshold: 1,
  },
  // NEW: "Неделя продуктивности" — active day 5 days in a row
  {
    id: 'general_productive_week',
    name: 'Неделя продуктивности',
    description: 'Будьте активны 5 дней подряд',
    icon: '📅',
    gradient: CATEGORY_COLORS.general.gradient,
    category: 'general',
    categoryLabel: CATEGORY_COLORS.general.label,
    threshold: 5,
  },
  // NEW: "Полная гармония" — complete all modules in one day
  {
    id: 'general_full_harmony',
    name: 'Полная гармония',
    description: 'Заполните все модули за один день',
    icon: '🌈',
    gradient: CATEGORY_COLORS.general.gradient,
    category: 'general',
    categoryLabel: CATEGORY_COLORS.general.label,
    threshold: 1,
  },
]
