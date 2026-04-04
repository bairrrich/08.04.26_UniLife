'use client'

import { ProfileSection } from './settings/profile-section'
import { NotificationsSection } from './settings/notifications-section'
import { ThemeSection } from './settings/theme-section'
import { DataManagementSection } from './settings/data-management-section'
import { AboutSection } from './settings/about-section'

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header with decorative gradient blobs */}
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-10 -left-10 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -top-4 right-20 h-24 w-24 rounded-full bg-gradient-to-br from-amber-400/15 to-orange-500/15 blur-3xl" />
        <div className="relative">
          <h2 className="text-2xl font-bold tracking-tight">Настройки</h2>
          <p className="text-muted-foreground">Управление профилем и параметрами приложения</p>
        </div>
      </div>

      <ProfileSection />
      <NotificationsSection />
      <ThemeSection />
      <DataManagementSection />
      <AboutSection />
    </div>
  )
}
