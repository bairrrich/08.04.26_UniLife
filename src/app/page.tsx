'use client'

import { useAppStore } from '@/store/use-app-store'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { MobileNav } from '@/components/layout/mobile-nav'
import { WelcomeScreen } from '@/components/onboarding/welcome-screen'
import { AnimatePresence, motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'
import { Component, type ReactNode, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Plus, Dumbbell, Receipt, Sparkles, BookOpen, Activity, Target } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fetchModuleCounts } from '@/lib/module-counts'

// ─── Error Boundary with retry for ChunkLoadError ─────────────────────
interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ModuleErrorBoundary extends Component<
  { children: ReactNode; moduleName: string },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode; moduleName: string }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      const isChunkError =
        this.state.error?.message?.includes('ChunkLoadError') ||
        this.state.error?.message?.includes('Failed to load chunk') ||
        this.state.error?.message?.includes('Loading chunk')

      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">
            {isChunkError ? 'Модуль загружается' : 'Что-то пошло не так'}
          </h3>
          <p className="mb-6 max-w-sm text-sm text-muted-foreground">
            {isChunkError
              ? `Не удалось загрузить модуль «${this.props.moduleName}». Turbopack компилирует чанк — попробуйте ещё раз.`
              : this.state.error?.message || 'Неизвестная ошибка'}
          </p>
          <Button onClick={this.handleRetry} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Попробовать снова
          </Button>
        </div>
      )
    }
    return this.props.children
  }
}

// ─── Lazy-loaded module pages ──────────────────────────────────────────
// Using next/dynamic creates separate chunk boundaries so Turbopack
// only compiles the active module instead of all 11 at once.

const Dashboard = dynamic(() => import('@/components/dashboard/dashboard-page'), {
  loading: () => <PageSkeleton />,
})
const Diary = dynamic(() => import('@/components/diary/diary-page'), {
  loading: () => <PageSkeleton />,
})
const Finance = dynamic(() => import('@/components/finance/finance-page'), {
  loading: () => <PageSkeleton />,
})
const Nutrition = dynamic(() => import('@/components/nutrition/nutrition-page'), {
  loading: () => <PageSkeleton />,
})
const Workout = dynamic(() => import('@/components/workout/workout-page'), {
  loading: () => <PageSkeleton />,
})
const Collections = dynamic(() => import('@/components/collections/collections-page'), {
  loading: () => <PageSkeleton />,
})
const Feed = dynamic(() => import('@/components/feed/feed-page'), {
  loading: () => <PageSkeleton />,
})
const Habits = dynamic(() => import('@/components/habits/habit-page'), {
  loading: () => <PageSkeleton />,
})
const Goals = dynamic(() => import('@/components/goals/goals-page'), {
  loading: () => <PageSkeleton />,
})
const Analytics = dynamic(() => import('@/components/analytics/analytics-page'), {
  loading: () => <PageSkeleton />,
})
const Settings = dynamic(() => import('@/components/layout/settings-page'), {
  loading: () => <PageSkeleton />,
})

// ─── Module map for fast lookup ───────────────────────────────────────
const MODULES: Record<string, { component: React.LazyExoticComponent<Record<string, never>>; label: string }> = {
  dashboard: { component: Dashboard, label: 'Дашборд' },
  diary: { component: Diary, label: 'Дневник' },
  finance: { component: Finance, label: 'Финансы' },
  nutrition: { component: Nutrition, label: 'Питание' },
  workout: { component: Workout, label: 'Тренировки' },
  collections: { component: Collections, label: 'Коллекции' },
  feed: { component: Feed, label: 'Лента' },
  habits: { component: Habits, label: 'Привычки' },
  goals: { component: Goals, label: 'Цели' },
  analytics: { component: Analytics, label: 'Аналитика' },
  settings: { component: Settings, label: 'Настройки' },
}

// ─── Skeleton for lazy loading ─────────────────────────────────────────
function PageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[130px] rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-[300px] rounded-xl" />
      <Skeleton className="h-[200px] rounded-xl" />
    </div>
  )
}

