'use client'

import { Keyboard, Settings } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { PageHeader } from '@/components/layout/page-header'
import { ProfileSection } from './settings/profile-section'
import { NotificationsSection } from './settings/notifications-section'
import { ThemeSection } from './settings/theme-section'
import { AppearanceSection } from './settings/appearance-section'
import { DataStatsSection } from './settings/data-stats-section'
import { DataManagementSection } from './settings/data-management-section'
import { AboutSection } from './settings/about-section'

const NAVIGATION_SHORTCUTS = [
  { key: 'D', action: 'Дашборд' },
  { key: 'F', action: 'Финансы' },
  { key: 'N', action: 'Питание' },
  { key: 'W', action: 'Тренировки' },
  { key: 'H', action: 'Привычки' },
  { key: 'G', action: 'Цели' },
]

const ACTION_SHORTCUTS = [
  { key: '⌘K', action: 'Поиск' },
  { key: '⌘,', action: 'Следующий модуль' },
  { key: 'Esc', action: 'Закрыть диалог' },
]

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-md border border-border bg-muted/50 text-xs font-mono font-medium text-foreground shadow-sm">
      {children}
    </kbd>
  )
}

function ShortcutsGroup({
  title,
  shortcuts,
}: {
  title: string
  shortcuts: { key: string; action: string }[]
}) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        {title}
      </h4>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        {shortcuts.map((s) => (
          <div key={s.key} className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">{s.action}</span>
            <Kbd>{s.key}</Kbd>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <PageHeader
        icon={Settings}
        title="Настройки"
        description="Управление профилем и параметрами приложения"
        accent="zinc"
        noBlobs
      />

      <ProfileSection />
      <NotificationsSection />
      <ThemeSection />
      <AppearanceSection />

      {/* Keyboard Shortcuts Section */}
      <Card className="rounded-xl overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400">
              <Keyboard className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base">Горячие клавиши</CardTitle>
              <CardDescription>Быстрая навигация и действия</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <ShortcutsGroup title="Навигация" shortcuts={NAVIGATION_SHORTCUTS} />
          <Separator />
          <ShortcutsGroup title="Действия" shortcuts={ACTION_SHORTCUTS} />
          <div className="rounded-lg bg-muted/30 p-3 text-center">
            <p className="text-xs text-muted-foreground">
              Подсказка: на мобильных устройствах используйте жесты или меню навигации
            </p>
          </div>
        </CardContent>
      </Card>

      <DataStatsSection />
      <DataManagementSection />
      <AboutSection />
    </div>
  )
}
