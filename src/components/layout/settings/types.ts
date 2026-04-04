import { BookOpen, Wallet, Apple, Dumbbell, Library, Newspaper } from 'lucide-react'

export const EXPORT_MODULES = [
  { key: 'diary', label: 'Дневник', icon: BookOpen, emoji: '📝' },
  { key: 'finance', label: 'Финансы', icon: Wallet, emoji: '💰' },
  { key: 'nutrition', label: 'Питание', icon: Apple, emoji: '🍎' },
  { key: 'workout', label: 'Тренировки', icon: Dumbbell, emoji: '💪' },
  { key: 'collections', label: 'Коллекции', icon: Library, emoji: '📚' },
  { key: 'feed', label: 'Лента', icon: Newspaper, emoji: '📰' },
] as const

export const NOTIFICATIONS_CONFIG = [
  { key: 'diaryReminder', label: 'Ежедневное напоминание о дневнике', description: 'Напоминание написать дневник каждый день' },
  { key: 'waterReminder', label: 'Напоминание о воде', description: 'Не забудьте выпить стакан воды' },
  { key: 'budgetWarning', label: 'Бюджет: предупреждение о превышении', description: 'Уведомление при превышении лимита расходов' },
  { key: 'workoutReminder', label: 'Тренировка: напоминание', description: 'Напоминание о запланированной тренировке' },
] as const

export type NotificationsState = {
  diaryReminder: boolean
  waterReminder: boolean
  budgetWarning: boolean
  workoutReminder: boolean
}
