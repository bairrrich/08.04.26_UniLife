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
  { id: 'daily-challenge', title: 'Ежедневный вызов', icon: '📝', defaultCollapsed: false, defaultVisible: true, defaultOrder: 1 },
  { id: 'weekly-challenge', title: 'Вызов недели', icon: '🔥', defaultCollapsed: false, defaultVisible: true, defaultOrder: 2 },
  { id: 'today', title: 'Сегодня', icon: '☀️', defaultCollapsed: false, defaultVisible: true, defaultOrder: 3 },
  { id: 'quick-access', title: 'Быстрый доступ', icon: '⚡', defaultCollapsed: false, defaultVisible: true, defaultOrder: 4 },
  { id: 'weekly', title: 'Аналитика недели', icon: '📈', defaultCollapsed: false, defaultVisible: true, defaultOrder: 5 },
  { id: 'health', title: 'Привычки и здоровье', icon: '💪', defaultCollapsed: false, defaultVisible: true, defaultOrder: 6 },
  { id: 'charts', title: 'Графики', icon: '📉', defaultCollapsed: true, defaultVisible: true, defaultOrder: 7 },
  { id: 'finances', title: 'Финансы', icon: '💰', defaultCollapsed: true, defaultVisible: true, defaultOrder: 8 },
  { id: 'inspiration', title: 'Вдохновение', icon: '✨', defaultCollapsed: true, defaultVisible: true, defaultOrder: 9 },
  { id: 'tools', title: 'Инструменты', icon: '🛠️', defaultCollapsed: true, defaultVisible: true, defaultOrder: 10 },
  { id: 'activity', title: 'Активность и цели', icon: '🎯', defaultCollapsed: true, defaultVisible: true, defaultOrder: 11 },
  { id: 'mood-recommendations', title: 'Рекомендации по настроению', icon: '💭', defaultCollapsed: true, defaultVisible: true, defaultOrder: 12 },
  { id: 'data-stats', title: 'Ваша активность', icon: '📊', defaultCollapsed: true, defaultVisible: true, defaultOrder: 13 },
  { id: 'tips-carousel', title: 'Советы дня', icon: '💡', defaultCollapsed: true, defaultVisible: true, defaultOrder: 14 },
  { id: 'mood-heatmap', title: 'Карта настроения', icon: '🗓️', defaultCollapsed: true, defaultVisible: true, defaultOrder: 15 },
  { id: 'achievement-badges', title: 'Достижения', icon: '🏆', defaultCollapsed: true, defaultVisible: true, defaultOrder: 16 },
  { id: 'productivity-score', title: 'Продуктивность дня', icon: '⚡', defaultCollapsed: false, defaultVisible: true, defaultOrder: 17 },
  { id: 'gratitude', title: 'Дневник благодарности', icon: '🙏', defaultCollapsed: false, defaultVisible: true, defaultOrder: 18 },
  { id: 'all-streaks', title: 'Все серии', icon: '🔥', defaultCollapsed: false, defaultVisible: true, defaultOrder: 19 },
  { id: 'analytics-quick', title: 'Быстрая аналитика', icon: '📊', defaultCollapsed: true, defaultVisible: true, defaultOrder: 20 },
]

const STORAGE_KEY = 'unilife-widget-config'

export interface SavedWidgetConfig {
  visible: Record<string, boolean>
  order: string[]
}

function buildDefaultConfig(): SavedWidgetConfig {
  return {
    visible: Object.fromEntries(DEFAULT_SECTIONS.map(s => [s.id, s.defaultVisible])),
    order: DEFAULT_SECTIONS.filter(s => s.defaultVisible).map(s => s.id),
  }
}

export function loadWidgetConfig(): SavedWidgetConfig {
  if (typeof window === 'undefined') {
    return buildDefaultConfig()
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return buildDefaultConfig()
    }
    const saved: SavedWidgetConfig = JSON.parse(raw)
    // Merge with defaults to include any newly added sections
    const defaults = buildDefaultConfig()
    const merged: SavedWidgetConfig = {
      visible: { ...defaults.visible },
      order: [...defaults.order],
    }
    // Restore saved visibility (keep new defaults for missing keys)
    for (const [id, vis] of Object.entries(saved.visible)) {
      merged.visible[id] = vis
    }
    // Rebuild order: start with saved order for sections that still exist,
    // then append any new sections that weren't in the saved order
    const savedSet = new Set(saved.order)
    const validSavedOrder = saved.order.filter(id => id in defaults.visible)
    const newSections = defaults.order.filter(id => !savedSet.has(id))
    merged.order = [...validSavedOrder, ...newSections]
    // Move hidden sections (visible=false) to end of order
    merged.order.sort((a, b) => {
      const aVis = merged.visible[a] ?? true
      const bVis = merged.visible[b] ?? true
      if (aVis !== bVis) return aVis ? -1 : 1
      const aIdx = validSavedOrder.indexOf(a)
      const bIdx = validSavedOrder.indexOf(b)
      return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx)
    })
    return merged
  } catch {
    return buildDefaultConfig()
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
  const config = buildDefaultConfig()
  saveWidgetConfig(config)
  return config
}
