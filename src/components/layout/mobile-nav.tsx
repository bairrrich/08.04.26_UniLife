'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useAppStore, type AppModule } from '@/store/use-app-store'
import { getFeedLastSeen, setFeedLastSeen } from '@/lib/module-counts'
import {
  BookOpen,
  Wallet,
  Dumbbell,
  Target,
  MoreHorizontal,
  LayoutDashboard,
  Apple,
  Library,
  Rss,
  Crosshair,
  BarChart3,
  Settings,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'

interface NavItemConfig {
  id: AppModule
  label: string
  icon: React.ElementType
}

const MAIN_NAV_ITEMS: NavItemConfig[] = [
  { id: 'dashboard', label: 'Главная', icon: LayoutDashboard },
  { id: 'diary', label: 'Дневник', icon: BookOpen },
  { id: 'finance', label: 'Финансы', icon: Wallet },
  { id: 'workout', label: 'Спорт', icon: Dumbbell },
  { id: 'habits', label: 'Привычки', icon: Target },
]

const MODULE_NAV_ITEMS: NavItemConfig[] = [
  { id: 'nutrition', label: 'Питание', icon: Apple },
  { id: 'collections', label: 'Коллекции', icon: Library },
  { id: 'feed', label: 'Лента', icon: Rss },
  { id: 'goals', label: 'Цели', icon: Crosshair },
  { id: 'analytics', label: 'Аналитика', icon: BarChart3 },
  { id: 'settings', label: 'Настройки', icon: Settings },
]

function NavItem({
  item,
  isActive,
  onClick,
  badge,
}: {
  item: NavItemConfig
  isActive: boolean
  onClick: () => void
  badge?: number
}) {
  const Icon = item.icon

  return (
    <button
      onClick={onClick}
      className={cn(
        'active-press relative flex flex-col items-center justify-center gap-0.5 flex-1 min-w-0 py-1 transition-colors duration-200',
        isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
      )}
    >
      {/* Animated active indicator pill */}
      {isActive && (
        <motion.div
          layoutId="mobile-nav-active"
          className="absolute inset-x-2 -top-px h-1 rounded-full bg-primary"
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        />
      )}
      <div className="relative">
        <Icon className={cn('h-5 w-5 shrink-0 transition-transform duration-200', isActive && 'scale-110')} />
        {badge !== undefined && badge > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </div>
      <span className={cn(
        'text-[10px] leading-tight truncate w-full text-center',
        isActive ? 'font-semibold' : 'font-medium'
      )}>
        {item.label}
      </span>
    </button>
  )
}

function isMoreSheetActive(activeModule: AppModule): boolean {
  return !MAIN_NAV_ITEMS.some((item) => item.id === activeModule)
}

function MoreSheet({
  activeModule,
  onNavigate,
  hasNewFeedPosts,
}: {
  activeModule: AppModule
  onNavigate: (id: AppModule) => void
  hasNewFeedPosts: boolean
}) {
  const [open, setOpen] = useState(false)

  const handleNavigate = (id: AppModule) => {
    onNavigate(id)
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className={cn(
          'active-press relative flex flex-col items-center justify-center gap-0.5 flex-1 min-w-0 py-1 transition-colors duration-200',
          isMoreSheetActive(activeModule) ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
        )}>
          <div className="relative">
            <MoreHorizontal className="h-5 w-5 shrink-0" />
            {hasNewFeedPosts && !isMoreSheetActive(activeModule) && (
              <span className="pulse-ring absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500" />
            )}
          </div>
          <span className="text-[10px] leading-tight font-medium truncate w-full text-center">
            Ещё
          </span>
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[70vh] p-0">
        {/* Gradient Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500/10 via-primary/5 to-amber-500/10 px-6 pt-6 pb-4">
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl" />
          <div className="pointer-events-none absolute -left-8 -bottom-8 h-24 w-24 rounded-full bg-amber-400/10 blur-2xl" />
          <SheetHeader className="relative text-left pb-0">
            <SheetTitle className="text-lg font-bold">Все модули</SheetTitle>
            <SheetDescription className="text-sm text-muted-foreground">
              Выберите раздел для перехода
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="overflow-y-auto max-h-[55vh] px-4 pb-4">
          {/* Modules Section */}
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold mb-2.5 mt-1 px-1">
            Модули
          </p>
          <div className="grid grid-cols-3 gap-2.5">
            {MODULE_NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = activeModule === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={cn(
                    'active-press glass-card flex flex-col items-center justify-center gap-2.5 rounded-xl p-4 transition-all duration-200',
                    isActive
                      ? 'bg-primary/10 text-primary ring-1 ring-primary/20'
                      : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                  )}
                >
                  <div className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-lg transition-colors',
                    isActive ? 'bg-primary/15' : 'bg-muted'
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium truncate w-full text-center">
                    {item.label}
                  </span>
                </button>
              )
            })}
          </div>

          <Separator className="my-3" />

          {/* Quick Access Section */}
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold mb-2.5 px-1">
            Быстрый доступ
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {MAIN_NAV_ITEMS.slice(0, 5).map((item) => {
              const Icon = item.icon
              const isActive = activeModule === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={cn(
                    'active-press flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-all duration-200',
                    isActive
                      ? 'bg-primary/10 text-primary ring-1 ring-primary/20'
                      : 'text-muted-foreground/60 hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="text-[11px] font-medium">
                    {item.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function MobileNav() {
  const activeModule = useAppStore((s) => s.activeModule)
  const setActiveModule = useAppStore((s) => s.setActiveModule)

  // ── Check for new feed posts since last seen ──
  const [hasNewFeedPosts, setHasNewFeedPosts] = useState(false)

  // ── Fetch uncompleted habits count for notification badge ──
  const [uncompletedHabitsCount, setUncompletedHabitsCount] = useState<number>(0)

  useEffect(() => {
    async function fetchHabitsCount() {
      try {
        const res = await fetch('/api/habits')
        if (!res.ok) return
        const json = await res.json()
        if (json.success && Array.isArray(json.data)) {
          const uncompleted = json.data.filter((h: { todayCompleted: boolean }) => !h.todayCompleted).length
          setUncompletedHabitsCount(uncompleted)
        }
      } catch {
        // Silently fail — badge just won't show
      }
    }
    fetchHabitsCount()
  }, [activeModule])

  const habitsBadge = uncompletedHabitsCount

  // ── Clear feed last-seen when user visits feed ──
  useEffect(() => {
    if (activeModule === 'feed') {
      setFeedLastSeen()
    }
  }, [activeModule])

  useEffect(() => {
    async function checkFeedUpdates() {
      try {
        const lastSeen = getFeedLastSeen()
        if (!lastSeen) {
          // Never seen feed, show dot
          setHasNewFeedPosts(true)
          return
        }

        const res = await fetch('/api/feed?limit=1')
        if (!res.ok) return
        const json = await res.json()
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const latestTimestamp = new Date(json.data[0].createdAt).getTime()
          setHasNewFeedPosts(latestTimestamp > lastSeen)
        }
      } catch {
        // Silently fail — dot just won't show
      }
    }
    checkFeedUpdates()
  }, [activeModule])

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-t-transparent bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="relative">
        <div className="absolute top-0 left-0 right-0 h-[2px] overflow-hidden">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        </div>
        <div className="flex items-stretch h-16">
        {MAIN_NAV_ITEMS.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            isActive={activeModule === item.id}
            onClick={() => setActiveModule(item.id)}
            badge={item.id === 'habits' ? habitsBadge : undefined}
          />
        ))}
        <MoreSheet activeModule={activeModule} onNavigate={setActiveModule} hasNewFeedPosts={hasNewFeedPosts} />
        </div>
      </div>
      {/* Safe area inset for iPhone notch / home indicator */}
      <div className="pb-[env(safe-area-inset-bottom)]" />
    </nav>
  )
}
