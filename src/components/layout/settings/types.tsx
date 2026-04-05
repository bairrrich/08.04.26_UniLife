import { BookOpen, Wallet, Apple, Dumbbell, Library, Newspaper, Bell, Users, Shield } from 'lucide-react'

export const EXPORT_MODULES = [
  { key: 'diary', label: 'Дневник', icon: BookOpen, emoji: '📝' },
  { key: 'finance', label: 'Финансы', icon: Wallet, emoji: '💰' },
  { key: 'nutrition', label: 'Питание', icon: Apple, emoji: '🍎' },
  { key: 'workout', label: 'Тренировки', icon: Dumbbell, emoji: '💪' },
  { key: 'collections', label: 'Коллекции', icon: Library, emoji: '📚' },
  { key: 'feed', label: 'Лента', icon: Newspaper, emoji: '📰' },
] as const

// ─── Notification Categories ──────────────────────────────────────────────────

export interface NotificationItem {
  key: string
  label: string
  description: string
}

export interface NotificationCategory {
  title: string
  icon: React.ReactNode
  description: string
  items: NotificationItem[]
}

export const NOTIFICATIONS_CATEGORIES: NotificationCategory[] = [
  {
    title: 'Напоминания',
    icon: <Bell className="h-4 w-4 text-amber-500" />,
    description: 'Ежедневные напоминания о важных действиях',
    items: [
      { key: 'diaryReminder', label: 'Напоминание о дневнике', description: 'Ежедневное напоминание написать дневник' },
      { key: 'waterReminder', label: 'Напоминание о воде', description: 'Не забудьте выпить стакан воды' },
      { key: 'workoutReminder', label: 'Напоминание о тренировке', description: 'Уведомление о запланированной тренировке' },
      { key: 'goalReminder', label: 'Напоминание о целях', description: 'Подсказка обновить прогресс по целям' },
    ],
  },
  {
    title: 'Социальные',
    icon: <Users className="h-4 w-4 text-blue-500" />,
    description: 'Уведомления о действиях других пользователей',
    items: [
      { key: 'likeNotification', label: 'Лайки и реакции', description: 'Когда кто-то ставит лайк вашей записи' },
      { key: 'commentNotification', label: 'Комментарии', description: 'Новые комментарии к вашим постам' },
      { key: 'followNotification', label: 'Новые подписчики', description: 'Когда на вас подписываются' },
    ],
  },
  {
    title: 'Система',
    icon: <Shield className="h-4 w-4 text-emerald-500" />,
    description: 'Системные уведомления и предупреждения',
    items: [
      { key: 'budgetWarning', label: 'Бюджет: предупреждение', description: 'Уведомление при превышении лимита расходов' },
      { key: 'weeklyReport', label: 'Еженедельный отчёт', description: 'Сводка прогресса за неделю' },
      { key: 'achievementNotification', label: 'Достижения', description: 'Уведомления о новых достижениях' },
    ],
  },
]

// Flatten for backward compatibility
export const NOTIFICATIONS_CONFIG = NOTIFICATIONS_CATEGORIES.flatMap(c => c.items)

export type NotificationsState = {
  diaryReminder: boolean
  waterReminder: boolean
  budgetWarning: boolean
  workoutReminder: boolean
  goalReminder: boolean
  likeNotification: boolean
  commentNotification: boolean
  followNotification: boolean
  weeklyReport: boolean
  achievementNotification: boolean
}