// ─── Footer ──────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { label: 'Добавить запись', module: 'diary' as const, icon: Plus, color: 'text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20' },
  { label: 'Новая тренировка', module: 'workout' as const, icon: Dumbbell, color: 'text-blue-500 bg-blue-500/10 hover:bg-blue-500/20' },
  { label: 'Записать расход', module: 'finance' as const, icon: Receipt, color: 'text-amber-500 bg-amber-500/10 hover:bg-amber-500/20' },
  { label: 'Новая привычка', module: 'habits' as const, icon: Sparkles, color: 'text-violet-500 bg-violet-500/10 hover:bg-violet-500/20' },
]

const FOOTER_LINKS = [
  { label: 'Дневник', module: 'diary' as const },
  { label: 'Финансы', module: 'finance' as const },
  { label: 'Питание', module: 'nutrition' as const },
  { label: 'Тренировки', module: 'workout' as const },
  { label: 'Привычки', module: 'habits' as const },
  { label: 'Коллекции', module: 'collections' as const },
]

function Footer() {
  const { setActiveModule } = useAppStore()
  const [stats, setStats] = useState<Record<string, number>>({})

  useEffect(() => {
    fetchModuleCounts().then((counts) => {
      setStats(counts)
    })
  }, [])

  return (
    <footer className="mt-auto border-t bg-muted/30 hidden md:block">
      <div className="grid grid-cols-4 divide-x divide-border">
        {/* Brand column */}
        <div className="px-6 py-5">
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

        {/* Quick actions column */}
        <div className="px-6 py-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
            Быстрые действия
          </h3>
          <ul className="space-y-1">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon
              return (
                <li key={action.label}>
                  <button
                    onClick={() => setActiveModule(action.module)}
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors duration-200 group cursor-pointer"
                  >
                    <Icon className={cn('h-3.5 w-3.5 shrink-0 rounded transition-colors', action.color)} />
                    <span className="group-hover:translate-x-0.5 transition-transform duration-200">{action.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Modules + Stats column */}
        <div className="px-6 py-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
            Модули
          </h3>
          <ul className="space-y-1">
            {FOOTER_LINKS.map((link) => (
              <li key={link.label}>
                <button
                  onClick={() => setActiveModule(link.module)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-200 cursor-pointer hover:translate-x-0.5 inline-block transition-transform"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Stats column */}
        <div className="px-6 py-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
            Статистика
          </h3>
          <ul className="space-y-1.5">
            <li className="flex items-center gap-2 text-xs text-muted-foreground">
              <BookOpen className="h-3 w-3 text-emerald-500" />
              <span>{stats.diary ?? '—'} записей в дневнике</span>
            </li>
            <li className="flex items-center gap-2 text-xs text-muted-foreground">
              <Activity className="h-3 w-3 text-blue-500" />
              <span>{stats.workout ?? '—'} тренировок</span>
            </li>
            <li className="flex items-center gap-2 text-xs text-muted-foreground">
              <Target className="h-3 w-3 text-violet-500" />
              <span>{stats.habits ?? '—'} привычек</span>
            </li>
            <li className="flex items-center gap-2 text-xs text-muted-foreground">
              <Receipt className="h-3 w-3 text-amber-500" />
              <span>{stats.finance ?? '—'} транзакций</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t px-6 py-2.5 flex items-center justify-center gap-1.5">
        <div className="flex h-4 w-4 items-center justify-center rounded bg-primary text-primary-foreground">
          <span className="text-[9px] font-bold leading-none">U</span>
        </div>
        <p className="text-[11px] text-muted-foreground/70">
          © 2026 UniLife · Все права защищены
        </p>
      </div>
    </footer>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────
export default function Home() {
  const { activeModule } = useAppStore()
  const mod = MODULES[activeModule] || MODULES.dashboard
  const PageComponent = mod.component

  return (
    <div className="min-h-screen bg-background">
      <WelcomeScreen />
      <AppSidebar />
      <main className="md:ml-60 min-h-screen flex flex-col">
        <div className="flex-1 p-4 pt-16 pb-24 md:p-6 md:pt-6 md:pb-6 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModule}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              <ModuleErrorBoundary moduleName={mod.label}>
                <PageComponent />
              </ModuleErrorBoundary>
            </motion.div>
          </AnimatePresence>
        </div>
        <Footer />
        <MobileNav />
      </main>
    </div>
  )
}
