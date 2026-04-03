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
import { SettingsPage } from '@/components/layout/settings-page'
import { AnimatePresence, motion } from 'framer-motion'

export default function Home() {
  const { activeModule } = useAppStore()

  return (
    <div className="min-h-screen bg-background">
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
              {activeModule === 'settings' && <SettingsPage />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
