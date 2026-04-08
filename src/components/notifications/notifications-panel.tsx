'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/use-app-store'
import { cn } from '@/lib/utils'
import {
  BellOff,
  AlertTriangle,
  Flame,
  Wallet,
  Droplets,
  BookOpen,
  Dumbbell,
  Trophy,
  Check,
  CheckCheck,
  RefreshCw,
  Bell,
  Target,
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────

interface NotificationItem {
  id: string
  type: 'warning' | 'success' | 'info' | 'reminder'
  title: string
  description: string
  icon: string
  module: 'habits' | 'goals' | 'finance' | 'diary' | 'workout' | 'nutrition'
  actionUrl: string
  createdAt: string
  read: boolean
}

interface NotificationsData {
  notifications: NotificationItem[]
  unreadCount: number
}

// ── Config maps ────────────────────────────────────────────────────────

const TYPE_STYLES: Record<NotificationItem['type'], { border: string; bg: string; iconBg: string; badge: string; dot: string }> = {
  warning: {
    border: 'border-l-red-500',
    bg: 'bg-red-500/5',
    iconBg: 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400',
    badge: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
    dot: 'bg-red-500',
  },
  success: {
    border: 'border-l-emerald-500',
    bg: 'bg-emerald-500/5',
    iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    dot: 'bg-emerald-500',
  },
  info: {
    border: 'border-l-blue-500',
    bg: 'bg-blue-500/5',
    iconBg: 'bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
    dot: 'bg-blue-500',
  },
  reminder: {
    border: 'border-l-amber-500',
    bg: 'bg-amber-500/5',
    iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    dot: 'bg-amber-500',
  },
}

const TYPE_LABELS: Record<NotificationItem['type'], string> = {
  warning: 'Внимание',
  success: 'Достижение',
  info: 'Информация',
  reminder: 'Напоминание',
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  AlertTriangle,
  Flame,
  Wallet,
  Droplets,
  BookOpen,
  Dumbbell,
  Trophy,
  Bell,
  Target,
}

// ── Relative time formatting ──────────────────────────────────────────

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'Только что'
  if (diffMin < 60) return `${diffMin} мин назад`
  if (diffHours < 24) return `${diffHours} ч назад`
  if (diffDays === 1) return 'Вчера'
  if (diffDays < 7) return `${diffDays} дн назад`

  const months = [
    'янв', 'фев', 'мар', 'апр', 'мая', 'июн',
    'июл', 'авг', 'сен', 'окт', 'ноя', 'дек',
  ]
  return `${date.getDate()} ${months[date.getMonth()]}`
}

// ── Pluralization & Streak helpers ────────────────────────────────────

function pluralize(n: number, one: string, few: string, many: string): string {
  const abs = Math.abs(n)
  const mod10 = abs % 10
  const mod100 = abs % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few
  return many
}

