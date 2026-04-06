import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AppModule = 'dashboard' | 'diary' | 'finance' | 'nutrition' | 'workout' | 'collections' | 'feed' | 'habits' | 'goals' | 'analytics' | 'settings'

interface AppState {
  activeModule: AppModule
  sidebarOpen: boolean
  notificationCount: number
  notificationsOpen: boolean
  pendingDialog: boolean
  searchOpen: boolean
  _hydrated: boolean
  setActiveModule: (module: AppModule) => void
  setSidebarOpen: (open: boolean) => void
  setNotificationCount: (count: number) => void
  setNotificationsOpen: (open: boolean) => void
  setPendingDialog: (open: boolean) => void
  setSearchOpen: (open: boolean) => void
  toggleSidebar: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activeModule: 'dashboard',
      sidebarOpen: true,
      notificationCount: 0,
      notificationsOpen: false,
      pendingDialog: false,
      searchOpen: false,
      _hydrated: false,
      setActiveModule: (module) => set({ activeModule: module }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setNotificationCount: (count) => set({ notificationCount: count }),
      setNotificationsOpen: (open) => set({ notificationsOpen: open }),
      setPendingDialog: (open) => set({ pendingDialog: open }),
      setSearchOpen: (open) => set({ searchOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    }),
    {
      name: 'unilife-app-store',
      partialize: (state) => ({ activeModule: state.activeModule }),
      onRehydrateStorage: () => (state) => {
        // Mark store as hydrated after localStorage is read
        if (state) state._hydrated = true
      },
    },
  ),
)

// Selector to check hydration without subscribing to other state
export const useHydrated = () => useAppStore((s) => s._hydrated)
