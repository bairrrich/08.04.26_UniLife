import { format, parseISO } from 'date-fns'
import { countWords as sharedCountWords, readingTimeMinutes as sharedReadingTimeMinutes } from '@/lib/format'

// Re-export shared utilities for convenience
export { sharedCountWords as countWords, sharedReadingTimeMinutes as readingTimeMinutes }

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay()
  // Convert Sunday=0 to Monday-based: Mon=0, Tue=1, ..., Sun=6
  return day === 0 ? 6 : day - 1
}

export function formatDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function parseEntryDate(dateStr: string): Date {
  return parseISO(dateStr)
}
