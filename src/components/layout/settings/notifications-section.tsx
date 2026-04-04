'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Bell } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { NOTIFICATIONS_CONFIG, type NotificationsState } from './types'

export function NotificationsSection() {
  const [notifications, setNotifications] = useState<NotificationsState>({
    diaryReminder: true,
    waterReminder: true,
    budgetWarning: true,
    workoutReminder: false,
  })

  const handleNotificationChange = (key: string, checked: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: checked }))
    toast.info(checked ? 'Уведомление включено' : 'Уведомление отключено')
  }

  return (
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Уведомления
        </CardTitle>
        <CardDescription>Настройка оповещений и напоминаний</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {NOTIFICATIONS_CONFIG.map((item) => (
          <div key={item.key} className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
            <Switch
              checked={notifications[item.key as keyof NotificationsState]}
              onCheckedChange={(checked) => handleNotificationChange(item.key, checked)}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
