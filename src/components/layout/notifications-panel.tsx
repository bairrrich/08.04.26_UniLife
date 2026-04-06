'use client'

import { useCallback, useMemo, useState } from 'react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Droplets,
  Dumbbell,
  Flame,
  Goal,
  Trophy,
  Zap,
  type LucideIcon,
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────

type NotificationType =
  | 'achievement'
  | 'goal_deadline'
  | 'habit_streak'
  | 'workout_reminder'
  | 'water_reminder'

interface NotificationItem {
  id: string
  type: NotificationType
  title: string
  description: string
  time: Date
  read: boolean
}

// ── Config maps ────────────────────────────────────────────────────────

interface TypeConfig {
  icon: LucideIcon
  border: string
  bg: string
  iconBg: string
  badgeBg: string
  badgeText: string
  label: string
}

const TYPE_CONFIG: Record<NotificationType, TypeConfig> = {
  achievement: {
    icon: Trophy,
    border: 'border-l-emerald-500',
    bg: 'bg-emerald-500/5',
    iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
    badgeBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    badgeText: 'bg-emerald-500',
    label: 'Достижение',
  },
  goal_deadline: {
    icon: Goal,
    border: 'border-l-red-500',
    bg: 'bg-red-500/5',
    iconBg: 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400',
    badgeBg: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
    badgeText: 'bg-red-500',
    label: 'Дедлайн',
  },
  habit_streak: {
    icon: Flame,
    border: 'border-l-orange-500',
    bg: 'bg-orange-500/5',
    iconBg: 'bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400',
    badgeBg: 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300',
    badgeText: 'bg-orange-500',
    label: 'Серия',
  },
  workout_reminder: {
    icon: Dumbbell,
    border: 'border-l-blue-500',
    bg: 'bg-blue-500/5',
    iconBg: 'bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400',
    badgeBg: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
    badgeText: 'bg-blue-500',
    label: 'Тренировка',
  },
  water_reminder: {
    icon: Droplets,
    border: 'border-l-cyan-500',
    bg: 'bg-cyan-500/5',
    iconBg: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-400',
    badgeBg: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300',
    badgeText: 'bg-cyan-500',
    label: 'Вода',
  },
}

// ── Relative time formatting (Russian) ────────────────────────────────

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'Только что'
  if (diffMin < 60) {
    const min = diffMin % 10 === 1 && diffMin !== 11 ? 'минуту' 
      : diffMin % 10 >= 2 && diffMin % 10 <= 4 && (diffMin < 12 || diffMin > 14) ? 'минуты'
      : 'минут'
    return `${diffMin} ${min} назад`
  }
  if (diffHours < 24) {
    const h = diffHours % 10 === 1 && diffHours !== 11 ? 'час'
      : diffHours % 10 >= 2 && diffHours % 10 <= 4 && (diffHours < 12 || diffHours > 14) ? 'часа'
      : 'часов'
    return `${diffHours} ${h} назад`
  }
  if (diffDays === 1) return 'Вчера'
  if (diffDays < 7) return `${diffDays} дн. назад`

  const months = [
    'янв', 'фев', 'мар', 'апр', 'мая', 'июн',
    'июл', 'авг', 'сен', 'окт', 'ноя', 'дек',
  ]
  return `${date.getDate()} ${months[date.getMonth()]}`
}

// ── Smart notification generator ──────────────────────────────────────

