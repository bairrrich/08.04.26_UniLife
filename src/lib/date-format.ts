import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

/**
 * Формат дня для badge в ModuleHeader
 * Пример: "8 апреля, среда"
 */
export function formatDayBadge(date: Date): string {
  return format(date, 'd MMMM, EEEE', { locale: ru })
}

/**
 * Формат месяца для badge в ModuleHeader
 * Пример: "Апрель 2026"
 */
export function formatMonthBadge(date: Date): string {
  const month = format(date, 'LLLL', { locale: ru })
  const year = date.getFullYear()
  // Capitalize first letter
  return month.charAt(0).toUpperCase() + month.slice(1) + ' ' + year
}
