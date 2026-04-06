'use client'

import { useState, useEffect, useRef, Component, type ReactNode } from 'react'
import { useAppStore, type AppModule } from '@/store/use-app-store'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

// ─── Error Boundary ─────────────────────────────────────────────────────
interface EBState { hasError: boolean; error: Error | null }
class ErrorBoundary extends Component<{ children: ReactNode; name: string }, EBState> {
  state: EBState = { hasError: false, error: null }
  static getDerivedStateFromError(e: Error) { return { hasError: true, error: e } }
  retry = () => this.setState({ hasError: false, error: null })
  render() {
    if (!this.state.hasError) return this.props.children
    const msg = this.state.error?.message || ''
    const isChunk = msg.includes('ChunkLoadError') || msg.includes('Failed to load') || msg.includes('Loading chunk')
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">{isChunk ? 'Модуль загружается' : 'Ошибка'}</h3>
        <p className="mb-6 max-w-sm text-sm text-muted-foreground">
          {isChunk ? `«${this.props.name}» компилируется — подождите или нажмите кнопку.` : msg}
        </p>
        <Button onClick={this.retry} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" /> Повторить
        </Button>
      </div>
    )
  }
}

// ─── Static shell (zero dynamic deps — compiles in ~1s) ───────────────
function Shell() {
  return (
    <div className="min-h-screen bg-background">
      <aside className="hidden md:flex md:w-60 md:flex-col md:border-r bg-sidebar fixed inset-y-0 left-0 z-30 animate-pulse">
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-2 w-28" />
            </div>
          </div>
        </div>
        <div className="px-3 space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      </aside>
      <main className="md:ml-60 min-h-screen flex flex-col">
        <div className="p-4 pt-16 pb-24 md:p-6 md:pt-6 md:pb-10 max-w-7xl mx-auto w-full space-y-6 animate-pulse">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[130px] rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-[300px] rounded-xl" />
          <Skeleton className="h-[200px] rounded-xl" />
        </div>
      </main>
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
    </div>
  )
}

// ─── Module loader map (static — no re-creation on render) ─────────────
const MODULE_MAP: Record<string, { l: () => Promise<{ default: React.ComponentType }>; n: string }> = {
  dashboard: { l: () => import('@/components/dashboard/dashboard-page'), n: 'Дашборд' },
  diary: { l: () => import('@/components/diary/diary-page'), n: 'Дневник' },
  finance: { l: () => import('@/components/finance/finance-page'), n: 'Финансы' },
  nutrition: { l: () => import('@/components/nutrition/nutrition-page'), n: 'Питание' },
  workout: { l: () => import('@/components/workout/workout-page'), n: 'Тренировки' },
  collections: { l: () => import('@/components/collections/collections-page'), n: 'Коллекции' },
  feed: { l: () => import('@/components/feed/feed-page'), n: 'Лента' },
  habits: { l: () => import('@/components/habits/habit-page'), n: 'Привычки' },
  goals: { l: () => import('@/components/goals/goals-page'), n: 'Цели' },
  analytics: { l: () => import('@/components/analytics/analytics-page'), n: 'Аналитика' },
  settings: { l: () => import('@/components/layout/settings-page'), n: 'Настройки' },
}

// ─── Main Page ─────────────────────────────────────────────────────────
export default function Home() {
  const activeModule = useAppStore((s) => s.activeModule)

  const [ModuleComp, setModuleComp] = useState<React.ComponentType | null>(null)
  const [Sidebar, setSidebar] = useState<React.ComponentType | null>(null)
  const [MobileNav, setMobileNav] = useState<React.ComponentType | null>(null)
  const [Footer, setFooter] = useState<React.ComponentType | null>(null)
  const [QuickAdd, setQuickAdd] = useState<React.ComponentType | null>(null)
  const [ScrollTop, setScrollTop] = useState<React.ComponentType | null>(null)
  const [Notif, setNotif] = useState<React.ComponentType | null>(null)
  const [Welcome, setWelcome] = useState<React.ComponentType | null>(null)
  const [moduleLabel, setModuleLabel] = useState('Дашборд')

  // Ref to avoid re-triggering module load for the same module
  const loadedModuleRef = useRef<string | null>(null)

  // Rehydrate Zustand persist ONCE on mount (before any other effect)
  useEffect(() => {
    useAppStore.persist.rehydrate()
  }, [])

  // Load global components ONCE on mount
  useEffect(() => {
    Promise.all([
      import('@/components/layout/app-sidebar'),
      import('@/components/layout/mobile-nav'),
      import('@/components/layout/app-footer'),
      import('@/components/dashboard/quick-add-menu'),
      import('@/components/layout/scroll-to-top'),
      import('@/components/layout/notification-toast'),
      import('@/components/onboarding/welcome-screen'),
    ]).then(([sb, mn, ft, qa, st, nt, wc]) => {
      setSidebar(() => sb.AppSidebar)
      setMobileNav(() => mn.MobileNav)
      setFooter(() => ft.default)
      setQuickAdd(() => qa.default)
      setScrollTop(() => st.ScrollToTop)
      setNotif(() => nt.NotificationToaster)
      setWelcome(() => wc.WelcomeScreen)
    })
  }, [])

  // Load active module — ONLY if it actually changed (avoid flash)
  useEffect(() => {
    const m = MODULE_MAP[activeModule] || MODULE_MAP.dashboard
    setModuleLabel(m.n)

    // Skip if already loaded the same module
    if (loadedModuleRef.current === activeModule) return
    loadedModuleRef.current = activeModule

    m.l().then((mod) => setModuleComp(() => mod.default))
  }, [activeModule])

  const isLoading = !ModuleComp || !Sidebar || !MobileNav || !Footer

  return (
    <div className="min-h-screen bg-background">
      {Welcome && <Welcome />}
      {Sidebar && <Sidebar />}
      <main className="main-content md:ml-60 min-h-screen flex flex-col">
        <div className="p-4 pt-16 pb-24 md:p-6 md:pt-6 md:pb-10 max-w-7xl mx-auto w-full">
          {isLoading ? (
            <Shell />
          ) : (
            <ErrorBoundary name={moduleLabel}>
              <ModuleComp />
            </ErrorBoundary>
          )}
        </div>
        {Footer && <Footer />}
        {ScrollTop && <ScrollTop />}
        {MobileNav && <MobileNav />}
        {QuickAdd && <QuickAdd />}
        {Notif && <Notif />}
      </main>
    </div>
  )
}