function computeStreak(dates: Date[]): number {
  if (dates.length === 0) return 0
  const dateSet = new Set<string>()
  for (const d of dates) {
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    dateSet.add(key)
  }
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  let checkDate = new Date(today)
  if (!dateSet.has(todayKey)) {
    checkDate.setDate(checkDate.getDate() - 1)
  }
  let streak = 0
  for (let i = 0; i < 365; i++) {
    const target = new Date(checkDate)
    target.setDate(target.getDate() - i)
    const key = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`
    if (dateSet.has(key)) {
      streak++
    } else {
      break
    }
  }
  return streak
}

async function fetchContextualNotifications(): Promise<NotificationItem[]> {
  const notifications: NotificationItem[] = []
  const now = new Date()

  try {
    const [habitsRes, waterRes, diaryRes, workoutRes] = await Promise.all([
      fetch('/api/habits').then((r) => r.ok ? r.json() : null).catch(() => null),
      fetch('/api/nutrition/water').then((r) => r.ok ? r.json() : null).catch(() => null),
      fetch('/api/diary').then((r) => r.ok ? r.json() : null).catch(() => null),
      fetch('/api/workout').then((r) => r.ok ? r.json() : null).catch(() => null),
    ])

    // Habit reminders — uncompleted habits today
    if (habitsRes?.success && Array.isArray(habitsRes.data)) {
      const uncompleted = habitsRes.data.filter((h: { todayCompleted: boolean }) => !h.todayCompleted).length
      if (uncompleted > 0) {
        notifications.push({
          id: `ctx-habits-pending-${Date.now()}`,
          type: 'reminder',
          title: `${uncompleted} ${pluralize(uncompleted, 'привычка', 'привычки', 'привычек')} ждут выполнения`,
          description: 'Не забудьте выполнить свои привычки на сегодня. Каждое маленькое действие приближает к цели.',
          icon: 'Target',
          module: 'habits',
          actionUrl: '/?module=habits',
          createdAt: now.toISOString(),
          read: false,
        })
      }
    }

    // Water reminder — if < 4 glasses
    if (waterRes?.success && waterRes.data) {
      const glasses = waterRes.data.glasses ?? 0
      if (glasses < 4) {
        notifications.push({
          id: `ctx-water-${Date.now()}`,
          type: 'reminder',
          title: 'Не забудьте попить воды \uD83D\uDCA7',
          description: `Вы выпили только ${glasses} из 8 стаканов. Регулярное питьё воды — залог здоровья и энергии.`,
          icon: 'Droplets',
          module: 'nutrition',
          actionUrl: '/?module=nutrition',
          createdAt: now.toISOString(),
          read: false,
        })
      }
    }

    // Diary streak — 3+ consecutive days
    if (diaryRes?.data && Array.isArray(diaryRes.data)) {
      const dates = diaryRes.data.map((e: { date: string }) => new Date(e.date))
      const streak = computeStreak(dates)
      if (streak >= 3) {
        notifications.push({
          id: `ctx-diary-streak-${Date.now()}`,
          type: 'success',
          title: `Серия дневника: ${streak} дней \uD83D\uDD25`,
          description: 'Вы ведёте дневник уже несколько дней подряд. Отличная дисциплина!',
          icon: 'BookOpen',
          module: 'diary',
          actionUrl: '/?module=diary',
          createdAt: now.toISOString(),
          read: false,
        })
      }
    }

    // Workout streak — 3+ consecutive days
    if (workoutRes?.success && Array.isArray(workoutRes.data)) {
      const dates = workoutRes.data.map((w: { date: string }) => new Date(w.date))
      const streak = computeStreak(dates)
      if (streak >= 3) {
        notifications.push({
          id: `ctx-workout-streak-${Date.now()}`,
          type: 'success',
          title: `Серия тренировок: ${streak} дней \uD83D\uDCAA`,
          description: 'Отличная серия! Продолжайте тренироваться регулярно.',
          icon: 'Dumbbell',
          module: 'workout',
          actionUrl: '/?module=workout',
          createdAt: now.toISOString(),
          read: false,
        })
      }
    }
  } catch {
    // Silently fail — contextual notifications are optional enhancements
  }

  return notifications
}

// ── Skeleton Loader ────────────────────────────────────────────────────

function NotificationSkeleton() {
  return (
    <div className="flex gap-3 p-3 rounded-xl">
      <div className="skeleton-shimmer h-9 w-9 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="skeleton-shimmer h-4 w-3/4 rounded" />
        <div className="skeleton-shimmer h-3 w-full rounded" />
        <div className="skeleton-shimmer h-3 w-20 rounded" />
      </div>
    </div>
  )
}

function SkeletonList() {
  return (
    <div className="space-y-2 p-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <NotificationSkeleton key={i} />
      ))}
    </div>
  )
}

// ── Empty State ────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="relative mb-4">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400/20 to-primary/20 blur-sm" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
          <BellOff className="h-8 w-8 text-muted-foreground/50" />
        </div>
      </div>
      <h3 className="text-sm font-semibold text-muted-foreground mb-1">
        Нет уведомлений
      </h3>
      <p className="text-xs text-muted-foreground/60 max-w-[200px]">
        Все в порядке! Новые уведомления появятся здесь автоматически.
      </p>
    </div>
  )
}

// ── All Read State ─────────────────────────────────────────────────────

function AllReadState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="relative mb-4">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400/20 to-primary/20 blur-sm" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
          <Check className="h-8 w-8 text-emerald-500/60" />
        </div>
      </div>
      <h3 className="text-sm font-semibold text-muted-foreground mb-1">
        Всё прочитано
      </h3>
      <p className="text-xs text-muted-foreground/60 max-w-[200px]">
        Новых уведомлений нет. Вы в курсе всех событий!
      </p>
    </div>
  )
}

// ── Single Notification Card ──────────────────────────────────────────

function NotificationCard({
  notification,
  onMarkRead,
  onNavigate,
}: {
  notification: NotificationItem
  onMarkRead: (id: string) => void
  onNavigate: (module: string, url: string) => void
}) {
  const style = TYPE_STYLES[notification.type]
  const IconComponent = ICON_MAP[notification.icon] || Bell

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onNavigate(notification.module, notification.actionUrl)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNavigate(notification.module, notification.actionUrl) } }}
      className={cn(
        'group relative w-full text-left rounded-xl p-3 transition-all duration-200 cursor-pointer',
        'border-l-[3px]',
        'hover:translate-x-[-2px] active:scale-[0.98]',
        style.border,
        notification.read ? 'opacity-60' : style.bg,
        'hover:shadow-sm'
      )}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
            style.iconBg
          )}
        >
          <IconComponent className="h-4.5 w-4.5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-0.5">
            <h4 className={cn(
              'text-sm font-medium leading-snug',
              notification.read ? 'text-muted-foreground' : 'text-foreground'
            )}>
              {notification.title}
            </h4>
            {!notification.read && (
              <span className={cn('shrink-0 h-2 w-2 rounded-full mt-1.5', style.dot)} />
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-1.5">
            {notification.description}
          </p>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] text-muted-foreground/60 tabular-nums">
              {formatRelativeTime(notification.createdAt)}
            </span>
            {!notification.read && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onMarkRead(notification.id)
                }}
                className="flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 transition-colors shrink-0"
              >
                <Check className="h-3 w-3" />
                <span>Прочитано</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Group Header ───────────────────────────────────────────────────────

function GroupHeader({ type, count }: { type: NotificationItem['type']; count: number }) {
  const style = TYPE_STYLES[type]
  return (
    <div className="flex items-center gap-2 px-1 pt-3 pb-1 first:pt-1">
      <Badge variant="secondary" className={cn('text-[10px] font-medium', style.badge)}>
        {TYPE_LABELS[type]}
      </Badge>
      <span className="text-[10px] text-muted-foreground tabular-nums">{count}</span>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────

const READ_KEY = 'unilife-notifications-read'

function getReadIds(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(READ_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set()
  }
}

function saveReadIds(ids: Set<string>) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(READ_KEY, JSON.stringify([...ids]))
  } catch {
    // ignore
  }
}

export function NotificationsPanel({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [data, setData] = useState<NotificationsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [readIds, setReadIds] = useState<Set<string>>(new Set())
  const setNotificationCount = useAppStore((s) => s.setNotificationCount)
  const setActiveModule = useAppStore((s) => s.setActiveModule)
  const scrollRef = useRef<HTMLDivElement>(null)
  const touchStartRef = useRef<number | null>(null)

  // Fetch notifications (API + contextual client-side)
  const fetchNotifications = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      const [apiResult, contextual] = await Promise.all([
        fetch('/api/notifications')
          .then((r) => r.ok ? r.json() : null)
          .catch(() => null),
        fetchContextualNotifications(),
      ])

      const apiData = apiResult?.success && apiResult?.data
        ? apiResult.data as NotificationsData
        : null

      // Merge: contextual notifications first, then API (deduplicate by icon+module)
      const seen = new Set<string>()
      const merged: NotificationItem[] = []
      for (const ctx of contextual) {
        merged.push(ctx)
        seen.add(`${ctx.icon}-${ctx.module}`)
      }
      if (apiData?.notifications) {
        for (const n of apiData.notifications) {
          const key = `${n.icon}-${n.module}`
          if (!seen.has(key)) {
            merged.push(n)
          }
        }
      }

      setData({
        notifications: merged,
        unreadCount: merged.length,
      })
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    if (open) {
      const stored = getReadIds()
      setReadIds(stored)
      fetchNotifications()
    }
  }, [open, fetchNotifications])

  // Update unread count in store when data changes
  useEffect(() => {
    if (!data) return
    const unread = data.notifications.filter((n) => !readIds.has(n.id)).length
    setNotificationCount(unread)
  }, [data, readIds, setNotificationCount])

  // Mark as read
  const handleMarkRead = useCallback((id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev)
      next.add(id)
      saveReadIds(next)
      return next
    })
  }, [])

  // Mark all as read
  const handleMarkAllRead = useCallback(() => {
    if (!data) return
    const next = new Set(readIds)
    for (const n of data.notifications) {
      next.add(n.id)
    }
    setReadIds(next)
    saveReadIds(next)
  }, [data, readIds])

  // Navigate to module
  const handleNavigate = useCallback((module: string, url: string) => {
    setActiveModule(module as 'habits' | 'goals' | 'finance' | 'diary' | 'workout' | 'nutrition')
    onOpenChange(false)
  }, [setActiveModule, onOpenChange])

  // Pull-to-refresh for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const scrollTop = scrollRef.current?.scrollTop || 0
    if (scrollTop <= 0) {
      touchStartRef.current = e.touches[0].clientY
    }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartRef.current === null) return
    const diff = e.touches[0].clientY - touchStartRef.current
    if (diff > 80) {
      touchStartRef.current = null
      fetchNotifications(true)
    }
  }, [fetchNotifications])

  const handleTouchEnd = useCallback(() => {
    touchStartRef.current = null
  }, [])

  // Compute unread count
  const unreadCount = data
    ? data.notifications.filter((n) => !readIds.has(n.id)).length
    : 0

  // Group notifications by type
  const grouped = data
    ? data.notifications.reduce<Record<string, NotificationItem[]>>((acc, n) => {
        if (!acc[n.type]) acc[n.type] = []
        acc[n.type].push(n)
        return acc
      }, {})
    : {}

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 flex flex-col"
      >
        {/* Header */}
        <SheetHeader className="px-4 pt-4 pb-3 border-b shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <SheetTitle className="text-base font-semibold flex items-center gap-2">
                <Bell className="h-4.5 w-4.5 text-primary" />
                Уведомления
              </SheetTitle>
              {unreadCount > 0 && (
                <Badge className="h-5 min-w-5 px-1.5 text-[10px] font-bold tabular-nums animate-count-fade-in">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllRead}
                  className="h-7 text-xs text-muted-foreground hover:text-foreground"
                >
                  <CheckCheck className="h-3.5 w-3.5 mr-1" />
                  Прочитать все
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => fetchNotifications(true)}
                disabled={refreshing}
              >
                <RefreshCw className={cn('h-3.5 w-3.5', refreshing && 'animate-spin')} />
              </Button>
            </div>
          </div>
          <SheetDescription className="sr-only">
            Центр уведомлений UniLife
          </SheetDescription>
        </SheetHeader>

        {/* Content */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {loading ? (
            <div className="p-3">
              <SkeletonList />
            </div>
          ) : !data || data.notifications.length === 0 ? (
            <EmptyState />
          ) : unreadCount === 0 ? (
            <AllReadState />
          ) : (
            <div className="p-3 space-y-1 animate-fade-in stagger-children">
              {Object.entries(grouped).map(([type, items]) => (
                <div key={type}>
                  <GroupHeader
                    type={type as NotificationItem['type']}
                    count={items.length}
                  />
                  <div className="space-y-1">
                    {items.map((notification) => (
                      <NotificationCard
                        key={notification.id}
                        notification={notification}
                        onMarkRead={handleMarkRead}
                        onNavigate={handleNavigate}
                      />
                    ))}
                  </div>
                </div>
              ))}

              {/* Refreshing overlay */}
              {refreshing && (
                <div className="flex items-center justify-center py-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Обновление...
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && data && data.notifications.length > 0 && (
          <div className="border-t px-4 py-3 shrink-0">
            <p className="text-[10px] text-muted-foreground/50 text-center">
              Потяните вниз для обновления
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
