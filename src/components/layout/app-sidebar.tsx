'use client'

import { Bell, LucideIcon, icons, Menu } from 'lucide-react'
import { NotificationsPanel } from '@/components/notifications/notifications-panel'
import { cn } from '@/lib/utils'
import { useAppStore, type AppModule } from '@/store/use-app-store'
import { navItems } from '@/lib/nav-items'
import { useModuleCounts } from '@/lib/module-counts'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from './theme-toggle'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { SearchTrigger } from './search-dialog'
import { SearchDialog } from './search-dialog'
import { KeyboardShortcutsDialog } from './keyboard-shortcuts-dialog'
import { motion } from 'framer-motion'
import { memo, useCallback } from 'react'
import { useUserPrefs } from '@/lib/use-user-prefs'

// ─── Notification Bell Trigger ─────────────────────────────────────────────

function NotificationBellTrigger({ onClick }: { onClick: () => void }) {
  const notificationCount = useAppStore((s) => s.notificationCount)
  return (
    <button
      onClick={onClick}
      className="relative flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      aria-label="Уведомления"
    >
      <Bell className={cn('h-4 w-4', notificationCount > 0 && 'bell-pulse')} />
      {notificationCount > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground animate-count-fade-in">
          {notificationCount > 9 ? '9+' : notificationCount}
        </span>
      )}
    </button>
  )
}

// ─── Module-specific accent colors for the active dot indicator ───────
const MODULE_ACCENT_COLORS: Record<string, string> = {
  dashboard: 'bg-emerald-500',
  diary: 'bg-amber-500',
  finance: 'bg-blue-500',
  nutrition: 'bg-orange-500',
  workout: 'bg-red-500',
  collections: 'bg-violet-500',
  feed: 'bg-pink-500',
  habits: 'bg-cyan-500',
  goals: 'bg-indigo-500',
  analytics: 'bg-teal-500',
  settings: 'bg-zinc-500',
}

function getIcon(iconName: string): LucideIcon {
  return icons[iconName as keyof typeof icons] || icons.Circle
}

// Modules that should NOT show activity badges
const NO_BADGE_MODULES: Set<AppModule> = new Set([
  'dashboard',
  'analytics',
  'settings',
])

function NavBadge({ count, isActive }: { count: number; isActive: boolean }) {
  if (count <= 0) return null

  const display = count > 99 ? '99+' : String(count)

  return (
    <span
      className={cn(
        'ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5',
        'text-[10px] font-bold leading-none tabular-nums',
        'animate-count-fade-in',
        isActive
          ? 'bg-primary-foreground/20 text-primary-foreground'
          : 'bg-primary text-primary-foreground'
      )}
    >
      {display}
    </span>
  )
}

const MemoizedNavBadge = memo(NavBadge)

function MobileNotificationBell({ onNotificationsOpen }: { onNotificationsOpen: () => void }) {
  return (
    <div className="flex items-center justify-center h-9 w-9">
      <NotificationBellTrigger onClick={onNotificationsOpen} />
    </div>
  )
}

