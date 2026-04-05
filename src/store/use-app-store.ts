import { create } from 'zustand'

export type AppModule = 'dashboard' | 'diary' | 'finance' | 'nutrition' | 'workout' | 'collections' | 'feed' | 'habits' | 'goals' | 'analytics' | 'settings'

interface AppState {
  activeModule: AppModule
  sidebarOpen: boolean
  notificationCount: number
  notificationsOpen: boolean
  pendingDialog: boolean
  setActiveModule: (module: AppModule) => void
  setSidebarOpen: (open: boolean) => void
  setNotificationCount: (count: number) => void
  setNotificationsOpen: (open: boolean) => void
  setPendingDialog: (open: boolean) => void
  toggleSidebar: () => void
}

export const useAppStore = create<AppState>((set) => ({
  activeModule: 'dashboard',
  sidebarOpen: true,
  notificationCount: 0,
  notificationsOpen: false,
  pendingDialog: false,
  setActiveModule: (module) => set({ activeModule: module }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setNotificationCount: (count) => set({ notificationCount: count }),
  setNotificationsOpen: (open) => set({ notificationsOpen: open }),
  setPendingDialog: (open) => set({ pendingDialog: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}))
