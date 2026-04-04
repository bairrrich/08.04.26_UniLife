import { create } from 'zustand'

export type AppModule = 'dashboard' | 'diary' | 'finance' | 'nutrition' | 'workout' | 'collections' | 'feed' | 'habits' | 'goals' | 'analytics' | 'settings'

interface AppState {
  activeModule: AppModule
  sidebarOpen: boolean
  notificationCount: number
  pendingDialog: boolean
  setActiveModule: (module: AppModule) => void
  setSidebarOpen: (open: boolean) => void
  setNotificationCount: (count: number) => void
  setPendingDialog: (open: boolean) => void
  toggleSidebar: () => void
}

export const useAppStore = create<AppState>((set) => ({
  activeModule: 'dashboard',
  sidebarOpen: true,
  notificationCount: 0,
  pendingDialog: false,
  setActiveModule: (module) => set({ activeModule: module }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setNotificationCount: (count) => set({ notificationCount: count }),
  setPendingDialog: (open) => set({ pendingDialog: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}))
