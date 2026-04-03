'use client'

import { useAppStore } from '@/store/use-app-store'
import { AppSidebar } from '@/components/layout/app-sidebar'
import DashboardPage from '@/components/dashboard/dashboard-page'
import DiaryPage from '@/components/diary/diary-page'
import FinancePage from '@/components/finance/finance-page'
import NutritionPage from '@/components/nutrition/nutrition-page'
import { WorkoutPage } from '@/components/workout/workout-page'
import { CollectionsPage } from '@/components/collections/collections-page'
import { FeedPage } from '@/components/feed/feed-page'
import { HabitsPage } from '@/components/habits/habit-page'
import { AnalyticsPage } from '@/components/analytics/analytics-page'
import { SettingsPage } from '@/components/layout/settings-page'
import { WelcomeScreen } from '@/components/onboarding/welcome-screen'
import { AnimatePresence, motion } from 'framer-motion'

export default function Home() {
  const { activeModule } = useAppStore()

  return (
    <div className="min-h-screen bg-background">
      <WelcomeScreen />
      <AppSidebar />
      <main className="md:ml-60 min-h-screen flex flex-col">
        <div className="flex-1 p-4 pt-16 md:p-6 md:pt-6 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModule}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {activeModule === 'dashboard' && <DashboardPage />}
              {activeModule === 'diary' && <DiaryPage />}
              {activeModule === 'finance' && <FinancePage />}
              {activeModule === 'nutrition' && <NutritionPage />}
              {activeModule === 'workout' && <WorkoutPage />}
              {activeModule === 'collections' && <CollectionsPage />}
              {activeModule === 'feed' && <FeedPage />}
              {activeModule === 'habits' && <HabitsPage />}
              {activeModule === 'analytics' && <AnalyticsPage />}
              {activeModule === 'settings' && <SettingsPage />}
            </motion.div>
          </AnimatePresence>
        </div>
        <footer className="mt-auto border-t bg-muted/30">
          {/* Desktop: Three-column footer */}
          <div className="hidden md:grid md:grid-cols-3 gap-6 p-6 pt-5">
            {/* Column 1: Logo + Tagline */}
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <span className="text-sm font-bold">U</span>
                </div>
                <span className="font-bold text-sm">UniLife</span>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                Вся жизнь в одном месте. Отслеживайте дневник, финансы, питание и тренировки.
              </p>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Быстрые ссылки</h3>
              <ul className="space-y-1">
                {['Дневник', 'Финансы', 'Питание', 'Тренировки'].map((link) => (
                  <li key={link}>
                    <span className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-default">
                      {link}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Version */}
            <div className="text-right">
              <p className="text-xs text-muted-foreground">
                UniLife v1.0
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                Сделано с 💚
              </p>
            </div>
          </div>

          {/* Copyright bar */}
          <div className="border-t px-6 py-2.5 text-center">
            <p className="text-[11px] text-muted-foreground/70">
              © 2026 UniLife · Все права защищены
            </p>
          </div>

          {/* Mobile: Simple centered footer */}
          <div className="md:hidden px-4 py-3 text-center">
            <p className="text-[11px] text-muted-foreground/70">
              Сделано с 💚 · © 2026 UniLife · Все права защищены
            </p>
          </div>
        </footer>
      </main>
    </div>
  )
}
