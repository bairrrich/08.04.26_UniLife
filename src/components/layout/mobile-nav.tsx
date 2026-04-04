'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useAppStore, type AppModule } from '@/store/use-app-store'
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
  { id: 'diary', label: 'Дневник', icon: BookOpen },
  { id: 'finance', label: 'Финансы', icon: Wallet },
  { id: 'workout', label: 'Тренировки', icon: Dumbbell },
  { id: 'habits', label: 'Привычки', icon: Target },
]

const MORE_NAV_ITEMS: NavItemConfig[] = [
  { id: 'dashboard', label: 'Дашборд', icon: LayoutDashboard },
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
}: {
  item: NavItemConfig
  isActive: boolean
  onClick: () => void
}) {
  const Icon = item.icon

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex flex-col items-center justify-center gap-0.5 flex-1 min-w-0 py-1 transition-colors duration-200',
        isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
      )}
    >
      <Icon className={cn('h-5 w-5 shrink-0 transition-transform duration-200', isActive && 'scale-110')} />
      <span className={cn(
        'text-[10px] leading-tight truncate w-full text-center',
        isActive ? 'font-semibold' : 'font-medium'
      )}>
        {item.label}
      </span>
      {isActive && (
        <span className="absolute -top-px left-1/2 -translate-x-1/2 h-0.5 w-5 rounded-full bg-primary" />
      )}
    </button>
  )
}

function MoreSheet({
  activeModule,
  onNavigate,
}: {
  activeModule: AppModule
  onNavigate: (id: AppModule) => void
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
          'relative flex flex-col items-center justify-center gap-0.5 flex-1 min-w-0 py-1 transition-colors duration-200',
          activeModule === 'more' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
        )}>
          <MoreHorizontal className="h-5 w-5 shrink-0" />
          <span className="text-[10px] leading-tight font-medium truncate w-full text-center">
            Ещё
          </span>
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[70vh]">
        <SheetHeader className="pb-2">
          <SheetTitle className="text-center">Все модули</SheetTitle>
          <SheetDescription className="text-center">
            Выберите раздел для перехода
          </SheetDescription>
        </SheetHeader>
        <div className="overflow-y-auto max-h-[55vh] px-4 pb-4">
          <div className="grid grid-cols-3 gap-2 pt-2">
            {MORE_NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = activeModule === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={cn(
                    'flex flex-col items-center justify-center gap-2 rounded-xl p-4 transition-all duration-200',
                    isActive
                      ? 'bg-primary/10 text-primary ring-1 ring-primary/20'
                      : 'hover:bg-accent text-muted-foreground hover:text-foreground active:scale-95'
                  )}
                >
                  <div className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
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
          {/* Also show main nav items for reference */}
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium mb-2 px-1">
            На главной панели
          </p>
          <div className="grid grid-cols-4 gap-1.5">
            {MAIN_NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = activeModule === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1.5 rounded-lg p-2.5 transition-all duration-200',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground/60 hover:text-foreground active:scale-95'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-[10px] font-medium truncate w-full text-center">
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
  const { activeModule, setActiveModule } = useAppStore()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-stretch h-16">
        {MAIN_NAV_ITEMS.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            isActive={activeModule === item.id}
            onClick={() => setActiveModule(item.id)}
          />
        ))}
        <MoreSheet activeModule={activeModule} onNavigate={setActiveModule} />
      </div>
      {/* Safe area inset for iPhone notch */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  )
}