function generateSmartNotifications(): NotificationItem[] {
  const now = new Date()
  const hour = now.getHours()
  const dayOfWeek = now.getDay()
  const notifications: NotificationItem[] = []

  // Helper: create a date offset from now
  const minutesAgo = (min: number) => {
    const d = new Date(now)
    d.setMinutes(d.getMinutes() - min)
    return d
  }
  const hoursAgo = (h: number) => {
    const d = new Date(now)
    d.setHours(d.getHours() - h)
    return d
  }

  // ── 1. Achievement: habit streak notification ──
  notifications.push({
    id: 'notif-streak',
    type: 'habit_streak',
    title: 'Серия 7 дней! 🔥',
    description: 'Вы выполняете привычку «Медитация» уже 7 дней подряд. Продолжайте!',
    time: minutesAgo(25),
    read: false,
  })

  // ── 2. Goal deadline reminder ──
  notifications.push({
    id: 'notif-goal',
    type: 'goal_deadline',
    title: 'Дедлайн через 2 дня',
    description: 'Цель «Прочитать 3 книги» должна быть завершена в эту пятницу.',
    time: hoursAgo(1),
    read: false,
  })

  // ── 3. Achievement: milestone ──
  notifications.push({
    id: 'notif-achievement',
    type: 'achievement',
    title: 'Новый рекорд! 🏆',
    description: 'Вы установили личный рекорд — 5 тренировок за неделю. Отличный результат!',
    time: hoursAgo(3),
    read: false,
  })

  // ── 4. Water reminder (contextual) ──
  if (hour >= 10 && hour <= 20) {
    notifications.push({
      id: 'notif-water',
      type: 'water_reminder',
      title: 'Не забудьте про воду',
      description: 'Вы выпили 4 из 8 стаканов сегодня. Рекомендуем пополнить баланс.',
      time: minutesAgo(45),
      read: hour > 14, // Already read if afternoon
    })
  }

  // ── 5. Workout reminder (contextual) ──
  if (dayOfWeek !== 0) { // Not Sunday
    if (hour >= 7 && hour <= 11) {
      notifications.push({
        id: 'notif-workout-morning',
        type: 'workout_reminder',
        title: 'Утренняя тренировка',
        description: 'Хорошее время для тренировки! Сегодня можно сделать верхнюю часть тела.',
        time: minutesAgo(15),
        read: false,
      })
    } else if (hour >= 16 && hour <= 19) {
      notifications.push({
        id: 'notif-workout-evening',
        type: 'workout_reminder',
        title: 'Вечерняя активность',
        description: 'После рабочего дня полезна лёгкая тренировка. 20 минут уже дадут результат.',
        time: minutesAgo(30),
        read: false,
      })
    } else if (hour >= 20) {
      notifications.push({
        id: 'notif-workout-missed',
        type: 'workout_reminder',
        title: 'Тренировка сегодня?',
        description: 'Вы ещё не тренировались сегодня. Можно сделать растяжку перед сном.',
        time: hoursAgo(2),
        read: false,
      })
    }
  }

  // ── 6. Another habit streak ──
  notifications.push({
    id: 'notif-streak-2',
    type: 'habit_streak',
    title: 'Привычка «Чтение» — 14 дней 📚',
    description: 'Две недели непрерывного чтения. Вы уже на полпути к 30-дневной цели!',
    time: hoursAgo(5),
    read: true,
  })

  // ── 7. Achievement: financial ──
  notifications.push({
    id: 'notif-finance',
    type: 'achievement',
    title: 'Бюджет под контролем ✅',
    description: 'Расходы за неделю ниже плана на 12%. Вы отлично справляетесь с финансами!',
    time: hoursAgo(6),
    read: true,
  })

  // Sort: unread first, then by time descending
  notifications.sort((a, b) => {
    if (a.read !== b.read) return a.read ? 1 : -1
    return b.time.getTime() - a.time.getTime()
  })

  return notifications
}

// ── Skeleton Loader ────────────────────────────────────────────────────

function NotificationSkeleton() {
  return (
    <div className="flex gap-3 px-3 py-2.5">
      <div className="skeleton-shimmer h-8 w-8 rounded-full shrink-0" />
      <div className="flex-1 space-y-2 py-0.5">
        <div className="skeleton-shimmer h-3.5 w-3/4 rounded" />
        <div className="skeleton-shimmer h-3 w-full rounded" />
        <div className="skeleton-shimmer h-2.5 w-16 rounded" />
      </div>
    </div>
  )
}

