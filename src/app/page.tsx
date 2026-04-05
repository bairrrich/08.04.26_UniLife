'use client'

import { useState, useEffect, Component, type ReactNode } from 'react'
import { useAppStore } from '@/store/use-app-store'
import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

// ─── Dynamic imports for heavy components ──────────────────────────────
const AppSidebar = dynamic(
  () => import('@/components/layout/app-sidebar').then(m => ({ default: m.AppSidebar })),
  { loading: () => <SidebarSkeleton />, ssr: false }
)
const MobileNav = dynamic(
  () => import('@/components/layout/mobile-nav').then(m => ({ default: m.MobileNav })),
  { loading: () => <MobileNavSkeleton />, ssr: false }
)
const ScrollToTop = dynamic(
  () => import('@/components/layout/scroll-to-top').then(m => ({ default: m.ScrollToTop })),
  { ssr: false }
)
const WelcomeScreen = dynamic(
  () => import('@/components/onboarding/welcome-screen').then(m => ({ default: m.WelcomeScreen })),
  { ssr: false }
)
const AppFooter = dynamic(
  () => import('@/components/layout/app-footer'),
  { loading: () => <FooterSkeleton /> }
)
// Global Quick Add Menu — accessible from every module page
const QuickAddMenu = dynamic(
  () => import('@/components/dashboard/quick-add-menu'),
  { ssr: false }
)
// Global Notification Toast — fires on dashboard load
const NotificationToaster = dynamic(
  () => import('@/components/layout/notification-toast').then(m => ({ default: m.NotificationToaster })),
  { ssr: false }
)

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

// ─── Skeleton components for dynamic imports ──────────────────────────
function SidebarSkeleton() {
  return (
    <aside className="hidden md:flex md:w-60 md:flex-col md:border-r bg-sidebar fixed inset-y-0 left-0 z-30 animate-pulse">
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-2 w-28" />
          </div>
        </div>
        <Skeleton className="h-9 w-full rounded-lg" />
      </div>
      <div className="px-3 space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-lg" />
        ))}
      </div>
    </aside>
  )
}

function MobileNavSkeleton() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background h-16">
      <div className="flex items-stretch h-16">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex-1 flex flex-col items-center justify-center gap-0.5 py-1">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-2 w-8 rounded" />
          </div>
        ))}
      </div>
    </nav>
  )
}

function FooterSkeleton() {
  return (
    <footer className="mt-auto border-t bg-muted/30 hidden md:block">
      <div className="h-0.5 w-full bg-muted" />
      <div className="px-6 py-12">
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-16" />
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} className="h-2.5 w-24" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </footer>
  )
}

// ─── CSS-only animated module switcher ─────────────────────────────────
function AnimatedModule({ activeModule }: { activeModule: string }) {
  const [visible, setVisible] = useState(true)
  const [currentModule, setCurrentModule] = useState(activeModule)

  useEffect(() => {
    if (activeModule !== currentModule) {
      const fadeTimer = setTimeout(() => setVisible(false), 0)
      const swapTimer = setTimeout(() => {
        setCurrentModule(activeModule)
        setVisible(true)
      }, 200)
      return () => {
        clearTimeout(fadeTimer)
        clearTimeout(swapTimer)
      }
    }
  }, [activeModule, currentModule])

  const mod = MODULES[currentModule] || MODULES.dashboard
  const PageComponent = mod.component

  return (
    <div
      className={`transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        visible
          ? 'opacity-100 translate-y-0 scale-100 blur-0'
          : 'opacity-0 -translate-y-2 scale-[0.99] blur-sm'
      }`}
    >
      <ModuleErrorBoundary moduleName={mod.label}>
        <PageComponent />
      </ModuleErrorBoundary>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────
export default function Home() {
  const activeModule = useAppStore((s) => s.activeModule)

  return (
    <div className="min-h-screen bg-background">
      <WelcomeScreen />
      <AppSidebar />
      <main className="main-content md:ml-60 min-h-screen flex flex-col">
        <div className="p-4 pt-16 pb-24 md:p-6 md:pt-6 md:pb-10 max-w-7xl mx-auto w-full">
          <AnimatedModule activeModule={activeModule} />
        </div>
        <AppFooter />
        <ScrollToTop />
        <MobileNav />
        <QuickAddMenu />
        <NotificationToaster />
      </main>
    </div>
  )
}
