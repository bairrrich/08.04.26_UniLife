export interface WidgetSectionConfig {
  id: string
  title: string
  icon: string // emoji
  defaultCollapsed: boolean
  defaultVisible: boolean
  defaultOrder: number
}

export const DEFAULT_SECTIONS: WidgetSectionConfig[] = [
  { id: 'overview', title: 'Обзор', icon: '📊', defaultCollapsed: false, defaultVisible: true, defaultOrder: 0 },
  { id: 'today', title: 'Сегодня', icon: '☀️', defaultCollapsed: false, defaultVisible: true, defaultOrder: 1 },
  { id: 'quick-access', title: 'Быстрый доступ', icon: '⚡', defaultCollapsed: false, defaultVisible: true, defaultOrder: 2 },
  { id: 'weekly', title: 'Аналитика недели', icon: '📈', defaultCollapsed: false, defaultVisible: true, defaultOrder: 3 },
  { id: 'health', title: 'Привычки и здоровье', icon: '💪', defaultCollapsed: false, defaultVisible: true, defaultOrder: 4 },
  { id: 'charts', title: 'Графики', icon: '📉', defaultCollapsed: true, defaultVisible: true, defaultOrder: 5 },
  { id: 'finances', title: 'Финансы', icon: '💰', defaultCollapsed: true, defaultVisible: true, defaultOrder: 6 },
  { id: 'inspiration', title: 'Вдохновение', icon: '✨', defaultCollapsed: true, defaultVisible: true, defaultOrder: 7 },
  { id: 'tools', title: 'Инструменты', icon: '🛠️', defaultCollapsed: true, defaultVisible: true, defaultOrder: 8 },
  { id: 'activity', title: 'Активность и цели', icon: '🎯', defaultCollapsed: true, defaultVisible: true, defaultOrder: 9 },
]

const STORAGE_KEY = 'unilife-widget-config'

export interface SavedWidgetConfig {
  visible: Record<string, boolean>
  order: string[]
}

export function loadWidgetConfig(): SavedWidgetConfig {
  if (typeof window === 'undefined') {
    return {
      visible: Object.fromEntries(DEFAULT_SECTIONS.map(s => [s.id, s.defaultVisible])),
      order: DEFAULT_SECTIONS.filter(s => s.defaultVisible).map(s => s.id),
    }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return {
        visible: Object.fromEntries(DEFAULT_SECTIONS.map(s => [s.id, s.defaultVisible])),
        order: DEFAULT_SECTIONS.filter(s => s.defaultVisible).map(s => s.id),
      }
    }
    return JSON.parse(raw)
  } catch {
    return {
      visible: Object.fromEntries(DEFAULT_SECTIONS.map(s => [s.id, s.defaultVisible])),
      order: DEFAULT_SECTIONS.filter(s => s.defaultVisible).map(s => s.id),
    }
  }
}

export function saveWidgetConfig(config: SavedWidgetConfig) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  } catch {
    // ignore storage errors
  }
}

export function resetWidgetConfig(): SavedWidgetConfig {
  const config: SavedWidgetConfig = {
    visible: Object.fromEntries(DEFAULT_SECTIONS.map(s => [s.id, s.defaultVisible])),
    order: DEFAULT_SECTIONS.filter(s => s.defaultVisible).map(s => s.id),
  }
  saveWidgetConfig(config)
  return config
}
