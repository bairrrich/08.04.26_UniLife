'use client'

import { LucideIcon, icons } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore, type AppModule } from '@/store/use-app-store'
import { navItems } from '@/lib/nav-items'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from './theme-toggle'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { SearchTrigger } from './search-dialog'
import { SearchDialog } from './search-dialog'
import { Menu } from 'lucide-react'
import { useState } from 'react'

function getIcon(iconName: string): LucideIcon {
  return icons[iconName as keyof typeof icons] || icons.Circle
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { activeModule, setActiveModule } = useAppStore()

  const handleNavClick = (id: AppModule) => {
    setActiveModule(id)
    onNavigate?.()
  }

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <span className="text-lg font-bold">U</span>
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight">UniLife</h1>
          <p className="text-[11px] text-muted-foreground">Трекер жизни</p>
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
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      <Separator />

      {/* Footer */}
      <div className="p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/unilife-logo.png" alt="Avatar" />
            <AvatarFallback>А</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Алексей</p>
            <p className="text-[11px] text-muted-foreground truncate">demo@unilife.app</p>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
}

export function AppSidebar() {
  return (
    <>
      {/* Global Search Dialog */}
      <SearchDialog />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-60 md:flex-col md:border-r bg-sidebar border-sidebar-border fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Header + Sheet */}
      <header className="md:hidden sticky top-0 z-40 flex items-center gap-3 border-b bg-background/95 backdrop-blur-sm px-4 py-3">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-60 p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-bold">
            U
          </div>
          <span className="font-semibold text-sm">UniLife</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {/* Mobile search icon trigger */}
          <button
            onClick={() => {
              document.dispatchEvent(
                new KeyboardEvent('keydown', {
                  key: 'k',
                  metaKey: true,
                  ctrlKey: true,
                  bubbles: true,
                })
              )
            }}
            className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-accent transition-colors"
          >
            <icons.Search className="h-4 w-4 text-muted-foreground" />
          </button>
          <ThemeToggle />
        </div>
      </header>
    </>
  )
}