// ── Empty State ────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
      <div className="relative mb-3">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400/20 to-primary/20 blur-sm" />
        <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
          <BellOff className="h-6 w-6 text-muted-foreground/50" />
        </div>
      </div>
      <h3 className="text-sm font-semibold text-muted-foreground mb-1">
        Нет уведомлений
      </h3>
      <p className="text-xs text-muted-foreground/60 max-w-[200px] leading-relaxed">
        Все в порядке! Новые уведомления появятся здесь автоматически.
      </p>
    </div>
  )
}

// ── Single Notification Card ──────────────────────────────────────────

function NotificationCard({
  notification,
  onMarkRead,
}: {
  notification: NotificationItem
  onMarkRead: (id: string) => void
}) {
  const config = TYPE_CONFIG[notification.type]
  const Icon = config.icon

  return (
    <div
      className={cn(
        'group relative rounded-lg px-3 py-2.5 transition-all duration-150',
        'border-l-[3px]',
        'hover:translate-x-[-2px]',
        config.border,
        notification.read ? 'opacity-50 hover:opacity-70' : config.bg,
      )}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
            config.iconBg,
          )}
        >
          <Icon className="h-4 w-4" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-0.5">
            <h4
              className={cn(
                'text-[13px] font-medium leading-snug',
                notification.read
                  ? 'text-muted-foreground'
                  : 'text-foreground',
              )}
            >
              {notification.title}
            </h4>
            {!notification.read && (
              <span className="shrink-0 mt-1.5 h-2 w-2 rounded-full bg-primary" />
            )}
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 mb-1">
            {notification.description}
          </p>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] text-muted-foreground/60 tabular-nums">
              {formatRelativeTime(notification.time)}
            </span>
            {!notification.read && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onMarkRead(notification.id)
                }}
                className="flex items-center gap-0.5 text-[10px] text-primary hover:text-primary/80 transition-colors shrink-0"
              >
                <Check className="h-2.5 w-2.5" />
                <span>Прочитано</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Popover Component ─────────────────────────────────────────────

export function NotificationsPopover() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [initialized, setInitialized] = useState(false)

  // Generate notifications on first open
  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      setOpen(nextOpen)
      if (nextOpen && !initialized) {
        setNotifications(generateSmartNotifications())
        setInitialized(true)
      }
    },
    [initialized],
  )

  // Computed values
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  )

  // Mark single as read
  const handleMarkRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    )
  }, [])

  // Mark all as read
  const handleMarkAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          className="relative flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          aria-label={`Уведомления${unreadCount > 0 ? ` (${unreadCount} непрочитанных)` : ''}`}
        >
          <Bell
            className={cn(
              'h-4 w-4',
              unreadCount > 0 && 'bell-pulse',
            )}
          />
          {/* Animated badge */}
          {unreadCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground animate-count-fade-in">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 sm:w-96 p-0 rounded-xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold">Уведомления</h2>
              {unreadCount > 0 && (
                <Badge className="h-5 min-w-5 px-1.5 text-[10px] font-bold tabular-nums">
                  {unreadCount}
                </Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground"
              >
                <CheckCheck className="h-3.5 w-3.5 mr-1" />
                Прочитать все
              </Button>
            )}
          </div>
        </div>

        <Separator />

        {/* Notification list */}
        <div className="max-h-96 overflow-y-auto scrollbar-thin">
          {!initialized && open ? (
            <div className="space-y-1 py-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <NotificationSkeleton key={i} />
              ))}
            </div>
          ) : notifications.length > 0 ? (
            <div className="py-2 space-y-0.5 animate-fade-in">
              {notifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onMarkRead={handleMarkRead}
                />
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </div>

        {/* Footer */}
        {initialized && notifications.length > 0 && (
          <>
            <Separator />
            <div className="px-4 py-2">
              <p className="text-[10px] text-muted-foreground/50 text-center">
                {unreadCount > 0
                  ? `${unreadCount} непрочитанных уведомлений`
                  : 'Все уведомления прочитаны'}
              </p>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}