const MemoizedSidebarContent = memo(function SidebarContent({ onNavigate, onNotificationsOpen }: { onNavigate?: () => void; onNotificationsOpen?: () => void }) {
  const activeModule = useAppStore((s) => s.activeModule)
  const setActiveModule = useAppStore((s) => s.setActiveModule)
  const moduleCounts = useModuleCounts()
  const { userName, userAvatar } = useUserPrefs()

  const handleNavClick = (id: AppModule) => {
    setActiveModule(id)
    onNavigate?.()
  }

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5">
        <div className="relative flex h-9 w-9 items-center justify-center">
          {/* Decorative gradient behind the "U" */}
          <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-emerald-400/60 to-primary/40 blur-sm" />
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-lg font-bold">U</span>
          </div>
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight">UniLife</h1>
          <p className="text-[10px] tracking-wide uppercase text-muted-foreground">
            Вся жизнь в одном месте
          </p>
        </div>
      </div>

      {/* Search Trigger */}
      <div className="px-3 pb-2">
        <SearchTrigger className="w-full justify-start" />
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
        {navItems.map((item) => {
          const Icon = getIcon(item.icon)
          const isActive = activeModule === item.id

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={cn(
                'relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 nav-hover-shine',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:scale-[1.02] active:scale-[0.98]'
              )}
            >
              {/* Animated active indicator */}
              {isActive && (
                <motion.div
                  layoutId="active-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-accent-foreground/80"
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 30,
                  }}
                />
              )}
              <Icon className="h-4.5 w-4.5 shrink-0" />
              <span className="flex items-center gap-1.5">{item.label}</span>
              {/* Active module colored dot indicator */}
              {isActive && (
                <span
                  className={cn(
                    'h-[5px] w-[5px] rounded-full shrink-0',
                    MODULE_ACCENT_COLORS[item.id] || 'bg-primary'
                  )}
                />
              )}
              {!NO_BADGE_MODULES.has(item.id) && (
                <MemoizedNavBadge
                  count={moduleCounts[item.id] || 0}
                  isActive={isActive}
                />
              )}
            </button>
          )
        })}
      </nav>

      <Separator />

      {/* User Profile */}
      <div className="p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
          <div className="relative">
            {userName !== 'Пользователь' ? (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-sm shadow-sm">
                {userAvatar}
              </div>
            ) : (
              <Avatar className="h-8 w-8">
                <AvatarImage src="/unilife-logo.png" alt="Avatar" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            )}
            {/* Online indicator dot */}
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center">
              <span className="h-2.5 w-2.5 rounded-full border-2 border-sidebar bg-emerald-500" />
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{userName}</p>
            <p className="text-[10px] text-emerald-500 font-medium truncate">
              В сети
            </p>
          </div>
          <div className="flex items-center gap-1">
            <NotificationBellTrigger onClick={onNotificationsOpen ?? (() => {})} />
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Version Footer */}
      <div className="mt-auto px-4 pb-4 pt-1">
        <p className="text-[10px] text-muted-foreground/60">
          UniLife v1.0
        </p>
        <p className="text-[10px] text-muted-foreground/40">
          © 2026
        </p>
      </div>
    </div>
  )
})

export function AppSidebar() {
  const setSearchOpen = useAppStore((s) => s.setSearchOpen)
  const notificationsOpen = useAppStore((s) => s.notificationsOpen)
  const setNotificationsOpen = useAppStore((s) => s.setNotificationsOpen)

  const handleNotificationsOpen = useCallback(() => setNotificationsOpen(true), [setNotificationsOpen])

  return (
    <>
      {/* Global Search Dialog */}
      <SearchDialog />

      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcutsDialog />

      {/* Real Notifications Panel (Sheet) */}
      <NotificationsPanel open={notificationsOpen} onOpenChange={setNotificationsOpen} />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-60 md:flex-col md:border-r bg-sidebar border-sidebar-border fixed inset-y-0 left-0 z-30">
        <MemoizedSidebarContent onNotificationsOpen={handleNotificationsOpen} />
      </aside>

      {/* Mobile Header + Sheet */}
      <header className="md:hidden sticky top-0 z-40 flex items-center gap-3 border-b border-b-transparent bg-background/80 backdrop-blur-xl shadow-sm px-4 py-3 mobile-header-gradient-line">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <MemoizedSidebarContent onNotificationsOpen={handleNotificationsOpen} />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <div className="relative flex h-7 w-7 items-center justify-center">
            <div className="absolute inset-0 rounded-md bg-gradient-to-br from-emerald-400/60 to-primary/40 blur-[2px]" />
            <div className="relative flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-bold">
              U
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm leading-none">UniLife</span>
            <span className="text-[9px] tracking-wide uppercase text-muted-foreground leading-none mt-0.5">
              Вся жизнь в одном месте
            </span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1">
          {/* Mobile notification bell */}
          <MobileNotificationBell onNotificationsOpen={handleNotificationsOpen} />
          {/* Mobile search icon trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center justify-center h-9 w-9 rounded-lg hover:bg-accent transition-colors"
          >
            <icons.Search className="h-4.5 w-4.5 text-muted-foreground" />
          </button>
          <ThemeToggle />
        </div>
      </header>
    </>
  )
}
