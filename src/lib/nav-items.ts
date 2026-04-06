import type { AppModule } from '@/store/use-app-store'

export interface NavItem {
  id: AppModule
  label: string
  icon: string
  description: string
}

export const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Дашборд', icon: 'LayoutDashboard', description: 'Обзор всей жизни' },
  { id: 'diary', label: 'Дневник', icon: 'BookOpen', description: 'Мысли и события' },
  { id: 'finance', label: 'Финансы', icon: 'Wallet', description: 'Доходы и расходы' },
  { id: 'nutrition', label: 'Питание', icon: 'Apple', description: 'КБЖУ и вода' },
  { id: 'workout', label: 'Тренировки', icon: 'Dumbbell', description: 'Журнал упражнений' },
  { id: 'collections', label: 'Коллекции', icon: 'Library', description: 'Книги, фильмы, рецепты' },
  { id: 'feed', label: 'Лента', icon: 'Rss', description: 'Социальная лента' },
  { id: 'habits' as AppModule, label: 'Привычки', icon: 'Target', description: 'Трекер ежедневных привычек' },
  { id: 'goals' as AppModule, label: 'Цели', icon: 'Crosshair', description: 'Трекер целей и достижений' },
  { id: 'analytics' as AppModule, label: 'Аналитика', icon: 'BarChart3', description: 'Статистика и тренды' },
  { id: 'settings', label: 'Настройки', icon: 'Settings', description: 'Профиль и параметры' },
]
