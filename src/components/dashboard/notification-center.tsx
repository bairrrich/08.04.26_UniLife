'use client'

import { memo } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Bell, Smile, Utensils, Moon, Target, ArrowRight } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReminderItem {
  id: string
  icon: React.ReactNode
  text: string
  timeLabel: string
  color: string
  onClick?: () => void
}

interface NotificationCenterProps {
  loading: boolean
  hasDiaryToday: boolean
  hasMealsToday: boolean
  uncompletedHabitsCount: number
  onNavigate?: (module: string) => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 22) return 'evening'
  return 'night'
}

function buildReminders(props: NotificationCenterProps): ReminderItem[] {
  const { hasDiaryToday, hasMealsToday, uncompletedHabitsCount, onNavigate } = props
  const timeOfDay = getTimeOfDay()
  const reminders: ReminderItem[] = []

  // Morning: suggest logging mood
  if (timeOfDay === 'morning' && !hasDiaryToday) {
    reminders.push({
      id: 'morning-mood',
      icon: <Smile className="h-4 w-4" />,
      text: 'Записать утреннее настроение',
      timeLabel: 'Утро',
      color: 'text-amber-500 bg-amber-100 dark:bg-amber-950/50 dark:text-amber-400',
      onClick: onNavigate ? () => onNavigate('diary') : undefined,
    })
  }

  // Morning/Afternoon: suggest logging breakfast
  if ((timeOfDay === 'morning' || timeOfDay === 'afternoon') && !hasMealsToday) {
    reminders.push({
      id: 'morning-meal',
      icon: <Utensils className="h-4 w-4" />,
      text: 'Записать приём пищи',
      timeLabel: timeOfDay === 'morning' ? 'Завтрак' : 'Обед',
      color: 'text-orange-500 bg-orange-100 dark:bg-orange-950/50 dark:text-orange-400',
      onClick: onNavigate ? () => onNavigate('nutrition') : undefined,
    })
  }

  // Evening: reflect on the day
  if (timeOfDay === 'evening' && !hasDiaryToday) {
    reminders.push({
      id: 'evening-diary',
      icon: <Moon className="h-4 w-4" />,
      text: 'Как прошёл день?',
      timeLabel: 'Вечер',
      color: 'text-blue-500 bg-blue-100 dark:bg-blue-950/50 dark:text-blue-400',
      onClick: onNavigate ? () => onNavigate('diary') : undefined,
    })
  }

  // Always: uncompleted habits
  if (uncompletedHabitsCount > 0) {
    reminders.push({
      id: 'habits-remaining',
      icon: <Target className="h-4 w-4" />,
      text: `${uncompletedHabitsCount} ${getHabitWord(uncompletedHabitsCount)} ещё не выполнено`,
      timeLabel: 'Привычки',
      color: 'text-violet-500 bg-violet-100 dark:bg-violet-950/50 dark:text-violet-400',
      onClick: onNavigate ? () => onNavigate('habits') : undefined,
    })
  }

  return reminders
}

function getHabitWord(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod100 >= 11 && mod100 <= 14) return 'привычек'
  if (mod10 === 1) return 'привычка'
  if (mod10 >= 2 && mod10 <= 4) return 'привычки'
  return 'привычек'
}

// ─── Component ────────────────────────────────────────────────────────────────

export default memo(function NotificationCenter(props: NotificationCenterProps) {
  const reminders = buildReminders(props)

  if (props.loading) {
    return (
      <Card className="animate-slide-up card-hover rounded-xl border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-5 w-28" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3.5 w-48" />
                <Skeleton className="h-2.5 w-12" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  // No reminders
  if (reminders.length === 0) {
    return (
      <Card className="animate-slide-up card-hover rounded-xl border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
              <Bell className="h-4 w-4 text-emerald-500" />
            </div>
            Напоминания
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 rounded-lg bg-emerald-50 px-4 py-3 dark:bg-emerald-950/20">
            <Smile className="h-5 w-5 shrink-0 text-emerald-500" />
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              Всё в порядке! У вас нет активных напоминаний
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="animate-slide-up card-hover rounded-xl border">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/50">
            <Bell className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          Напоминания
          <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
            {reminders.length}
          </span>
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-xs text-muted-foreground"
        >
          Показать все
          <ArrowRight className="h-3 w-3" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="stagger-children space-y-1.5">
          {reminders.map((reminder) => (
            <button
              key={reminder.id}
              onClick={reminder.onClick}
              className={`flex min-h-[44px] w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted/60 ${reminder.onClick ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${reminder.color}`}>
                {reminder.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-tight">{reminder.text}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {reminder.timeLabel}
                </p>
              </div>
              {reminder.onClick && (
                <span className="shrink-0 text-xs text-muted-foreground/60">→</span>
              )}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
})
