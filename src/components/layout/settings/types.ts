import { BookOpen, Wallet, Apple, Dumbbell, Library, Newspaper, Droplet, MessageCircle, ThumbsUp, Users, FileText, type LucideIcon } from 'lucide-react'

export const EXPORT_MODULES = [
  { key: 'diary', label: 'Дневник', icon: BookOpen, emoji: '📝' },
  { key: 'finance', label: 'Финансы', icon: Wallet, emoji: '💰' },
  { key: 'nutrition', label: 'Питание', icon: Apple, emoji: '🍎' },
  { key: 'workout', label: 'Тренировки', icon: Dumbbell, emoji: '💪' },
  { key: 'collections', label: 'Коллекции', icon: Library, emoji: '📚' },
  { key: 'feed', label: 'Лента', icon: Newspaper, emoji: '📰' },
] as const

interface NotificationCategoryDef {
  title: string
  description: string
  icon: LucideIcon
  items: NotificationItem[]
}

export const NOTIFICATIONS_CATEGORIES: NotificationCategoryDef[] = [
  {
    title: 'Дневник',
    description: 'Напоминания о дневнике',
    icon: BookOpen,
    items: [
      { key: 'diaryReminder', label: 'Ежедневное напоминание', description: 'Напоминание написать дневник каждый день' },
    ],
  },
  {
    title: 'Вода',
    description: 'Напоминания о воде',
    icon: Droplet,
    items: [
      { key: 'waterReminder', label: 'Напоминание о воде', description: 'Не забудьте выпить стакан воды' },
    ],
  },
  {
    title: 'Бюджет',
    description: 'Уведомления о бюджете',
    icon: Wallet,
    items: [
      { key: 'budgetWarning', label: 'Предупреждение о превышении', description: 'Уведомление при превышении лимита расходов' },
    ],
  },
  {
    title: 'Тренировки',
    description: 'Напоминания о тренировках',
    icon: Dumbbell,
    items: [
      { key: 'workoutReminder', label: 'Напоминание о тренировке', description: 'Напоминание о запланированной тренировке' },
      { key: 'goalReminder', label: 'Напоминание о целях', description: 'Подсказка обновить прогресс по целям' },
    ],
  },
  {
    title: 'Социальные',
    description: 'Лайки, комментарии, подписки',
    icon: Users,
    items: [
      { key: 'likeNotification', label: 'Лайки и реакции', description: 'Когда кто-то ставит лайк вашей записи' },
      { key: 'commentNotification', label: 'Комментарии', description: 'Новые комментарии к вашим постам' },
      { key: 'followNotification', label: 'Новые подписчики', description: 'Когда на вас подписываются' },
    ],
  },
  {
    title: 'Отчёты',
    description: 'Еженедельные отчёты и достижения',
    icon: FileText,
    items: [
      { key: 'weeklyReport', label: 'Еженедельный отчёт', description: 'Сводка прогресса за неделю' },
      { key: 'achievementNotification', label: 'Достижения', description: 'Уведомления о новых достижениях' },
    ],
  },
]

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
  goalReminder?: boolean
  likeNotification?: boolean
  commentNotification?: boolean
  followNotification?: boolean
  weeklyReport?: boolean
  achievementNotification?: boolean
}

export type NotificationItem = {
  key: keyof NotificationsState
  label: string
  description: string
}
