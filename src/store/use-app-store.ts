import { create } from 'zustand'

export type AppModule = 'dashboard' | 'diary' | 'finance' | 'nutrition' | 'workout' | 'collections' | 'feed' | 'habits' | 'settings'

interface AppState {
  activeModule: AppModule
  sidebarOpen: boolean
  setActiveModule: (module: AppModule) => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
}

export const useAppStore = create<AppState>((set) => ({
  activeModule: 'dashboard',
  sidebarOpen: true,
  setActiveModule: (module) => set({ activeModule: module }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}))
