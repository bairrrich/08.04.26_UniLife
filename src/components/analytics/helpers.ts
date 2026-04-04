import { WORKOUT_TYPE_MAP } from './constants'

export function classifyWorkout(name: string): string {
  const lower = name.toLowerCase()
  for (const [key, type] of Object.entries(WORKOUT_TYPE_MAP)) {
    if (lower.includes(key.toLowerCase())) return type
  }
  return 'Другое'
}

export function getMonthStr(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}
