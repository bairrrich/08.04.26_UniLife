'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Bell, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { NOTIFICATIONS_CATEGORIES, type NotificationsState } from './types'

export function NotificationsSection() {
  const [notifications, setNotifications] = useState<NotificationsState>({
    diaryReminder: true,
    waterReminder: true,
    budgetWarning: true,
    workoutReminder: false,
    goalReminder: false,
    likeNotification: true,
    commentNotification: true,
    followNotification: false,
    weeklyReport: true,
    achievementNotification: true,
  })

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(NOTIFICATIONS_CATEGORIES.map(c => c.title))
  )

  const handleNotificationChange = (key: string, checked: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: checked }))
    toast.info(checked ? 'Уведомление включено' : 'Уведомление отключено')
  }

  const toggleCategory = (title: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(title)) {
        next.delete(title)
      } else {
        next.add(title)
      }
      return next
    })
  }

  // Count total enabled/disabled
  const allKeys = NOTIFICATIONS_CATEGORIES.flatMap(c => c.items.map(i => i.key))
  const enabledCount = allKeys.filter(k => (notifications as Record<string, boolean>)[k]).length
  const totalCount = allKeys.length

  return (
    <Card className="rounded-xl overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-amber-400 to-amber-500" />
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Уведомления
            </CardTitle>
            <CardDescription className="mt-1">
              Настройка оповещений и напоминаний
            </CardDescription>
          </div>
          {/* Summary badge */}
          <div className="flex items-center gap-2">
            <span className={cn(
              'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium tabular-nums',
              enabledCount === totalCount
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                : enabledCount > totalCount / 2
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
            )}>
              {enabledCount}/{totalCount}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {NOTIFICATIONS_CATEGORIES.map((category) => {
          const isExpanded = expandedCategories.has(category.title)
          const categoryKeys = category.items.map(i => i.key)
          const categoryEnabled = categoryKeys.filter(k => (notifications as Record<string, boolean>)[k]).length
          const categoryTotal = categoryKeys.length

          return (
            <div key={category.title} className="rounded-xl border border-muted/50 bg-muted/20 overflow-hidden">
              {/* Category header — collapsible */}
              <button
                type="button"
                onClick={() => toggleCategory(category.title)}
                className="w-full flex items-center justify-between gap-3 p-3 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center shadow-sm">
                    {category.icon}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{category.title}</p>
                      <span className="text-[10px] text-muted-foreground tabular-nums">
                        {categoryEnabled}/{categoryTotal}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-tight">
                      {category.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {/* Mini progress indicator */}
                  <div className="hidden sm:flex items-center gap-1">
                    {category.items.map((item) => (
                      <div
                        key={item.key}
                        className={cn(
                          'h-1.5 w-1.5 rounded-full transition-colors',
                          (notifications as Record<string, boolean>)[item.key]
                            ? 'bg-emerald-500'
                            : 'bg-muted-foreground/20',
                        )}
                      />
                    ))}
                  </div>
                  {isExpanded
                    ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    : <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  }
                </div>
              </button>

              {/* Expandable items */}
              {isExpanded && (
                <div className="border-t border-muted/30 px-3 pb-3 pt-1 space-y-1">
                  {category.items.map((item) => (
                    <div key={item.key} className="flex items-center justify-between py-2 px-1">
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                      <Switch
                        checked={(notifications as Record<string, boolean>)[item.key] || false}
                        onCheckedChange={(checked) => handleNotificationChange(item.key, checked)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
